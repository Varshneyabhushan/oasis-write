export interface RecentItem {
  path: string;
  type: 'folder' | 'file';
  name: string;
  lastOpened: number;
  parentPath?: string;
}

export interface OutlineHeading {
  level: number;
  text: string;
  id: string;
}
