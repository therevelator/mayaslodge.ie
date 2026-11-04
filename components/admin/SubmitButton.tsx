"use client";

import { useFormStatus } from "react-dom";

// A form submit button that shows it's working and can't be double-clicked.
export function SubmitButton({
  children,
  pendingText = "…",
  className = "",
  title,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      title={title}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
