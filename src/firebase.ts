import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent, Analytics } from "firebase/analytics";
import firebaseConfig from "../firebase-applet-config.json";

// We extract just the standard config parts to pass to initializeApp
const configInfo = {
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  measurementId: firebaseConfig.measurementId
};

const app = initializeApp(configInfo);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Firebase Analytics initialization with support check
export let analytics: Analytics | null = null;
let isAnalyticsInitialized = false;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
          isAnalyticsInitialized = true;
          console.log("Firebase Analytics initialized successfully.");
        } catch (err) {
          console.warn("Firebase Analytics initialization error:", err);
        }
      } else {
        console.log("Firebase Analytics is not supported in this browser environment.");
      }
    })
    .catch((err) => {
      console.warn("Error checking Firebase Analytics support:", err);
    });
}

/**
 * Track page views in Firebase Analytics
 */
export function trackPageView(pageName: string, pageTitle?: string) {
  if (analytics) {
    try {
      logEvent(analytics, "page_view", {
        page_title: pageTitle || pageName,
        page_location: typeof window !== "undefined" ? window.location.href : "",
        page_path: "/" + pageName.toLowerCase().replace(/\s+/g, "_"),
      });
    } catch (e) {
      console.warn("Firebase Analytics trackPageView error:", e);
    }
  }
}

/**
 * Track general engagement events in Firebase Analytics
 */
export function trackEngagementEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, {
        timestamp: new Date().toISOString(),
        ...params,
      });
    } catch (e) {
      console.warn("Firebase Analytics trackEngagementEvent error:", e);
    }
  }
}

/**
 * Track article views
 */
export function trackArticleView(articleId: string, articleTitle: string, category?: string) {
  trackEngagementEvent("select_content", {
    content_type: "article",
    item_id: articleId,
    item_name: articleTitle,
    category: category || "NOTÍCIAS",
  });
}

/**
 * Track user actions (search, share, bookmark, comment, rsvp)
 */
export function trackUserAction(actionName: string, details?: Record<string, any>) {
  trackEngagementEvent("user_engagement", {
    action: actionName,
    ...details,
  });
}

export { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };

