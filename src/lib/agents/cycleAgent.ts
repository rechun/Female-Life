import { addDays, differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import type { CycleProfile, DailyCheckin, EnergyLevel, RiskTag } from "../types";

export type CycleAssessment = {
  date: string; // yyyy-MM-dd
  dayInCycle: number; // 1..N
  phase: "menstruation" | "follicular" | "ovulation" | "luteal" | "premenstrual";
  phaseLabel: string;
  energy: EnergyLevel;
  risks: RiskTag[];
  focus: string[];
  avoid: string[];
  next7: { date: string; energy: EnergyLevel; phaseLabel: string }[];
  notes: string[];
  confidence: number; // 0-1
};

function phaseOf(dayInCycle: number, cycleLen: number): CycleAssessment["phase"] {
  if (dayInCycle <= 5) return "menstruation";
  if (dayInCycle <= 13) return "follicular";
  if (dayInCycle <= 16) return "ovulation";
  // 经前最后 5 天
  if (dayInCycle >= Math.max(1, cycleLen - 4)) return "premenstrual";
  return "luteal";
}

function labelOf(phase: CycleAssessment["phase"]) {
  switch (phase) {
    case "menstruation":
      return "经期";
    case "follicular":
      return "卵泡期";
    case "ovulation":
      return "排卵期";
    case "luteal":
      return "黄体期";
    case "premenstrual":
      return "经前";
  }
}

function baseEnergy(phase: CycleAssessment["phase"]): EnergyLevel {
  switch (phase) {
    case "menstruation":
      return "low";
    case "follicular":
      return "high";
    case "ovulation":
      return "high";
    case "luteal":
      return "mid";
    case "premenstrual":
      return "low";
  }
}

function adjustEnergy(base: EnergyLevel, checkin?: DailyCheckin): EnergyLevel {
  if (!checkin) return base;
  const sleep = checkin.sleepQuality ?? 3;
  const fatigue = checkin.fatigue ?? 3;
  const mood = checkin.mood ?? 3;
  let score = base === "high" ? 3 : base === "mid" ? 2 : 1;
  score += sleep >= 4 ? 1 : sleep <= 2 ? -1 : 0;
  score += fatigue >= 4 ? -1 : fatigue <= 2 ? 1 : 0;
  score += mood <= 2 ? -1 : mood >= 4 ? 1 : 0;
  if (score >= 4) return "high";
  if (score >= 2) return "mid";
  return "low";
}

function makeFocus(energy: EnergyLevel): string[] {
  if (energy === "high") return ["深度工作/系统性推进", "主动沟通与协调", "一次性清理积压事项"];
  if (energy === "mid") return ["执行类任务优先", "小步推进 + 留出缓冲", "轻量沟通与整理"];
  return ["低认知负担任务优先", "最小可执行动作", "恢复与自我照顾"];
}

function makeAvoid(energy: EnergyLevel): string[] {
  if (energy === "high") return ["连轴转不休息", "同时开太多线程导致分散"];
  if (energy === "mid") return ["临时加塞高压任务", "长时间高强度决策"];
  return ["高压社交/复杂沟通", "临时做重大决策", "把计划排得过满"];
}

function risksFrom(phase: CycleAssessment["phase"], energy: EnergyLevel, checkin?: DailyCheckin): RiskTag[] {
  const out = new Set<RiskTag>();
  if (phase === "premenstrual") out.add("irritability");
  if (phase === "menstruation") out.add("overload");
  if ((checkin?.sleepQuality ?? 3) <= 2) out.add("sleep_debt");
  if ((checkin?.mood ?? 3) <= 2) out.add("anxiety");
  if (energy === "low") out.add("overload");
  return [...out];
}

export function assessCycle(
  profile: CycleProfile,
  date: Date,
  checkin?: DailyCheckin
): CycleAssessment {
  const cycleLen = Math.min(60, Math.max(20, profile.avgCycleLength || 28));
  const lastStart = parseISO(profile.lastPeriodStart);
  const delta = differenceInCalendarDays(date, lastStart);
  const dayInCycle = ((delta % cycleLen) + cycleLen) % cycleLen + 1;

  const phase = phaseOf(dayInCycle, cycleLen);
  const energy = adjustEnergy(baseEnergy(phase), checkin);
  const risks = risksFrom(phase, energy, checkin);
  const confidence = profile.lastPeriodStart ? 0.75 : 0.4;

  const next7 = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(date, i);
    const dd = differenceInCalendarDays(d, lastStart);
    const day = ((dd % cycleLen) + cycleLen) % cycleLen + 1;
    const ph = phaseOf(day, cycleLen);
    return {
      date: formatISO(d, { representation: "date" }),
      energy: baseEnergy(ph),
      phaseLabel: labelOf(ph)
    };
  });

  const notes: string[] = [];
  if (!checkin) notes.push("今日未打点：能量为周期阶段的基础推算，可在 Today 里补充睡眠/疲劳/情绪以更准确。");

  return {
    date: formatISO(date, { representation: "date" }),
    dayInCycle,
    phase,
    phaseLabel: labelOf(phase),
    energy,
    risks,
    focus: makeFocus(energy),
    avoid: makeAvoid(energy),
    next7,
    notes,
    confidence
  };
}

