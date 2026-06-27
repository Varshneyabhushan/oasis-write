import { Extension } from '@tiptap/core';
import { searchEmojis, type EmojiItem } from '../emoji';

export interface EmojiPopupState {
  items: EmojiItem[];
  from: number;
  to: number;
  top: number;
  left: number;
}

export interface EmojiSuggestionOptions {
  onOpen: (state: EmojiPopupState) => void;
  onClose: () => void;
  onArrowUp: () => boolean;
  onArrowDown: () => boolean;
  onEnter: () => boolean;
  onEscape: () => boolean;
}

export const EmojiSuggestion = Extension.create<EmojiSuggestionOptions>({
  name: 'emojiSuggestion',

  addOptions() {
    return {
      onOpen: () => {},
      onClose: () => {},
      onArrowUp: () => false,
      onArrowDown: () => false,
      onEnter: () => false,
      onEscape: () => false,
    };
  },

  onUpdate() {
    const { editor } = this;
    const { state } = editor;
    const { selection } = state;

    if (!selection.empty) {
      this.options.onClose();
      return;
    }

    const { from } = selection;
    const $from = state.doc.resolve(from);
    const nodeType = $from.parent.type.name;

    if (nodeType === 'codeBlock' || nodeType === 'code') {
      this.options.onClose();
      return;
    }

    const textBefore = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 30),
      $from.parentOffset,
      '\0',
      '\0',
    );

    // Require at least one word character after `:` to start showing results
    const match = textBefore.match(/:(\w{1,20})$/);
    if (!match) {
      this.options.onClose();
      return;
    }

    const query = match[1];
    const items = searchEmojis(query);

    if (!items.length) {
      this.options.onClose();
      return;
    }

    const triggerFrom = from - match[0].length;
    const coords = editor.view.coordsAtPos(from);
    const screenHeight = window.innerHeight;
    const popupHeight = 280; // approximate

    const top = coords.bottom + popupHeight > screenHeight
      ? coords.top - popupHeight - 4
      : coords.bottom + 4;

    this.options.onOpen({
      items,
      from: triggerFrom,
      to: from,
      top,
      left: Math.max(8, Math.min(coords.left, window.innerWidth - 260)),
    });
  },

  onSelectionUpdate() {
    // Close if cursor moves away
    const { state } = this.editor;
    const { selection } = state;

    if (!selection.empty) {
      this.options.onClose();
      return;
    }

    const { from } = selection;
    const $from = state.doc.resolve(from);
    const textBefore = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 30),
      $from.parentOffset,
      '\0',
      '\0',
    );

    if (!textBefore.match(/:(\w{1,20})$/)) {
      this.options.onClose();
    }
  },

  addKeyboardShortcuts() {
    return {
      ArrowUp: () => this.options.onArrowUp(),
      ArrowDown: () => this.options.onArrowDown(),
      Enter: () => this.options.onEnter(),
      Escape: () => this.options.onEscape(),
    };
  },
});
