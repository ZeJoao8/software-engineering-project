module.exports = {
 preset: "jest-expo",

 testMatch: [
  "**/tests/**/*.test.js"
 ],

 transformIgnorePatterns: [
  "node_modules/(?!react-native|@react-native|expo)"
 ]
};