import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getGoalProgress } from "../utils/goalHelpers.js";
import { calculateAge } from "../utils/dateHelpers.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function DashboardView() {
  const { kids, log, goalConfig } = useApp();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const activeKids = kids.filter(k => !k.archived);

  let totalPercent = 0;
  let goalsAchieved = 0;
  activeKids.forEach(kid => {
    const progress = getGoalProgress(kid.id, log, goalConfig);
    totalPercent += progress.percent;
    if (progress.achieved) goalsAchieved++;
  });
  const groupRate = activeKids.length > 0 ? Math.round(totalPercent / activeKids.length) : 0;

  const sorted = activeKids.slice().sort((a, b) => {
    if (!a.dob) return 1;
    if (!b.dob) return -1;
    return a.dob < b.dob ? -1 : 1;
  });

  return (
    <>
      <Header />
      <div id="dashboard-view">
        <button id="dashboard-back-btn" onClick={() => navigate("/")}>← Back</button>

        <section>
          <h2>Group Overview</h2>
          <div id="dashboard-widgets">
            <div className="stat-card">
              <div className="stat-value">{groupRate}%</div>
              <div className="stat-label">Group Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{goalsAchieved} / {activeKids.length}</div>
              <div className="stat-label">Goals Achieved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{goalConfig.reward || "—"}</div>
              <div className="stat-label">Current Reward</div>
            </div>
          </div>
        </section>

        <section>
          <h2>Individual Overview</h2>
          <div id="dashboard-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Progress</th>
                  <th>%</th>
                  <th>Reward</th>
                  <th>Achieved</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(kid => {
                  const progress = getGoalProgress(kid.id, log, goalConfig);
                  const age = kid.dob ? calculateAge(kid.dob) : null;
                  const reward = kid.reward || goalConfig.reward || "—";
                  return (
                    <tr key={kid.id}>
                      <td><strong>{kid.name}</strong>{age !== null ? ` (${age})` : ""}</td>
                      <td>{progress.label}</td>
                      <td>{progress.barPercent}%</td>
                      <td>{reward}</td>
                      <td>{progress.achieved ? "✓" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div id="settings-btn-wrap">
          <button id="open-settings-btn" onClick={() => navigate("/settings")}>Manage People</button>
        </div>
      </div>
      <Footer />
    </>
  );
}
