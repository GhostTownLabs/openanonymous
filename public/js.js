// Firebase config for Open Anonymous
const firebaseConfig = {
  apiKey: "AIzaSyCKNXqPvGpyCVLAUEYspohXU_yFnHqMBKg",
  authDomain: "open-anonymous.firebaseapp.com",
  projectId: "open-anonymous",
  storageBucket: "open-anonymous.appspot.com",
  messagingSenderId: "415868600474",
  appId: "1:415868600474:web:13ac1dead401d92b879f23",
  measurementId: "G-D32ZNKR5SF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
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
document.getElementById("confessionForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const text = document.getElementById("confessionInput").value.trim();
  if (text) {
    firebase.firestore().collection("confessions").add({ text })
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
