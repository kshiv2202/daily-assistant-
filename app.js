const schedule = {
  Monday: [
    ["9:00", "Introduction to Engineering Mathematics", "Mr. Vikas Bhatt sir"],
    ["10:00", "Engineering Physics", "Dr. Richa Sharma ma'am"],
    ["11:05", "Programming for Problem Solving", "Mr. Deepak Njwala sir"],
    ["12:00", "Basic Electrical Engineering", "Mrs. Mamta Chamoli ma'am"],
    ["2:00", "Introduction to Digital Marketing (Lab)", "Mr. Amit Kumar sir"]
  ],
  Tuesday: [
    ["9:00", "Introduction to Engineering Mathematics", "Mr. Vikas Bhatt sir"],
    ["10:00", "Engineering Physics", "Dr. Richa Sharma ma'am"],
    ["11:05", "Basic Electrical Engineering", "Mrs. Mamta Chamoli ma'am"],
    ["12:00", "Engineering Design & Graphics Lab", "Dr. Rahul Bahuguna sir"],
    ["2:00", "Engineering Design & Graphics Lab (contd.)", "Dr. Rahul Bahuguna sir"]
  ],
  Wednesday: [
    ["9:00", "Programming for Problem Solving", "Mr. Deepak Njwala sir"],
    ["10:00", "Engineering Physics", "Dr. Richa Sharma ma'am"],
    ["11:05", "Basic Electrical Engineering lab", "Mrs. Mamta Chamoli ma'am"],
    ["2:00", "Programming for Problem Solving lab", "Mr. Deepak Njwala sir"],
    ["3:00", "Library", ""]
  ],
  Thursday: [
    ["9:00", "Introduction to Engineering Mathematics", "Mr. Vikas Bhatt sir"],
    ["10:00", "Engineering Physics", "Dr. Richa Sharma ma'am"],
    ["11:05", "Basic Electrical Engineering", "Mrs. Mamta Chamoli ma'am"],
    ["12:00", "Programming for Problem Solving", "Mr. Deepak Njwala sir"],
    ["2:00", "Library", ""]
  ],
  Friday: [
    ["9:00", "Introduction to Engineering Mathematics", "Mr. Vikas Bhatt sir"],
    ["10:00", "Environmental Studies", "Dr. Aditi Kandari ma'am"],
    ["11:05", "Self-Employment & Entrepreneurship (Lab)", "Dr. Vishal Ramola sir"],
    ["2:00", "Basic Electrical Engineering", "Mrs. Mamta Chamoli ma'am"],
    ["3:00", "Library", ""]
  ],
  Saturday: [
    ["9:00", "Environmental Studies", "Dr. Aditi Kandari ma'am"],
    ["10:00", "Library", ""],
    ["11:05", "Engineering Physics lab", "Dr. Richa Sharma ma'am"],
    ["2:00", "Programming for Problem Solving", "Mr. Deepak Njwala sir"],
    ["3:00", "Library", ""],
    ["4:00", "Sports", ""]
  ],
  Sunday: []
};

let tasks = JSON.parse(localStorage.getItem("morningTasks") || "[]");
const $ = id => document.getElementById(id);

function save() { localStorage.setItem("morningTasks", JSON.stringify(tasks)); }
function updateClock() {
  const now = new Date();
  $("time").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("date").textContent = now.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  const day = now.toLocaleDateString([], { weekday: "long" });
  $("greeting").textContent = `Good ${now.getHours() < 12 ? "Morning" : now.getHours() < 18 ? "Afternoon" : "Evening"}! ${day}`;
}
function renderClasses() {
  const day = new Date().toLocaleDateString([], { weekday: "long" });
  const list = schedule[day] || [];
  $("classCount").textContent = `${list.length} today`;
  $("classes").innerHTML = list.length ? list.map(x => `<div class="row"><div><b>${x[0]}</b><div>${x[1]}</div>${x[2] ? `<span class="muted">${x[2]}</span>` : ""}</div></div>`).join("") : `<p class="muted">Aaj koi class nahi hai.</p>`;
}
function renderTasks() {
  $("taskCount").textContent = `${tasks.filter(t => !t.done).length} pending`;
  $("tasks").innerHTML = tasks.length ? tasks.map((t, i) => `<div class="row ${t.done ? "done" : ""}"><span>☑️ ${escapeHtml(t.text)}</span><span class="task-actions"><button onclick="toggleTask(${i})">✓</button><button onclick="deleteTask(${i})">✕</button></span></div>`).join("") : `<p class="muted">Aaj ka koi task nahi hai.</p>`;
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function addTask(text) {
  text = text.trim(); if (!text) return;
  tasks.push({ text, done: false }); save(); renderTasks();
}
window.toggleTask = i => { tasks[i].done = !tasks[i].done; save(); renderTasks(); }
window.deleteTask = i => { tasks.splice(i, 1); save(); renderTasks(); }

function speak(text) {
  if ("speechSynthesis" in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-IN"; speechSynthesis.speak(u); }
}
function morningSummary() {
  const day = new Date().toLocaleDateString([], { weekday: "long" });
  const classes = schedule[day] || [];
  const pending = tasks.filter(t => !t.done);
  let text = `Good morning. Today is ${day}. `;
  text += classes.length ? `You have ${classes.length} classes today. ` : "You have no classes today. ";
  text += pending.length ? `You have ${pending.length} pending tasks. ` : "You have no pending tasks. ";
  $("status").textContent = text;
  speak(text);
}
$("addTask").onclick = () => addTask($("taskInput").value);
$("taskInput").addEventListener("keydown", e => { if (e.key === "Enter") { $("addTask").click(); $("taskInput").value = ""; } });
$("summaryBtn").onclick = morningSummary;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const r = new SpeechRecognition(); r.lang = "en-IN"; r.interimResults = false;
  $("speakBtn").onclick = () => { r.start(); $("speakBtn").classList.add("listening"); $("status").textContent = "Listening... बोलिए"; };
  r.onresult = e => handleCommand(e.results[0][0].transcript);
  r.onend = () => $("speakBtn").classList.remove("listening");
  r.onerror = () => { $("status").textContent = "Microphone/voice recognition error. Please try again."; };
} else {
  $("speakBtn").onclick = () => { $("status").textContent = "Voice recognition is not supported here. Try Chrome or Edge."; };
}
function handleCommand(raw) {
  const c = raw.toLowerCase();
  $("status").textContent = `You said: “${raw}”`;
  if (c.includes("task") && (c.includes("what") || c.includes("show") || c.includes("bata"))) {
    const pending = tasks.filter(t => !t.done);
    const text = pending.length ? `You have ${pending.length} pending tasks: ${pending.map(x => x.text).join(", ")}.` : "You have no pending tasks.";
    speak(text); return;
  }
  if (c.includes("class") || c.includes("schedule")) {
    const day = new Date().toLocaleDateString([], { weekday: "long" }), list = schedule[day] || [];
    const text = list.length ? `Today you have: ${list.map(x => x[0] + " " + x[1] + (x[2] ? " with " + x[2] : "")).join(", ")}.` : "You have no classes today.";
    speak(text); return;
  }
  if (c.includes("time") || c.includes("date")) {
    speak(`The time is ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Today is ${new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}.`); return;
  }
  if (c.includes("morning") || c.includes("summary")) {
    morningSummary(); return;
  }
  speak("Sorry, I did not understand. Try asking about your tasks, classes, schedule, date, or time.");
}
updateClock(); renderClasses(); renderTasks(); setInterval(updateClock, 1000);
