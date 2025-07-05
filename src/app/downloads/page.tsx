"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface FileList {
  files: string[];
  folders: string[];
  currentPath: string;
  hasInst: boolean;
  hasVoices: boolean;
}

function Breadcrumbs({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const parts = currentPath ? currentPath.split("/") : [];
  let accPath = "";

  return (
    <nav className="mb-4 text-cyan-300 font-mono text-sm select-none">
      <button
        onClick={() => onNavigate("")}
        className="hover:underline mr-1"
        aria-label="Go to root folder"
      >
        Home
      </button>
      {parts.map((part, idx) => {
        accPath += (idx === 0 ? "" : "/") + part;
        const isLast = idx === parts.length - 1;
        return (
          <span key={accPath}>
            /{" "}
            {isLast ? (
              <span>{part}</span>
            ) : (
              <button
                onClick={() => onNavigate(accPath)}
                className="hover:underline mr-1"
              >
                {part}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default function Downloads() {
  const [fileList, setFileList] = useState<FileList>({
    files: [],
    folders: [],
    currentPath: "",
    hasInst: false,
    hasVoices: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Sync playback toggle state
  const [syncPlayback, setSyncPlayback] = useState(false);

  // Refs to audio players
  const instRef = useRef<HTMLAudioElement>(null);
  const voicesRef = useRef<HTMLAudioElement>(null);

  // Fetch files/folders at currentPath
  const fetchFiles = (path = "") => {
    fetch(`/api/files?path=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch files");
        return res.json();
      })
      .then(setFileList)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Sync play/pause logic
  useEffect(() => {
    if (!syncPlayback) return;

    const inst = instRef.current;
    const voices = voicesRef.current;
    if (!inst || !voices) return;

    const onPlay = () => {
      if (inst.paused) inst.play();
      if (voices.paused) voices.play();
    };

    const onPause = () => {
      if (!inst.paused) inst.pause();
      if (!voices.paused) voices.pause();
    };

    inst.addEventListener("play", onPlay);
    voices.addEventListener("play", onPlay);
    inst.addEventListener("pause", onPause);
    voices.addEventListener("pause", onPause);

    return () => {
      inst.removeEventListener("play", onPlay);
      voices.removeEventListener("play", onPlay);
      inst.removeEventListener("pause", onPause);
      voices.removeEventListener("pause", onPause);
    };
  }, [syncPlayback]);

  // Navigate into folder
  const enterFolder = (folderName: string) => {
    const newPath = fileList.currentPath
      ? `${fileList.currentPath}/${folderName}`
      : folderName;
    fetchFiles(newPath);
  };

  // Navigate up folder
  const goUp = () => {
    if (!fileList.currentPath) return;
    const parts = fileList.currentPath.split("/");
    parts.pop();
    const newPath = parts.join("/");
    fetchFiles(newPath);
  };

  return (
    <main>
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">Downloads</h1>

      {error && <p className="text-red-500">Error: {error}</p>}

      <Breadcrumbs currentPath={fileList.currentPath} onNavigate={fetchFiles} />

      <div className="mb-4">
        <button
          onClick={goUp}
          disabled={!fileList.currentPath}
          className={`px-3 py-1 rounded ${
            fileList.currentPath
              ? "bg-cyan-600 hover:bg-cyan-700"
              : "bg-gray-700 cursor-not-allowed"
          } text-white`}
        >
          Up
        </button>
      </div>

      {/* Sync toggle */}
      {(fileList.hasInst || fileList.hasVoices) && (
        <section className="mb-6">
          <label className="flex items-center mb-4 cursor-pointer select-none text-cyan-300">
            <input
              type="checkbox"
              checked={syncPlayback}
              onChange={(e) => setSyncPlayback(e.target.checked)}
              className="mr-2"
            />
            Sync play/pause both tracks
          </label>

          {fileList.hasInst && (
            <div className="mb-2">
              <p className="text-gray-300">Instrumental</p>
              <audio
                ref={instRef}
                controls
                src={`/files/${fileList.currentPath}/inst.mp3`}
              />
            </div>
          )}
          {fileList.hasVoices && (
            <div>
              <p className="text-gray-300">Voices</p>
              <audio
                ref={voicesRef}
                controls
                src={`/files/${fileList.currentPath}/voices.mp3`}
              />
            </div>
          )}
        </section>
      )}

      <p className="mb-2 text-gray-300 font-mono select-text">
        Current folder: /{fileList.currentPath}
      </p>

      <ul className="list-disc pl-6 space-y-2 text-blue-400">
        {fileList.folders.map((folder) => (
          <li key={folder}>
            <button
              onClick={() => enterFolder(folder)}
              className="font-semibold text-cyan-300 hover:text-cyan-100 underline cursor-pointer select-none"
            >
              📁 {folder}
            </button>
          </li>
        ))}

        {fileList.files.map((file) => (
          <li key={file}>
            <Link
              href={`/files/${fileList.currentPath ? fileList.currentPath + "/" : ""}${file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              download
            >
              {file}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
