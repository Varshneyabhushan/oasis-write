import { FC, useMemo } from 'react';
import './Outline.css';

interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

interface OutlineProps {
  content: string;
  onHeadingClick?: (text: string, level: number) => void;
}

const Outline: FC<OutlineProps> = ({ content, onHeadingClick }) => {
  const headings = useMemo(() => {
    if (!content) return [];

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: HeadingItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      items.push({ level, text, id });
    }

    return items;
  }, [content]);

  if (headings.length === 0) {
    return (
      <div className="outline-empty">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="outline-container">
      {headings.map((heading, index) => {
        // Check if next item is a child (higher level number)
        const nextHeading = headings[index + 1];
        const hasChildren = nextHeading && nextHeading.level > heading.level;

        return (
          <div
            key={`${heading.id}-${index}`}
            className={`outline-item outline-level-${heading.level} ${hasChildren ? 'has-children' : ''}`}
            style={{
              paddingLeft: `${(heading.level - 1) * 1.25}rem`,
              position: 'relative'
            }}
            onClick={() => onHeadingClick?.(heading.text, heading.level)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onHeadingClick?.(heading.text, heading.level);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Jump to ${heading.text}`}
          >
            {/* Vertical line for tree structure */}
            {heading.level > 1 && (
              <div className="outline-tree-line" style={{ left: `${(heading.level - 2) * 1.25 + 0.5}rem` }} />
            )}

            {/* Horizontal connector */}
            {heading.level > 1 && (
              <div className="outline-tree-connector" style={{ left: `${(heading.level - 2) * 1.25 + 0.5}rem` }} />
            )}

            <span className="outline-text">{heading.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Outline;
