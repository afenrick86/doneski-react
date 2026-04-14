import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseConfig, auth, db } from "../firebase.js";

const LOCAL_DOMAIN = "doneski.local";

export function toEmail(username) {
  return `${username.toLowerCase().trim()}@${LOCAL_DOMAIN}`;
}

export async function signIn(username, password) {
  return signInWithEmailAndPassword(auth, toEmail(username), password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function createParentAccount(username, password) {
  const cred = await createUserWithEmailAndPassword(auth, toEmail(username), password);
  await setDoc(doc(db, "users", cred.user.uid), { role: "parent", username });
  return cred.user;
}

// Uses a secondary Firebase app instance so the parent stays signed in while
// creating a kid account (createUserWithEmailAndPassword auto-signs in).
let secondaryApp;
function getSecondaryAuth() {
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "secondary");
  }
  return getAuth(secondaryApp);
}

export async function createKidAuthAccount(kidId, username, password) {
  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secondaryAuth, toEmail(username), password);
  const uid = cred.user.uid;
  await firebaseSignOut(secondaryAuth);
  await setDoc(doc(db, "users", uid), { role: "kid", kidId, username });
  return { uid, username };
}

// Signs in as the kid on the secondary app to update their password without
// disturbing the parent's active session.
export async function resetKidPassword(username, currentPassword, newPassword) {
  const secondaryAuth = getSecondaryAuth();
  const cred = await signInWithEmailAndPassword(secondaryAuth, toEmail(username), currentPassword);
  await updatePassword(cred.user, newPassword);
  await firebaseSignOut(secondaryAuth);
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
