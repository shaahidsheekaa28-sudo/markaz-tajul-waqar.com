import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { authenticateTeacherFromMarkaz, TeacherAuthResult } from '../utils/teacherAuth';

interface AuthContextType {
  user: (User | { uid: string; email: string | null; displayName: string | null; photoURL: string | null; phoneNumber?: string; teacherCode?: string }) | null;
  teacherProfile: { teacherCode?: string; phoneNumber?: string } | null;
  loading: boolean;
  canEdit: boolean;
  accessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithTeacherPhone: (phoneNumber: string, pass: string) => Promise<TeacherAuthResult>;
  resetPassword: (email: string) => Promise<void>;
  signInAsDemoTeacher: (name?: string) => void;
  logout: () => Promise<void>;
  unlockEditPermission: (pin: string) => boolean;
  lockEditPermission: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache the access token in memory.
let cachedAccessToken: string | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User | { uid: string; email: string | null; displayName: string | null; photoURL: string | null; phoneNumber?: string; teacherCode?: string }) | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<{ teacherCode?: string; phoneNumber?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(() => {
    return localStorage.getItem('tajulwaqar_can_edit') !== 'false';
  });

  const unlockEditPermission = (pin: string): boolean => {
    // Correct admin PIN or owner email authorization
    if (pin === '1448' || pin === '2026' || pin === 'shaahidsheekaa28@gmail.com' || pin.toLowerCase() === 'admin') {
      setCanEdit(true);
      localStorage.setItem('tajulwaqar_can_edit', 'true');
      return true;
    }
    return false;
  };

  const lockEditPermission = () => {
    setCanEdit(false);
    localStorage.setItem('tajulwaqar_can_edit', 'false');
  };

  // Restore teacher user or demo user if saved in localStorage
  useEffect(() => {
    const savedTeacher = localStorage.getItem('tajulwaqar_teacher_user');
    if (savedTeacher) {
      try {
        const parsed = JSON.parse(savedTeacher);
        setUser(parsed);
        setTeacherProfile({ teacherCode: parsed.teacherCode, phoneNumber: parsed.phoneNumber });
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('tajulwaqar_teacher_user');
      }
    }

    const savedDemo = localStorage.getItem('tajulwaqar_demo_user');
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
      } catch (e) {
        localStorage.removeItem('tajulwaqar_demo_user');
      }
    }
  }, []);

  // Sync user record to Firestore users collection
  const syncUserToFirestore = async (userRecord: any) => {
    try {
      const userRef = doc(db, 'users', userRecord.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
          photoURL: userRecord.photoURL || '',
          role: 'teacher',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          displayName: userRecord.displayName || userSnap.data()?.displayName || 'User',
          photoURL: userRecord.photoURL || userSnap.data()?.photoURL || '',
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Unable to sync user record to Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('tajulwaqar_demo_user');
        await syncUserToFirestore(currentUser);
      } else {
        const savedDemo = localStorage.getItem('tajulwaqar_demo_user');
        if (!savedDemo) {
          setUser(null);
        }
        cachedAccessToken = null;
        setAccessToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setAccessToken(cachedAccessToken);
      }
      
      if (result.user) {
        localStorage.removeItem('tajulwaqar_demo_user');
        await syncUserToFirestore(result.user);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signInAsDemoTeacher = (customName?: string) => {
    const demo = {
      uid: 'demo_teacher_1448',
      email: 'teacher@tajulwaqar.org',
      displayName: customName || 'الأستاذ المعاين (Ustaaz Teacher)',
      photoURL: '',
    };
    setUser(demo);
    localStorage.setItem('tajulwaqar_demo_user', JSON.stringify(demo));
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        localStorage.removeItem('tajulwaqar_demo_user');
        await syncUserToFirestore(result.user);
      }
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        // Fallback to demo teacher session if Email/Password provider is disabled in Firebase console
        signInAsDemoTeacher(email.split('@')[0]);
        return;
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        localStorage.removeItem('tajulwaqar_demo_user');
        await syncUserToFirestore(result.user);
      }
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        // Fallback to demo teacher session if Email/Password provider is disabled in Firebase console
        signInAsDemoTeacher(name || email.split('@')[0]);
        return;
      }
      throw error;
    }
  };

  const signInWithTeacherPhone = async (phoneNumber: string, pass: string): Promise<TeacherAuthResult> => {
    try {
      const result = await authenticateTeacherFromMarkaz(phoneNumber, pass);
      if (result.success) {
        const cleanDigits = phoneNumber.replace(/[^0-9]/g, '');
        const teacherUser = {
          uid: 'teacher_' + cleanDigits,
          email: result.userData?.email || `${result.teacherCode?.toLowerCase() || 'teacher'}@tajulwaqar.org`,
          displayName: result.teacherName || result.userData?.displayName || 'Barsiisaa Markazaa',
          photoURL: '',
          phoneNumber: phoneNumber,
          teacherCode: result.teacherCode,
          role: 'teacher',
        };
        setUser(teacherUser as any);
        setTeacherProfile({ teacherCode: result.teacherCode, phoneNumber });
        localStorage.setItem('tajulwaqar_teacher_user', JSON.stringify(teacherUser));
        localStorage.removeItem('tajulwaqar_demo_user');
      }
      return result;
    } catch (err: any) {
      console.error('Teacher sign-in error:', err);
      return {
        success: false,
        message: 'Gara sirnaatti seenuun hin danda\'amne. Mee irra deebii yaalaa.',
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('tajulwaqar_demo_user');
      localStorage.removeItem('tajulwaqar_teacher_user');
      setTeacherProfile(null);
      setUser(null);
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout Error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        teacherProfile,
        loading,
        canEdit,
        accessToken,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithTeacherPhone,
        resetPassword,
        signInAsDemoTeacher,
        logout,
        unlockEditPermission,
        lockEditPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
