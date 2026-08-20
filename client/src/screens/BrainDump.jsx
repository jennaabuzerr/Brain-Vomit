import { useState, useEffect, useRef } from "react";
import BrainIcon from "../components/BrainIcon";
import "../components/BrainDump.css";
import ThoughtBubble from "../components/ThoughtBubble";
import Legend from "../components/Legend";
import categories from "../data/categories";

function BrainDump() {
  // ============================================================
  // State — data this component tracks and re-renders on
  // ============================================================
  const [tasks, setTasks] = useState([]);
  const [showList, setShowList] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    priority: "",
    deadline: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [scatterPositions, setScatterPositions] = useState({});

  // ============================================================
  // Brain Theme — color presets for the brain, saved to
  // localStorage so the choice persists between sessions
  // ============================================================
  const [brainTheme, setBrainTheme] = useState(() => {
    const saved = localStorage.getItem("brainTheme");
    return saved
      ? JSON.parse(saved)
      : { name: "Pink", stroke: "#ff6090", fill: "#ffe0ec" };
  });

  const brainThemes = [
    { name: "Pink", stroke: "#ff6090", fill: "#ffe0ec" },
    { name: "Blue", stroke: "#71c6ed", fill: "#dff0fa" },
    { name: "Green", stroke: "#3fa34d", fill: "#d4f5dc" },
    { name: "Purple", stroke: "#9b59b6", fill: "#ead5f7" },
    { name: "Orange", stroke: "#e8890c", fill: "#fde8c8" },
    { name: "Black", stroke: "#222222", fill: "#eeeeee" },
    { name: "Red", stroke: "#c33b3bff", fill: "#f8bebeff" },
    { name: "Yellow", stroke: "#e1bc04ff", fill: "#f5f5b8ff" },
    { name: "White", stroke: "#b3b0b0ff", fill: "#ffffff" },
  ];

  function handleThemeChange(theme) {
    setBrainTheme(theme);
    localStorage.setItem("brainTheme", JSON.stringify(theme));
  }

  // ============================================================
  // Fetch Tasks — loads all saved tasks from the server on mount
  // ============================================================
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch("https://brain-vomit-production.up.railway.app/api/tasks");
      const data = await response.json();
      setTasks(data);
      // Generate a scatter position for each task
      const positions = {};
      data.forEach((task, index) => {
        positions[task.id] = generateScatterPosition(index, data.length);
      });
      setScatterPositions(positions);
    }
    fetchTasks();
  }, []);

  // ============================================================
  // Auto-Grow Textarea — expands the thought bubble as you type,
  // capped at 90px with internal scroll past that
  // ============================================================
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 90);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [rawText]);

  // ============================================================
  // Send to Brain — categorizes and saves a new task via AI
  // ============================================================
  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("https://brain-vomit-production.up.railway.app/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });

      const data = await response.json();
      const refreshed = await fetch("https://brain-vomit-production.up.railway.app/api/tasks");
      const updatedTasks = await refreshed.json();
      setTasks(updatedTasks);
      const newPositions = {};
      updatedTasks.forEach((task, index) => {
        newPositions[task.id] =
          scatterPositions[task.id] ||
          generateScatterPosition(index, updatedTasks.length);
      });
      setScatterPositions(newPositions);
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 400);
      setRawText("");
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================
  // Delete One Task — removes a single task by id
  // ============================================================
  async function handleDelete(id) {
    setError(null);
    try {
      const response = await fetch(`https://brain-vomit-production.up.railway.app/api/tasks/${id}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // ============================================================
  // Clear Brain — deletes every task at once
  // ============================================================
  async function handleClearBrain() {
    setError(null);
    try {
      await Promise.all(
        tasks.map((task) =>
          fetch(`https://brain-vomit-production.up.railway.app/api/tasks/${task.id}`, {
            method: "DELETE",
          }),
        ),
      );
      setTasks([]);
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // ============================================================
  // Start Editing — opens the edit form pre-filled with a task's
  // current values
  // ============================================================
  function handleEditClick(task) {
    setEditingId(task.id);
    setEditForm({
      name: task.name,
      category: task.category,
      priority: task.priority,
      deadline: task.deadline,
    });
  }

  // ============================================================
  // Save Edit — sends updated task fields to the server, then
  // reflects the change in local state
  // ============================================================
  async function handleSaveEdit(id) {
    setError(null);
    try {
      const currentTask = tasks.find((t) => t.id === id);
      await fetch(`https://brain-vomit-production.up.railway.app/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, section: currentTask?.section }),
      });
      setTasks(tasks.map((t) => (t.id === id ? { ...editForm, id: t.id, section: t.section } : t)));
      setEditingId(null);
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // ============================================================
  // Helpers — brain size scales with task count; priority maps
  // to a font size
  // ============================================================
  const brainSize = Math.min(340 + tasks.length * 20, 600);

  function getPrioritySize(priority) {
    if (priority === "High") {
      return "1.3rem";
    } else if (priority === "Medium") {
      return "1rem";
    } else {
      return "0.85rem";
    }
  }

  function generateScatterPosition(index, total) {
    const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
    const radius = 120 + Math.random() * 40;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
  return { x, y };
  }
  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="brain-dump-page">
      <Legend />
      <div className="legend-actions">
        <button onClick={() => setShowList(!showList)}>
          {showList ? "Hide List" : "Show List"}
        </button>
        <button onClick={handleClearBrain}>Clear Brain</button>
        <div className="theme-picker">
          {brainThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme)}
              title={theme.name}
              style={{
                background: theme.fill,
                border: `3px solid ${theme.stroke}`,
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                padding: 0,
                boxShadow:
                  brainTheme.name === theme.name
                    ? `0 0 0 3px ${theme.stroke}`
                    : "1px 2px 0 #aaa",
              }}
            />
          ))}
        </div>
      </div>
      <div className="brain-scene">
        <p className="brain-label">My Brain</p>
        {showList ? (
          <div
            className="brain-scatter"
            style={{ width: brainSize, height: brainSize }}
          >
            {/* Brain stays visible underneath as the center */}
            <div
              className={`${isPulsing ? "brain-pulse" : ""} brain-fade`}
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <BrainIcon
                width={brainSize}
                color={brainTheme.stroke}
                fill={brainTheme.fill}
              />
            </div>
            {/* Tasks scatter around the brain */}
            {tasks.map((task) => {
              const pos = scatterPositions[task.id] || { x: 0, y: 0 };
              const categoryMatch = categories.find(
                (cat) => cat.name === task.category,
              );
              return (
                <div
                  key={task.id}
                  className="scatter-tag"
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${pos.x}px)`,
                    top: `calc(50% + ${pos.y}px)`,
                    color: categoryMatch?.color || "var(--brain-pink)",
                    fontSize: getPrioritySize(task.priority),
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() => setSelectedId(task.id)}
                >
                  {task.name}
                  {selectedId === task.id && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                      >
                        ✕
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(task);
                        }}
                      >
                        ✎
                      </button>
                    </>
                  )}
                  {editingId === task.id && (
                    <div className="edit-form">
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm({ ...editForm, priority: e.target.value })
                        }
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <input
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) =>
                          setEditForm({ ...editForm, deadline: e.target.value })
                        }
                      />
                      <button onClick={() => handleSaveEdit(task.id)}>
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
            {tasks.length === 0 && (
              <p
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                Your brain is empty!
              </p>
            )}
          </div>
        ) : (
          <div
            className={isPulsing ? "brain-pulse" : ""}
            style={{ display: "inline-block" }}
          >
            <BrainIcon
              width={brainSize}
              color={brainTheme.stroke}
              fill={brainTheme.fill}
            />
          </div>
        )}
        <div
          className="bubble-container"
          style={{ top: 15, left: brainSize + 50 }}
        >
          <ThoughtBubble />
          <textarea
            className="thought-bubble"
            placeholder="Type Here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            ref={textareaRef}
          />
          <button
            className="send-to-brain-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Thinking..." : "Send to Brain"}
          </button>
        </div>

        <br />
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

export default BrainDump;
