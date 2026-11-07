// Prepared scenario questions (P2). No model call: questions, checks and follow-ups are fixed
// per persona; the answer signal is a transparent text rule shown as such in the UI.
export const PROJECT_ANSWER_MIN = 120;
export const PROJECT_ANSWER_MAX = 1500;

export type PreparedQuestion = { question: string; checks: string; followUp: string };

const prepared: Record<string, PreparedQuestion[]> = {
  "candidate-marek": [
    {
      question:
        "W aplikacji piszesz o automatyzacji obsługi zgłoszeń. Które decyzje w tym projekcie podjąłeś sam, a które zespół?",
      checks: "Czy kandydat oddziela własny zakres od pracy zespołu.",
      followUp: "Poproś o jedną decyzję, z której kandydat musiał się potem wycofać, i dlaczego.",
    },
    {
      question:
        "Skąd wiesz, że czas odpowiedzi skrócił się o 25%? Jak to mierzyliście i z czym porównywaliście?",
      checks: "Czy wynik ma źródło i punkt odniesienia, a nie tylko liczbę.",
      followUp: "Zapytaj, jak długo utrzymał się efekt i kto pilnował pomiaru po wdrożeniu.",
    },
    {
      question: "Co w tej automatyzacji nie zadziałało za pierwszym razem i co zmieniliście?",
      checks:
        "Czy kandydat zna szczegóły wykonania, które zna tylko osoba pracująca przy projekcie.",
      followUp: "Poproś o przykład zgłoszenia, które automatyzacja obsłużyła źle.",
    },
  ],
  "candidate-anna": [
    {
      question:
        "Piszesz o wdrożeniu asystenta do zgłoszeń. Za którą część tego wdrożenia odpowiadałaś osobiście?",
      checks: "Czy kandydatka oddziela własny zakres od pracy zespołu.",
      followUp: "Poproś o decyzję, przy której musiała przekonać zespół albo przełożonego.",
    },
    {
      question:
        "Jak sprawdziliście, że czas obsługi skrócił się o 30%? Co było punktem odniesienia?",
      checks: "Czy wynik ma źródło i punkt odniesienia, a nie tylko liczbę.",
      followUp: "Zapytaj, czy asystent pogorszył coś innego, np. jakość odpowiedzi.",
    },
    {
      question:
        "Co z badań z 18 użytkownikami zmieniło sposób działania asystenta? Podaj jeden przykład.",
      checks: "Czy kandydatka łączy badania z konkretną zmianą w produkcie.",
      followUp: "Poproś o pomysł z badań, którego nie wdrożyli, i powód.",
    },
  ],
};

const generic: PreparedQuestion[] = [
  {
    question: "Opisz projekt z aplikacji: które decyzje podjąłeś(-ęłaś) sam(a), a które zespół?",
    checks: "Czy kandydat oddziela własny zakres od pracy zespołu.",
    followUp: "Poproś o jedną decyzję, z której kandydat musiał się wycofać.",
  },
  {
    question:
      "Jak sprawdziłeś(-aś), że projekt zadziałał? Co mierzyliście i z czym porównywaliście?",
    checks: "Czy wynik ma źródło i punkt odniesienia.",
    followUp: "Zapytaj, kto pilnował pomiaru po wdrożeniu.",
  },
  {
    question: "Co nie zadziałało za pierwszym razem i co zmieniliście?",
    checks: "Czy kandydat zna szczegóły wykonania.",
    followUp: "Poproś o przykład przypadku, który rozwiązanie obsłużyło źle.",
  },
];

export function preparedQuestions(candidateId: string): PreparedQuestion[] {
  return prepared[candidateId] ?? generic;
}

export type AnswerSignal = {
  level: "concrete" | "partial" | "general";
  label: string;
  hasNumber: boolean;
  hasOwnAction: boolean;
  quote: string;
};

const numberPattern = /\d/;
// Polish first-person past tense ("zrobiłem", "wybrałam") as a proxy for the candidate's own actions.
const ownActionPattern = /\p{L}+(łem|łam)(?!\p{L})/iu;

export function readAnswer(answer: string): AnswerSignal {
  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const hasNumber = numberPattern.test(answer);
  const hasOwnAction = ownActionPattern.test(answer);
  const quote =
    sentences.find((s) => numberPattern.test(s) && ownActionPattern.test(s)) ??
    sentences.find((s) => numberPattern.test(s)) ??
    sentences.find((s) => ownActionPattern.test(s)) ??
    sentences[0] ??
    "";
  const level =
    hasNumber && hasOwnAction ? "concrete" : hasNumber || hasOwnAction ? "partial" : "general";
  const label = {
    concrete: "Konkretna: liczby i własne działania",
    partial: hasNumber
      ? "Częściowo konkretna: są liczby, brak własnych działań"
      : "Częściowo konkretna: są własne działania, brak liczb",
    general: "Ogólna: brak liczb i własnych działań",
  }[level];
  return { level, label, hasNumber, hasOwnAction, quote };
}
