"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * IndexedDB Permanent Storage for Workout Highlights (Instagram Story Highlights Style)
 * Persists indefinitely beyond 24 hours with start time, finish time, date, duration, and geolocation.
 */
const DB_NAME = "fitalert_highlights_db";
const DB_VERSION = 1;
const STORE_NAME = "highlights";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getSavedHighlights() {
  const db = await openDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        // Sort newest first
        results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveHighlightRecord(record) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function deleteHighlightRecord(id) {
  const db = await openDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Reverse Geocodes coordinates or falls back to browser timezone city
 */
export async function detectLocationString() {
  if (typeof window === "undefined") return "Global Studio";

  // Fallback location from Timezone
  let tzLocation = "Local Gym Studio";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const parts = tz.split("/");
    if (parts.length > 1) {
      const city = parts[parts.length - 1].replace(/_/g, " ");
      const region = parts[0].replace(/_/g, " ");
      tzLocation = `${city}, ${region}`;
    } else if (tz) {
      tzLocation = tz.replace(/_/g, " ");
    }
  } catch {
    tzLocation = "Local Studio";
  }

  if (!navigator.geolocation) {
    return tzLocation;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(tzLocation);
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeout);
        const { latitude, longitude } = pos.coords;
        try {
          // Approximate reverse geocoding via public OpenStreetMap API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
            const country = data.address?.country || "";
            if (city && country) {
              resolve(`${city}, ${country} (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
              return;
            } else if (country) {
              resolve(`${country} (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`);
              return;
            }
          }
        } catch {
          // Network or CORS fallback
        }
        resolve(`${tzLocation} (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
      },
      () => {
        clearTimeout(timeout);
        resolve(tzLocation);
      },
      { timeout: 3000, maximumAge: 600000 }
    );
  });
}

/**
 * Instagram Story Highlights Bar Component
 */
export function LiveWorkoutHighlights({
  highlights = [],
  onSelectHighlight,
  onStartRecording,
  isRecording = false,
  recordDuration = "00:00",
  roomStream = null,
}) {
  return (
    <div className="highlights-section">
      <div className="highlights-header">
        <div className="highlights-title-wrap">
          <span className="highlights-badge">STORY HIGHLIGHTS</span>
          <h3>Saved Workout Highlights</h3>
        </div>
        <p className="highlights-sub">
          Permanent session replays stored in IndexedDB. Viewable even after 24 hours have passed with verified date, start/finish timestamps, and GPS location.
        </p>
      </div>

      <div className="highlights-row" role="region" aria-label="Workout story highlights row">
        {/* Record New Bubble */}
        <div className="highlight-item highlight-create-item">
          <button
            type="button"
            className={`highlight-ring ${isRecording ? "recording-active-ring" : "create-ring"}`}
            onClick={onStartRecording}
            aria-label={isRecording ? "Recording in progress" : "Record new workout highlight"}
          >
            <div className="highlight-avatar create-avatar">
              {isRecording ? (
                <div className="recording-pulse-indicator">
                  <span className="pulse-dot" />
                  <small className="pulse-time">{recordDuration}</small>
                </div>
              ) : (
                <span className="create-icon">＋</span>
              )}
            </div>
          </button>
          <span className="highlight-label">{isRecording ? "Recording..." : "New Highlight"}</span>
          <span className="highlight-meta-tag">{isRecording ? "🔴 LIVE" : "Record Live"}</span>
        </div>

        {/* Saved Highlights List */}
        {highlights.map((item) => (
          <div key={item.id} className="highlight-item">
            <button
              type="button"
              className="highlight-ring story-ring"
              onClick={() => onSelectHighlight(item)}
              aria-label={`Watch highlight from ${item.date}`}
            >
              <div className="highlight-avatar">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="highlight-thumb-img" />
                ) : (
                  <div className="highlight-fallback-thumb">
                    <span>⚡</span>
                  </div>
                )}
                <span className="highlight-duration-badge">{item.duration}</span>
              </div>
            </button>
            <span className="highlight-label" title={item.title}>{item.title}</span>
            <span className="highlight-meta-tag" title={item.location}>
              📍 {item.location?.split(",")[0] || "Studio"} · {item.date?.split(",")[0] || "Today"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full-Screen / Modal Instagram Story Viewer
 */
export function InstagramStoryViewerModal({ highlight, onClose, onDelete }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (!highlight) return undefined;

    let url = "";
    if (highlight.blob instanceof Blob) {
      url = URL.createObjectURL(highlight.blob);
      setVideoUrl(url);
    } else if (highlight.videoUrl) {
      setVideoUrl(highlight.videoUrl);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [highlight]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((current / dur) * 100);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadRecording = () => {
    if (!highlight) return;
    const a = document.createElement("a");
    a.href = videoUrl || highlight.thumbnail;
    a.download = `fitalert-highlight-${highlight.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!highlight) return null;

  return (
    <div className="story-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="story-card" onClick={(e) => e.stopPropagation()}>
        {/* Story Progress Bar */}
        <div className="story-progress-bar-container">
          <div className="story-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Story Header Bar */}
        <div className="story-header">
          <div className="story-author-info">
            <div className="story-avatar-small">
              <span>FA</span>
            </div>
            <div className="story-header-text">
              <div className="story-title-row">
                <strong>{highlight.title}</strong>
                <span className="story-verified-badge">✓ Highlights</span>
              </div>
              <small className="story-date-badge">
                📅 {highlight.date} · ⏱️ {highlight.startTime} → {highlight.finishTime}
              </small>
            </div>
          </div>

          <div className="story-header-actions">
            <span className="story-permanent-tag">✦ Permanent (No 24h wipe)</span>
            <button type="button" className="story-close-btn" onClick={onClose} aria-label="Close highlight">
              ✕
            </button>
          </div>
        </div>

        {/* Story Geolocation & Duration Banner */}
        <div className="story-meta-banner">
          <div className="story-meta-pill">
            <span className="story-meta-icon">📍</span>
            <span>{highlight.location || "Local Fitness Studio"}</span>
          </div>
          <div className="story-meta-pill">
            <span className="story-meta-icon">⏱️</span>
            <span>Duration: {highlight.duration}</span>
          </div>
        </div>

        {/* Video Stage */}
        <div className="story-video-container" onClick={togglePlay}>
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="story-video-player"
            />
          ) : (
            <div className="story-placeholder-display">
              <div className="story-placeholder-art">
                <span className="placeholder-icon">🏋️</span>
                <h3>{highlight.title}</h3>
                <p>Recorded Live Workout</p>
              </div>
            </div>
          )}

          {!isPlaying && (
            <div className="story-play-overlay">
              <span className="story-play-icon">▶</span>
            </div>
          )}
        </div>

        {/* Story Footer Controls */}
        <div className="story-footer">
          <div className="story-time-details">
            <div>
              <strong>Recorded on:</strong> {highlight.date}
            </div>
            <div>
              <strong>Time:</strong> {highlight.startTime} – {highlight.finishTime} ({highlight.duration})
            </div>
            <div>
              <strong>Location:</strong> {highlight.location}
            </div>
          </div>

          <div className="story-action-buttons">
            <button type="button" className="story-action-btn story-btn-download" onClick={downloadRecording}>
              📥 Download Recording
            </button>
            <button
              type="button"
              className="story-action-btn story-btn-delete"
              onClick={() => {
                if (window.confirm("Delete this highlight from permanent storage?")) {
                  onDelete(highlight.id);
                  onClose();
                }
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shareable Live Room Link & Invite Modal
 */
export function LiveRoomShareModal({ roomCode, onClose, onCopyLink, onUpdateRoomCode }) {
  const [customInput, setCustomInput] = useState(roomCode || "fitalert-live-squad");
  const [copied, setCopied] = useState(false);

  const getFullShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/dashboard?room=${encodeURIComponent(customInput || roomCode)}`;
  };

  const copyToClipboard = async () => {
    const url = getFullShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (onCopyLink) onCopyLink(url);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleShareNative = async () => {
    const url = getFullShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Train with me on Fitalert Live Room",
          text: `Join my live workout room (${customInput || roomCode}) on Fitalert!`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  const handleApplyCustomCode = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onUpdateRoomCode(customInput.trim());
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <div className="share-modal-icon-badge">🔗</div>
          <div>
            <h3>Share Live Room Link</h3>
            <p>Invite friends and workout partners to train together in real-time.</p>
          </div>
          <button type="button" className="share-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="share-room-input-group">
          <label htmlFor="room-url-field">Direct Room Link (Share with anyone):</label>
          <div className="share-copy-box">
            <input
              id="room-url-field"
              type="text"
              readOnly
              value={getFullShareUrl()}
              className="share-url-input"
            />
            <button
              type="button"
              className={`button ${copied ? "button-copied" : "button-primary"}`}
              onClick={copyToClipboard}
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        <form onSubmit={handleApplyCustomCode} className="share-custom-room-form">
          <label htmlFor="custom-room-code">Room ID / Channel Name:</label>
          <div className="share-code-input-row">
            <input
              id="custom-room-code"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. power-hour-squad"
              className="share-code-input"
            />
            <button type="submit" className="button button-secondary">
              Update Room ID
            </button>
          </div>
        </form>

        <div className="share-partner-perks">
          <div className="perk-item">
            <span className="perk-icon">⚡</span>
            <div>
              <strong>Instant Join</strong>
              <small>Friends can click the link and immediately join your session without account barriers.</small>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon">📹</span>
            <div>
              <strong>Highlight Recordings</strong>
              <small>Record your collaborative workouts and preserve them permanently in your Story Highlights.</small>
            </div>
          </div>
        </div>

        <div className="share-modal-footer">
          {typeof navigator !== "undefined" && navigator.share && (
            <button type="button" className="button button-primary share-native-btn" onClick={handleShareNative}>
              📱 Share via WhatsApp, Telegram, etc.
            </button>
          )}
          <button type="button" className="button button-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
