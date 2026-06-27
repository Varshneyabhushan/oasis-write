import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { EmojiItem } from '../emoji';
import './EmojiDropdown.css';

interface EmojiDropdownProps {
  items: EmojiItem[];
  command: (item: EmojiItem) => void;
}

export interface EmojiDropdownRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const EmojiDropdown = forwardRef<EmojiDropdownRef, EmojiDropdownProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex(i => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex(i => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) return null;

    return (
      <div className="emoji-dropdown">
        {items.map((item, index) => (
          <button
            key={item.name}
            className={`emoji-dropdown__item ${index === selectedIndex ? 'emoji-dropdown__item--selected' : ''}`}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              selectItem(index);
            }}
          >
            <span className="emoji-dropdown__char">{item.emoji}</span>
            <span className="emoji-dropdown__name">{item.name.replace(/_/g, ' ')}</span>
          </button>
        ))}
      </div>
    );
  }
);

EmojiDropdown.displayName = 'EmojiDropdown';

export { EmojiDropdown };
