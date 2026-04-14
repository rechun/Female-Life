import { differenceInCalendarDays, formatISO, parseISO } from "date-fns";
import type { LifeSystemProfile, LifeTask, MentalLoadItem } from "../types";
import { uid } from "../id";

export type LifeAdminOutput = {
  proposedTasks: LifeTask[];
  reminders: { title: string; when: string; reason: string }[];
  notes: string[];
};

function daysSince(iso?: string, now = new Date()): number | null {
  if (!iso) return null;
  try {
    return differenceInCalendarDays(now, parseISO(iso));
  } catch {
    return null;
  }
}

export function runLifeAdmin(
  profile: LifeSystemProfile | null,
  mentalLoad: MentalLoadItem[],
  existingTasks: LifeTask[],
  now: Date
): LifeAdminOutput {
  const notes: string[] = [];
  const proposedTasks: LifeTask[] = [];
  const reminders: { title: string; when: string; reason: string }[] = [];

  const today = formatISO(now, { representation: "date" });
  const hasTask = (title: string) =>
    existingTasks.some((t) => t.title === title && t.status !== "done");

  // 1) 基于 staples 生成补货建议
  for (const s of profile?.staples ?? []) {
    const related = mentalLoad.find((m) => m.title.includes(s.title));
    const since = daysSince(related?.lastHandledAt, now);
    const shouldSuggest = since === null ? true : since >= Math.max(3, s.typicalDays);
    if (!shouldSuggest) continue;
    const title = `补货：${s.title}`;
    if (hasTask(title)) continue;

    proposedTasks.push({
      id: uid("task"),
      title,
      category: "采购补货",
      priority: "should",
      createdAt: now.toISOString(),
      status: "todo",
      delegable: true
    });

    reminders.push({
      title,
      when: today,
      reason: since === null ? "尚未记录上次处理时间，建议先加入清单" : `距离上次处理约 ${since} 天`
    });
  }

  // 2) 基于 recurring bills 生成缴费提醒（作品展示版：只按每月天数）
  const day = now.getDate();
  for (const b of profile?.recurringBills ?? []) {
    if (b.rule !== "monthly") continue;
    const dueDay = b.dayOfMonth ?? 1;
    const title = `缴费/续费：${b.title}`;
    if (hasTask(title)) continue;

    // 当月到期前 3 天开始提醒；若已过期则标为 must
    const windowStart = Math.max(1, dueDay - 3);
    if (day < windowStart && day > dueDay) continue;

    const priority: LifeTask["priority"] = day >= dueDay ? "must" : "should";
    const dueAt = new Date(now.getFullYear(), now.getMonth(), dueDay, 12, 0, 0).toISOString();

    if (day >= windowStart) {
      proposedTasks.push({
        id: uid("task"),
        title,
        category: "缴费续期",
        priority,
        createdAt: now.toISOString(),
        status: "todo",
        dueAt,
        delegable: false
      });

      reminders.push({
        title,
        when: today,
        reason: priority === "must" ? "已到期/临近到期（必须处理）" : `本月 ${dueDay} 日到期（提前提醒）`
      });
    }
  }

  // 3) 从 Mental Load 中挑选“active 且高价值”的事项，作为本周清单候选（简版）
  const carry = mentalLoad
    .filter((m) => m.status === "active")
    .slice(0, 5)
    .map((m) => m.title);
  if (carry.length) notes.push(`当前隐形事务（简版）：${carry.join("、")}`);

  // 4) 若没有任何配置，给提示
  if ((!profile?.staples || profile.staples.length === 0) && (!profile?.recurringBills || profile.recurringBills.length === 0)) {
    notes.push("生活系统档案（补货/缴费）尚未配置：建议在“建档”里补充常用补货与固定缴费，提醒会更准确。");
  }

  // 去重（按 title）
  const dedup = new Map<string, LifeTask>();
  for (const t of proposedTasks) dedup.set(t.title, t);

  return {
    proposedTasks: [...dedup.values()],
    reminders,
    notes
  };
}
