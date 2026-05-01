// FETCH YOUR GITHUB PROJECTS

const username = "sanju-zxt";

fetch(`https://api.github.com/users/${username}/repos`)
.then(res => res.json())
.then(data => {

  const container = document.getElementById("projects-container");

  data.slice(0,3).forEach(repo => {
    const div = document.createElement("div");

    div.className = "project";

    div.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description"}</p>
      <a href="${repo.html_url}" target="_blank">View →</a>
    `;

    container.appendChild(div);
  });

});
