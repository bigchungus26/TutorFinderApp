import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-ink mb-6">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="text-display-lg mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-ink mb-8">Last updated: April 11, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-display text-lg font-medium mb-2">1. Who We Are</h2>
          <p>
            TUTR is a peer tutoring platform connecting students and tutors at Lebanese universities
            (AUB, LAU, NDU). If you have questions about this policy, contact us at{" "}
            <a href="mailto:privacy@tutr.app" className="text-accent underline">privacy@tutr.app</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">2. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> name, email address, university, major, year of study, and role (student or tutor).</li>
            <li><strong>Profile data:</strong> bio, courses, hourly rate, avatar, verification status, and availability schedule (tutors).</li>
            <li><strong>Session data:</strong> booking history, session dates/times, locations, prices, and completion status.</li>
            <li><strong>Messages:</strong> conversations between students and tutors within the platform.</li>
            <li><strong>Reviews:</strong> ratings and comments left after completed sessions.</li>
            <li><strong>Notifications:</strong> alerts sent to users about sessions, messages, and platform activity.</li>
            <li><strong>Support tickets:</strong> messages you send to our support team.</li>
            <li><strong>Usage data:</strong> page visits, search queries, and profile views (tutors can see how many times their profile was viewed).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">3. Why We Collect It</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>To run the service:</strong> match students with tutors, enable booking, and show relevant search results.</li>
            <li><strong>To communicate:</strong> facilitate student–tutor messaging and send session-related notifications.</li>
            <li><strong>To improve safety:</strong> detect abuse, process no-show reports, and enforce community guidelines.</li>
            <li><strong>To improve the product:</strong> understand how users interact with features and fix issues.</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> process payments. All session fees are settled directly between students and tutors.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">4. Your Data Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access</strong> — request a summary of everything we hold about you.</li>
            <li><strong>Correct</strong> — update or fix inaccurate data via your profile settings.</li>
            <li><strong>Delete</strong> — request full erasure of your account and associated data.
              Email <a href="mailto:privacy@tutr.app" className="text-accent underline">privacy@tutr.app</a> with
              the subject "Delete my account". We process deletion requests within 30 days.</li>
            <li><strong>Export</strong> — receive a copy of your data in a portable format (JSON). Email
              us to request an export.</li>
            <li><strong>Withdraw consent</strong> — you can delete your account at any time to stop all processing.</li>
          </ul>
          <p className="mt-2">
            These rights are aligned with GDPR principles. We will respond to any request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">5. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account and profile data: retained while your account is active.</li>
            <li>Session history: retained for 3 years to support dispute resolution.</li>
            <li>Messages: retained for 12 months, then anonymised.</li>
            <li>After account deletion, personal data is purged within 30 days, except where retention is required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">6. Who We Share Data With</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — database, authentication, and real-time services.</li>
            <li><strong>Vercel</strong> — application hosting.</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell your personal data. We do not use third-party advertising
            or tracking pixels.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">7. Cookies</h2>
          <p>
            We use only essential session cookies required to keep you logged in. We do not use
            tracking cookies, advertising cookies, or third-party analytics cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">8. Security</h2>
          <p>
            All traffic is encrypted via TLS. Authentication tokens are managed securely by Supabase.
            We follow industry-standard practices to protect your data. In the event of a data breach
            affecting your personal data, we will notify you within 72 hours.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">9. Lebanese Governing Law</h2>
          <p>
            This policy and any disputes arising from it are governed by the laws of the
            Republic of Lebanon. Any disputes will be resolved in the courts of Beirut.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. If we make material changes, we will notify
            you via an in-app notice at least 14 days before the changes take effect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">11. Contact</h2>
          <p>
            For any privacy-related questions or requests, contact us at{" "}
            <a href="mailto:privacy@tutr.app" className="text-accent underline">privacy@tutr.app</a>.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-border flex gap-4 text-xs text-muted-ink">
        <Link to="/terms" className="underline underline-offset-2">Terms of Use</Link>
        <Link to="/privacy" className="underline underline-offset-2 text-accent">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
