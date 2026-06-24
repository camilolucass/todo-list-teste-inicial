"use client";

import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  ListTodo,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  formatDate,
  isOverdue,
  isToday,
  isValidDate,
  toDateKey,
} from "@/lib/calendar";
import {
  createTaskId,
  emptyTaskForm,
  migrateTask,
  normalizeText,
  Task,
  TaskForm,
  TaskStatus,
} from "@/lib/tasks";

const STORAGE_KEY = "todo-list-teste-inicial";

type ViewMode = "lista" | "calendario";
type StatusFilter = "Todas" | TaskStatus;
type FormErrors = Partial<Record<keyof Pick<TaskForm, "title" | "dueDate">, string>>;

const statusOptions: TaskStatus[] = ["Pendente", "Concluída"];

export function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyTaskForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todas");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);

    if (!storedTasks) {
      return;
    }

    try {
      const parsedTasks = JSON.parse(storedTasks);
      const migratedTasks = Array.isArray(parsedTasks)
        ? parsedTasks.map(migrateTask).filter(Boolean)
        : [];

      setTasks(migratedTasks as Task[]);
    } catch {
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const pending = tasks.filter((task) => task.status === "Pendente").length;
    const done = tasks.filter((task) => task.status === "Concluída").length;
    const overdue = tasks.filter(
      (task) => task.status === "Pendente" && isOverdue(task.dueDate),
    ).length;
    const today = tasks.filter((task) => isToday(task.dueDate)).length;

    return { total: tasks.length, pending, done, overdue, today };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    return tasks
      .filter((task) => {
        const matchesStatus = statusFilter === "Todas" || task.status === statusFilter;
        const searchable = normalizeText(
          `${task.title} ${task.description} ${task.dueDate} ${task.status}`,
        );
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

        return matchesStatus && matchesQuery;
      })
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate));
  }, [query, statusFilter, tasks]);

  const groupedByDate = useMemo(() => {
    return filteredTasks.reduce<Record<string, Task[]>>((accumulator, task) => {
      accumulator[task.dueDate] = [...(accumulator[task.dueDate] ?? []), task];
      return accumulator;
    }, {});
  }, [filteredTasks]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        key: toDateKey(date),
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
      };
    });
  }, [visibleMonth]);

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  function updateForm(field: keyof TaskForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Informe o título da tarefa.";
    }

    if (!isValidDate(form.dueDate)) {
      nextErrors.dueDate = "Informe uma data prevista válida.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function resetForm() {
    setForm(emptyTaskForm);
    setErrors({});
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingId
            ? {
                ...task,
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                updatedAt: now,
              }
            : task,
        ),
      );
    } else {
      setTasks((currentTasks) => [
        {
          id: createTaskId(),
          title: form.title.trim(),
          description: form.description.trim(),
          dueDate: form.dueDate,
          status: form.status,
          createdAt: now,
        },
        ...currentTasks,
      ]);
    }

    resetForm();
  }

  function editTask(task: Task) {
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
    });
    setErrors({});
    setEditingId(task.id);
  }

  function deleteTask(task: Task) {
    const confirmed = window.confirm(`Excluir a tarefa "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id));

    if (editingId === task.id) {
      resetForm();
    }
  }

  function changeMonth(amount: number) {
    setVisibleMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(currentMonth.getMonth() + amount);
      return nextMonth;
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Teste Inicial | Programação</p>
          <h1>Lista de Tarefas</h1>
        </div>

        <div className="metric-grid" aria-label="Resumo das tarefas">
          <Metric label="Total" value={stats.total} />
          <Metric label="Pendentes" value={stats.pending} />
          <Metric label="Concluídas" value={stats.done} />
          <Metric label="Hoje" value={stats.today} />
          <Metric label="Atrasadas" value={stats.overdue} tone={stats.overdue ? "danger" : "default"} />
        </div>
      </header>

      <div className="workspace">
        <section className="task-editor" aria-labelledby="form-title">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Tarefa</p>
              <h2 id="form-title">{editingId ? "Editar tarefa" : "Nova tarefa"}</h2>
            </div>

            {editingId ? (
              <button className="icon-action" type="button" onClick={resetForm} title="Cancelar edição">
                <X size={18} />
                <span>Cancelar</span>
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="task-title">Título</label>
              <input
                id="task-title"
                maxLength={80}
                onInput={(event) => updateForm("title", event.currentTarget.value)}
                placeholder="Ex.: Enviar relatório"
                required
                type="text"
                value={form.title}
              />
              <p className="field-error" aria-live="polite">
                {errors.title}
              </p>
            </div>

            <div className="field">
              <label htmlFor="task-description">Descrição</label>
              <textarea
                id="task-description"
                onInput={(event) => updateForm("description", event.currentTarget.value)}
                placeholder="Detalhes da tarefa"
                rows={5}
                value={form.description}
              />
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="task-date">Data prevista</label>
                <input
                  id="task-date"
                  onInput={(event) => updateForm("dueDate", event.currentTarget.value)}
                  required
                  type="date"
                  value={form.dueDate}
                />
                <p className="field-error" aria-live="polite">
                  {errors.dueDate}
                </p>
              </div>

              <div className="field">
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  onChange={(event) => updateForm("status", event.target.value as TaskStatus)}
                  value={form.status}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="primary-button" type="submit">
              {editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
              {editingId ? "Salvar alterações" : "Adicionar tarefa"}
            </button>
          </form>
        </section>

        <section className="task-board" aria-labelledby="list-title">
          <div className="toolbar">
            <div>
              <p className="panel-kicker">Gestão</p>
              <h2 id="list-title">Tarefas</h2>
              <span>{filteredTasks.length} resultados</span>
            </div>

            <div className="toolbar-controls">
              <label className="search-box" htmlFor="task-search">
                <Search size={18} />
                <input
                  id="task-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar"
                  type="search"
                  value={query}
                />
              </label>

              <label className="select-box" htmlFor="status-filter">
                <Filter size={16} />
                <select
                  id="status-filter"
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  value={statusFilter}
                >
                  <option value="Todas">Todas</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="view-tabs" role="tablist" aria-label="Visualização das tarefas">
            <button
              aria-selected={viewMode === "lista"}
              className={viewMode === "lista" ? "active" : ""}
              onClick={() => setViewMode("lista")}
              type="button"
            >
              <ListTodo size={17} />
              Lista
            </button>
            <button
              aria-selected={viewMode === "calendario"}
              className={viewMode === "calendario" ? "active" : ""}
              onClick={() => setViewMode("calendario")}
              type="button"
            >
              <CalendarDays size={17} />
              Calendário
            </button>
          </div>

          {viewMode === "lista" ? (
            <TaskList
              filteredTasks={filteredTasks}
              onDelete={deleteTask}
              onEdit={editTask}
              query={query}
              statusFilter={statusFilter}
            />
          ) : (
            <CalendarView
              calendarDays={calendarDays}
              groupedByDate={groupedByDate}
              monthLabel={monthLabel}
              onDelete={deleteTask}
              onEdit={editTask}
              onMoveMonth={changeMonth}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "danger";
}) {
  return (
    <div className={`metric ${tone === "danger" ? "danger" : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function TaskList({
  filteredTasks,
  onDelete,
  onEdit,
  query,
  statusFilter,
}: {
  filteredTasks: Task[];
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  query: string;
  statusFilter: StatusFilter;
}) {
  if (filteredTasks.length === 0) {
    const hasFilters = query.trim() || statusFilter !== "Todas";
    return (
      <div className="empty-state">
        <ClipboardList size={34} />
        <strong>{hasFilters ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa cadastrada"}</strong>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} onDelete={onDelete} onEdit={onEdit} task={task} />
      ))}
    </ul>
  );
}

function TaskItem({
  task,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const overdue = task.status === "Pendente" && isOverdue(task.dueDate);

  return (
    <li className="task-item">
      <div className="task-main">
        <div className="task-title-row">
          <span className={`status-dot ${task.status === "Concluída" ? "done" : ""}`} />
          <h3>{task.title}</h3>
        </div>
        {task.description ? <p>{task.description}</p> : null}
        <div className="task-meta">
          <span className={overdue ? "danger-chip" : ""}>
            <CalendarDays size={15} />
            {formatDate(task.dueDate)}
          </span>
          <span>
            {task.status === "Concluída" ? <CheckCircle2 size={15} /> : <RotateCcw size={15} />}
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button type="button" onClick={() => onEdit(task)} title="Editar tarefa">
          <Edit3 size={16} />
          Editar
        </button>
        <a href={buildGoogleCalendarUrl(task)} rel="noreferrer" target="_blank" title="Abrir no Google Calendar">
          <CalendarPlus size={16} />
          Google
        </a>
        <button type="button" onClick={() => downloadIcsFile(task)} title="Baixar arquivo .ics">
          <Download size={16} />
          ICS
        </button>
        <button className="danger-action" type="button" onClick={() => onDelete(task)} title="Excluir tarefa">
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </li>
  );
}

function CalendarView({
  calendarDays,
  groupedByDate,
  monthLabel,
  onDelete,
  onEdit,
  onMoveMonth,
}: {
  calendarDays: Array<{ key: string; day: number; isCurrentMonth: boolean }>;
  groupedByDate: Record<string, Task[]>;
  monthLabel: string;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onMoveMonth: (amount: number) => void;
}) {
  return (
    <div className="calendar-panel">
      <div className="calendar-header">
        <button type="button" onClick={() => onMoveMonth(-1)} title="Mês anterior">
          <ChevronLeft size={18} />
        </button>
        <strong>{monthLabel}</strong>
        <button type="button" onClick={() => onMoveMonth(1)} title="Próximo mês">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day) => {
          const dayTasks = groupedByDate[day.key] ?? [];
          return (
            <div className={`calendar-day ${day.isCurrentMonth ? "" : "muted"}`} key={day.key}>
              <span className={isToday(day.key) ? "today-marker" : ""}>{day.day}</span>
              <div>
                {dayTasks.slice(0, 3).map((task) => (
                  <button key={task.id} type="button" onClick={() => onEdit(task)}>
                    {task.status === "Concluída" ? <CheckCircle2 size={12} /> : <ExternalLink size={12} />}
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 ? <small>+{dayTasks.length - 3}</small> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="agenda-list">
        {Object.entries(groupedByDate).length === 0 ? (
          <div className="empty-state compact">
            <CalendarDays size={28} />
            <strong>Nenhuma tarefa na agenda</strong>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, tasks]) => (
            <section className="agenda-day" key={date}>
              <h3>{formatDate(date)}</h3>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.title}</span>
                    <div>
                      <button type="button" onClick={() => onEdit(task)} title="Editar">
                        <Edit3 size={15} />
                      </button>
                      <button type="button" onClick={() => downloadIcsFile(task)} title="Baixar ICS">
                        <Download size={15} />
                      </button>
                      <button type="button" onClick={() => onDelete(task)} title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
