module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  moduleNameMapper: {
    "^expo-router$": "<rootDir>/__mocks__/expo-router.js",
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo-constants$": "<rootDir>/__mocks__/expo-constants.js"
  },
  testEnvironment: "node"
};