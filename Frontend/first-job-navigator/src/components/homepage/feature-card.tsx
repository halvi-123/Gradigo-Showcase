import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  background: string;
  foreground: string;
  children?: ReactNode;
};

export function FeatureCard({
  title,
  background,
  foreground,
  children,
}: FeatureCardProps) {
  return (
    <div
      style={{
        background,
        color: foreground,
        borderRadius: "var(--radius)",
        padding: 16,
        boxShadow: "0 6px 18px rgba(13,19,33,0.06)",
        border: "1px solid var(--border)",
      }}
    >
      <strong style={{ fontSize: "1rem" }}>{title}</strong>
      {children ? (
        <p style={{ marginTop: 8, marginBottom: 0, color: foreground, opacity: 0.85 }}>
          {children}
        </p>
      ) : null}
    </div>
  );
}
