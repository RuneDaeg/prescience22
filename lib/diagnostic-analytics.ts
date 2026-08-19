import { QUESTIONS } from "../app/questions";

export type AnonymousSubmission = {
  answers: Record<string, string>;
};

export type CohortAnalytics = {
  classCount: number;
  submissionCount: number;
  scientificRate: number;
  questionRates: Record<string, number>;
};

export function isFirstGradeClassName(name: string) {
  return /^1학년\s+(?:[1-9]|1[0-2])반$/.test(name.trim());
}

export function calculateCohortAnalytics(
  submissions: AnonymousSubmission[],
  classCount: number,
): CohortAnalytics {
  let scientificAnswers = 0;
  const questionRates: Record<string, number> = {};

  for (const question of QUESTIONS) {
    const scientificOption = question.options.find((option) => option.kind === "scientific");
    const scientificCount = scientificOption
      ? submissions.filter((submission) => submission.answers[question.id] === scientificOption.id).length
      : 0;

    scientificAnswers += scientificCount;
    questionRates[question.id] = submissions.length
      ? Math.round((scientificCount / submissions.length) * 100)
      : 0;
  }

  const totalAnswers = submissions.length * QUESTIONS.length;
  return {
    classCount,
    submissionCount: submissions.length,
    scientificRate: totalAnswers ? Math.round((scientificAnswers / totalAnswers) * 100) : 0,
    questionRates,
  };
}
