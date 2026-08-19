"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "../questions";

type Submission = {
  id: string;
  studentName: string;
  studentNumber: string;
  answers: Record<string, string>;
  completedAt: number;
};

type DashboardData = { code: string; name: string; createdAt: number; submissions: Submission[] };
type CreatedClass = { code: string; name: string; teacherToken: string };

export default function TeacherPage() {
  const [className, setClassName] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [created, setCreated] = useState<CreatedClass | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("class")?.toUpperCase() ?? "";
    const urlToken = params.get("key") ?? "";
    if (urlCode && urlToken) {
      setCode(urlCode);
      setToken(urlToken);
      void loadDashboard(urlCode, urlToken);
    }
  }, []);

  async function createClass(event: FormEvent) {
    event.preventDefault();
    if (className.trim().length < 2) return setError("학급 이름을 두 글자 이상 입력해 주세요.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: className }),
      });
      if (!response.ok) throw new Error("학급을 만들지 못했습니다.");
      const data = (await response.json()) as CreatedClass;
      setCreated(data);
      setCode(data.code);
      setToken(data.teacherToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학급을 만들지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(classCode = code, teacherToken = token) {
    if (!classCode.trim() || !teacherToken.trim()) return setError("학급 코드와 교사용 키를 입력해 주세요.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(classCode.trim().toUpperCase())}/submissions?token=${encodeURIComponent(teacherToken.trim())}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 403 ? "교사용 키가 올바르지 않습니다." : "학급 응답을 불러오지 못했습니다.");
      setDashboard((await response.json()) as DashboardData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학급 응답을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const studentUrl = created ? `${origin}/?class=${created.code}` : "";
  const teacherUrl = created ? `${origin}/teacher?class=${created.code}&key=${created.teacherToken}` : "";

  const analytics = useMemo(() => {
    if (!dashboard) return null;
    const itemRows = QUESTIONS.map((question) => {
      const counts = Object.fromEntries(question.options.map((option) => [option.id, 0])) as Record<string, number>;
      dashboard.submissions.forEach((submission) => {
        const answer = submission.answers[question.id];
        if (answer in counts) counts[answer] += 1;
      });
      const scientific = question.options.find((option) => option.kind === "scientific")?.id;
      const misconceptionCount = dashboard.submissions.length - (scientific ? counts[scientific] : 0);
      return { question, counts, misconceptionCount };
    });
    const conceptionCounts = new Map<string, { count: number; standard: string }>();
    itemRows.forEach(({ question }) => dashboard.submissions.forEach((submission) => {
      const option = question.options.find((item) => item.id === submission.answers[question.id]);
      if (option && option.kind !== "scientific") {
        const current = conceptionCounts.get(option.conception) ?? { count: 0, standard: question.standard };
        conceptionCounts.set(option.conception, { ...current, count: current.count + 1 });
      }
    }));
    const topConceptions = [...conceptionCounts.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.count - a.count).slice(0, 5);
    const totalAnswers = dashboard.submissions.length * QUESTIONS.length;
    const scientificAnswers = itemRows.reduce((sum, row) => sum + dashboard.submissions.length - row.misconceptionCount, 0);
    return { itemRows, topConceptions, scientificRate: totalAnswers ? Math.round((scientificAnswers / totalAnswers) * 100) : 0 };
  }, [dashboard]);

  if (dashboard && analytics) {
    return (
      <main className="teacher-shell">
        <header className="dashboard-topbar">
          <a className="brand" href="/"><span className="brand-mark">P</span><span>PRE:SCIENCE</span></a>
          <div><span className="live-dot" />응답 데이터</div>
        </header>
        <section className="dashboard-heading">
          <div><p className="eyebrow">통합과학2 선개념 진단</p><h1>{dashboard.name}</h1><p>학생들의 현재 생각을 수업 설계의 근거로 활용하세요.</p></div>
          <div className="dashboard-actions"><button onClick={() => void copy("student", `${origin}/?class=${dashboard.code}`)}>{copied === "student" ? "복사됨 ✓" : "학생 링크 복사"}</button><button onClick={() => void loadDashboard()}>새로고침 ↻</button></div>
        </section>
        <section className="stat-grid">
          <article><span>제출 완료</span><b>{dashboard.submissions.length}</b><small>명</small></article>
          <article><span>과학적 개념 응답</span><b>{analytics.scientificRate}</b><small>%</small></article>
          <article><span>진단 문항</span><b>{QUESTIONS.length}</b><small>개</small></article>
          <article><span>학급 코드</span><strong>{dashboard.code}</strong><small>학생용</small></article>
        </section>
        {dashboard.submissions.length === 0 ? (
          <section className="empty-dashboard"><div>↗</div><h2>아직 제출된 응답이 없어요.</h2><p>학생 링크를 공유하고 첫 응답을 기다려 주세요.</p></section>
        ) : (
          <div className="dashboard-grid">
            <section className="panel misconception-panel">
              <div className="panel-title"><div><span>우선 확인할 선개념</span><h2>학급에서 자주 나타난 생각</h2></div><small>상위 5개</small></div>
              <div className="conception-list">
                {analytics.topConceptions.map((item, index) => (
                  <article key={item.name}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{item.name}</strong><span>{item.standard}</span></div><em>{item.count}명</em></article>
                ))}
              </div>
            </section>
            <section className="panel roster-panel">
              <div className="panel-title"><div><span>제출 현황</span><h2>학생 응답</h2></div><small>{dashboard.submissions.length}명</small></div>
              <div className="roster-list">
                {dashboard.submissions.slice(0, 8).map((submission) => <div key={submission.id}><span>{submission.studentNumber}</span><b>{submission.studentName}</b><time>{new Date(submission.completedAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div>)}
              </div>
            </section>
            <section className="panel response-panel">
              <div className="panel-title"><div><span>문항별 분석</span><h2>선택지 반응 분포</h2></div><small>과학적 개념 응답은 초록색</small></div>
              <div className="item-analysis">
                {analytics.itemRows.map(({ question, counts }, index) => (
                  <article key={question.id}>
                    <div className="item-copy"><span>{index + 1}</span><div><small>{question.standard} · {question.domain}</small><h3>{question.prompt}</h3></div></div>
                    <div className="distribution">
                      {question.options.map((option) => {
                        const count = counts[option.id];
                        const percent = dashboard.submissions.length ? Math.round((count / dashboard.submissions.length) * 100) : 0;
                        return <div key={option.id} className={option.kind === "scientific" ? "scientific" : ""}><span>{option.id.toUpperCase()}</span><div><i style={{ width: `${percent}%` }} /></div><b>{count}명</b><small>{option.conception}</small></div>;
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="app-shell teacher-entry-shell">
      <header className="topbar"><a className="brand" href="/"><span className="brand-mark">P</span><span>PRE:SCIENCE</span></a><a className="teacher-link" href="/">학생용</a></header>
      <section className="teacher-entry">
        <div className="teacher-intro"><p className="eyebrow">TEACHER STUDIO</p><h1>학생들의 답보다<br /><em>생각의 이유</em>를 먼저 봅니다.</h1><p>학급을 만들고 학생 링크를 공유하세요. 제출과 동시에 자주 나타나는 선개념이 자동으로 모입니다.</p><div className="feature-stack"><span><b>01</b>15개 성취기준·30문항 진단</span><span><b>02</b>선개념 유형 자동 집계</span><span><b>03</b>문항별 반응 분포</span></div></div>
        <div className="teacher-cards">
          {!created ? (
            <form className="entry-card" onSubmit={createClass}><span className="card-step">NEW CLASS</span><h2>새 학급 만들기</h2><label><span>학급 이름</span><input value={className} onChange={(event) => setClassName(event.target.value)} placeholder="예: 2학년 3반 통합과학" maxLength={40} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-action" disabled={loading}>{loading ? "만드는 중…" : "학급 만들기 →"}</button></form>
          ) : (
            <div className="entry-card created-card"><span className="success-icon">✓</span><h2>{created.name}</h2><p>학급이 준비됐어요. 아래 두 링크를 각각 보관해 주세요.</p><button className="link-copy" onClick={() => void copy("student", studentUrl)}><span><small>학생용 링크</small><b>이름·학번 입력 후 진단</b></span><em>{copied === "student" ? "복사됨 ✓" : "복사"}</em></button><button className="link-copy private" onClick={() => void copy("teacher", teacherUrl)}><span><small>교사용 비밀 링크</small><b>응답 분석 대시보드</b></span><em>{copied === "teacher" ? "복사됨 ✓" : "복사"}</em></button><button className="primary-action" onClick={() => void loadDashboard(created.code, created.teacherToken)}>대시보드 열기 →</button><p className="privacy-note">교사용 링크를 아는 사람은 응답을 볼 수 있으니 안전하게 보관하세요.</p></div>
          )}
          {!created && <form className="existing-class" onSubmit={(event) => { event.preventDefault(); void loadDashboard(); }}><h3>기존 학급 열기</h3><div><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="학급 코드" /><input value={token} onChange={(event) => setToken(event.target.value)} placeholder="교사용 키" type="password" /><button disabled={loading}>열기</button></div></form>}
        </div>
      </section>
    </main>
  );
}
