import { FC } from 'react';
import MarkdownEditor from './MarkdownEditor';

interface EditorProps {
  onToggleSidebar: () => void;
  onToggleZenMode: () => void;
}

const Editor: FC<EditorProps> = ({ onToggleSidebar, onToggleZenMode }) => {
  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="editor-title">
          Untitled.md
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
        <MarkdownEditor />
      </main>
    </div>
  );
};

export default Editor;
