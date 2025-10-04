// registerUser.tsx
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

type Role = 'entrevistador' | 'empleador';

export async function registerUser(email: string, password: string, role: Role) {
  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Guardar rol en Firestore bajo colección "users" con doc id = uid
    await setDoc(doc(db, 'users', uid), { role });

    console.log(`Usuario registrado con uid: ${uid} y rol: ${role}`);
    return { uid, role };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}
