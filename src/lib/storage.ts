import { z } from "zod";
import type {
  ChatMessage,
  CycleProfile,
  DailyCheckin,
  LifeSystemProfile,
  LifeTask,
  MentalLoadItem,
  TodayPlan,
  UserProfile
} from "./types";

const KEY_PREFIX = "flo:v1:";

function key(k: string) {
  return `${KEY_PREFIX}${k}`;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(key("userProfile")) && localStorage.getItem(key("cycleProfile")));
}

export function loadUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<UserProfile>(localStorage.getItem(key("userProfile")));
}

export function saveUserProfile(p: UserProfile) {
  localStorage.setItem(key("userProfile"), JSON.stringify(p));
}

export function loadCycleProfile(): CycleProfile | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<CycleProfile>(localStorage.getItem(key("cycleProfile")));
}

export function saveCycleProfile(p: CycleProfile) {
  localStorage.setItem(key("cycleProfile"), JSON.stringify(p));
}

export function loadLifeSystemProfile(): LifeSystemProfile | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<LifeSystemProfile>(localStorage.getItem(key("lifeSystemProfile")));
}

export function saveLifeSystemProfile(p: LifeSystemProfile) {
  localStorage.setItem(key("lifeSystemProfile"), JSON.stringify(p));
}

export function loadDailyCheckins(): DailyCheckin[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<DailyCheckin[]>(localStorage.getItem(key("dailyCheckins"))) ?? [];
}

export function upsertDailyCheckin(c: DailyCheckin) {
  const all = loadDailyCheckins();
  const idx = all.findIndex((x) => x.date === c.date);
  if (idx >= 0) all[idx] = { ...all[idx], ...c };
  else all.unshift(c);
  localStorage.setItem(key("dailyCheckins"), JSON.stringify(all.slice(0, 90)));
}

export function loadMentalLoad(): MentalLoadItem[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<MentalLoadItem[]>(localStorage.getItem(key("mentalLoad"))) ?? [];
}

export function saveMentalLoad(items: MentalLoadItem[]) {
  localStorage.setItem(key("mentalLoad"), JSON.stringify(items));
}

export function loadTasks(): LifeTask[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<LifeTask[]>(localStorage.getItem(key("tasks"))) ?? [];
}

export function saveTasks(tasks: LifeTask[]) {
  localStorage.setItem(key("tasks"), JSON.stringify(tasks));
}

export function upsertTask(t: LifeTask) {
  const all = loadTasks();
  const idx = all.findIndex((x) => x.id === t.id);
  if (idx >= 0) all[idx] = t;
  else all.unshift(t);
  saveTasks(all);
}

export function loadTodayPlan(date: string): TodayPlan | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<TodayPlan>(localStorage.getItem(key(`todayPlan:${date}`)));
}

export function saveTodayPlan(date: string, plan: TodayPlan) {
  localStorage.setItem(key(`todayPlan:${date}`), JSON.stringify(plan));
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<ChatMessage[]>(localStorage.getItem(key("chat"))) ?? [];
}

export function saveChatHistory(items: ChatMessage[]) {
  localStorage.setItem(key("chat"), JSON.stringify(items.slice(-200)));
}

// 可选：用于导入/导出（作品展示）
export function exportAll(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const out: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(KEY_PREFIX)) continue;
    out[k] = safeJsonParse(localStorage.getItem(k)) ?? localStorage.getItem(k);
  }
  return out;
}

export function importAll(data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const schema = z.record(z.any());
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error("导入格式不正确");
  for (const [k, v] of Object.entries(parsed.data)) {
    if (!k.startsWith(KEY_PREFIX)) continue;
    localStorage.setItem(k, JSON.stringify(v));
  }
}

