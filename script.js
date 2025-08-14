// script.js
// Mini Tasks - lógica simple con localStorage
(function () {
  const $ = (sel) => document.querySelector(sel);
  const taskForm = $("#taskForm");
  const taskInput = $("#taskInput");
  const taskList = $("#taskList");
  const clearDoneBtn = $("#clearDone");
  const themeToggle = $("#themeToggle");
  const THEME_KEY = "mini_tasks_theme";
  const STORAGE_KEY = "mini_tasks_data";

  // ====== Tema (dark/light) ======
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", current);
    localStorage.setItem(THEME_KEY, current);
  });

  // ====== Estado ======
  let tasks = load();

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  // ====== Render ======
  function render() {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
      taskList.innerHTML = '<li class="task" aria-live="polite" style="justify-content:center;">No hay tareas aún ✨</li>';
      return;
    }
    for (const t of tasks) {
      const li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "");
      li.innerHTML = `
        <input type="checkbox" ${t.done ? "checked" : ""} data-id="${t.id}" aria-label="Marcar completa" />
        <span class="title">${escapeHtml(t.title)}</span>
        <button class="remove" data-id="${t.id}" aria-label="Eliminar">🗑️</button>
      `;
      taskList.appendChild(li);
    }
  }

  function escapeHtml(str) {
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
  }

  // ====== Eventos ======
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;
    tasks.unshift({ id: crypto.randomUUID(), title, done: false, createdAt: Date.now() });
    taskInput.value = "";
    persist();
    render();
  });

  taskList.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    if (!id) return;
    if (e.target.matches("button.remove")) {
      tasks = tasks.filter((t) => t.id !== id);
      persist();
      render();
      return;
    }
    if (e.target.matches('input[type="checkbox"]')) {
      const t = tasks.find((x) => x.id === id);
      if (t) {
        t.done = e.target.checked;
        persist();
        render();
      }
    }
  });

  clearDoneBtn.addEventListener("click", () => {
    const before = tasks.length;
    tasks = tasks.filter((t) => !t.done);
    if (tasks.length !== before) {
      persist();
      render();
    }
  });

  // Primer render
  render();
})();
