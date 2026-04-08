import { Routes, Route } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import HomeView from "./views/HomeView.jsx";
import KidDetailView from "./views/KidDetailView.jsx";
import DashboardView from "./views/DashboardView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import Toast from "./components/Toast.jsx";
import PinModal from "./components/PinModal.jsx";
import FeedbackModal from "./components/FeedbackModal.jsx";

export default function App() {
  const { loading, toastMessage, setToastMessage, pinModalKidId, feedbackModalOpen } = useApp();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/kid/:kidId" element={<KidDetailView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}
      {pinModalKidId && <PinModal />}
      {feedbackModalOpen && <FeedbackModal />}
    </>
  );
}
