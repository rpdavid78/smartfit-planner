import React, { useState } from 'react';
import { UserData, Goal, ExperienceLevel, Location } from '../types';
import { ChevronRight, ChevronLeft, Check, Target, Activity, MapPin, User, Share2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
}

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos'
];

const DAYS_OF_WEEK = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserData>>({
    weight: 70,
    height: 175,
    duration: 60,
    targetMuscles: [],
    days: [],
  });

  const updateField = (field: keyof UserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const canProceed = () => {
    switch(step) {
      case 1: return !!formData.goal && !!formData.weight && !!formData.height;
      case 2: return !!formData.experience;
      case 3: return (formData.days?.length || 0) > 0 && !!formData.location;
      case 4: return (formData.targetMuscles?.length || 0) > 0 && !!formData.focusMuscle;
      default: return false;
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      onComplete(formData as UserData);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: 'SmartFit Planner',
      text: 'Olha esse app de treino que eu configurei pra você!',
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copiado! Agora é só colar no WhatsApp dela.');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Share Button (Top Right) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleShare}
          className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
          title="Compartilhar Link do App"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 mt-12 sm:mt-0">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-grow flex flex-col max-w-lg mx-auto w-full p-6 justify-center">
        
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Vamos conhecer você</h2>
              <p className="text-gray-500">Primeiros passos para sua nova rotina.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => updateField('weight', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                <input 
                  type="number" 
                  value={formData.height}
                  onChange={(e) => updateField('height', Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo Principal</label>
              <div className="space-y-2">
                {Object.values(Goal).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateField('goal', g)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      formData.goal === g 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-200 text-gray-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
             <div className="text-center mb-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="text-purple-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nível de Experiência</h2>
              <p className="text-gray-500">Ajustaremos a intensidade para você.</p>
            </div>

            <div className="space-y-3">
              {Object.values(ExperienceLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => updateField('experience', level)}
                  className={`w-full p-5 rounded-xl text-left border transition-all flex justify-between items-center ${
                    formData.experience === level 
                      ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500' 
                      : 'border-gray-200 hover:border-purple-200 text-gray-600'
                  }`}
                >
                  <span className="font-medium text-lg">{level}</span>
                  {formData.experience === level && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Parameters */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
             <div className="text-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-green-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Logística</h2>
              <p className="text-gray-500">Onde e quando você vai treinar?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração do Treino: {formData.duration} min</label>
              <input 
                type="range" 
                min="15" 
                max="120" 
                step="15"
                value={formData.duration}
                onChange={(e) => updateField('duration', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>15m</span>
                <span>120m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dias Disponíveis</label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.days?.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = isSelected 
                          ? formData.days?.filter(d => d !== day) 
                          : [...(formData.days || []), day];
                        updateField('days', newDays);
                      }}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
              <select 
                value={formData.location} 
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="" disabled>Selecione o Local</option>
                {Object.values(Location).map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
             <div className="text-center mb-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-red-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Objetivo Específico</h2>
              <p className="text-gray-500">O que você quer focar?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grupos Musculares Alvo</label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((muscle) => {
                  const isSelected = formData.targetMuscles?.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      onClick={() => {
                        const newMuscles = isSelected 
                          ? formData.targetMuscles?.filter(m => m !== muscle) 
                          : [...(formData.targetMuscles || []), muscle];
                        updateField('targetMuscles', newMuscles);
                      }}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        isSelected
                          ? 'bg-red-50 text-red-700 border-red-200 font-medium'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.targetMuscles && formData.targetMuscles.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Foco Principal (Prioridade)</label>
                <select 
                  value={formData.focusMuscle || ''} 
                  onChange={(e) => updateField('focusMuscle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                   <option value="" disabled>Selecione Músculo Prioritário</option>
                  {formData.targetMuscles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={!canProceed()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all ${
              canProceed() 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {step === 4 ? 'Gerar Treino' : 'Próximo'}
            {step !== 4 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;