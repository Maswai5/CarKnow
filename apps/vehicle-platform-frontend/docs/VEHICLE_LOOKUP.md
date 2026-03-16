# Vehicle Lookup — Overview & Learning Guide 🔎

This document explains how the Vehicle Lookup feature works and gives tips to help you learn and extend it.

---

## Files involved

- `src/pages/VehicleLookup.tsx` — UI component with a text input and a Lookup button.
- `src/hooks/useVehicleLookup.ts` — Encapsulates the lookup logic: manages loading, error, and report state and calls the API.
- `src/lib/api.ts` — Axios wrapper used to call backend endpoints.
- `src/__tests__/VehicleLookup.test.tsx` — Unit tests that mock `api.get` and assert expected UI behavior.

---

## What the code does (step-by-step) ✅

1. User types a VIN or plate into the input in `VehicleLookup` and clicks **Lookup**.
2. Component calls `lookup(identifier)` from the `useVehicleLookup` hook.
3. `useVehicleLookup.lookup`:
   - sets `loading = true`, `error = null`, `report = null` to reset UI,
   - calls `api.get(`/reports/public/${encodeURIComponent(identifier)}`),`
   - on success sets `report = res.data.report` (the object returned by backend),
   - on failure sets `error` to the backend message (or error.message / 'Lookup failed'),
   - always sets `loading = false` in `finally`.
4. Back in the component, UI updates to show a loading state, an error, or the returned report (both a summary and a pretty-printed JSON block).

> Note: The button is disabled when `loading` or when the input is empty to avoid duplicate requests or invalid lookups.

---

## API contract 🔧

- Endpoint used: `GET /api/reports/public/:identifier` (where `:identifier` is a VIN or plate, URL-encoded).
- Successful response shape expected by the hook: `{ data: { report: { vin, make, model, year, plate, ... } } }`.
- Error handling: `useVehicleLookup` expects the server error to be in `err.response.data.error` but will fall back to `err.message` or `Lookup failed`.

---

## Tests — how they work 📚

- Tests import `VehicleLookup` and *mock* `api.get`. This isolates the UI+hook from network and backend state.
- Render helper `renderWithProviders` includes a `QueryClientProvider` and `MemoryRouter` so the component has necessary providers (even if this feature doesn't use React Query directly, the test suite provides a full environment for consistency).
- Tests assert:
  - a successful mocked `api.get` causes the UI to render the report (contains `Toyota` and VIN in the test example),
  - a rejected `api.get` causes an error message to appear.

---

## Quick ways to learn and experiment 💡

- Run tests: `cd apps/vehicle-platform-frontend && npm test` (or `npm run test:watch` for live feedback).
- Add `console.log` statements in `useVehicleLookup.lookup` to observe returned values while running the app in development.
- Use React DevTools to inspect component state (`loading`, `report`, `error`) in the browser.
- Use MSW (Mock Service Worker) for richer integration-style testing that mocks network responses at the network layer instead of mocking `api.get` directly.

---

## Suggested improvements / exercises (good learning tasks) 🎯

- Add validation: prevent lookup for bad VIN/plate formats and show a friendly message.
- Debounce input or allow pressing Enter in addition to clicking the button.
- Add explicit unit tests for these edge-cases:
  - empty input (button disabled),
  - slow network (simulate delay + loading UI),
  - server returns a 404 with custom message,
  - malformed server response.
- Convert `useVehicleLookup` to use React Query if you want automatic caching/retries and better testing patterns.

---

## Troubleshooting tips ⚠️

- If the report never appears: check the network tab and the value passed to the endpoint (encoding issues), and verify backend endpoint path.
- If tests fail: ensure `api.get` is mocked/reset (`vi.mock` and `mockReset` are used in the tests).

---

If you'd like, I can:
- add inline documentation comments in the source files, or
- add unit tests for the suggested edge cases, or
- show a live debugging session to step through one request.

Which of those would help you learn best? 📘