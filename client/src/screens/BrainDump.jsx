import { useState, useEffect } from 'react';
import BrainIcon from '../components/BrainIcon';
import '../components/BrainDump.css';
import ThoughtBubble from '../components/ThoughtBubble';
import Legend from '../components/Legend';
import categories from '../data/categories';

function BrainDump() {
  // State to hold the list of tasks
  const [tasks, setTasks] = useState([]);

  // State to control whether to show the list of tasks in brain or not
  const [showList, setShowList] = useState(false);

  // Effect to fetch tasks from server
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      setTasks(data);
    }
    fetchTasks();
  }, []);

  // State to hold the selected task ID
  const [selectedId, setSelectedId] = useState(null);
  // State to hold the raw text input
  const [rawText, setRawText] = useState("");
  // State to hold the processed result
  const [result, setResult] = useState(null);
  // State to hold any errors
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    try{
    //send the rawText to the server for processing
    const response = await fetch('http://localhost:3001/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
    });

    //parse the response
    const data = await response.json();
    setResult(data);
    setRawText("");
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // Function to handle deleting a task
  async function handleDelete(id) {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

  // Function to handle clearing all tasks
  async function handleClearBrain() {
  setError(null);
  try {
    await Promise.all(
      tasks.map((task) =>
        fetch(`http://localhost:3001/api/tasks/${task.id}`, { method: 'DELETE' })
      )
    );
    setTasks([]);
  } catch (error) {
    console.error("Something went wrong, please try again", error);
    setError("Something went wrong, please try again");
  }
}

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

  return (
    <div className="brain-dump-page">
      <Legend />
      <div className="brain-scene">
      {showList ? (
        <div className="brain-list-overlay" style={{ width: brainSize }}>
          {tasks.map((task) => {
          const categoryMatch = categories.find((cat) => cat.name === task.category);
          return (
            <div
              key={task.id}
              className="brain-task-item"
              style={{ color: categoryMatch?.color, fontSize: getPrioritySize(task.priority)}}
              onClick={() => setSelectedId(task.id)}
            >
              {task.name}
              {selectedId === task.id && <button onClick={() => handleDelete(task.id)}>Declutter</button>}
            </div>
          );
        })}
      </div>
    ) : (
      <BrainIcon width={brainSize} />
    )}
      <p className="brain-label">My Brain</p>
        
        {/*
          textarea for raw text input 
          every char typed updates the rawText state
        */}
        <div className="bubble-container" style={{ top: -30, left: brainSize - 60 }}>
          <ThoughtBubble />
          <textarea
            className="thought-bubble"
            placeholder="Type Here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button className="send-to-brain-btn" onClick={handleSubmit}>Send to Brain</button>
        </div>

        <br />
        {error && <p>{error}</p>}
        <br />
        {/*if result exists, display the result */}
        {result && (
          <div>
            <p>{result.name}</p>
            <p>{result.category} — {result.priority}</p>
            <p>{result.deadline}</p>
        </div>
      )}
      </div>
      <button onClick={() => setShowList(!showList)}>
        {showList ? "Hide" : "Show"}
      </button>
      <button onClick={handleClearBrain}>Clear Brain</button>
    </div>
  );
}



export default BrainDump;