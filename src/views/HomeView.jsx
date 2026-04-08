import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getGoalProgress } from "../utils/goalHelpers.js";
import { calculateAge } from "../utils/dateHelpers.js";
import KidPhoto from "../components/KidPhoto.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function KidCard({ kid, log, goalConfig, onPress }) {
  const age = kid.dob ? calculateAge(kid.dob) : null;
  const progress = getGoalProgress(kid.id, log, goalConfig);
  const reward = kid.reward || goalConfig.reward || "";
  const taskText = kid.chores.join(", ");

  return (
    <div className="kid-card" onClick={onPress}>
      <div className="card-top-row">
        <div className="card-name-age">
          <h2>{kid.name}</h2>
          {age !== null && <p className="kid-age">Age {age}</p>}
        </div>
        <KidPhoto kid={kid} />
      </div>
      <p className="kid-chore" title={taskText}>{taskText}</p>
      <ProgressBar percent={progress.barPercent} />
      <div className="card-bottom-row">
        <span className="kid-on-track">{progress.label} ·</span>
        {reward && <span className="kid-reward">{reward}</span>}
      </div>
    </div>
  );
}

export default function HomeView() {
  const { kids, log, goalConfig, requestKidAccess } = useApp();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const sorted = kids
    .filter(k => !k.archived)
    .sort((a, b) => (a.dob < b.dob ? -1 : 1));

  return (
    <>
      <Header />
      <div id="home-view">
        {sorted.length === 0 ? (
          <div id="empty-state">
            <div id="empty-state-icon"></div>
            <h2>Welcome to Doneski!</h2>
            <p>No goals are set up yet. Head to <strong>Manage People</strong> in the Dashboard to add your first person and configure their task and reward.</p>
            <button id="empty-state-btn" onClick={() => navigate("/settings")}>Get Started</button>
          </div>
        ) : (
          <div id="kids-grid">
            {sorted.map(kid => (
              <KidCard
                key={kid.id}
                kid={kid}
                log={log}
                goalConfig={goalConfig}
                onPress={() => requestKidAccess(kid.id, navigate)}
              />
            ))}
          </div>
        )}
        <div id="dashboard-btn-wrap">
          <button id="open-dashboard-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>
      <Footer />
    </>
  );
}
