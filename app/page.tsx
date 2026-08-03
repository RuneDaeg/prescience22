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
  sourceLabel: string;
};

const RESEARCH_SECONDS = 600;
const PRESENT_SECONDS = 60;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

const keywordsForCourse = (course: CurriculumCourse): Keyword[] =>
  course.topics.map((topic) => ({
    name: topic.name,
    category: topic.domain,
    sourceLabel: topic.sourceLabel,
  }));

const defaultCourse = (level: CurriculumLevel) =>
  CURRICULUM_COURSES.find((course) =>
    level === "high"
      ? course.level === "high" && course.name === "통합과학1"
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
  const [seconds, setSeconds] = useState(RESEARCH_SECONDS);
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const previousName = useRef<string | null>(null);
  const spinTimers = useRef<number[]>([]);

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

  const clearSpinTimers = useCallback(() => {
    spinTimers.current.forEach((timer) => window.clearTimeout(timer));
    spinTimers.current = [];
  }, []);

  useEffect(() => clearSpinTimers, [clearSpinTimers]);

  const resetActivity = useCallback(() => {
    clearSpinTimers();
    previousName.current = null;
    setTopicCategory("전체");
    setKeyword(null);
    setPhase("ready");
    setSeconds(RESEARCH_SECONDS);
    setRunning(false);
    setEndAt(null);
    setSpinning(false);
  }, [clearSpinTimers]);

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
      gain.gain.setValueAtTime(0.07, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.32);
    } catch {
      // Timers continue when browser audio is unavailable.
    }
  }, []);

  const pickCandidate = useCallback((pool: Keyword[]) => {
    const candidates = pool.length > 1
      ? pool.filter((item) => item.name !== previousName.current)
      : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, []);

  const drawKeyword = useCallback(() => {
    if (filtered.length === 0 || spinning) return;
    clearSpinTimers();
    setPhase("ready");
    setSeconds(RESEARCH_SECONDS);
    setRunning(false);
    setEndAt(null);
    setSpinning(true);

    const finalKeyword = pickCandidate(filtered);
    const steps = 13;
    for (let step = 0; step < steps; step += 1) {
      const delay = step * 58 + step * step * 4;
      const timer = window.setTimeout(() => {
        if (step === steps - 1) {
          previousName.current = finalKeyword.name;
          setKeyword(finalKeyword);
          setSpinning(false);
          playCue(760);
          return;
        }
        setKeyword(filtered[Math.floor(Math.random() * filtered.length)]);
      }, delay);
      spinTimers.current.push(timer);
    }
  }, [clearSpinTimers, filtered, pickCandidate, playCue, spinning]);

  const drawFromAllCourses = useCallback(() => {
    if (spinning) return;
    const nextCourse = CURRICULUM_COURSES[Math.floor(Math.random() * CURRICULUM_COURSES.length)];
    const nextKeyword = pickCandidate(keywordsForCourse(nextCourse));
    setLevel(nextCourse.level);
    setSubjectGroup(nextCourse.subjectGroup);
    setCourseId(nextCourse.id);
    setTopicCategory("전체");
    previousName.current = nextKeyword.name;
    setKeyword(nextKeyword);
    setPhase("ready");
    setSeconds(RESEARCH_SECONDS);
    playCue(760);
  }, [pickCandidate, playCue, spinning]);

  const startResearch = useCallback(() => {
    if (!keyword || spinning) return;
    setPhase("research");
    setSeconds(RESEARCH_SECONDS);
    setEndAt(Date.now() + RESEARCH_SECONDS * 1000);
    setRunning(true);
  }, [keyword, spinning]);

  const startPresentation = useCallback(() => {
    setPhase("present");
    setSeconds(PRESENT_SECONDS);
    setEndAt(Date.now() + PRESENT_SECONDS * 1000);
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

  const returnToPicker = useCallback((nextRound = false) => {
    if (nextRound) setRound((value) => value + 1);
    setPhase("ready");
    setSeconds(RESEARCH_SECONDS);
    setRunning(false);
    setEndAt(null);
  }, []);

  const nextKeyword = useCallback(() => {
    setRound((value) => value + 1);
    setPhase("ready");
    setKeyword(null);
    setSeconds(RESEARCH_SECONDS);
    setRunning(false);
    setEndAt(null);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space" && (phase === "research" || phase === "present")) {
        event.preventDefault();
        toggleTimer();
      }
      if (event.key.toLowerCase() === "r" && phase === "ready") drawKeyword();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawKeyword, phase, toggleTimer]);

  if (phase === "research" || phase === "present") {
    const isResearch = phase === "research";
    return (
      <main className={`focus-screen ${isResearch ? "focus-research" : "focus-present"}`}>
        <div className="ambient-glow" aria-hidden="true" />
        <header className="focus-header">
          <button type="button" className="text-button" onClick={() => returnToPicker()}>← 주제 선택</button>
          <span>ROUND {round.toString().padStart(2, "0")}</span>
        </header>

        <section className="focus-content" aria-live="polite">
          <p className="eyebrow">{isResearch ? "RESEARCH · 자료 조사 중" : "SPEAK · 설명하는 시간"}</p>
          <p className="focus-course">{selectedCourse.name} · {keyword?.category}</p>
          <h1 className="focus-topic">{keyword?.name}</h1>
          <div className="timer-center">
            <strong className="big-timer">{formatTime(seconds)}</strong>
          </div>
          <p className="focus-hint">
            {running
              ? isResearch ? "뜻 · 원리 · 예시를 찾아 나만의 말로 정리하세요." : "친구에게 가르치듯 또박또박 설명해 보세요."
              : "잠시 멈췄습니다. 준비되면 계속하세요."}
          </p>
          <div className="focus-actions">
            <button type="button" className="primary-button" onClick={toggleTimer}>{running ? "Ⅱ  일시정지" : "▶  계속하기"}</button>
            {isResearch && <button type="button" className="secondary-button" onClick={startPresentation}>조사 끝, 1분 설명 시작</button>}
          </div>
          <p className="shortcut"><kbd>SPACE</kbd> 시작 · 일시정지</p>
        </section>
      </main>
    );
  }

  if (phase === "done") {
    return (
      <main className="focus-screen focus-done">
        <div className="ambient-glow" aria-hidden="true" />
        <section className="done-content">
          <p className="eyebrow">ROUND COMPLETE</p>
          <span className="done-mark" aria-hidden="true">✓</span>
          <p className="focus-course">{selectedCourse.name}</p>
          <h1 className="focus-topic">{keyword?.name}</h1>
          <p className="done-copy">1분 설명을 마쳤어요.<br />방금 설명에서 가장 중요한 문장 하나를 떠올려 보세요.</p>
          <div className="focus-actions">
            <button type="button" className="primary-button" onClick={nextKeyword}>다음 키워드</button>
            <button type="button" className="secondary-button" onClick={() => returnToPicker(true)}>같은 키워드 다시 도전</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="picker-screen" id="top">
      <div className="ambient-glow" aria-hidden="true" />
      <header className="picker-header">
        <a href="#top" className="wordmark">TOPIC PICK</a>
        <span>ROUND {round.toString().padStart(2, "0")}</span>
      </header>

      <section className="picker-content">
        <div className="intro">
          <p className="eyebrow">2022 개정 교육과정</p>
          <h1>배운 개념을<br />설명해보세요</h1>
          <p>과학·사회·수학의 키워드를 뽑아<br />10분 조사하고, 1분 동안 말해보세요.</p>
        </div>

        <div className="level-toggle" aria-label="학교급 선택">
          <button type="button" className={level === "middle" ? "active" : ""} onClick={() => changeLevel("middle")} aria-pressed={level === "middle"}>중학교</button>
          <button type="button" className={level === "high" ? "active" : ""} onClick={() => changeLevel("high")} aria-pressed={level === "high"}>고등학교</button>
        </div>

        <div className="curriculum-selectors">
          <label>
            <span>교과군</span>
            <select value={subjectGroup} onChange={(event) => changeSubjectGroup(event.target.value)} disabled={spinning}>
              {subjectGroups.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </label>
          <label>
            <span>과목</span>
            <select value={courseId} onChange={(event) => changeCourse(event.target.value)} disabled={spinning}>
              {coursesInGroup.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </label>
          <label className="wide-selector">
            <span>파트</span>
            <select value={topicCategory} onChange={(event) => { setTopicCategory(event.target.value); setKeyword(null); }} disabled={spinning}>
              <option value="전체">전체 파트 · {keywords.length}개 키워드</option>
              {topicCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
        </div>

        <div className="topic-zone" aria-live="polite">
          {keyword ? (
            <>
              <p className="topic-meta">{selectedCourse.name} · {keyword.category}</p>
              <h2 className={spinning ? "topic-display spinning" : "topic-display landed"}>{keyword.name}</h2>
              {!spinning && <p className="topic-guide">뜻 · 핵심 원리 · 구체적인 예시 하나</p>}
            </>
          ) : (
            <>
              <p className="topic-meta">{selectedCourse.category} · {filtered.length}개 키워드</p>
              <h2 className="topic-placeholder">과목을 고르고<br />키워드를 뽑아보세요</h2>
            </>
          )}
        </div>

        <div className="picker-actions">
          <button type="button" className="primary-button" onClick={drawKeyword} disabled={spinning}>{spinning ? "고르는 중…" : keyword ? "다시 뽑기" : "키워드 뽑기"}</button>
          <button type="button" className="secondary-button" onClick={startResearch} disabled={!keyword || spinning}>10분 조사 시작</button>
        </div>

        <button type="button" className="random-link" onClick={drawFromAllCourses} disabled={spinning}>🎲 전체 과목에서 무작위로 뽑기</button>

        <div className="flow-note" aria-label="활동 흐름">
          <span><b>01</b> 키워드 뽑기</span><i />
          <span><b>02</b> 10분 조사</span><i />
          <span><b>03</b> 1분 설명</span>
        </div>
      </section>

      <footer className="picker-footer">
        <p>과학·사회·수학 {CURRICULUM_COURSES.length}개 과목 · 확정 키워드 우선</p>
        <a href={CURRICULUM_SOURCE.repository} target="_blank" rel="noreferrer">교육과정 데이터 출처 ↗</a>
      </footer>
    </main>
  );
}
