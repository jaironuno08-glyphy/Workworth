import React, { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Wallet,
  CalendarDays,
  Coins,
  User,
  Settings,
  TrendingUp,
  DollarSign,
  Target,
  Sparkles,
  Trophy,
  Home,
} from "lucide-react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const LS_KEY = "workworth_neon_v1";

function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function num(n, digits = 2) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(digits);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function weeklyHoursFromSchedule(schedule) {
  return schedule.reduce((sum, s) => {
    const start = Number(s.start) || 0;
    const end = Number(s.end) || 0;
    return sum + Math.max(0, end - start);
  }, 0);
}

function AppInner() {
  const [page, setPage] = useState("home");

  const [profileName, setProfileName] = useState("Jairo");
  const [hourlyRate, setHourlyRate] = useState(22);
  const [taxRate, setTaxRate] = useState(22);
  const [wwcPerDollar, setWwcPerDollar] = useState(10);

  const [isWorking, setIsWorking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [lifetimeGross, setLifetimeGross] = useState(0);
  const [lifetimeNet, setLifetimeNet] = useState(0);
  const [lifetimeWWC, setLifetimeWWC] = useState(0);
  const [bankedWWC, setBankedWWC] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const [lastBankDate, setLastBankDate] = useState("");

  const [weeklyGoal, setWeeklyGoal] = useState(880);

  const [schedule, setSchedule] = useState([
    { day: "Mon", start: 11, end: 19.5 },
    { day: "Tue", start: 0, end: 0 },
    { day: "Wed", start: 0, end: 0 },
    { day: "Thu", start: 11, end: 19.5 },
    { day: "Fri", start: 12, end: 20.5 },
    { day: "Sat", start: 11, end: 19.5 },
    { day: "Sun", start: 11, end: 19.5 },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      setProfileName(saved.profileName ?? "Jairo");
      setHourlyRate(saved.hourlyRate ?? 22);
      setTaxRate(saved.taxRate ?? 22);
      setWwcPerDollar(saved.wwcPerDollar ?? 10);
      setElapsedSeconds(saved.elapsedSeconds ?? 0);
      setLifetimeGross(saved.lifetimeGross ?? 0);
      setLifetimeNet(saved.lifetimeNet ?? 0);
      setLifetimeWWC(saved.lifetimeWWC ?? 0);
      setBankedWWC(saved.bankedWWC ?? 0);
      setStreakDays(saved.streakDays ?? 1);
      setLastBankDate(saved.lastBankDate ?? "");
      setWeeklyGoal(saved.weeklyGoal ?? 880);
      setSchedule(saved.schedule ?? schedule);
      setPage(saved.page ?? "home");
      setIsWorking(false);
    } catch (err) {
      console.error("Failed to load saved WorkWorth data:", err);
    }
  }, []);

  useEffect(() => {
    const data = {
      profileName,
      hourlyRate,
      taxRate,
      wwcPerDollar,
      elapsedSeconds,
      lifetimeGross,
      lifetimeNet,
      lifetimeWWC,
      bankedWWC,
      streakDays,
      lastBankDate,
      weeklyGoal,
      schedule,
      page,
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [
    profileName,
    hourlyRate,
    taxRate,
    wwcPerDollar,
    elapsedSeconds,
    lifetimeGross,
    lifetimeNet,
    lifetimeWWC,
    bankedWWC,
    streakDays,
    lastBankDate,
    weeklyGoal,
    schedule,
    page,
  ]);

  useEffect(() => {
    if (!isWorking) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWorking]);

  const gross = useMemo(
    () => (elapsedSeconds / 3600) * hourlyRate,
    [elapsedSeconds, hourlyRate]
  );
  const taxes = useMemo(() => gross * (taxRate / 100), [gross, taxRate]);
  const net = useMemo(() => gross - taxes, [gross, taxes]);
  const perSecondGross = hourlyRate / 3600;
  const perMinuteGross = hourlyRate / 60;
  const totalWWCThisShift = net * wwcPerDollar;
  const progressToGoal = clamp((gross / weeklyGoal) * 100, 0, 100);

  const weeklyHours = weeklyHoursFromSchedule(schedule);
  const weeklyGross = weeklyHours * hourlyRate;
  const weeklyTaxes = weeklyGross * (taxRate / 100);
  const weeklyNet = weeklyGross - weeklyTaxes;

  const annualGross = weeklyGross * 52;
  const projectedCareerGross = annualGross * 40;
  const level = Math.floor(lifetimeWWC / 1000) + 1;

  function formatHour(decimalHour) {
    if (!decimalHour) return "—";
    const h24 = Math.floor(decimalHour);
    const mins = decimalHour % 1 === 0.5 ? "30" : "00";
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${mins} ${suffix}`;
  }

  function scheduleLine(entry) {
    if (!entry.start || !entry.end) return "Off";
    return `${formatHour(entry.start)} - ${formatHour(entry.end)}`;
  }

  function bankCoins() {
    const today = new Date().toDateString();
    let nextStreak = streakDays;

    if (lastBankDate) {
      const last = new Date(lastBankDate);
      const now = new Date(today);
      const diffDays = Math.round((now - last) / 86400000);

      if (diffDays === 1) nextStreak = streakDays + 1;
      else if (diffDays > 1) nextStreak = 1;
    } else {
      nextStreak = 1;
    }

    const bonusMultiplier = 1 + Math.min(nextStreak - 1, 14) * 0.02;
    const earned = totalWWCThisShift * bonusMultiplier;

    setBankedWWC((v) => v + earned);
    setLifetimeWWC((v) => v + earned);
    setLifetimeGross((v) => v + gross);
    setLifetimeNet((v) => v + net);
    setStreakDays(nextStreak);
    setLastBankDate(today);
    setElapsedSeconds(0);
    setIsWorking(false);
    setPage("coins");
  }

  function resetShift() {
    setIsWorking(false);
    setElapsedSeconds(0);
  }

  function resetAll() {
    const ok = window.confirm("Reset all WorkWorth data?");
    if (!ok) return;
    localStorage.removeItem(LS_KEY);
    window.location.reload();
  }

  function card(title, value, sub, icon, onClick, glow = false) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...styles.card,
          ...(glow ? styles.glowCard : {}),
          cursor: onClick ? "pointer" : "default",
        }}
      >
        <div style={styles.cardHeader}>
          <div style={styles.cardTitleWrap}>
            <span style={styles.iconBadge}>{icon}</span>
            <span style={styles.cardTitle}>{title}</span>
          </div>
        </div>
        <div style={glow ? styles.glowValue : styles.cardValue}>{value}</div>
        <div style={styles.cardSub}>{sub}</div>
      </button>
    );
  }

  function HomePage() {
    return (
      <div style={styles.pageWrap}>
        <div style={styles.hero}>
          <div>
            <div style={styles.brand}>WorkWorth</div>
            <div style={styles.heroTag}>Focus Mode</div>
            <div style={styles.heroName}>Welcome, {profileName}</div>
          </div>

          <div style={styles.progressWrap}>
            <div style={{ width: 120, height: 120 }}>
              <CircularProgressbar
                value={progressToGoal}
                text={`${num(progressToGoal, 0)}%`}
                styles={buildStyles({
                  pathColor: "#39ff88",
                  trailColor: "rgba(255,255,255,0.08)",
                  textColor: "#dfffea",
                  textSize: "16px",
                })}
              />
            </div>
            <div style={styles.progressText}>
              <div style={styles.progressLabel}>Weekly Goal</div>
              <div style={styles.progressMoney}>{money(weeklyGoal)}</div>
            </div>
          </div>
        </div>

        <div style={styles.liveStrip}>
          <div style={styles.liveLeft}>
            <div style={styles.liveLabel}>Live Earnings</div>
            <div style={styles.liveMoney}>{money(gross)}</div>
            <div style={styles.liveSub}>
              {money(perSecondGross)} / sec • {money(hourlyRate)} / hr
            </div>
          </div>

          <div style={styles.liveButtons}>
            {!isWorking ? (
              <button style={styles.neonBtn} onClick={() => setIsWorking(true)}>
                <Play size={18} />
                Start
              </button>
            ) : (
              <button
                style={styles.neonBtnAlt}
                onClick={() => setIsWorking(false)}
              >
                <Pause size={18} />
                Pause
              </button>
            )}

            <button style={styles.darkBtn} onClick={resetShift}>
              <RotateCcw size={18} />
              Reset
            </button>

            <button style={styles.bankBtn} onClick={bankCoins}>
              <Coins size={18} />
              Bank
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {card(
            "Live Earnings",
            money(gross),
            `${money(perSecondGross)}/sec`,
            <DollarSign size={18} />,
            () => setPage("live"),
            true
          )}
          {card(
            "Weekly Goal",
            `${money(gross)} / ${money(weeklyGoal)}`,
            `${num(progressToGoal, 0)}% complete`,
            <Target size={18} />,
            () => setPage("weekly")
          )}
          {card(
            "Work Schedule",
            `${schedule[getTodayIndex()].day}: ${scheduleLine(
              schedule[getTodayIndex()]
            )}`,
            "Tap to edit your hours",
            <CalendarDays size={18} />,
            () => setPage("schedule")
          )}
          {card(
            "Weekly Forecast",
            money(weeklyNet),
            `Gross ${money(weeklyGross)}`,
            <TrendingUp size={18} />,
            () => setPage("weekly")
          )}
          {card(
            "Your Time Value",
            `${money(perSecondGross)}/sec`,
            `${money(perMinuteGross)}/min • ${money(hourlyRate)}/hr`,
            <Sparkles size={18} />,
            () => setPage("live")
          )}
          {card(
            "WWC Coins",
            num(totalWWCThisShift, 1),
            `Banked: ${num(bankedWWC, 1)}`,
            <Coins size={18} />,
            () => setPage("coins")
          )}
          {card(
            "Paycheck Predictor",
            money(net),
            `Taxes ${money(taxes)}`,
            <Wallet size={18} />,
            () => setPage("tax")
          )}
          {card(
            "Lifetime Earnings",
            money(lifetimeGross + gross),
            `Level ${level}`,
            <Trophy size={18} />,
            () => setPage("lifetime")
          )}
        </div>
      </div>
    );
  }

  function LivePage() {
    return (
      <PageShell
        title="Live Earnings"
        subtitle="Track your shift in real time."
        icon={<DollarSign size={18} />}
      >
        <BigStat label="Current Gross" value={money(gross)} glow />
        <TwoCol
          left={{ label: "Current Taxes", value: money(taxes) }}
          right={{ label: "Current Net", value: money(net) }}
        />
        <TwoCol
          left={{ label: "Per Second", value: `${money(perSecondGross)}` }}
          right={{ label: "Per Minute", value: `${money(perMinuteGross)}` }}
        />
        <div style={styles.actionRow}>
          {!isWorking ? (
            <button style={styles.neonBtn} onClick={() => setIsWorking(true)}>
              <Play size={18} />
              Start Shift
            </button>
          ) : (
            <button
              style={styles.neonBtnAlt}
              onClick={() => setIsWorking(false)}
            >
              <Pause size={18} />
              Pause Shift
            </button>
          )}
          <button style={styles.darkBtn} onClick={resetShift}>
            <RotateCcw size={18} />
            Reset Shift
          </button>
        </div>
      </PageShell>
    );
  }

  function CoinsPage() {
    return (
      <PageShell
        title="WWC Coins"
        subtitle="Turn your work into momentum."
        icon={<Coins size={18} />}
      >
        <BigStat
          label="Shift WWC"
          value={num(totalWWCThisShift, 1)}
          suffix=" WWC"
          glow
        />
        <TwoCol
          left={{ label: "Banked WWC", value: `${num(bankedWWC, 1)} WWC` }}
          right={{ label: "Lifetime WWC", value: `${num(lifetimeWWC, 1)} WWC` }}
        />
        <TwoCol
          left={{ label: "Streak", value: `${streakDays} day(s)` }}
          right={{ label: "Level", value: `${level}` }}
        />
        <button style={styles.bankBtnWide} onClick={bankCoins}>
          <Coins size={18} />
          Bank This Shift
        </button>
      </PageShell>
    );
  }

  function TaxPage() {
    return (
      <PageShell
        title="Tax Predictor"
        subtitle="See gross, taxes, and take-home."
        icon={<Wallet size={18} />}
      >
        <BigStat label="Take Home" value={money(net)} glow />
        <TwoCol
          left={{ label: "Gross", value: money(gross) }}
          right={{ label: "Taxes", value: money(taxes) }}
        />
        <div style={styles.sectionBox}>
          <div style={styles.inputLabel}>Tax Withholding %</div>
          <input
            style={styles.input}
            type="number"
            min="0"
            max="60"
            step="0.5"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
          />
        </div>
      </PageShell>
    );
  }

  function WeeklyPage() {
    return (
      <PageShell
        title="Weekly Forecast"
        subtitle="Projected earnings from your schedule."
        icon={<TrendingUp size={18} />}
      >
        <BigStat label="Projected Weekly Net" value={money(weeklyNet)} glow />
        <TwoCol
          left={{ label: "Weekly Gross", value: money(weeklyGross) }}
          right={{ label: "Weekly Taxes", value: money(weeklyTaxes) }}
        />
        <div style={styles.sectionBox}>
          <div style={styles.inputLabel}>Weekly Goal ($)</div>
          <input
            style={styles.input}
            type="number"
            min="0"
            step="10"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(Number(e.target.value) || 0)}
          />
        </div>
      </PageShell>
    );
  }

  function LifetimePage() {
    return (
      <PageShell
        title="Lifetime Earnings"
        subtitle="Your long-game numbers."
        icon={<Trophy size={18} />}
      >
        <BigStat
          label="Lifetime Gross"
          value={money(lifetimeGross + gross)}
          glow
        />
        <TwoCol
          left={{ label: "Lifetime Net", value: money(lifetimeNet + net) }}
          right={{ label: "Yearly Projection", value: money(annualGross) }}
        />
        <TwoCol
          left={{
            label: "40-Year Projection",
            value: money(projectedCareerGross),
          }}
          right={{ label: "Current Level", value: `${level}` }}
        />
      </PageShell>
    );
  }

  function ProfilePage() {
    return (
      <PageShell
        title="Profile"
        subtitle="Set your name and pay."
        icon={<User size={18} />}
      >
        <div style={styles.sectionBox}>
          <div style={styles.inputLabel}>Your Name</div>
          <input
            style={styles.input}
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div style={styles.sectionBox}>
          <div style={styles.inputLabel}>Hourly Pay</div>
          <input
            style={styles.input}
            type="number"
            min="0"
            step="0.25"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
          />
        </div>

        <div style={styles.sectionBox}>
          <div style={styles.inputLabel}>WWC Per Dollar</div>
          <input
            style={styles.input}
            type="number"
            min="1"
            step="1"
            value={wwcPerDollar}
            onChange={(e) => setWwcPerDollar(Number(e.target.value) || 1)}
          />
        </div>
      </PageShell>
    );
  }

  function SchedulePage() {
    return (
      <PageShell
        title="Work Schedule"
        subtitle="Edit your weekly hours."
        icon={<CalendarDays size={18} />}
      >
        <div style={{ display: "grid", gap: 12 }}>
          {schedule.map((row, i) => (
            <div key={row.day} style={styles.scheduleRow}>
              <div style={styles.scheduleDay}>{row.day}</div>

              <input
                style={styles.scheduleInput}
                type="number"
                step="0.5"
                min="0"
                max="23.5"
                value={row.start}
                onChange={(e) => {
                  const next = [...schedule];
                  next[i] = { ...next[i], start: Number(e.target.value) || 0 };
                  setSchedule(next);
                }}
              />

              <span style={styles.toText}>to</span>

              <input
                style={styles.scheduleInput}
                type="number"
                step="0.5"
                min="0"
                max="23.5"
                value={row.end}
                onChange={(e) => {
                  const next = [...schedule];
                  next[i] = { ...next[i], end: Number(e.target.value) || 0 };
                  setSchedule(next);
                }}
              />
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  function SettingsPage() {
    return (
      <PageShell
        title="Settings"
        subtitle="Control your app data."
        icon={<Settings size={18} />}
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
    borderRadius: "999px",
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
