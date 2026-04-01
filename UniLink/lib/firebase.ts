import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
 getAuth,
 getReactNativePersistence,
 initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
 authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
 projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
 storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
 messagingSenderId:
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
 appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

const missingConfig = Object.entries(firebaseConfig)
 .filter(([, value]) => !value)
 .map(([key]) => key);

if (missingConfig.length > 0) {
 console.warn(
  `Firebase config missing: ${missingConfig.join(", ")}`
 );
}

const app =
 getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

const auth =
 Platform.OS === "web"
  ? getAuth(app)
  : (() => {
     try {
      return initializeAuth(app, {
       persistence:
        getReactNativePersistence(
         AsyncStorage
        ),
      });
     } catch {
      return getAuth(app);
     }
    })();

const db = getFirestore(app);

export {
 app,
 auth,
 db,
};
