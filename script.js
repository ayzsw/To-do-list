const API_BASE = 'https://jsonplaceholder.typicode.com';
const USER_ID = 1;

const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const addBtn = document.getElementById('addBtn');
const tasksContainer = document.getElementById('tasksContainer');
const noTasks = document.getElementById('noTasks');

const editModal = document.getElementById('editModal');
const editTitle = document.getElementById('editTitle');
const editBody = document.getElementById('editBody');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');

let tasks = [];
let currentEditIndex = null; 

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАГРУЗКИ (ПРИОРИТЕТ: localStorage) ---
async function loadTasks() {
  const saved = localStorage.getItem('tasks');
    
  if (saved) {
    // 1. Если данные есть в localStorage, берем их оттуда
    try {
      tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка парсинга локального хранилища:', e);
      tasks = [];
    }
    
  } else {
    // 2. Если в localStorage пусто, пытаемся получить данные из API
    try {
      const res = await fetch(`${API_BASE}/todos?userId=${USER_ID}`);
      const data = await res.json();
      
      // Форматируем данные API и сохраняем их как начальный набор
      tasks = data.map(t => ({ id: t.id, title: t.title, body: '' })); 
      saveToLocal(); // Сохраняем начальные данные, чтобы больше не обращаться к API
      
    } catch (e) {
      console.error('API недоступен и локальное хранилище пусто. Список задач пуст.');
      tasks = [];
    }
  }
  render();
}
// -----------------------------------------------------------------

function saveToLocal() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function render() {
  tasksContainer.innerHTML = '';
  noTasks.style.display = tasks.length === 0 ? 'block' : 'none';

  tasks.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'task';

    div.innerHTML = `
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title || 'Task Title...')}</div>
        ${task.body ? `<div class="task-body">${escapeHtml(task.body)}</div>` : ''}
      </div>
      <button class="btn-orange" onclick="deleteTask(${i})">×</button>
    `;

    // Клик по задаче = редактировать
    div.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') return;
      currentEditIndex = i;
      editTitle.value = task.title || '';
      editBody.value = task.body || '';
      editModal.style.display = 'flex';
    });

    tasksContainer.appendChild(div);
  });
}

function deleteTask(index) {
  event.stopPropagation();
  tasks.splice(index, 1);
  saveToLocal();
  render();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Добавление новой задачи
addBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) return;

  tasks.push({ id: Date.now(), title, body });
  saveToLocal();
  render();

  titleInput.value = '';
  bodyInput.value = '';
});

// Enter в полях тоже добавляет
titleInput.addEventListener('keydown', e => e.key === 'Enter' && addBtn.click());
bodyInput.addEventListener('keydown', e => e.key === 'Enter' && addBtn.click());

// Редактирование
saveEdit.addEventListener('click', () => {
  const title = editTitle.value.trim();
  if (!title || currentEditIndex === null) return;

  tasks[currentEditIndex].title = title;
  tasks[currentEditIndex].body = editBody.value.trim();
  saveToLocal();
  render();
  editModal.style.display = 'none';
});

cancelEdit.addEventListener('click', () => {
  editModal.style.display = 'none';
});

// Закрытие модалки по клику вне её
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.style.display = 'none';
});

// Старт
loadTasks();
