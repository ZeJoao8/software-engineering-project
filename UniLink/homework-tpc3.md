# TPC#3 - Automated Acceptance Test Log

## 1. Goal
The objective of this assignment is to experiment with automated acceptance tests to verify and validate a single user scenario. The chosen scenario is the "Request a Ride" flow from our mobile app. 

### Scenario Details:
1. The student opens the application.
2. The student enters the pickup location.
3. The student enters the destination.
4. The student confirms the ride request.
5. The system searches for available drivers.
6. A driver accepts the request.
7. The student receives confirmation.

## 2. Tools Used
- **Framework**: React Native with Expo
- **Test Runner**: Jest
- **Testing Utility**: `@testing-library/react-native`
- **AI Assistant**: GenAI (Antigravity Assistant)

## 3. Tasks & Commands

### 3.1 Setup the Testing Environment
Since the project was built with Expo, the first step was installing the appropriate testing tools that provide environment parity with React Native.
**Command executed:**
```bash
npx expo install jest jest-expo @testing-library/react-native @types/jest --save-dev
```
**Configuration (`package.json`):**
Added the test script and the `jest-expo` preset:
```json
"scripts": { "test": "jest" },
"jest": { "preset": "jest-expo" }
```

### 3.2 Prompts used with the GenAI Assistant
To accelerate development, I used the following prompts with the AI assistant:
1. *"confirma se o package.json está pronto para eu usar jest"* (To validate my environment config).
2. *"em que pastas devo criar o ficheiro com o codigo de para os testes"* (To structure the test file correctly within the Expo project).
3. *"cria um mockup da ride requests screen"* (To generate UI for the test).
4. *"como resolvo este erro `ReferenceError: You are trying to import a file outside of the scope of the test code`"* (To fix the compatibility issue between Expo SDK and Jest).

### 3.3 Writing the Acceptance Test & Target Component
Because Acceptance Tests require the UI to interact with, a representative component `RideRequestScreen.tsx` was created. It contains fields for Pickup, Destination, a Submit button, and mocked state transitions simulating the backend (searching for drivers, and accepting).

The automated test was written in `testes/ride-request.test.tsx` using Behavior-Driven Development (BDD) format. It renders the screen, injects inputs using `fireEvent.changeText`, clicks the button with `fireEvent.press`, and validates async screen updates using `waitFor()`.

### 3.4 Execution and Outputs
**Command:**
```bash
npm test
```
**Output:**
```
 PASS  testes/ride-request.test.tsx
  Ride Request Flow Acceptance Test
    ✓ should allow a student to request a ride and receive confirmation (1402 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.35 s
```

### 3.5 Troubleshooting Framework Quirks
During the configuration, we encountered a tricky compatibility issue resulting in a `ReferenceError: You are trying to import a file outside of the scope of the test code`. 
This occurred because the newer Expo SDK (utilizing the "Winter" runtime) relies on lazy global evaluations that attempted to fetch Node modules across Jest's strictly isolated execution boundaries. I fixed it by adding a custom jest-setup.js to initialize the necessary globals before running tests. This shows how framework changes can affect test stability and require careful troubleshooting.

## 4. Critical Analysis
Developing this automated acceptance test from scratch provided significant insights into agile testing practices:

1. **Shift-Left Testing**: By mocking the backend connection (`setTimeout` for driver acceptance), it was possible to validate the entire user flow functionality before the backend was even fully implemented.
2. **Confidence in Refactoring**: Writing tests that simulate actual user gestures (typing, clicking) rather than testing internal component state ensures that if the UI undergoes refactoring, the acceptance criteria (inputs to outputs) remain intact.
3. **Tool Choices**: For this task, `jest` coupled with `@testing-library/react-native` proved extremely fast and reliable. However, this is essentially a "component integration test" acting as an acceptance test. If we needed to test real OS interactions (like permission modals or backgrounding the app), a true E2E framework like **Maestro** or **Detox** running on a real emulator would be more suitable, despite being much slower and harder to configure.
4. **Conclusion**: This automation serves as a living documentation of the requirements. The time invested in setting up the Jest configuration initially pays off exponentially by completely removing the need to manually click through the app every time a new feature is merged.
