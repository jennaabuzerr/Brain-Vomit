// Two props activeScreen and onNavigate
// Render button for Home and Brain Dump that when clicked calls onNavigate with screen name home or brain dump
// visually show which is active
import "./BottomNav.css";

function BottomNav({ activeScreen, onNavigate }) {
  return (
    <div className="bottom-nav">
      {/*Create home button and attribute onClick*/}
      <button
        onClick={() => onNavigate("Home")}
        className={`nav-button ${activeScreen === "Home" ? "active" : ""}`}
      >
        Home
      </button>
      {/*Create brain dump button and attribute onClick*/}
      <button
        onClick={() => onNavigate("BrainDump")}
        className={`nav-button ${activeScreen === "BrainDump" ? "active" : ""}`}
      >
        Brain Dump
      </button>
    </div>
  );
}

export default BottomNav;
