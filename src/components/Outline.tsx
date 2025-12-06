import { FC, useMemo } from 'react';
import type { OutlineHeading } from '../types';
import './Outline.css';

interface OutlineProps {
  headings?: OutlineHeading[];
  content?: string;
  onHeadingClick?: (text: string, level: number) => void;
}

// Remove fenced code blocks so that hashes inside code don't become headings
const stripCodeFenceSections = (text: string) => {
  const lines = text.split('\n');
  const filteredLines: string[] = [];
  let inCodeFence = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const isFence = trimmed.startsWith('```') || trimmed.startsWith('~~~');

    if (isFence) {
      inCodeFence = !inCodeFence;
      continue; // Skip fence markers
    }

    if (!inCodeFence) {
      filteredLines.push(line);
    }
  }

  return filteredLines.join('\n');
};

const Outline: FC<OutlineProps> = ({ headings, content, onHeadingClick }) => {
  const computedHeadings = useMemo(() => {
    if (headings !== undefined) {
      return headings;
    }

    if (!content) return [];

    const contentWithoutCode = stripCodeFenceSections(content);

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: OutlineHeading[] = [];
    let match;

    while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      items.push({ level, text, id });
    }

    return items;
  }, [headings, content]);

  if (computedHeadings.length === 0) {
    return (
      <div className="outline-empty">
        No headings found in document
      </div>
    );
  }

  return (
    <div className="outline-container">
      {computedHeadings.map((heading, index) => {
        // Check if next item is a child (higher level number)
        const nextHeading = computedHeadings[index + 1];
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
