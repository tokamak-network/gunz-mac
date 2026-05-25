"use client";

import { useState } from "react";
import styles from "./page.module.css";

/**
 * Hero email capture. Mirrors the RIVAI landing (route: /) mock submit —
 * no backend yet; swap the setTimeout for a real endpoint when ready.
 */
export default function NotifyForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setEmail("");
    }, 1200);
  };

  if (success) {
    return (
      <p className={styles.notifySuccess}>
        You&apos;re on the list. We&apos;ll see you on the battlefield.
      </p>
    );
  }

  return (
    <form className={styles.notifyForm} onSubmit={onSubmit}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.notifyInput}
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={submitting}
        className={styles.notifySubmit}
      >
        {submitting ? "Submitting…" : "Get Notified"}
      </button>
    </form>
  );
}
