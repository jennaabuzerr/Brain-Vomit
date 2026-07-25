import { useState, useEffect } from "react";
import "../components/HomeScreen.css";
import categories from '../data/categories';

function HomeScreen() {
  // ============================================================
  // State — the full task list, loaded from the server
  // ============================================================
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState("none");


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
    let due = new Date(deadline);

    // If the deadline has no time component, treat it as end-of-day
    if (!deadline.includes("T")) {
      due = new Date(`${deadline}T23:59:59`);
    }
    
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

  // ================================================================
  // Priority Function — The higher the priority the larger the size
  // ================================================================

  function getPrioritySize(priority) {
    if (priority === "High") return "1.15rem";
    if (priority === "Medium") return "1rem";
    return "0.9rem";
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

  // ======================================================================================
  // Split Tasks — Upcoming (\u226414 days out) vs Keep in Mind (>14) vs Overdue (<0 days)
  // =======================================================================================
  const overdue = tasks.filter((task) => getCountdown(task.deadline).isOverdue);
  const upcoming = tasks.filter(
    (task) => !getCountdown(task.deadline).isOverdue && getCountdown(task.deadline).days <= 14,
  );
  const keepInMind = tasks.filter(
    (task) => !getCountdown(task.deadline).isOverdue && getCountdown(task.deadline).days > 14,
  );

  // ============================================================
  // Function Render - JSX Cards are all repeated
  // ============================================================
  function renderCard(task) {
      const categoryMatch = categories.find((cat) => cat.name === task.category);
      return (
        <div
          key={task.id}
          className="task-card"
          style={{ borderLeftColor: categoryMatch?.color, borderLeftWidth: '6px' }}
        >
          <div className="task-info">
            <span style={{ fontSize: getPrioritySize(task.priority) }}>
              {task.name} — {task.category}
            </span>
            <span className="task-countdown">{formatTimeLeft(getCountdown(task.deadline))}</span>
          </div>
          <button onClick={() => handleDelete(task.id)}>Declutter brain</button>
        </div>
      );
    }

    //============================================================
    // A sort function that runs on filtered arrays
    //============================================================
    function sortTasks(taskList) {
      if (sortBy === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return [...taskList].sort((a, b) => order[a.priority] - order[b.priority]);
      }
      if (sortBy === "category") {
        return [...taskList].sort((a, b) => a.category.localeCompare(b.category));
      }
      return taskList;
    }

    return (
      <div className="home-page">
        <h1 className="welcome">Welcome To My Brain Vomit!</h1>
        <br />

        <div className="sort-controls">
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="none">Default</option>
            <option value="priority">Priority</option>
            <option value="category">Category</option>
          </select>
        </div>

        {overdue.length > 0 && (
          <>
            <h2 className="overdue">Overdue...</h2>
            {sortTasks(overdue).map(renderCard)}
            <br />
          </>
        )}

        <h2 className="upcoming">Upcoming...</h2>
        {sortTasks(upcoming).map(renderCard)}
        {upcoming.length === 0 && <p className="empty-state">Nothing here — dump a thought!</p>}
        <br />

        <h2 className="keep-in-mind">Keep in Mind...</h2>
        {sortTasks(keepInMind).map(renderCard)}
        {keepInMind.length === 0 && <p className="empty-state">Nothing here — dump a thought!</p>}

        </div>
    );
  }

export default HomeScreen;