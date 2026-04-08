import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function fetchKids() {
  const snapshot = await getDocs(collection(db, "kids"));
  return snapshot.docs.map(d => d.data());
}

export async function saveKidDoc(id, kidData) {
  await setDoc(doc(db, "kids", id), kidData);
}

export async function deleteKidDoc(id) {
  await deleteDoc(doc(db, "kids", id));
}
