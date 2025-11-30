import { FC, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import InlineInput from './InlineInput';
import './FileTree.css';

export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  children?: FileEntry[];
}

interface FileTreeProps {
  entries: FileEntry[];
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onRename: (oldPath: string, newName: string) => Promise<void>;
  onDelete: (path: string, isDirectory: boolean) => Promise<void>;
  onMove: (sourcePath: string, targetPath: string, isDirectory: boolean) => Promise<void>;
}

interface FileTreeItemProps {
  entry: FileEntry;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  depth: number;
  onCreateFile: (parentPath: string, fileName: string) => Promise<void>;
  onCreateFolder: (parentPath: string, folderName: string) => Promise<void>;
  onRename: (oldPath: string, newName: string) => Promise<void>;
  onDelete: (path: string, isDirectory: boolean) => Promise<void>;
  onMove: (sourcePath: string, targetPath: string, isDirectory: boolean) => Promise<void>;
}

const FileTreeItem: FC<FileTreeItemProps> = ({
  entry,
  onFileSelect,
  selectedPath,
  depth,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onMove
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const isSelected = selectedPath === entry.path;

  // Set up draggable
  const { attributes: draggableAttributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: entry.path,
    data: {
      entry,
    },
    disabled: isRenaming,
  });

  // Set up droppable (only for directories)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${entry.path}`,
    disabled: !entry.is_directory,
    data: {
      entry,
    },
  });

  // Separate draggable (on row) from droppable (on container)
  // This allows the entire folder area (including children) to be droppable

  const handleClick = () => {
    if (entry.is_directory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(entry.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleNewFile = () => {
    setContextMenu(null);
    setIsCreating('file');
    if (entry.is_directory && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleNewFolder = () => {
    setContextMenu(null);
    setIsCreating('folder');
    if (entry.is_directory && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleRenameClick = () => {
    setContextMenu(null);
    setIsRenaming(true);
  };

  const handleDeleteClick = () => {
    setContextMenu(null);
    onDelete(entry.path, entry.is_directory);
  };

  // Validate file/folder names
  const validateFileName = (name: string, isFile: boolean = false): string | null => {
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

    // Check if name already exists in current directory
    const siblings = entry.is_directory ? entry.children : [];
    if (siblings?.some(s => s.name === name)) {
      return 'Name already exists';
    }

    return null;
  };

  // Handle create confirmation
  const handleCreateConfirm = async (name: string) => {
    if (isCreating === 'file') {
      await onCreateFile(entry.path, name);
    } else if (isCreating === 'folder') {
      await onCreateFolder(entry.path, name);
    }
    setIsCreating(null);
  };

  // Handle rename confirmation
  const handleRenameConfirm = async (newName: string) => {
    await onRename(entry.path, newName);
    setIsRenaming(false);
  };

  // Get context menu items based on entry type
  const getContextMenuItems = (): ContextMenuItem[] => {
    if (entry.is_directory) {
      return [
        {
          label: 'New File',
          shortcut: 'N',
          onClick: handleNewFile,
        },
        {
          label: 'New Folder',
          shortcut: 'Shift+N',
          onClick: handleNewFolder,
        },
        {
          label: 'Rename',
          shortcut: 'F2',
          onClick: handleRenameClick,
        },
        {
          label: 'Delete',
          onClick: handleDeleteClick,
          danger: true,
        },
      ];
    } else {
      return [
        {
          label: 'Rename',
          shortcut: 'F2',
          onClick: handleRenameClick,
        },
        {
          label: 'Delete',
          onClick: handleDeleteClick,
          danger: true,
        },
      ];
    }
  };

  const rowClasses = `file-tree-row ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`;
  const itemClasses = `file-tree-item ${isOver && entry.is_directory ? 'drag-over' : ''}`;

  return (
    <div
      className={itemClasses}
      ref={entry.is_directory ? setDroppableRef : undefined}
    >
      <div
        ref={setDraggableRef}
        className={rowClasses}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onContextMenu={handleContextMenu}
        {...draggableAttributes}
      >
        {isRenaming ? (
          <InlineInput
            initialValue={entry.name}
            onConfirm={handleRenameConfirm}
            onCancel={() => setIsRenaming(false)}
            autoFocus
            validate={(name) => validateFileName(name, !entry.is_directory)}
          />
        ) : (
          <>
            {entry.is_directory ? (
              <span className={`file-tree-arrow ${isExpanded ? 'expanded' : ''}`} onClick={handleClick}>
                ▶
              </span>
            ) : (
              <span className="file-tree-spacer"></span>
            )}
            <span className="file-tree-name" onClick={handleClick}>{entry.name}</span>
            <span className="file-tree-drag-handle" {...listeners}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="3" cy="3" r="1.5"/>
                <circle cx="9" cy="3" r="1.5"/>
                <circle cx="3" cy="9" r="1.5"/>
                <circle cx="9" cy="9" r="1.5"/>
              </svg>
            </span>
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          isOpen={true}
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Children and inline creation */}
      {entry.is_directory && isExpanded && (
        <div className="file-tree-children">
          {/* Inline file/folder creation */}
          {isCreating && (
            <div
              className="file-tree-row"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              {isCreating === 'folder' ? (
                <span className="file-tree-arrow">▶</span>
              ) : (
                <span className="file-tree-spacer"></span>
              )}
              <InlineInput
                placeholder={isCreating === 'file' ? 'new-file.md' : 'new-folder'}
                onConfirm={handleCreateConfirm}
                onCancel={() => setIsCreating(null)}
                autoFocus
                validate={(name) => validateFileName(name, isCreating === 'file')}
              />
            </div>
          )}

          {/* Existing children */}
          {entry.children?.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: FC<FileTreeProps> = ({
  entries,
  onFileSelect,
  selectedPath,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onMove
}) => {
  if (entries.length === 0) {
    return (
      <div className="file-tree-empty">
        No markdown files found in this folder
      </div>
    );
  }

  return (
    <div className="file-tree">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.path}
          entry={entry}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          depth={0}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          onRename={onRename}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
};

export default FileTree;
