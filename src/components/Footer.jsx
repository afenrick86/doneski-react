import { useApp } from "../context/AppContext.jsx";

const TAGLINES = ["Powered by bad ideas and AI"];

export default function Footer() {
  const { openFeedbackModal } = useApp();
  const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

  return (
    <>
      <div id="feedback-btn-wrap">
        <button id="feedback-btn" onClick={openFeedbackModal}>Send Feedback</button>
      </div>
      <footer id="site-footer">
        <p id="footer-tagline">{tagline}</p>
      </footer>
    </>
  );
}
