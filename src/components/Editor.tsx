import { FC } from 'react';
import TipTapEditor from './TipTapEditor';

interface EditorProps {
  onToggleSidebar: () => void;
  onToggleZenMode: () => void;
  fileName?: string;
  filePath?: string;
  fileContent?: string;
  onContentChange?: (content: string) => void;
}

const Editor: FC<EditorProps> = ({
  onToggleSidebar,
  onToggleZenMode,
  fileName = 'Untitled.md',
  filePath,
  fileContent,
  onContentChange
}) => {
  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="editor-title">
          {fileName}
        </div>
        <div className="editor-actions">
          <button onClick={onToggleSidebar}>
            Toggle Sidebar
          </button>
          <button onClick={onToggleZenMode}>
            Zen Mode
          </button>
        </div>
      </header>
      <main className="editor-main">
        <TipTapEditor
          key={filePath || 'empty'}
          initialContent={fileContent}
          onChange={onContentChange}
        />
      </main>
    </div>
  );
};

export default Editor;
