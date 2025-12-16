import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserData, WorkoutPlan } from './types';
import { generateWorkoutPlan } from './services/geminiService';
import { BrainCircuit, Loader2 } from 'lucide-react';

const STORAGE_KEY_WORKOUT = 'smartfit_workout_plan';
const STORAGE_KEY_USERDATA = 'smartfit_user_data';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Load saved workout and user data on mount
  useEffect(() => {
    try {
      const savedWorkout = localStorage.getItem(STORAGE_KEY_WORKOUT);
      const savedUserData = localStorage.getItem(STORAGE_KEY_USERDATA);

      if (savedWorkout && savedUserData) {
        setWorkoutPlan(JSON.parse(savedWorkout));
        setUserData(JSON.parse(savedUserData));
      }
    } catch (error) {
      console.error('Error loading saved workout:', error);
      // If there's an error loading, clear the corrupted data
      localStorage.removeItem(STORAGE_KEY_WORKOUT);
      localStorage.removeItem(STORAGE_KEY_USERDATA);
    }
  }, []);

  // Save workout and user data whenever they change
  useEffect(() => {
    if (workoutPlan && userData) {
      try {
        localStorage.setItem(STORAGE_KEY_WORKOUT, JSON.stringify(workoutPlan));
        localStorage.setItem(STORAGE_KEY_USERDATA, JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving workout:', error);
      }
    }
  }, [workoutPlan, userData]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Previne o comportamento padrão do mini-infobar no mobile
      e.preventDefault();
      // Guarda o evento para ser disparado depois pelo botão
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleOnboardingComplete = async (data: UserData) => {
    setUserData(data);
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateWorkoutPlan(data);
      setWorkoutPlan(generatedPlan);
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar o plano de treino. Verifique sua conexão ou tente dados mais simples.");
      setUserData(null); // Go back to let them try again or edit
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserData(null);
    setWorkoutPlan(null);
    // Clear localStorage when resetting
    localStorage.removeItem(STORAGE_KEY_WORKOUT);
    localStorage.removeItem(STORAGE_KEY_USERDATA);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-100 rounded-full animate-pulse absolute top-0 left-0"></div>
          <BrainCircuit className="w-20 h-20 text-blue-600 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Analisando seu perfil...</h2>
        <p className="text-gray-500 mt-2 max-w-sm">
          Nossa IA está criando a divisão perfeita com base no seu objetivo de
          <span className="font-semibold text-blue-600"> {userData?.goal.split(' ')[0]}</span>.
        </p>
        <div className="mt-8 flex gap-2">
          <Loader2 className="animate-spin text-gray-400" />
          <span className="text-sm text-gray-400">Selecionando exercícios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Ops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (workoutPlan && userData) {
    return <Dashboard plan={workoutPlan} userData={userData} onReset={handleReset} />;
  }

  return <Onboarding onComplete={handleOnboardingComplete} installPrompt={installPrompt} />;
};

export default App;
