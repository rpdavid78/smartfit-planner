import React, { useState } from 'react';
import { WorkoutPlan, DayPlan, UserData, Exercise } from '../types';
import ExerciseCard from './ExerciseCard';
import { ChevronDown, ChevronUp, Dumbbell, Calendar, Clock, RotateCcw, FileText, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

interface DashboardProps {
  plan: WorkoutPlan;
  userData: UserData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan: initialPlan, userData, onReset }) => {
  const [plan, setPlan] = useState<WorkoutPlan>(initialPlan);
  const [expandedDay, setExpandedDay] = useState<string | null>(initialPlan[0]?.day || null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const generatePDF = () => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF();
    
    // Configurações iniciais
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SmartFit Planner", margin, 25);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Seu plano de treino personalizado", margin, 32);

    yPos = 55;

    // Resumo do Perfil
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMO DO PERFIL:", margin, yPos);
    
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Objetivo: ${userData.goal}`, margin, yPos);
    doc.text(`Foco: ${userData.focusMuscle}`, margin + 80, yPos);
    yPos += 6;
    doc.text(`Local: ${userData.location}`, margin, yPos);
    doc.text(`Duração: ${userData.duration} min`, margin + 80, yPos);

    yPos += 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Loop dos Dias
    plan.forEach((dayPlan) => {
      // Verifica quebra de página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Cabeçalho do Dia
      doc.setFillColor(240, 245, 255); // Light Blue bg
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 14, 2, 2, 'F');
      
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${dayPlan.day} - ${dayPlan.focus}`, margin + 5, yPos + 9);
      
      yPos += 20;

      // Lista de Exercícios
      dayPlan.exercises.forEach((ex) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(ex.name, margin, yPos);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        const details = `${ex.sets} séries  x  ${ex.reps} reps`;
        const widthDetails = doc.getTextWidth(details);
        
        // Alinhar à direita
        doc.text(details, pageWidth - margin - widthDetails, yPos);
        
        yPos += 5;
        
        // Notas (Músculo e Dica)
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.setFont("helvetica", "italic");
        const noteText = `(${ex.muscle}) ${ex.notes}`;
        
        // Quebrar texto longo de notas se necessário
        const splitNotes = doc.splitTextToSize(noteText, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, yPos);
        
        yPos += (splitNotes.length * 4) + 6; // Espaço entre exercícios
      });

      yPos += 5; // Espaço entre dias
    });

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Gerado por SmartFit AI - Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save("SmartFit-Treino.pdf");
    setIsGeneratingPdf(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seu Plano Smart</h1>
            <p className="text-gray-500 mt-2">
              Foco: <span className="font-medium text-blue-600">{userData.focusMuscle}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={generatePDF}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium"
            >
              {isGeneratingPdf ? (
                <span>Gerando...</span>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Baixar PDF
                </>
              )}
            </button>
            
            <button 
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          </div>
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