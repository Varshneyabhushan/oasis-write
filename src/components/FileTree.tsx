import { FC, useState } from 'react';
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
}

interface FileTreeItemProps {
  entry: FileEntry;
  onFileSelect: (path: string) => void;
  selectedPath?: string;
  depth: number;
}

const FileTreeItem: FC<FileTreeItemProps> = ({ entry, onFileSelect, selectedPath, depth }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = selectedPath === entry.path;

  const handleClick = () => {
    if (entry.is_directory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(entry.path);
    }
  };

  return (
    <div className="file-tree-item">
      <div
        className={`file-tree-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {entry.is_directory ? (
          <span className={`file-tree-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▶
          </span>
        ) : (
          <span className="file-tree-spacer"></span>
        )}
        <span className="file-tree-name">{entry.name}</span>
      </div>

      {entry.is_directory && isExpanded && entry.children && (
        <div className="file-tree-children">
          {entry.children.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              onFileSelect={onFileSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: FC<FileTreeProps> = ({ entries, onFileSelect, selectedPath }) => {
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
        />
      ))}
    </div>
  );
};

export default FileTree;
