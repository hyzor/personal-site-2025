import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-default-500">
        404
      </p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="max-w-md text-default-500">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        className="mt-2 rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        href="/"
      >
        Back home
      </Link>
    </div>
  );
}
