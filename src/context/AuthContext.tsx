import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  customName: string;
  age: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  isProfileModalOpen: boolean;
  needsProfileSetup: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (customName: string, age: number | null) => Promise<void>;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  profile: null,
  isProfileModalOpen: false,
  needsProfileSetup: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  openProfileModal: () => {},
  closeProfileModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Load user & profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // 1. Try local storage cache for instant rendering
        const localKey = `irontrack_profile_${currentUser.uid}`;
        const cached = localStorage.getItem(localKey);
        let currentProfile: UserProfile | null = null;
        if (cached) {
          try {
            currentProfile = JSON.parse(cached);
            setProfile(currentProfile);
          } catch (e) {
            console.warn('Error parsing cached profile:', e);
          }
        }

        // 2. Fetch from Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const data = snap.data();
            if (data.customName) {
              const loadedProfile: UserProfile = {
                customName: data.customName,
                age: typeof data.age === 'number' ? data.age : null,
              };
              setProfile(loadedProfile);
              localStorage.setItem(localKey, JSON.stringify(loadedProfile));
              setNeedsProfileSetup(false);
            } else {
              // User has document but no customName yet -> trigger form
              setNeedsProfileSetup(true);
              setIsProfileModalOpen(true);
            }
          } else {
            // First time user logged in -> create initial doc and prompt profile setup!
            await setDoc(
              userRef,
              {
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Atleta',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              },
              { merge: true }
            );
            setNeedsProfileSetup(true);
            setIsProfileModalOpen(true);
          }
        } catch (e) {
          console.warn('Could not sync user profile with firestore:', e);
          if (!currentProfile) {
            setNeedsProfileSetup(true);
            setIsProfileModalOpen(true);
          }
        }
      } else {
        setProfile(null);
        setIsProfileModalOpen(false);
        setNeedsProfileSetup(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Erro no login com Google:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const updateProfile = useCallback(
    async (customName: string, age: number | null) => {
      if (!user) return;
      const updated: UserProfile = { customName, age };
      setProfile(updated);
      setNeedsProfileSetup(false);
      setIsProfileModalOpen(false);

      const localKey = `irontrack_profile_${user.uid}`;
      localStorage.setItem(localKey, JSON.stringify(updated));

      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            customName,
            age: age || null,
            displayName: customName,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Failed to update profile in firestore:', err);
      }
    },
    [user]
  );

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profile,
        isProfileModalOpen,
        needsProfileSetup,
        signInWithGoogle,
        signOut,
        updateProfile,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
