# Release smoke check

Run right after publishing a version, on the published address, in a private browser window (an empty localStorage). It takes about five minutes and uses only the synthetic personas.

## Before publishing

- Note the commit being published and the previous published commit (the rollback target). How publishing and rollback work: [release.md](release.md).
- `npm ci` and `./scripts/verify` pass for that commit (locally or in CI).

## Check

1. The address opens over HTTPS and shows the homepage without errors in the browser console.
2. `/#/oferty` lists offers; one offer opens from the list.
3. Sign in as Karolina Wiśniewska → Kandydaci → Marek Nowak → “Pytania o projekt” → send the questions.
4. Sign in as Marek Nowak → Moje aplikacje shows “Pracodawca prosi o odpowiedź” → answer all three questions (a too-short answer is rejected first) → send.
5. Sign in as Karolina → the candidate shows “odpowiedzi gotowe”; the explanation shows a quote and “O co dopytać” → move the stage to “Zaproszenie na rozmowę” with a note.
6. Reload: the stage and the note remain.
7. Repeat steps 1 and 3 at a phone width (about 390px): no horizontal scrolling, all three tabs visible.

## Rollback condition

Any failed step above, a blank page or the “Coś poszło nie tak” screen on a normal path: roll back to the previous version ([release.md](release.md#rollback)), repeat this check on it and record what failed. The app keeps data only in each visitor's browser, so a rollback changes no stored data; saves stay compatible because new fields are optional.
