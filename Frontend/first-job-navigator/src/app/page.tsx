"use client";

import { useState } from "react";
import { ContactTeamModal } from "@/components/homepage/contact-team-modal";
import { FeatureAside } from "@/components/homepage/feature-aside";
import { HeroSection } from "@/components/homepage/hero-section";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const isMobile = useIsMobile(767);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 18 : 32,
        background: "linear-gradient(180deg, var(--background), #ffffff)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr min(420px,40%)",
          gap: isMobile ? 16 : 28,
          alignItems: "center",
        }}
      >
        <HeroSection
          isMobile={isMobile}
          onContactClick={() => setIsContactModalOpen(true)}
        />

        <FeatureAside />
      </div>

      <ContactTeamModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </main>
  );
}