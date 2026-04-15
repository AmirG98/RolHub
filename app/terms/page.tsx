export default function TermsPage() {
  return (
    <div className="min-h-screen particle-bg py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-panel-dark rounded-lg p-6 md:p-10 border border-gold-dim/30">
          <h1 className="font-title text-2xl md:text-4xl text-gold mb-6">Terms of Service</h1>
          <div className="font-body text-parchment/80 space-y-4 text-sm md:text-base">
            <p><strong className="text-parchment">Last updated:</strong> April 15, 2026</p>

            <p>These Terms of Service (&quot;Terms&quot;) govern your use of RolHub, operated at rol-hub.com. By using the service, you agree to these Terms.</p>

            <h2 className="font-heading text-lg text-gold mt-6">1. Service Description</h2>
            <p>RolHub is a digital tabletop RPG platform with an autonomous AI Game Master (DM) powered by artificial intelligence. The service generates dynamic narrative content based on player actions.</p>

            <h2 className="font-heading text-lg text-gold mt-6">2. Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate information when registering</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not share your account with third parties</li>
              <li>You must be at least 13 years old to use the service</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">3. Subscription Plans & Billing</h2>
            <p>RolHub offers the following plans:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-parchment">Trial:</strong> one free session upon registration with full access to all features</li>
              <li><strong className="text-parchment">Pro (Aventurero):</strong> $8.99/month — unlimited access to all features, worlds, and game engines</li>
            </ul>

            <h3 className="font-heading text-base text-gold/80 mt-4">3.1 Billing Cycle</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Paid subscriptions are billed in advance on a recurring monthly or annual basis</li>
              <li>Your subscription automatically renews at the end of each billing period unless you cancel</li>
              <li>You will be charged on the same date each month (or year) as your initial subscription</li>
            </ul>

            <h3 className="font-heading text-base text-gold/80 mt-4">3.2 Payment Processing</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payments are processed by our third-party payment provider</li>
              <li>We do not store credit card numbers or banking details on our servers</li>
              <li>All payment processing complies with PCI-DSS security standards</li>
            </ul>

            <h3 className="font-heading text-base text-gold/80 mt-4">3.3 Cancellation</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You may cancel your subscription at any time through your account settings or the billing portal</li>
              <li>Upon cancellation, you retain access until the end of your current paid billing period</li>
              <li>Your characters, campaigns, and game data are preserved after cancellation. If you re-subscribe, you can continue where you left off</li>
            </ul>

            <h3 className="font-heading text-base text-gold/80 mt-4">3.4 Price Changes</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We may change subscription prices with at least 30 days advance notice</li>
              <li>Price changes will not affect your current billing period</li>
              <li>Continued use after the price change takes effect constitutes acceptance of the new price</li>
            </ul>

            <h3 className="font-heading text-base text-gold/80 mt-4">3.5 Failed Payments</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>If a payment fails, we will attempt to charge your payment method again</li>
              <li>After repeated failures, your subscription may be downgraded to the free tier</li>
              <li>Your game data is preserved and you can resume by updating your payment method</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">4. Refund Policy</h2>
            <p>For details on refunds, please see our <a href="/refunds" className="text-gold hover:text-gold-bright underline">Refund Policy</a>.</p>

            <h2 className="font-heading text-lg text-gold mt-6">5. Acceptable Use</h2>
            <p>You agree not to use the service to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Engage in illegal or harmful activities</li>
              <li>Attempt to exploit, hack, or reverse-engineer the system</li>
              <li>Intentionally generate offensive or abusive content</li>
              <li>Share accounts or subscription access with unauthorized users</li>
              <li>Use automated tools to access the service at scale</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">6. AI-Generated Content</h2>
            <p>Narrative content, images, and voice are generated by artificial intelligence. RolHub does not guarantee the accuracy, appropriateness, or quality of AI-generated content. Content may occasionally contain errors, inconsistencies, or unexpected outputs.</p>

            <h2 className="font-heading text-lg text-gold mt-6">7. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>RolHub owns the platform, design, and technology</li>
              <li>You own the creative input you provide (character names, descriptions, narrative choices)</li>
              <li>AI-generated content (narration, images) is provided for your personal use within the platform</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">8. Service Availability</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>The service is provided &quot;as is&quot; without warranties of uninterrupted availability</li>
              <li>We may perform maintenance or updates that temporarily affect access</li>
              <li>We do not guarantee indefinite preservation of game data, though we make reasonable efforts to maintain it</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, RolHub shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service, including but not limited to loss of game data, service interruptions, or AI-generated content.</p>

            <h2 className="font-heading text-lg text-gold mt-6">10. Termination</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We may suspend or terminate your account for violation of these Terms</li>
              <li>You may delete your account at any time by contacting us</li>
              <li>Upon termination, your right to use the service ceases immediately</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">11. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. We will notify users of material changes via email or in-app notification. Continued use of the service after changes constitutes acceptance.</p>

            <h2 className="font-heading text-lg text-gold mt-6">12. Contact</h2>
            <p>For questions about these Terms: <span className="text-gold">amir@amirgomez.com</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
