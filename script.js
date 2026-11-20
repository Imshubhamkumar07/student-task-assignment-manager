const STORAGE_KEY = "studentTaskManagerTasks";
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

document.getElementById("today").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "short", day: "numeric", month: "short", year: "numeric"
});

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateStats() {
  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = tasks.filter(t => t.completed).length;
  document.getElementById("pendingCount").textContent = tasks.filter(t => !t.completed).length;
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const status = filterStatus.value;
  const visibleTasks = tasks.filter(task => {
    const matchesText = (task.title + " " + task.subject).toLowerCase().includes(query);
    const matchesStatus = status === "all" ||
      (status === "completed" && task.completed) ||
      (status === "pending" && !task.completed);
    return matchesText && matchesStatus;
  });

  taskList.innerHTML = "";
  emptyState.style.display = visibleTasks.length ? "none" : "block";

  visibleTasks.forEach(task => {
    const item = document.createElement("article");
    item.className = "task" + (task.completed ? " done" : "");

    const main = document.createElement("div");
    main.className = "task-main";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.completed;
    check.setAttribute("aria-label", "Mark task completed");
    check.addEventListener("change", () => toggleTask(task.id));

    const details = document.createElement("div");
    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const subject = document.createElement("span");
    subject.textContent = task.subject;
    const due = document.createElement("span");
    due.textContent = "Due: " + formatDate(task.dueDate);
    const priority = document.createElement("span");
    priority.className = "priority " + task.priority;
    priority.textContent = task.priority + " priority";
    meta.append(subject, due, priority);
    details.append(title, meta);
    main.append(check, details);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const edit = document.createElement("button");
    edit.className = "edit";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editTask(task.id));
    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteTask(task.id));
    actions.append(edit, remove);

    item.append(main, actions);
    taskList.append(item);
  });
  updateStats();
}

function resetForm() {
  taskForm.reset();
  document.getElementById("taskId").value = "";
  document.getElementById("formHeading").textContent = "Add a new task";
  document.getElementById("submitButton").textContent = "Add Task";
  document.getElementById("cancelEdit").classList.add("hidden");
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const id = document.getElementById("taskId").value;
  const taskData = {
    title: document.getElementById("title").value.trim(),
    subject: document.getElementById("subject").value,
    dueDate: document.getElementById("dueDate").value,
    priority: document.getElementById("priority").value,
    completed: false
  };

  if (!taskData.title || !taskData.subject || !taskData.dueDate) return;

  if (id) {
    const existing = tasks.find(task => task.id === id);
    if (existing) Object.assign(existing, taskData, { completed: existing.completed });
  } else {
    tasks.unshift({ id: Date.now().toString(), ...taskData });
  }

  saveTasks();
  resetForm();
  renderTasks();
});

function toggleTask(id) {
  tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  document.getElementById("taskId").value = task.id;
  document.getElementById("title").value = task.title;
  document.getElementById("subject").value = task.subject;
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("priority").value = task.priority;
  document.getElementById("formHeading").textContent = "Edit task";
  document.getElementById("submitButton").textContent = "Save Changes";
  document.getElementById("cancelEdit").classList.remove("hidden");
  document.getElementById("title").focus();
}

function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

document.getElementById("cancelEdit").addEventListener("click", resetForm);
searchInput.addEventListener("input", renderTasks);
filterStatus.addEventListener("change", renderTasks);

renderTasks();
