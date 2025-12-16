import React, { useState } from 'react';
import { WorkoutPlan, DayPlan, UserData, Exercise } from '../types';
import ExerciseCard from './ExerciseCard';
import { ChevronDown, ChevronUp, Dumbbell, Calendar, Clock, RotateCcw } from 'lucide-react';

interface DashboardProps {
  plan: WorkoutPlan;
  userData: UserData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan: initialPlan, userData, onReset }) => {
  const [plan, setPlan] = useState<WorkoutPlan>(initialPlan);
  const [expandedDay, setExpandedDay] = useState<string | null>(initialPlan[0]?.day || null);

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const handleSwapExercise = (dayIdx: number, originalId: string, newExercise: Exercise) => {
    const newPlan = [...plan];
    const dayData = newPlan[dayIdx];
    
    dayData.exercises = dayData.exercises.map(ex => 
      ex.id === originalId ? newExercise : ex
    );
    
    setPlan(newPlan);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seu Plano Smart</h1>
            <p className="text-gray-500 mt-2">
              Foco: <span className="font-medium text-blue-600">{userData.focusMuscle}</span>
            </p>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Dumbbell className="w-5 h-5 text-purple-500 mb-1" />
            <span className="text-xs text-gray-400">Objetivo</span>
            <span className="text-sm font-semibold text-gray-800 line-clamp-1">{userData.goal.split(' ')[0]}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Calendar className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-xs text-gray-400">Freq</span>
            <span className="text-sm font-semibold text-gray-800">{userData.days.length} Dias/Sem</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-xs text-gray-400">Duração</span>
            <span className="text-sm font-semibold text-gray-800">{userData.duration} min</span>
          </div>
        </div>
      </div>

      {/* Plan List */}
      <div className="space-y-4">
        {plan.map((dayPlan, dayIdx) => (
          <div key={dayIdx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleDay(dayPlan.day)}
              className={`w-full flex items-center justify-between p-5 transition-colors ${expandedDay === dayPlan.day ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${expandedDay === dayPlan.day ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {dayPlan.day.substring(0, 3)}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">{dayPlan.day}</h3>
                  <p className="text-sm text-gray-500">{dayPlan.focus}</p>
                </div>
              </div>
              {expandedDay === dayPlan.day ? (
                <ChevronUp className="w-5 h-5 text-blue-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedDay === dayPlan.day && (
              <div className="p-5 pt-0 animate-in fade-in duration-300">
                <div className="h-px w-full bg-gray-100 mb-4" />
                {dayPlan.exercises.map((exercise, exIdx) => (
                  <ExerciseCard
                    key={`${dayIdx}-${exIdx}-${exercise.id}`}
                    exercise={exercise}
                    location={userData.location}
                    onSwap={(oldId, newEx) => handleSwapExercise(dayIdx, oldId, newEx)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;