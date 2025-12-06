import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Editor as TipTapEditorType } from "@tiptap/react";
import Welcome from "./components/Welcome";
import Sidebar, { SidebarView } from "./components/Sidebar";
import Editor from "./components/Editor";
import { FileEntry } from "./components/FileTree";
import ConfirmDialog from "./components/ConfirmDialog";
import type { OutlineHeading, RecentItem } from "./types";
import "./App.css";

const RECENT_ITEMS_STORAGE_KEY = 'oasis-write-recent-items';
const RECENT_LIMIT = 3;

const getBaseName = (path: string) => {
  const normalizedPath = path.trim();
  const lastSeparatorIndex = Math.max(
    normalizedPath.lastIndexOf('/'),
    normalizedPath.lastIndexOf('\\'),
  );
  if (lastSeparatorIndex === -1) return normalizedPath;
  return normalizedPath.substring(lastSeparatorIndex + 1);
};

const getParentDirectory = (path: string) => {
  const normalizedPath = path.trim();
  const lastSeparatorIndex = Math.max(
    normalizedPath.lastIndexOf('/'),
    normalizedPath.lastIndexOf('\\'),
  );
  if (lastSeparatorIndex === -1) return '';
  return normalizedPath.substring(0, lastSeparatorIndex);
};

const loadStoredRecentItems = (): RecentItem[] => {
  try {
    const stored = localStorage.getItem(RECENT_ITEMS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as RecentItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.path === 'string' && item.type === 'folder')
      .map((item) => ({
        ...item,
        name: item.name || getBaseName(item.path),
        parentPath: item.parentPath || getParentDirectory(item.path),
        lastOpened: item.lastOpened || Date.now(),
      }))
      .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
      .slice(0, RECENT_LIMIT);
  } catch (error) {
    console.error('Failed to load recent items:', error);
    return [];
  }
};

function App() {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [outlineHeadings, setOutlineHeadings] = useState<OutlineHeading[]>([]);

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

  const [editorInstance, setEditorInstance] = useState<TipTapEditorType | null>(null);

  // Font size adjustment handlers
  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 32)); // Max 32px
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 10)); // Min 10px
  }, []);

  const addRecentItem = useCallback((path: string, type: RecentItem['type']) => {
    if (type === 'file') {
      return;
    }
    const now = Date.now();
    const name = getBaseName(path);
    const parentPath = getParentDirectory(path);

    setRecentItems(prevItems => {
      const filtered = prevItems.filter(item => item.path !== path);
      const updated: RecentItem[] = [
        { path, type, name, lastOpened: now, parentPath },
        ...filtered,
      ].slice(0, RECENT_LIMIT);

      try {
        localStorage.setItem(RECENT_ITEMS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to persist recent items:', error);
      }

      return updated;
    });
  }, []);

  useEffect(() => {
    setRecentItems(loadStoredRecentItems());
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
      setOutlineHeadings([]);
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
    setFolderPath(path);
    loadFolder(path);
    addRecentItem(path, 'folder');
  };

  // Handle file selection from sidebar
  const handleFileSelect = (path: string) => {
    // Save current file if dirty before switching
    if (isDirty && selectedFile) {
      saveFile();
    }
    loadFile(path);
  };

  const handleOpenRecent = useCallback((item: RecentItem) => {
    if (item.type !== 'folder') {
      return;
    }
    setFolderPath(item.path);
    loadFolder(item.path);
    addRecentItem(item.path, 'folder');
  }, [addRecentItem, loadFolder]);

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

  // Move file or folder to a target directory
  const handleMove = useCallback(async (sourcePath: string, targetDir: string, isDirectory: boolean) => {
    try {
      await invoke("move_item", { sourcePath, targetDir });

      // If the moved item was the selected file or contains it, update selection
      if (selectedFile === sourcePath) {
        // Update selected file path to the new location
        const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
        const newPath = `${targetDir}/${fileName}`;
        setSelectedFile(newPath);
      } else if (isDirectory && selectedFile?.startsWith(sourcePath + '/')) {
        // If a folder containing the selected file was moved
        const fileName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
        const relativePath = selectedFile.substring(sourcePath.length + 1);
        const newPath = `${targetDir}/${fileName}/${relativePath}`;
        setSelectedFile(newPath);
      }

      // Reload directory to reflect changes
      if (folderPath) {
        await loadFolder(folderPath);
      }

    } catch (error) {
      console.error("Failed to move:", error);
      alert(`Failed to move: ${error}`);
    }
  }, [folderPath, selectedFile, loadFolder]);

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
      // Prevent Cmd/Ctrl + N (handled by native menu)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        return;
      }
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

  // Scroll to heading in editor
  const scrollToHeading = useCallback((headingText: string, headingLevel: number) => {
    if (!editorInstance) return;

    const doc = editorInstance.state.doc;
    let targetPos: number | null = null;

    // Search document for matching heading
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading' &&
          node.attrs.level === headingLevel &&
          node.textContent.trim() === headingText.trim()) {
        targetPos = pos;
        return false; // Stop after first match
      }
    });

    if (targetPos !== null) {
      // Get DOM node and scroll to it
      const dom = editorInstance.view.domAtPos(targetPos + 1);
      const element = dom.node.nodeType === 1
        ? (dom.node as Element)
        : (dom.node.parentElement as Element);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editorInstance]);

  // Show welcome screen if no folder is opened
  if (!folderPath) {
    return (
      <Welcome
        onFolderSelected={handleFolderSelected}
        recentItems={recentItems}
        onOpenRecent={handleOpenRecent}
      />
    );
  }

  return (
    <div className={`app ${sidebarVisible ? 'sidebar-visible' : ''}`}>
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
        onMove={handleMove}
        onHeadingClick={scrollToHeading}
        outlineHeadings={outlineHeadings}
      />
      <Editor
        filePath={selectedFile || undefined}
        fileContent={selectedFile ? fileContent : undefined}
        onContentChange={handleContentChange}
        fontSize={fontSize}
        saveStatus={saveStatus}
        onEditorReady={setEditorInstance}
        onHeadingsChange={setOutlineHeadings}
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
