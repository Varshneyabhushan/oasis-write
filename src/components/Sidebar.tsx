import { FC } from 'react';
import FileTree, { FileEntry } from './FileTree';

interface SidebarProps {
  isVisible: boolean;
  files: FileEntry[];
  onFileSelect: (path: string) => void;
  selectedFile?: string;
  folderPath?: string;
}

const Sidebar: FC<SidebarProps> = ({ isVisible, files, onFileSelect, selectedFile, folderPath }) => {
  const folderName = folderPath ? folderPath.split('/').pop() || 'Files' : 'Files';

  return (
    <aside className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
      <div className="sidebar-header">
        {folderName}
      </div>
      <div className="sidebar-content">
        {files.length > 0 ? (
          <FileTree
            entries={files}
            onFileSelect={onFileSelect}
            selectedPath={selectedFile}
          />
        ) : (
          <div className="placeholder">
            No markdown files found
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
