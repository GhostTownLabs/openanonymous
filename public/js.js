const ADMIN_KEY = "kingghost";
let adminMode = false;

function showAdminLogin() {
  document.getElementById("admin-login").style.display = "block";
}

function submitAdminCode() {
  const code = document.getElementById("adminCodeInput").value;
  if (code === ADMIN_KEY) {
    adminMode = true;
    alert("Admin mode activated");
    document.getElementById("admin-login").style.display = "none";
    renderAllConfessions(); // Refresh to show delete buttons
  } else {
    alert("Wrong code");
  }
}

function deleteConfession(id) {
  const confessionDiv = document.querySelector(`[data-id='${id}']`);
  if (!confessionDiv) return;

  confessionDiv.classList.add("fade-out");

  setTimeout(() => {
    firebase.firestore().collection("confessions").doc(id).delete()
      .then(() => {
        alert("Deleted successfully");
        renderAllConfessions();
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  }, 500); // delay matches fade-out animation
}

function renderConfession(doc) {
  const container = document.getElementById("confessions");
  const div = document.createElement("div");
  div.className = "confession";
  div.setAttribute("data-id", doc.id); // required for animation

  div.innerHTML = `<p>${doc.data().text}</p>`;

  if (adminMode) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️ Delete";
    delBtn.onclick = () => deleteConfession(doc.id);
    div.appendChild(delBtn);
  }

  container.appendChild(div);
}

  container.appendChild(div);
}

function renderAllConfessions() {
  const container = document.getElementById("confessions");
  container.innerHTML = "";
  firebase.firestore().collection("confessions").get().then(snapshot => {
    snapshot.forEach(doc => {
      renderConfession(doc);
    });
  });
}

// Load confessions on page load
window.onload = renderAllConfessions;
