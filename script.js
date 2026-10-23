const STATUSES = ['todo', 'in-progress', 'done'];

let tasks = JSON.parse(localStorage.getItem('kanban_tasks')) || [
    { id: 1, title: 'Estudar JavaScript', status: 'todo' },
    { id: 2, title: 'Criar protótipo Kanban', status: 'in-progress' },
    { id: 3, title: 'Definir estrutura inicial', status: 'done' }
];

function saveAndRender() {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
    renderTasks();
}

document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const title = input.value.trim();

    if (title) {
        tasks.push({
            id: Date.now(),
            title: title,
            status: 'todo'
        });
        input.value = '';
        saveAndRender();
    }
});

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function moveTask(id, direction) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentIndex = STATUSES.indexOf(task.status);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < STATUSES.length) {
        task.status = STATUSES[newIndex];
        saveAndRender();
    }
}

let draggedTaskId = null;

function dragStart(e, id) {
    draggedTaskId = id;
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    const newStatus = column.getAttribute('data-status');

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== newStatus) {
        task.status = newStatus;
        saveAndRender();
    }
}

function renderTasks() {
    STATUSES.forEach(status => {
        document.getElementById(`list-${status}`).innerHTML = '';
    });

    const counts = { 'todo': 0, 'in-progress': 0, 'done': 0 };

    tasks.forEach(task => {
        counts[task.status]++;
        const listEl = document.getElementById(`list-${task.status}`);
        if (!listEl) return;

        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.ondragstart = (e) => dragStart(e, task.id);
        card.ondragend = dragEnd;

        const currentIdx = STATUSES.indexOf(task.status);
        const canMoveLeft = currentIdx > 0;
        const canMoveRight = currentIdx < STATUSES.length - 1;

        card.innerHTML = `
            <div class="card-text">${escapeHTML(task.title)}</div>
            <div class="card-actions">
                <div class="move-btns">
                    ${canMoveLeft ? `<button class="btn-action" onclick="moveTask(${task.id}, -1)">←</button>` : ''}
                    ${canMoveRight ? `<button class="btn-action" onclick="moveTask(${task.id}, 1)">→</button>` : ''}
                </div>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Excluir</button>
            </div>
        `;

        listEl.appendChild(card);
    });

    STATUSES.forEach(status => {
        document.getElementById(`count-${status}`).innerText = counts[status];
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

renderTasks();