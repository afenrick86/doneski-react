import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase.js";

export async function uploadKidPhoto(kidId, file) {
  const ext = file.name.split(".").pop();
  const storageRef = ref(storage, `Photos/${kidId}.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
