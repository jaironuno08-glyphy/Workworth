import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

const LS_KEY = "workworth_dark_neon_v1";

/* ---------------- helpers ---------------- */

function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function nowMs() {
  return Date.now();
}

function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    sec
  ).padStart(2, "0")}`;
}

function hoursFromSeconds(seconds) {
  return seconds / 3600;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/* ---------------- app shell ---------------- */

export default function App() {
  return (
    <BrowserRouter>
      <WorkWorthApp />
    </BrowserRouter>
  );
}

function WorkWorthApp() {
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (saved) return saved;
    } catch {}
    return {
      rate: 22,
      withholding: 18,
      shiftGoalHours: 8,
      weeklyGoalHours: 40,
      weeklyHoursWorked: 0,
      lifetimeEarned: 0,
      lifetimeWWC: 0,
      streak: 4,
      isWorking: false,
      shiftStartMs: null,
      elapsedBeforeStart: 0,
      coinRate: 10, // 10 WWC per $1 net
      lastWorkDay: getTodayKey(),
    };
  });

  const [tick, setTick] = useState(nowMs());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const t = setInterval(() => setTick(nowMs()), 250);
    return () => clearInterval(t);
  }, []);

  const elapsedSeconds = useMemo(() => {
    if (!state.isWorking || !state.shiftStartMs) {
      return state.elapsedBeforeStart || 0;
    }
    return (
      (state.elapsedBeforeStart || 0) +
      Math.max(0, Math.floor((tick - state.shiftStartMs) / 1000))
    );
  }, [state.isWorking, state.shiftStartMs, state.elapsedBeforeStart, tick]);

  const gross = useMemo(() => {
    return state.rate * hoursFromSeconds(elapsedSeconds);
  }, [state.rate, elapsedSeconds]);

  const taxes = useMemo(() => gross * (state.withholding / 100), [gross, state.withholding]);
  const net = useMemo(() => gross - taxes, [gross, taxes]);

  const totalWWCThisShift = useMemo(() => net * state.coinRate, [net, state.coinRate]);

  const shiftProgress = useMemo(() => {
    const goalSecs = state.shiftGoalHours * 3600;
    if (!goalSecs) return 0;
    return clamp(elapsedSeconds / goalSecs, 0, 1);
  }, [elapsedSeconds, state.shiftGoalHours]);

  const weeklyProjectedGross = useMemo(
    () => state.rate * state.weeklyGoalHours,
    [state.rate, state.weeklyGoalHours]
  );

  const weeklyProjectedNet = useMemo(
    () => weeklyProjectedGross * (1 - state.withholding / 100),
    [weeklyProjectedGross, state.withholding]
  );

  const weeklyActualGross = useMemo(
    () => state.rate * state.weeklyHoursWorked,
    [state.rate, state.weeklyHoursWorked]
  );

  const weeklyActualNet = useMemo(
    () => weeklyActualGross * (1 - state.withholding / 100),
    [weeklyActualGross, state.withholding]
  );

  function startWork() {
    if (state.isWorking) return;
    setState((s) => ({
      ...s,
      isWorking: true,
      shiftStartMs: nowMs(),
      lastWorkDay: getTodayKey(),
    }));
  }

  function pauseWork() {
    if (!state.isWorking) return;
    const currentElapsed =
      (state.elapsedBeforeStart || 0) +
      Math.max(0, Math.floor((nowMs() - state.shiftStartMs) / 1000));

    setState((s) => ({
      ...s,
      isWorking: false,
      shiftStartMs: null,
      elapsedBeforeStart: currentElapsed,
    }));
  }

  function endShift() {
    const finalElapsed =
      state.isWorking && state.shiftStartMs
        ? (state.elapsedBeforeStart || 0) +
          Math.max(0, Math.floor((nowMs() - state.shiftStartMs) / 1000))
        : state.elapsedBeforeStart || 0;

    const finalGross = state.rate * hoursFromSeconds(finalElapsed);
    const finalTaxes = finalGross * (state.withholding / 100);
    const finalNet = finalGross - finalTaxes;
    const finalWWC = finalNet * state.coinRate;
    const finalHours = hoursFromSeconds(finalElapsed);

    setState((s) => ({
      ...s,
      isWorking: false,
      shiftStartMs: null,
      elapsedBeforeStart: 0,
      weeklyHoursWorked: Number((s.weeklyHoursWorked + finalHours).toFixed(2)),
      lifetimeEarned: Number((s.lifetimeEarned + finalNet).toFixed(2)),
      lifetimeWWC: Number((s.lifetimeWWC + finalWWC).toFixed(2)),
      streak: s.lastWorkDay === getTodayKey() ? s.streak : s.streak + 1,
      lastWorkDay: getTodayKey(),
    }));
  }

  function resetAll() {
    setState({
      rate: 22,
      withholding: 18,
      shiftGoalHours: 8,
      weeklyGoalHours: 40,
      weeklyHoursWorked: 0,
      lifetimeEarned: 0,
      lifetimeWWC: 0,
      streak: 0,
      isWorking: false,
      shiftStartMs: null,
      elapsedBeforeStart: 0,
      coinRate: 10,
      lastWorkDay: getTodayKey(),
    });
  }

  const shared = {
    state,
    setState,
    elapsedSeconds,
    gross,
    taxes,
    net,
    totalWWCThisShift,
    shiftProgress,
    weeklyProjectedGross,
    weeklyProjectedNet,
    weeklyActualGross,
    weeklyActualNet,
    startWork,
    pauseWork,
    endShift,
    resetAll,
  };

  return (
    <div style={styles.app}>
      <GlowBackground />
      <div style={styles.shell}>
        <Routes>
          <Route path="/" element={<Dashboard {...shared} />} />
          <Route path="/live" element={<LiveEarningsPage {...shared} />} />
          <Route path="/coins" element={<CoinsPage {...shared} />} />
          <Route path="/tax" element={<TaxPage {...shared} />} />
          <Route path="/weekly" element={<WeeklyForecastPage {...shared} />} />
          <Route path="/lifetime" element={<LifetimePage {...shared} />} />
          <Route path="/streak" element={<StreakPage {...shared} />} />
          <Route path="/settings" element={<SettingsPage {...shared} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard(props) {
  const {
    elapsedSeconds,
    net,
    totalWWCThisShift,
    taxes,
    weeklyProjectedNet,
    state,
    startWork,
    pauseWork,
    endShift,
    shiftProgress,
  } = props;

  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <Header
        title="WorkWorth"
        subtitle={state.isWorking ? "Shift running live" : "Ready to start earning"}
      />

      <div style={styles.hero}>
        <div style={styles.heroTopRow}>
          <div>
            <div style={styles.label}>LIVE NET EARNINGS</div>
            <div style={styles.moneyHero}>{money(net)}</div>
          </div>
          <div style={styles.liveBadge}>{state.isWorking ? "LIVE" : "PAUSED"}</div>
        </div>

        <div style={styles.heroMiniRow}>
          <StatPill label="Time" value={formatClock(elapsedSeconds)} />
          <StatPill label="Coins" value={`${Math.floor(totalWWCThisShift)} WWC`} green />
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span style={styles.label}>SHIFT PROGRESS</span>
            <span style={styles.progressPct}>{Math.round(shiftProgress * 100)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.max(6, shiftProgress * 100)}%`,
              }}
            />
          </div>
        </div>

        <div style={styles.actionRow}>
          {!state.isWorking ? (
            <button style={styles.primaryBtn} onClick={startWork}>
              Start Work
            </button>
          ) : (
            <button style={styles.primaryBtn} onClick={pauseWork}>
              Pause
            </button>
          )}
          <button style={styles.secondaryBtn} onClick={endShift}>
            End Shift
          </button>
        </div>
      </div>

      <div style={styles.widgetGrid}>
        <WidgetCard
          title="Live Earnings"
          value={money(net)}
          hint="Tap to open"
          onClick={() => navigate("/live")}
        />
        <WidgetCard
          title="Coins"
          value={`${Math.floor(totalWWCThisShift)} WWC`}
          hint="Tap to open"
          green
          onClick={() => navigate("/coins")}
        />
        <WidgetCard
          title="Tax Estimator"
          value={money(taxes)}
          hint="Tap to open"
          active
          onClick={() => navigate("/tax")}
        />
        <WidgetCard
          title="Weekly Forecast"
          value={money(weeklyProjectedNet)}
          hint="Tap to open"
          onClick={() => navigate("/weekly")}
        />
        <WidgetCard
          title="Lifetime Earnings"
          value={money(state.lifetimeEarned)}
          hint="Tap to open"
          onClick={() => navigate("/lifetime")}
        />
        <WidgetCard
          title="Work Streak"
          value={`${state.streak} days`}
          hint="Tap to open"
          onClick={() => navigate("/streak")}
        />
      </div>
    </div>
  );
}

/* ---------------- detail pages ---------------- */

function LiveEarningsPage({ elapsedSeconds, gross, taxes, net, shiftProgress, state, startWork, pauseWork, endShift }) {
  return (
    <PageFrame title="Live Earnings" subtitle="Real-time shift value">
      <BigPanel>
        <div style={styles.label}>NET PAY RIGHT NOW</div>
        <div style={styles.bigGreen}>{money(net)}</div>
        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span style={styles.softText}>Shift progress</span>
            <span style={styles.greenText}>{Math.round(shiftProgress * 100)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${Math.max(6, shiftProgress * 100)}%` }} />
          </div>
        </div>
      </BigPanel>

      <InfoRow label="Time Worked" value={formatClock(elapsedSeconds)} />
      <InfoRow label="Gross Earnings" value={money(gross)} />
      <InfoRow label="Estimated Taxes" value={money(taxes)} />
      <InfoRow label="Take-Home So Far" value={money(net)} green />

      <div style={styles.actionRow}>
        {!state.isWorking ? (
          <button style={styles.primaryBtn} onClick={startWork}>Start</button>
        ) : (
          <button style={styles.primaryBtn} onClick={pauseWork}>Pause</button>
        )}
        <button style={styles.secondaryBtn} onClick={endShift}>End Shift</button>
      </div>
    </PageFrame>
  );
}

function CoinsPage({ totalWWCThisShift, state }) {
  const level = Math.floor(state.lifetimeWWC / 1000) + 1;
  const nextLevelAt = level * 1000;
  const progressToNext = clamp((state.lifetimeWWC % 1000) / 1000, 0, 1);

  return (
    <PageFrame title="Coins" subtitle="WorkWorth coin progress">
      <BigPanel>
        <div style={styles.label}>SHIFT COINS</div>
        <div style={styles.bigGreen}>{Math.floor(totalWWCThisShift)} WWC</div>
        <div style={styles.softText}>Lifetime: {Math.floor(state.lifetimeWWC)} WWC</div>
      </BigPanel>

      <InfoRow label="Current Level" value={`Lv. ${level}`} green />
      <InfoRow label="Next Level At" value={`${nextLevelAt} WWC`} />
      <InfoRow label="Coin Rate" value={`${state.coinRate} WWC per $1 net`} />

      <div style={styles.card}>
        <div style={styles.progressHeader}>
          <span style={styles.softText}>Level progress</span>
          <span style={styles.greenText}>{Math.round(progressToNext * 100)}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${Math.max(6, progressToNext * 100)}%` }} />
        </div>
      </div>
    </PageFrame>
  );
}

function TaxPage({ gross, taxes, net, state }) {
  return (
    <PageFrame title="Tax Estimator" subtitle="Simple estimated withholding">
      <BigPanel>
        <div style={styles.label}>ESTIMATED TAXES</div>
        <div style={styles.bigGreen}>{money(taxes)}</div>
        <div style={styles.softText}>{state.withholding}% withholding rate</div>
      </BigPanel>

      <InfoRow label="Gross" value={money(gross)} />
      <InfoRow label="Tax Estimate" value={money(taxes)} />
      <InfoRow label="Net After Taxes" value={money(net)} green />

      <div style={styles.card}>
        <div style={styles.softText}>
          This is a quick estimate for motivation and planning. You can change the withholding
          percentage in Settings.
        </div>
      </div>
    </PageFrame>
  );
}

function WeeklyForecastPage({ state, weeklyProjectedGross, weeklyProjectedNet, weeklyActualGross, weeklyActualNet }) {
  const weeklyProgress = clamp(
    state.weeklyGoalHours ? state.weeklyHoursWorked / state.weeklyGoalHours : 0,
    0,
    1
  );

  return (
    <PageFrame title="Weekly Forecast" subtitle="Where the week is headed">
      <BigPanel>
        <div style={styles.label}>PROJECTED TAKE-HOME</div>
        <div style={styles.bigGreen}>{money(weeklyProjectedNet)}</div>
        <div style={styles.softText}>Based on {state.weeklyGoalHours} hrs goal</div>
      </BigPanel>

      <InfoRow label="Weekly Goal Hours" value={`${state.weeklyGoalHours} hrs`} />
      <InfoRow label="Hours Logged" value={`${state.weeklyHoursWorked.toFixed(2)} hrs`} />
      <InfoRow label="Actual Net So Far" value={money(weeklyActualNet)} green />
      <InfoRow label="Projected Gross" value={money(weeklyProjectedGross)} />
      <InfoRow label="Actual Gross So Far" value={money(weeklyActualGross)} />

      <div style={styles.card}>
        <div style={styles.progressHeader}>
          <span style={styles.softText}>Weekly hours progress</span>
          <span style={styles.greenText}>{Math.round(weeklyProgress * 100)}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${Math.max(6, weeklyProgress * 100)}%` }} />
        </div>
      </div>
    </PageFrame>
  );
}

function LifetimePage({ state }) {
  const avgShiftValue = state.streak > 0 ? state.lifetimeEarned / state.streak : state.lifetimeEarned;

  return (
    <PageFrame title="Lifetime Earnings" subtitle="All-time work value">
      <BigPanel>
        <div style={styles.label}>LIFETIME TAKE-HOME</div>
        <div style={styles.bigGreen}>{money(state.lifetimeEarned)}</div>
        <div style={styles.softText}>{Math.floor(state.lifetimeWWC)} lifetime WWC earned</div>
      </BigPanel>

      <InfoRow label="Total Net Earned" value={money(state.lifetimeEarned)} green />
      <InfoRow label="Lifetime WWC" value={`${Math.floor(state.lifetimeWWC)} WWC`} />
      <InfoRow label="Average Value Snapshot" value={money(avgShiftValue)} />
    </PageFrame>
  );
}

function StreakPage({ state }) {
  const multiplier = 1 + state.streak * 0.02;

  return (
    <PageFrame title="Work Streak" subtitle="Consistency tracker">
      <BigPanel>
        <div style={styles.label}>CURRENT STREAK</div>
        <div style={styles.bigGreen}>{state.streak} days</div>
        <div style={styles.softText}>Keep stacking days and building momentum</div>
      </BigPanel>

      <InfoRow label="Current Streak" value={`${state.streak} days`} green />
      <InfoRow label="Motivation Multiplier" value={`${multiplier.toFixed(2)}x`} />
      <InfoRow label="Last Worked Day" value={state.lastWorkDay} />
    </PageFrame>
  );
}

function SettingsPage({ state, setState, resetAll }) {
  return (
    <PageFrame title="Settings" subtitle="Customize your WorkWorth stats">
      <Field
        label="Hourly Rate"
        value={state.rate}
        onChange={(v) => setState((s) => ({ ...s, rate: Number(v) || 0 }))}
      />
      <Field
        label="Tax Withholding %"
        value={state.withholding}
        onChange={(v) =>
          setState((s) => ({ ...s, withholding: clamp(Number(v) || 0, 0, 60) }))
        }
      />
      <Field
        label="Shift Goal Hours"
        value={state.shiftGoalHours}
        onChange={(v) => setState((s) => ({ ...s, shiftGoalHours: Number(v) || 0 }))}
      />
      <Field
        label="Weekly Goal Hours"
        value={state.weeklyGoalHours}
        onChange={(v) => setState((s) => ({ ...s, weeklyGoalHours: Number(v) || 0 }))}
      />
      <Field
        label="Weekly Hours Worked"
        value={state.weeklyHoursWorked}
        onChange={(v) => setState((s) => ({ ...s, weeklyHoursWorked: Number(v) || 0 }))}
      />
      <Field
        label="Coin Rate (WWC per $1)"
        value={state.coinRate}
        onChange={(v) => setState((s) => ({ ...s, coinRate: Number(v) || 0 }))}
      />

      <button style={{ ...styles.secondaryBtn, width: "100%", marginTop: 16 }} onClick={resetAll}>
        Reset Everything
      </button>
    </PageFrame>
  );
}

/* ---------------- reusable ui ---------------- */

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={styles.pageTitle}>{title}</div>
      <div style={styles.pageSubtitle}>{subtitle}</div>
    </div>
  );
}

function PageFrame({ title, subtitle, children }) {
  return (
    <div style={styles.page}>
      <Header title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

function BigPanel({ children }) {
  return <div style={styles.bigPanel}>{children}</div>;
}

function WidgetCard({ title, value, hint, onClick, active, green }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.widget,
        border: active
          ? "1px solid rgba(0, 212, 255, 0.8)"
          : "1px solid rgba(0, 180, 255, 0.14)",
        boxShadow: active
          ? "0 0 24px rgba(0, 212, 255, 0.35)"
          : "0 10px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div style={styles.widgetTitle}>{title}</div>
      <div style={{ ...styles.widgetValue, color: green ? "#5CFF95" : "#E8F3FF" }}>{value}</div>
      <div style={styles.widgetHint}>{hint}</div>
    </button>
  );
}

function InfoRow({ label, value, green }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={{ ...styles.infoValue, color: green ? "#5CFF95" : "#E8F3FF" }}>{value}</div>
    </div>
  );
}

function StatPill({ label, value, green }) {
  return (
    <div style={styles.statPill}>
      <div style={styles.statPillLabel}>{label}</div>
      <div style={{ ...styles.statPillValue, color: green ? "#5CFF95" : "#DDEAFF" }}>
        {value}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div style={styles.fieldWrap}>
      <div style={styles.fieldLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
        inputMode="decimal"
      />
    </div>
  );
}

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Home", path: "/" },
    { label: "Live", path: "/live" },
    { label: "Coins", path: "/coins" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div style={styles.bottomNav}>
      {items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            sty
