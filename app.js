const starterSnippets = [
  {id:1,title:"Start a local dev server",category:"Terminal",language:"bash",note:"Quickly serve the current folder with Python.",code:"python -m http.server 8000"},
  {id:2,title:"Fetch data with async/await",category:"JavaScript",language:"javascript",note:"A clean pattern for handling API responses.",code:"async function getData(url) {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error('Request failed');\n  return response.json();\n}"},
  {id:3,title:"Create a Python virtual environment",category:"Python",language:"bash",note:"Keep project dependencies isolated.",code:"python -m venv .venv\n\n# Windows\n.venv\\Scripts\\activate\n\n# macOS / Linux\nsource .venv/bin/activate"},
  {id:4,title:"Undo the last Git commit",category:"Git",language:"bash",note:"Keep changes staged while removing the commit.",code:"git reset --soft HEAD~1"},
  {id:5,title:"Center an element",category:"HTML/CSS",language:"css",note:"A reliable grid-based centering shortcut.",code:".parent {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}"},
  {id:6,title:"Remove duplicates from an array",category:"JavaScript",language:"javascript",note:"Preserves the first occurrence of each value.",code:"const uniqueItems = [...new Set(items)];"}
];

const STORAGE_KEY = "snippet-vault-items-v1";
let snippets = loadSnippets();
let activeCategory = "All";
const grid = document.querySelector("#snippet-grid");
const search = document.querySelector("#search");
const dialog = document.querySelector("#snippet-dialog");
const form = document.querySelector("#snippet-form");

function loadSnippets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterSnippets;
  } catch {
    return starterSnippets;
  }
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}
function render() {
  const categories = ["All", ...new Set(snippets.map(item => item.category))];
  if (!categories.includes(activeCategory)) activeCategory = "All";
  document.querySelector("#filters").innerHTML = categories.map(category =>
    `<button class="filter ${category === activeCategory ? "active" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`
  ).join("");
  const term = search.value.trim().toLowerCase();
  const visible = snippets.filter(item =>
    (activeCategory === "All" || item.category === activeCategory) &&
    [item.title, item.category, item.language, item.note, item.code].join(" ").toLowerCase().includes(term)
  );
  grid.innerHTML = visible.map(item => `
    <article class="snippet">
      <div class="snippet-top"><div><h3>${escapeHTML(item.title)}</h3></div><span class="tag">${escapeHTML(item.category)}</span></div>
      <p class="note">${escapeHTML(item.note || "No note added.")}</p>
      <pre><code>${escapeHTML(item.code)}</code></pre>
      <div class="snippet-actions"><span class="language">${escapeHTML(item.language || "text")}</span>
        <div class="actions"><button class="small-btn" data-copy="${item.id}">Copy code</button><button class="small-btn" data-delete="${item.id}" aria-label="Delete ${escapeHTML(item.title)}">Delete</button></div>
      </div>
    </article>`).join("");
  document.querySelector("#total-count").textContent = snippets.length;
  document.querySelector("#category-count").textContent = new Set(snippets.map(item => item.category)).size;
  document.querySelector("#result-count").textContent = `${visible.length} shown`;
  document.querySelector("#empty").classList.toggle("hidden", visible.length !== 0);
}
document.querySelector("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  render();
});
search.addEventListener("input", render);
document.querySelector("#add-open").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
form.addEventListener("submit", event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  snippets.unshift({id:Date.now(), ...data});
  persist();
  activeCategory = "All";
  search.value = "";
  form.reset();
  dialog.close();
  render();
});
grid.addEventListener("click", async event => {
  const copyButton = event.target.closest("[data-copy]");
  const deleteButton = event.target.closest("[data-delete]");
  if (copyButton) {
    const item = snippets.find(snippet => snippet.id === Number(copyButton.dataset.copy));
    try {
      await navigator.clipboard.writeText(item.code);
      copyButton.textContent = "Copied!";
      setTimeout(() => { copyButton.textContent = "Copy code"; }, 1200);
    } catch {
      copyButton.textContent = "Copy unavailable";
    }
  }
  if (deleteButton) {
    snippets = snippets.filter(item => item.id !== Number(deleteButton.dataset.delete));
    persist();
    render();
  }
});
render();
