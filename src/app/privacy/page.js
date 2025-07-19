export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-green-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Our Commitment to Privacy</h2>
            <p className="mb-3">
              göster is designed with privacy at its core. We collect the absolute minimum data necessary to provide our screen recording service. This policy explains exactly what we collect and why.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">What We Actually Collect</h2>
            
            <h3 className="text-lg font-semibold text-white mb-2 mt-4">1. Temporary Video Data</h3>
            <ul className="list-disc pl-6 space-y-1.5 mb-4 text-gray-400">
              <li><strong className="text-gray-300">Screen recordings:</strong> Videos you upload (WebM, MP4, or OGG format)</li>
              <li><strong className="text-gray-300">Automatic deletion:</strong> All videos are permanently deleted after 24 hours</li>
              <li><strong className="text-gray-300">Size limit:</strong> Maximum 100MB per video</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2">2. Technical Data (Rate Limiting Only)</h3>
            <ul className="list-disc pl-6 space-y-1.5 mb-4 text-gray-400">
              <li><strong className="text-gray-300">IP addresses:</strong> Used only for rate limiting to prevent abuse</li>
              <li><strong className="text-gray-300">Stored in memory:</strong> Never saved to database, automatically cleared</li>
              <li><strong className="text-gray-300">No tracking:</strong> We don't track your activity across sessions</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mb-2">3. Link Metadata</h3>
            <ul className="list-disc pl-6 space-y-1.5 mb-4 text-gray-400">
              <li><strong className="text-gray-300">Short codes:</strong> Random identifiers for your sharing links</li>
              <li><strong className="text-gray-300">Timestamps:</strong> When links are created and expire</li>
              <li><strong className="text-gray-300">View count:</strong> Number of times a video is viewed (stored but not displayed)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">What We DON'T Collect</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>❌ <strong className="text-gray-300">No user accounts:</strong> This is a completely anonymous service</li>
              <li>❌ <strong className="text-gray-300">No personal information:</strong> No names, emails, or identifiers</li>
              <li>❌ <strong className="text-gray-300">No cookies:</strong> We don't use any cookies at all</li>
              <li>❌ <strong className="text-gray-300">No analytics:</strong> No Google Analytics or tracking pixels</li>
              <li>❌ <strong className="text-gray-300">No permanent storage:</strong> Everything is deleted after 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">Video delivery:</strong> To let recipients view your screen recordings</li>
              <li><strong className="text-gray-300">Rate limiting:</strong> To prevent service abuse using temporary IP data</li>
              <li><strong className="text-gray-300">Link management:</strong> To create and expire sharing links after 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Data Storage</h2>
            <p className="mb-3">We use two storage methods:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">PostgreSQL database:</strong> For link metadata and video data (if Telegram is not configured)</li>
              <li><strong className="text-gray-300">Telegram (optional):</strong> For efficient video storage via Telegram Bot API</li>
            </ul>
            <p className="mt-3 font-semibold">All data is automatically deleted after 24 hours, no exceptions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Browser Storage</h2>
            <p className="mb-3">Your browser stores:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">localStorage:</strong> List of links you've created (client-side only)</li>
              <li><strong className="text-gray-300">No server sync:</strong> This data never leaves your device</li>
              <li><strong className="text-gray-300">You control it:</strong> Clear your browser data to remove it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">Telegram Bot API (optional):</strong> Used only for storing videos efficiently</li>
              <li><strong className="text-gray-300">No other third parties:</strong> No CDNs, analytics, or external services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Security Measures</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">HTTPS only:</strong> All connections are encrypted</li>
              <li><strong className="text-gray-300">Input validation:</strong> File type and size verification</li>
              <li><strong className="text-gray-300">Rate limiting:</strong> Protection against abuse</li>
              <li><strong className="text-gray-300">Automatic cleanup:</strong> 24-hour data retention limit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Your Rights</h2>
            <p className="mb-3">Since we don't collect personal data:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>There's no personal data to access or download</li>
              <li>There's no account to delete</li>
              <li>All data automatically deletes after 24 hours</li>
              <li>You can clear your browser's localStorage anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Children's Privacy</h2>
            <p className="mb-3">
              Our service is not intended for children under 13. We don't knowingly collect any data from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Open Source Transparency</h2>
            <p className="mb-3">
              Our entire codebase is open source on GitHub. You can verify everything stated in this policy by reviewing our code directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Contact</h2>
            <p className="mb-3">
              For privacy questions or concerns:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Open an issue on our GitHub repository</li>
              <li>Review our source code for complete transparency</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">Changes to This Policy</h2>
            <p className="mb-3">
              Any changes will be reflected in our open-source repository with an updated "Last updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}