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
  function getDaysLeftNum(deadline) {
    const today = new Date();
    const due = new Date(deadline);
    const diffMs = due - today;
    return Math.ceil(diffMs / 86400000);
  }

  //return {daysLeft} day left if == 1 and if overdue return overdue
  function formatDaysLeft(daysLeft) {
    if (daysLeft === 1) {
      return "1 day left";
    } else if (daysLeft < 0) {
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

  // Filter tasks into upcoming and keep in mind categories
  const upcoming = tasks.filter((task) => getDaysLeftNum(task.deadline) <= 14);
  const keepInMind = tasks.filter((task) => getDaysLeftNum(task.deadline) > 14);

  return (
    <div>
      {/* Collecting tasks into a new array 
          Unique key on every item in rendered list
          Display task name - category - days left until deadline
          Upcoming Tasks and Keep in Mind Tasks have different categories
      */}
      <h2>Upcoming...</h2>
      {upcoming.map((task) => (
        <div key={task.id}>
          {task.name} — {task.category} — {formatDaysLeft(getDaysLeftNum(task.deadline))} 
          <button onClick={() => handleDelete(task.id)}>Declutter brain</button>
        </div>
      ))}
      <br />
      <h2>Keep in Mind...</h2>
      {keepInMind.map((task) => (
        <div key={task.id}>
          {task.name} — {task.category} — {formatDaysLeft(getDaysLeftNum(task.deadline))} 
          <button onClick={() => handleDelete(task.id)}>Declutter brain</button>
        </div>
      ))}
    </div>
  );
}

export default HomeScreen;