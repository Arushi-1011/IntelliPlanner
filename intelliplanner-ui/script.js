const subjects = [];

const subjectList = document.getElementById("subjectList");
const planOutput = document.getElementById("planOutput");

document.getElementById("addSubject").addEventListener("click", () => {
    const name = document.getElementById("subjectName").value;
    const totalHours = parseInt(document.getElementById("totalHours").value);
    const priority = parseInt(document.getElementById("priority").value);

    if (!name || !totalHours || !priority) return;

    subjects.push({ name, totalHours, priority });

    const li = document.createElement("li");
    li.textContent = `${name} — ${totalHours} hrs (priority ${priority})`;
    subjectList.appendChild(li);

    // clear inputs
    document.getElementById("subjectName").value = "";
    document.getElementById("totalHours").value = "";
    document.getElementById("priority").value = "";
});

document.getElementById("generatePlan").addEventListener("click", async () => {
    const targetDate = document.getElementById("targetDate").value;

    if (!targetDate) {
        planOutput.innerHTML = "pick a date first 🌷";
        return;
    }

    if (subjects.length === 0) {
        planOutput.innerHTML = "add at least one subject 🤍";
        return;
    }

    planOutput.innerHTML = `
    <div class="loading">
        planning gently… 🌱<br>
        <small>no rushing here</small>
    </div>
`;


    const response = await fetch("http://localhost:8081/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate, subjects })
    });

    const data = await response.json();

    renderPlan(data.plan ?? data.value);
});

function renderPlan(plan) {
    planOutput.innerHTML = "";

    const intro = document.createElement("p");
    intro.style.color = "#666";
    intro.style.marginBottom = "12px";
    intro.textContent = "here’s a plan that won’t overwhelm you 🤍";
    planOutput.appendChild(intro);

    plan.forEach(day => {
        const div = document.createElement("div");
        div.className = "day-card";

        let html = `<strong>day ${day.dayNumber} 🌱</strong><ul>`;
        for (const task in day.tasks) {
            html += `<li>${task} — ${day.tasks[task]} hrs</li>`;
        }
        html += "</ul>";

        div.innerHTML = html;
        planOutput.appendChild(div);
    });
}
