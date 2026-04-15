export default function PrivacyPage() {
  return (
    <div className="min-h-screen particle-bg py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-panel-dark rounded-lg p-6 md:p-10 border border-gold-dim/30">
          <h1 className="font-title text-2xl md:text-4xl text-gold mb-6">Privacy Policy</h1>
          <div className="font-body text-parchment/80 space-y-4 text-sm md:text-base">
            <p><strong className="text-parchment">Last updated:</strong> April 15, 2026</p>

            <p>RolHub (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website rol-hub.com. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>

            <h2 className="font-heading text-lg text-gold mt-6">1. Information We Collect</h2>
            <p>We collect the following information when you use our service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-parchment">Account information:</strong> username, email address (provided during registration via Clerk)</li>
              <li><strong className="text-parchment">Game data:</strong> character details, campaign progress, session history, narrative decisions</li>
              <li><strong className="text-parchment">Payment information:</strong> when you subscribe, payment is processed by our payment provider. We store a customer identifier and subscription status, but we never store credit card numbers, CVVs, or full card details on our servers</li>
              <li><strong className="text-parchment">Usage data:</strong> session count, turns played, feature usage (for service improvement)</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">2. How We Use Your Information</h2>
            <p>We use your information exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the RPG game service</li>
              <li>Save your characters, campaigns, and game progress</li>
              <li>Process subscription payments and manage your account</li>
              <li>Send transactional emails (payment confirmations, account updates)</li>
              <li>Improve the game experience and fix issues</li>
            </ul>
            <p>We do <strong className="text-parchment">not</strong> use your information for advertising or sell it to third parties.</p>

            <h2 className="font-heading text-lg text-gold mt-6">3. Third-Party Services</h2>
            <p>We use the following third-party services to operate RolHub:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-parchment">Clerk</strong> — authentication and user management</li>
              <li><strong className="text-parchment">Supabase</strong> — database and storage</li>
              <li><strong className="text-parchment">Anthropic (Claude)</strong> — AI narration engine</li>
              <li><strong className="text-parchment">Fal.ai</strong> — AI image generation</li>
              <li><strong className="text-parchment">Payment processor</strong> — subscription billing (credit card data is handled entirely by the payment processor and never touches our servers)</li>
              <li><strong className="text-parchment">Vercel</strong> — hosting</li>
            </ul>
            <p>Each third-party service processes data according to their own privacy policies. We only share the minimum data necessary for each service to function.</p>

            <h2 className="font-heading text-lg text-gold mt-6">4. Payment Data</h2>
            <p>When you subscribe to a paid plan:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payment processing is handled by our payment provider</li>
              <li>We store only: customer ID, subscription ID, plan type, and expiration date</li>
              <li>We <strong className="text-parchment">never</strong> have access to your full card number, CVV, or banking details</li>
              <li>Payment data is encrypted in transit and at rest by the payment processor</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account and game data is retained as long as your account is active</li>
              <li>If you cancel your subscription, your game data (characters, campaigns) is preserved so you can resume if you re-subscribe</li>
              <li>If you request account deletion, all personal data and game data is permanently deleted within 30 days</li>
              <li>Payment transaction records may be retained for up to 7 years for legal and tax compliance</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">6. Security</h2>
            <p>We protect your information with industry-standard security practices including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted database connections</li>
              <li>Authentication via Clerk (OAuth, no passwords stored by us)</li>
              <li>Payment data handled exclusively by PCI-DSS compliant payment processors</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and all associated data</li>
              <li>Cancel your subscription at any time</li>
              <li>Export your game data upon request</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>

            <h2 className="font-heading text-lg text-gold mt-6">9. Children</h2>
            <p>RolHub is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us for removal.</p>

            <h2 className="font-heading text-lg text-gold mt-6">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of material changes via email or in-app notification. Continued use of the service after changes constitutes acceptance.</p>

            <h2 className="font-heading text-lg text-gold mt-6">11. Contact</h2>
            <p>For privacy inquiries or data requests: <span className="text-gold">amir@amirgomez.com</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
