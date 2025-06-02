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

// 🚩 Report confession
function reportConfession(id) {
  firebase.firestore().collection("confessions").doc(id).update({
    reported: true
  }).then(() => {
    alert("Thank you. This confession has been reported.");
  }).catch(error => {
    console.error("Error reporting confession:", error);
    alert("Something went wrong.");
  });
}

// Render one confession
function renderConfession(doc) {
  const container = document.getElementById("confessions");
  const div = document.createElement("div");
  div.className = "confession";
  div.setAttribute("data-id", doc.id);

  div.innerHTML = `<p>${doc.data().text}</p>`;

  // 🚩 Add report button for users
  if (!adminMode) {
    const reportBtn = document.createElement("button");
    reportBtn.textContent = "🚩 Report";
    reportBtn.onclick = () => reportConfession(doc.id);
    div.appendChild(reportBtn);
  }

  // 🗨️ Replies
  const repliesContainer = document.createElement("div");
  repliesContainer.className = "replies";
  loadReplies(doc.id, repliesContainer);

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

  div.appendChild(replyInput);
  div.appendChild(replyBtn);
  div.appendChild(repliesContainer);

  // 🗑️ Delete for admin
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

  let query = db.collection("confessions");
  if (!adminMode) {
    query = query.where("reported", "==", false);
  }

  query.get().then(snapshot => {
    snapshot.forEach(doc => {
      renderConfession(doc);
    });
  });
}

// Load replies for a confession
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

// Handle new confession submission
document.getElementById("confessionForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("confessionInput").value.trim();
  if (text) {
    db.collection("confessions").add({ text, reported: false })
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
