"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Condolence = {
  id: string;
  name: string;
  message: string;
  createdAt: number;
};

type TributeResponse = {
  flowerCount: number;
  messages: Condolence[];
};

const FALLBACK_MESSAGES: Condolence[] = [
  { id: "sample-1", name: "개학을 믿지 못하는 학생", message: "짧았지만 강렬했다. 다음 방학에는 꼭 계획대로 살게.", createdAt: Date.now() - 86_400_000 },
  { id: "sample-2", name: "알람 시계 유가족", message: "늦잠의 자유를 영원히 기억하겠습니다.", createdAt: Date.now() - 43_200_000 },
  { id: "sample-3", name: "밀린 숙제 대표", message: "우리의 만남이 너무 늦었구나. 오늘 밤 안에 끝내 볼게.", createdAt: Date.now() - 3_600_000 },
];

const formatDate = (value: number) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(value));

function Chrysanthemum({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "flower flower-small" : "flower"} aria-hidden="true">
      <span className="petal petal-1" /><span className="petal petal-2" />
      <span className="petal petal-3" /><span className="petal petal-4" />
      <span className="petal petal-5" /><span className="petal petal-6" />
      <span className="petal petal-7" /><span className="petal petal-8" />
      <span className="flower-core" />
      {!small && <><span className="flower-stem" /><span className="flower-leaf" /></>}
    </span>
  );
}

export default function Home() {
  const [flowerCount, setFlowerCount] = useState(0);
  const [messages, setMessages] = useState<Condolence[]>(FALLBACK_MESSAGES);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [flowerBurst, setFlowerBurst] = useState<number[]>([]);

  const refreshTributes = useCallback(async () => {
    try {
      const response = await fetch("/api/tributes", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as TributeResponse;
      setFlowerCount(data.flowerCount);
      setMessages(data.messages.length ? data.messages : FALLBACK_MESSAGES);
    } catch {
      // The memorial still works as a playful local preview if the network is unavailable.
    }
  }, []);

  useEffect(() => { void refreshTributes(); }, [refreshTributes]);

  const addFlowerBurst = () => {
    const stamp = Date.now();
    setFlowerBurst((current) => [...current.slice(-8), stamp]);
    window.setTimeout(() => setFlowerBurst((current) => current.filter((item) => item !== stamp)), 1500);
  };

  const sendTribute = async (payload: { name?: string; message?: string }) => {
    const response = await fetch("/api/tributes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("tribute failed");
    return response.json() as Promise<TributeResponse>;
  };

  const offerFlower = async () => {
    if (isSending) return;
    setIsSending(true);
    setFlowerCount((count) => count + 1);
    addFlowerBurst();
    setNotice("하얀 국화 한 송이가 방학의 곁에 놓였습니다.");
    try {
      const data = await sendTribute({});
      setFlowerCount(data.flowerCount);
    } catch {
      setNotice("마음속 헌화는 완료됐어요. 연결되면 다시 시도해 주세요.");
    } finally {
      setIsSending(false);
    }
  };

  const submitCondolence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setNotice("방학에게 마지막 한마디를 남겨 주세요.");
      return;
    }
    setIsSending(true);
    setNotice("");
    try {
      const data = await sendTribute({ name: cleanName || "익명의 조문객", message: cleanMessage });
      setFlowerCount(data.flowerCount);
      setMessages(data.messages.length ? data.messages : FALLBACK_MESSAGES);
      setName("");
      setMessage("");
      addFlowerBurst();
      setNotice("조의문과 국화 한 송이를 정중히 올렸습니다.");
    } catch {
      setNotice("조의문을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSending(false);
    }
  };

  const visibleFlowers = useMemo(() => Array.from({ length: Math.min(9, Math.max(3, flowerCount % 10)) }), [flowerCount]);

  return (
    <main>
      <section className="hero" aria-labelledby="memorial-title">
        <div className="mourning-ribbon ribbon-left" aria-hidden="true" />
        <div className="mourning-ribbon ribbon-right" aria-hidden="true" />
        <header className="topbar">
          <a className="brand" href="#top" id="top">THE LAST DAY</a>
          <span>방학 장례식 · 입장료 무료 · 눈물은 선택</span>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="kicker">삼가 고(故) 방학의 명복을 빕니다</p>
            <h1 id="memorial-title">잘 가,<br /><em>우리의 방학.</em></h1>
            <p className="hero-description">늦잠과 야식, 미뤄 둔 숙제를 품고<br />방학이 우리 곁을 떠났습니다.</p>
            <a className="text-link" href="#guestbook">조문 순서 보기 <span aria-hidden="true">↓</span></a>
          </div>

          <div className="altar-wrap">
            <div className="portrait-frame">
              <span className="frame-label">故</span>
              <img src="/vacation-memorial.png" alt="검은 근조 리본과 방학 글자가 있는 영정 이미지" />
            </div>
            <div className="altar-table" aria-label={`현재까지 국화 ${flowerCount}송이`}>
              {visibleFlowers.map((_, index) => <Chrysanthemum key={index} small />)}
            </div>
            <div className="burst-layer" aria-hidden="true">
              {flowerBurst.map((item, index) => <span key={item} style={{ "--burst-x": `${(index % 5) * 18 - 36}px` } as React.CSSProperties}><Chrysanthemum small /></span>)}
            </div>
          </div>

          <aside className="date-card" aria-label="방학의 기록">
            <span>기억할게</span>
            <strong>20<br />26</strong>
            <p>늦잠은 짧았고<br />개학은 빨랐다</p>
          </aside>
        </div>
        <div className="marquee" aria-hidden="true"><span>GOODBYE VACATION · SEE YOU NEXT SEASON · GOODBYE VACATION · SEE YOU NEXT SEASON · </span></div>
      </section>

      <section className="ceremony" id="guestbook" aria-labelledby="ceremony-title">
        <div className="section-heading">
          <p>ORDER OF FAREWELL</p>
          <h2 id="ceremony-title">마지막 인사를<br />남겨 주세요.</h2>
        </div>

        <div className="ceremony-grid">
          <article className="offering-card">
            <span className="step-number">01</span>
            <div className="large-flower"><Chrysanthemum /></div>
            <div>
              <p className="card-label">헌화</p>
              <h3>하얀 국화 한 송이</h3>
              <p>방학의 마지막 길이 외롭지 않도록<br />마음을 담아 국화를 올려 주세요.</p>
              <button type="button" className="primary-button" onClick={offerFlower} disabled={isSending}>
                <span>국화 올리기</span><span aria-hidden="true">＋</span>
              </button>
              <p className="flower-count"><strong>{flowerCount.toLocaleString("ko-KR")}</strong>송이의 마음이 모였어요</p>
            </div>
          </article>

          <article className="message-card">
            <span className="step-number">02</span>
            <p className="card-label">조의문</p>
            <h3>방학에게 쓰는<br />마지막 한마디</h3>
            <form onSubmit={submitCondolence}>
              <label>
                <span>이름</span>
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} placeholder="익명도 괜찮아요" />
              </label>
              <label>
                <span>조의문</span>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={100} placeholder="예: 다음 방학엔 진짜 일찍 잘게…" required />
                <small>{message.length} / 100</small>
              </label>
              <button type="submit" className="submit-button" disabled={isSending || !message.trim()}>
                조의문 남기기 <span aria-hidden="true">↗</span>
              </button>
            </form>
            <p className="notice" role="status" aria-live="polite">{notice}</p>
          </article>
        </div>
      </section>

      <section className="condolences" aria-labelledby="condolence-title">
        <div className="condolence-header">
          <div><p>RECENT MOURNERS</p><h2 id="condolence-title">먼저 다녀간<br />조문객들의 한마디</h2></div>
          <span className="live-badge"><i /> 실시간 조문 중</span>
        </div>
        <div className="message-list">
          {messages.slice(0, 6).map((item, index) => (
            <article key={item.id} className="condolence-row">
              <span className="message-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <blockquote>“{item.message}”</blockquote>
                <p>{item.name} <span>·</span> {formatDate(item.createdAt)}</p>
              </div>
              <Chrysanthemum small />
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div><span>故 방학</span><strong>다음 방학에 다시 만나요.</strong></div>
        <p>※ 본 장례식은 웃자고 만든 가상의 행사입니다.<br />개학도, 우리도, 생각보다 잘 해낼 거예요.</p>
        <a href="#top">처음으로 ↑</a>
      </footer>
    </main>
  );
}
