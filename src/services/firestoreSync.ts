import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { TrainingPlan, WorkoutSession, DailyHydration, WeightEntry } from '../types/workout';

// Firestore collection names
const PLANS_COLLECTION = 'plans';
const SESSIONS_COLLECTION = 'sessions';

/**
 * Fetch plans stored in Firestore for this user
 */
export async function fetchUserPlansFromFirestore(userId: string): Promise<TrainingPlan[]> {
  try {
    const q = query(collection(db, PLANS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const plans: TrainingPlan[] = [];
    snapshot.forEach((d) => {
      plans.push(d.data() as TrainingPlan);
    });
    return plans;
  } catch (error) {
    console.warn('Error fetching plans from Firestore:', error);
    return [];
  }
}

/**
 * Save or update a single plan to Firestore
 */
export async function syncPlanToFirestore(plan: TrainingPlan, userId: string): Promise<void> {
  try {
    const planRef = doc(db, PLANS_COLLECTION, plan.id);
    await setDoc(planRef, {
      ...plan,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error syncing plan to Firestore:', error);
  }
}

/**
 * Sync entire list of plans to Firestore
 */
export async function syncAllPlansToFirestore(plans: TrainingPlan[], userId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const plan of plans) {
      const planRef = doc(db, PLANS_COLLECTION, plan.id);
      batch.set(planRef, {
        ...plan,
        userId,
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
  } catch (error) {
    console.warn('Error batch syncing plans:', error);
  }
}

/**
 * Delete a plan from Firestore
 */
export async function deletePlanFromFirestore(planId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PLANS_COLLECTION, planId));
  } catch (error) {
    console.warn('Error deleting plan from Firestore:', error);
  }
}

/**
 * Fetch all workout sessions stored in Firestore for this user
 */
export async function fetchUserSessionsFromFirestore(userId: string): Promise<WorkoutSession[]> {
  try {
    const q = query(collection(db, SESSIONS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const sessions: WorkoutSession[] = [];
    snapshot.forEach((d) => {
      sessions.push(d.data() as WorkoutSession);
    });
    // Sort descending by date
    sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sessions;
  } catch (error) {
    console.warn('Error fetching sessions from Firestore:', error);
    return [];
  }
}

/**
 * Save a new completed session to Firestore
 */
export async function saveSessionToFirestore(
  session: WorkoutSession,
  userId: string
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, session.id);
    await setDoc(sessionRef, {
      ...session,
      userId,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error saving session to Firestore:', error);
  }
}

/**
 * Delete a session from Firestore
 */
export async function deleteSessionFromFirestore(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
  } catch (error) {
    console.warn('Error deleting session from Firestore:', error);
  }
}

/**
 * Sync user health metrics (hydration and weight) to Firestore user document
 */
export async function syncUserHealthToFirestore(
  userId: string,
  data: {
    hydrationHistory: Record<string, DailyHydration>;
    waterGoal: number;
    weightEntries: WeightEntry[];
  }
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        healthMetrics: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Error syncing health metrics to Firestore:', error);
  }
}

/**
 * Fetch health metrics from Firestore
 */
export async function fetchUserHealthFromFirestore(
  userId: string
): Promise<{
  hydrationHistory?: Record<string, DailyHydration>;
  waterGoal?: number;
  weightEntries?: WeightEntry[];
} | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return data.healthMetrics || null;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching health metrics from Firestore:', error);
    return null;
  }
}
