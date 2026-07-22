import { useState, useEffect } from 'react';
import BrainIcon from '../components/BrainIcon';
import '../components/BrainDump.css';
import ThoughtBubble from '../components/ThoughtBubble';

function BrainDump() {
  // State to hold the list of tasks
  const [tasks, setTasks] = useState([]);

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
    } catch (error) {
      console.error("Something went wrong, please try again", error);
      setError("Something went wrong, please try again");
    }
  }

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


  return (
    <div className="brain-dump-page">
      <div className="brain-scene">
        <BrainIcon width={340} />

        {/*
          textarea for raw text input 
          every char typed updates the rawText state
        */}
        
        <div className="bubble-container">
          <ThoughtBubble />

          <textarea
            className="thought-bubble"
            placeholder="Type Here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </div>

        <br />
        <button onClick={handleSubmit}>Organize</button>
        {error && <p>{error}</p>}
        <br />
        <div>
          {tasks.map((task) => (
          <div key={task.id} onClick={() => setSelectedId(task.id)}>
            {task.name}
            {selectedId === task.id && <button onClick={() => handleDelete(task.id)}>Declutter</button>}
          </div>
        ))}
        <br />
        </div>
        {/*if result exists, display the result */}
        {result && (
          <div>
            <p>{result.name}</p>
            <p>{result.category} — {result.priority}</p>
            <p>{result.deadline}</p>
        </div>
      )}
    </div>
    </div>
  );
}



export default BrainDump;