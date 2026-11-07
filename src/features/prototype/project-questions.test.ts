import { describe, expect, it } from "vitest";
import { initialState, stateSchema, transition, type State } from "./model";
import { readAnswer } from "./project-questions";

const sent = "2026-11-03T10:00:00.000Z";
const answered = "2026-11-04T10:00:00.000Z";
const app = "application-example";
const as = (state: State, id: string) => transition(state, { type: "select_person", id });
const longAnswer = (n: number) =>
  `Sam zdecydowałem o zakresie pierwszego etapu ${n}. `.padEnd(130, "x") + ".";

function withQuestions() {
  return transition(
    as(initialState(), "employer-brightlabs"),
    { type: "send_project_questions", applicationId: app },
    sent,
  );
}

describe("project questions", () => {
  it("lets the owning employer send prepared questions once", () => {
    const s = withQuestions();
    const questions = s.applications[0].projectQuestions!;
    expect(questions.sentAt).toBe(sent);
    expect(questions.items).toHaveLength(3);
    expect(questions.items[0].question).toContain("automatyzacji obsługi zgłoszeń");
    expect(() =>
      transition(s, { type: "send_project_questions", applicationId: app }, sent),
    ).toThrow("nie można już wysłać");
    expect(() =>
      transition(
        as(initialState(), "employer-northstar"),
        { type: "send_project_questions", applicationId: app },
        sent,
      ),
    ).toThrow("Nie znaleziono aplikacji");
  });

  it("accepts three sufficiently long answers from the owning candidate only", () => {
    const s = as(withQuestions(), "candidate-marek");
    const short = { type: "answer_project_questions" as const, applicationId: app };
    expect(() => transition(s, { ...short, answers: ["krótko", "krótko", "krótko"] })).toThrow(
      "od 120",
    );
    expect(() =>
      transition(as(s, "candidate-anna"), { ...short, answers: [1, 2, 3].map(longAnswer) }),
    ).toThrow("Nie znaleziono pytań");
    const done = transition(s, { ...short, answers: [1, 2, 3].map(longAnswer) }, answered);
    const questions = done.applications[0].projectQuestions!;
    expect(questions.answeredAt).toBe(answered);
    expect(questions.items[2].answer).toContain("etapu 3");
    expect(() => transition(done, { ...short, answers: [4, 5, 6].map(longAnswer) })).toThrow(
      "nie można już wysłać",
    );
    expect(stateSchema.parse(JSON.parse(JSON.stringify(done)))).toEqual(done);
  });

  it("keeps older saves without project questions valid", () => {
    const s = initialState();
    expect(s.applications[0].projectQuestions).toBeUndefined();
    expect(stateSchema.safeParse(JSON.parse(JSON.stringify(s))).success).toBe(true);
  });

  it("labels the rule-based signal and quotes the most concrete sentence", () => {
    const concrete = readAnswer(
      "Pracowałem w zespole. Porównałem medianę z 6 tygodni przed i po wdrożeniu.",
    );
    expect(concrete.level).toBe("concrete");
    expect(concrete.quote).toBe("Porównałem medianę z 6 tygodni przed i po wdrożeniu.");
    expect(readAnswer("Zmieniłam reguły przypisywania.").level).toBe("partial");
    expect(readAnswer("Zespół poprawił wynik o 20%.").label).toContain("są liczby");
    expect(readAnswer("To był ciekawy projekt dla całej firmy.").level).toBe("general");
  });
});
