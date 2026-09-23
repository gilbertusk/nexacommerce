"use client";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  isActive?: boolean;
}

interface TimelineVerticalProps {
  events: TimelineEvent[];
}

export default function TimelineVertical({ events }: TimelineVerticalProps) {
  return (
    <div className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-hairline flex flex-col gap-6">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node Icon Indicator */}
          <div
            className={`absolute -left-[20px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300 ${
              event.isActive
                ? "bg-primary border-primary scale-110 shadow-xs shadow-primary/40"
                : "bg-surface border-outline-variant"
            }`}
          />

          {/* Event Content */}
          <div className="flex flex-col">
            <h4
              className={`text-sm font-semibold transition-colors duration-300 ${
                event.isActive ? "text-primary" : "text-ink-primary"
              }`}
            >
              {event.title}
            </h4>
            {event.description && (
              <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                {event.description}
              </p>
            )}
            {event.date && (
              <span className="font-mono text-[10px] text-ink-secondary/70 mt-1 tabular-nums">
                {event.date}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
