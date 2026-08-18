"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "./questions";

type ClassInfo = { code: string; name: string };
type Phase = "join" | "intro" | "test" | "submitting" | "done";

export default function StudentPage() {
  const [classCode, setClassCode] = useState("");
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [phase, setPhase] = useState<Phase>("join");
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const current = QUESTIONS[questionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("class")?.trim().toUpperCase();
    if (code) {
      setClassCode(code);
      void loadClass(code);
    }
  }, []);

  async function loadClass(code: string) {
    setError("");
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(code)}`);
      if (!response.ok) throw new Error("학급을 찾을 수 없습니다.");
      const data = (await response.json()) as ClassInfo;
      setClassInfo(data);
      setPhase("intro");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "학급 정보를 불러오지 못했습니다.");
      setPhase("join");
    }
  }

  function joinClass(event: FormEvent) {
    event.preventDefault();
    const code = classCode.trim().toUpperCase();
    if (code.length < 4) return setError("학급 코드를 확인해 주세요.");
    void loadClass(code);
  }

  function beginTest(event: FormEvent) {
    event.preventDefault();
    if (studentName.trim().length < 2) return setError("이름을 두 글자 이상 입력해 주세요.");
    if (!studentNumber.trim()) return setError("학번을 입력해 주세요.");
    setError("");
    setPhase("test");
  }

  function choose(optionId: string) {
    setAnswers((previous) => ({ ...previous, [current.id]: optionId }));
  }

  async function nextQuestion() {
    if (!answers[current.id]) return setError("가장 가깝게 생각하는 답을 하나 골라 주세요.");
    setError("");
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }
    setPhase("submitting");
    try {
      const response = await fetch(`/api/classes/${classInfo?.code}/submissions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studentName, studentNumber, answers }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "응답을 저장하지 못했습니다.");
      }
      setPhase("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "응답을 저장하지 못했습니다.");
      setPhase("test");
    }
  }

  const testStatus = useMemo(() => `${questionIndex + 1} / ${QUESTIONS.length}`, [questionIndex]);

  return (
    <main className="app-shell student-shell">
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span><span>PRE:SCIENCE</span></a>
        <a className="teacher-link" href="/teacher">교사용</a>
      </header>

      {phase === "join" && (
        <section className="hero split-hero">
          <div className="hero-copy">
            <p className="eyebrow">통합과학2 선개념 진단</p>
            <h1>수업 전,<br /><em>생각의 출발점</em>을 발견해요.</h1>
            <p>정답을 맞히는 시험이 아니에요. 지금 알고 있는 대로 편안하게 답해 주세요.</p>
            <div className="topic-strip" aria-label="진단 영역">
              <span>변화와 다양성</span><span>환경과 에너지</span><span>과학과 미래 사회</span>
            </div>
          </div>
          <form className="entry-card" onSubmit={joinClass}>
            <span className="card-step">STUDENT ENTRY</span>
            <h2>학급에 들어가기</h2>
            <label><span>학급 코드</span><input value={classCode} onChange={(event) => setClassCode(event.target.value.toUpperCase())} placeholder="예: SCI2A7" maxLength={10} autoComplete="off" /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-action" type="submit">계속하기 <span>→</span></button>
            <p className="privacy-note">교사가 안내한 코드로만 입장할 수 있어요.</p>
          </form>
        </section>
      )}

      {phase === "intro" && classInfo && (
        <section className="center-stage">
          <form className="entry-card identity-card" onSubmit={beginTest}>
            <span className="class-pill">{classInfo.name}</span>
            <h1>반가워요.<br />먼저 누구인지 알려 주세요.</h1>
            <div className="field-row">
              <label><span>이름</span><input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="홍길동" maxLength={20} autoComplete="name" /></label>
              <label><span>학번</span><input value={studentNumber} onChange={(event) => setStudentNumber(event.target.value)} placeholder="예: 20315" maxLength={12} inputMode="numeric" /></label>
            </div>
            <div className="test-facts"><span><b>15</b>개 문항</span><span><b>약 8</b>분</span><span><b>점수 공개 없음</b></span></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-action" type="submit">진단 시작하기 <span>→</span></button>
            <p className="privacy-note">입력한 정보와 응답은 담당 교사의 수업 설계에만 사용됩니다.</p>
          </form>
        </section>
      )}

      {(phase === "test" || phase === "submitting") && current && (
        <section className="test-stage">
          <div className="test-head">
            <div><span className="domain-badge">{current.domain}</span><strong>{testStatus}</strong></div>
            <div className="progress-track" aria-label={`진행률 ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
          </div>
          <article className="question-card">
            <p className="standard-code">{current.standard}</p>
            <h1>{current.prompt}</h1>
            {current.context && <p className="question-context">{current.context}</p>}
            <div className="option-list">
              {current.options.map((option, index) => (
                <button key={option.id} type="button" className={answers[current.id] === option.id ? "option selected" : "option"} onClick={() => choose(option.id)}>
                  <span>{String.fromCharCode(65 + index)}</span><b>{option.text}</b><i>{answers[current.id] === option.id ? "✓" : ""}</i>
                </button>
              ))}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="question-actions">
              <button type="button" className="back-action" disabled={questionIndex === 0 || phase === "submitting"} onClick={() => setQuestionIndex((value) => value - 1)}>← 이전</button>
              <button type="button" className="primary-action compact" disabled={phase === "submitting" || !answers[current.id]} onClick={nextQuestion}>{phase === "submitting" ? "저장 중…" : questionIndex === QUESTIONS.length - 1 ? "응답 제출하기" : "다음 문항 →"}</button>
            </div>
          </article>
        </section>
      )}

      {phase === "done" && (
        <section className="center-stage done-stage">
          <div className="done-symbol">✓</div>
          <p className="eyebrow">RESPONSE SAVED</p>
          <h1>{studentName} 학생,<br />응답을 잘 저장했어요.</h1>
          <p>여러분의 생각은 더 좋은 통합과학 수업을 만드는 출발점이 됩니다.</p>
          <div className="done-card"><span>완료한 문항</span><b>{QUESTIONS.length} / {QUESTIONS.length}</b><small>{classInfo?.name}</small></div>
        </section>
      )}
    </main>
  );
}
