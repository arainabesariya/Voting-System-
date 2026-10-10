const KEY = "ltce-voting-demo";
const students = [
  ["LTCE001","Aarav Sharma","President"], ["LTCE002","Ananya Patil","President"], ["LTCE003","Ishaan Deshmukh","President"],
  ["LTCE004","Aditi Joshi","Vice President"], ["LTCE005","Rohan Kulkarni","Vice President"], ["LTCE006","Meera Shah","Vice President"],
  ["LTCE007","Kabir Mehta","Secretary"], ["LTCE008","Saanvi Rao","Secretary"], ["LTCE009","Vihaan Gupta","Secretary"],
  ["LTCE010","Diya Nair",""], ["LTCE011","Arjun Verma",""], ["LTCE012","Myra Singh",""], ["LTCE013","Advik Pawar",""],
  ["LTCE014","Kiara Shah",""], ["LTCE015","Reyansh More",""], ["LTCE016","Ira Kulkarni",""], ["LTCE017","Atharv Joshi",""],
  ["LTCE018","Anvi Desai",""], ["LTCE019","Krish Malhotra",""], ["LTCE020","Pari Iyer",""], ["LTCE021","Dhruv Patil",""],
  ["LTCE022","Sara Khan",""], ["LTCE023","Yuvaan Shah",""], ["LTCE024","Navya Rao",""], ["LTCE025","Vivaan Mehta",""]
];
const positions = [
  { key: "president", title: "President", id: "president" },
  { key: "vicePresident", title: "Vice President", id: "vicePresident" },
  { key: "secretary", title: "Secretary", id: "secretary" }
];
const candidates = {
  president: students.filter(s => s[2] === "President").map(s => ({ id: s[0], name: s[1] })),
  vicePresident: students.filter(s => s[2] === "Vice President").map(s => ({ id: s[0], name: s[1] })),
  secretary: students.filter(s => s[2] === "Secretary").map(s => ({ id: s[0], name: s[1] }))
};
const $ = id => document.getElementById(id);
let data = loadData(), currentStudent = null, pendingVote = null;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved && Array.isArray(saved.votes) ? saved : { votes: [] };
  } catch { return { votes: [] }; }
}
function saveData() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
  catch { alert("Could not save data in this browser."); return false; }
}
function alreadyVoted(id) { return data.votes.some(v => v.studentId === id); }
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  if (id === "analysisView") renderAnalysis();
}
function renderCandidates() {
  positions.forEach(p => {
    $(p.id).innerHTML = candidates[p.key].map(c => `
      <label class="choice">
        <input type="radio" name="${p.key}" value="${c.id}">
        <span><strong>${c.name}</strong><small>Candidate for ${p.title}</small></span>
      </label>`).join("");
  });
}
function verifyStudent() {
  const id = $("studentId").value.trim().toUpperCase();
  const student = students.find(s => s[0] === id);
  currentStudent = null;
  $("ballot").classList.add("hidden");
  $("done").classList.add("hidden");
  $("verified").classList.add("hidden");
  if (!student) { $("message").textContent = "ID not found. Use LTCE001 to LTCE025."; return; }
  if (alreadyVoted(id)) { $("message").textContent = "This student has already voted in this browser."; return; }
  currentStudent = student;
  $("message").textContent = "Student ID verified.";
  $("verified").textContent = `Verified: ${student[1]} (${student[0]})`;
  $("verified").classList.remove("hidden");
  $("ballot").classList.remove("hidden");
  $("ballot").reset();
}
function makeReview() {
  const vote = {};
  for (const p of positions) {
    const selected = document.querySelector(`input[name="${p.key}"]:checked`);
    if (!selected) { alert(`Please select a candidate for ${p.title}.`); return null; }
    vote[p.key] = selected.value;
  }
  return vote;
}
function submitVote() {
  if (!currentStudent || !pendingVote || alreadyVoted(currentStudent[0])) return;
  data.votes.push({ studentId: currentStudent[0], ...pendingVote });
  if (!saveData()) { data.votes.pop(); return; }
  $("confirmDialog").close();
  $("ballot").classList.add("hidden");
  $("verified").classList.add("hidden");
  $("done").classList.remove("hidden");
  $("message").textContent = "Vote submitted. You may verify another student ID for the demo.";
  $("studentId").value = "";
  currentStudent = null;
  pendingVote = null;
  renderAnalysis();
}
function renderAnalysis() {
  $("totalVotes").textContent = data.votes.length;
  $("remaining").textContent = Math.max(0, students.length - data.votes.length);
  $("results").innerHTML = positions.map(p => {
    const rows = candidates[p.key].map(c => {
      const count = data.votes.filter(v => v[p.key] === c.id).length;
      const percent = data.votes.length ? count / data.votes.length * 100 : 0;
      return { ...c, count, percent };
    });
    const max = Math.max(...rows.map(r => r.count));
    const leaders = max ? rows.filter(r => r.count === max) : [];
    const label = !max ? "No votes yet" : leaders.length > 1 ? "Tie" : `Leading: ${leaders[0].name}`;
    return `<article class="result-card">
      <div class="result-title"><h3>${p.title}</h3><span class="leader">${label}</span></div>
      ${rows.map(r => `<div class="result-row">
        <strong>${r.name}</strong><div class="bar"><div class="fill" style="width:${r.percent}%"></div></div>
        <span class="vote-count">${r.count} · ${r.percent.toFixed(1)}%</span>
      </div>`).join("")}
      ${!data.votes.length ? '<p class="no-votes">Submit a ballot to see the chart update.</p>' : ""}
    </article>`;
  }).join("");
}
function resetDemo() {
  if (!confirm("Clear all demo votes in this browser?")) return;
  data = { votes: [] };
  saveData();
  currentStudent = null;
  pendingVote = null;
  $("ballot").reset();
  $("ballot").classList.add("hidden");
  $("done").classList.add("hidden");
  $("verified").classList.add("hidden");
  $("studentId").value = "";
  $("message").textContent = "Demo reset. Enter a student ID to begin.";
  renderAnalysis();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCandidates();
  renderAnalysis();
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
  $("verifyBtn").addEventListener("click", verifyStudent);
  $("studentId").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); verifyStudent(); } });
  $("ballot").addEventListener("submit", e => {
    e.preventDefault();
    if (!currentStudent) { alert("Please verify your student ID first."); return; }
    pendingVote = makeReview();
    if (!pendingVote) return;
    $("review").textContent = positions.map(p => {
      const c = candidates[p.key].find(item => item.id === pendingVote[p.key]);
      return `${p.title}: ${c.name}`;
    }).join(" | ");
    submitVote();
  });
  $("back").addEventListener("click", () => $("confirmDialog").close());
  $("confirm").addEventListener("click", submitVote);
  $("showAnalysis").addEventListener("click", () => showView("analysisView"));
  $("reset").addEventListener("click", resetDemo);
});
