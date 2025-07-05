import { readdir, stat } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const relativePath = url.searchParams.get("path") ?? "";

    const baseDir = path.join(process.cwd(), "public", "files");
    const targetDir = path.join(baseDir, relativePath);

    const entries = await readdir(targetDir, { withFileTypes: true });

    const files: string[] = [];
    const folders: string[] = [];

    let hasInst = false;
    let hasVoices = false;

    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders.push(entry.name);
      } else if (entry.isFile()) {
        files.push(entry.name);
        if (entry.name.toLowerCase() === "inst.mp3") hasInst = true;
        if (entry.name.toLowerCase() === "voices.mp3") hasVoices = true;
      }
    }

    return new Response(
      JSON.stringify({
        files,
        folders,
        currentPath: relativePath,
        hasInst,
        hasVoices,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to read directory" }),
      { status: 500 }
    );
  }
}
