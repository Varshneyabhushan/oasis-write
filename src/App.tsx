import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import Welcome from "./components/Welcome";
import Sidebar, { SidebarView } from "./components/Sidebar";
import Editor from "./components/Editor";
import { FileEntry } from "./components/FileTree";
import ConfirmDialog from "./components/ConfirmDialog";
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

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    path: string;
    name: string;
    isDirectory: boolean;
  } | null>(null);

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

  // Create a new file
  const handleCreateFile = useCallback(async (parentPath: string, fileName: string) => {
    try {
      // Ensure .md extension
      const fullFileName = fileName.endsWith('.md') || fileName.endsWith('.markdown')
        ? fileName
        : `${fileName}.md`;

      const filePath = `${parentPath}/${fullFileName}`;

      await invoke("create_file", { path: filePath });

      // Reload directory to show new file
      if (folderPath) {
        await loadFolder(folderPath);
      }

      // Auto-open the new file
      await loadFile(filePath);

    } catch (error) {
      console.error("Failed to create file:", error);
      alert(`Failed to create file: ${error}`);
    }
  }, [folderPath, loadFolder, loadFile]);

  // Create a new folder
  const handleCreateFolder = useCallback(async (parentPath: string, folderName: string) => {
    try {
      const newFolderPath = `${parentPath}/${folderName}`;

      await invoke("create_folder", { path: newFolderPath });

      // Reload directory to show new folder
      if (folderPath) {
        await loadFolder(folderPath);
      }

    } catch (error) {
      console.error("Failed to create folder:", error);
      alert(`Failed to create folder: ${error}`);
    }
  }, [folderPath, loadFolder]);

  // Rename file or folder
  const handleRename = useCallback(async (oldPath: string, newName: string) => {
    try {
      // Get parent directory path
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = `${parentPath}/${newName}`;

      // Determine if it's a file or folder
      const isFile = oldPath.endsWith('.md') || oldPath.endsWith('.markdown');

      if (isFile) {
        await invoke("rename_file", { oldPath, newPath });
      } else {
        await invoke("rename_folder", { oldPath, newPath });
      }

      // If currently selected file was renamed, update selectedFile
      if (selectedFile === oldPath) {
        setSelectedFile(newPath);
      }

      // Reload directory
      if (folderPath) {
        await loadFolder(folderPath);
      }

    } catch (error) {
      console.error("Failed to rename:", error);
      alert(`Failed to rename: ${error}`);
    }
  }, [folderPath, selectedFile, loadFolder]);

  // Delete file or folder (with confirmation)
  const handleDelete = useCallback(async (path: string, isDirectory: boolean) => {
    const name = path.substring(path.lastIndexOf('/') + 1);

    // Show confirmation dialog
    setDeleteConfirmation({
      isOpen: true,
      path,
      name,
      isDirectory,
    });
  }, []);

  // Confirm delete operation
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation) return;

    const { path, isDirectory } = deleteConfirmation;

    try {
      // Save current file if dirty and it's being deleted
      if (isDirty && selectedFile?.startsWith(path)) {
        await saveFile();
      }

      if (isDirectory) {
        await invoke("delete_folder", { path });
      } else {
        await invoke("delete_file", { path });
      }

      // If currently selected file was deleted, clear selection
      if (selectedFile === path || selectedFile?.startsWith(path + '/')) {
        setSelectedFile(null);
        setFileContent('');
        setOriginalContent('');
        setIsDirty(false);
      }

      // Reload directory
      if (folderPath) {
        await loadFolder(folderPath);
      }

      setDeleteConfirmation(null);

    } catch (error) {
      console.error("Failed to delete:", error);
      alert(`Failed to delete: ${error}`);
      setDeleteConfirmation(null);
    }
  }, [deleteConfirmation, folderPath, selectedFile, isDirty, loadFolder, saveFile]);

  // Cancel delete operation
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmation(null);
  }, []);

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
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
      // Cmd/Ctrl + 1 to toggle file explorer
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        // If sidebar is visible AND already showing files view, hide it (zen mode)
        if (sidebarVisible && sidebarView === 'files') {
          setSidebarVisible(false);
        } else {
          // Otherwise, show sidebar with files view
          setSidebarView('files');
          setSidebarVisible(true);
        }
      }
      // Cmd/Ctrl + 2 to toggle outline
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        // If sidebar is visible AND already showing outline view, hide it (zen mode)
        if (sidebarVisible && sidebarView === 'outline') {
          setSidebarVisible(false);
        } else {
          // Otherwise, show sidebar with outline view
          setSidebarView('outline');
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
  }, [saveFile, sidebarVisible, sidebarView, increaseFontSize, decreaseFontSize]);

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
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <Editor
        filePath={selectedFile || undefined}
        fileContent={selectedFile ? fileContent : undefined}
        onContentChange={handleContentChange}
        fontSize={fontSize}
        saveStatus={saveStatus}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <ConfirmDialog
          isOpen={deleteConfirmation.isOpen}
          title={`Delete ${deleteConfirmation.isDirectory ? 'Folder' : 'File'}`}
          message={`Are you sure you want to delete "${deleteConfirmation.name}"?${
            deleteConfirmation.isDirectory
              ? ' All contents will be permanently deleted.'
              : ' This action cannot be undone.'
          }`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDanger={true}
        />
      )}
    </div>
  );
}

export default App;
