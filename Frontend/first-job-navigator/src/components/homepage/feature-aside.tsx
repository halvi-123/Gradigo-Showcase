import { FeatureCard } from "@/components/homepage/feature-card";

export function FeatureAside() {
  return (
    <aside style={{ display: "grid", gap: 12 }}>
      <FeatureCard
        title="Salary calculator"
        background="var(--primary)"
        foreground="var(--primary-foreground)"
      >
        Find out your take-home pay and work out your taxable income.
      </FeatureCard>
      <FeatureCard
        title="Budget planner"
        background="var(--accent)"
        foreground="var(--accent-foreground)"
      >
        Build and track your daily/weekly/monthly budgets.
      </FeatureCard>
      <FeatureCard
        title="Move-out readiness"
        background="var(--secondary)"
        foreground="var(--secondary-foreground)"
      >
        Are you eligible to move out and find a new place? Find out here!
      </FeatureCard>
      <FeatureCard
        title="Pension calculator"
        background="var(--muted)"
        foreground="var(--foreground)"
      >
        Project future pension contributions and outcomes based on your salary and retirement plans.
      </FeatureCard>
      <FeatureCard
        title="Learning hub"
        background="var(--card)"
        foreground="var(--card-foreground)"
      >
        Featured articles, videos, quizzes and more to help you navigate your first job and financial wellness.
      </FeatureCard>
    </aside>
  );
}
