require('expo/src/winter/runtime.native');

try {
  // Eagerly resolve lazy getter requires to prevent Jest Scope isolation errors
  _ = global.__ExpoImportMetaRegistry;
  _ = global.TextDecoder;
  _ = global.TextDecoderStream;
  _ = global.TextEncoderStream;
  _ = global.URL;
  _ = global.URLSearchParams;
  _ = global.structuredClone;
} catch (e) {}
