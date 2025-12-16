import React, { useState, useEffect } from 'react';
import { UserData, Goal, ExperienceLevel, Location } from '../types';
import { ChevronRight, ChevronLeft, Check, Target, Activity, MapPin, User, Share2, Download, Copy, X, HelpCircle, Smartphone } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
  installPrompt: any;
}

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos'
];

const DAYS_OF_WEEK = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, installPrompt }) => {
  const [step, setStep] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Initial state updated to include a default goal to prevent "Next" button lock
  const [formData, setFormData] = useState<Partial<UserData>>({
    gender: 'Masculino',
    weight: 70,
    height: 175,
    goal: Goal.HYPERTROPHY, // Default goal set to allow proceeding immediately
    duration: 60,
    targetMuscles: [],
    days: [],
    location: Location.GYM, // Default location set to prevent validation lock
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
      // Detecta se é iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      // Detecta se já está instalado (modo standalone)
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    }
  }, []);

  const updateField = (field: keyof UserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const canProceed = () => {
    switch(step) {
      case 1: return !!formData.gender && !!formData.goal && !!formData.weight && !!formData.height;
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

  const handleNativeShare = async () => {
    // Check if we are in a blob environment (preview mode)
    if (window.location.protocol === 'blob:') {
      // Fallback for preview mode
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'SmartFit Planner',
            text: 'Estou usando este app de treino com IA! (Link indisponível no modo preview)',
          });
        } catch (err) { console.error(err); }
      } else {
        alert("Modo Preview: O compartilhamento de link está desativado.");
      }
      return;
    }

    const shareData = {
      title: 'SmartFit Planner',
      text: 'Olha esse app de treino que eu configurei pra você!',
      url: currentUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('Link copiado!');
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
  };

  // Se já estiver instalado, não mostra botões de instalação
  const showInstallButton = !isStandalone && installPrompt;
  const showManualInstallHelp = !isStandalone && !installPrompt;

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Header Actions (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Botão Mágico (Android/Chrome) */}
        {showInstallButton && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm text-xs font-bold animate-pulse"
            title="Instalar Aplicativo"
          >
            <Download className="w-4 h-4" />
            Instalar
          </button>
        )}

        {/* Botão de Ajuda (iOS/Outros) */}
        {showManualInstallHelp && (
          <button
            onClick={() => setShowInstallHelp(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors shadow-sm text-xs font-bold"
            title="Como Instalar"
          >
            <Smartphone className="w-4 h-4" />
            Instalar?
          </button>
        )}
        
        <button
          onClick={() => setShowShareModal(true)}
          className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
          title="Compartilhar Link do App"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Manual Install Help Modal */}
      {showInstallHelp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowInstallHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">Como Instalar o App</h3>
            
            {isIOS ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">1</div>
                  <p className="text-sm text-gray-600">Toque no botão <strong>Compartilhar</strong> <span className="text-xl">⎋</span> na barra inferior do Safari.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">2</div>
                  <p className="text-sm text-gray-600">Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <span className="text-xl">➕</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">3</div>
                  <p className="text-sm text-gray-600">Toque em <strong>Adicionar</strong> no canto superior direito.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="bg-gray-100 p-2 rounded-lg">1</div>
                   <p className="text-sm text-gray-600">Toque nos <strong>três pontinhos</strong> (menu) do navegador.</p>
                </div>
                <div className="flex items-start gap-3">
                   <div className="bg-gray-100 p-2 rounded-lg">2</div>
                   <p className="text-sm text-gray-600">Selecione <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowInstallHelp(false)}
              className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enviar App</h3>
            {window.location.protocol === 'blob:' ? (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                 <strong>Modo Preview:</strong> O link gerado aqui é temporário e não funcionará para outras pessoas.
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6">Copie o link abaixo e mande no WhatsApp:</p>
            )}
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                readOnly 
                value={currentUrl}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.currentTarget.select()}
              />
              <button 
                onClick={copyToClipboard}
                className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                title="Copiar Link"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button 
                onClick={handleNativeShare}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar Direto
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 mt-16 sm:mt-0">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="flex-grow flex flex-col max-w-lg mx-auto w-full p-6 justify-center pb-32">
        
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

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
              <div className="flex gap-4">
                {['Masculino', 'Feminino'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateField('gender', g)}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all text-sm font-medium ${
                      formData.gender === g
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
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
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white z-20">
        <div className="max-w-lg mx-auto flex gap-4">
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