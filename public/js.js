window.onload = function () {

  const ADMIN_KEY = "kingghost";
  let adminMode = false;
  let currentTheme = "dark";

  // --- ADMIN FUNCTIONS ---
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

  function deleteConfession(id) {
    const confessionDiv = document.querySelector(`[data-id='${id}']`);
    if (!confessionDiv) return;
    confessionDiv.classList.add("fade-out");
    setTimeout(() => {
      db.collection("confessions").doc(id).delete().then(() => {
        alert("Deleted");
        renderAllConfessions();
      });
    }, 500);
  }

  // --- USER REPORT ---
  function reportConfession(id) {
    db.collection("confessions").doc(id).update({ reported: true }).then(() => {
      alert("Confession reported");
    });
  }

  // --- RENDER ---
  function renderConfession(doc) {
    const container = document.getElementById("confessions");
    const div = document.createElement("div");
    div.className = "confession";
    div.setAttribute("data-id", doc.id);

    // Text + category
    const category = doc.data().category || "general";
    div.innerHTML = `<p><b>[${category}]</b> ${doc.data().text}</p>`;

    // Reply system
    const replyInput = document.createElement("input");
    replyInput.placeholder = "Reply...";
    const replyBtn = document.createElement("button");
    replyBtn.textContent = "Reply";
    const repliesContainer = document.createElement("div");

    replyBtn.onclick = () => {
      const text = replyInput.value.trim();
      if (text) {
        db.collection("confessions").doc(doc.id).collection("replies").add({ text, timestamp: Date.now() }).then(() => {
          replyInput.value = "";
          loadReplies(doc.id, repliesContainer);
        });
      }
    };

    div.appendChild(replyInput);
    div.appendChild(replyBtn);
    div.appendChild(repliesContainer);
    loadReplies(doc.id, repliesContainer);

    // Like system
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `❤️ ${doc.data().likes || 0}`;
    likeBtn.onclick = () => {
      db.collection("confessions").doc(doc.id).update({
        likes: firebase.firestore.FieldValue.increment(1)
      }).then(renderAllConfessions);
    };
    div.appendChild(likeBtn);

    if (adminMode) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️ Delete";
      delBtn.onclick = () => deleteConfession(doc.id);
      div.appendChild(delBtn);
    } else {
      const reportBtn = document.createElement("button");
      reportBtn.textContent = "🚩 Report";
      reportBtn.onclick = () => reportConfession(doc.id);
      div.appendChild(reportBtn);
    }

    container.appendChild(div);
  }

  function renderAllConfessions() {
    const container = document.getElementById("confessions");
    container.innerHTML = "";
    let query = db.collection("confessions").orderBy("timestamp", "desc");
    if (!adminMode) query = query.where("reported", "==", false);
    query.get().then(snapshot => {
      snapshot.forEach(doc => renderConfession(doc));
    });
  }

  function loadReplies(confessionId, container) {
    container.innerHTML = "";
    db.collection("confessions").doc(confessionId).collection("replies").orderBy("timestamp").get().then(snapshot => {
      snapshot.forEach(doc => {
        const p = document.createElement("p");
        p.textContent = `↳ ${doc.data().text}`;
        p.style.fontSize = "14px";
        p.style.color = "#ccc";
        container.appendChild(p);
      });
    });
  }

  // --- TOGGLE THEME ---
  function toggleTheme() {
    const body = document.body;
    if (currentTheme === "dark") {
      body.style.background = "#fff";
      body.style.color = "#000";
      currentTheme = "light";
    } else {
      body.style.background = "#111";
      body.style.color = "#f0f0f0";
      currentTheme = "dark";
    }
  }

  // --- AUTORELOAD ---
  setInterval(renderAllConfessions, 10000);

  // --- SUBMIT FORM ---
  document.getElementById("confessionForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const text = document.getElementById("confessionInput").value.trim();
    const category = document.getElementById("confessionCategory").value || "general";
    if (text) {
      db.collection("confessions").add({ text, category, likes: 0, reported: false, timestamp: Date.now() }).then(() => {
        alert("Confession submitted");
        document.getElementById("confessionInput").value = "";
        renderAllConfessions();
      });
    }
  });

  // --- INITIAL LOAD ---
  renderAllConfessions();

}; // END window.onload
