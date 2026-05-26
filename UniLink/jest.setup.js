const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("SafeAreaView has been deprecated")) return;
  originalWarn(...args);
};
