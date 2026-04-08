import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";
import { submitFeedback } from "../services/feedback.js";

export default function FeedbackModal() {
  const { closeFeedbackModal, showToast } = useApp();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await submitFeedback(name.trim(), message.trim());
      closeFeedbackModal();
      showToast("Feedback sent. Thanks!");
    } catch (e) {
      console.error("Feedback submission failed:", e);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div id="feedback-modal">
      <div id="feedback-modal-backdrop" onClick={closeFeedbackModal} />
      <div id="feedback-modal-card">
        <h2>Send Feedback</h2>
        <p id="feedback-modal-hint">Got an idea or ran into something broken? Let us know.</p>
        <div className="form-field">
          <label htmlFor="feedback-name">Name (optional)</label>
          <input
            type="text"
            id="feedback-name"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="feedback-message">Message</label>
          <textarea
            id="feedback-message"
            ref={textareaRef}
            placeholder="What's on your mind?"
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
        <div id="feedback-modal-buttons">
          <button id="feedback-submit-btn" disabled={!message.trim() || submitting} onClick={handleSubmit}>
            Submit
          </button>
          <button id="feedback-cancel-btn" onClick={closeFeedbackModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
