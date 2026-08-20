"use client";

import { useEffect } from "react";
import type { DiagnosticQuestion } from "../questions";

type Props = {
  question: DiagnosticQuestion | null;
  onClose: () => void;
};

export function QuestionDetailModal({ question, onClose }: Props) {
  useEffect(() => {
    if (!question) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, question]);

  if (!question) return null;
  const scientificIndex = question.options.findIndex((option) => option.kind === "scientific");
  const scientificOption = question.options[scientificIndex];

  return (
    <div className="question-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="question-modal" role="dialog" aria-modal="true" aria-labelledby="question-modal-title">
        <button className="question-modal-close" type="button" onClick={onClose} aria-label="문항 상세 닫기">×</button>
        <p className="eyebrow">{question.standard} · {question.domain}</p>
        <h2 id="question-modal-title">{question.prompt}</h2>
        {question.context && <p className="question-context">{question.context}</p>}
        <div className="question-option-details">
          {question.options.map((option, index) => (
            <article key={option.id} className={option.kind === "scientific" ? "scientific" : ""}>
              <span>{String.fromCharCode(65 + index)}</span>
              <div><b>{option.text}</b><small>{option.conception}</small></div>
              <em>{option.kind === "scientific" ? "과학적 개념" : option.kind === "partial" ? "부분 개념" : "선개념"}</em>
            </article>
          ))}
        </div>
        <div className="question-explanation">
          <span>해설</span>
          <h3>과학적 개념 선택지는 {String.fromCharCode(65 + scientificIndex)}입니다.</h3>
          <p>{scientificOption.text} 이 문항은 학생이 <strong>{scientificOption.conception}</strong>을 이해하고 있는지 확인합니다. 다른 선택지의 설명을 함께 살펴보면 학생이 가진 선개념을 구체적으로 파악할 수 있습니다.</p>
        </div>
      </section>
    </div>
  );
}
