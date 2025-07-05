import { Orbitron } from 'next/font/google';
import './globals.css';  // or '../styles/globals.css' depending on your setup

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-orbitron',
});

export const metadata = {
  title: "Epic FNF Engine",
  description: "FNF Remake in penguinmod",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} bg-gray-900 text-white font-sans`}>
      <body className="min-h-screen flex flex-col font-sans">
        <header className="bg-gradient-to-r from-cyan-500 to-blue-700 shadow-lg p-5">
          <nav className="container mx-auto flex space-x-8 font-mono tracking-wide text-lg">
            <a href="/" className="hover:text-cyan-300 transition-colors duration-300">
              Home
            </a>
            <a href="/downloads" className="hover:text-cyan-300 transition-colors duration-300">
              Downloads
            </a>
          </nav>
        </header>
        <main className="container mx-auto flex-grow p-8">
          {children}
        </main>
        <footer className="bg-gradient-to-r from-cyan-500 to-blue-700 text-center p-4 font-mono tracking-wide text-sm">
          &copy; 2025 Ollz-png
        </footer>
      </body>
    </html>
  );
}
