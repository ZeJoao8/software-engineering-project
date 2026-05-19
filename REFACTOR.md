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

- [ ] `domain/entities/User.ts` ← `types/User.ts` (sem mudanças)
- [ ] `domain/entities/Ride.ts` ← `types/Ride.ts` (sem mudanças)
- [ ] `domain/entities/Car.ts` ← `types/Car.ts` (sem mudanças)
- [ ] `domain/entities/Message.ts` ← extrair de `data/chat.ts:17-23`
- [ ] `domain/entities/Review.ts` ← extrair de `data/reviews.ts:21-29`
- [ ] `domain/entities/Report.ts` ← extrair de `data/reports.ts:20-33` (`Report` + `ReportStatus`)
- [ ] `domain/entities/Badge.ts` ← extrair de `utils/badges.ts:4-15` (`BadgeLevel`, `BadgeStatus`)
- [ ] Apagar pasta `/types/`

### `domain/rules/` (lógica de negócio pura)

- [ ] `domain/rules/rideRules.ts` — **novo**, extrair de `app/ride/[id].tsx`:
  - `canReserveSeat(ride, user, now)`
  - `canCancelSeat(ride, now)`
  - `canCancelRide(ride, now)`
  - `canCompleteRide(ride, user)`
  - `canRemovePassenger(ride, now)`
  - `canChangeCar(ride, newCar, currentPassengers)`
  - `isRideStarted(ride, now)`
  - `generateBoardingCode()`
  - `shouldAutoDeleteRide(ride, user, now)`
- [ ] `domain/rules/rideFilters.ts` ← `utils/rideFilters.ts`
- [ ] `domain/rules/myRidesFilters.ts` — **novo**, extrair de `myRides.tsx:96-149`
- [ ] `domain/rules/badges.ts` ← `utils/badges.ts` (sem `BadgeStatus`, já em entities)
- [ ] `domain/rules/sustainability.ts` ← `utils/sustainability.ts`
- [ ] `domain/rules/streaks.ts` ← `utils/streaks.ts`
- [ ] `domain/rules/validation.ts` ← `utils/validation.ts`
- [ ] `domain/rules/reviewRules.ts` — **novo**, `calculateAverageRating(reviews)` extraído de `data/reviews.ts:131-147`

### `infra/` (integrações externas)

- [ ] `infra/firebase.ts` ← `lib/firebase.ts`
- [ ] `infra/routing.ts` ← extrair de `utils/routing.ts` (só OSRM `getRoute` + tipos)
- [ ] `infra/geocoding.ts` ← extrair de `utils/routing.ts` (Nominatim: `reverseGeocode`, `searchPlaces`, `forwardGeocode`)
- [ ] `infra/transit.ts` ← `utils/transitRoutes.ts`
- [ ] Apagar `lib/`, `utils/routing.ts`, `utils/transitRoutes.ts`

### `repositories/` (só Firestore, lançam erros)

- [ ] `repositories/AuthRepository.ts` — `signIn`, `signUp`, `signOut`, `deleteAuthUser`, `onAuthChanged`
- [ ] `repositories/UserRepository.ts` — `getById`, `getAll`, `create`, `update`
- [ ] `repositories/RideRepository.ts` — `create`, `update`, `delete`, `subscribeAll`
- [ ] `repositories/CarRepository.ts` — `create`, `delete`, `getById`, `subscribeByOwner`
- [ ] `repositories/MessageRepository.ts` — `send`, `subscribeByRide`, `deleteByRide`
- [ ] `repositories/ReviewRepository.ts` — `create`, `fetchByReviewee`, `subscribeForUser`
- [ ] `repositories/ReportRepository.ts` — `create`, `subscribeByReporter`

### `store/` (estado reactivo — substitui parte de `/data/`)

- [ ] `store/authStore.ts` — `currentUser`, `users`, `authReady`, `subscribe()`
- [ ] `store/rideStore.ts` — `rides[]` + sync com `RideRepository.subscribeAll`
- [ ] `store/carStore.ts` — `cars[]` (próprios)
- [ ] `store/reviewStore.ts` — `reviews[]` (que o user vê)
- [ ] `store/reportStore.ts` — `reports[]` (do user)
- [ ] `store/busRouteStore.ts` ← `data/busRoute.ts`
- [ ] Apagar `/data/` por completo

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

### FASE 1 — Entidades (≈2h, baixo risco)
- [ ] Mover todos os tipos para `domain/entities/`
- [ ] Atualizar imports em todo o lado
- [ ] **Critério de fim:** código compila, testes passam, `/types/` apagada

### FASE 2 — Domain Rules (≈2h, baixo risco)
- [ ] Mover `utils/badges`, `utils/streaks`, `utils/sustainability`, `utils/rideFilters`, `utils/validation` para `domain/rules/`
- [ ] Corrigir `plateRegex` duplicado em `userProfile.tsx:220` — usar `isValidPlate`

### FASE 3 — Infra (≈1h, baixo risco)
- [ ] Mover `lib/firebase` → `infra/firebase`
- [ ] Dividir `utils/routing.ts` em `infra/routing.ts` (OSRM) + `infra/geocoding.ts` (Nominatim)
- [ ] Mover `utils/transitRoutes.ts` → `infra/transit.ts`

### FASE 4 — Repositories (≈4h, médio risco)
- [ ] Criar `repositories/*.ts` em paralelo a `/data/` (ainda não ligar nada)
- [ ] Cada repository SÓ faz Firestore, lança erros, sem UI

### FASE 5 — Stores (≈3h, médio risco)
- [ ] Criar `store/*.ts` que usam repositories e mantêm estado reactivo
- [ ] Ainda em paralelo a `/data/`

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

## Notas / Decisões à medida que avançamos

> Usa esta secção para registar decisões que vamos tomando durante o refactor (ex: "decidimos manter X assim porque…").

- _(vazio — preencher à medida)_

---

## UML — atualizar no fim do refactor

Os 3 UML em `README.md` estão desatualizados (ver análise no chat):
- [ ] **Domain Model** — atualizar com entidades reais (sem Booking, com Message/Review/Report tal como existem, badges computados)
- [ ] **Logical Architecture** — substituir MySQL por Firestore, refletir as 5 camadas reais (UI / hooks / services / domain / store+repositories / infra)
- [ ] **Physical Architecture** — remover Node.js backend + MySQL inexistentes; mostrar Mobile (Expo/RN) ↔ Firebase ↔ APIs externas (OSRM, Nominatim, Transitous)
