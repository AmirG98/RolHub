export default function RefundsPage() {
  return (
    <div className="min-h-screen particle-bg py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-panel-dark rounded-lg p-6 md:p-10 border border-gold-dim/30">
          <h1 className="font-title text-2xl md:text-4xl text-gold mb-6">Refund Policy</h1>
          <div className="font-body text-parchment/80 space-y-4 text-sm md:text-base">
            <p><strong className="text-parchment">Last updated:</strong> April 15, 2026</p>

            <p>We want you to be satisfied with RolHub. This Refund Policy explains when and how you can request a refund for your subscription.</p>

            <h2 className="font-heading text-lg text-gold mt-6">1. Trial Session</h2>
            <p>Every new user receives one free session with full access to all features — no credit card required. We encourage you to use this trial to evaluate the service before subscribing.</p>

            <h2 className="font-heading text-lg text-gold mt-6">2. Refund Eligibility</h2>
            <p>You may request a full refund of your most recent payment if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You request the refund within <strong className="text-parchment">7 days</strong> of the charge</li>
              <li>You have not used the service extensively during that billing period (generally fewer than 5 sessions)</li>
            </ul>
            <p>Refunds are evaluated on a case-by-case basis. We aim to be fair and reasonable.</p>

            <h2 className="font-heading text-lg text-gold mt-6">3. How to Request a Refund</h2>
            <p>To request a refund, contact us at <span className="text-gold">amir@amirgomez.com</span> with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your account email address</li>
              <li>The date of the charge</li>
              <li>The reason for your refund request</li>
            </ul>
            <p>We will respond within 3 business days. If approved, the refund will be processed to your original payment method within 5-10 business days, depending on your bank.</p>

            <h2 className="font-heading text-lg text-gold mt-6">4. Non-Refundable Situations</h2>
            <p>Refunds are generally not provided in the following cases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Requests made more than 7 days after the charge</li>
              <li>Extensive use of the service during the billing period</li>
              <li>Account suspension or termination due to violation of Terms of Service</li>
              <li>Partial billing periods (e.g., if you cancel mid-month, you retain access until the end of the period but are not refunded for remaining days)</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">5. Cancellation vs. Refund</h2>
            <p>Cancellation and refunds are separate:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-parchment">Cancellation:</strong> stops future charges. You keep access until the end of your paid period. Your game data is preserved.</li>
              <li><strong className="text-parchment">Refund:</strong> reverses a past charge. If a refund is granted, your subscription may be terminated immediately.</li>
            </ul>
            <p>To cancel without requesting a refund, use the billing portal in your account settings. You will retain access to all features until your current period ends.</p>

            <h2 className="font-heading text-lg text-gold mt-6">6. Disputed Charges</h2>
            <p>If you see an unrecognized charge from RolHub, please contact us at <span className="text-gold">amir@amirgomez.com</span> before filing a dispute with your bank. We can usually resolve billing issues faster than the dispute process.</p>

            <h2 className="font-heading text-lg text-gold mt-6">7. Contact</h2>
            <p>For refund requests or billing questions: <span className="text-gold">amir@amirgomez.com</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
