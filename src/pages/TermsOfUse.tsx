import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-ink mb-6">
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="text-display-lg mb-2">Terms of Use</h1>
      <p className="text-sm text-muted-ink mb-8">Last updated: April 11, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-display text-lg font-medium mb-2">1. Acceptance</h2>
          <p>
            By creating an account or using TUTR, you agree to these Terms of Use and our{" "}
            <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>. If you do not
            agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">2. What TUTR Is</h2>
          <p>
            TUTR is a peer tutoring marketplace that connects university students seeking academic
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
            <li>Students must attend booked sessions or cancel within the tutor's cancellation window.</li>
            <li>All users must treat others with respect and follow our community guidelines.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">4. Payment Disclaimer</h2>
          <p>
            Session payments are made <strong>directly between students and tutors</strong> — typically
            via OMT, Whish, or cash. TUTR does not process, hold, or guarantee these payments.
            Any disputes about payment are solely between the student and the tutor.
            All prices displayed on the platform are in <strong>USD</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">5. No-Show Policy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Payment is still due</strong> if a student no-shows a session. The tutor earned
              the time regardless of whether the student attended.
            </li>
            <li>
              A no-show can be reported by either party starting at the session's scheduled start time
              and up to 24 hours after. Reporting is serious — false reports may lead to account action.
            </li>
            <li>
              After <strong>3 confirmed student no-shows</strong>, the student's account is temporarily
              suspended for 14 days.
            </li>
            <li>
              After <strong>3 confirmed tutor no-shows</strong>, the tutor's profile is hidden from
              search until they contact support.
            </li>
            <li>
              A student who cancels outside the tutor's cancellation window and then doesn't attend is
              still responsible for payment as a no-show.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">6. Cancellation Policy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Each tutor sets their own cancellation window (0–48 hours before the session).</li>
            <li>Cancellations within the tutor's deadline window require direct coordination with the tutor.</li>
            <li>TUTR does not process refunds — all payment arrangements are between the two parties.</li>
            <li>Disputes can be raised by contacting support within 48 hours of a session.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">7. Tutor Subscription Terms</h2>
          <p>
            Tutors pay <strong>$50/month</strong> to maintain an active listing on TUTR.
            Payment instructions are sent separately (via OMT or Whish).
            Failure to renew results in your profile being hidden from search after a 7-day grace period.
            Subscription status is managed manually during our early stage — you will be contacted
            regarding payment and renewal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">8. Tax Responsibility</h2>
          <p>
            You are solely responsible for declaring and paying any taxes on income earned through TUTR.
            We do not withhold, collect, or report taxes on your behalf. Please consult a local tax
            advisor regarding your obligations under Lebanese law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">9. Community Guidelines</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>No harassment.</strong> Any form of harassment, discrimination, or abusive behaviour is grounds for immediate suspension.</li>
            <li><strong>No off-platform poaching.</strong> Tutors may not use TUTR to build a client base and then direct students to pay them outside the platform long-term in order to avoid subscription fees.</li>
            <li><strong>No fake reviews.</strong> Submitting a review without having completed a legitimate session is prohibited.</li>
            <li><strong>No impersonation.</strong> Do not create accounts pretending to be another person or institution.</li>
            <li><strong>No misleading information.</strong> Tutors must represent their actual grades and credentials.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">10. Your Data Rights</h2>
          <p className="mb-2">We respect your right to control your personal data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access</strong> — request a summary of the data we hold on you.</li>
            <li><strong>Correction</strong> — update inaccurate information via your profile settings.</li>
            <li><strong>Deletion</strong> — request account deletion by contacting{" "}
              <a href="mailto:support@tutr.app" className="text-accent underline">support@tutr.app</a>.
              We'll process it within 30 days.
            </li>
            <li><strong>Export</strong> — request a copy of your data in a portable format.</li>
          </ul>
          <p className="mt-2">
            We collect the minimum data needed to run the platform: your profile, sessions, messages,
            and reviews. We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">11. Limitation of Liability</h2>
          <p>
            TUTR is provided "as is" without warranties of any kind. We are not liable for the
            quality of tutoring, academic results, or any payment disputes between users.
            Our total liability for any claim shall not exceed USD $100.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">12. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the
            Republic of Lebanon. Any disputes will be resolved in the courts of Beirut.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">13. Changes to These Terms</h2>
          <p>
            We may update these terms. If we make material changes, we'll notify you via an in-app
            banner at least 14 days before the changes take effect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-medium mb-2">14. Contact</h2>
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:support@tutr.app" className="text-accent underline">support@tutr.app</a>.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-border flex gap-4 text-xs text-muted-ink">
        <Link to="/terms" className="underline underline-offset-2 text-accent">Terms of Use</Link>
        <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default TermsOfUse;
