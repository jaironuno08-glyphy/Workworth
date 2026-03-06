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
  return day === 0 ? 6 : day - 1; // Mon=0 ... Sun=6
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const widgets = [
    {
      key: "live",
      title: "Live Earnings",
      value: money(gross),
      sub: `${money(perSecondGross)}/sec`,
      icon: <DollarSign size={18} />,
    },
    {
      key: "goal",
      title: "Weekly Goal",
      value: `${money(gross)} / ${money(weeklyGoal)}`,
      sub: `${num(progressToGoal, 0)}% complete`,
      icon: <Target size={18} />,
    },
    {
      key: "schedule",
      title: "Work Schedule",
      value: `${schedule[getTodayIndex()].day}: ${scheduleLine(
        schedule[getTodayIndex()]
      )}`,
      sub: "Tap to edit schedule",
      icon: <CalendarDays size={18} />,
    },
    {
      key: "forecast",
      title: "Weekly Forecast",
      value: money(weeklyNet),
      sub: `Gross ${money(weeklyGross)}`,
      icon: <TrendingUp size={18} />,
    },
    {
      key: "value",
      title: "Your Time Value",
      value: `${money(perSecondGross)}/sec`,
      sub: `${money(perMinuteGross)}/min • ${money(hourlyRate)}/hr`,
      icon: <Sparkles size={18} />,
    },
    {
      key: "coins",
      title: "WWC Coins",
      value: num(totalWWCThisShift, 1),
      sub: `Banked: ${num(bankedWWC, 1)}`,
      icon: <Coins size={18} />,
    },
    {
      key: "tax",
      title: "Tax Predictor",
      value: money(net),
      sub: `Taxes: ${money(taxes)}`,
      icon: <Wallet size={18} />,
    },
    {
      key: "lifetime",
      title: "Lifetime Earnings",
      value: money(lifetimeGross + gross),
      sub: `Level ${level}`,
      icon: <Trophy size={18} />,
    },
  ];

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
          left={{
            label: "Current Taxes",
            value: money(taxes),
          }}
          right={{
            label: "Current Net",
            value: money(net),
          }}
        />
        <TwoCol
          left={{
            label: "Per Second",
            value: `${money(perSecondGross)}`,
          }}
          right={{
            label: "Per Minute",
            value: `${money(perMinuteGross)}`,
          }}
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
        <BigStat label="Lifetime Gross" value={money(lifetimeGross + gross)} glow />
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
                  next[i] = {
                    ...next[i],
                    start: Number(e.target.value) || 0,
                  };
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
                  next[i] = {
                    ...next[i],
                    end: Number(e.target.value) || 0,
                  };
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
        icon={<Sett