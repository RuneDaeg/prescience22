"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CURRICULUM_COURSES,
  CURRICULUM_SOURCE,
  type CurriculumCourse,
  type CurriculumLevel,
} from "./curriculum-data";

type Phase = "ready" | "research" | "present" | "done";

type Keyword = {
  name: string;
  category: string;
  question: string;
  anchors: string[];
};

const PHYSICS_KEYWORDS: Keyword[] = [
  { name: "평형과 안정성", category: "힘과 에너지", question: "힘의 평형이 물체의 안정성과 어떤 관계가 있는지 설명해 보세요.", anchors: ["알짜힘", "무게중심", "생활 속 사례"] },
  { name: "뉴턴 운동 법칙", category: "힘과 에너지", question: "세 가지 운동 법칙을 하나의 일상 사례로 연결해 보세요.", anchors: ["관성", "F=ma", "작용·반작용"] },
  { name: "일-에너지 정리", category: "힘과 에너지", question: "물체에 한 일과 운동 에너지 변화의 관계를 설명해 보세요.", anchors: ["힘", "이동 거리", "운동 에너지"] },
  { name: "역학적 에너지 보존", category: "힘과 에너지", question: "위치 에너지와 운동 에너지가 어떻게 서로 전환되는지 설명해 보세요.", anchors: ["위치 에너지", "운동 에너지", "마찰"] },
  { name: "열과 에너지 전환", category: "힘과 에너지", question: "열이 이동하고 다른 형태의 에너지로 전환되는 사례를 설명해 보세요.", anchors: ["열전달", "내부 에너지", "에너지 효율"] },
  { name: "전기장과 전위차", category: "전기와 자기", question: "보이지 않는 전기장과 전위차를 물의 흐름에 비유해 설명해 보세요.", anchors: ["전하", "전기력", "전압"] },
  { name: "축전기", category: "전기와 자기", question: "축전기가 전하와 전기 에너지를 저장하는 원리를 설명해 보세요.", anchors: ["두 도체판", "전하 저장", "활용 사례"] },
  { name: "자성체", category: "전기와 자기", question: "물질이 자석에 반응하는 방식이 서로 다른 이유를 설명해 보세요.", anchors: ["자기장", "자화", "물질의 종류"] },
  { name: "전류의 자기 작용", category: "전기와 자기", question: "전류가 흐를 때 자기장이 생기는 현상과 활용 사례를 설명해 보세요.", anchors: ["전류", "자기장", "전동기"] },
  { name: "전자기 유도", category: "전기와 자기", question: "자기장의 변화가 어떻게 전류를 만들어 내는지 설명해 보세요.", anchors: ["자기 선속", "유도 전류", "발전기"] },
  { name: "중첩과 간섭", category: "빛과 물질", question: "두 파동이 만날 때 나타나는 중첩과 간섭을 설명해 보세요.", anchors: ["보강 간섭", "상쇄 간섭", "파동"] },
  { name: "굴절", category: "빛과 물질", question: "빛이 서로 다른 물질의 경계에서 꺾이는 이유를 설명해 보세요.", anchors: ["빛의 속력", "굴절률", "렌즈"] },
  { name: "빛과 물질의 이중성", category: "빛과 물질", question: "빛과 물질이 파동성과 입자성을 모두 보인다는 의미를 설명해 보세요.", anchors: ["광자", "물질파", "실험 증거"] },
  { name: "에너지띠와 반도체", category: "빛과 물질", question: "에너지띠로 도체와 반도체의 차이를 설명해 보세요.", anchors: ["원자가띠", "전도띠", "띠틈"] },
  { name: "광속 불변", category: "빛과 물질", question: "관측자의 운동과 관계없이 빛의 속력이 일정하다는 의미를 설명해 보세요.", anchors: ["빛의 속력", "관성계", "상대성"] },
];

const CATEGORY_COLORS: Record<string, string> = {
  "힘과 에너지": "#ff6b3d",
  "전기와 자기": "#08a37a",
  "빛과 물질": "#7957e8",
};

const PALETTE = ["#ff6b3d", "#08a37a", "#7957e8", "#2374d8", "#d94874", "#8a6b00"];

const colorFor = (value: string) => {
  const score = Array.from(value).reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0);
  return PALETTE[score % PALETTE.length];
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const keywordsForCourse = (course: CurriculumCourse): Keyword[] => {
  if (course.level === "high" && course.name === "물리학") return PHYSICS_KEYWORDS;

  return course.topics.map((topic) => ({
    name: topic,
    category: course.name,
    question: `‘${topic}’이 무엇인지, 왜 중요한지 구체적인 예와 함께 설명해 보세요.`,
    anchors: ["뜻과 특징", "관련 개념", "구체적 예시"],
  }));
};

const defaultCourse = (level: CurriculumLevel) =>
  CURRICULUM_COURSES.find((course) =>
    level === "high"
      ? course.level === "high" && course.name === "물리학"
      : course.level === "middle" && course.name === "과학",
  ) ?? CURRICULUM_COURSES.find((course) => course.level === level)!;

export default function Home() {
  const initialCourse = defaultCourse("high");
  const [level, setLevel] = useState<CurriculumLevel>("high");
  const [subjectGroup, setSubjectGroup] = useState(initialCourse.subjectGroup);
  const [courseId, setCourseId] = useState(initialCourse.id);
  const [topicCategory, setTopicCategory] = useState("전체");
  const [keyword, setKeyword] = useState<Keyword | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [seconds, setSeconds] = useState(600);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const previousName = useRef<string | null>(null);

  const coursesAtLevel = useMemo(
    () => CURRICULUM_COURSES.filter((course) => course.level === level),
    [level],
  );
  const subjectGroups = useMemo(
    () => Array.from(new Set(coursesAtLevel.map((course) => course.subjectGroup))).sort((a, b) => a.localeCompare(b, "ko")),
    [coursesAtLevel],
  );
  const coursesInGroup = useMemo(
    () => coursesAtLevel.filter((course) => course.subjectGroup === subjectGroup),
    [coursesAtLevel, subjectGroup],
  );
  const selectedCourse = CURRICULUM_COURSES.find((course) => course.id === courseId) ?? initialCourse;
  const keywords = useMemo(() => keywordsForCourse(selectedCourse), [selectedCourse]);
  const topicCategories = useMemo(
    () => Array.from(new Set(keywords.map((item) => item.category))),
    [keywords],
  );
  const filtered = useMemo(
    () => topicCategory === "전체" ? keywords : keywords.filter((item) => item.category === topicCategory),
    [keywords, topicCategory],
  );

  const resetActivity = useCallback(() => {
    previousName.current = null;
    setTopicCategory("전체");
    setKeyword(null);
    setPhase("ready");
    setSeconds(600);
    setRunning(false);
    setEndAt(null);
    setRound(1);
  }, []);

  const changeLevel = (nextLevel: CurriculumLevel) => {
    const next = defaultCourse(nextLevel);
    setLevel(nextLevel);
    setSubjectGroup(next.subjectGroup);
    setCourseId(next.id);
    resetActivity();
  };

  const changeSubjectGroup = (nextGroup: string) => {
    const next = coursesAtLevel.find((course) => course.subjectGroup === nextGroup);
    if (!next) return;
    setSubjectGroup(nextGroup);
    setCourseId(next.id);
    resetActivity();
  };

  const changeCourse = (nextCourseId: string) => {
    setCourseId(nextCourseId);
    resetActivity();
  };

  const playCue = useCallback((frequency = 660) => {
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const context = new AudioCtx();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
    } catch {
      // Sound is an enhancement; timers continue when browser audio is unavailable.
    }
  }, []);

  const drawKeyword = useCallback(() => {
    if (filtered.length === 0) return;
    const candidates = filtered.length > 1
      ? filtered.filter((item) => item.name !== previousName.current)
      : filtered;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    previousName.current = next.name;
    setKeyword(next);
    setPhase("ready");
    setSeconds(600);
    setRunning(false);
    setEndAt(null);
  }, [filtered]);

  const startResearch = useCallback(() => {
    if (!keyword) return;
    setPhase("research");
    setSeconds(600);
    setEndAt(Date.now() + 600_000);
    setRunning(true);
  }, [keyword]);

  const startPresentation = useCallback(() => {
    setPhase("present");
    setSeconds(60);
    setEndAt(Date.now() + 60_000);
    setRunning(true);
    playCue(740);
  }, [playCue]);

  useEffect(() => {
    if (!running || endAt === null) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSeconds(next);
      if (next === 0) {
        setRunning(false);
        setEndAt(null);
        if (phase === "research") startPresentation();
        if (phase === "present") {
          setPhase("done");
          playCue(520);
        }
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [endAt, phase, playCue, running, startPresentation]);

  const toggleTimer = useCallback(() => {
    if (phase !== "research" && phase !== "present") return;
    if (running) {
      setSeconds(Math.max(0, Math.ceil(((endAt ?? Date.now()) - Date.now()) / 1000)));
      setRunning(false);
      setEndAt(null);
    } else {
      setEndAt(Date.now() + seconds * 1000);
      setRunning(true);
    }
  }, [endAt, phase, running, seconds]);

  const nextRound = useCallback(() => {
    setRound((value) => value + 1);
    drawKeyword();
  }, [drawKeyword]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space" && (phase === "research" || phase === "present")) {
        event.preventDefault();
        toggleTimer();
      }
      if (event.key.toLowerCase() === "r" && !running) drawKeyword();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawKeyword, phase, running, toggleTimer]);

  const total = phase === "present" ? 60 : 600;
  const progress = phase === "done" ? 100 : ((total - seconds) / total) * 100;
  const phaseLabel = phase === "research" ? "자료 조사" : phase === "present" ? "1분 설명" : phase === "done" ? "발표 완료" : "준비";
  const badgeColor = CATEGORY_COLORS[keyword?.category ?? ""] ?? colorFor(selectedCourse.subjectGroup);

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="토픽 픽 처음으로">
          <span className="brand-mark" aria-hidden="true">T!</span>
          <span>TOPIC PICK</span>
        </a>
        <div className="curriculum-tag">2022 개정 교육과정 · 중학교 & 고등학교</div>
        <div className="round-chip">ROUND {round.toString().padStart(2, "0")}</div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow"><span /> 과목을 고르고, 10분 탐구, 1분 설명</p>
          <h1>오늘의 개념,<br /><em>딱 1분</em>이면 돼.</h1>
        </div>
        <p className="hero-copy">국어부터 과학, 예술까지.<br />배운 것을 나만의 말로 설명해 보세요.</p>
      </section>

      <section className="workspace" aria-label="교육과정 주제 활동">
        <div className="pick-panel">
          <div className="panel-heading">
            <div>
              <span className="step-number">01</span>
              <h2>과목과 주제</h2>
            </div>
            <span className="count-label">주제 {filtered.length}개</span>
          </div>

          <div className="course-picker">
            <div className="level-switch" aria-label="학교급 선택">
              <button className={level === "middle" ? "active" : ""} onClick={() => changeLevel("middle")} disabled={running} aria-pressed={level === "middle"}>중학교</button>
              <button className={level === "high" ? "active" : ""} onClick={() => changeLevel("high")} disabled={running} aria-pressed={level === "high"}>고등학교</button>
            </div>
            <div className="select-grid">
              <label>
                <span>교과군</span>
                <select value={subjectGroup} onChange={(event) => changeSubjectGroup(event.target.value)} disabled={running}>
                  {subjectGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </select>
              </label>
              <label>
                <span>과목</span>
                <select value={courseId} onChange={(event) => changeCourse(event.target.value)} disabled={running}>
                  {coursesInGroup.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
              </label>
            </div>
            <div className="course-summary">
              <span style={{ background: colorFor(selectedCourse.subjectGroup) }}>{selectedCourse.category}</span>
              <strong>{selectedCourse.name}</strong>
              <small>{level === "middle" ? "중학교" : "고등학교"} · {selectedCourse.subjectGroup}</small>
            </div>
          </div>

          {topicCategories.length > 1 && (
            <div className="filters" aria-label="영역 선택">
              {["전체", ...topicCategories].map((item) => (
                <button key={item} className={topicCategory === item ? "filter active" : "filter"} onClick={() => setTopicCategory(item)} aria-pressed={topicCategory === item}>{item}</button>
              ))}
            </div>
          )}

          <div className={keyword ? "keyword-card selected" : "keyword-card"} aria-live="polite">
            {keyword ? (
              <>
                <span className="category-pill" style={{ backgroundColor: badgeColor }}>{keyword.category}</span>
                <div className="keyword-index">TOPIC {String(keywords.indexOf(keyword) + 1).padStart(2, "0")}</div>
                <h3>{keyword.name}</h3>
                <p>{keyword.question}</p>
                <div className="anchor-row" aria-label="설명에 포함할 핵심어">
                  {keyword.anchors.map((anchor) => <span key={anchor}>#{anchor}</span>)}
                </div>
              </>
            ) : (
              <div className="empty-card">
                <div className="orbit" aria-hidden="true"><i /><b /></div>
                <p>{selectedCourse.name} 주제를 뽑아볼까요?</p>
                <span>아래 버튼을 눌러 시작하세요.</span>
              </div>
            )}
          </div>

          <div className="pick-actions">
            <button className="draw-button" onClick={drawKeyword} disabled={running}>
              <span aria-hidden="true">↻</span> {keyword ? "다시 뽑기" : "랜덤 주제 뽑기"}
            </button>
            {keyword && phase === "ready" && <button className="start-button" onClick={startResearch}>10분 조사 시작 <span aria-hidden="true">→</span></button>}
          </div>
          <p className="shortcut-hint">키보드 <kbd>R</kbd> 다시 뽑기</p>
        </div>

        <div className={`timer-panel phase-${phase}`}>
          <div className="panel-heading timer-heading">
            <div><span className="step-number">02</span><h2>타이머</h2></div>
            <span className="live-status"><i className={running ? "is-live" : ""} /> {phaseLabel}</span>
          </div>

          <div className="current-course-line"><span>{level === "middle" ? "중" : "고"}</span> {selectedCourse.name}</div>

          <div className="stage-track" aria-label="진행 단계">
            <div className={phase === "research" ? "stage current" : phase !== "ready" ? "stage passed" : "stage"}><span>1</span><div><b>자료 조사</b><small>10:00</small></div></div>
            <i />
            <div className={phase === "present" ? "stage current" : phase === "done" ? "stage passed" : "stage"}><span>2</span><div><b>1분 설명</b><small>01:00</small></div></div>
          </div>

          <div className="timer-wrap">
            <div className="timer-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
              <div className="timer-face">
                <span>{phaseLabel}</span>
                <strong>{phase === "done" ? "00:00" : formatTime(seconds)}</strong>
                <small>{phase === "ready" ? "주제를 먼저 뽑아주세요" : running ? "집중해서 핵심을 정리해요" : phase === "done" ? "멋진 설명이었어요!" : "잠시 멈춤"}</small>
              </div>
            </div>
          </div>

          <div className="timer-actions">
            {phase === "ready" && <button className="primary-timer" onClick={keyword ? startResearch : drawKeyword}>{keyword ? "10분 조사 시작" : "주제 먼저 뽑기"} <span aria-hidden="true">→</span></button>}
            {(phase === "research" || phase === "present") && (
              <>
                <button className="primary-timer" onClick={toggleTimer}>{running ? "Ⅱ  일시정지" : "▶  계속하기"}</button>
                {phase === "research" && <button className="secondary-timer" onClick={startPresentation}>1분 설명으로 건너뛰기</button>}
              </>
            )}
            {phase === "done" && <button className="primary-timer" onClick={nextRound}>다음 주제 <span aria-hidden="true">→</span></button>}
          </div>
          {(phase === "research" || phase === "present") && <p className="space-hint"><kbd>SPACE</kbd> 시작 · 일시정지</p>}
        </div>
      </section>

      <section className="howto" aria-labelledby="howto-title">
        <div><p className="eyebrow"><span /> 수업 활용법</p><h2 id="howto-title">네 단계면<br />충분해요.</h2></div>
        <ol>
          <li><span>01</span><div><b>고르기</b><p>학교급과 교과군,<br />오늘 공부할 과목을 골라요.</p></div></li>
          <li><span>02</span><div><b>뽑기</b><p>과목의 핵심 영역 중<br />하나를 무작위로 선택해요.</p></div></li>
          <li><span>03</span><div><b>조사하기</b><p>10분 동안 뜻·특징·예시를<br />찾아 핵심만 정리해요.</p></div></li>
          <li><span>04</span><div><b>설명하기</b><p>1분 동안 친구에게 가르치듯<br />나만의 말로 설명해요.</p></div></li>
        </ol>
      </section>

      <footer>
        <span>TOPIC PICK</span>
        <p>
          2022 개정 교육과정 후보 데이터 · 출처: <a href={CURRICULUM_SOURCE.repository} target="_blank" rel="noreferrer">DECK6/korean-secondary-learning-map</a>
          <br />공식 승인 제품이 아니며 과목 개설·진로 적합성을 판단하지 않습니다.
        </p>
      </footer>
    </main>
  );
}
