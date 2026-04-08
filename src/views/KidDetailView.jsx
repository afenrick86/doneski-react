import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getGoalProgress } from "../utils/goalHelpers.js";
import { calculateAge, formatDate, getDaysInMonth } from "../utils/dateHelpers.js";
import ProgressBar from "../components/ProgressBar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

// ─── Kid Header ───────────────────────────────────────────────────────────────

function KidHeader({ kid, goalConfig, onPhotoChange }) {
  const age = kid.dob ? calculateAge(kid.dob) : null;
  const reward = kid.reward || goalConfig.reward || "";
  const taskText = kid.chores.join(", ");

  return (
    <div id="kid-header">
      <div className="detail-header-row">
        <div className="detail-header-text">
          <h2>{kid.name}</h2>
          {age !== null
            ? <p>Age {age} &bull; {taskText}</p>
            : <p>{taskText}</p>
          }
          {reward && <p className="kid-chore-label">Reward: <strong>{reward}</strong></p>}
        </div>
        <div className="detail-photo-wrap">
          {kid.photo
            ? <img className="detail-photo" src={kid.photo} alt={kid.name} />
            : <div className="detail-photo detail-photo-placeholder">{kid.name[0]}</div>
          }
          <label className="detail-photo-edit-btn" htmlFor="detail-photo-input" title="Change photo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </label>
          <input type="file" id="detail-photo-input" accept="image/*" style={{ display: "none" }} onChange={onPhotoChange} />
        </div>
      </div>
    </div>
  );
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthCalendar({ kidId, log, selectedDate, onSelectDate }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const totalDays = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  const entryMap = {};
  log.forEach(e => {
    if (e.kidId === kidId) entryMap[e.date] = e.completed;
  });

  const cells = [];

  DAY_LABELS.forEach(label => {
    cells.push(<div key={`hdr-${label}`} className="cal-header">{label}</div>);
  });

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`blank-${i}`} className="cal-day cal-blank" />);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;
    const isFuture = day > today;
    const isToday = day === today;
    const isSelected = dateStr === selectedDate;

    let status = "unlogged";
    if (!isFuture) {
      status = entryMap[dateStr] === true ? "complete" : "incomplete";
    }

    const classes = [
      "cal-day",
      `cal-${status}`,
      isToday ? "cal-today" : "",
      isSelected ? "cal-selected" : "",
    ].filter(Boolean).join(" ");

    cells.push(
      <div
        key={dateStr}
        className={classes}
        style={!isFuture ? { cursor: "pointer" } : undefined}
        onClick={!isFuture ? () => onSelectDate(dateStr) : undefined}
      >
        {day}
      </div>
    );
  }

  return <div className="calendar-grid">{cells}</div>;
}

// ─── Log Controls ─────────────────────────────────────────────────────────────

function LogControls({ selectedDate, kidId, log, onLog }) {
  if (!selectedDate) {
    return <p id="log-prompt">Select a day on the calendar below.</p>;
  }

  const entry = log.find(e => e.kidId === kidId && e.date === selectedDate);
  const isComplete = entry?.completed === true;

  return (
    <div id="log-controls">
      <p id="selected-date-label">{formatDate(selectedDate)}</p>
      <div id="log-buttons">
        <button
          id="mark-complete"
          className={isComplete ? "active" : ""}
          onClick={() => onLog(selectedDate, true)}
        >
          ✓ Doneski
        </button>
        <button
          id="mark-incomplete"
          className={!isComplete ? "active" : ""}
          onClick={() => onLog(selectedDate, false)}
        >
          ✗ Not Doneski
        </button>
      </div>
    </div>
  );
}

// ─── Progress Section ─────────────────────────────────────────────────────────

function ProgressSection({ kidId, log, goalConfig, kid }) {
  const progress = getGoalProgress(kidId, log, goalConfig);
  const reward = kid.reward || goalConfig.reward || "";

  return (
    <div id="progress-details">
      <div className="progress-block">
        <p className="goal-target-label">{progress.targetLabel}</p>
        <p><strong>{progress.label}</strong></p>
        <ProgressBar percent={progress.barPercent} />
        <p className="goal-detail">{progress.detail}</p>
        {progress.achieved && (
          <p className="goal-achieved">
            🎉 Goal reached!{reward ? <> Reward: <strong>{reward}</strong></> : ""}
          </p>
        )}
        {progress.bonusAchieved && goalConfig.bonusReward && (
          <p className="goal-achieved">⭐ Bonus unlocked: <strong>{goalConfig.bonusReward}</strong></p>
        )}
        {!progress.achieved && reward && (
          <p className="goal-reward-hint">Reward: <strong>{reward}</strong></p>
        )}
      </div>
    </div>
  );
}

// ─── KidDetailView ────────────────────────────────────────────────────────────

export default function KidDetailView() {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const { kids, log, goalConfig, logEntry, autoLogToday, saveKid, showToast } = useApp();
  const [selectedDate, setSelectedDate] = useState(null);
  const photoPreviewRef = useRef(null);

  const kid = kids.find(k => k.id === kidId);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!kid) return;
    autoLogToday(kidId);
  }, [kidId, kid, autoLogToday]);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) URL.revokeObjectURL(photoPreviewRef.current);
    };
  }, []);

  if (!kid) return null;

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (photoPreviewRef.current) URL.revokeObjectURL(photoPreviewRef.current);
    photoPreviewRef.current = previewUrl;
    try {
      await saveKid({ ...kid, photo: previewUrl }, file);
      showToast("Photo updated!");
    } catch {
      showToast("Photo upload failed.");
    }
  }

  async function handleLog(date, completed) {
    await logEntry(kidId, date, completed);
  }

  return (
    <>
      <Header />
      <div id="kid-view">
        <button id="back-btn" onClick={() => navigate("/")}>← Back</button>

        <KidHeader kid={kid} goalConfig={goalConfig} onPhotoChange={handlePhotoChange} />

        <section id="log-section">
          <h2>Log your progress</h2>
          <LogControls
            selectedDate={selectedDate}
            kidId={kidId}
            log={log}
            onLog={handleLog}
          />
        </section>

        <section id="month-log">
          <h2>This Month's Progress</h2>
          <MonthCalendar
            kidId={kidId}
            log={log}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </section>

        <section id="kid-progress">
          <h2>Progress &amp; Reward</h2>
          <ProgressSection kidId={kidId} log={log} goalConfig={goalConfig} kid={kid} />
        </section>
      </div>
      <Footer />
    </>
  );
}
