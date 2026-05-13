# UniLink — Codebase Reference

React Native / Expo Router app for university carpooling. Firebase backend (Firestore + Auth).

## Project Structure

```
app/                    # Expo Router screens
  _layout.tsx           # Root layout
  login.tsx             # Auth screen (login + register)
  createRide.tsx        # Create ride form
  (tabs)/               # Tab bar screens
    searchRide.tsx      # Ride search + filters
    myRides.tsx         # Driver & passenger ride lists
    leaderboard.tsx     # Sustainability leaderboard
    userProfile.tsx     # Own profile, cars, badges
  mapView.tsx           # Map with ride markers (pushed from searchRide)
  ride/[id].tsx         # Ride detail (passengers, actions, safety)
  user/[id].tsx         # Public user profile
  review/[id].tsx       # Driver rating form
  chat/[id].tsx         # Ride group chat
  reportUser/[id].tsx   # Report a user
  busRoute/index.tsx    # Bus route detail view
components/             # Reusable components
  Button.tsx            # Primary/outline button wrapper
  rideCard.tsx          # Ride card for lists
  AddressAutocomplete.tsx
  LocationPickerMap.tsx # Modal map for picking a location
  RouteMap.tsx          # Embedded route preview map
  BusAlternatives.tsx   # OTP transit route list
  BadgeDisplay.tsx      # Horizontal badge scroll
  ZoomControls.tsx      # +/− zoom buttons for MapView
styles/                 # ALL styles live here — see section below
data/                   # Firebase data layer (rides, users, cars, etc.)
types/                  # TypeScript types (Ride, User, Car)
utils/                  # Pure helpers (routing, date, validation, etc.)
```

## Style Architecture

**Rule: no `StyleSheet.create` outside of `styles/`. No repeated inline style objects in JSX.**

### Style files

| File | What goes here |
|------|---------------|
| `styles/theme.ts` | Design tokens: `colors`, `spacing`, `radius` |
| `styles/layout.ts` | Screen structure + typography + navigation helpers |
| `styles/forms.ts` | Form inputs: `input`, `field`, `label` |
| `styles/components.ts` | Shared component styles: cards, buttons, tags, zoom, autocomplete, badges, leaderboard |
| `styles/map.ts` | All map-related styles: mapView screen, LocationPickerMap modal, RouteMap component |
| `styles/chat.ts` | Chat screen styles |

### Common patterns — always use these, never re-define inline

```ts
// Navigation
<Text style={layout.backLink} onPress={() => router.back()}>← Back</Text>

// Inline link (driver/passenger name)
<Text style={layout.link}>{name}</Text>

// Section heading inside a card
<Text style={layout.sectionTitle}>…</Text>

// Stat block (CO₂, streak)
<Text style={layout.statValue}>{value}</Text>
<Text style={layout.statLabel}>{caption}</Text>

// Empty states
<View style={layout.emptyContainer}>
  <Text style={layout.emptyText}>Nothing here yet</Text>
</View>

// Destructive action button (Report, Remove passenger, Remove car — all identical)
<Pressable style={components.dangerTag} onPress={handler}>
  <Text style={components.dangerTagText}>Report</Text>
</Pressable>

// Verified passenger badge
<View style={components.verifiedBadge}>
  <Text style={components.verifiedBadgeText}>✅ Verified</Text>
</View>

// Completed ride tag
<View style={components.completedTag}>
  <Text style={components.completedTagText}>COMPLETED ✅</Text>
</View>

// Boarding code
<Text style={components.boardingCode}>{code}</Text>

// Boarding code card (passenger view)
<View style={[components.card, components.boardingCodeCard]}>…</View>

// Row layouts
<View style={components.row}>…</View>
<View style={components.rowSpaceBetween}>…</View>
<View style={components.rowGap}>…</View>
<View style={components.statRow}><Text style={layout.emojiLg}>🌳</Text>…</View>

// Tag/badge pills
<View style={components.badgePrimary}><Text style={components.badgePrimaryText}>🚌 Line 3</Text></View>
<View style={components.badgeNeutral}><Text style={components.badgeNeutralText}>not rated yet</Text></View>
<View style={[components.ratingBadge, { backgroundColor }]}><Text style={components.ratingBadgeText}>⭐ 4/5</Text></View>

// Collapsible section header (all expand/collapse toggles)
<Pressable style={components.rowSpaceBetween} onPress={toggle}>
  <Text style={layout.subtitle}>Section title</Text>
  <Text style={layout.collapseIndicator}>{open ? "▲" : "▼"}</Text>
</Pressable>

// Expandable card (all collapsible sections — Bus Alternatives, Reports, etc.)
<View style={[components.card, components.expandableCard]}>…</View>

// Feedback / report cards (always pair feedbackCard with a border colour)
<View style={[components.feedbackCard, components.dangerLeftBorder]}>…</View>       // reports
<View style={[components.feedbackCard, getFeedbackStyle(rating)]}>…</View>          // ride ratings

// Inline confirmation ("✓ Location defined")
<Text style={layout.confirmationText}>✓ Location defined</Text>

// Warning / info box (missing coord, validation hint)
<View style={components.infoBox}>
  <Text>⚠️</Text>
  <Text style={components.infoBoxText}>Message here.</Text>
</View>

// Bus route leg row
<View style={[components.card, components.legRow]}>…</View>

// Map action row ("🗺️ Or choose on map")
<Pressable style={components.mapActionRow} onPress={openPicker}>
  <Text style={layout.mapActionText}>🗺️ Or choose on map</Text>
</Pressable>

// Spacers (use instead of { height: spacing.X })
<View style={components.spacerXs} />
<View style={components.spacerSm} />
<View style={components.spacerMd} />
<View style={components.spacerLg} />

// Margin helpers
<View style={components.mtMd}>…</View>
<View style={[components.card, components.mtMd]}>…</View>

// Typography helpers
<Text style={layout.textLight}>muted text</Text>
<Text style={layout.textLightSm}>small muted</Text>
<Text style={layout.textDanger}>error text</Text>
<Text style={layout.cardTitle}>Route title</Text>
<Text style={layout.headingSm}>Small heading</Text>
<Text style={layout.emojiLg}>🌳</Text>

// Multiline TextInput
<TextInput style={[forms.input, forms.multiline]} multiline />
```

### Theme tokens (from `styles/theme.ts`)

```ts
colors.primary       // #10b981 emerald
colors.primarySoft   // #ecfdf5
colors.primaryLight  // #d1fae5
colors.primaryDark   // #047857
colors.accent        // #059669
colors.background    // #f8fafc slate-50
colors.card          // #ffffff
colors.text          // #0f172a slate-900
colors.textLight     // #64748b slate-500
colors.border        // #e2e8f0 slate-200
colors.danger        // #ef4444
colors.dangerSoft    // #fee2e2
colors.women         // #f43f5e rose
colors.womenSoft     // #ffe4e6
colors.warning       // #fef08a
colors.warningSoft   // #fef2f2
colors.neutral       // #f1f5f9
colors.neutralLight  // #e2e8f0

spacing: xs=4 sm=8 md=16 lg=24 xl=32 xxl=48
radius:  sm=8 md=12 lg=20 xl=28
```

## Tech Stack

- **Expo** (SDK ~52), **Expo Router** v4 (file-based navigation)
- **React Native Maps** for MapView, Marker, Polyline
- **Firebase** (Firestore + Auth) via `lib/firebase.ts`
- **react-native-dropdown-picker** for car/gender dropdowns
- **expo-contacts** for emergency contact feature
- **@expo/vector-icons** (Ionicons) for badges

## Key Data Flows

- `data/rides.ts` — local cache + Firestore subscription (`subscribeToRidesChanges`)
- `data/user.ts` — current user singleton, auth subscription
- `data/cars.ts` — only current user's cars are subscribed locally; other users' cars use `fetchCarById`
- `data/reviews.ts` — `fetchReviewsForUser(id)` for on-demand loading
- `utils/routing.ts` — OSRM route fetch + Nominatim geocoding
- `utils/transitRoutes.ts` — OTP transit route fetch (bus alternatives)

## Coding Conventions

- TypeScript strict mode
- No default exports from style files (named exports only)
- Screens use `SafeAreaView` from `react-native-safe-area-context`
- All hooks before any conditional `return` (Rules of Hooks)
- `generateId(collection)` from `lib/firebase.ts` for new IDs
- Test IDs follow `testID="camelCaseButtonName"` pattern
- `void` prefix on async calls in event handlers to satisfy TS
