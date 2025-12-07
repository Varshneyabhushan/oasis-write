import { useEffect, useRef, useState } from "react";
import { FileWatcher } from "../services/FileWatcher";

interface Options {
  folderPath: string | null;
  debounceMs?: number;
}

export function useFolderWatcher({ folderPath, debounceMs }: Options) {
  const watcherRef = useRef<FileWatcher | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!watcherRef.current) {
      watcherRef.current = new FileWatcher();
    }

    const watcher = watcherRef.current;

    if (!folderPath) {
      watcher.unwatchFolder();
      return;
    }

    let cancelled = false;

    watcher
      .watchFolder({
        path: folderPath,
        onChange: () => {
          if (!cancelled) {
            setRevision((v) => v + 1);
          }
        },
        debounceMs,
      })
      .catch((error) => console.error("Failed to watch folder:", error));

    return () => {
      cancelled = true;
      watcher.unwatchFolder();
    };
  }, [folderPath, debounceMs]);

  return revision;
}
