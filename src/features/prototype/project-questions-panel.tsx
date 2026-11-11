import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Application } from "./model";
import {
  PROJECT_ANSWER_MAX,
  PROJECT_ANSWER_MIN,
  preparedQuestions,
  readAnswer,
} from "./project-questions";
import { usePrototype } from "./store";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" });
const terminal = (stage: Application["stage"]) =>
  ["hired", "rejected", "withdrawn"].includes(stage);

export function projectQuestionsStatus(application: Application) {
  const questions = application.projectQuestions;
  if (!questions) return null;
  return questions.answeredAt
    ? "Pytania o projekt: odpowiedzi gotowe"
    : "Pytania o projekt: wysłane";
}

function SimulationNote() {
  return (
    <p className="record-caption project-simulation">
      Prototyp: pytania i „O co dopytać” są przygotowane dla scenariusza. Sygnał i cytat wybiera
      prosta reguła tekstowa (liczby, czasowniki w 1. osobie), nie model AI. To wsparcie, nie
      rekomendacja zaproszenia.
    </p>
  );
}

function Explanation({ application }: { application: Application }) {
  const questions = application.projectQuestions!;
  return (
    <>
      <ol className="project-questions">
        {questions.items.map((item, index) => {
          const signal = readAnswer(item.answer);
          return (
            <li key={index} className="project-question">
              <p className="project-question-label">Pytanie {index + 1}</p>
              <h4>{item.question}</h4>
              <details className="project-answer">
                <summary>Pełna odpowiedź kandydata</summary>
                <p>{item.answer}</p>
              </details>
              <dl className="project-explanation">
                <div>
                  <dt>Co sprawdza pytanie</dt>
                  <dd>{item.checks}</dd>
                </div>
                <div>
                  <dt>Co pokazuje odpowiedź</dt>
                  <dd>
                    <span className="project-signal" data-level={signal.level}>
                      {signal.label}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Fragment odpowiedzi</dt>
                  <dd>
                    <blockquote>„{signal.quote}”</blockquote>
                  </dd>
                </div>
                <div>
                  <dt>O co dopytać na rozmowie</dt>
                  <dd>{item.followUp}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>
      <SimulationNote />
    </>
  );
}

export function EmployerProjectQuestions({ application }: { application: Application }) {
  const { run } = usePrototype();
  const [announcement, setAnnouncement] = useState("");
  const questions = application.projectQuestions;
  return (
    <div className="project-panel">
      <h3>Pytania o projekt</h3>
      {!questions ? (
        <>
          <p>
            Trzy pytania o projekt z aplikacji kandydata, takie jak zadałby manager techniczny.
            Kandydat odpowie pisemnie, w swoim czasie. Zobaczysz odpowiedzi z wyjaśnieniem i
            propozycją, o co dopytać.
          </p>
          <ol className="project-questions">
            {preparedQuestions(application.candidateId).map((q, index) => (
              <li key={index} className="project-question">
                <p className="project-question-label">Pytanie {index + 1}</p>
                <h4>{q.question}</h4>
              </li>
            ))}
          </ol>
          {terminal(application.stage) ? (
            <p className="record-caption">Proces jest zakończony, pytań nie można wysłać.</p>
          ) : (
            <div className="record-actions">
              <Button
                onClick={() => {
                  if (run({ type: "send_project_questions", applicationId: application.id }))
                    setAnnouncement("Wysłano pytania o projekt do kandydata.");
                }}
              >
                Wyślij pytania kandydatowi
              </Button>
            </div>
          )}
        </>
      ) : !questions.answeredAt ? (
        <>
          <p className="project-status">
            Czekamy na odpowiedź kandydata. Wysłano{" "}
            <time dateTime={questions.sentAt}>{dateFormat.format(new Date(questions.sentAt))}</time>
            .
          </p>
          <ol className="project-questions">
            {questions.items.map((q, index) => (
              <li key={index} className="project-question">
                <p className="project-question-label">Pytanie {index + 1}</p>
                <h4>{q.question}</h4>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <>
          <p className="project-status">
            Odpowiedzi z{" "}
            <time dateTime={questions.answeredAt}>
              {dateFormat.format(new Date(questions.answeredAt))}
            </time>
            . Decyzję o zaproszeniu podejmujesz Ty, przyciskami etapów poniżej.
          </p>
          <Explanation application={application} />
        </>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export function CandidateProjectQuestions({ application }: { application: Application }) {
  const { run, error } = usePrototype();
  const questions = application.projectQuestions!;
  const [answers, setAnswers] = useState(() => questions.items.map((x) => x.answer));
  const [attempted, setAttempted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  if (questions.answeredAt)
    return (
      <div className="project-panel">
        <h3>Pytania o projekt</h3>
        <p className="project-status">
          Odpowiedzi wysłane. Pracodawca widzi je z tym samym wyjaśnieniem co poniżej.
        </p>
        <Explanation application={application} />
      </div>
    );
  const closed = terminal(application.stage);
  const tooShort = answers.map((x) => x.trim().length < PROJECT_ANSWER_MIN);
  return (
    <form
      className="project-panel"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (tooShort.some(Boolean)) {
          document.getElementById(`project-answer-${tooShort.indexOf(true)}`)?.focus();
          return;
        }
        if (run({ type: "answer_project_questions", applicationId: application.id, answers }))
          setAnnouncement("Wysłano odpowiedzi na pytania o projekt.");
      }}
    >
      <h3>Pytania o projekt</h3>
      <p>
        Pracodawca prosi o odpowiedź na trzy pytania o projekt z Twojej aplikacji. Odpowiadaj
        pisemnie, w swoim czasie, i popraw tekst przed wysłaniem. Po wysłaniu zobaczysz to samo
        wyjaśnienie co pracodawca.
      </p>
      <ol className="project-questions">
        {questions.items.map((item, index) => {
          const length = answers[index].trim().length;
          const invalid = attempted && tooShort[index];
          return (
            <li key={index} className="project-question">
              <p className="project-question-label">Pytanie {index + 1}</p>
              <h4>
                <label htmlFor={`project-answer-${index}`}>{item.question}</label>
              </h4>
              <Textarea
                id={`project-answer-${index}`}
                rows={5}
                maxLength={PROJECT_ANSWER_MAX}
                disabled={closed}
                aria-invalid={invalid || undefined}
                aria-describedby={`project-count-${index}`}
                value={answers[index]}
                onChange={(event) =>
                  setAnswers((current) =>
                    current.map((value, i) => (i === index ? event.target.value : value)),
                  )
                }
              />
              <p
                id={`project-count-${index}`}
                className={invalid ? "project-count project-count-error" : "project-count"}
              >
                {invalid
                  ? `Za mało szczegółów: ${length}/${PROJECT_ANSWER_MIN} znaków. Dopisz, co zrobiłeś(-aś) sam(a) i jaki był wynik.`
                  : `${length} znaków · minimum ${PROJECT_ANSWER_MIN}`}
              </p>
            </li>
          );
        })}
      </ol>
      {closed ? (
        <p className="record-caption">Proces jest zakończony, odpowiedzi nie można wysłać.</p>
      ) : (
        <div className="record-actions">
          <Button type="submit">Wyślij odpowiedzi</Button>
        </div>
      )}
      {error && <p className="project-count-error">{error}</p>}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </form>
  );
}
