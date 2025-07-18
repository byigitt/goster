import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-black to-green-950 p-4 sm:p-8">
      <div className="text-center space-y-6">
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-gray-700 tracking-tight">404</h1>
        <p className="text-2xl sm:text-3xl text-gray-400 font-semibold tracking-tight">link not found</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-green-950/50 hover:bg-green-900/50 text-green-400 rounded-xl transition-colors border border-green-800 text-lg sm:text-xl"
        >
          go home
        </Link>
      </div>
    </main>
  );
}