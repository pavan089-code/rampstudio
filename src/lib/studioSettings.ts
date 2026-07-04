import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { defaultStudioSettings } from "@/lib/studioDefaults";
import type { StudioSettings } from "@/types/notifications";

export async function getStudioSettings() {
  const snapshot = await getDoc(doc(db, "settings", "studio"));

  if (!snapshot.exists()) {
    return defaultStudioSettings;
  }

  return {
    ...defaultStudioSettings,
    ...snapshot.data(),
  } as StudioSettings;
}

export async function saveStudioSettings(settings: StudioSettings) {
  return setDoc(
    doc(db, "settings", "studio"),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
