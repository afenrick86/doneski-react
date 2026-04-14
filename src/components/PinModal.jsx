import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function PinModal() {
  const { kids, pinModalKidId, closePinModal } = useApp();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const kid = kids.find(k => k.id === pinModalKidId);

  useEffect(() => {
    if (pinModalKidId) {
      setDigits(["", "", "", ""]);
      setError(false);
    }
  }, [pinModalKidId]);

  if (!kid) return null;

  function handleChange(i, value) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);

    if (digit && i < 3) {
      inputRefs[i + 1].current?.focus();
    }

    if (i === 3 && digit) {
      submitPin([...next]);
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs[i - 1].current?.focus();
    }
  }

  function submitPin(d) {
    const entered = d.join("");
    if (entered === kid.pin) {
      closePinModal();
      navigate(`/kid/${kid.id}`);
    } else {
      setError(true);
      setDigits(["", "", "", ""]);
      setTimeout(() => inputRefs[0].current?.focus(), 50);
    }
  }

  return (
    <div id="pin-modal">
      <div id="pin-modal-backdrop" onClick={closePinModal} />
      <div id="pin-modal-card">
        <p id="pin-modal-label">Enter PIN for <strong>{kid.name}</strong></p>
        <div id="pin-inputs">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              className="pin-digit"
              type="password"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </div>
        {error && <p id="pin-error">Incorrect PIN. Try again.</p>}
        <button id="pin-cancel-btn" onClick={closePinModal}>Cancel</button>
      </div>
    </div>
  );
}
