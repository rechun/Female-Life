export type EnergyLevel = "low" | "mid" | "high";
export type RiskTag = "irritability" | "anxiety" | "overload" | "sleep_debt";

export type UserProfile = {
  userId: string;
  createdAt: string;
  // 作品展示版：保留最小字段
  ageRange?: "18-24" | "25-30" | "31-38" | "39+";
  workStyle?: "9-6" | "flex" | "student" | "shift";
  sleepPreference?: "early" | "night_owl";
  quietHours?: { start: string; end: string }; // "22:30" -> "08:00"
};

export type CycleProfile = {
  lastPeriodStart: string; // yyyy-MM-dd
  avgCycleLength: number; // days
  symptoms?: string[];
};

export type DailyCheckin = {
  date: string; // yyyy-MM-dd
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  fatigue?: 1 | 2 | 3 | 4 | 5;
  mood?: 1 | 2 | 3 | 4 | 5;
  moodTags?: string[];
};

export type LifeSystemProfile = {
  recurringBills?: { title: string; rule: "monthly" | "quarterly" | "yearly"; dayOfMonth?: number }[];
  staples?: { title: string; typicalDays: number }[]; // 补货：建议间隔天数
};

export type MentalLoadItem = {
  id: string;
  title: string;
  category: "采购补货" | "缴费续期" | "预约安排" | "沟通维护" | "照护支持";
  impactScope: "自己" | "伴侣" | "家庭" | "宠物";
  assignee: "我" | "伴侣" | "家人" | "外部";
  delegable: boolean;
  automatable: boolean;
  lastHandledAt?: string; // ISO
  status: "active" | "done" | "muted";
};

export type LifeTask = {
  id: string;
  title: string;
  category: MentalLoadItem["category"] | "工作学习" | "成长";
  priority: "must" | "should" | "optional";
  dueAt?: string; // ISO
  delegable?: boolean;
  status: "todo" | "done" | "snoozed";
  createdAt: string; // ISO
};

export type CardAction =
  | { type: "done"; label: string; taskId?: string }
  | { type: "snooze"; label: string; taskId?: string; minutes: number }
  | { type: "delegate"; label: string; textTemplate: string }
  | { type: "automate"; label: string; hint: string }
  | { type: "open"; label: string; href: string };

export type Card = {
  id: string;
  cardType: "status" | "task" | "reminder" | "risk" | "suggestion";
  title: string;
  body?: string;
  confidence?: number; // 0-1
  actions?: CardAction[];
};

export type TodayPlan = {
  date: string; // yyyy-MM-dd
  energy: EnergyLevel;
  cyclePhaseLabel: string; // "经前" / "经期" / ...
  risks: RiskTag[];
  focus: string[]; // 今日适合
  avoid: string[]; // 不建议做
  top3: LifeTask[]; // 1-3 条
  selfCare: string[]; // 1-2 条
  cards: Card[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

