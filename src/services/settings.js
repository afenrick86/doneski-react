import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function fetchGoalConfig() {
  const snap = await getDoc(doc(db, "settings", "goal-config"));
  return snap.exists() ? snap.data() : null;
}

export async function saveGoalConfig(config) {
  await setDoc(doc(db, "settings", "goal-config"), config);
}
