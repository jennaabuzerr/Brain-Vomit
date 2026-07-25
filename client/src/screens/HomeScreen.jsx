import { useState, useEffect } from "react";
import "../components/HomeScreen.css";
import categories from '../data/categories';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// ============================================================
// DroppableSection — a section that tasks can be dropped into.
// 'id' is the section name (e.g. "upcoming"), 'children' is
// whatever content sits inside it.
// ============================================================
import { useDroppable } from '@dnd-kit/core';

function DroppableSection({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: '60px',
        outline: isOver ? '2px dashed var(--brain-pink)' : 'none',
        borderRadius: '12px',
        transition: 'outline 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// DraggableCard — wraps a task card so it can be picked up
// and dragged. 'id' is the task id, 'children' is the card UI.
// ============================================================
import { useDraggable } from '@dnd-kit/core';

function DraggableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

function HomeScreen() {
// ============================================================
// Drag and Drop Setup — PointerSensor requires the user to
// move 8px before a drag starts (prevents accidental drags
// when just clicking a button)
// ============================================================
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  })
);

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

  // ============================================================
  // Handle Drag End — fires when a card is dropped into a section.
  // Updates local state immediately, then saves to the server.
  // 'active' = the card that was dragged
  // 'over' = the section it was dropped into
  // ============================================================
  async function handleDragEnd({ active, over }) {
    // If dropped outside any section, do nothing
    if (!over) return;

    const taskId = active.id;
    const newSection = over.id;

    // Update local state so the card moves instantly on screen
    setTasks(tasks.map((t) =>
      t.id === taskId ? { ...t, section: newSection } : t
    ));

    // Save the new section to the database
    await fetch(`http://localhost:3001/api/tasks/${taskId}/section`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: newSection }),
    });
  }

  // ======================================================================================
  // Split Tasks — checks manual section override first, then
  // falls back to deadline calculation
  // =======================================================================================
  const overdue = tasks.filter((task) => {
    if (getCountdown(task.deadline).isOverdue) return true;
    return false;
  });
  const upcoming = tasks.filter((task) => {
    if (getCountdown(task.deadline).isOverdue) return false;
    if (task.section === 'upcoming') return true;
    if (task.section === 'keep-in-mind') return false;
    return getCountdown(task.deadline).days <= 14;
  });

const keepInMind = tasks.filter((task) => {
  if (getCountdown(task.deadline).isOverdue) return false;
  if (task.section === 'keep-in-mind') return true;
  if (task.section === 'upcoming') return false;
  return getCountdown(task.deadline).days > 14;
});

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

    {/* DndContext is the "desk" — everything draggable sits inside it */}
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>

      {overdue.length > 0 && (
        <>
          <h2 className="overdue">Overdue...</h2>
          <DroppableSection id="overdue">
            {sortTasks(overdue).map((task) => (
              <DraggableCard key={task.id} id={task.id}>
                {renderCard(task)}
              </DraggableCard>
            ))}
          </DroppableSection>
          <br />
        </>
      )}

      <h2 className="upcoming">Upcoming...</h2>
      <DroppableSection id="upcoming">
        {sortTasks(upcoming).map((task) => (
          <DraggableCard key={task.id} id={task.id}>
            {renderCard(task)}
          </DraggableCard>
        ))}
        {upcoming.length === 0 && (
          <p className="empty-state">Nothing here — dump a thought!</p>
        )}
      </DroppableSection>
      <br />

      <h2 className="keep-in-mind">Keep in Mind...</h2>
      <DroppableSection id="keep-in-mind">
        {sortTasks(keepInMind).map((task) => (
          <DraggableCard key={task.id} id={task.id}>
            {renderCard(task)}
          </DraggableCard>
        ))}
        {keepInMind.length === 0 && (
          <p className="empty-state">Nothing here — dump a thought!</p>
        )}
      </DroppableSection>

    </DndContext>
  </div>
)};

export default HomeScreen;