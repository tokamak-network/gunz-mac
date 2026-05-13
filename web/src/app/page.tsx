"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const FADE_DURATION_MS = 1000;

function SeamlessVideo() {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video0 = videoRef0.current;
    const video1 = videoRef1.current;
    if (!video0 || !video1) return;

    const handleTimeUpdate = () => {
      const video = activeVideo === 0 ? video0 : video1;
      const nextVideo = activeVideo === 0 ? video1 : video0;

      if (video.duration > 0 && video.currentTime > video.duration - FADE_DURATION_MS / 1000) {
        if (nextVideo.paused) {
          nextVideo.currentTime = 0;
          nextVideo.play().catch(() => {});
          setActiveVideo(activeVideo === 0 ? 1 : 0);
        }
      }
    };

    video0.addEventListener("timeupdate", handleTimeUpdate);
    video1.addEventListener("timeupdate", handleTimeUpdate);

    video0.play().catch(() => {});

    return () => {
      video0.removeEventListener("timeupdate", handleTimeUpdate);
      video1.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [activeVideo]);

  return (
    <div className="rivai-video-background">
      <video
        ref={videoRef0}
        muted
        playsInline
        className="rivai-video-element"
        style={{ opacity: activeVideo === 0 ? 0.4 : 0 }}
      >
        <source src="/landing.mp4" type="video/mp4" />
      </video>
      <video
        ref={videoRef1}
        muted
        playsInline
        className="rivai-video-element"
        style={{ opacity: activeVideo === 1 ? 0.4 : 0 }}
      >
        <source src="/landing.mp4" type="video/mp4" />
      </video>
      <div className="rivai-video-overlay" />
    </div>
  );
}

export default function Page() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.body.classList.add("rivai-landing");
    return () => {
      document.body.classList.remove("rivai-landing");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
    }, 1500);
  };

  return (
    <div className="rivai-container">
      <SeamlessVideo />

      <div className="rivai-inspired-badge">
        <span className="rivai-inspired-text">Inspired by GunZ</span>
        <Link href="/download" className="rivai-inspired-btn">
          Play Now
        </Link>
      </div>

      <main className="rivai-main">
        <header className="rivai-header">
          <span className="rivai-coming-soon">COMING SOON</span>
          <h1 className="rivai-logo">RIVAI</h1>
        </header>

        <section className="rivai-body">
          <p className="rivai-description">
            A new rivalry begins.<br />
            Sign up to be the first to hear about our launch.
          </p>

          <div className="rivai-action-area">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="rivai-form">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rivai-input"
                />
                <button disabled={isSubmitting} className="rivai-submit">
                  {isSubmitting ? "Submitting..." : "Notify Me"}
                </button>
              </form>
            ) : (
              <div className="rivai-success">
                You&apos;re on the list. We&apos;ll see you on the battlefield.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="rivai-footer">
        <div className="rivai-footer-left">
          <div className="rivai-logo-circle">N</div>
        </div>
        <div className="rivai-copyright">© 2026 RIVAI</div>
      </footer>
    </div>
  );
}
