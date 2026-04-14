import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

export async function uploadKidPhoto(kidId, file) {
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const storageRef = ref(storage, `Photos/${kidId}_${timestamp}.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
