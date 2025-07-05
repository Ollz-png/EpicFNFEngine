export default function Home() {
  return (
    <>
      <h1 className="text-5xl font-extrabold mb-6 text-cyan-400 drop-shadow-[0_0_10px_cyan] font-orbitron">
        Epic FNF Engine
      </h1>
      <p className="mb-8 text-gray-300 text-lg max-w-xl">
        Welcome! This is the website for my FNF Project that I've been working on!
      </p>
      <ul className="list-disc pl-6 space-y-3 text-cyan-300 font-mono text-lg">
        <li>
          <a href="/downloads" className="hover:text-white hover:underline transition">
            Downloads - download/view the assets of this project!
          </a>
        </li>
      </ul>
    </>
  );
}
