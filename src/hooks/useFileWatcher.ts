import { useEffect, useRef, type MutableRefObject } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FileWatcher } from "../services/FileWatcher";
import { hashContent } from "../utils/hash";

interface Options {
  filePath: string | null;
  isDirty: boolean;
  lastSaveAtRef: MutableRefObject<number>;
  bufferHashRef: MutableRefObject<string>;
  lastDiskHashRef: MutableRefObject<string>;
  syncFromDisk: (content: string) => void;
  onDirtyExternalChange: () => void;
  onAcceptExternal: (content: string) => void;
  onCleanMatch: (content: string) => void;
}

export function useFileWatcher({
  filePath,
  isDirty,
  lastSaveAtRef,
  bufferHashRef,
  lastDiskHashRef,
  syncFromDisk,
  onDirtyExternalChange,
  onAcceptExternal,
  onCleanMatch,
}: Options) {
  const watcherRef = useRef<FileWatcher | null>(null);

  useEffect(() => {
    if (!watcherRef.current) {
      watcherRef.current = new FileWatcher();
    }

    const watcher = watcherRef.current;

    if (!filePath) {
      watcher.unwatchFile();
      return;
    }

    let cancelled = false;

    watcher
      .watchFile({
        path: filePath,
        onChange: async () => {
          if (cancelled) return;

          const now = performance.now();
          if (now - lastSaveAtRef.current < 500) return;

          try {
            const diskContent = await invoke<string>("read_file", { path: filePath });
            const diskHash = hashContent(diskContent);

            if (diskHash === lastDiskHashRef.current) return;

            if (diskHash === bufferHashRef.current) {
              lastDiskHashRef.current = diskHash;
              onCleanMatch(diskContent);
              return;
            }

            if (isDirty) {
              onDirtyExternalChange();
              return;
            }

            onAcceptExternal(diskContent);
            syncFromDisk(diskContent);
          } catch (error) {
            console.error("Failed to handle file watch event:", error);
          }
        },
      })
      .catch((error) => console.error("Failed to watch file:", error));

    return () => {
      cancelled = true;
      watcher.unwatchFile();
    };
  }, [
    filePath,
    isDirty,
    bufferHashRef,
    lastDiskHashRef,
    lastSaveAtRef,
    syncFromDisk,
    onDirtyExternalChange,
    onAcceptExternal,
    onCleanMatch,
  ]);
}
