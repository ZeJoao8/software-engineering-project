# Changelog

All notable changes to UniLink since the Sprint 2 release are documented here.

---

## Sprint 3

### Added

#### Friends System
- New `Friendship` entity (`domain/entities/Friendship.ts`) with `pending` / `accepted` states.
- `FriendshipRepository` — Firestore CRUD and real-time subscription for friendships.
- `FriendService` — `sendFriendRequest`, `acceptFriendRequest`, `removeFriend` operations, each returning a `Result<T>`.
- `store/friends.ts` — reactive store that syncs friendships for the current user in real time.
- `hooks/useFriends.ts` — React bridge exposing friendship state and helper selectors to components.
- **Find Friends screen** (`/findFriends`) — search all users by name and send / accept / decline requests from a single screen.
- **Profile screen** — shows pending incoming requests with Accept / Decline actions, and a list of accepted friends (sorted alphabetically, displayed as green navigable links). A tab-bar badge on **Profile** shows the count of pending incoming requests.
- **Ride search** — new "Friends only" toggle filters results to rides driven by accepted friends.
- **Ride card** — new `👥 Friends only` tag shown on rides restricted to friends.
- Firestore security rules for the `friendships` collection: only the sender can create, only the receiver can accept, and either side can delete.

#### Notifications
- New `Notification` entity (`domain/entities/Notification.ts`) with types: `ride_join`, `ride_cancel`, `passenger_removed`, `ride_completed`, `ride_cancelled`, `chat_message`, `friend_request`, `friend_accepted`, `passenger_review`.
- `NotificationRepository` — Firestore reads/writes; subscribes only to unread notifications for the current user.
- `NotificationService` — `createNotification` and `markNotificationAsRead` / `markAllNotificationsAsRead`.
- `store/notifications.ts` — reactive store of unread notifications; exposes `getNotificationsForRide` and `getRideNotificationsCount` helpers.
- `hooks/useNotifications.ts` — React bridge with `notifications`, `markAsRead`, and `markAllAsRead`.
- `utils/notificationRoute.ts` — maps a notification type to an in-app route without storing router paths in Firestore.
- **NotificationBell** component — bell icon in the header; opens a modal panel listing unread notifications with icon, title, body, and relative timestamp. Tapping a notification marks it as read and navigates to the relevant screen. Includes a **Clear All** button to dismiss all at once.
- **Ride notifications**: driver receives `ride_join` when a passenger reserves a seat and `ride_cancel` when they cancel; passengers receive `ride_completed` or `ride_cancelled` when the driver acts; a removed passenger receives `passenger_removed`.
- **Chat notifications**: other participants receive `chat_message` when a new message is sent; opening the chat screen automatically marks those notifications as read.
- **Friend request notifications**: sending a request creates a `friend_request` notification for the receiver; accepting creates a `friend_accepted` notification for the original sender. Both route to the Profile screen.
- **Review notification**: the driver receives a `passenger_review` notification when a passenger submits a rating, indicating the score and whether written feedback was included.
- **My Rides tab badge** — shows the count of unread ride-related notifications.
- **Ride card notification badges** — ride cards in My Rides display deduplicated badges per category (`👤+` new passenger, `👤−` cancellation or removal, `💬` chat message, `⭐` review, `✅` completed, `🚫` cancelled). Each badge is tappable and shows a tooltip description. A **"🔔 Has notification"** filter lets drivers and passengers show only rides with unread activity.
- **Auto-mark-read on ride detail open** — opening a ride's detail screen automatically marks `ride_join`, `ride_cancel`, `passenger_removed`, and `passenger_review` notifications for that ride as read, mirroring the chat screen behaviour for `chat_message`.

#### Driver Preferences
- New `DriverPreferences` entity (`domain/entities/DriverPreferences.ts`) with fields: `noSmoking`, `acceptLuggage`, `acceptPets`, `passengerMusic`, and sensible defaults.
- `User` entity updated with optional `driverPreferences` field.
- **Driver Preferences screen** (`/user/driverPreferences`) — allows drivers to toggle ride preferences via a grouped switch list (sections: PASSENGERS, TRIP). Accessible from the Profile screen via a new "Manage preferences" button. Saves through `ProfileService`.

#### Emergency / Safety Contacts
- `emergencyContacts` array (`{ name, phone }[]`) added to the `User` entity.
- **Profile screen** — new Safety Contacts section with an inline form to add contacts (name + phone) and remove existing ones. Changes are saved as part of the regular profile save flow.
- **Ride detail screen** — replaced the `expo-contacts` native picker and `Alert`-based flow with a bottom-sheet `Modal` that lists the user's saved safety contacts and "Call 112". If no contacts are saved, a link redirects the user to the profile to add them.

#### Architecture — 5-Layer Refactor
The entire codebase was restructured into a clean 5-layer architecture to eliminate business logic from the UI layer:

- **`domain/entities/`** — TypeScript types extracted from the old `types/` folder (`Ride`, `User`, `Car`, `Review`, `Report`, `Message`, `Badge`, `Friendship`, `Notification`).
- **`domain/rules/`** — Pure business logic functions with no React or Firebase dependencies:
  - `rideRules.ts` — seat reservation, cancellation, completion, boarding codes, driver/passenger checks
  - `reviewRules.ts` — review validation, average rating calculation, visible feedback logic
  - `reportRules.ts` — report validation and duplicate detection
  - `rideCreateRules.ts` — ride creation validation
  - `rideCardTags.ts` — tag computation for ride cards (ratings, reports, women-only, friends-only)
  - `rideFilters.ts` — ride search and filter logic (including friends-only)
  - `myRidesFilters.ts` — filtering logic for the My Rides screen (including has-notification)
  - `leaderboard.ts` — leaderboard ranking computation
  - `badges.ts` — badge level and progress computation (moved from `utils/`)
  - `sustainability.ts` — CO₂ savings calculation (moved from `utils/`)
  - `streaks.ts` — weekly streak computation (moved from `utils/`)
  - `validation.ts` — email, license plate, and seat count validation (moved from `utils/`)
- **`repositories/`** — Firestore-only CRUD layer (`RideRepository`, `UserRepository`, `CarRepository`, `ReviewRepository`, `ReportRepository`, `MessageRepository`, `NotificationRepository`, `FriendshipRepository`). No UI or business logic.
- **`store/`** — Reactive pub/sub state management (`rideStore`, `authStore`, `reviewStore`, `reportStore`, `carStore`, `busRouteStore`, `messageStore`, `notificationsStore`, `friendsStore`).
- **`services/`** — Orchestration layer returning `Result<T>` (`RideService`, `ReviewService`, `ReportService`, `ChatService`, `ProfileService`, `CarService`, `NotificationService`, `FriendService`). Never calls `Alert`.
- **`hooks/`** — React bridge connecting stores to components (`useRides`, `useAuth`, `useReviews`, `useReports`, `useCars`, `useMessages`, `useNotifications`, `useFriends`).
- **`infra/`** — Infrastructure consolidated: Firebase client, OSRM routing, Nominatim geocoding, Transitous transit API.
- **`utils/transitDisplay.ts`** — Transit display helpers (`modeEmoji`, `modeLabel`, `buildLegColorMap`) extracted from the bus route screen.
- **`utils/ratingStyle.ts`** — Rating colour utilities extracted from UI components.

#### Testing
- Tests fully reorganised into subdirectories: `tests/domain/`, `tests/services/`, `tests/ui/`, `tests/infra/`, `tests/utils/`.
- New test suites added: `rideRules`, `reviewRules`, `reportRules`, `rideCreateRules`, `rideCardTags`, `myRidesFilters`, `leaderboard`, `streaks`, `sustainability`, `validation`, `badges`, `rideFilters`, `notificationRoute`.
- New service tests: `RideService`, `ReviewService`, `ReportService`, `ChatService`.
- New UI tests: `RideCard`, `CreateRide`, `Leaderboard`.
- New infra tests: `transit`.
- Total: **252 tests** across 21 test suites.

#### CI
- Added TypeScript type check step (`tsc --noEmit --noUnusedLocals`) to the GitHub Actions pipeline.
- Added npm dependency caching to speed up CI runs.
- Added `typecheck` script to `package.json`.

---

### Changed

- **My Rides screen** — Redesigned layout with status filter (All / Active / Completed), extra filters (Women only, Has feedback, Has report, Has notification), and rating range filter. Ride cards in both Driver and Passenger sections now receive and display their unread notification badges.
- **Bus Routes screen** — Improved leg detail display and map rendering; address autocomplete made more robust.
- **Ride card** — Tag system refactored: ratings, reports, women-only, and friends-only badges computed by `rideCardTags.ts` and rendered via a `toDisplayTag` mapping. Notification badges added as a separate, deduplicated row at the top of the card, each tappable with a tooltip.
- **Chat** — Message subscription moved to `messageStore`; `handleSend` now shows an error alert if sending fails instead of silently discarding the message.
- **Profile screen — Friends section** — Accepted friends displayed in the app's primary green link style, sorted alphabetically. Senders in pending requests also appear as green links navigating to their public profile.
- **UI consistency** — General style and layout refactor across multiple screens for visual consistency.
- **UML diagrams updated** — Domain model, logical architecture, and physical architecture diagrams updated to reflect the current codebase (removed Booking, University, UserBadge entities; replaced MySQL/Node.js with Firebase/Firestore; added OSRM, Nominatim, Transitous, Friends, Notifications).
- **Mockups updated** — All screens redesigned as SVG mockups reflecting the current UI.

---

### Removed

- **`data/`** folder — Hardcoded mock data files (`cars.ts`, `chat.ts`, `reports.ts`, `reviews.ts`, `rides.ts`, `user.ts`) fully removed; all data now comes from Firestore.
- **`utils/rideFilters.ts`**, **`utils/streaks.ts`** — Moved to `domain/rules/`.
- Old flat test files (`tests/badges.test.js`, `tests/streaks.test.js`, `tests/dataChat.test.js`, etc.) replaced by the reorganised test suite.

---

### Fixed

- **Ride search** — Fixed rides with no rating being incorrectly excluded from search results.
- **Chat ordering** — Fixed chat messages not appearing in the correct order on first load.
- **Chat messages missing after passenger rejoin** — When a passenger left a ride, Firestore terminated the `onSnapshot` chat subscription with a permission error. The message store's error handler now resets its internal state, so `syncMessagesForRide` re-establishes a fresh subscription the next time the user opens the chat. Previously, own messages sent after rejoining appeared on other participants' screens but not the sender's.
- **Firebase permission error on ride cancellation** — `cancelSeat` and `cancelRide` now call `stopMessagesSync()` before navigating away, cleanly closing the chat subscription before Firestore revokes access, preventing the "Missing or insufficient permissions" error from appearing in the log.
- **Verified passenger status not reset on cancellation** — `cancelSeat` was removing the passenger from `passengers` and `passengerCodes` but not from `verifiedPassengers`. A passenger who left and rejoined would appear as already verified without presenting their new boarding code. The field is now cleared on cancellation, consistent with the existing behaviour in `removePassenger`.
- **Firestore rule blocking seat cancellation after verification** — The `canLeaveRide` security rule used `passengerFieldsOnly()`, which only allowed changes to `passengers`, `availableSeats`, and `passengerCodes`. After the fix above, `cancelSeat` also writes `verifiedPassengers`, so the rule was rejecting the update. A dedicated `leaveFieldsOnly()` function now permits `verifiedPassengers` in leave updates while `joinFieldsOnly()` keeps join updates restricted to the original three fields.
