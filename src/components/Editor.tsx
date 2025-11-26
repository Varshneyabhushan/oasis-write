import { FC } from 'react';
import TipTapEditor from './TipTapEditor';

interface EditorProps {
  filePath?: string;
  fileContent?: string;
  onContentChange?: (content: string) => void;
}

const Editor: FC<EditorProps> = ({
  filePath,
  fileContent,
  onContentChange
}) => {
  return (
    <div className="editor-container">
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
