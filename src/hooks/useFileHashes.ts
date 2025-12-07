import { useCallback, useEffect, useRef } from "react";
import { hashContent } from "../utils/hash";

export function useFileHashes(filePath: string | null) {
  const bufferHashRef = useRef<string>("");
  const lastDiskHashRef = useRef<string>("");
  const lastSaveAtRef = useRef<number>(0);

  useEffect(() => {
    bufferHashRef.current = "";
    lastDiskHashRef.current = "";
    lastSaveAtRef.current = 0;
  }, [filePath]);

  const updateBufferHash = useCallback((content: string) => {
    bufferHashRef.current = hashContent(content);
  }, []);

  const syncFromDisk = useCallback((content: string) => {
    const hash = hashContent(content);
    bufferHashRef.current = hash;
    lastDiskHashRef.current = hash;
  }, []);

  const shouldSkipSave = useCallback(
    (content: string) => {
      const hash = bufferHashRef.current || hashContent(content);
      return hash === lastDiskHashRef.current;
    },
    []
  );

  const noteSave = useCallback(
    (content: string) => {
      const hash = bufferHashRef.current || hashContent(content);
      lastDiskHashRef.current = hash;
      lastSaveAtRef.current = performance.now();
    },
    []
  );

  return {
    bufferHashRef,
    lastDiskHashRef,
    lastSaveAtRef,
    updateBufferHash,
    syncFromDisk,
    shouldSkipSave,
    noteSave,
  };
}

