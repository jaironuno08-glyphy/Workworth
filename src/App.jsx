ings size={18} />}
      >
        <button style={styles.darkBtnWide} onClick={resetShift}>
          <RotateCcw size={18} />
          Reset Current Shift
        </button>
        <button style={styles.resetBtnWide} onClick={resetAll}>
          <RotateCcw size={18} />
          Reset Everything
        </button>
      </PageShell>
    );
  }

  function PageShell({ title, subtitle, icon, children }) {
    return (
      <div style={styles.pageWrap}>
        <div style={styles.pageHeader}>
          <div style={styles.pageTitleRow}>
            <span style={styles.iconBadge}>{icon}</span>
            <div>
              <div style={styles.pageTitle}>{title}</div>
              <div style={styles.pageSubtitle}>{subtitle}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14 }}>{children}</div>
      </div>
    );
  }

  function BigStat({ label, value, suffix = "", glow = false }) {
    return (
      <div style={{ ...styles.bigStat, ...(glow ? styles.glowCard : {}) }}>
        <div style={styles.bigStatLabel}>{label}</div>
        <div style={glow ? styles.glowBigValue : styles.bigStatValue}>
          {value}
          {suffix}
        </div>
      </div>
    );
  }

  function TwoCol({ left, right }) {
    return (
      <div style={styles.twoCol}>
        <div style={styles.smallStat}>
          <div style={styles.smallLabel}>{left.label}</div>
          <div style={styles.smallValue}>{left.value}</div>
        </div>
        <div style={styles.smallStat}>
          <div style={styles.smallLabel}>{right.label}</div>
          <div style={styles.smallValue}>{right.value}</div>
        </div>
      </div>
    );
  }

  function renderPage() {
    switch (page) {
      case "home":
        return <HomePage />;
      case "live":
        return <LivePage />;
      case "coins":
        return <CoinsPage />;
      case "tax":
        return <TaxPage />;
      case "weekly":
        return <WeeklyPage />;
      case "lifetime":
        return <LifetimePage />;
      case "profile":
        return <ProfilePage />;
      case "schedule":
        return <SchedulePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  }

  return (
    <div style={styles.app}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; background: #030816; }
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        button, input { font: inherit; }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 rgba(57,255,136,0.0), 0 0 20px rgba(57,255,136,0.18); }
          50% { box-shadow: 0 0 12px rgba(57,255,136,0.24), 0 0 34px rgba(57,255,136,0.18); }
          100% { box-shadow: 0 0 0 rgba(57,255,136,0.0), 0 0 20px rgba(57,255,136,0.18); }
        }
        @keyframes floaty {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.shell}>
        {renderPage()}
        <nav style={styles.bottomNav}>
          <NavBtn
            active={page === "home"}
            icon={<Home size={18} />}
            label="Home"
            onClick={() => setPage("home")}
          />
          <NavBtn
            active={page === "live"}
            icon={<DollarSign size={18} />}
            label="Live"
            onClick={() => setPage("live")}
          />
          <NavBtn
            active={page === "coins"}
            icon={<Coins size={18} />}
            label="Coins"
            onClick={() => setPage("coins")}
          />
          <NavBtn
            active={page === "profile"}
            icon={<User size={18} />}
            label="Profile"
            onClick={() => setPage("profile")}
          />
          <NavBtn
            active={page === "settings"}
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => setPage("settings")}
          />
        </nav>
      </div>
    </div>
  );
}

function NavBtn({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.navBtn,
        ...(active ? styles.navBtnActive : {}),
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function App() {
  return <AppInner />;
}

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(14,79,255,0.18), transparent 30%), radial-gradient(circle at top right, rgba(57,255,136,0.10), transparent 26%), linear-gradient(180deg, #020611 0%, #041127 55%, #07152d 100%)",
    color: "#eef7ff",
    position: "relative",
    overflow: "hidden",
  },
  bgGlowOne: {
    position: "fixed",
    top: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: "999px",
    background: "rgba(0, 102, 255, 0.14)",
    filter: "blur(70px)",
    pointerEvents: "none",
  },
  bgGlowTwo: {
    position: "fixed",
    right: -100,
    top: 120,
    width: 240,
    height: 240,
    borderRadius: "999px",
    background: "rgba(57,255,136, 0.10)",
    filter: "blur(70px)",
    pointerEvents: "none",
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "16px 16px 92px",
    position: "relative",
    zIndex: 2,
  },
  pageWrap: {
    display: "grid",
    gap: 16,
  },
  hero: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 18,
    padding: 18,
    borderRadius: 24,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.95), rgba(5,13,31,0.92))",
    boxShadow: "0 14px 50px rgba(0,0,0,0.30)",
  },
  brand: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  heroTag: {
    marginTop: 8,
    display: "inline-block",
    background: "rgba(57,255,136,0.14)",
    color: "#70ffab",
    border: "1px solid rgba(57,255,136,0.28)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  heroName: {
    marginTop: 10,
    fontSize: 15,
    color: "#9db2d9",
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  progressText: {
    display: "grid",
    gap: 6,
  },
  progressLabel: {
    color: "#9db2d9",
    fontSize: 13,
  },
  progressMoney: {
    fontSize: 24,
    fontWeight: 800,
    color: "#f1fbff",
  },
  liveStrip: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    padding: 18,
    borderRadius: 22,
    background:
      "linear-gradient(180deg, rgba(6,14,36,0.94), rgba(6,18,42,0.90))",
    border: "1px solid rgba(57,255,136,0.12)",
    animation: "pulseGlow 3.2s ease-in-out infinite",
  },
  liveLeft: {
    display: "grid",
    gap: 6,
  },
  liveLabel: {
    fontSize: 13,
    color: "#8ea5cf",
  },
  liveMoney: {
    fontSize: 36,
    fontWeight: 900,
    color: "#6bff9b",
    textShadow: "0 0 18px rgba(57,255,136,0.28)",
    letterSpacing: "-0.04em",
  },
  liveSub: {
    color: "#9db2d9",
    fontSize: 13,
  },
  liveButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  card: {
    padding: 16,
    borderRadius: 22,
    border: "1px solid rgba(92, 124, 255, 0.18)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.92), rgba(6,16,39,0.92))",
    color: "#eef7ff",
    textAlign: "left",
    boxShadow: "0 12px 34px rgba(0,0,0,0.22)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    minHeight: 134,
  },
  glowCard: {
    border: "1px solid rgba(57,255,136,0.22)",
    boxShadow:
      "0 12px 34px rgba(0,0,0,0.26), 0 0 18px rgba(57,255,136,0.10)",
    animation: "floaty 3.6s ease-in-out infinite",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(57,255,136,0.12)",
    color: "#73ffae",
    border: "1px solid rgba(57,255,136,0.18)",
  },
  cardTitle: {
    color: "#d8e8ff",
    fontSize: 13,
    fontWeight: 700,
  },
  cardValue: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  glowValue: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: 900,
    color: "#6bff9b",
    textShadow: "0 0 16px rgba(57,255,136,0.24)",
    letterSpacing: "-0.04em",
  },
  cardSub: {
    marginTop: 8,
    color: "#9bb1d6",
    fontSize: 13,
    lineHeight: 1.4,
  },
  pageHeader: {
    padding: 18,
    borderRadius: 22,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.95), rgba(5,13,31,0.92))",
  },
  pageTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  pageSubtitle: {
    color: "#9db2d9",
    marginTop: 4,
    fontSize: 13,
  },
  bigStat: {
    padding: 18,
    borderRadius: 22,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.92), rgba(6,16,39,0.92))",
  },
  bigStatLabel: {
    color: "#9bb1d6",
    fontSize: 13,
  },
  bigStatValue: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  glowBigValue: {
    marginTop: 10,
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color: "#6bff9b",
    textShadow: "0 0 18px rgba(57,255,136,0.24)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },
  smallStat: {
    padding: 16,
    borderRadius: 20,
    border: "1px solid rgba(96, 140, 255, 0.16)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.86), rgba(6,16,39,0.86))",
  },
  smallLabel: {
    color: "#9bb1d6",
    fontSize: 13,
  },
  smallValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  sectionBox: {
    padding: 16,
    borderRadius: 20,
    border: "1px solid rgba(96, 140, 255, 0.16)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.86), rgba(6,16,39,0.86))",
    display: "grid",
    gap: 10,
  },
  inputLabel: {
    color: "#cfe0ff",
    fontSize: 13,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 16,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background: "rgba(4, 11, 26, 0.95)",
    color: "#eef7ff",
    outline: "none",
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  neonBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(57,255,136,0.28)",
    background: "linear-gradient(180deg, #1cff7d, #11cf5f)",
    color: "#03110a",
    fontWeight: 800,
    padding: "13px 16px",
    borderRadius: 16,
    cursor: "pointer",
    boxShadow: "0 0 22px rgba(57,255,136,0.22)",
  },
  neonBtnAlt: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(57,255,136,0.16)",
    background: "rgba(57,255,136,0.12)",
    color: "#7dffb3",
    fontWeight: 800,
    padding: "13px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  darkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background: "rgba(7, 18, 42, 0.95)",
    color: "#dbe8ff",
    fontWeight: 700,
    padding: "13px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  darkBtnWide: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background: "rgba(7, 18, 42, 0.95)",
    color: "#dbe8ff",
    fontWeight: 700,
    padding: "14px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  bankBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(57,255,136,0.28)",
    background: "linear-gradient(180deg, #0d63ff, #0a49c7)",
    color: "#eff6ff",
    fontWeight: 800,
    padding: "13px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  bankBtnWide: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    border: "1px solid rgba(57,255,136,0.20)",
    background: "linear-gradient(180deg, #0d63ff, #0a49c7)",
    color: "#eff6ff",
    fontWeight: 800,
    padding: "14px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  resetBtnWide: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    border: "1px solid rgba(255,90,90,0.22)",
    background: "rgba(72, 10, 18, 0.92)",
    color: "#ffb6b6",
    fontWeight: 700,
    padding: "14px 16px",
    borderRadius: 16,
    cursor: "pointer",
  },
  scheduleRow: {
    display: "grid",
    gridTemplateColumns: "68px 1fr auto 1fr",
    gap: 10,
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(96, 140, 255, 0.16)",
    background:
      "linear-gradient(180deg, rgba(8,20,48,0.86), rgba(6,16,39,0.86))",
  },
  scheduleDay: {
    fontWeight: 800,
    color: "#eff6ff",
  },
  scheduleInput: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(96, 140, 255, 0.18)",
    background: "rgba(4, 11, 26, 0.95)",
    color: "#eef7ff",
    outline: "none",
  },
  toText: {
    color: "#89a4d3",
    fontSize: 13,
    fontWeight: 700,
  },
  bottomNav: {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 12,
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    padding: 10,
    borderRadius: 22,
    background: "rgba(3, 10, 24, 0.88)",
    border: "1px solid rgba(96, 140, 255, 0.14)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
    backdropFilter: "blur(14px)",
  },
  navBtn: {
    display: "grid",
    placeItems: "center",
    gap: 5,
    padding: "10px 6px",
    borderRadius: 16,
    border: "1px solid transparent",
    background: "transparent",
    color: "#93a8cd",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  },
  navBtnActive: {
    color: "#6bff9b",
    background: "rgba(57,255,136,0.10)",
    border: "1px solid rgba(57,255,136,0.16)",
    boxShadow: "0 0 14px rgba(57,255,136,0.10)",
  },
};
