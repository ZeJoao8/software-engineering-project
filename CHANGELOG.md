# Changelog

All notable changes to UniLink since the Sprint 2 release are documented here.

---

## [Unreleased] — Sprint 3

### Added

#### Emergency Contact
- Added emergency contact options directly in the ride detail screen, allowing passengers to quickly access emergency services or contacts during a ride.

#### Architecture — 5-Layer Refactor
The entire codebase was restructured into a clean 5-layer architecture to eliminate business logic from the UI layer:

- **`domain/entities/`** — TypeScript types extracted from the old `types/` folder (`Ride`, `User`, `Car`, `Review`, `Report`, `Message`, `Badge`).
- **`domain/rules/`** — Pure business logic functions with no React or Firebase dependencies:
  - `rideRules.ts` — seat reservation, cancellation, completion, boarding codes, driver/passenger checks
  - `reviewRules.ts` — review validation, average rating calculation, visible feedback logic
  - `reportRules.ts` — report validation and duplicate detection
  - `rideCreateRules.ts` — ride creation validation
  - `rideCardTags.ts` — tag computation for ride cards (ratings, reports, women-only)
  - `rideFilters.ts` — ride search and filter logic
  - `myRidesFilters.ts` — filtering logic for the My Rides screen
  - `leaderboard.ts` — leaderboard ranking computation
  - `badges.ts` — badge level and progress computation (moved from `utils/`)
  - `sustainability.ts` — CO₂ savings calculation (moved from `utils/`)
  - `streaks.ts` — weekly streak computation (moved from `utils/`)
  - `validation.ts` — email, license plate, and seat count validation (moved from `utils/`)
- **`repositories/`** — Firestore-only CRUD layer (`RideRepository`, `UserRepository`, `CarRepository`, `ReviewRepository`, `ReportRepository`, `MessageRepository`). No UI or business logic.
- **`store/`** — Reactive pub/sub state management (`rideStore`, `authStore`, `reviewStore`, `reportStore`, `carStore`, `busRouteStore`, `messageStore`).
- **`services/`** — Orchestration layer returning `Result<T>` (`RideService`, `ReviewService`, `ReportService`, `ChatService`, `ProfileService`, `CarService`). Never calls `Alert`.
- **`hooks/`** — React bridge connecting stores to components (`useRides`, `useAuth`, `useReviews`, `useReports`, `useCars`, `useMessages`).
- **`infra/`** — Infrastructure consolidated: Firebase client, OSRM routing, Nominatim geocoding, Transitous transit API.
- **`utils/transitDisplay.ts`** — Transit display helpers (`modeEmoji`, `modeLabel`, `buildLegColorMap`) extracted from the bus route screen.
- **`utils/ratingStyle.ts`** — Rating colour utilities extracted from UI components.

#### Testing
- Tests fully reorganised into subdirectories: `tests/domain/`, `tests/services/`, `tests/ui/`, `tests/infra/`, `tests/utils/`.
- New test suites added: `rideRules`, `reviewRules`, `reportRules`, `rideCreateRules`, `rideCardTags`, `myRidesFilters`, `leaderboard`, `streaks`, `sustainability`, `validation`, `badges`, `rideFilters`.
- New service tests: `RideService`, `ReviewService`, `ReportService`, `ChatService`.
- New UI tests: `RideCard`, `CreateRide`, `Leaderboard`.
- New infra tests: `transit`.
- Total: **252 tests** across 21 test suites.

#### CI
- Added TypeScript type check step (`tsc --noEmit --noUnusedLocals`) to the GitHub Actions pipeline.
- Added npm dependency caching to speed up CI runs.
- Added `typecheck` script to `package.json`.

### Changed

- **My Rides screen** — Redesigned layout with improved filtering tabs and ride card display.
- **Bus Routes screen** — Improved leg detail display and map rendering; address autocomplete made more robust.
- **Ride card** — Tag system refactored: ratings, reports, and women-only badges are now computed by `rideCardTags.ts` and rendered via a `toDisplayTag` mapping, instead of inline logic.
- **Chat** — Message subscription moved to `messageStore`; `handleSend` now shows an error alert if sending fails instead of silently discarding the message.
- **UI consistency** — General style and layout refactor across multiple screens for visual consistency.
- **UML diagrams updated** — Domain model, logical architecture, and physical architecture diagrams updated to reflect the current codebase (removed Booking, University, UserBadge entities; replaced MySQL/Node.js with Firebase/Firestore; added OSRM, Nominatim, Transitous).

### Removed

- **`data/`** folder — Hardcoded mock data files (`cars.ts`, `chat.ts`, `reports.ts`, `reviews.ts`, `rides.ts`, `user.ts`) fully removed; all data now comes from Firestore.
- **`utils/rideFilters.ts`**, **`utils/streaks.ts`** — Moved to `domain/rules/`.
- Old flat test files (`tests/badges.test.js`, `tests/streaks.test.js`, `tests/dataChat.test.js`, etc.) replaced by the reorganised test suite.

### Fixed

- Fixed ride search showing rides with no rating being incorrectly filtered out.
- Fixed chat messages not appearing in correct order on first load.
