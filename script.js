const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const STORAGE_KEY = "todo.items.v1";
let items = load();
let filter = "all"; // all | active | completed

const input = $("#todo-input");
const list = $("#list");
const counter = $("#counter");
const empty = $("#empty");

render();

// --- Events ---
$("#add-btn").addEventListener("click", addFromInput);
input.addEventListener("keydown", e => { if (e.key === "Enter") addFromInput(); });

$("#filters").addEventListener("click", e => {
  const btn = e.target.closest("button[data-filter]");
  if (!btn) return;
  filter = btn.dataset.filter;
  $$("#filters button").forEach(b => b.classList.toggle("active", b === btn));
  render();
});

$("#clear-completed").addEventListener("click", () => {
  items = items.filter(t => !t.done);
  save(); render();
});

$("#export-json").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "todos.json"; a.click();
  URL.revokeObjectURL(url);
});

$("#import-json").addEventListener("click", () => $("#import-file").click());
$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    items = JSON.parse(text);
    save(); render();
  } catch {
    alert("Invalid JSON file");
  }
  e.target.value = "";
});

// --- Functions ---
function addFromInput() {
  const title = input.value.trim();
  if (!title) return;
  items.push({id:Date.now().toString(), title, done:false});
  input.value = "";
  save(); render();
}

function toggle(id) {
  const t = items.find(x => x.id===id);
  if (t) t.done = !t.done;
  save(); render();
}

function remove(id) {
  items = items.filter(t => t.id !== id);
  save(); render();
}

function render() {
  list.innerHTML = "";
  let filtered = items;
  if (filter==="active") filtered = items.filter(t=>!t.done);
  if (filter==="completed") filtered = items.filter(t=>t.done);

  if (!filtered.length) empty.hidden = false;
  else empty.hidden = true;

  for (const t of filtered) {
    const li = document.createElement("li");
    li.className = t.done ? "completed" : "";

    const cb = document.createElement("input");
    cb.type="checkbox"; cb.checked=t.done;
    cb.addEventListener("change", ()=>toggle(t.id));

    const span = document.createElement("span");
    span.className="title";
    span.textContent = t.title;

    const actions = document.createElement("div");
    actions.className="todo-actions";

    const del = document.createElement("button");
    del.className="icon-btn danger";
    del.textContent="✖";
    del.addEventListener("click", ()=>remove(t.id));

    actions.append(del);
    li.append(cb, span, actions);
    list.append(li);
  }

  counter.textContent = `${items.length} item${items.length!==1?"s":""}`;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
