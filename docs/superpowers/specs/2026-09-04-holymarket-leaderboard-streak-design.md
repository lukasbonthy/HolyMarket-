# HolyMarket V13 Leaderboard, Streak, and Typography Design

## Goal
Add trusted Bible-answer streaks, a public Polymarket-style leaderboard, a short-lived highest-streak announcement, and a denser premium type system without changing HolyMarket into real-money betting.

## Typography
- Load **Inter Tight** from Google Fonts with `font-display: swap` and keep the existing system-font fallbacks.
- Use Inter Tight as the site UI family, with tabular numerals for probabilities, balances, ranks, streaks, and percentages.
- Preserve existing measured layout geometry unless a text-overflow fix is required.

## Trusted correctness and streak state
- The server owns the resolving outcome index for every HolyMarket question in `server/resolutions.mjs`.
- A client may submit only `marketId`, `outcomeIndex`, side, and stake. It may not submit `correct`, streak values, or leaderboard statistics.
- When a prediction is locked, the server resolves whether the chosen outcome is correct and stores `correct` on the prediction.
- Every user has a normalized `streak` object:
  - `current`: consecutive correct resolved predictions.
  - `best`: highest consecutive-correct streak ever reached.
  - `correct`: total correct resolved predictions.
  - `resolved`: total predictions for which HolyMarket has a server resolution.
  - `updatedAt`: timestamp of the last resolved prediction.
- Correct answer: increment `current`, `correct`, and `resolved`; update `best` if needed.
- Wrong answer: set `current` to 0 and increment `resolved`.
- Unknown/unresolved market: store `correct: null` and do not change streak statistics.

## Leaderboard API
- Add public `GET /api/leaderboard?limit=N`.
- Return ranked public-only fields: rank, username, avatar, current streak, best streak, correct answers, resolved answers, prediction count, accuracy, and Talents.
- Default ranking: best streak descending, then current streak, accuracy, resolved count, username.
- Never expose email, oath signed name, password hashes, integrity events, or session data.
- Include `highestStreak` with the current leader's name and best streak.

## Leaderboard UI
- Add `#/leaderboard` as a first-class app route.
- Add a top navigation link, account-menu link, and footer link.
- Page structure follows the current Polymarket leaderboard hierarchy: title, compact mode/filter controls, search box, top-three highlight, then dense ranked rows.
- HolyMarket columns: Rank, User, Streak, Current, Accuracy, Predictions.
- Search filters the loaded rankings client-side by username.
- Logged-in user's row gets a restrained blue highlight.

## Highest-streak announcement
- On initial app restore, fetch leaderboard once and show a bottom-center floating banner for about 4 seconds: `"{name} has the highest streak of: {streak} 🔥"` when a leader exists.
- Do not repeatedly show the same announcement on every render. Store the last announced leader/streak in `sessionStorage`.
- After a successful prediction, refresh the leaderboard. If the highest-streak record changes, show the new announcement immediately.
- Reduced-motion users get a simple fade instead of slide/spring motion.

## Profile and prediction feedback
- Profile statistics add Current Streak, Best Streak, and Accuracy.
- Recent prediction rows may show a small correct/wrong marker only after the prediction has been locked.
- Existing correct/wrong answer animation remains; streak state is sourced from the server response.

## Compatibility
- Existing users without streak fields are normalized safely to zeroed streak state.
- Existing predictions without `correct` remain valid and are not retroactively guessed during normalization.
- JSON storage remains the prototype persistence layer, with the same Render-ephemeral limitation already documented.

## Testing
- Unit-test resolution lookup and streak transitions.
- Repository test proves legacy users normalize with streak state.
- API integration test proves the client cannot forge streaks and leaderboard sorting/public fields are correct.
- Frontend regression test verifies route, leaderboard markup, font wiring, profile streak stats, and announcement copy.
- Chromium smoke test signs up users, makes correct/wrong predictions, verifies streak increments/resets, opens leaderboard, verifies ranking, and confirms the bottom announcement appears and then dismisses.
