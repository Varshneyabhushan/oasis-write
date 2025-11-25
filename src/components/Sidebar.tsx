import { FC } from 'react';

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isVisible }) => {
  return (
    <aside className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
      <div className="sidebar-header">
        Files
      </div>
      <div className="sidebar-content">
        <div className="placeholder">
          No folder opened
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
