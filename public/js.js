const ADMIN_KEY = "kingghost";
let adminMode = false;

// Show admin login field
function showAdminLogin() {
  document.getElementById("admin-login").style.display = "block";
}

// Handle admin login
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

// Delete confession
function deleteConfession(id) {
  const confessionDiv = document.querySelector(`[data-id='${id}']`);
  if (!confessionDiv) return;

  confessionDiv.classList.add("fade-out");

  setTimeout(() => {
    db.collection("confessions").doc(id).delete()
      .then(() => {
        alert("Deleted successfully");
        renderAllConfessions();
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  }, 500);
}

// Render one confession with optional delete + reply
function renderConfession(doc) {
  const container = document.getElementById("confessions");
  const div = document.createElement("div");
  div.className = "confession";
  div.setAttribute("data-id", doc.id);

  // Confession text
  div.innerHTML = `<p>${doc.data().text}</p>`;

  // Replies
  const repliesContainer = document.createElement("div");
  repliesContainer.className = "replies";
  loadReplies(doc.id, repliesContainer);

  // Reply input and button
  const replyInput = document.createElement("input");
  replyInput.type = "text";
  replyInput.placeholder = "Write a reply...";
  replyInput.style.marginTop = "10px";
  replyInput.style.width = "80%";

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.onclick = () => {
    const text = replyInput.value.trim();
    if (text) {
      firebase.firestore()
        .collection("confessions")
        .doc(doc.id)
        .collection("replies")
        .add({ text, timestamp: Date.now() })
        .then(() => {
          replyInput.value = "";
          loadReplies(doc.id, repliesContainer);
        });
    }
  };

  // Append everything
  div.appendChild(replyInput);
  div.appendChild(replyBtn);
  div.appendChild(repliesContainer);

  // Admin delete button
  if (adminMode) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️ Delete";
    delBtn.onclick = () => deleteConfession(doc.id);
    div.appendChild(delBtn);
  }

  container.appendChild(div);
}

// Render all confessions
function renderAllConfessions() {
  const container = document.getElementById("confessions");
  container.innerHTML = "";
  db.collection("confessions").get().then(snapshot => {
    snapshot.forEach(doc => {
      renderConfession(doc);
    });
  });
}

// Load replies for a specific confession
function loadReplies(confessionId, container) {
  container.innerHTML = "";
  firebase.firestore()
    .collection("confessions")
    .doc(confessionId)
    .collection("replies")
    .orderBy("timestamp", "asc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const p = document.createElement("p");
        p.style.fontSize = "14px";
        p.style.color = "#ccc";
        p.textContent = `↳ ${doc.data().text}`;
        container.appendChild(p);
      });
    });
}

// Submit new confession
document.getElementById("confessionForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("confessionInput").value.trim();
  if (text) {
    db.collection("confessions").add({ text })
      .then(() => {
        alert("Confession submitted anonymously.");
        document.getElementById("confessionInput").value = "";
        renderAllConfessions();
      })
      .catch((error) => {
        console.error("Error adding confession: ", error);
        alert("Something went wrong.");
      });
  }
});

// Load everything on page load
window.onload = renderAllConfessions;
