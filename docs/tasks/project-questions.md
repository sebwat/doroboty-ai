# Project questions with an explanation for the recruiter (P2)

## Intent and scope

Participant discovery (AIPH3, Supersprint 2026-11) selected the need: a recruiter without AI experience cannot tell whether a candidate personally delivered the AI project described in the application, or whether the candidate has the right skills. Since June 2026 the text-based score no longer separates candidates who pass the first interview (30.2% vs 29.8%). Selected idea P2: the portal asks the candidate three written questions about the project from the application and shows the recruiter the answers with a plain-language explanation and follow-up questions, without an invite/reject verdict.

Scope: employer application detail (`/#/app/kandydaci/:id`), candidate application detail (`/#/app/aplikacje/:id`) and both application lists. Preserve stage transitions, ownership checks, immutable submitted snapshots, import/export/reset and existing journeys.

## Behavior

1. The employer opens a candidate and the new “Pytania o projekt” tab. It shows three prepared questions about the candidate's project and a “Wyślij pytania kandydatowi” action (not available in terminal stages).
2. The candidate sees the questions in their own application, answers each in writing (minimum 120 characters, maximum 1500) and sends all three at once. The answers are then immutable.
3. The employer sees, per question: the question, what it checks, the full answer, a quote from the answer, a simple rule-based signal (numbers / own actions) and “O co dopytać”. There is no invite/reject recommendation. The decision stays with the existing stage buttons and note.
4. The candidate sees the same explanation as the employer.
5. Both lists show the question status.

## Simulation boundaries

- Questions, “what it checks” and follow-up prompts are prepared per persona (Anna, Marek) with a generic fallback. No model or provider call.
- The signal is a transparent text rule (contains a number; contains a first-person past-tense verb), labelled as a prototype rule, not an AI assessment. The quote is a sentence from the actual answer chosen by the same rule.
- Nothing here establishes model quality, hiring probability or effect on repurchase.

## Data

Optional `projectQuestions` on an application (version 1 stays compatible; older saves and imports without the field remain valid): `sentAt`, optional `answeredAt`, three items with `question`, `checks`, `followUp`, `answer`. Actions: `send_project_questions` (employer of the owning company, nonterminal stage, not yet sent) and `answer_project_questions` (owning candidate, sent and unanswered, nonterminal, three valid answers).

## Acceptance criteria

- The full path employer send → candidate answer → employer reads explanation → existing stage change works and survives reload.
- Validation messages for short answers; keyboard-reachable tabs and controls; layout wraps at 390/320px.
- Unit tests for both transitions and rule; `./scripts/verify` runs; FEATURES.md updated.
