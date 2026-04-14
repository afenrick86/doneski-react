import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import {
  signIn as authSignIn,
  signOut as authSignOut,
  createParentAccount as authCreateParent,
  createKidAuthAccount,
  resetKidPassword as authResetKidPassword,
  getUserDoc,
} from "../services/auth.js";
import { fetchKids, saveKidDoc, deleteKidDoc } from "../services/kids.js";
import { fetchLog, saveLogEntry } from "../services/log.js";
import { fetchGoalConfig, saveGoalConfig } from "../services/settings.js";
import { uploadKidPhoto } from "../services/storage.js";
import { todayString } from "../utils/dateHelpers.js";

const DEFAULT_GOAL_CONFIG = {
  type: "percentage",
  timeRange: "month",
  target: 80,
  reward: "",
  bonusTarget: 100,
  bonusReward: "",
};

const DEFAULT_KIDS = [
  { id: "1", name: "Ally",     dob: "2012-03-16", chores: ["Clean Living Room"],           photo: "Photos/ally.jpeg" },
  { id: "2", name: "Olivia",   dob: "2012-12-11", chores: ["Clean Playroom"],              photo: "Photos/olivia.jpeg" },
  { id: "3", name: "Piper",    dob: "2013-06-28", chores: ["Guest and Upstairs Bathroom"], photo: "Photos/piper.jpeg" },
  { id: "4", name: "Marivel",  dob: "2014-11-13", chores: ["Clean Playroom"],              photo: "Photos/marivel.jpeg" },
  { id: "5", name: "Caroline", dob: "2015-08-04", chores: ["Clean Playroom"],              photo: "Photos/caroline.jpeg" },
  { id: "6", name: "Vivi",     dob: "2016-10-19", chores: ["Load/Unload Dishwasher"],      photo: "Photos/vivi.jpeg" },
  { id: "7", name: "Wren",     dob: "2017-10-08", chores: ["Feed dogs"],                   photo: "Photos/wren.jpeg" },
  { id: "8", name: "Emilio",   dob: "2021-11-12", chores: ["Pick up toys"],                photo: "Photos/emilio.jpeg" },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // "parent" | "kid" | null
  const [userKidId, setUserKidId] = useState(null);

  // App data state
  const [kids, setKids] = useState([]);
  const [log, setLog] = useState([]);
  const [goalConfig, setGoalConfig] = useState({ ...DEFAULT_GOAL_CONFIG });
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [pinModalKidId, setPinModalKidId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.isAnonymous) {
        // Legacy anonymous session — sign out and require real login
        await authSignOut();
        return;
      }

      if (user) {
        setCurrentUser(user);
        const userDoc = await getUserDoc(user.uid);
        setUserRole(userDoc?.role || null);
        setUserKidId(userDoc?.kidId || null);

        setLoading(true);
        let loadedKids = await fetchKids();
        if (loadedKids.length === 0) {
          for (const kid of DEFAULT_KIDS) {
            await saveKidDoc(kid.id, kid);
          }
          loadedKids = DEFAULT_KIDS;
        }
        const loadedConfig = await fetchGoalConfig();
        const loadedLog = await fetchLog();
        setKids(loadedKids);
        setGoalConfig(loadedConfig || { ...DEFAULT_GOAL_CONFIG });
        setLog(loadedLog);
        setLoading(false);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserKidId(null);
        setKids([]);
        setLog([]);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // ─── Auth actions ────────────────────────────────────────────────────────────

  const signIn = useCallback(async (username, password) => {
    await authSignIn(username, password);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const createParentAccount = useCallback(async (username, password) => {
    await authCreateParent(username, password);
  }, []);

  const createKidAccount = useCallback(async (kidId, username, password) => {
    const { uid, username: savedUsername } = await createKidAuthAccount(kidId, username, password);
    const kid = kids.find(k => k.id === kidId);
    const updated = { ...kid, uid, username: savedUsername };
    await saveKidDoc(kidId, updated);
    setKids(prev => prev.map(k => k.id === kidId ? updated : k));
  }, [kids]);

  const resetKidPassword = useCallback(async (username, currentPassword, newPassword) => {
    await authResetKidPassword(username, currentPassword, newPassword);
  }, []);

  // ─── UI actions ──────────────────────────────────────────────────────────────

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const requestKidAccess = useCallback((kidId, navigateFn) => {
    navigateFn(`/kid/${kidId}`);
  }, []);

  const closePinModal = useCallback(() => {
    setPinModalKidId(null);
  }, []);

  const openFeedbackModal = useCallback(() => setFeedbackModalOpen(true), []);
  const closeFeedbackModal = useCallback(() => setFeedbackModalOpen(false), []);

  // ─── Data mutations ──────────────────────────────────────────────────────────

  const logEntry = useCallback(async (kidId, date, completed) => {
    setLog(prev => {
      const existing = prev.find(e => e.kidId === kidId && e.date === date);
      if (existing) {
        return prev.map(e => e.kidId === kidId && e.date === date ? { ...e, completed } : e);
      }
      return [...prev, { kidId, date, completed }];
    });
    await saveLogEntry(kidId, date, completed);
  }, []);

  const autoLogToday = useCallback(async (kidId) => {
    const today = todayString();
    const exists = log.some(e => e.kidId === kidId && e.date === today);
    if (!exists) {
      await logEntry(kidId, today, false);
    }
  }, [log, logEntry]);

  const saveKid = useCallback(async (kidData, photoFile) => {
    let photo = kidData.photo || null;
    if (photoFile) {
      photo = await uploadKidPhoto(kidData.id, photoFile);
    }
    const updated = { ...kidData, photo };
    await saveKidDoc(updated.id, updated);
    setKids(prev => {
      const exists = prev.find(k => k.id === updated.id);
      if (exists) return prev.map(k => k.id === updated.id ? updated : k);
      return [...prev, updated];
    });
  }, []);

  const removeKid = useCallback(async (kidId) => {
    await deleteKidDoc(kidId);
    setKids(prev => prev.filter(k => k.id !== kidId));
  }, []);

  const archiveKid = useCallback(async (kidId) => {
    const kid = kids.find(k => k.id === kidId);
    const updated = { ...kid, archived: true };
    await saveKidDoc(kidId, updated);
    setKids(prev => prev.map(k => k.id === kidId ? updated : k));
  }, [kids]);

  const unarchiveKid = useCallback(async (kidId) => {
    const kid = kids.find(k => k.id === kidId);
    const updated = { ...kid, archived: false };
    await saveKidDoc(kidId, updated);
    setKids(prev => prev.map(k => k.id === kidId ? updated : k));
  }, [kids]);

  const updateGoalConfig = useCallback(async (newConfig) => {
    await saveGoalConfig(newConfig);
    setGoalConfig(newConfig);
  }, []);

  return (
    <AppContext.Provider value={{
      authLoading, currentUser, userRole, userKidId,
      kids, log, goalConfig, loading,
      toastMessage, setToastMessage,
      pinModalKidId, setPinModalKidId,
      feedbackModalOpen,
      signIn, signOut, createParentAccount, createKidAccount, resetKidPassword,
      showToast,
      requestKidAccess,
      closePinModal,
      openFeedbackModal,
      closeFeedbackModal,
      logEntry,
      autoLogToday,
      saveKid,
      removeKid,
      archiveKid,
      unarchiveKid,
      updateGoalConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
