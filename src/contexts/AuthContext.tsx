import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signOut as firebaseSignOut } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { UserProfile, Role } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isInitialLoading: boolean;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  unlockWithPin: (pin: string) => boolean;
  createPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
  lockSession: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Admin: 3 hours, Shopkeeper: 15 minutes
const ADMIN_TIMEOUT = 3 * 60 * 60 * 1000;
const SHOPKEEPER_TIMEOUT = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserProfile(snapshot.val() as UserProfile);
        } else {
          // Default to Admin if they are the first user, or just shopkeeper
          // For safety, assigning default admin to first logged in user to demo fully
          const isAdmin = currentUser.email === "harshvardhantiwari39@gmail.com";
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            role: isAdmin ? "Admin" : "Shopkeeper",
            pin: "",
          };
          await set(userRef, newProfile);
          setUserProfile(newProfile);
        }
        // Always start locked if we require a PIN, unless setting up
        setIsLocked(true);
      } else {
        setUserProfile(null);
        setIsLocked(false);
      }
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Session Timeout Setup
  useEffect(() => {
    if (!user || !userProfile || isLocked) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      const timeoutMs = userProfile.role === "Admin" ? ADMIN_TIMEOUT : SHOPKEEPER_TIMEOUT;
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMs);
    };

    // Listen to user interaction to reset timer
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => document.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => document.removeEventListener(evt, resetTimer));
    };
  }, [user, userProfile, isLocked]);

  const unlockWithPin = (enteredPin: string) => {
    if (userProfile?.pin === enteredPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const createPin = async (newPin: string) => {
    if (user && userProfile) {
      const userRef = ref(db, `users/${user.uid}`);
      const updatedProfile = { ...userProfile, pin: newPin };
      await set(userRef, updatedProfile);
      setUserProfile(updatedProfile);
      setIsLocked(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setIsLocked(false);
  };

  const lockSession = () => {
    setIsLocked(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isInitialLoading,
        isLocked,
        setLocked: setIsLocked,
        unlockWithPin,
        createPin,
        logout,
        lockSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
