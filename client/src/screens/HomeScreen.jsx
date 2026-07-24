import { useState, useEffect } from "react";
import "../components/HomeScreen.css";

function HomeScreen() {
  // ============================================================
  // State — the full task list, loaded from the server
  // ============================================================
  const [tasks, setTasks] = useState([]);

  // ============================================================
  // Fetch Tasks — loads all saved tasks on mount
  // ============================================================
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch("http://localhost:3001/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
    fetchTasks();
  }, []);

  // ============================================================
  // Countdown Helpers — turn a deadline into days/hours/minutes,
  // then into readable text
  // ============================================================
  function getCountdown(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diffMs = due - today;
    const isOverdue = diffMs < 0;
    const absDiff = isOverdue ? Math.abs(diffMs) : diffMs;
    const hours = Math.floor((absDiff % 86400000) / 3600000);
    const minutes = Math.floor((absDiff % 3600000) / 60000);
    return { days: Math.ceil(absDiff / 86400000), hours, minutes, isOverdue };
  }

  function formatTimeLeft(countdown) {
    const { days, hours, minutes, isOverdue } = countdown;
    if (countdown.days === 1) {
      return `1 day : ${String(countdown.hours).padStart(2, "0")} hours : ${String(countdown.minutes).padStart(2, "0")} minutes`;
    } else if (countdown.isOverdue) {
      return `Overdue by ${Math.abs(countdown.days)} day(s) : ${String(countdown.hours).padStart(2, "0")} hours : ${String(countdown.minutes).padStart(2, "0")} minutes`;
    }
    return `${countdown.days} days : ${String(countdown.hours).padStart(2, "0")} hours : ${String(countdown.minutes).padStart(2, "0")} minutes`;
  }

  // ============================================================
  // Delete Task — removes one task by id
  // ============================================================
  async function handleDelete(id) {
    await fetch(`http://localhost:3001/api/tasks/${id}`, {
      method: "DELETE",
    });
    setTasks(tasks.filter((task) => task.id !== id));
  }

  // ============================================================
  // Split Tasks — Upcoming (\u226414 days out) vs Keep in Mind (>14)
  // ============================================================
  const upcoming = tasks.filter(
    (task) => getCountdown(task.deadline).days <= 14,
  );
  const keepInMind = tasks.filter(
    (task) => getCountdown(task.deadline).days > 14,
  );

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="home-page">
      <h1 className="welcome">Welcome To My Brain Vomit!</h1>
      <br />
      <h2 className="upcoming">Upcoming...</h2>
      {upcoming.map((task) => (
        <div key={task.id} className="task-card">
          <div className="task-info">
            <span>
              {task.name} — {task.category}
            </span>
            <span className="task-countdown">
              {formatTimeLeft(getCountdown(task.deadline))}
            </span>
          </div>
          <button onClick={() => handleDelete(task.id)}>Declutter brain</button>
        </div>
      ))}
      <br />
      <h2 className="keep-in-mind">Keep in Mind...</h2>
      {keepInMind.map((task) => (
        <div key={task.id} className="task-card">
          <div className="task-info">
            <span>
              {task.name} — {task.category}
            </span>
            <span className="task-countdown">
              {formatTimeLeft(getCountdown(task.deadline))}
            </span>
          </div>
          <button onClick={() => handleDelete(task.id)}>Declutter brain</button>
        </div>
      ))}
    </div>
  );
}

export default HomeScreen;