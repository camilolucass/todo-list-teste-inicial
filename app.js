const STORAGE_KEY = "todo-list-teste-inicial";

const form = document.querySelector("#task-form");
const taskIdInput = document.querySelector("#task-id");
const titleInput = document.querySelector("#task-title");
const descriptionInput = document.querySelector("#task-description");
const dueDateInput = document.querySelector("#task-date");
const statusInput = document.querySelector("#task-status");
const submitButton = document.querySelector("#submit-button");
const cancelEditButton = document.querySelector("#cancel-edit");
const formTitle = document.querySelector("#form-title");
const searchInput = document.querySelector("#task-search");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const template = document.querySelector("#task-template");
const titleError = document.querySelector("#title-error");
const dateError = document.querySelector("#date-error");
const totalCount = document.querySelector("#total-count");
const pendingCount = document.querySelector("#pending-count");
const doneCount = document.querySelector("#done-count");
const resultCount = document.querySelector("#result-count");

let tasks = loadTasks();

function loadTasks() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);

  if (!storedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isValidDate(value) {
  if (!value) {
    return false;
  }

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

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function validateForm() {
  const title = titleInput.value.trim();
  const dueDate = dueDateInput.value;
  const errors = {
    title: title ? "" : "Informe o titulo da tarefa.",
    dueDate: isValidDate(dueDate) ? "" : "Informe uma data prevista valida.",
  };

  titleError.textContent = errors.title;
  dateError.textContent = errors.dueDate;
  titleInput.classList.toggle("input-error", Boolean(errors.title));
  dueDateInput.classList.toggle("input-error", Boolean(errors.dueDate));

  return !errors.title && !errors.dueDate;
}

function createTaskId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clearValidation() {
  titleError.textContent = "";
  dateError.textContent = "";
  titleInput.classList.remove("input-error");
  dueDateInput.classList.remove("input-error");
}

function resetForm() {
  form.reset();
  taskIdInput.value = "";
  statusInput.value = "Pendente";
  submitButton.textContent = "Adicionar tarefa";
  formTitle.textContent = "Nova tarefa";
  cancelEditButton.classList.add("hidden");
  clearValidation();
  titleInput.focus();
}

function getFilteredTasks() {
  const query = normalizeText(searchInput.value.trim());

  if (!query) {
    return tasks;
  }

  return tasks.filter((task) => {
    const searchable = normalizeText(
      `${task.title} ${task.description} ${task.dueDate} ${task.status}`,
    );
    return searchable.includes(query);
  });
}

function updateSummary(filteredTasks) {
  const pending = tasks.filter((task) => task.status === "Pendente").length;
  const done = tasks.filter((task) => task.status === "Concluida").length;

  totalCount.textContent = tasks.length;
  pendingCount.textContent = pending;
  doneCount.textContent = done;
  resultCount.textContent = `${filteredTasks.length} ${
    filteredTasks.length === 1 ? "resultado" : "resultados"
  }`;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  filteredTasks.forEach((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.dataset.id = task.id;
    item.dataset.status = task.status;
    item.querySelector("h3").textContent = task.title;
    item.querySelector(".task-description").textContent = task.description;
    item.querySelector(".due-date").textContent = `Prevista: ${formatDate(task.dueDate)}`;
    item.querySelector(".status-badge").textContent = task.status;
    item.querySelector(".edit-button").addEventListener("click", () => editTask(task.id));
    item
      .querySelector(".delete-button")
      .addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(item);
  });

  emptyState.classList.toggle("hidden", filteredTasks.length > 0);
  emptyMessage.textContent =
    tasks.length === 0 ? "Nenhuma tarefa cadastrada" : "Nenhuma tarefa encontrada";
  taskList.classList.toggle("hidden", filteredTasks.length === 0);
  updateSummary(filteredTasks);
}

function upsertTask(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const taskData = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dueDateInput.value,
    status: statusInput.value,
  };

  const editingId = taskIdInput.value;

  if (editingId) {
    tasks = tasks.map((task) =>
      task.id === editingId ? { ...task, ...taskData, updatedAt: new Date().toISOString() } : task,
    );
  } else {
    tasks = [
      {
        id: createTaskId(),
        createdAt: new Date().toISOString(),
        ...taskData,
      },
      ...tasks,
    ];
  }

  saveTasks();
  renderTasks();
  resetForm();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  dueDateInput.value = task.dueDate;
  statusInput.value = task.status;
  submitButton.textContent = "Salvar alteracoes";
  formTitle.textContent = "Editar tarefa";
  cancelEditButton.classList.remove("hidden");
  clearValidation();
  titleInput.focus();
}

function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  const confirmed = window.confirm(`Excluir a tarefa "${task.title}"?`);

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();

  if (taskIdInput.value === id) {
    resetForm();
  }

  renderTasks();
}

form.addEventListener("submit", upsertTask);
cancelEditButton.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderTasks);
titleInput.addEventListener("input", clearValidation);
dueDateInput.addEventListener("input", clearValidation);

renderTasks();
