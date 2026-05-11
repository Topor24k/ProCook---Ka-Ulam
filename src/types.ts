import { ReactNode } from 'react';

export type View = 'home' | 'about' | 'login' | 'signup' | 'dashboard';

export interface Step {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

export interface Recipe {
  id: string;
  owner: string;
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  category: string;
  flavorProfile: string;
  nutritionLabels: string[];
  prepMin: number;
  cookMin: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'PRO';
  costLevel: '₱' | '₱₱' | '₱₱₱';
  tags: string[];
  mealType: string;
  mood: string;
  image: string;
  localSourcing?: string;
  wasteReduction?: string;
  rating?: string; // Keeping for backward compatibility if needed
}
