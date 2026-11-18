"use client";

import { useState, useEffect } from "react";
import AuthScreen from "../components/AuthScreen.js";
import { isFirebaseConfigured } from "../lib/firebase.js";

export default function SignupPage() {
  const [ready, setReady] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    setFirebaseReady(isFirebaseConfigured());
    setReady(true);
  }, []);

  if (!ready) return null;

  return <AuthScreen firebaseReady={firebaseReady} />;
}
