import { FC } from 'react';
import FileTree, { FileEntry } from './FileTree';
import Outline from './Outline';

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
}

const Sidebar: FC<SidebarProps> = ({
  isVisible,
  files,
  onFileSelect,
  selectedFile,
  folderPath,
  currentView,
  onViewChange,
  fileContent
}) => {
  const folderName = folderPath ? folderPath.split('/').pop() || 'Files' : 'Files';

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
      <div className="sidebar-content">
        {currentView === 'files' ? (
          files.length > 0 ? (
            <FileTree
              entries={files}
              onFileSelect={onFileSelect}
              selectedPath={selectedFile}
            />
          ) : (
            <div className="placeholder">
              No markdown files found
            </div>
          )
        ) : (
          <Outline content={fileContent || ''} />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
