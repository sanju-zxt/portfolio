// ===== GITHUB PROJECTS FIX (WITH FALLBACK) =====

const username = "sanju-zxt"; // your GitHub username
const container = document.getElementById("projects-container");

// fallback projects (in case API fails)
const fallbackProjects = [
  {
    name: "Smart Student Monitoring",
    desc: "Real-time dashboard system",
    link: "#"
  },
  {
    name: "FraudShield AI",
    desc: "AI fraud detection system",
    link: "#"
  },
  {
    name: "Vision Bridge",
    desc: "Innovation platform",
    link: "#"
  }
];

function renderProjects(projects) {
  container.innerHTML = "";

  projects.forEach(repo => {
    const div = document.createElement("div");
    div.className = "project";

    div.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description || repo.desc}</p>
      <a href="${repo.html_url || repo.link}" target="_blank">View →</a>
    `;

    container.appendChild(div);
  });
}

// fetch GitHub repos
fetch(`https://api.github.com/users/${username}/repos`)
  .then(res => {
    if (!res.ok) throw new Error("API failed");
    return res.json();
  })
  .then(data => {
    if (data.length === 0) throw new Error("No repos");
    renderProjects(data.slice(0, 3));
  })
  .catch(() => {
    // fallback if API fails
    renderProjects(fallbackProjects);
  });
