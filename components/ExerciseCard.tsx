import React, { useState } from 'react';
import { Exercise, Location } from '../types';
import { getAlternativeExercises } from '../services/geminiService';
import { RefreshCw, PlayCircle, Loader2 } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  location: Location;
  onSwap: (originalId: string, newExercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, location, onSwap }) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [isLoadingAlts, setIsLoadingAlts] = useState(false);

  const handleSwapRequest = async () => {
    if (showAlternatives) {
      setShowAlternatives(false);
      return;
    }

    setIsLoadingAlts(true);
    try {
      const alts = await getAlternativeExercises(exercise.name, exercise.muscle, location);
      setAlternatives(alts);
      setShowAlternatives(true);
    } catch (error) {
      alert("Falha ao buscar alternativas. Tente novamente.");
    } finally {
      setIsLoadingAlts(false);
    }
  };

  const handleSelectAlternative = (alt: Exercise) => {
    // Preserve the original ID or generate a new unique one
    const newExercise = { ...alt, id: exercise.id };
    onSwap(exercise.id, newExercise);
    setShowAlternatives(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Visual Demonstration Placeholder */}
        <div className="w-full sm:w-32 h-32 bg-gray-100 flex-shrink-0 relative group">
          <img 
            src={`https://picsum.photos/300/300?random=${Math.random()}`} 
            alt={exercise.name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <PlayCircle className="text-white w-8 h-8 opacity-80" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{exercise.name}</h3>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mt-1">{exercise.muscle}</p>
            </div>
            <button
              onClick={handleSwapRequest}
              disabled={isLoadingAlts}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Trocar Exercício"
            >
              {isLoadingAlts ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="bg-gray-100 px-3 py-1 rounded-md">
              <span className="font-bold text-gray-900">{exercise.sets}</span> Séries
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-md">
              <span className="font-bold text-gray-900">{exercise.reps}</span> Reps
            </div>
          </div>
          
          <p className="mt-3 text-xs text-gray-500 italic">
            <span className="font-semibold not-italic">Dica: </span> 
            {exercise.notes}
          </p>
        </div>
      </div>

      {/* Alternatives Dropdown */}
      {showAlternatives && (
        <div className="bg-blue-50 p-4 border-t border-blue-100 animate-in slide-in-from-top-2 fade-in duration-300">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Selecione Alternativa:</h4>
          <div className="space-y-2">
            {alternatives.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAlternative(alt)}
                className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all flex justify-between items-center group"
              >
                <span className="font-medium text-gray-700 group-hover:text-blue-700">{alt.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{alt.sets} x {alt.reps}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;