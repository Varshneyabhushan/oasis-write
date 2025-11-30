import { FC, useState } from 'react';
import { DndContext, useDroppable, DragEndEvent, DragOverlay, DragStartEvent, rectIntersection, CollisionDetection, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import FileTree, { FileEntry } from './FileTree';
import Outline from './Outline';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import InlineInput from './InlineInput';

export type SidebarView = 'files' | 'outline';

// Separate component for droppable content that must be inside DndContext
interface DroppableContentProps {
  folderPath: string;
  folderName: string;
  currentView: SidebarView;
  rootCreating: 'file' | 'folder' | null;
  files: FileEntry[];
  selectedFile?: string;
  fileContent?: string;
  contextMenu: { x: number; y: number } | null;
  onFileSelect: (path: string) => void;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onRename: (oldPath: string, newName: string) => Promise<void>;
  onDelete: (path: string, isDirectory: boolean) => Promise<void>;
  onMove: (sourcePath: string, targetDir: string, isDirectory: boolean) => Promise<void>;
  onHeadingClick?: (text: string, level: number) => void;
  handleSidebarContextMenu: (e: React.MouseEvent) => void;
  getRootContextMenuItems: () => ContextMenuItem[];
  validateRootFileName: (name: string, isFile: boolean) => string | null;
  handleRootCreateConfirm: (name: string) => Promise<void>;
  setContextMenu: (menu: { x: number; y: number } | null) => void;
  setRootCreating: (creating: 'file' | 'folder' | null) => void;
}

const DroppableContent: FC<DroppableContentProps> = ({
  folderPath,
  folderName,
  currentView,
  rootCreating,
  files,
  selectedFile,
  fileContent,
  contextMenu,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onMove,
  onHeadingClick,
  handleSidebarContextMenu,
  getRootContextMenuItems,
  validateRootFileName,
  handleRootCreateConfirm,
  setContextMenu,
  setRootCreating,
}) => {
  // Root droppable - must be inside DndContext to register properly
  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: `root-folder-${folderPath}`,
    disabled: currentView !== 'files',
    data: {
      entry: {
        path: folderPath || '',
        is_directory: true,
        name: folderName,
      },
    },
  });

  return (
    <div
      ref={setRootDropRef}
      className={`sidebar-content ${isRootOver ? 'root-drag-over' : ''}`}
      onContextMenu={handleSidebarContextMenu}
    >
      {currentView === 'files' ? (
        <>
          {/* Root-level inline creation */}
          {rootCreating && (
            <div
              className="file-tree-row"
              style={{ paddingLeft: '8px' }}
            >
              {rootCreating === 'folder' ? (
                <span className="file-tree-arrow">▶</span>
              ) : (
                <span className="file-tree-spacer"></span>
              )}
              <InlineInput
                placeholder={rootCreating === 'file' ? 'new-file.md' : 'new-folder'}
                onConfirm={handleRootCreateConfirm}
                onCancel={() => setRootCreating(null)}
                autoFocus
                validate={(name) => validateRootFileName(name, rootCreating === 'file')}
              />
            </div>
          )}

          {files.length > 0 ? (
            <FileTree
              entries={files}
              onFileSelect={onFileSelect}
              selectedPath={selectedFile}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
            />
          ) : (
            <div className="placeholder">
              No markdown files found
            </div>
          )}

          {/* Context menu for root-level creation */}
          {contextMenu && (
            <ContextMenu
              isOpen={true}
              x={contextMenu.x}
              y={contextMenu.y}
              items={getRootContextMenuItems()}
              onClose={() => setContextMenu(null)}
            />
          )}
        </>
      ) : (
        <Outline content={fileContent || ''} onHeadingClick={onHeadingClick} />
      )}
    </div>
  );
};

interface SidebarProps {
  isVisible: boolean;
  files: FileEntry[];
  onFileSelect: (path: string) => void;
  selectedFile?: string;
  folderPath?: string;
  currentView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  fileContent?: string;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onRename: (oldPath: string, newName: string) => Promise<void>;
  onDelete: (path: string, isDirectory: boolean) => Promise<void>;
  onMove: (sourcePath: string, targetDir: string, isDirectory: boolean) => Promise<void>;
  onHeadingClick?: (text: string, level: number) => void;
}

const Sidebar: FC<SidebarProps> = ({
  isVisible,
  files,
  onFileSelect,
  selectedFile,
  folderPath,
  currentView,
  onViewChange,
  fileContent,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onMove,
  onHeadingClick
}) => {
  const folderName = folderPath ? folderPath.split('/').pop() || 'Files' : 'Files';
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [rootCreating, setRootCreating] = useState<'file' | 'folder' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag and drop
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8, // 8px of movement required to start drag
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Custom collision detection: hierarchical, VSCode-like behavior
  const customCollisionDetection: CollisionDetection = (args) => {
    // Use rect intersection for more reliable collision detection
    const allCollisions = rectIntersection(args);

    // Separate root and folder collisions
    const rootCollisions = allCollisions.filter(
      collision => collision.id.toString().startsWith('root-folder-')
    );

    const folderCollisions = allCollisions.filter(
      collision => collision.id.toString().startsWith('droppable-')
    );

    // If we have folder collisions, pick the most specific (deepest) one
    if (folderCollisions.length > 0) {
      // Sort by path depth (deepest first) to get most specific folder
      const sortedFolders = folderCollisions.sort((a, b) => {
        const pathA = a.id.toString().replace('droppable-', '');
        const pathB = b.id.toString().replace('droppable-', '');
        const depthA = pathA.split('/').length;
        const depthB = pathB.split('/').length;
        return depthB - depthA; // Deeper paths first
      });

      // Return only the most specific (deepest) folder
      return [sortedFolders[0]];
    }

    // No folder collisions, use root if available
    if (rootCollisions.length > 0) {
      return rootCollisions;
    }

    // No collisions detected
    return [];
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const sourceEntry = active.data.current?.entry as FileEntry;
    const targetEntry = over.data.current?.entry as FileEntry;

    if (!sourceEntry || !targetEntry) {
      return;
    }

    // Don't drop on itself
    if (sourceEntry.path === targetEntry.path) {
      return;
    }

    // Don't drop on files, only folders
    if (!targetEntry.is_directory) {
      return;
    }

    // Don't drop a parent folder into its child
    if (targetEntry.path.startsWith(sourceEntry.path + '/')) {
      return;
    }

    // Don't move if already in the target folder (no-op)
    const sourceParentPath = sourceEntry.path.substring(0, sourceEntry.path.lastIndexOf('/'));
    if (sourceParentPath === targetEntry.path) {
      return;
    }

    // Perform the move
    onMove(sourceEntry.path, targetEntry.path, sourceEntry.is_directory);
  };

  // Handle context menu on empty sidebar areas (for root-level file/folder creation)
  const handleSidebarContextMenu = (e: React.MouseEvent) => {
    // Only show context menu if clicking directly on the sidebar-content or placeholder
    // Don't interfere if clicking on FileTree items (they handle their own context menu)
    const target = e.target as HTMLElement;
    if (target.classList.contains('sidebar-content') || target.classList.contains('placeholder')) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const getRootContextMenuItems = (): ContextMenuItem[] => {
    if (!folderPath) return [];

    return [
      {
        label: 'New File',
        shortcut: 'N',
        onClick: () => {
          setContextMenu(null);
          setRootCreating('file');
        },
      },
      {
        label: 'New Folder',
        shortcut: 'Shift+N',
        onClick: () => {
          setContextMenu(null);
          setRootCreating('folder');
        },
      },
    ];
  };

  const validateRootFileName = (name: string, isFile: boolean): string | null => {
    if (!name || name.trim() === '') {
      return 'Name cannot be empty';
    }

    if (name.includes('/') || name.includes('\\')) {
      return 'Name cannot contain / or \\';
    }

    if (name.startsWith('.')) {
      return 'Name cannot start with .';
    }

    if (isFile && !name.endsWith('.md') && !name.endsWith('.markdown')) {
      return 'File must have .md or .markdown extension';
    }

    // Check if name already exists at root level
    if (files.some(f => f.name === name)) {
      return 'Name already exists';
    }

    return null;
  };

  const handleRootCreateConfirm = async (name: string) => {
    if (!folderPath) return;

    if (rootCreating === 'file') {
      await onCreateFile(folderPath, name);
    } else if (rootCreating === 'folder') {
      await onCreateFolder(folderPath, name);
    }
    setRootCreating(null);
  };

  return (
    <aside className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={customCollisionDetection}
      >
        <div className="sidebar-header">
        <div className="sidebar-header-content">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${currentView === 'files' ? 'active' : ''}`}
              onClick={() => onViewChange('files')}
              title="File Explorer (Cmd+1)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1.5 3.5C1.5 2.67157 2.17157 2 3 2H6L7 4H13C13.8284 4 14.5 4.67157 14.5 5.5V12.5C14.5 13.3284 13.8284 14 13 14H3C2.17157 14 1.5 13.3284 1.5 12.5V3.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
            <button
              className={`sidebar-tab ${currentView === 'outline' ? 'active' : ''}`}
              onClick={() => onViewChange('outline')}
              title="Document Outline (Cmd+2)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3H14M2 8H14M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="sidebar-title">
            {currentView === 'files' ? folderName : 'Outline'}
          </div>
        </div>
      </div>
      <DroppableContent
        folderPath={folderPath || ''}
        folderName={folderName}
        currentView={currentView}
        rootCreating={rootCreating}
        files={files}
        selectedFile={selectedFile}
        fileContent={fileContent}
        contextMenu={contextMenu}
        onFileSelect={onFileSelect}
        onCreateFile={onCreateFile}
        onCreateFolder={onCreateFolder}
        onRename={onRename}
        onDelete={onDelete}
        onMove={onMove}
        onHeadingClick={onHeadingClick}
        handleSidebarContextMenu={handleSidebarContextMenu}
        getRootContextMenuItems={getRootContextMenuItems}
        validateRootFileName={validateRootFileName}
        handleRootCreateConfirm={handleRootCreateConfirm}
        setContextMenu={setContextMenu}
        setRootCreating={setRootCreating}
      />
      <DragOverlay>
        {activeId ? (
          <div className="file-tree-row dragging" style={{ paddingLeft: '8px' }}>
            <span className="file-tree-spacer"></span>
            <span className="file-tree-name">{activeId.split('/').pop()}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </aside>
  );
};

export default Sidebar;
