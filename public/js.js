// === CONFIGURATION ===
const ADMIN_KEY = "kingghost";
let adminMode = false;
let theme = "dark";

// === ADMIN FUNCTIONS ===
function showAdminLogin() {
  document.getElementById("admin-login").style.display = "block";
}
function submitAdminCode() {
  const code = document.getElementById("adminCodeInput").value;
  if (code === ADMIN_KEY) {
    adminMode = true;
    alert("Admin mode activated");
    document.getElementById("admin-login").style.display = "none";
    renderAllConfessions();
  } else {
    alert("Wrong code");
  }
}

// === DELETE & REPORT ===
function deleteConfession(id) {
  const confessionDiv = document.querySelector(`[data-id='${id}']`);
  if (!confessionDiv) return;
  confessionDiv.classList.add("fade-out");
  setTimeout(() => {
    db.collection("confessions").doc(id).delete()
      .then(() => renderAllConfessions())
      .catch(err => console.error("Delete error:", err));
  }, 500);
}
function reportConfession(id) {
  db.collection("confessions").doc(id).update({ reported: true })
    .then(() => alert("Reported successfully"))
    .catch(err => alert("Report error"));
}

// === REPLIES ===
function loadReplies(confessionId, container) {
  container.innerHTML = "";
  db.collection("confessions").doc(confessionId)
    .collection("replies").orderBy("timestamp", "asc").get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const p = document.createElement("p");
        p.className = "reply";
        p.textContent = "â†³ " + doc.data().text;
        container.appendChild(p);
      });
    });
}

// === LIKE / UPVOTE ===
function likeConfession(id) {
  const ref = db.collection("confessions").doc(id);
  ref.update({ likes: firebase.firestore.FieldValue.increment(1) })
    .then(renderAllConfessions);
}

// === RENDER CONFESSIONS ===
function renderConfession(doc) {
  const container = document.getElementById("confessions");
  const div = document.createElement("div");
  div.className = "confession";
  div.setAttribute("data-id", doc.id);
  const data = doc.data();

  div.innerHTML = `<p>${data.text}</p>`;

  const likeBtn = document.createElement("button");
  likeBtn.textContent = `â¤ï¸ ${data.likes || 0}`;
  likeBtn.onclick = () => likeConfession(doc.id);
  div.appendChild(likeBtn);

  if (!adminMode) {
    const reportBtn = document.createElement("button");
    reportBtn.textContent = "ðŸš© Report";
    reportBtn.onclick = () => reportConfession(doc.id);
    div.appendChild(reportBtn);
  } else {
    const delBtn = document.createElement("button");
    delBtn.textContent = "ðŸ—‘ï¸ Delete";
    delBtn.onclick = () => deleteConfession(doc.id);
    div.appendChild(delBtn);
  }

  const replyInput = document.createElement("input");
  replyInput.placeholder = "Write a reply...";
  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  const replies = document.createElement("div");
  replies.className = "replies";

  replyBtn.onclick = () => {
    const text = replyInput.value.trim();
    if (text) {
      db.collection("confessions").doc(doc.id).collection("replies")
        .add({ text, timestamp: Date.now() })
        .then(() => {
          replyInput.value = "";
          loadReplies(doc.id, replies);
        });
    }
  };

  div.appendChild(replyInput);
  div.appendChild(replyBtn);
  div.appendChild(replies);
  loadReplies(doc.id, replies);

  container.appendChild(div);
}

// === RENDER ALL ===
function renderAllConfessions() {
  const container = document.getElementById("confessions");
  container.innerHTML = "";
  let query = db.collection("confessions");
  if (!adminMode) query = query.where("reported", "==", false);
  query.orderBy("likes", "desc").get().then(snapshot => {
    snapshot.forEach(doc => renderConfession(doc));
  });
}

// === AUTO REFRESH ===
setInterval(renderAllConfessions, 15000);

// === SUBMIT NEW ===
document.getElementById("confessionForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = document.getElementById("confessionInput").value.trim();
  if (text) {
    db.collection("confessions").add({ text, likes: 0, reported: false })
      .then(() => {
        document.getElementById("confessionInput").value = "";
        renderAllConfessions();
      })
      .catch(err => alert("Submit error"));
  }
});

// === THEME TOGGLE ===
document.getElementById("toggle-theme").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  document.body.className = theme;
});

// === INIT ===
window.onload = renderAllConfessions;
