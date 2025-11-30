import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface CollapsibleHeadingOptions {
  levels: number[];
  HTMLAttributes: Record<string, any>;
}

// Plugin key for managing collapse state
const collapsibleHeadingPluginKey = new PluginKey('collapsibleHeading');

// Store collapsed heading positions
const collapsedHeadings = new Map<string, boolean>();

// Generate stable ID for a heading
function getHeadingId(node: any, pos: number): string {
  const text = node.textContent || '';
  return `h${node.attrs.level}-${pos}-${text.substring(0, 20)}`;
}

// Helper to find content range under a heading
function findHeadingContentRange(doc: any, headingPos: number, headingLevel: number): { from: number; to: number } | null {
  const headingNode = doc.nodeAt(headingPos);
  if (!headingNode) return null;

  const from = headingPos + headingNode.nodeSize;
  let to = from;
  let foundEnd = false;

  doc.nodesBetween(from, doc.content.size, (node: any, pos: number) => {
    if (foundEnd) return false;

    if (node.type.name === 'heading' && node.attrs.level <= headingLevel) {
      to = pos;
      foundEnd = true;
      return false;
    }
  });

  if (!foundEnd) {
    to = doc.content.size;
  }

  return to > from ? { from, to } : null;
}

// Create decorations
function createDecorations(doc: any, triggerUpdate?: () => void): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'heading') {
      const headingId = getHeadingId(node, pos);
      const isCollapsed = collapsedHeadings.get(headingId) || false;

      // Add widget decoration for collapse button (pos + 1 to place inside the heading)
      const widget = Decoration.widget(
        pos + 1,
        () => {
          const button = document.createElement('button');
          button.className = 'collapse-button';
          button.contentEditable = 'false';
          button.type = 'button';
          button.innerHTML = '›';

          if (!isCollapsed) {
            button.classList.add('expanded');
          }

          button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentCollapsed = collapsedHeadings.get(headingId) || false;
            collapsedHeadings.set(headingId, !currentCollapsed);

            if (triggerUpdate) {
              triggerUpdate();
            }
          };

          return button;
        },
        {
          side: -1,
          ignoreSelection: true,
        }
      );

      decorations.push(widget);

      // If collapsed, hide content nodes
      if (isCollapsed) {
        const contentRange = findHeadingContentRange(doc, pos, node.attrs.level);
        if (contentRange) {
          doc.nodesBetween(contentRange.from, contentRange.to, (childNode: any, childPos: number) => {
            if (childPos >= contentRange.from && childPos < contentRange.to) {
              decorations.push(
                Decoration.node(childPos, childPos + childNode.nodeSize, {
                  class: 'collapsed-content',
                })
              );
            }
          });
        }
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const CollapsibleHeading = Node.create<CollapsibleHeadingOptions>({
  name: 'heading',
  priority: 1000,

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    };
  },

  content: 'inline*',
  group: 'block',
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return this.options.levels.map((level: number) => ({
      tag: `h${level}`,
      attrs: { level },
    }));
  },

  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addProseMirrorPlugins() {
    let editorView: any = null;

    return [
      new Plugin({
        key: collapsibleHeadingPluginKey,
        view(view) {
          editorView = view;
          return {};
        },
        state: {
          init(_, state) {
            return createDecorations(state.doc, () => {
              if (editorView) {
                const tr = editorView.state.tr;
                tr.setMeta(collapsibleHeadingPluginKey, { type: 'toggleCollapse' });
                editorView.dispatch(tr);
              }
            });
          },
          apply(tr, decorationSet, _oldState, newState) {
            const meta = tr.getMeta(collapsibleHeadingPluginKey);
            if (meta?.type === 'toggleCollapse') {
              return createDecorations(newState.doc, () => {
                if (editorView) {
                  const tr = editorView.state.tr;
                  tr.setMeta(collapsibleHeadingPluginKey, { type: 'toggleCollapse' });
                  editorView.dispatch(tr);
                }
              });
            }

            if (tr.docChanged) {
              return createDecorations(newState.doc, () => {
                if (editorView) {
                  const tr = editorView.state.tr;
                  tr.setMeta(collapsibleHeadingPluginKey, { type: 'toggleCollapse' });
                  editorView.dispatch(tr);
                }
              });
            }

            return decorationSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
