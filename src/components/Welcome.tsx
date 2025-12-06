import { FC, useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { getVersion } from '@tauri-apps/api/app';
import packageJson from '../../package.json';
import './Welcome.css';

interface WelcomeProps {
  onFolderSelected: (path: string) => void;
}

const Welcome: FC<WelcomeProps> = ({ onFolderSelected }) => {
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

        <div className="welcome-footer">
          <p className="welcome-hint">
            Select a folder containing markdown files to get started
          </p>
          <p className="welcome-version">Version {version}</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
