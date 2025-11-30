import { FC } from 'react';
import TipTapEditor from './TipTapEditor';
import { Editor as TipTapEditorType } from '@tiptap/react';

interface EditorProps {
  filePath?: string;
  fileContent?: string;
  onContentChange?: (content: string) => void;
  fontSize?: number;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  onEditorReady?: (editor: TipTapEditorType) => void;
}

const Editor: FC<EditorProps> = ({
  filePath,
  fileContent,
  onContentChange,
  fontSize = 16,
  onEditorReady,
  // saveStatus = 'saved'
}) => {
  // TODO: Add visual status bar to show save status (saved/saving/unsaved)
  // Status bar should display at the top of the editor with color-coded indicators

  return (
    <div className="editor-container">
      <main className="editor-main">
        <TipTapEditor
          key={filePath || 'empty'}
          initialContent={fileContent}
          onChange={onContentChange}
          fontSize={fontSize}
          onEditorReady={onEditorReady}
        />
      </main>
    </div>
  );
};

export default Editor;
