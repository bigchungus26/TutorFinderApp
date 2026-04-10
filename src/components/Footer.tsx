import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <div className="px-6 py-4 border-t border-hairline flex items-center justify-center gap-4 text-xs text-muted-ink">
      <Link to="/privacy" className="underline underline-offset-2 hover:text-accent transition-colors">
        Privacy Policy
      </Link>
      <span>&middot;</span>
      <Link to="/terms" className="underline underline-offset-2 hover:text-accent transition-colors">
        Terms of Use
      </Link>
    </div>
  );
};
