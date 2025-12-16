export enum Goal {
  DEFINITION = 'Definição Muscular',
  HYPERTROPHY = 'Hipertrofia (Ganho de Massa)',
  WEIGHT_LOSS = 'Perda de Peso',
  STRENGTH = 'Treino de Força'
}

export enum ExperienceLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum Location {
  GYM = 'Academia',
  HOME = 'Em Casa (Peso do corpo/Leve)',
  FREE = 'Ao Ar Livre/Parque'
}

export interface UserData {
  gender: 'Masculino' | 'Feminino';
  weight: number; // kg
  height: number; // cm
  goal: Goal;
  experience: ExperienceLevel;
  duration: number; // minutes
  days: string[]; // e.g., ["Segunda", "Quarta", "Sexta"]
  location: Location;
  targetMuscles: string[];
  focusMuscle: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  notes: string;
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export type WorkoutPlan = DayPlan[];