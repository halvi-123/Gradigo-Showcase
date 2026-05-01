type ContactTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactTeamModal({ isOpen, onClose }: ContactTeamModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 19, 33, 0.52)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact Team Sharkey"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: "var(--radius)",
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          boxShadow: "0 16px 44px rgba(13, 19, 33, 0.22)",
          padding: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Contact the Team</h2>
        <p style={{ marginTop: 10, marginBottom: 0, color: "var(--muted-foreground)" }}>
          If you have any questions or need assistance, please contact Team Sharkey from our COM2042 module through
          Teams or email us by finding our email IDs in the `Groups` tab on SurreyLearn!
        </p>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
