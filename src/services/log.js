import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function fetchLog() {
  const snapshot = await getDocs(collection(db, "chore-log"));
  return snapshot.docs.map(d => d.data());
}

export async function saveLogEntry(kidId, date, completed) {
  const entryKey = `${kidId}_${date}`;
  await setDoc(doc(db, "chore-log", entryKey), { kidId, date, completed });
}
