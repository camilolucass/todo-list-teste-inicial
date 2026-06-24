export type TaskStatus = "Pendente" | "Concluída";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
};

export type TaskForm = {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
};

export const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  dueDate: "",
  status: "Pendente",
};

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createTaskId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type StoredTask = Omit<Partial<Task>, "status"> & { status?: string };

export function migrateTask(rawTask: StoredTask): Task | null {
  if (!rawTask.id || !rawTask.title || !rawTask.dueDate || !rawTask.createdAt) {
    return null;
  }

  return {
    id: String(rawTask.id),
    title: String(rawTask.title),
    description: String(rawTask.description ?? ""),
    dueDate: String(rawTask.dueDate),
    status:
      rawTask.status === "Concluida" || rawTask.status === "Concluída"
        ? "Concluída"
        : "Pendente",
    createdAt: String(rawTask.createdAt),
    updatedAt: rawTask.updatedAt ? String(rawTask.updatedAt) : undefined,
  };
}
