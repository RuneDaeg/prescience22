"use client";

import { useEffect } from "react";
import type { DiagnosticQuestion } from "../questions";
import { QUESTION_EXPLANATIONS } from "../question-explanations";

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
  const explanation = QUESTION_EXPLANATIONS[question.id];

  return (
    <div className="question-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="question-modal" role="dialog" aria-modal="true" aria-labelledby="question-modal-title" aria-describedby="question-modal-explanation">
        <button className="question-modal-close" type="button" onClick={onClose} aria-label="문항 상세 닫기">×</button>
        <p className="eyebrow">{question.standard} · {question.domain}</p>
        <h2 id="question-modal-title">{question.prompt}</h2>
        {question.context && <p className="question-context">{question.context}</p>}
        <div className="question-option-details">
          {question.options.map((option, index) => (
            <article key={option.id} className={option.kind === "scientific" ? "scientific" : ""}>
              <span>{String.fromCharCode(65 + index)}</span>
              <div>
                <b>{option.text}</b>
                <small>{option.conception}</small>
                {explanation && <p className="option-rationale">{explanation.optionNotes[option.id]}</p>}
              </div>
              <em>{option.kind === "scientific" ? "과학적 개념" : option.kind === "partial" ? "부분 개념" : "선개념"}</em>
            </article>
          ))}
        </div>
        {explanation && <div className="question-explanation" id="question-modal-explanation">
          <span>핵심 원리</span>
          <p>{explanation.core}</p>
          <div className="correct-reasoning">
            <span>정답 근거</span>
            <h3>과학적 개념 선택지는 {String.fromCharCode(65 + scientificIndex)}입니다.</h3>
            <p>{explanation.whyCorrect}</p>
          </div>
        </div>}
      </section>
    </div>
  );
}
