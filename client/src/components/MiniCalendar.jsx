import { useState } from "react";
import '../components/MiniCalendar.css';

// ============================================================
// MiniCalendar — displays the current month with dots on
// dates that have tasks due. Receives tasks as a prop from
// HomeScreen.
// ============================================================
function MiniCalendar({ tasks }) {

  // ============================================================
  // State — which month/year is currently displayed.
  // Starts at today's month. User can navigate forward/back.
  // ============================================================
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11

  // ============================================================
  // Calendar Math — figure out the grid layout for this month
  // ============================================================

  // How many days in this month?
  // Day 0 of next month = last day of this month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // What day of the week does the 1st fall on? (0=Sun, 6=Sat)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Month name for the header
  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  // ============================================================
  // Deadline Dates — build a Set of "YYYY-MM-DD" strings for
  // every task that has a deadline this month, so we can quickly
  // check if a given date has a task due
  // ============================================================
  const deadlineDates = new Set(
    tasks
      .filter((task) => task.deadline)
      .map((task) => task.deadline.split('T')[0]) // strip time if present
      .filter((date) => {
        const [year, month] = date.split('-').map(Number);
        return year === viewYear && month === viewMonth + 1;
      })
  );

  // ============================================================
  // Grid Cells — an array of day numbers with leading
  // empty cells for days before the 1st of the month.
  // ============================================================
  const cells = [
    ...Array(firstDayOfWeek).fill(null), // empty cells before day 1
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1), // day numbers 1-N
  ];

  // ============================================================
  // Navigation — move forward or back one month
  // ============================================================
  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="mini-calendar">
      {/* Header — month name and navigation arrows */}
      <div className="mini-cal-header">
        <button onClick={prevMonth}>‹</button>
        <span>{monthName} {viewYear}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      {/* Day labels — Sun Mon Tue etc */}
      <div className="mini-cal-grid">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="mini-cal-label">{d}</div>
        ))}

        {/* Day cells — empty cells first, then day numbers */}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const hasTasks = deadlineDates.has(dateStr);

          return (
            <div
              key={dateStr}
              className={`mini-cal-day ${isToday ? 'mini-cal-today' : ''}`}
            >
              {day}
              {hasTasks && <span className="mini-cal-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;