import { useState, useEffect } from "react";
import "../components/HomeScreen.css";
import categories from '../data/categories';
import MiniCalendar from "../components/MiniCalendar";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
// SortableCard — wraps a task card so it can be dragged to
// reorder within a section OR moved to a different section.
// useSortable combines draggable + sortable behavior together.
// ============================================================
function SortableCard({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
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
  // Handle Drag End function - moving task
  // ============================================================
  async function handleDragEnd({ active, over }) {
  if (!over) return;

  const taskId = active.id;
  const overId = over.id;

  // Find which section the dragged task currently lives in
  const activeTask = tasks.find((t) => t.id === taskId);
  const activeSection = getTaskSection(activeTask);

  // Check if 'over' is a section id or a task id
  const overIsSection = ['overdue', 'upcoming', 'keep-in-mind'].includes(overId);
  const overTask = overIsSection ? null : tasks.find((t) => t.id === overId);
  const overSection = overIsSection ? overId : getTaskSection(overTask);

  if (activeSection === overSection) {
    // Same section — reorder within section
    if (!overIsSection && taskId !== overId) {
      const sectionTasks = tasks.filter((t) => getTaskSection(t) === activeSection);
      const oldIndex = sectionTasks.findIndex((t) => t.id === taskId);
      const newIndex = sectionTasks.findIndex((t) => t.id === overId);
      const reordered = arrayMove(sectionTasks, oldIndex, newIndex);

      // Rebuild full task list with new order for this section
      const otherTasks = tasks.filter((t) => getTaskSection(t) !== activeSection);
      setTasks([...otherTasks, ...reordered]);
    }
  } else {
    // Different section — move between sections
    setTasks(tasks.map((t) =>
      t.id === taskId ? { ...t, section: overSection } : t
    ));

    await fetch(`http://localhost:3001/api/tasks/${taskId}/section`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: overSection }),
    });
  }
}

// ============================================================
// getTaskSection — returns which section a task belongs to,
// respecting manual overrides from drag-and-drop
// ============================================================
function getTaskSection(task) {
  if (!task) return null;
  if (getCountdown(task.deadline).isOverdue) return 'overdue';
  if (task.section === 'upcoming') return 'upcoming';
  if (task.section === 'keep-in-mind') return 'keep-in-mind';
  return getCountdown(task.deadline).days <= 14 ? 'upcoming' : 'keep-in-mind';
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
      <div className="home-layout">
        {/* Sidebar with calendar */}
        <div className="home-sidebar">
          <MiniCalendar tasks={tasks} />
        </div>
        {/* Main content */}
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
    <DndContext
  sensors={sensors}
  onDragEnd={handleDragEnd}
  collisionDetection={closestCorners}
>
  {overdue.length > 0 && (
    <>
      <h2 className="overdue">Overdue...</h2>
      <DroppableSection id="overdue">
        <SortableContext
          items={sortTasks(overdue).map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortTasks(overdue).map((task) => (
            <SortableCard key={task.id} id={task.id}>
              {renderCard(task)}
            </SortableCard>
          ))}
        </SortableContext>
      </DroppableSection>
      <br />
    </>
  )}

  <h2 className="upcoming">Upcoming...</h2>
  <DroppableSection id="upcoming">
    <SortableContext
      items={sortTasks(upcoming).map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {sortTasks(upcoming).map((task) => (
        <SortableCard key={task.id} id={task.id}>
          {renderCard(task)}
        </SortableCard>
      ))}
      {upcoming.length === 0 && (
        <p className="empty-state">Nothing here — dump a thought!</p>
      )}
    </SortableContext>
  </DroppableSection>
  <br />

  <h2 className="keep-in-mind">Keep in Mind...</h2>
  <DroppableSection id="keep-in-mind">
    <SortableContext
      items={sortTasks(keepInMind).map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {sortTasks(keepInMind).map((task) => (
        <SortableCard key={task.id} id={task.id}>
          {renderCard(task)}
        </SortableCard>
      ))}
      {keepInMind.length === 0 && (
        <p className="empty-state">Nothing here — dump a thought!</p>
      )}
    </SortableContext>
  </DroppableSection>
  </DndContext>
  </div>
  </div>
  );
}

export default HomeScreen;