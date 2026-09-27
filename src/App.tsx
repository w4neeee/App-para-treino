import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { WorkoutList } from './components/WorkoutList';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { Dashboard } from './components/Dashboard';
import { SessionHistory } from './components/SessionHistory';
import { ExerciseModal } from './components/ExerciseModal';
import { WorkoutModal } from './components/WorkoutModal';
import { PlanModal } from './components/PlanModal';
import { LoginGate } from './components/LoginGate';
import { ProfileModal } from './components/ProfileModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  TrainingPlan,
  Workout,
  Exercise,
  WorkoutSession,
  DayOfWeek,
  DailyHydration,
  WeightEntry,
} from './types/workout';
import {
  loadPlans,
  savePlans,
  loadActivePlanId,
  saveActivePlanId,
  loadSessions,
  saveSessions,
  saveNewSession,
  deleteSession,
  loadTodayHydration,
  addWaterIntake,
  removeWaterLog,
  loadWaterGoal,
  saveWaterGoal,
  loadHydrationHistory,
  saveHydrationHistory,
  loadWeightEntries,
  saveWeightEntries,
  addWeightEntry,
  deleteWeightEntry,
  resetTodayWaterIntake,
} from './services/storage';
import {
  fetchUserPlansFromFirestore,
  fetchUserSessionsFromFirestore,
  syncAllPlansToFirestore,
  syncPlanToFirestore,
  saveSessionToFirestore,
  deletePlanFromFirestore,
  deleteSessionFromFirestore,
  syncUserHealthToFirestore,
  fetchUserHealthFromFirestore,
} from './services/firestoreSync';

function AppContent() {
  const {
    user,
    loading,
    profile,
    isProfileModalOpen,
    needsProfileSetup,
    updateProfile,
    closeProfileModal,
  } = useAuth();
  const [currentTab, setCurrentTab] = useState<'home' | 'workouts' | 'dashboard' | 'history'>('home');

  // Core App State (defaults initialized from local storage)
  const [plans, setPlans] = useState<TrainingPlan[]>(() => loadPlans());
  const [activePlanId, setActivePlanId] = useState<string>(() => loadActivePlanId());
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadSessions());

  // Health Metrics: Hydration and Weight tracking
  const [todayHydration, setTodayHydration] = useState<DailyHydration>(() => loadTodayHydration());
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => loadWeightEntries());

  // Active workout execution player
  const [activeRunningWorkout, setActiveRunningWorkout] = useState<Workout | null>(null);

  // Modals state
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [modalWorkoutTarget, setModalWorkoutTarget] = useState<Workout | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Sync with Firestore whenever user logs in or is authenticated
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadCloudData() {
      try {
        const [cloudPlans, cloudSessions] = await Promise.all([
          fetchUserPlansFromFirestore(user!.uid),
          fetchUserSessionsFromFirestore(user!.uid),
        ]);

        if (!isMounted) return;

        // If user already has cloud plans, merge or replace
        if (cloudPlans.length > 0) {
          setPlans(cloudPlans);
          savePlans(cloudPlans);
          const active = cloudPlans.find((p) => p.isActive) || cloudPlans[0];
          if (active) {
            setActivePlanId(active.id);
            saveActivePlanId(active.id);
          }
        } else {
          // First time logging in: push existing local plans to cloud so user never loses them!
          const currentLocalPlans = loadPlans();
          await syncAllPlansToFirestore(currentLocalPlans, user!.uid);
        }

        // If user has cloud sessions, use them; otherwise backup local sessions
        if (cloudSessions.length > 0) {
          setSessions(cloudSessions);
          saveSessions(cloudSessions);
        } else {
          const currentLocalSessions = loadSessions();
          for (const s of currentLocalSessions) {
            await saveSessionToFirestore(s, user!.uid);
          }
        }

        // Sync Health Metrics (Water & Weight)
        const cloudHealth = await fetchUserHealthFromFirestore(user!.uid);
        if (cloudHealth) {
          if (cloudHealth.hydrationHistory) {
            saveHydrationHistory(cloudHealth.hydrationHistory);
            setTodayHydration(loadTodayHydration());
          }
          if (cloudHealth.waterGoal) {
            saveWaterGoal(cloudHealth.waterGoal);
          }
          if (cloudHealth.weightEntries && cloudHealth.weightEntries.length > 0) {
            saveWeightEntries(cloudHealth.weightEntries);
            setWeightEntries(cloudHealth.weightEntries);
          }
        } else {
          await syncUserHealthToFirestore(user!.uid, {
            hydrationHistory: loadHydrationHistory(),
            waterGoal: loadWaterGoal(),
            weightEntries: loadWeightEntries(),
          });
        }
      } catch (err) {
        console.warn('Failed cloud sync:', err);
      }
    }

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync to local storage for fast instant load & offline resilience
  useEffect(() => {
    savePlans(plans);
  }, [plans]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Current active plan
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;

  // Plan Management Handlers
  const handleSelectPlan = (id: string) => {
    setActivePlanId(id);
    saveActivePlanId(id);
    const updated = plans.map((p) => ({ ...p, isActive: p.id === id }));
    setPlans(updated);
    if (user) {
      syncAllPlansToFirestore(updated, user.uid);
    }
  };

  const handleCreatePlan = (
    name: string,
    description: string,
    weeklyFrequency: number,
    activeDays: DayOfWeek[]
  ) => {
    const newPlan: TrainingPlan = {
      id: `plan_${Date.now()}`,
      userId: user?.uid,
      name,
      description,
      weeklyFrequency,
      activeDays,
      isActive: true,
      workouts: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newPlan, ...plans.map((p) => ({ ...p, isActive: false }))];
    setPlans(updated);
    setActivePlanId(newPlan.id);
    saveActivePlanId(newPlan.id);

    if (user) {
      syncPlanToFirestore(newPlan, user.uid);
    }
  };

  const handleDeletePlan = (id: string) => {
    if (plans.length <= 1) return;
    const filtered = plans.filter((p) => p.id !== id);
    setPlans(filtered);
    if (activePlanId === id) {
      setActivePlanId(filtered[0].id);
      saveActivePlanId(filtered[0].id);
    }
    if (user) {
      deletePlanFromFirestore(id);
    }
  };

  // Workout Management Handlers
  const handleOpenNewWorkout = () => {
    setEditingWorkout(null);
    setIsWorkoutModalOpen(true);
  };

  const handleOpenEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsWorkoutModalOpen(true);
  };

  const handleSaveWorkout = (workoutData: Partial<Workout>) => {
    if (!activePlan) return;

    let targetUpdatedPlan: TrainingPlan;

    if (editingWorkout) {
      // Edit existing
      const updatedWorkouts = activePlan.workouts.map((w) =>
        w.id === editingWorkout.id ? { ...w, ...workoutData } : w
      );
      targetUpdatedPlan = { ...activePlan, workouts: updatedWorkouts };
    } else {
      // Create new
      const newWorkout: Workout = {
        id: `workout_${Date.now()}`,
        name: workoutData.name || 'Novo Treino',
        weeklyTarget: workoutData.weeklyTarget || 1,
        scheduledDays: workoutData.scheduledDays || [],
        coverImage: workoutData.coverImage,
        description: workoutData.description,
        exercises: [],
        createdAt: new Date().toISOString(),
      };
      targetUpdatedPlan = { ...activePlan, workouts: [...activePlan.workouts, newWorkout] };
    }

    const updatedPlans = plans.map((p) =>
      p.id === activePlan.id ? targetUpdatedPlan : p
    );
    setPlans(updatedPlans);

    if (user) {
      syncPlanToFirestore(targetUpdatedPlan, user.uid);
    }
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (!activePlan) return;
    const updatedWorkouts = activePlan.workouts.filter((w) => w.id !== workoutId);
    const targetUpdatedPlan = { ...activePlan, workouts: updatedWorkouts };
    const updatedPlans = plans.map((p) =>
      p.id === activePlan.id ? targetUpdatedPlan : p
    );
    setPlans(updatedPlans);

    if (user) {
      syncPlanToFirestore(targetUpdatedPlan, user.uid);
    }
  };

  // Exercise Management Handlers
  const handleOpenAddExercise = (workout: Workout) => {
    setModalWorkoutTarget(workout);
    setEditingExercise(null);
    setIsExerciseModalOpen(true);
  };

  const handleOpenEditExercise = (workout: Workout, exercise: Exercise) => {
    setModalWorkoutTarget(workout);
    setEditingExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  const handleSaveExercise = (exercise: Exercise) => {
    if (!activePlan || !modalWorkoutTarget) return;

    const targetWorkout = activePlan.workouts.find((w) => w.id === modalWorkoutTarget.id);
    if (!targetWorkout) return;

    let updatedExercises: Exercise[];
    if (editingExercise) {
      updatedExercises = targetWorkout.exercises.map((e) =>
        e.id === editingExercise.id ? exercise : e
      );
    } else {
      updatedExercises = [...targetWorkout.exercises, exercise];
    }

    const updatedWorkouts = activePlan.workouts.map((w) =>
      w.id === targetWorkout.id ? { ...w, exercises: updatedExercises } : w
    );

    const targetUpdatedPlan = { ...activePlan, workouts: updatedWorkouts };
    const updatedPlans = plans.map((p) =>
      p.id === activePlan.id ? targetUpdatedPlan : p
    );

    setPlans(updatedPlans);

    if (user) {
      syncPlanToFirestore(targetUpdatedPlan, user.uid);
    }
  };

  const handleDeleteExercise = (workoutId: string, exerciseId: string) => {
    if (!activePlan) return;
    const targetWorkout = activePlan.workouts.find((w) => w.id === workoutId);
    if (!targetWorkout) return;

    const updatedExercises = targetWorkout.exercises.filter((e) => e.id !== exerciseId);
    const updatedWorkouts = activePlan.workouts.map((w) =>
      w.id === workoutId ? { ...w, exercises: updatedExercises } : w
    );
    const targetUpdatedPlan = { ...activePlan, workouts: updatedWorkouts };
    const updatedPlans = plans.map((p) =>
      p.id === activePlan.id ? targetUpdatedPlan : p
    );
    setPlans(updatedPlans);

    if (user) {
      syncPlanToFirestore(targetUpdatedPlan, user.uid);
    }
  };

  // Hydration Handlers
  const handleAddWater = (amountMl: number) => {
    const updated = addWaterIntake(amountMl);
    setTodayHydration(updated);
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: loadWaterGoal(),
        weightEntries: loadWeightEntries(),
      });
    }
  };

  const handleRemoveWaterLog = (logId: string) => {
    const updated = removeWaterLog(logId);
    setTodayHydration(updated);
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: loadWaterGoal(),
        weightEntries: loadWeightEntries(),
      });
    }
  };

  const handleResetWater = () => {
    const updated = resetTodayWaterIntake();
    setTodayHydration(updated);
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: loadWaterGoal(),
        weightEntries: loadWeightEntries(),
      });
    }
  };

  const handleUpdateWaterGoal = (goalMl: number) => {
    saveWaterGoal(goalMl);
    setTodayHydration((prev) => ({ ...prev, goalMl }));
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: goalMl,
        weightEntries: loadWeightEntries(),
      });
    }
  };

  // Weight Handlers
  const handleAddWeight = (weightKg: number, date?: string, notes?: string) => {
    const updated = addWeightEntry(weightKg, date, notes);
    setWeightEntries(updated);
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: loadWaterGoal(),
        weightEntries: updated,
      });
    }
  };

  const handleDeleteWeight = (id: string) => {
    const updated = deleteWeightEntry(id);
    setWeightEntries(updated);
    if (user) {
      syncUserHealthToFirestore(user.uid, {
        hydrationHistory: loadHydrationHistory(),
        waterGoal: loadWaterGoal(),
        weightEntries: updated,
      });
    }
  };

  // Workout Session Execution Handlers
  const handleStartWorkout = (workout: Workout) => {
    setActiveRunningWorkout(workout);
  };

  const handleFinishWorkout = (newSession: WorkoutSession) => {
    const sessionWithUser: WorkoutSession = {
      ...newSession,
      userId: user?.uid,
    };
    const updated = saveNewSession(sessionWithUser);
    setSessions(updated);
    setActiveRunningWorkout(null);

    // Persist to Cloud Firestore forever
    if (user) {
      saveSessionToFirestore(sessionWithUser, user.uid);
    }

    setCurrentTab('home');
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = deleteSession(sessionId);
    setSessions(updated);
    if (user) {
      deleteSessionFromFirestore(sessionId);
    }
  };

  // Mandatory Google Login Gate
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0c] text-white flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#ff5500]/20 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500] animate-pulse">
          <Flame className="h-7 w-7" />
        </div>
        <p className="text-xs font-mono text-zinc-400">Carregando seus treinos...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginGate />;
  }

  // If in active workout mode, show player full-screen
  if (activeRunningWorkout && activePlan) {
    return (
      <WorkoutPlayer
        workout={activeRunningWorkout}
        planId={activePlan.id}
        onFinishWorkout={handleFinishWorkout}
        onCancel={() => setActiveRunningWorkout(null)}
        previousSessions={sessions}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Navbar (displayed on other tabs, home has its own clean top header matching the screenshot) */}
      {currentTab !== 'home' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activePlanName={activePlan?.name || 'Meu Plano'}
          onOpenPlans={() => setIsPlanModalOpen(true)}
          onOpenNewWorkout={handleOpenNewWorkout}
        />
      )}

      {/* Main Content Container (with bottom padding for bottom navigation bar) */}
      <main
        className={`flex-1 mx-auto w-full ${
          currentTab === 'home'
            ? 'max-w-md px-3 pt-1.5 pb-16'
            : 'max-w-6xl px-4 pt-6 pb-24 sm:px-6'
        }`}
      >
        {currentTab === 'home' && activePlan && (
          <HomeScreen
            plan={activePlan}
            sessions={sessions}
            onStartWorkout={handleStartWorkout}
            onNavigateToWorkouts={() => setCurrentTab('workouts')}
            todayHydration={todayHydration}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onRemoveWaterLog={handleRemoveWaterLog}
            onUpdateWaterGoal={handleUpdateWaterGoal}
            weightEntries={weightEntries}
            onAddWeight={handleAddWeight}
            onDeleteWeight={handleDeleteWeight}
            onOpenSettings={() => setIsPlanModalOpen(true)}
          />
        )}

        {currentTab === 'workouts' && activePlan && (
          <WorkoutList
            plan={activePlan}
            sessions={sessions}
            onStartWorkout={handleStartWorkout}
            onOpenAddExercise={handleOpenAddExercise}
            onOpenEditExercise={handleOpenEditExercise}
            onDeleteExercise={handleDeleteExercise}
            onOpenEditWorkout={handleOpenEditWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onOpenNewWorkout={handleOpenNewWorkout}
            onOpenPlans={() => setIsPlanModalOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            sessions={sessions}
            activePlan={activePlan}
            weightEntries={weightEntries}
            todayHydration={todayHydration}
            onSelectWorkoutToStart={(workoutId: string) => {
              const target = activePlan?.workouts.find((w) => w.id === workoutId);
              if (target) handleStartWorkout(target);
            }}
          />
        )}

        {currentTab === 'history' && (
          <SessionHistory
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      {/* Rodapé: Menu de Abas Fixo */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewWorkout={handleOpenNewWorkout}
      />

      {/* Modals */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        workoutName={modalWorkoutTarget?.name || 'Treino'}
        initialExercise={editingExercise}
      />

      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSave={handleSaveWorkout}
        initialWorkout={editingWorkout}
      />

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={handleSelectPlan}
        onCreatePlan={handleCreatePlan}
        onDeletePlan={handleDeletePlan}
      />

      {/* User Custom Profile Modal (Name & Age) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        initialName={profile?.customName || user.displayName?.split(' ')[0] || ''}
        initialAge={profile?.age || null}
        onSave={updateProfile}
        onClose={closeProfileModal}
        isMandatory={needsProfileSetup}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
