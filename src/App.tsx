import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Welcome from "./components/Welcome";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import { FileEntry } from "./components/FileTree";
import "./App.css";

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [zenMode, setZenMode] = useState(false);

  // Load folder contents
  const loadFolder = useCallback(async (path: string) => {
    try {
      const entries = await invoke<FileEntry[]>("read_directory", { path });
      setFiles(entries);
      setFolderPath(path);
    } catch (error) {
      console.error("Failed to load folder:", error);
    }
  }, []);

  // Load file contents
  const loadFile = useCallback(async (path: string) => {
    try {
      const content = await invoke<string>("read_file", { path });
      setFileContent(content);
      setSelectedFile(path);
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  }, []);

  // Save file contents
  const saveFile = useCallback(async () => {
    if (!selectedFile || !isDirty) return;

    try {
      await invoke("write_file", {
        path: selectedFile,
        contents: fileContent,
      });
      setIsDirty(false);
      console.log("File saved successfully");
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  }, [selectedFile, fileContent, isDirty]);

  // Handle folder selection from Welcome screen
  const handleFolderSelected = (path: string) => {
    loadFolder(path);
  };

  // Handle file selection from sidebar
  const handleFileSelect = (path: string) => {
    // Save current file if dirty before switching
    if (isDirty && selectedFile) {
      saveFile();
    }
    loadFile(path);
  };

  // Handle content change in editor
  const handleContentChange = (content: string) => {
    setFileContent(content);
    setIsDirty(true);
  };

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!isDirty || !selectedFile) return;

    const timer = setTimeout(() => {
      saveFile();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [fileContent, isDirty, selectedFile, saveFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile, sidebarVisible]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
  const toggleZenMode = () => setZenMode(!zenMode);

  // Show welcome screen if no folder is opened
  if (!folderPath) {
    return <Welcome onFolderSelected={handleFolderSelected} />;
  }

  const fileName = selectedFile ? selectedFile.split('/').pop() || 'Untitled.md' : 'Untitled.md';

  return (
    <div className="app">
      {!zenMode && (
        <Sidebar
          isVisible={sidebarVisible}
          files={files}
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile || undefined}
          folderPath={folderPath}
        />
      )}
      <Editor
        onToggleSidebar={toggleSidebar}
        onToggleZenMode={toggleZenMode}
        fileName={fileName}
        filePath={selectedFile || undefined}
        fileContent={selectedFile ? fileContent : undefined}
        onContentChange={handleContentChange}
      />
    </div>
  );
}

export default App;
