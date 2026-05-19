# UniLink — Refactor Plan

Plano de refactor para separar `model` / `domain` / `data` / `services` / `UI`, em resposta ao feedback do professor sobre mistura de responsabilidades.

> Marca cada item com `[x]` quando estiver feito. Mantém este ficheiro vivo — atualiza nomes de ficheiros e notas à medida que avanças.

---

## Diagnóstico — 7 problemas estruturais

| # | Problema | Onde se manifesta | Gravidade |
|---|---|---|---|
| 1 | `Alert.alert()` espalhado na camada de dados | `data/user.ts`, `data/rides.ts`, `data/cars.ts`, `data/chat.ts`, `data/reviews.ts`, `data/reports.ts` | Crítico |
| 2 | Tipos de domínio definidos dentro de ficheiros de dados | `Message` em `chat.ts`, `Review` em `reviews.ts`, `Report` em `reports.ts`, `BadgeStatus` em `utils/badges.ts` | Crítico |
| 3 | Lógica de negócio dentro das screens | `app/ride/[id].tsx` (`reserveSeat`, `completeRide`, `removePassenger`, `generateBoardingCode`), `app/(tabs)/myRides.tsx` (`applyFilters`, `matchesRating`) | Crítico |
| 4 | Validações duplicadas | `plateRegex` em `utils/validation.ts` E reescrito inline em `userProfile.tsx` | Médio |
| 5 | Componentes acedem a estado global | `rideCard.tsx` chama `getReports()`, `getReviews()` em vez de receber props | Médio |
| 6 | Estado global + Firestore + business rules tudo em `/data/` | Todos os ficheiros de data | Crítico |
| 7 | `utils/` mistura helpers puros, regras de domínio e APIs externas | `badges`/`streaks`/`sustainability`/`rideFilters` (domínio) vs `routing`/`transitRoutes` (infra) vs `date`/`validation` (utils) | Médio |

---

## Arquitetura Alvo (5 camadas)

```
app/  +  components/      ── UI (React Native, screens, Alerts)
              │ via hooks
hooks/                    ── ponte React: useAuth, useRides, ...
              │
services/                 ── orquestração: rules + repositories
                             retorna {ok, error}, NUNCA chama Alert
       │                              │
domain/                          store/  ── estado reactivo
├── entities/ (types)            (substitui o /data/ atual)
└── rules/ (puro)                       │
                                 repositories/ ── só Firestore
                                 lança erros, nunca chama Alert
                                        │
                                 infra/ ── Firebase + OSRM +
                                 Nominatim + Transitous
```

---

## Mapa de Migração — Ficheiro por Ficheiro

### `domain/entities/` (entidades puras, sem dependências)

- [x] `domain/entities/User.ts` ← `types/User.ts` (sem mudanças)
- [x] `domain/entities/Ride.ts` ← `types/Ride.ts` (sem mudanças)
- [x] `domain/entities/Car.ts` ← `types/Car.ts` (sem mudanças)
- [x] `domain/entities/Message.ts` ← extrair de `data/chat.ts:17-23`
- [x] `domain/entities/Review.ts` ← extrair de `data/reviews.ts:21-29`
- [x] `domain/entities/Report.ts` ← extrair de `data/reports.ts:20-33` (`Report` + `ReportStatus`)
- [x] `domain/entities/Badge.ts` ← extrair de `utils/badges.ts:4-15` (`BadgeLevel`, `BadgeStatus`)
- [x] Apagar pasta `/types/`

### `domain/rules/` (lógica de negócio pura)

- [x] `domain/rules/rideRules.ts` — **novo**, extrair de `app/ride/[id].tsx`:
  - [x] `canReserveSeat(ride, user, now)`
  - [x] `canCancelSeat(ride, now)`
  - [x] `canCancelRide(ride, now)`
  - [x] `canCompleteRide(ride, userId)`
  - [x] `canRemovePassenger(ride, now)`
  - [ ] `canChangeCar(ride, newCar, currentPassengers)` — ⚠️ lógica ainda na screen, extrair na Fase 6
  - [ ] `isRideStarted(ride, now)` — ⚠️ calculado inline na screen, extrair na Fase 6
  - [x] `generateBoardingCode()`
  - [x] `shouldAutoDeleteRide(ride, now)`
- [x] `domain/rules/rideFilters.ts` ← `utils/rideFilters.ts` (apagado)
- [ ] `domain/rules/myRidesFilters.ts` — **novo**, extrair de `myRides.tsx:96-149` — ⚠️ deixar para Fase 8 (envolve estado React)
- [x] `domain/rules/badges.ts` ← `utils/badges.ts` (apagado)
- [x] `domain/rules/sustainability.ts` ← `utils/sustainability.ts` (apagado)
- [x] `domain/rules/streaks.ts` ← `utils/streaks.ts` (apagado)
- [x] `domain/rules/validation.ts` ← `utils/validation.ts` (apagado)
- [x] `domain/rules/reviewRules.ts` — **novo**, `calculateAverageRating(reviews)`

### `infra/` (integrações externas)

- [x] `infra/firebase.ts` ← `lib/firebase.ts`
- [x] `infra/routing.ts` ← extrair de `utils/routing.ts` (só OSRM `getRoute` + tipos)
- [x] `infra/geocoding.ts` ← extrair de `utils/routing.ts` (Nominatim: `reverseGeocode`, `searchPlaces`, `forwardGeocode`)
- [x] `infra/transit.ts` ← `utils/transitRoutes.ts`
- [x] Apagar `lib/`, `utils/routing.ts`, `utils/transitRoutes.ts`

### `repositories/` (só Firestore, lançam erros)

- [x] `repositories/AuthRepository.ts` — `signIn`, `signUp`, `signOutUser`, `deleteAuthUser`, `onAuthChanged`
- [x] `repositories/UserRepository.ts` — `getById`, `getAll`, `create`, `update`
- [x] `repositories/RideRepository.ts` — `save`, `remove`, `subscribeAll`
- [x] `repositories/CarRepository.ts` — `save`, `remove`, `getById`, `subscribeByOwner`
- [x] `repositories/MessageRepository.ts` — `send`, `subscribeByRide`, `deleteByRide`
- [x] `repositories/ReviewRepository.ts` — `save`, `fetchByReviewee`, `subscribeForUser`
- [x] `repositories/ReportRepository.ts` — `save`, `subscribeByReporter`

### `store/` (estado reactivo — substitui parte de `/data/`)

- [x] `store/authStore.ts` — `currentUser`, `users`, `authReady`, `subscribe()`
- [x] `store/rideStore.ts` — `rides[]` + sync com `RideRepository.subscribeAll`
- [x] `store/carStore.ts` — `cars[]` (próprios)
- [x] `store/reviewStore.ts` — `reviews[]` (que o user vê)
- [x] `store/reportStore.ts` — `reports[]` (do user)
- [x] `store/busRouteStore.ts` ← `data/busRoute.ts`
- [ ] Apagar `/data/` por completo — feito na Fase 8

### `services/` (orquestração — devolve `{ok, error}`)

- [ ] `services/AuthService.ts` — `login`, `register`, `logout` (traduz erros, sem Alert)
- [ ] `services/RideService.ts` — `createRide`, `reserveSeat`, `cancelSeat`, `completeRide`, `cancelRide`, `removePassenger`, `verifyPassengerCode`, `changeCar`, `removeEmptyPastRides`
- [ ] `services/CarService.ts` — `addCar` (com validação), `removeCarCascade` (apaga rides afetadas)
- [ ] `services/ChatService.ts` — `sendMessage` (com check de autorização)
- [ ] `services/ReviewService.ts` — `addReview`
- [ ] `services/ReportService.ts` — `addReport`
- [ ] `services/ProfileService.ts` — `updateProfile`

### `hooks/` (ponte React ↔ store)

- [ ] `hooks/useAuth.ts` — `{ user, isReady }`
- [ ] `hooks/useRides.ts`
- [ ] `hooks/useCars.ts`
- [ ] `hooks/useReviews.ts`
- [ ] `hooks/useReports.ts`
- [ ] manter `hooks/use-color-scheme.ts`

### `utils/` (só helpers genéricos)

- [ ] Manter apenas `utils/date.ts`

---

## Ordem de Execução — 8 Fases

### FASE 1 — Entidades ✅
- [x] Mover todos os tipos para `domain/entities/`
- [x] Atualizar imports em todo o lado
- [x] **Critério de fim:** código compila, testes passam, `app/domain/` apagada

### FASE 2 — Domain Rules ✅ (exceto 2 itens adiados)
- [x] Mover `utils/badges`, `utils/streaks`, `utils/sustainability`, `utils/rideFilters`, `utils/validation` para `domain/rules/` e apagar os originais
- [x] Criar `domain/rules/rideRules.ts` com regras puras (canReserveSeat, canCancelSeat, canCancelRide, canCompleteRide, canRemovePassenger, shouldAutoDeleteRide, generateBoardingCode)
- [x] Criar `domain/rules/reviewRules.ts` com `calculateAverageRating`
- [x] Corrigir `plateRegex` duplicado em `userProfile.tsx` — usa `isValidPlate`
- [ ] `canChangeCar` e `isRideStarted` — adiar para Fase 6 (precisam do contexto do service)
- [ ] `myRidesFilters.ts` — adiar para Fase 8 (lógica acoplada ao estado React)

### FASE 3 — Infra ✅
- [x] Mover `lib/firebase` → `infra/firebase`
- [x] Dividir `utils/routing.ts` em `infra/routing.ts` (OSRM) + `infra/geocoding.ts` (Nominatim)
- [x] Mover `utils/transitRoutes.ts` → `infra/transit.ts`

### FASE 4 — Repositories ✅
- [x] Criar `repositories/*.ts` em paralelo a `/data/` (ainda não ligar nada)
- [x] Cada repository SÓ faz Firestore, lança erros, sem UI

### FASE 5 — Stores ✅
- [x] Criar `store/*.ts` que usam repositories e mantêm estado reactivo
- [x] Ainda em paralelo a `/data/`

### FASE 6 — Services (≈4h, médio-alto risco)
- [ ] Criar `services/*.ts` com lógica extraída de screens + `/data/`
- [ ] Convenção: devolver `{ok: boolean, error?: string, data?: T }`
- [ ] **Marco crítico:** services nunca chamam `Alert`

### FASE 7 — Hooks (≈1h, baixo risco)
- [ ] Criar `hooks/use*.ts` que envolvem os stores
- [ ] Substituem o padrão atual `useState + subscribeToXChanges`

### FASE 8 — Migrar UI (≈5h, alto risco mas linear)
Para cada screen:
- [ ] Substituir imports de `/data/` por `services/` + `hooks/`
- [ ] Mover `Alert.alert` para o screen (consumir o `result.error`)
- [ ] Extrair lógica de negócio remanescente para `domain/rules/` ou `services/`
- [ ] Passar dados a componentes via props (parar `getReviews()` em `rideCard.tsx`)
- [ ] Apagar `/data/` no fim

**Total estimado:** ~22h. Pode ser dividido entre os 5 membros por camada.

---

## Exemplo Concreto — Antes vs Depois

### Antes (`app/ride/[id].tsx:191-221`)

```tsx
function reserveSeat() {
  if (r.completed)
    return Alert.alert("Cannot reserve", "Ride already completed.");
  if (rideStarted)
    return Alert.alert("Cannot reserve", "Ride already started.");
  if (r.womenOnly && activeUser.gender !== "Female")
    return Alert.alert("Not allowed", "Ride restricted to women.");
  if (r.availableSeats <= 0)
    return Alert.alert("Ride full", "No seats available.");

  Alert.alert("Reserve seat", "Confirm reservation?", [
    { text: "No", style: "cancel" },
    { text: "Yes", onPress: async () => {
        const code = generateBoardingCode();
        // ... 8 linhas de mutação direta do ride
        await updateRide({ ...r, /* ... */ });
        Alert.alert("Seat reserved! 🎉", `Your boarding code is:\n\n${code}`);
    }},
  ]);
}
```

### Depois — UI (`app/ride/[id].tsx`)

```tsx
async function reserveSeat() {
  const result = await rideService.reserveSeat(ride.id, activeUser);
  if (!result.ok) return Alert.alert("Cannot reserve", result.error);
  Alert.alert("Seat reserved! 🎉",
    `Your boarding code is:\n\n${result.data.boardingCode}`);
}
```

### Depois — Domain Rule (`domain/rules/rideRules.ts`)

```ts
export function canReserveSeat(ride: Ride, user: User, now: Date):
  { ok: true } | { ok: false; error: string } {
  if (ride.completed) return { ok: false, error: "Ride already completed." };
  if (new Date(ride.departureDateTime) < now)
    return { ok: false, error: "Ride already started." };
  if (ride.womenOnly && user.gender !== "Female")
    return { ok: false, error: "Ride restricted to women." };
  if (ride.availableSeats <= 0)
    return { ok: false, error: "No seats available." };
  return { ok: true };
}

export function generateBoardingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
```

### Depois — Service (`services/RideService.ts`)

```ts
export async function reserveSeat(rideId: string, user: User) {
  const ride = rideStore.getById(rideId);
  if (!ride) return { ok: false, error: "Ride not found" };

  const check = canReserveSeat(ride, user, new Date());
  if (!check.ok) return check;

  const boardingCode = generateBoardingCode();
  const updated: Ride = {
    ...ride,
    availableSeats: ride.availableSeats - 1,
    passengers: [...ride.passengers, user.uid],
    passengerCodes: { ...(ride.passengerCodes ?? {}), [user.uid]: boardingCode },
  };
  await rideRepository.update(updated);
  return { ok: true, data: { boardingCode } };
}
```

---

## Handoff — estado para a próxima sessão

> Lê isto antes de continuar. Dá ao Claude Code context suficiente para não perder tempo a re-analisar.

### O que já está feito (compilado + 68 testes a passar)

**Fase 1 ✅ — `domain/entities/`**
Todos os tipos movidos do `data/` e `utils/` para ficheiros próprios:
`User.ts`, `Ride.ts`, `Car.ts`, `Message.ts`, `Review.ts`, `Report.ts`, `Badge.ts`
Todos os consumidores (screens, components, tests) a importar diretamente de `domain/entities/`.

**Fase 2 ✅ — `domain/rules/`**
5 ficheiros `utils/` eliminados, lógica movida:
- `domain/rules/sustainability.ts` — `calculateUserCO2Saved`, `CO2_PER_KM`, `formatCO2`
- `domain/rules/streaks.ts` — `calculateWeeklyStreak`
- `domain/rules/rideFilters.ts` — `filterRides`, `FilterCriteria`
- `domain/rules/validation.ts` — `isValidEmail`, `isUniversityEmail`, `isPasswordStrong`, `doPasswordsMatch`, `areRequiredFieldsFilled`, `isValidPlate`
- `domain/rules/badges.ts` — `getUserBadges`
- `domain/rules/rideRules.ts` (**novo**) — `canReserveSeat`, `canCancelSeat`, `canCancelRide`, `canCompleteRide`, `canRemovePassenger`, `shouldAutoDeleteRide`, `generateBoardingCode`
- `domain/rules/reviewRules.ts` (**novo**) — `calculateAverageRating`

`utils/` só tem agora: `date.ts`, `routing.ts`, `transitRoutes.ts` (vão para `infra/` na Fase 3).

**Fase 3 ✅ — `infra/`**
- `infra/firebase.ts` — app Firebase, auth, db, generateId
- `infra/routing.ts` — OSRM: `getRoute`, `Coordinates`, `RouteResult`
- `infra/geocoding.ts` — Nominatim: `reverseGeocode`, `searchPlaces`, `forwardGeocode`, `AddressSuggestion`
- `infra/transit.ts` — Transitous: `getTransitRoutes`, `TransitRoute`, `TransitLeg`
- `lib/` apagada; `utils/routing.ts` e `utils/transitRoutes.ts` apagados
- `utils/` tem agora só `date.ts`

### O que falta — próxima fase a fazer

**Fase 4 ✅ — `repositories/`**
7 ficheiros criados em paralelo a `/data/`. Só Firestore/Auth, sem Alert, lançam erros.

### O que falta — próxima fase a fazer

**Fase 5 ✅ — `store/`**
6 stores criados. Cada um usa o repository correspondente e mantém estado reactivo.
`/data/` continua intacto — nada quebrado.

### O que falta — próxima fase a fazer

**Fase 6 — `services/` (≈4h, médio-alto risco)**

Orquestração: rules + repositories. Devolve `{ ok, error?, data? }`, **nunca** chama `Alert`.

```
services/AuthService.ts    — login, register, logout (erros de Auth traduzidos para strings)
services/RideService.ts    — createRide, reserveSeat, cancelSeat, completeRide,
                             cancelRide, removePassenger, verifyPassengerCode,
                             changeCar, removeEmptyPastRides
services/CarService.ts     — addCar (com isValidPlate), removeCarCascade
services/ChatService.ts    — sendMessage (verifica autorização)
services/ReviewService.ts  — addReview
services/ReportService.ts  — addReport
services/ProfileService.ts — updateProfile
```

Critério de fim: nenhum service chama `Alert`. `tsc` + 111 testes.

**Fases seguintes:** 7 Hooks → 8 UI.

### Convenções estabelecidas
- Imports de tipos → sempre `import type { X }` (não `import { X }`)
- Services devolvem `{ ok: boolean, error?: string, data?: T }`, **nunca** chamam `Alert`
- `Alert.alert` fica **apenas** nas screens
- Testes em `tests/*.test.js` — Jest + `@testing-library/react-native`
- Stack: Expo / React Native + Firebase/Firestore (sem Node.js backend, sem MySQL)
- APIs externas: OSRM (routing), Nominatim (geocoding), Transitous (trânsito)

### Comandos úteis
```bash
npx tsc --noEmit        # type check
npm test                # 111 testes
```

## Notas / Decisões à medida que avançamos

- `canChangeCar` e `isRideStarted` adiados para Fase 6 (precisam contexto do service)
- `myRidesFilters.ts` adiado para Fase 8 (acoplado a estado React em `myRides.tsx:96-149`)
- `utils/date.ts` fica em `utils/` até ao fim (helper genérico, não é domain logic)

---

## UML — atualizar no fim do refactor

Os 3 UML em `README.md` estão desatualizados (ver análise no chat):
- [ ] **Domain Model** — atualizar com entidades reais (sem Booking, com Message/Review/Report tal como existem, badges computados)
- [ ] **Logical Architecture** — substituir MySQL por Firestore, refletir as 5 camadas reais (UI / hooks / services / domain / store+repositories / infra)
- [ ] **Physical Architecture** — remover Node.js backend + MySQL inexistentes; mostrar Mobile (Expo/RN) ↔ Firebase ↔ APIs externas (OSRM, Nominatim, Transitous)
