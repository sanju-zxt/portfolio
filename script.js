// ===== SAFE INIT =====
document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     1. TYPING ANIMATION (SAFE)
  =============================== */
  const roles = ["Full Stack Developer", "AI Developer", "Data Engineer"];
  let i = 0, j = 0, current = "", deleting = false;

  const typedEl = document.getElementById("typed");

  function type() {
    if (!typedEl) return;

    if (i < roles.length) {

      if (!deleting && j <= roles[i].length) {
        current = roles[i].substring(0, j++);
      } else if (deleting && j >= 0) {
        current = roles[i].substring(0, j--);
      }

      typedEl.innerHTML = current;

      if (j === roles[i].length) {
        deleting = true;
        setTimeout(type, 1000);
        return;
      }

      if (j === 0) {
        deleting = false;
        i++;
      }

    } else {
      i = 0;
    }

    setTimeout(type, deleting ? 50 : 100);
  }

  type();


  /* ===============================
     2. PROJECTS (API + FALLBACK)
  =============================== */
  const container = document.getElementById("projects-container");

  const fallbackProjects = [
    {
      name: "Smart Dashboard",
      desc: "Student monitoring system",
      link: "https://github.com/sanju-zxt/smart-dashboard"
    },
    {
      name: "FraudShield AI",
      desc: "AI fraud detection",
      link: "https://github.com/sanju-zxt/FraudShieldAI"
    },
    {
      name: "Vision Bridge",
      desc: "Innovation platform",
      link: "https://github.com/sanju-zxt/vision-bridge"
    }
  ];

  function renderProjects(projects) {
    if (!container) return;

    container.innerHTML = "";

    projects.forEach(p => {
      const div = document.createElement("div");
      div.className = "project";

      div.innerHTML = `
        <h3>${p.name}</h3>
        <p>${p.description || p.desc || "Project"}</p>
        <a href="${p.html_url || p.link}" target="_blank">View →</a>
      `;

      container.appendChild(div);
    });
  }

  // FETCH GITHUB (SAFE)
  fetch("https://api.github.com/users/sanju-zxt/repos")
    .then(res => {
      if (!res.ok) throw new Error("API error");
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No repos");
      }

      renderProjects(data.slice(0, 3));
    })
    .catch(err => {
      console.warn("GitHub fetch failed → using fallback", err);
      renderProjects(fallbackProjects);
    });


  /* ===============================
     3. SCROLL REVEAL (SAFE)
  =============================== */
  const sections = document.querySelectorAll(".section");

  function revealOnScroll() {
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;

      if (top < window.innerHeight - 100) {
        sec.style.opacity = 1;
        sec.style.transform = "translateY(0)";
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();

});
