import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { calculateAge } from "../utils/dateHelpers.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

// ─── Goal Type Constants ──────────────────────────────────────────────────────

const GOAL_TYPE_LABELS = {
  "percentage":    "Percentage of days",
  "streak":        "Consecutive days (streak)",
  "weekly":        "Days per week",
  "total-count":   "Total completions",
  "perfect-bonus": "Hit target + perfect bonus",
};

function getTargetLabel(type) {
  if (type === "percentage" || type === "perfect-bonus") return "Target (% of days)";
  if (type === "streak") return "Target (consecutive days)";
  if (type === "weekly") return "Target (days per week)";
  if (type === "total-count") return "Target (total completions)";
  return "Target";
}

// ─── Goal Settings Form ───────────────────────────────────────────────────────

function GoalSettingsForm({ goalConfig, onSave }) {
  const [form, setForm] = useState({ ...goalConfig });
  const [dirty, setDirty] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  function handleTypeChange(type) {
    setForm(prev => ({ ...prev, type }));
    setDirty(true);
  }

  function handleSave() {
    const target = parseInt(form.target);
    if (isNaN(target) || target < 1) {
      alert("Please enter a valid target.");
      return;
    }
    onSave({ ...form, target });
    setDirty(false);
  }

  function handleCancel() {
    if (!confirm("You have unsaved changes. Are you sure you want to cancel?")) return;
    setForm({ ...goalConfig });
    setDirty(false);
  }

  const showTimeRange = form.type === "percentage" || form.type === "weekly";
  const showBonusReward = form.type === "perfect-bonus";

  return (
    <>
      <div id="goal-settings-form">
        <div className="form-field">
          <label>Goal Type</label>
          <select value={form.type} onChange={e => handleTypeChange(e.target.value)}>
            {Object.entries(GOAL_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        {showTimeRange && (
          <div className="form-field">
            <label>Time Range</label>
            <select value={form.timeRange} onChange={e => update("timeRange", e.target.value)}>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        )}
        <div className="form-field">
          <label>{getTargetLabel(form.type)}</label>
          <input
            type="number"
            value={form.target}
            min="1"
            onChange={e => update("target", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Reward (Optional)</label>
          <input
            type="text"
            value={form.reward || ""}
            placeholder="e.g. Movie night, $20, Ice cream"
            onChange={e => update("reward", e.target.value)}
          />
        </div>
        {showBonusReward && (
          <div className="form-field">
            <label>Bonus Reward (for 100%)</label>
            <input
              type="text"
              value={form.bonusReward || ""}
              placeholder="e.g. Extra screen time"
              onChange={e => update("bonusReward", e.target.value)}
            />
          </div>
        )}
      </div>
      <div id="goal-settings-buttons" style={{ display: dirty ? "flex" : "none" }}>
        <button id="save-goal-btn" onClick={handleSave}>Save</button>
        <button id="cancel-goal-btn" onClick={handleCancel}>Cancel</button>
      </div>
    </>
  );
}

// ─── Kid Inline Edit Form ─────────────────────────────────────────────────────

function KidInlineEditForm({ kid, onSave, onCancel }) {
  const [name, setName] = useState(kid.name);
  const [dob, setDob] = useState(kid.dob || "");
  const [chore, setChore] = useState(kid.chores.join(", "));
  const [reward, setReward] = useState(kid.reward || "");
  const [pin, setPin] = useState(kid.pin || "");
  const [showPin, setShowPin] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(kid.photo || null);

  const isDirty = photoFile ||
    name !== kid.name ||
    dob !== (kid.dob || "") ||
    chore !== kid.chores.join(", ") ||
    reward !== (kid.reward || "") ||
    pin !== (kid.pin || "");

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!name.trim() || !chore.trim()) {
      alert("Please fill in name and task fields.");
      return;
    }
    onSave({
      ...kid,
      name: name.trim(),
      dob,
      chores: [chore.trim()],
      reward: reward.trim() || null,
      pin: pin.trim() || null,
    }, photoFile);
  }

  return (
    <div className="kid-inline-form">
      <div className="form-field">
        <label>Photo</label>
        <div className="photo-edit-wrap">
          {photoPreview
            ? <img className="photo-edit-preview" src={photoPreview} alt={kid.name} />
            : <div className="photo-edit-preview photo-edit-placeholder">{kid.name[0]}</div>
          }
          <label className="btn-photo-choose" htmlFor={`inline-photo-${kid.id}`}>Change Photo</label>
          <input type="file" id={`inline-photo-${kid.id}`} accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        </div>
      </div>
      <div className="form-field">
        <label>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Date of Birth (optional)</label>
        <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Task</label>
        <input type="text" value={chore} onChange={e => setChore(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Reward (optional)</label>
        <input type="text" value={reward} placeholder="e.g. $20, Movie night" onChange={e => setReward(e.target.value)} />
      </div>
      <div className="form-field">
        <label>PIN (optional)</label>
        <div className="pin-field-wrap">
          <input
            type={showPin ? "text" : "password"}
            value={pin}
            placeholder="4-digit PIN"
            maxLength={4}
            inputMode="numeric"
            onChange={e => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          />
          <button type="button" className="btn-pin-toggle" onClick={() => setShowPin(p => !p)}>
            {showPin ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div className="inline-form-buttons">
        <button className="btn-inline-save" disabled={!isDirty} onClick={handleSave}>Save</button>
        <button className="btn-inline-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Add Kid Form ─────────────────────────────────────────────────────────────

function AddKidForm({ onSave, onCancel }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [chore, setChore] = useState("");
  const [reward, setReward] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!name.trim() || !chore.trim()) {
      alert("Please fill in name and task fields.");
      return;
    }
    onSave({
      id: String(Date.now()),
      name: name.trim(),
      dob,
      chores: [chore.trim()],
      reward: reward.trim() || null,
      pin: pin.trim() || null,
      photo: null,
    }, photoFile);
  }

  const canSave = name.trim() && chore.trim();

  return (
    <section id="kid-form-section">
      <h2 id="kid-form-title">Add Person</h2>
      <div className="form-field">
        <label htmlFor="form-photo">Photo (optional)</label>
        <div className="photo-edit-wrap">
          {photoPreview
            ? <img id="form-photo-preview" className="photo-edit-preview" src={photoPreview} alt="preview" />
            : <div id="form-photo-preview" className="photo-edit-preview photo-edit-placeholder">?</div>
          }
          <label className="btn-photo-choose" htmlFor="form-photo">Choose Photo</label>
          <input type="file" id="form-photo" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="form-name">Name</label>
        <input type="text" id="form-name" placeholder="First name" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="form-dob">Date of Birth (optional)</label>
        <input type="date" id="form-dob" value={dob} onChange={e => setDob(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="form-chore">Task</label>
        <input type="text" id="form-chore" placeholder="e.g. Clean Living Room" value={chore} onChange={e => setChore(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="form-reward">Reward (optional)</label>
        <input type="text" id="form-reward" placeholder="e.g. $20, Movie night" value={reward} onChange={e => setReward(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="form-pin">PIN (optional)</label>
        <div className="pin-field-wrap">
          <input
            type={showPin ? "text" : "password"}
            id="form-pin"
            placeholder="4-digit PIN"
            maxLength={4}
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          />
          <button type="button" className="btn-pin-toggle" onClick={() => setShowPin(p => !p)}>
            {showPin ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div id="kid-form-buttons">
        <button id="save-kid-btn" disabled={!canSave} onClick={handleSave}>Save</button>
        <button id="cancel-kid-btn" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}

// ─── Kid List ─────────────────────────────────────────────────────────────────

function KidList({ kids, log, onEdit, onRemove, onArchive, onUnarchive, editingKidId, onSaveEdit, onCancelEdit }) {
  const active = kids.filter(k => !k.archived).sort((a, b) => a.dob < b.dob ? -1 : 1);
  const archived = kids.filter(k => k.archived).sort((a, b) => a.dob < b.dob ? -1 : 1);

  function KidRow({ kid }) {
    const age = kid.dob ? calculateAge(kid.dob) : null;
    const hasHistory = log.some(e => e.kidId === kid.id);

    return (
      <div className="settings-kid-row">
        <div className="settings-kid-info">
          <strong>{kid.name}</strong>
          <span>{age !== null ? `Age ${age} • ` : ""}{kid.chores.join(", ")}</span>
        </div>
        <div className="settings-kid-actions">
          <button className="btn-edit" onClick={() => onEdit(kid.id)}>Edit</button>
          {hasHistory
            ? <button className="btn-archive" onClick={() => onArchive(kid.id)}>Archive</button>
            : <button className="btn-remove" onClick={() => onRemove(kid.id)}>Delete</button>
          }
        </div>
      </div>
    );
  }

  if (kids.length === 0) return <p>No kids added yet.</p>;

  return (
    <div id="settings-kids-list">
      {active.map(kid => (
        <div key={kid.id}>
          <KidRow kid={kid} />
          {editingKidId === kid.id && (
            <KidInlineEditForm
              key={kid.id}
              kid={kid}
              onSave={onSaveEdit}
              onCancel={onCancelEdit}
            />
          )}
        </div>
      ))}
      {archived.length > 0 && (
        <>
          <p className="archived-section-label">Archived</p>
          {archived.map(kid => (
            <div key={kid.id} className="settings-kid-row archived">
              <div className="settings-kid-info">
                <strong>{kid.name}</strong>
                <span>{kid.dob ? `Age ${calculateAge(kid.dob)} • ` : ""}{kid.chores.join(", ")}</span>
              </div>
              <div className="settings-kid-actions">
                <button className="btn-unarchive" onClick={() => onUnarchive(kid.id)}>Unarchive</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

export default function SettingsView() {
  const { kids, log, goalConfig, saveKid, removeKid, archiveKid, unarchiveKid, updateGoalConfig, showToast } = useApp();
  const navigate = useNavigate();
  const [editingKidId, setEditingKidId] = useState(null);
  const [addingKid, setAddingKid] = useState(false);

  async function handleSaveKid(kidData, photoFile) {
    showToast(photoFile ? "Uploading photo…" : "Saving…");
    await saveKid(kidData, photoFile);
    setEditingKidId(null);
    setAddingKid(false);
    showToast("Changes saved.");
  }

  async function handleRemove(kidId) {
    const hasHistory = log.some(e => e.kidId === kidId);
    if (hasHistory) {
      alert("This person has logged history and cannot be deleted. Use Archive instead.");
      return;
    }
    if (!confirm("Permanently delete this person? This cannot be undone.")) return;
    await removeKid(kidId);
  }

  async function handleArchive(kidId) {
    if (!confirm("Archive this person? They will be hidden from the app but their history will be preserved.")) return;
    await archiveKid(kidId);
  }

  async function handleGoalSave(newConfig) {
    await updateGoalConfig(newConfig);
    showToast("Goal settings saved.");
  }

  return (
    <>
      <Header />
      <div id="settings-view">
        <button id="settings-back-btn" onClick={() => navigate("/dashboard")}>← Back</button>

        <section>
          <h2>People</h2>
          <KidList
            kids={kids}
            log={log}
            onEdit={id => { setEditingKidId(id === editingKidId ? null : id); setAddingKid(false); }}
            onRemove={handleRemove}
            onArchive={handleArchive}
            onUnarchive={unarchiveKid}
            editingKidId={editingKidId}
            onSaveEdit={handleSaveKid}
            onCancelEdit={() => setEditingKidId(null)}
          />
          {!addingKid && (
            <button id="add-kid-btn" onClick={() => { setAddingKid(true); setEditingKidId(null); }}>+ Add Person</button>
          )}
        </section>

        {addingKid && (
          <AddKidForm
            onSave={handleSaveKid}
            onCancel={() => setAddingKid(false)}
          />
        )}

        <section>
          <h2>Goal &amp; Reward</h2>
          <p className="settings-hint">Define how they earn their reward and what they're working toward.</p>
          <GoalSettingsForm goalConfig={goalConfig} onSave={handleGoalSave} />
        </section>
      </div>
      <Footer />
    </>
  );
}
