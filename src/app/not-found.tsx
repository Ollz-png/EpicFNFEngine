import './globals.css';  // or '../styles/globals.css' depending on your setup
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
      <p className="text-xl mb-8">Seems like this page does&apos;t exist, or hasn&apos;t been made yet. Check back soon!</p>
      <Link
        href="/"
        className="text-cyan-300 hover:text-white underline transition"
      >
        Go back home
      </Link>
    </main>
  );
}
