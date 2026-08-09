import {
  CSSProperties,
  FC,
  Fragment,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme, themes, defaultTheme } from '../themes';
import { FONT_SIZE_MAX, FONT_SIZE_MIN } from '../constants';
import './SettingsDialog.css';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

const fontOptions = [
  {
    label: 'System Sans',
    value: 'Inter, "SF Pro Text", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  {
    label: 'Serif',
    value: 'Georgia, "Times New Roman", serif',
  },
  {
    label: 'Mono',
    value: '"JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", monospace',
  },
  {
    label: 'Ubuntu Mono',
    value: '"Ubuntu Mono", "SFMono-Regular", "Menlo", "Consolas", monospace',
  },
  {
    label: 'Varela Round',
    value: '"Varela Round", "SF Pro Text", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  {
    label: 'Caveat',
    value: 'Caveat, "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  {
    label: 'Architects Daughter',
    value: '"Architects Daughter", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
  {
    label: 'Cursive',
    value: '"Dancing Script", "Apple Chancery", "Segoe Script", cursive',
  },
];

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const ChevronIcon: FC = () => (
  <svg className="settings-icon" viewBox="0 0 10 10" aria-hidden="true">
    <path
      d="M2 4l3 3 3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon: FC = () => (
  <svg className="settings-icon settings-select-check" viewBox="0 0 10 10" aria-hidden="true">
    <path
      d="M2 5.2l2 2L8 3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon: FC = () => (
  <svg className="settings-icon" viewBox="0 0 10 10" aria-hidden="true">
    <path
      d="M2.5 2.5l5 5M7.5 2.5l-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const ThemeSwatch: FC<{ theme: Theme }> = ({ theme }) => (
  <span
    className="settings-swatch"
    style={{ backgroundColor: theme.colors.bgPrimary, borderColor: theme.colors.borderColor }}
    aria-hidden="true"
  >
    <span
      className="settings-swatch-line"
      style={{ backgroundColor: theme.colors.headingColor, width: '100%' }}
    />
    <span
      className="settings-swatch-line"
      style={{ backgroundColor: theme.colors.textSecondary, width: '70%' }}
    />
    <span
      className="settings-swatch-line"
      style={{ backgroundColor: theme.colors.accentColor, width: '45%' }}
    />
  </span>
);

interface SelectOption {
  value: string;
  label: string;
  group?: string;
  title?: string;
  visual?: ReactNode;
  labelStyle?: CSSProperties;
}

interface SettingsSelectProps {
  id: string;
  labelledBy: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

const SettingsSelect: FC<SettingsSelectProps> = ({ id, labelledBy, options, value, onChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedIndex = options.findIndex(option => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  const openMenu = useCallback(() => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsMenuOpen(true);
  }, [selectedIndex]);

  const closeMenu = useCallback((refocusTrigger = true) => {
    setIsMenuOpen(false);
    if (refocusTrigger) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Keep the keyboard-highlighted option inside the scroll viewport
  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [isMenuOpen, activeIndex]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeMenu();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'Escape':
        // Dismiss the menu without letting the dialog's Escape handler close everything
        if (isMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (isMenuOpen) {
          setActiveIndex(index => Math.min(index + 1, options.length - 1));
        } else {
          openMenu();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isMenuOpen) {
          setActiveIndex(index => Math.max(index - 1, 0));
        } else {
          openMenu();
        }
        break;
      case 'Home':
        if (isMenuOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (isMenuOpen) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        if (isMenuOpen) {
          event.preventDefault();
          commit(activeIndex);
        }
        break;
      case 'Tab':
        if (isMenuOpen) setIsMenuOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="settings-select" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`settings-select-trigger ${isMenuOpen ? 'open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-labelledby={`${labelledBy} ${id}`}
        title={selected?.title}
        onClick={() => (isMenuOpen ? closeMenu(false) : openMenu())}
      >
        <span className="settings-select-value">
          {selected?.visual}
          <span className="settings-select-label" style={selected?.labelStyle}>
            {selected?.label}
          </span>
        </span>
        <ChevronIcon />
      </button>

      {isMenuOpen && (
        <div className="settings-select-menu" role="listbox" aria-labelledby={labelledBy} ref={menuRef}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const startsGroup = option.group && (index === 0 || options[index - 1].group !== option.group);

            return (
              <Fragment key={option.value}>
                {startsGroup && (
                  <div className="settings-select-group" role="presentation">
                    {option.group}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  className={`settings-select-item ${isSelected ? 'selected' : ''} ${index === activeIndex ? 'active' : ''}`}
                  title={option.title}
                  // mousemove, not mouseenter: keyboard scrolling must not hand the
                  // highlight back to whatever happens to sit under a still cursor
                  onMouseMove={() => {
                    if (activeIndex !== index) setActiveIndex(index);
                  }}
                  onClick={() => commit(index)}
                >
                  {option.visual}
                  <span className="settings-select-label" style={option.labelStyle}>
                    {option.label}
                  </span>
                  {isSelected && <CheckIcon />}
                </button>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SettingsDialog: FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
}) => {
  const { themeName, setTheme, fontFamily, setFontFamily } = useTheme();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const themeOptions = useMemo<SelectOption[]>(() => {
    const byGroup = new Map<string, SelectOption[]>();

    Object.entries(themes).forEach(([key, theme]) => {
      const group = `${theme.type.charAt(0).toUpperCase()}${theme.type.slice(1)} themes`;
      const option: SelectOption = {
        value: key,
        label: theme.name,
        group,
        visual: <ThemeSwatch theme={theme} />,
      };

      const existing = byGroup.get(group);
      if (existing) {
        existing.push(option);
      } else {
        byGroup.set(group, [option]);
      }
    });

    return Array.from(byGroup.values()).flat();
  }, []);

  const fontSelectOptions = useMemo<SelectOption[]>(() => {
    const known = fontOptions.some(option => option.value === fontFamily);
    const available = known ? fontOptions : [...fontOptions, { label: 'Custom', value: fontFamily }];

    return available.map(option => ({
      value: option.value,
      label: option.label,
      title: option.value,
      // Preview each option in its own typeface rather than describing it
      visual: (
        <span className="settings-specimen" style={{ fontFamily: option.value }} aria-hidden="true">
          Aa
        </span>
      ),
      labelStyle: { fontFamily: option.value },
    }));
  }, [fontFamily]);

  const activeThemeKey = themes[themeName] ? themeName : defaultTheme;

  if (!isOpen) return null;

  const handleOverlayMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="settings-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="settings-header">
          <h2 id="settings-title" className="settings-title">Settings</h2>
          <button className="settings-close" aria-label="Close settings" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>

          <div className="settings-row">
            <span className="settings-row-label" id="settings-theme-label">Theme</span>
            <SettingsSelect
              id="settings-theme"
              labelledBy="settings-theme-label"
              options={themeOptions}
              value={activeThemeKey}
              onChange={setTheme}
            />
          </div>

          <div className="settings-row">
            <span className="settings-row-label" id="settings-font-label">Font family</span>
            <SettingsSelect
              id="settings-font"
              labelledBy="settings-font-label"
              options={fontSelectOptions}
              value={fontFamily}
              onChange={setFontFamily}
            />
          </div>

          <div className="settings-row">
            <span className="settings-row-label" id="settings-font-size-label">Font size</span>
            <div className="settings-stepper" role="group" aria-labelledby="settings-font-size-label">
              <button
                type="button"
                className="settings-stepper-button"
                aria-label="Decrease font size"
                onClick={onDecreaseFontSize}
                disabled={fontSize <= FONT_SIZE_MIN}
              >
                <svg className="settings-icon" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M2.5 5h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
              <span className="settings-stepper-value" aria-live="polite">{fontSize}px</span>
              <button
                type="button"
                className="settings-stepper-button"
                aria-label="Increase font size"
                onClick={onIncreaseFontSize}
                disabled={fontSize >= FONT_SIZE_MAX}
              >
                <svg className="settings-icon" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M5 2.5v5M2.5 5h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
