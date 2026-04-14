import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import LoginView from "./views/LoginView.jsx";
import HomeView from "./views/HomeView.jsx";
import KidDetailView from "./views/KidDetailView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import Toast from "./components/Toast.jsx";
import PinModal from "./components/PinModal.jsx";
import FeedbackModal from "./components/FeedbackModal.jsx";

export default function App() {
  const {
    authLoading, currentUser, userRole, userKidId,
    loading, toastMessage, setToastMessage, pinModalKidId, feedbackModalOpen,
  } = useApp();

  if (authLoading) return <LoadingSpinner />;
  if (!currentUser) return <LoginView />;
  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        {userRole === "kid" ? (
          // Kids see only their own detail page
          <>
            <Route path="/kid/:kidId" element={<KidDetailView />} />
            <Route path="*" element={<Navigate to={`/kid/${userKidId}`} replace />} />
          </>
        ) : (
          // Parents have full access
          <>
            <Route path="/" element={<HomeView />} />
            <Route path="/kid/:kidId" element={<KidDetailView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}
      {pinModalKidId && <PinModal />}
      {feedbackModalOpen && <FeedbackModal />}
    </>
  );
}
