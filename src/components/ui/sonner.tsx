// ── Sonner Toaster ────────────────────────────────────────────
// Part 3: Styled to match TUTR design system
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      className="toaster group"
      duration={3000}
      toastOptions={{
        classNames: {
          toast: [
            "group toast",
            "!bg-surface !border !border-border !shadow-lg",
            "!rounded-2xl !px-4 !py-3.5",
            "!text-foreground",
          ].join(" "),
          title: "!font-body !text-body !font-medium !text-foreground",
          description: "!font-body !text-body-sm !text-ink-muted",
          actionButton: "!bg-accent !text-white !rounded-xl !px-4 !py-2 !text-label",
          cancelButton: "!bg-muted !text-ink-muted !rounded-xl !px-4 !py-2 !text-label",
          error: "!border-red-200",
          success: "!border-accent/30",
        },
      }}
      {...props}
    />
  );
};

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
