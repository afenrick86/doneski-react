import { collection, doc, setDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { db } from "../firebase.js";

export async function submitFeedback(name, message) {
  const timestamp = new Date().toISOString();
  await setDoc(doc(collection(db, "feedback")), {
    name: name || "Anonymous",
    body: message,
    timestamp,
  });

  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    { name: name || "Anonymous", message, timestamp }
  );
}
