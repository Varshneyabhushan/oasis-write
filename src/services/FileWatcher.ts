import { watchImmediate, type UnwatchFn } from "@tauri-apps/plugin-fs";

interface FolderWatchOptions {
  path: string;
  onChange: () => void;
  debounceMs?: number;
}

interface FileWatchOptions {
  path: string;
  onChange: () => void;
}

// Small helper to isolate watcher lifecycle and debounce.
export class FileWatcher {
  private folderUnwatch: UnwatchFn | null = null;
  private fileUnwatch: UnwatchFn | null = null;
  private folderTimer: ReturnType<typeof setTimeout> | null = null;

  async watchFolder(options: FolderWatchOptions): Promise<void> {
    const { path, onChange, debounceMs = 150 } = options;
    this.unwatchFolder();

    const unwatch = await watchImmediate(
      path,
      () => {
        if (this.folderTimer) {
          clearTimeout(this.folderTimer);
        }
        this.folderTimer = setTimeout(onChange, debounceMs);
      },
      { recursive: true }
    );

    this.folderUnwatch = unwatch;
  }

  unwatchFolder(): void {
    if (this.folderTimer) {
      clearTimeout(this.folderTimer);
      this.folderTimer = null;
    }
    if (this.folderUnwatch) {
      this.folderUnwatch();
      this.folderUnwatch = null;
    }
  }

  async watchFile(options: FileWatchOptions): Promise<void> {
    const { path, onChange } = options;
    this.unwatchFile();

    const unwatch = await watchImmediate(path, onChange);
    this.fileUnwatch = unwatch;
  }

  unwatchFile(): void {
    if (this.fileUnwatch) {
      this.fileUnwatch();
      this.fileUnwatch = null;
    }
  }

  dispose(): void {
    this.unwatchFolder();
    this.unwatchFile();
  }
}
