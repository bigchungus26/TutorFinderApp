import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-ink mb-6">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="font-display text-[28px] leading-tight font-medium mb-2">Terms of Use</h1>
      <p className="text-sm text-muted-ink mb-8">Last updated: April 10, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-display text-lg font-medium mb-2">1. Acceptance</h2>
          <p>
            By creating an account or using Tutr, you agree to these Terms of Use and our{" "}
            <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>. If you do not
            agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">2. What the Service Is</h2>
          <p>
            Tutr is a peer tutoring marketplace that connects university students seeking academic
            help with fellow students who have excelled in specific courses. We facilitate the
            connection — we are not the tutor and do not guarantee academic outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">3. User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must provide accurate information during registration.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>Tutors must accurately represent their qualifications and course grades.</li>
            <li>Students must attend booked sessions or cancel within the cancellation window.</li>
            <li>All users must treat others with respect and follow our community guidelines.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">4. Payment &amp; Billing</h2>
          <p>
            Tutors set their own hourly rates. Payment is collected from students at the time of booking
            and held until the session is completed. Tutors receive payouts after session completion,
            minus the platform service fee. All prices are displayed in USD.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">5. Cancellation &amp; Refunds</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Students may cancel a session up to 2 hours before the scheduled time for a full refund.</li>
            <li>Cancellations within 2 hours of the session are non-refundable.</li>
            <li>If a tutor cancels, the student receives a full refund automatically.</li>
            <li>Disputes can be raised within 48 hours of a completed session by contacting support.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">6. Limitation of Liability</h2>
          <p>
            Tutr is provided "as is" without warranties of any kind. We are not liable for the
            quality of tutoring, academic results, or any disputes between users. Our total liability
            to you for any claim arising from or related to these Terms shall not exceed the greater of
            (a) the amount you paid us in the 12 months preceding the claim, or (b) USD $100.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Scrape, crawl, or automatically extract data from the platform.</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the application.</li>
            <li>Use the platform for any unlawful purpose.</li>
            <li>Attempt to access other users' accounts or private data.</li>
            <li>Circumvent the platform's payment system to avoid service fees.</li>
            <li>Post false reviews or misleading profile information.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">8. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for violations of these Terms, with or
            without notice. You may delete your account at any time through your profile settings or by
            emailing <a href="mailto:support@teachme.app" className="text-accent underline">support@teachme.app</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of Lebanon. Any disputes shall be resolved in the
            courts of Beirut, Lebanon.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">10. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:support@teachme.app" className="text-accent underline">support@teachme.app</a>.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-hairline flex gap-4 text-xs text-muted-ink">
        <Link to="/terms" className="underline underline-offset-2 text-accent">Terms of Use</Link>
        <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default TermsOfUse;
