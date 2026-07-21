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
  return (
    <div>
      {/* Collecting tasks into a new array 
          Unique key on every item in rendered list
          Display task name - category - days left until deadline */}
      {tasks.map((task) => (
        <div key={task.id}>
          {task.name} — {task.category} — {getDaysLeft(task.deadline)} 
        </div>
      ))}
    </div>
  );
}

export default HomeScreen;