import { FC } from 'react';
import TipTapEditor from './TipTapEditor';

interface EditorProps {
  filePath?: string;
  fileContent?: string;
  onContentChange?: (content: string) => void;
  fontSize?: number;
}

const Editor: FC<EditorProps> = ({
  filePath,
  fileContent,
  onContentChange,
  fontSize = 16
}) => {
  return (
    <div className="editor-container">
      <main className="editor-main">
        <TipTapEditor
          key={filePath || 'empty'}
          initialContent={fileContent}
          onChange={onContentChange}
          fontSize={fontSize}
        />
      </main>
    </div>
  );
};

export default Editor;
