import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-ink mb-6">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="font-display text-[28px] leading-tight font-medium mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-ink mb-8">Last updated: April 10, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-display text-lg font-medium mb-2">1. Who We Are</h2>
          <p>
            Tutr is a peer tutoring platform connecting students and tutors at Lebanese universities
            (AUB, LAU, NDU). If you have questions about this policy, contact us at{" "}
            <a href="mailto:privacy@teachme.app" className="text-accent underline">privacy@teachme.app</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">2. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> name, email address, university, major, year of study, and role (student or tutor).</li>
            <li><strong>Profile data:</strong> bio, courses taught, hourly rate, avatar image, and verified status (tutors only).</li>
            <li><strong>Usage data:</strong> pages visited, search queries, session booking history, and app interaction logs.</li>
            <li><strong>Communications:</strong> messages sent between students and tutors through the platform.</li>
            <li><strong>Payment data:</strong> transaction amounts and dates. Full payment card details are processed by our payment processor and never stored on our servers.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">3. Why We Collect It</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account &amp; profile data:</strong> to create and maintain your account, match you with tutors or students, and display your profile.</li>
            <li><strong>Usage data:</strong> to improve the platform, personalize recommendations, and diagnose technical issues.</li>
            <li><strong>Communications:</strong> to facilitate tutor–student coordination and enforce community standards.</li>
            <li><strong>Payment data:</strong> to process transactions and issue payouts to tutors.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">4. Retention</h2>
          <p>
            We retain your account data for as long as your account is active. Usage logs are kept for
            12 months. Payment records are retained for 7 years to comply with financial regulations.
            After account deletion, personal data is purged within 30 days, except where retention is
            required by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">5. Who We Share Data With</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Payment processor:</strong> Stripe — to process payments and payouts.</li>
            <li><strong>Hosting:</strong> Vercel — for application hosting and CDN delivery.</li>
            <li><strong>Database:</strong> Supabase — for data storage and authentication.</li>
            <li><strong>Email:</strong> Resend — for transactional emails (confirmations, receipts).</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal data. We do not use third-party tracking or analytics pixels.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">6. Your Rights (GDPR &amp; CCPA)</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Correct</strong> — update or fix inaccurate data.</li>
            <li><strong>Delete</strong> — request erasure of your personal data.</li>
            <li><strong>Export</strong> — receive your data in a portable, machine-readable format.</li>
            <li><strong>Withdraw consent</strong> — opt out of data processing at any time.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@teachme.app" className="text-accent underline">privacy@teachme.app</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">7. Cookies</h2>
          <p>
            We use only essential session cookies to keep you logged in. We do not use tracking cookies,
            advertising cookies, or third-party cookie-based analytics.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">8. Security</h2>
          <p>
            All traffic is encrypted via TLS. Passwords are hashed using bcrypt. Our database is hosted
            in a secure, access-controlled environment with regular backups. We follow industry-standard
            security practices to protect your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. If we make material changes, we will notify you
            via email or an in-app notice at least 14 days before the changes take effect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">10. Contact</h2>
          <p>
            For any privacy-related questions or requests, contact us at{" "}
            <a href="mailto:privacy@teachme.app" className="text-accent underline">privacy@teachme.app</a>.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-hairline flex gap-4 text-xs text-muted-ink">
        <Link to="/terms" className="underline underline-offset-2">Terms of Use</Link>
        <Link to="/privacy" className="underline underline-offset-2 text-accent">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
