import { useState, useEffect } from 'react';

function HomeScreen() {
  // useState to hold tasks
  const [tasks, setTasks] = useState([]);

  // useEffect to get tasks
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      setTasks(data);
    };
    fetchTasks();

  }, []);

  // Calculate days left until deadline
  function getDaysLeft(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diffMs = due - today;
    const daysLeft = Math.ceil(diffMs / 86400000);

    //return {daysLeft} day left if == 1 and if overdue return overdue
    if (daysLeft === 1) {
      return "1 day left";
    } else if (daysLeft < 1) {
      return `Overdue by ${Math.abs(daysLeft)} day(s)`;
    }
    return `${daysLeft} days left`;
  }

  // deleting task function
  async function handleDelete(id) {
    // Call the API to delete the task at the specified ID
    await fetch(`http://localhost:3001/api/tasks/${id}`, {
      method: 'DELETE',
    });
    // filter out the deleted task from the state and update the UI
    setTasks(tasks.filter((task) => task.id !== id));
  }

  return (
    <div>
      {/* Collecting tasks into a new array 
          Unique key on every item in rendered list
          Display task name - category - days left until deadline */}
      {tasks.map((task) => (
        <div key={task.id}>
          {task.name} — {task.category} — {getDaysLeft(task.deadline)} 
          <button onClick={() => handleDelete(task.id)}>Erase from brain</button>
        </div>
      ))}
    </div>
  );
}

export default HomeScreen;