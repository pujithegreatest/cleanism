import { NavigatorScreenParams } from "@react-navigation/native";
import { AreaTag, Priority } from "../types/chore";

export type RootStackParamList = {
  Home: undefined;
  Camera: { contextDescription: string; areaTag: AreaTag; dueDate?: number; priority?: Priority; estimatedMinutes?: number };
  AfterCamera: { choreId: string };
  AddChore: undefined;
  ChoreDetail: { choreId: string };
  Settings: undefined;
  History: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<RootStackParamList>;
  HistoryTab: NavigatorScreenParams<RootStackParamList>;
  SettingsTab: NavigatorScreenParams<RootStackParamList>;
};
