
// ===== PROJECTS (ROBUST FINAL) =====
const container = document.getElementById("projects-container");

const manualProjects = [
  {
    name: "Smart Dashboard",
    desc: "Real-time student monitoring system",
    link: "https://github.com/sanju-zxt/smart-dashboard"
  },
  {
    name: "FraudShield AI",
    desc: "AI-based fraud detection system",
    link: "https://github.com/sanju-zxt/FraudShieldAI"
  },
  {
    name: "Vision Bridge",
    desc: "Innovation platform for real-world solutions",
    link: "https://github.com/sanju-zxt/vision-bridge"
  }
];

function renderProjects(projects) {
  if (!container) return;

  container.innerHTML = "";

  projects.forEach(p => {
    const card = document.createElement("div");
    card.className = "project";

    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.desc || p.description || "Project"}</p>
      <a href="${p.link || p.html_url}" target="_blank">View Project →</a>
    `;

    container.appendChild(card);
  });
}

// Try GitHub API first
fetch("https://api.github.com/users/sanju-zxt/repos")
  .then(res => res.json())
  .then(data => {

    const filtered = data
      .filter(repo => !repo.fork)
      .slice(0, 3);

    if (filtered.length === 0) throw "No repos";

    renderProjects(filtered);

  })
  .catch(() => {
    // fallback always works
    renderProjects(manualProjects);
  });
