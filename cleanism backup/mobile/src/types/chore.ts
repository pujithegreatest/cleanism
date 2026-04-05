export type AreaTag = "Kitchen" | "Bathroom" | "Bedroom" | "Living Room" | "Garage" | "Outdoor" | "Other";

export type Priority = "low" | "medium" | "high";

export interface Chore {
  id: string;
  name: string;
  beforeImageUri?: string;
  afterImageUri?: string;
  contextDescription: string;
  aiTip: string;
  areaTag: AreaTag;
  dueDate?: number;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
  notes?: string;
  priority?: Priority;
  estimatedMinutes?: number;
}

export interface Theme {
  id: string;
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeColors {
  background: string;
  text: string;
  secondaryText: string;
  accents: string[];
}
