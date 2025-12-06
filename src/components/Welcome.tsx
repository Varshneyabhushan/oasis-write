import { FC, useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { getVersion } from '@tauri-apps/api/app';
import packageJson from '../../package.json';
import { RecentItem } from '../types';
import './Welcome.css';

const shortenPath = (path: string) => {
  const parts = path.split(/[/\\]+/).filter(Boolean);
  if (parts.length <= 2) return path;
  return `…/${parts.slice(-2).join('/')}`;
};

interface WelcomeProps {
  onFolderSelected: (path: string) => void;
  onOpenRecent: (item: RecentItem) => void;
  recentItems: RecentItem[];
}

const Welcome: FC<WelcomeProps> = ({
  onFolderSelected,
  onOpenRecent,
  recentItems,
}) => {
  const [version, setVersion] = useState<string>(packageJson.version);

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const appVersion = await getVersion();
        setVersion(appVersion);
      } catch (error) {
        console.error('Failed to get version:', error);
      }
    };
    loadVersion();
  }, [packageJson.version]);

  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select a folder to open',
      });

      if (selected && typeof selected === 'string') {
        onFolderSelected(selected);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">Oasis Write</h1>
        <p className="welcome-subtitle">
          A serene and focused markdown writing environment
        </p>

        <div className="welcome-actions">
          <button className="welcome-button primary" onClick={handleOpenFolder}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4C2 2.89543 2.89543 2 4 2H7.17157C7.70201 2 8.21071 2.21071 8.58579 2.58579L10 4H16C17.1046 4 18 4.89543 18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Open Folder
          </button>
        </div>

        <div className="welcome-recent">
          <div className="welcome-recent-header">
            <div>
              <p className="welcome-recent-title">Recent</p>
            </div>
          </div>

          {recentItems.length === 0 ? (
            <p className="welcome-empty">No recent folders yet.</p>
          ) : (
            <ul className="welcome-recent-list">
              {recentItems.map((item) => (
                <li key={`${item.type}-${item.path}`} className="welcome-recent-row">
                  <button
                    className="recent-entry"
                    onClick={() => onOpenRecent(item)}
                    title={item.path}
                  >
                    <span className={`recent-icon ${item.type}`} aria-hidden="true">
                      {item.type === 'folder' ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 5h6l2 2h10v10a2 2 0 0 1-2 2H3z" />
                          <path d="M3 5h6l2 2h10" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 3h7l5 5v13H7z" />
                          <path d="M14 3v5h5" />
                        </svg>
                      )}
                    </span>
                    <div className="recent-text">
                      <span className="recent-name">{item.name}</span>
                      <span className="recent-path">{shortenPath(item.path)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="welcome-footer">
          <p className="welcome-hint">Open a folder to start writing.</p>
          <p className="welcome-version">Version {version}</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
