"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionDetailModal } from "../components/question-detail-modal";
import { QUESTIONS, type DiagnosticQuestion } from "../questions";
import { calculateCohortAnalytics } from "../../lib/diagnostic-analytics";

type Submission = {
  id: string;
  studentName: string;
  studentNumber: string;
  answers: Record<string, string>;
  completedAt: number;
};

type SchoolClass = {
  code: string;
  name: string;
  createdAt: number;
  academicYear?: number;
  grade?: number;
  classNumber?: number;
  submissions: Submission[];
};

type SchoolDashboard = { code: string; name: string; createdAt: number; classes: SchoolClass[] };
type CreatedSchool = { code: string; name: string; adminToken: string };
type CreatedClass = { code: string; name: string; teacherToken: string };

export default function SchoolPage() {
  const [schoolName, setSchoolName] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState<SchoolDashboard | null>(null);
  const [selectedClassCode, setSelectedClassCode] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<DiagnosticQuestion | null>(null);
  const [createdClasses, setCreatedClasses] = useState<CreatedClass[]>([]);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [grade, setGrade] = useState(1);
  const [classCount, setClassCount] = useState(12);
  const [linkCode, setLinkCode] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const [linkClassNumber, setLinkClassNumber] = useState(1);
  const [renameValue, setRenameValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const schoolCode = params.get("school")?.toUpperCase() ?? "";
    const adminKey = params.get("key") ?? "";
    if (schoolCode && adminKey) {
      void loadDashboard(schoolCode, adminKey);
    }
    // URL 자격 증명은 최초 진입 때만 읽습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSchool(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: schoolName }),
      });
      if (!response.ok) throw new Error("학교 그룹을 만들지 못했습니다.");
      const created = await response.json() as CreatedSchool;
      setCode(created.code);
      setToken(created.adminToken);
      await loadDashboard(created.code, created.adminToken);
      window.history.replaceState(null, "", `/school?school=${created.code}&key=${created.adminToken}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학교 그룹을 만들지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(schoolCode = code, adminKey = token) {
    if (!schoolCode.trim() || !adminKey.trim()) return setError("학교 코드와 관리 키를 입력해 주세요.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/schools/${encodeURIComponent(schoolCode.trim().toUpperCase())}?token=${encodeURIComponent(adminKey.trim())}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 403 ? "학교 관리 키가 올바르지 않습니다." : "학교 대시보드를 불러오지 못했습니다.");
      const data = await response.json() as SchoolDashboard;
      setCode(schoolCode.trim().toUpperCase());
      setToken(adminKey.trim());
      setDashboard(data);
      setRenameValue(data.name);
      setSelectedClassCode((current) => current && data.classes.some((item) => item.code === current) ? current : data.classes[0]?.code ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학교 대시보드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function bulkCreate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/schools/${dashboard?.code}/classes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, academicYear, grade, classCount }),
      });
      if (!response.ok) throw new Error("학급을 일괄 생성하지 못했습니다.");
      const data = await response.json() as { classes: CreatedClass[] };
      setCreatedClasses(data.classes);
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학급을 일괄 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function linkExistingClass(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/schools/${dashboard?.code}/classes`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, classCode: linkCode, classToken: linkToken, academicYear, grade, classNumber: linkClassNumber }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "기존 학급을 연결하지 못했습니다.");
      }
      setLinkCode("");
      setLinkToken("");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "기존 학급을 연결하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function renameSchool(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/schools/${dashboard?.code}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, name: renameValue }),
    });
    if (!response.ok) return setError("학교 이름을 변경하지 못했습니다.");
    await loadDashboard();
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  const analytics = useMemo(() => {
    if (!dashboard) return null;
    const submissions = dashboard.classes.flatMap((item) => item.submissions);
    const overall = calculateCohortAnalytics(submissions, dashboard.classes.length);
    const classes = dashboard.classes.map((item) => ({
      ...item,
      scientificRate: calculateCohortAnalytics(item.submissions, 1).scientificRate,
    }));
    return { overall, classes };
  }, [dashboard]);

  const selectedClass = dashboard?.classes.find((item) => item.code === selectedClassCode) ?? null;
  const selectedRows = useMemo(() => {
    if (!selectedClass) return [];
    return QUESTIONS.map((question) => {
      const counts = Object.fromEntries(question.options.map((option) => [option.id, 0])) as Record<string, number>;
      selectedClass.submissions.forEach((submission) => {
        const answer = submission.answers[question.id];
        if (answer in counts) counts[answer] += 1;
      });
      return { question, counts };
    });
  }, [selectedClass]);

  if (dashboard && analytics) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return (
      <main className="teacher-shell school-shell">
        <header className="dashboard-topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>PRE:SCIENCE</span></Link><div><span className="live-dot" />학교 대표 교사</div></header>
        <section className="dashboard-heading">
          <div><p className="eyebrow">SCHOOL OVERVIEW</p><h1>{dashboard.name}</h1><p>학교 소속 학급을 만들고 상세 응답과 전체 흐름을 관리합니다.</p></div>
          <div className="dashboard-actions"><button onClick={() => void copy("admin", `${origin}/school?school=${dashboard.code}&key=${token}`)}>{copied === "admin" ? "복사됨 ✓" : "대표 교사 링크 복사"}</button><button onClick={() => void loadDashboard()}>새로고침 ↻</button></div>
        </section>
        <section className="stat-grid school-stats">
          <article><span>소속 학급</span><b>{dashboard.classes.length}</b><small>개</small></article>
          <article><span>전체 제출</span><b>{analytics.overall.submissionCount}</b><small>명</small></article>
          <article><span>학교 과학적 개념 응답</span><b>{analytics.overall.scientificRate}</b><small>%</small></article>
          <article><span>학교 코드</span><strong>{dashboard.code}</strong><small>관리용</small></article>
        </section>

        <section className="school-management-grid">
          <form className="panel school-form" onSubmit={bulkCreate}><div className="panel-title"><div><span>일괄 개설</span><h2>학급 한꺼번에 만들기</h2></div></div><div className="compact-fields"><label>학년도<input type="number" value={academicYear} onChange={(event) => setAcademicYear(Number(event.target.value))} /></label><label>학년<input type="number" min="1" max="3" value={grade} onChange={(event) => setGrade(Number(event.target.value))} /></label><label>반 개수<input type="number" min="1" max="30" value={classCount} onChange={(event) => setClassCount(Number(event.target.value))} /></label></div><button className="primary-action" disabled={loading}>학급 {classCount}개 생성</button></form>
          <form className="panel school-form" onSubmit={linkExistingClass}><div className="panel-title"><div><span>기존 학급</span><h2>학교 그룹에 연결</h2></div></div><div className="compact-fields link-fields"><label>학급 코드<input value={linkCode} onChange={(event) => setLinkCode(event.target.value.toUpperCase())} /></label><label>학급 교사용 키<input type="password" value={linkToken} onChange={(event) => setLinkToken(event.target.value)} /></label><label>반<input type="number" min="1" max="30" value={linkClassNumber} onChange={(event) => setLinkClassNumber(Number(event.target.value))} /></label></div><button className="primary-action" disabled={loading}>기존 학급 연결</button></form>
          <form className="panel school-form rename-school" onSubmit={renameSchool}><div><span>학교 이름</span><input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></div><button>이름 변경</button></form>
        </section>
        {error && <p className="school-error">{error}</p>}

        {createdClasses.length > 0 && <section className="panel generated-classes"><div className="panel-title"><div><span>한 번만 표시됩니다</span><h2>새 학급 코드와 교사용 키</h2></div><button type="button" onClick={() => void copy("generated", createdClasses.map((item) => `${item.name}\t${item.code}\t${item.teacherToken}`).join("\n"))}>{copied === "generated" ? "복사됨 ✓" : "전체 복사"}</button></div><div className="credential-table">{createdClasses.map((item) => <div key={item.code}><b>{item.name}</b><code>{item.code}</code><code>{item.teacherToken}</code></div>)}</div></section>}

        <section className="panel school-class-panel"><div className="panel-title"><div><span>학급 현황</span><h2>소속 학급</h2></div><small>학급을 선택하면 상세 응답을 볼 수 있습니다.</small></div><div className="school-class-list">{analytics.classes.map((item) => <button key={item.code} className={selectedClassCode === item.code ? "active" : ""} onClick={() => setSelectedClassCode(item.code)}><span>{item.academicYear} · {item.grade}학년 {item.classNumber}반</span><b>{item.name}</b><em>{item.submissions.length}명 · {item.scientificRate}%</em><code>{item.code}</code></button>)}</div></section>

        {selectedClass && <section className="school-detail">
          <div className="panel-title"><div><span>학급 상세 응답</span><h2>{selectedClass.name}</h2></div><small>{selectedClass.submissions.length}명 제출</small></div>
          <div className="dashboard-grid school-detail-grid">
            <section className="panel roster-panel"><div className="panel-title"><div><span>학생별</span><h2>제출 학생</h2></div></div><div className="roster-list">{selectedClass.submissions.length ? selectedClass.submissions.map((submission) => <div key={submission.id}><span>{submission.studentNumber}</span><b>{submission.studentName}</b><time>{new Date(submission.completedAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div>) : <p className="muted-copy">아직 제출된 응답이 없습니다.</p>}</div></section>
            <section className="panel response-panel"><div className="panel-title"><div><span>문항별 상세</span><h2>선택지 반응 분포</h2></div><small>문항을 누르면 선택지와 해설을 볼 수 있습니다.</small></div><div className="item-analysis">{selectedRows.map(({ question, counts }, index) => <article key={question.id}><button className="item-copy question-open" type="button" onClick={() => setSelectedQuestion(question)}><span>{index + 1}</span><div><small>{question.standard} · {question.domain}</small><h3>{question.prompt}</h3><em>선택지·해설 보기 →</em></div></button><div className="distribution">{question.options.map((option, optionIndex) => { const count = counts[option.id]; const percent = selectedClass.submissions.length ? Math.round((count / selectedClass.submissions.length) * 100) : 0; return <div key={option.id} className={option.kind === "scientific" ? "scientific" : ""}><span>{String.fromCharCode(65 + optionIndex)}</span><div><i style={{ width: `${percent}%` }} /></div><b>{count}명</b><small>{option.conception}</small></div>; })}</div></article>)}</div></section>
          </div>
        </section>}
        <QuestionDetailModal question={selectedQuestion} onClose={() => setSelectedQuestion(null)} />
      </main>
    );
  }

  return (
    <main className="app-shell teacher-entry-shell">
      <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>PRE:SCIENCE</span></Link><div className="topbar-links"><Link className="teacher-link" href="/teacher">학급 교사</Link><Link className="teacher-link" href="/">학생용</Link></div></header>
      <section className="teacher-entry school-entry"><div className="teacher-intro"><p className="eyebrow">SCHOOL STUDIO</p><h1>한 학교의 학급을<br /><em>한곳에서</em> 관리합니다.</h1><p>대표 교사가 학교 그룹을 만들고 여러 학급을 한꺼번에 개설할 수 있습니다. 학교 전체와 각 반의 상세 응답을 함께 살펴보세요.</p><div className="feature-stack"><span><b>01</b>학급 일괄 생성</span><span><b>02</b>학교 전체 평균</span><span><b>03</b>반별 상세 응답</span></div></div><div className="teacher-cards"><form className="entry-card" onSubmit={createSchool}><span className="card-step">NEW SCHOOL</span><h2>학교 그룹 만들기</h2><label><span>학교 이름</span><input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} placeholder="예: 한빛고등학교" maxLength={50} /></label><button className="primary-action" disabled={loading}>{loading ? "만드는 중…" : "학교 그룹 만들기 →"}</button></form><form className="existing-class school-login" onSubmit={(event) => { event.preventDefault(); void loadDashboard(); }}><h3>기존 학교 열기</h3><div><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="학교 코드" /><input value={token} onChange={(event) => setToken(event.target.value)} placeholder="학교 관리 키" type="password" /><button disabled={loading}>열기</button></div></form>{error && <p className="form-error">{error}</p>}</div></section>
    </main>
  );
}
