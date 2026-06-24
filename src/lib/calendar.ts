import type { Task } from "@/lib/tasks";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatDate(value: string) {
  if (!isValidDate(value)) {
    return "Data inválida";
  }

  return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function compactDate(value: string) {
  return value.replaceAll("-", "");
}

export function addDays(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

export function isToday(value: string) {
  return value === toDateKey(new Date());
}

export function isOverdue(value: string) {
  return isValidDate(value) && value < toDateKey(new Date());
}

function escapeIcsText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

export function createIcsContent(task: Task) {
  const start = compactDate(task.dueDate);
  const end = compactDate(addDays(task.dueDate, 1));
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const description = task.description || `Status: ${task.status}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Todo List Teste Inicial//PT-BR",
    "BEGIN:VEVENT",
    `UID:${task.id}@todo-list-teste-inicial`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcsText(task.title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(task: Task) {
  const blob = new Blob([createIcsContent(task)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${task.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "tarefa"}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function buildGoogleCalendarUrl(task: Task) {
  const start = compactDate(task.dueDate);
  const end = compactDate(addDays(task.dueDate, 1));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    dates: `${start}/${end}`,
    details: task.description || `Status: ${task.status}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
