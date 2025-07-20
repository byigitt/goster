import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-green-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">1. Service Overview</h2>
            <p className="mb-3">
              göster is a free, open-source, anonymous screen recording sharing service. By using this service, you agree to these terms.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>No registration required - completely anonymous</li>
              <li>All content is temporary (24-hour retention)</li>
              <li>Open source under MIT License</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">2. Acceptable Use</h2>
            <p className="mb-3">You agree to use göster only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Upload illegal, harmful, or offensive content</li>
              <li>Share copyrighted material without permission</li>
              <li>Attempt to circumvent rate limits or security measures</li>
              <li>Use the service to harass, harm, or invade privacy</li>
              <li>Upload malware or malicious content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">3. Service Limitations</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li><strong className="text-gray-300">Video size:</strong> Maximum 100MB per upload</li>
              <li><strong className="text-gray-300">Duration:</strong> Maximum 10 minutes per recording</li>
              <li><strong className="text-gray-300">Formats:</strong> WebM, MP4, or OGG only</li>
              <li><strong className="text-gray-300">Retention:</strong> All content deleted after 24 hours</li>
              <li><strong className="text-gray-300">Rate limits:</strong> 10 links/minute, 5 uploads/minute</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">4. Anonymous Service</h2>
            <p className="mb-3">
              göster is designed for privacy:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>No user accounts or registration</li>
              <li>No personal information collected</li>
              <li>No tracking or analytics</li>
              <li>IP addresses used only for rate limiting (temporary)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">5. Content Ownership</h2>
            <p className="mb-3">
              You retain all rights to content you upload. By using göster, you grant us a limited license to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Store your video temporarily (24 hours maximum)</li>
              <li>Transmit the video to recipients you share it with</li>
              <li>Delete the video after 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">6. Privacy and Data</h2>
            <p className="mb-3">
              Your privacy is protected by design:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>See our Privacy Policy for detailed information</li>
              <li>All data automatically deleted after 24 hours</li>
              <li>No cookies or persistent tracking</li>
              <li>Open source code for full transparency</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">7. Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Service provided "as is" without warranties</li>
              <li>We are not responsible for user-generated content</li>
              <li>No guarantee of availability or uptime</li>
              <li>You use the service at your own risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">8. Limitation of Liability</h2>
            <p className="mb-3">
              To the maximum extent permitted by law, we shall not be liable for any damages arising from your use of this service, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">9. Service Modifications</h2>
            <p className="mb-3">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Modify or discontinue the service at any time</li>
              <li>Update these terms as needed</li>
              <li>Change technical limitations (size, duration, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">10. Open Source License</h2>
            <p className="mb-3">
              göster is open source software licensed under the MIT License. You are free to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Use, copy, modify, and distribute the software</li>
              <li>Host your own instance of göster</li>
              <li>Contribute to the project on GitHub</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">11. Contact</h2>
            <p className="mb-3">
              For questions, concerns, or issues:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
              <li>Open an issue on our GitHub repository</li>
              <li>Contribute to the project</li>
              <li>Fork and modify for your needs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">12. Agreement</h2>
            <p className="mb-3">
              By using göster, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}