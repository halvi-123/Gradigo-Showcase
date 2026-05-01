import Link from "next/link";

type HeroSectionProps = {
  isMobile: boolean;
  onContactClick: () => void;
};

export function HeroSection({ isMobile, onContactClick }: HeroSectionProps) {
  return (
    <section style={{ padding: isMobile ? 8 : 18 }}>
      <img
        src="/sidebar-logo.svg"
        alt="Gradigo logo"
        width={isMobile ? 92 : 120}
        height={isMobile ? 92 : 120}
        style={{ display: "block", margin: isMobile ? "0 auto 18px" : "0 0 18px" }}
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
        All the essential financial tools for young people entering the workforce, including helpful
        tax information, budget planning, move-out checks and learning resources.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/salary-calculator" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "12px 22px",
              fontSize: "1rem",
              borderRadius: 10,
              border: "none",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(29,45,68,0.12)",
            }}
          >
            Explore App
          </button>
        </Link>
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
