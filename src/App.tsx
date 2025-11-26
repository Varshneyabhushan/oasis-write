import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Welcome from "./components/Welcome";
import Sidebar, { SidebarView } from "./components/Sidebar";
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
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarView, setSidebarView] = useState<SidebarView>('files');
  const [fontSize, setFontSize] = useState(16); // Default font size in pixels
  const AUTO_SAVE_DELAY = 2000; // Auto-save after 2 seconds of inactivity

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

    setSaveStatus('saving');
    try {
      await invoke("write_file", {
        path: selectedFile,
        contents: fileContent,
      });
      setOriginalContent(fileContent);
      setIsDirty(false);
      setSaveStatus('saved');
      console.log("File saved successfully");
    } catch (error) {
      console.error("Failed to save file:", error);
      setSaveStatus('unsaved');
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
      setSaveStatus('unsaved');
    }
  };

  // Auto-save with debouncing - saves after user stops typing for AUTO_SAVE_DELAY ms
  useEffect(() => {
    if (!isDirty || !selectedFile) return;

    const timer = setTimeout(() => {
      saveFile();
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timer);
  }, [fileContent, isDirty, selectedFile, saveFile, AUTO_SAVE_DELAY]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey);

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      // Cmd/Ctrl + 1 to show file explorer
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setSidebarView('files');
        if (!sidebarVisible) {
          setSidebarVisible(true);
        }
      }
      // Cmd/Ctrl + 2 to show outline
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setSidebarView('outline');
        if (!sidebarVisible) {
          setSidebarVisible(true);
        }
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

  // Handler for sidebar view change
  const handleViewChange = (view: SidebarView) => {
    setSidebarView(view);
  };

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
        currentView={sidebarView}
        onViewChange={handleViewChange}
        fileContent={fileContent}
      />
      <Editor
        filePath={selectedFile || undefined}
        fileContent={selectedFile ? fileContent : undefined}
        onContentChange={handleContentChange}
        fontSize={fontSize}
        saveStatus={saveStatus}
      />
    </div>
  );
}

export default App;
