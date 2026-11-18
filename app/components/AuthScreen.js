"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { firebaseAuth } from "../lib/firebase.js";
import { BrandLogoMark } from "./BrandLogo.js";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09A6.97 6.97 0 0 1 5.47 12c0-.72.13-1.43.37-2.09V7.07H2.18A11.96 11.96 0 0 0 .96 12c0 1.94.46 3.77 1.22 5.33l2.66-2.24z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const socialOptions = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "microsoft", label: "Microsoft", icon: MicrosoftIcon },
  { id: "apple", label: "Apple", icon: AppleIcon },
];

export default function AuthScreen({ initialMode = "signup", firebaseReady }) {
  const router = useRouter();
  const redirectHandled = useRef(false);
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!firebaseAuth || redirectHandled.current) return;
    redirectHandled.current = true;
    getRedirectResult(firebaseAuth)
      .then((result) => {
        if (result?.user) router.replace("/dashboard");
      })
      .catch((redirectError) => {
        setError(firebaseErrorMessage(redirectError));
      });
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (isSignup && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setPending("email");

    // If Firebase keys are not yet configured in .env.local, enable immediate Demo Session
    if (!firebaseAuth || !firebaseReady) {
      try {
        if (typeof window !== "undefined") {
          const userProfile = {
            displayName: (isSignup ? name.trim() : email.split("@")[0]) || "Athlete",
            email: email.trim(),
            isDemo: true,
          };
          sessionStorage.setItem("fitalert_user", JSON.stringify(userProfile));
        }
        setNotice(isSignup ? "Account created in local session! Redirecting to your dashboard..." : "Signing in... Redirecting to dashboard...");
        setTimeout(() => {
          router.replace("/dashboard");
        }, 500);
      } catch (err) {
        router.replace("/dashboard");
      } finally {
        setPending("");
      }
      return;
    }

    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await sendEmailVerification(credential.user, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        });
        await signOut(firebaseAuth);
        setNotice("Account created. Check your inbox for Firebase’s verification email, then sign in.");
      } else {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        if (!credential.user.emailVerified) {
          await signOut(firebaseAuth);
          setError("Verify your email address using the link Firebase sent before signing in.");
          return;
        }
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (requestError) {
      setError(firebaseErrorMessage(requestError));
    } finally {
      setPending("");
    }
  }

  async function signInSocial(providerName) {
    setError("");
    setNotice("");
    setPending(providerName);

    // If Firebase is not configured, grant instant Demo login for the chosen provider
    if (!firebaseAuth || !firebaseReady) {
      const providerLabel = providerName.charAt(0).toUpperCase() + providerName.slice(1);
      if (typeof window !== "undefined") {
        const userProfile = {
          displayName: `${providerLabel} Member`,
          email: `${providerName}.user@fitalert.app`,
          isDemo: true,
        };
        sessionStorage.setItem("fitalert_user", JSON.stringify(userProfile));
      }
      setNotice(`Signed in with ${providerLabel} (Demo session). Redirecting...`);
      setTimeout(() => {
        router.replace("/dashboard");
      }, 500);
      return;
    }

    try {
      const provider = providerName === "google"
        ? new GoogleAuthProvider()
        : new OAuthProvider(providerName === "microsoft" ? "microsoft.com" : "apple.com");
      provider.setCustomParameters({ prompt: "select_account" });
      if (providerName === "apple") {
        provider.addScope("email");
        provider.addScope("name");
      }
      await signInWithRedirect(firebaseAuth, provider);
    } catch (requestError) {
      setError(firebaseErrorMessage(requestError));
      setPending("");
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-page">
      <header className="auth-page-header">
        <Link className="auth-brand" href="/" aria-label="Fitalert home">
          <BrandLogoMark size={32} />
          <span>fitalert</span>
        </Link>
      </header>
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-card-heading">
          <p className="auth-eyebrow">{isSignup ? "YOUR NEXT CHAPTER STARTS HERE" : "WELCOME BACK"}</p>
          <h1 id="auth-heading">{isSignup ? "Create your account" : "Sign in"}</h1>
          <p>{isSignup ? "A little movement can make a big difference." : "Pick up where you left off."}</p>
        </div>

        <div className="auth-social-list">
          {socialOptions.map((provider) => (
            <button
              className="auth-social-button"
              key={provider.id}
              type="button"
              disabled={Boolean(pending)}
              onClick={() => signInSocial(provider.id)}
            >
              <span className={`auth-provider-mark provider-${provider.id}`}><provider.icon /></span>
              Continue with {provider.label}
              {pending === provider.id && <span className="auth-spinner" aria-label="Loading" />}
            </button>
          ))}
        </div>

        <div className="auth-divider"><span>or continue with email</span></div>
        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <label>
              Name
              <input autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </label>
          )}
          <label>
            Email address
            <input autoComplete="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} maxLength={128} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
          </label>
          {isSignup && (
            <label>
              Confirm password
              <input autoComplete="new-password" required minLength={8} maxLength={128} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
            </label>
          )}
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-message auth-success" role="status">{notice}</p>}
          <button className="auth-submit" type="submit" disabled={Boolean(pending)}>
            {pending === "email" ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            {pending !== "email" && <span aria-hidden="true">→</span>}
          </button>
        </form>

        {isSignup && <p className="auth-terms">By continuing, you agree to use Fitalert as general wellness guidance, not medical advice.</p>}
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Fitalert?"}{" "}
          <button type="button" onClick={() => changeMode(isSignup ? "signin" : "signup")}>
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </p>
        {!firebaseReady ? (
          <div className="auth-setup" style={{ background: "#252140", color: "#c6bafc", padding: "10px 14px", borderRadius: "8px", margin: "14px 0", fontSize: "11px", lineHeight: "1.5", textAlign: "left" }} role="status">
            <span>✦</span> <strong>Ready to run:</strong> You can create an account or sign in directly (instant session). To enable persistent Google/Microsoft cloud sync, add your Firebase keys to <code>.env.local</code>.
          </div>
        ) : null}
        <p className="auth-dashboard-link">Looking around? <Link href="/dashboard">Explore the public dashboard</Link></p>
      </section>
      <p className="auth-footer">Your pace is the right pace. <span>✦</span></p>
    </main>
  );
}

function firebaseErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "An account already uses this email. Try signing in instead.",
    "auth/invalid-credential": "That email and password combination is not recognized.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Console.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/popup-blocked": "Your browser blocked the sign-in flow. Allow redirects and try again.",
    "auth/unauthorized-domain": "Add this website's domain to Firebase Authentication's authorized domains.",
  };
  return messages[error?.code] || error?.message || "Authentication failed. Please try again.";
}
