"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type HeroSectionProps = {
  isMobile: boolean;
  onContactClick: () => void;
};

export function HeroSection({ isMobile, onContactClick }: HeroSectionProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleExploreApp = () => {
    setIsLeaving(true);

    setTimeout(() => {
      router.push("/salary-calculator");
    }, 450);
  };

  return (
    <section
      style={{
        padding: isMobile ? 8 : 18,
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? "translateY(-12px) scale(0.98)" : "translateY(0) scale(1)",
        transition: "opacity 450ms ease, transform 450ms ease",
      }}
    >
      <img
        src="/sidebar-logo.svg"
        alt="Gradigo logo"
        width={isMobile ? 92 : 120}
        height={isMobile ? 92 : 120}
        style={{
          display: "block",
          margin: isMobile ? "0 auto 18px" : "0 0 18px",
        }}
      />

      <h1
        style={{
          margin: 0,
          fontSize: isMobile ? "2rem" : "2.4rem",
          color: "var(--foreground)",
          lineHeight: 1.05,
        }}
      >
        Welcome to Gradigo
      </h1>

      <p
        style={{
          marginTop: 12,
          marginBottom: 20,
          color: "var(--muted-foreground)",
          fontSize: "1.05rem",
        }}
      >
        All the essential financial tools for young people entering the workforce,
        including helpful tax information, budget planning, move-out checks and
        learning resources.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={handleExploreApp}
          disabled={isLeaving}
          style={{
            padding: "12px 22px",
            fontSize: "1rem",
            borderRadius: 10,
            border: "none",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            cursor: isLeaving ? "default" : "pointer",
            boxShadow: "0 8px 24px rgba(29,45,68,0.12)",
          }}
        >
          {isLeaving ? "Opening..." : "Explore App"}
        </button>

        <button
          onClick={onContactClick}
          aria-label="Contact the team"
          style={{
            padding: "12px 18px",
            fontSize: "1rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
          }}
        >
          Contact the Team
        </button>
      </div>
    </section>
  );
}