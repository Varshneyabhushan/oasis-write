import { FC, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themes, defaultTheme } from '../themes';
import './SettingsDialog.css';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
];

const SettingsDialog: FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { themeName, setTheme, fontFamily, setFontFamily } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const themeSelectRef = useRef<HTMLDivElement | null>(null);
  const fontSelectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (fontMenuOpen && fontSelectRef.current && !fontSelectRef.current.contains(target)) {
        setFontMenuOpen(false);
      }
      if (themeMenuOpen && themeSelectRef.current && !themeSelectRef.current.contains(target)) {
        setThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fontMenuOpen, themeMenuOpen]);

  const displayFontOptions = useMemo(() => {
    const hasCustom = fontOptions.some(option => option.value === fontFamily);
    if (hasCustom) return fontOptions;
    return [...fontOptions, { label: 'Custom', value: fontFamily }];
  }, [fontFamily]);

  const currentFontOption = useMemo(() => {
    return displayFontOptions.find((option) => option.value === fontFamily) || displayFontOptions[0];
  }, [displayFontOptions, fontFamily]);

  const currentThemeOption = useMemo(() => {
    return themes[themeName] || themes[defaultTheme];
  }, [themeName]);

  useEffect(() => {
    if (!isOpen) {
      setFontMenuOpen(false);
      setThemeMenuOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="settings-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="settings-header">
          <h2 id="settings-title" className="settings-title">Settings</h2>
          <button className="settings-close" aria-label="Close settings" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Appearance</div>

          <div className="settings-field">
            <div className="settings-label">Theme</div>
            <div className="settings-theme-select" ref={themeSelectRef}>
              <button
                type="button"
                className={`settings-theme-trigger ${themeMenuOpen ? 'open' : ''}`}
                onClick={() => setThemeMenuOpen(prev => !prev)}
                title={currentThemeOption.name}
              >
                <div className="settings-theme-option-body">
                  <span
                    className="settings-theme-sample"
                    style={{ backgroundColor: currentThemeOption.colors.bgSecondary }}
                    aria-hidden
                  >
                    <span
                      className="settings-theme-heading-bar"
                      style={{ backgroundColor: currentThemeOption.colors.headingColor }}
                    />
                  </span>
                  <span className="settings-theme-option-name">{currentThemeOption.name}</span>
                </div>
                <span className="settings-font-caret" aria-hidden="true">▾</span>
              </button>
              {themeMenuOpen && (
                <div className="settings-theme-menu">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      className={`settings-theme-menu-item ${key === themeName ? 'active' : ''}`}
                      onClick={() => {
                        setTheme(key);
                        setThemeMenuOpen(false);
                      }}
                    >
                      <div className="settings-theme-option-body">
                        <span
                          className="settings-theme-sample"
                          style={{ backgroundColor: theme.colors.bgSecondary }}
                          aria-hidden
                        >
                          <span
                            className="settings-theme-heading-bar"
                            style={{ backgroundColor: theme.colors.headingColor }}
                          />
                        </span>
                        <span className="settings-theme-option-name">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="settings-field">
            <div className="settings-label">Font family</div>
            <div className="settings-font-select" ref={fontSelectRef}>
              <button
                type="button"
                className={`settings-font-trigger ${fontMenuOpen ? 'open' : ''}`}
                onClick={() => setFontMenuOpen((prev) => !prev)}
                title={fontFamily}
              >
                <div className="settings-font-option-body">
                  <span className="settings-font-option-name">{currentFontOption.label}</span>
                </div>
                <span className="settings-font-caret" aria-hidden="true">▾</span>
              </button>
              {fontMenuOpen && (
                <div className="settings-font-menu">
                  {displayFontOptions.map(option => (
                    <button
                      key={`${option.label}-${option.value}`}
                      className={`settings-font-menu-item ${fontFamily === option.value ? 'active' : ''}`}
                      title={option.value}
                      onClick={() => {
                        setFontFamily(option.value);
                        setFontMenuOpen(false);
                      }}
                    >
                      <div className="settings-font-option-body">
                        <span className="settings-font-option-name">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
