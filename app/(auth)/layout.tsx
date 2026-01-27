import { Brain } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl mb-8 hover:opacity-80 transition-opacity"
      >
        <Brain className="size-8 text-primary" />
        <span>RecallForge</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        Master LeetCode patterns with spaced repetition
      </p>
    </div>
  );
}
