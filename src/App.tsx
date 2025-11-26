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
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [fontSize, setFontSize] = useState(16); // Default font size in pixels

  // Font size adjustment handlers
  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 32)); // Max 32px
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 10)); // Min 10px
  }, []);

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
      setOriginalContent(content);
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
      setOriginalContent(fileContent);
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
    // Only mark as dirty if content actually changed from original
    if (content !== originalContent) {
      setIsDirty(true);
    }
  };

  // Disable auto-save to prevent content corruption from markdown conversion
  // User must manually save with Cmd/Ctrl+S
  // useEffect(() => {
  //   if (!isDirty || !selectedFile) return;

  //   const timer = setTimeout(() => {
  //     saveFile();
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [fileContent, isDirty, selectedFile, saveFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey);

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      // Cmd/Ctrl + 1 to toggle zen mode (hide sidebar)
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setSidebarVisible(!sidebarVisible);
      }
      // Cmd/Ctrl + = or Cmd/Ctrl + + to increase font size
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Increasing font size');
        increaseFontSize();
        return false;
      }
      // Cmd/Ctrl + - to decrease font size
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Decreasing font size');
        decreaseFontSize();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [saveFile, sidebarVisible, increaseFontSize, decreaseFontSize]);

  // Show welcome screen if no folder is opened
  if (!folderPath) {
    return <Welcome onFolderSelected={handleFolderSelected} />;
  }

  return (
    <div className="app">
      <Sidebar
        isVisible={sidebarVisible}
        files={files}
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile || undefined}
        folderPath={folderPath}
      />
      <Editor
        filePath={selectedFile || undefined}
        fileContent={selectedFile ? fileContent : undefined}
        onContentChange={handleContentChange}
        fontSize={fontSize}
      />
    </div>
  );
}

export default App;
