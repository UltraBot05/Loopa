import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import type { User, Role } from "./types";

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((d) => {
    const data = d.data() as User;
    return {
      ...data,
      uid: d.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: data.createdAt && typeof (data.createdAt as any).toDate === 'function' ? (data.createdAt as any).toDate() : new Date(),
    };
  });
};

export const updateUserRole = async (targetUid: string, newRole: Role) => {
  const userRef = doc(db, "users", targetUid);
  await updateDoc(userRef, { role: newRole });
};
