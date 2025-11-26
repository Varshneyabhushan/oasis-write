import { FC, useState } from 'react';
import FileTree, { FileEntry } from './FileTree';
import Outline from './Outline';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import InlineInput from './InlineInput';

export type SidebarView = 'files' | 'outline';

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
  onDelete
}) => {
  const folderName = folderPath ? folderPath.split('/').pop() || 'Files' : 'Files';
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [rootCreating, setRootCreating] = useState<'file' | 'folder' | null>(null);

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
      <div className="sidebar-content" onContextMenu={handleSidebarContextMenu}>
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
          <Outline content={fileContent || ''} />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
