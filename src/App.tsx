import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import "./App.css";

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const toggleZenMode = () => setZenMode(!zenMode);

  return (
    <div className="app">
      {!zenMode && <Sidebar isVisible={sidebarVisible} />}
      <Editor
        onToggleSidebar={toggleSidebar}
        onToggleZenMode={toggleZenMode}
      />
    </div>
  );
}

export default App;
