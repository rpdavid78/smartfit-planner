import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserData, WorkoutPlan, Exercise } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured output
const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Unique ID for the exercise (e.g., ex_1)" },
    name: { type: Type.STRING, description: "Name of the exercise (in Portuguese)" },
    muscle: { type: Type.STRING, description: "Primary muscle worked (in Portuguese)" },
    sets: { type: Type.INTEGER, description: "Number of sets" },
    reps: { type: Type.STRING, description: "Rep range (e.g., '8-12')" },
    notes: { type: Type.STRING, description: "Brief form cue or tip (in Portuguese)" },
  },
  required: ["id", "name", "muscle", "sets", "reps", "notes"],
};

const dayPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING, description: "Day of the week (in Portuguese)" },
    focus: { type: Type.STRING, description: "Focus area for this workout (e.g., Upper Body, Push) in Portuguese" },
    exercises: {
      type: Type.ARRAY,
      items: exerciseSchema,
    },
  },
  required: ["day", "focus", "exercises"],
};

const workoutPlanSchema: Schema = {
  type: Type.ARRAY,
  items: dayPlanSchema,
};

export const generateWorkoutPlan = async (userData: UserData): Promise<WorkoutPlan> => {
  const prompt = `
    Atue como um Personal Trainer brasileiro experiente. Crie um plano de treino semanal personalizado em PORTUGUÊS DO BRASIL.
    Dados do usuário:
    - Peso: ${userData.weight}kg, Altura: ${userData.height}cm
    - Objetivo: ${userData.goal}
    - Nível de Experiência: ${userData.experience}
    - Duração do Treino: ${userData.duration} minutos
    - Dias Disponíveis: ${userData.days.join(', ')}
    - Local/Equipamento: ${userData.location}
    - Músculos Alvo: ${userData.targetMuscles.join(', ')}
    - Foco Principal: ${userData.focusMuscle}

    Regras:
    1. Crie uma divisão de treino apropriada para o nível (ex: Full Body para iniciantes, ABC para outros).
    2. Priorize exercícios compatíveis com o Local/Equipamento.
    3. Ajuste séries/repetições baseadas no Objetivo.
    4. Garanta que o treino caiba em ${userData.duration} minutos.
    5. TODO O TEXTO DEVE ESTAR EM PORTUGUÊS.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutPlanSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");
    
    return JSON.parse(text) as WorkoutPlan;
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    throw error;
  }
};

export const getAlternativeExercises = async (originalExercise: string, muscle: string, location: Location): Promise<Exercise[]> => {
  const prompt = `
    Sugira 3 exercícios alternativos para "${originalExercise}" que trabalhem "${muscle}".
    O usuário treina em: "${location}".
    Retorne uma lista de 3 exercícios distintos.
    Responda EXCLUSIVAMENTE em Português do Brasil.
  `;

  const alternativeSchema: Schema = {
    type: Type.ARRAY,
    items: exerciseSchema
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: alternativeSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    return JSON.parse(text) as Exercise[];
  } catch (error) {
    console.error("Erro ao buscar alternativas:", error);
    return [];
  }
};