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
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    priority: "",
    deadline: "",
  });

  // ============================================================
  // Fetch Tasks — loads all saved tasks from the server on mount
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
    try {
      const response = await fetch("http://localhost:3001/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });

      const data = await response.json();
      setResult(data);
      setRawText("");
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // ============================================================
  // Delete One Task — removes a single task by id
  // ============================================================
  async function handleDelete(id) {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
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
          fetch(`http://localhost:3001/api/tasks/${task.id}`, {
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
      await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setTasks(tasks.map((t) => (t.id === id ? { ...editForm, id: t.id } : t)));
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
      </div>
      <div className="brain-scene">
        {showList ? (
          <div className="brain-list-overlay" style={{ width: brainSize }}>
            {tasks.map((task) => {
              const categoryMatch = categories.find(
                (cat) => cat.name === task.category,
              );
              return (
                <div
                  key={task.id}
                  className="brain-task-item"
                  style={{
                    color: categoryMatch?.color,
                    fontSize: getPrioritySize(task.priority),
                  }}
                  onClick={() => setSelectedId(task.id)}
                >
                  {task.name}
                  {selectedId === task.id && (
                    <>
                      <button onClick={() => handleDelete(task.id)}>
                        Declutter
                      </button>
                      <button onClick={() => handleEditClick(task)}>
                        Edit
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
          </div>
        ) : (
          <BrainIcon width={brainSize} />
        )}
        <p className="brain-label">My Brain</p>

        <div
          className="bubble-container"
          style={{ top: -40, left: brainSize + 110 }}
        >
          <ThoughtBubble />
          <textarea
            className="thought-bubble"
            placeholder="Type Here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            ref={textareaRef}
          />
          <button className="send-to-brain-btn" onClick={handleSubmit}>
            Send to Brain
          </button>
        </div>

        <br />
        {error && <p>{error}</p>}
        <br />
        {result && (
          <div>
            <p>{result.name}</p>
            <p>
              {result.category} — {result.priority}
            </p>
            <p>{result.deadline}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrainDump;