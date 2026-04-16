import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { UserDoc, User } from "./types";

export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as UserDoc;
    return {
      ...data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : (data.createdAt instanceof Date ? data.createdAt : new Date()),
    };
  }

  return null;
};

export const createUserDoc = async (
  uid: string,
  email: string,
  photoURL: string | null
): Promise<User> => {
  const userRef = doc(db, "users", uid);
  
  const newUserDoc: Omit<UserDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid,
    email,
    displayName: "",
    photoURL,
    role: "member",
    createdAt: serverTimestamp(),
    onboardingComplete: false,
  };

  await setDoc(userRef, newUserDoc);

  return {
    ...newUserDoc,
    createdAt: new Date(),
  };
};

export const completeOnboarding = async (uid: string, displayName: string): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    displayName,
    onboardingComplete: true,
  });
};
