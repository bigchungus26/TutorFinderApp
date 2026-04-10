// ── Sonner Toaster ─────────────────────────────────────────────
// Styled to match Tutr design system:
// - Surface bg, hairline border, shadow-float
// - Fraunces title, Inter description
// - top-center on mobile, bottom-right on desktop
// - 3s default, 5s for errors
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      className="toaster group"
      duration={3000}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "!bg-surface !border !border-hairline !shadow-float",
            "!rounded-xl !px-4 !py-3.5",
            "!text-ink",
          ].join(" "),
          title: "!font-display !text-body !font-medium !text-ink",
          description: "!font-body !text-body-sm !text-ink-muted",
          actionButton: "!bg-accent !text-accent-foreground !rounded-lg !px-4 !py-2 !text-label",
          cancelButton: "!bg-muted !text-ink-muted !rounded-lg !px-4 !py-2 !text-label",
          error: "!border-danger/30",
          success: "!border-accent/30",
        },
      }}
      {...props}
    />
  );
};

// Helper: show error toast with Supabase-friendly message
export function toastError(err: unknown, fallback = "Something went wrong. Please try again.") {
  let msg = fallback;
  if (err instanceof Error) {
    const raw = err.message;
    // Hide JWT/auth internals; show everything else (table missing, RLS denial, etc.)
    if (!raw.includes("JWT") && !raw.includes("token")) {
      msg = raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
    }
  }
  toast.error(msg, { duration: 5000 });
}

export { Toaster, toast };
