export interface RecentItem {
  path: string;
  type: 'folder' | 'file';
  name: string;
  lastOpened: number;
  parentPath?: string;
}
