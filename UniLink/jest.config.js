module.exports = {
 preset: "jest-expo",

 testMatch: [
  "**/tests/**/*.test.js"
 ],

 transformIgnorePatterns: [
  "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|@react-navigation|firebase|@firebase)"
 ]
};