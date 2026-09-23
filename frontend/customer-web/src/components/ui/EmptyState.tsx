"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-surface hairline rounded-sm max-w-md mx-auto my-8">
      {/* Icon Frame */}
      <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center text-ink-secondary mb-6">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>

      {/* Texts */}
      <h3 className="font-serif text-2xl text-ink-primary mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-secondary leading-relaxed mb-6">
        {description}
      </p>

      {/* Optional Call to Action */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-sm transition-colors cursor-pointer"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
