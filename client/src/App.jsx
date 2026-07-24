import { useState } from "react";
import "./App.css";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import BrainDump from "./screens/BrainDump";

function App() {
  /* Manage active screen state */
  const [activeScreen, setActiveScreen] = useState("Home");

  /* Render active screen */
  const onNavigate = (screen) => {
    setActiveScreen(screen);
  };

  return (
    <div className="App">
      {/** if active screen == home then render HomeScreen, else render BrainDump */}
      {activeScreen === "Home" ? <HomeScreen /> : <BrainDump />}
      {/* BottomNav component with props activeScreen and onNavigate to change screens */}
      <BottomNav activeScreen={activeScreen} onNavigate={onNavigate} />
    </div>
  );
}

export default App;
