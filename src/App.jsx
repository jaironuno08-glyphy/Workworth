import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

const LS_KEY = "workworth_dark_neon_v2";

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

function firstNameOnly(name) {
  const cleaned = String(name || "").trim();
  if (!cleaned) return "Worker";
  return cleaned.split(" ")[0];
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
      if (saved) {
        return {
          userName: saved.userName ?? "",
          rate: saved.rate ?? 22,
          withholding: saved.withholding ?? 18,
          shiftGoalHours: saved.shiftGoalHours ?? 8,
          weeklyGoalHours: saved.weeklyGoalHours ?? 40,
          weeklyHoursWorked: saved.weeklyHoursWorked ?? 0,
          lifetimeEarned: saved.lifetimeEarned ?? 0,
          lifetimeWWC: saved.lifetimeWWC ?? 0,
          streak: saved.streak ?? 0,
          isWorking: saved.isWorking ?? false,
          shiftStartMs: saved.shiftStartMs ?? null,
          elapsedBeforeStart: saved.elapsedBeforeStart ?? 0,
          coinRate: saved.coinRate ?? 10,
          lastWorkDay: saved.lastWorkDay ?? getTodayKey(),
        };
      }
    } catch {}
    return {
      userName: "",
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

  const taxes = useMemo(
    () => gross * (state.withholding / 100),
    [gross, state.withholding]
  );
  const net = useMemo(() => gross - taxes, [gross, taxes]);

  const totalWWCThisShift = useMemo(
    () => net * state.coinRate,
    [net, state.coinRate]
  );

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
    setState((s) => ({
      userName: s.userName || "",
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
    }));
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
          <Route path="/profile" element={<ProfilePage {...shared} />} />
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
  const displayName = firstNameOnly(state.userName);

  return (
    <div style={styles.page}>
      <Header
        title={`WorkWorth${state.userName ? `, ${displayName}` : ""}`}
        subtitle={
          state.isWorking
            ? "Shift running live"
            : state.userName
            ? `Ready to earn, ${displayName}`
            : "Add your name in Profile"
        }
      />

      <div style={styles.hero}>
        <div style={styles.heroTopRow}>
          <div>
            <div style={styles.label}>LIVE NET EARNINGS</div>
            <div style={styles.moneyHero}>{money(net)}</div>
            <div style={styles.heroName}>
              {state.userName
                ? `${displayName}'s dashboard`
                : "Your dashboard"}
            </div>
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
          title="Profile"
          value={state.userName ? state.userName : "Add your name"}
          hint="Tap to open"
          onClick={() => navigate("/profile")}
          active={!state.userName}
        />
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

/* ---------------- pages ---------------- */

function LiveEarningsPage({
  elapsedSeconds,
  gross,
  taxes,
  net,
  shiftProgress,
  state,
  startWork,
  pauseWork,
  endShift,
}) {
  const displayName = firstNameOnly(state.userName);

  return (
    <PageFrame
      title="Live Earnings"
      subtitle={state.userName ? `${displayName}'s live shift value` : "Real-time shift value"}
    >
      <BigPanel>
        <div style={styles.label}>NET PAY RIGHT NOW</div>
        <div style={styles.bigGreen}>{money(net)}</div>
        <div style={styles.progressWrap}>
          <div style={styles.progressHeader}>
            <span style={styles.softText}>Shift progress</span>
            <span style={styles.greenText}>{Math.round(shiftProgress * 100)}%</span>
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
      </BigPanel>

      <InfoRow label="Time Worked" value={formatClock(elapsedSeconds)} />
      <InfoRow label="Gross Earnings" value={money(gross)} />
      <InfoRow label="Estimated Taxes" value={money(taxes)} />
      <InfoRow label="Take-Home So Far" value={money(net)} green />

      <div style={styles.actionRow}>
        {!state.isWorking ? (
          <button style={styles.primaryBtn} onClick={startWork}>
            Start
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
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.max(6, progressToNext * 100)}%`,
            }}
          />
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
          This is a quick estimate. Users can change the withholding percentage in
          Settings.
        </div>
      </div>
    </PageFrame>
  );
}

function WeeklyForecastPage({
  state,
  weeklyProjectedGross,
  weeklyProjectedNet,
  weeklyActualGross,
  weeklyActualNet,
}) {
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
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.max(6, weeklyProgress * 100)}%`,
            }}
          />
        </div>
      </div>
    </PageFrame>
  );
}

function LifetimePage({ state }) {
  const avgShiftValue =
    state.streak > 0 ? state.lifetimeEarned / state.streak : state.lifetimeEarned;

  return (
    <PageFrame title="Lifetime Earnings" subtitle="All-time work value">
      <BigPanel>
        <div style={styles.label}>LIFETIME TAKE-HOME</div>
        <div style={styles.bigGreen}>{money(state.lifetimeEarned)}</div>
        <div style={styles.softText}>
          {Math.floor(state.lifetimeWWC)} lifetime WWC earned
        </div>
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

function ProfilePage({ state, setState }) {
  const displayName = firstNameOnly(state.userName);

  return (
    <PageFrame title="Profile" subtitle="Let users add their name">
      <BigPanel>
        <div style={styles.label}>DISPLAY NAME</div>
        <div style={styles.bigGreen}>
          {state.userName ? displayName : "Add yours"}
        </div>
        <div style={styles.softText}>
          This name shows on the dashboard and profile.
        </div>
      </BigPanel>

      <Field
        label="Your Name"
        value={state.userName}
        onChange={(v) =>
          setState((s) => ({
            ...s,
            userName: v.slice(0, 30),
          }))
        }
        placeholder="Enter your name"
      />

      <div style={styles.card}>
        <div style={styles.infoRowLite}>
          <div style={styles.infoLabel}>Preview</div>
          <div style={styles.infoValueGreen}>
            {state.userName ? `${displayName}'s WorkWorth` : "Your WorkWorth"}
          </div>
        </div>
      </div>

      <button
        style={{ ...styles.secondaryBtn, width: "100%", marginTop: 12 }}
        onClick={() =>
          setState((s) => ({
            ...s,
            userName: "",
          }))
        }
      >
        Clear Name
      </button>
    </PageFrame>
  );
}

function SettingsPage({ state, setState, resetAll }) {
  return (
    <PageFrame title="Settings" subtitle="Customize WorkWorth stats">
      <Field
        label="Hourly Rate"
        value={state.rate}
        onChange={(v) => setState((s) => ({ ...s, rate: Number(v) || 0 }))}
        placeholder="22"
      />
      <Field
        label="Tax Withholding %"
        value={state.withholding}
        onChange={(v) =>
          setState((s) => ({
            ...s,
            withholding: clamp(Number(v) || 0, 0, 60),
          }))
        }
        placeholder="18"
      />
      <Field
        label="Shift Goal Hours"
        value={state.shiftGoalHours}
        onChange={(v) =>
          setState((s) => ({ ...s, shiftGoalHours: Number(v) || 0 }))
        }
        placeholder="8"
      />
      <Field
        label="Weekly Goal Hours"
        value={state.weeklyGoalHours}
        onChange={(v) =>
          setState((s) => ({ ...s, weeklyGoalHours: Number(v) || 0 }))
        }
        placeholder="40"
      />
      <Field
        label="Weekly Hours Worked"
        value={state.weeklyHoursWorked}
        onChange={(v) =>
          setState((s) => ({ ...s, weeklyHoursWorked: Number(v) || 0 }))
        }
        placeholder="0"
      />
      <Field
        label="Coin Rate (WWC per $1)"
        value={state.coinRate}
        onChange={(v) =>
          setState((s) => ({ ...s, coinRate: Number(v) || 0 }))
        }
        placeholder="10"
      />

      <button
        style={{ ...styles.secondaryBtn, width: "100%", marginTop: 16 }}
        onClick={resetAll}
      >
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
          ? "1px solid rgba(0, 212, 255, 0.85)"
          : "1px solid rgba(0, 180, 255, 0.14)",
        boxShadow: active
          ? "0 0 24px rgba(0, 212, 255, 0.35)"
          : "0 10px 28px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div style={styles.widgetTitle}>{title}</div>
      <div
        style={{
          ...styles.widgetValue,
          color: green ? "#5CFF95" : "#E8F3FF",
        }}
      >
        {value}
      </div>
      <div style={styles.widgetHint}>{hint}</div>
    </button>
  );
}

function InfoRow({ label, value, green }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={{ ...styles.infoValue, color: green ? "#5CFF95" : "#E8F3FF" }}>
        {value}
      </div>
    </div>
  );
}

function StatPill({ label, value, green }) {
  return (
    <div style={styles.statPill}>
      <div style={styles.statPillLabel}>{label}</div>
      <div
        style={{
          ...styles.statPillValue,
          color: green ? "#5CFF95" : "#DDEAFF",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={styles.fieldWrap}>
      <div style={styles.fieldLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
        inputMode="text"
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
    { label: "Profile", path: "/profile" },
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
            style={{
              ...styles.navBtn,
              color: active ? "#5CFF95" : "#7FA7C9",
              textShadow: active ? "0 0 10px rgba(92,255,149,0.65)" : "none",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function GlowBackground() {
  return (
    <>
      <div style={styles.glowA} />
      <div style={styles.glowB} />
      <div style={styles.glowC} />
    </>
  );
}

/* ---------------- styles ---------------- */

const styles = {
  app: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #071A45 0%, #04112B 35%, #020918 70%, #01040D 100%)",
    color: "#E8F3FF",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: "relative",
    overflow: "hidden",
  },

  shell: {
    maxWidth: 460,
    margin: "0 auto",
    minHeight: "100vh",
    position: "relative",
    zIndex: 2,
    paddingBottom: 92,
  },

  page: {
    padding: 18,
  },

  pageTitle: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: 0.4,
    color: "#E8F3FF",
  },

  pageSubtitle: {
    marginTop: 4,
    color: "#7FA7C9",
    fontSize: 14,
  },

  hero: {
    background:
      "linear-gradient(180deg, rgba(8,22,57,0.96) 0%, rgba(4,15,38,0.98) 100%)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    border: "1px solid rgba(0, 200, 255, 0.18)",
    boxShadow:
      "0 18px 38px rgba(0,0,0,0.45), 0 0 30px rgba(0,170,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)",
  },

  heroTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  label: {
    color: "#65C7FF",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.2,
  },

  moneyHero: {
    fontSize: 40,
    fontWeight: 900,
    color: "#5CFF95",
    lineHeight: 1.05,
    marginTop: 8,
    textShadow: "0 0 18px rgba(92,255,149,0.45)",
  },

  heroName: {
    marginTop: 8,
    color: "#8BC4FF",
    fontSize: 14,
    fontWeight: 600,
  },

  liveBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(92,255,149,0.10)",
    color: "#5CFF95",
    border: "1px solid rgba(92,255,149,0.35)",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 1,
  },

  heroMiniRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },

  statPill: {
    background: "rgba(4, 16, 42, 0.88)",
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(0, 180, 255, 0.12)",
  },

  statPillLabel: {
    color: "#7FA7C9",
    fontSize: 12,
    marginBottom: 6,
  },

  statPillValue: {
    fontWeight: 800,
    fontSize: 18,
  },

  progressWrap: {
    marginTop: 18,
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressPct: {
    color: "#5CFF95",
    fontWeight: 800,
    textShadow: "0 0 12px rgba(92,255,149,0.45)",
  },

  progressBar: {
    width: "100%",
    height: 13,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.45)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(0,255,163,0.95) 0%, rgba(92,255,149,1) 40%, rgba(142,255,196,0.95) 100%)",
    boxShadow: "0 0 18px rgba(92,255,149,0.55)",
    transition: "width 0.35s ease",
  },

  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 18,
  },

  primaryBtn: {
    background:
      "linear-gradient(180deg, rgba(0,255,163,0.22) 0%, rgba(0,180,100,0.15) 100%)",
    color: "#5CFF95",
    border: "1px solid rgba(92,255,149,0.4)",
    padding: "14px 16px",
    borderRadius: 18,
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 0 20px rgba(92,255,149,0.18)",
  },

  secondaryBtn: {
    background: "rgba(7, 24, 58, 0.92)",
    color: "#9ED8FF",
    border: "1px solid rgba(0, 200, 255, 0.22)",
    padding: "14px 16px",
    borderRadius: 18,
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 0 16px rgba(0,120,255,0.08)",
  },

  widgetGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },

  widget: {
    width: "100%",
    textAlign: "left",
    background:
      "linear-gradient(180deg, rgba(6,21,52,0.96) 0%, rgba(3,12,32,0.98) 100%)",
    borderRadius: 24,
    padding: 18,
  },

  widgetTitle: {
    fontWeight: 800,
    fontSize: 18,
    marginBottom: 10,
    color: "#E8F3FF",
  },

  widgetValue: {
    fontWeight: 900,
    fontSize: 28,
    marginBottom: 8,
  },

  widgetHint: {
    color: "#7896B6",
    fontSize: 15,
  },

  bigPanel: {
    background:
      "linear-gradient(180deg, rgba(8,22,57,0.96) 0%, rgba(4,15,38,0.98) 100%)",
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    border: "1px solid rgba(0, 180, 255, 0.16)",
    boxShadow:
      "0 18px 38px rgba(0,0,0,0.45), 0 0 30px rgba(0,170,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.02)",
  },

  bigGreen: {
    fontSize: 42,
    fontWeight: 900,
    color: "#5CFF95",
    marginTop: 8,
    textShadow: "0 0 18px rgba(92,255,149,0.45)",
    lineHeight: 1.08,
  },

  infoRow: {
    background: "rgba(5, 16, 40, 0.90)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    border: "1px solid rgba(0, 180, 255, 0.10)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  infoRowLite: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  infoLabel: {
    color: "#86A9C8",
    fontSize: 14,
  },

  infoValue: {
    fontWeight: 800,
    fontSize: 16,
    textAlign: "right",
  },

  infoValueGreen: {
    fontWeight: 800,
    fontSize: 16,
    textAlign: "right",
    color: "#5CFF95",
    textShadow: "0 0 10px rgba(92,255,149,0.35)",
  },

  softText: {
    color: "#7FA7C9",
    fontSize: 14,
    marginTop: 8,
  },

  greenText: {
    color: "#5CFF95",
    fontWeight: 800,
    textShadow: "0 0 10px rgba(92,255,149,0.35)",
  },

  card: {
    background: "rgba(5, 16, 40, 0.90)",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(0, 180, 255, 0.10)",
    marginBottom: 12,
  },

  fieldWrap: {
    marginBottom: 14,
  },

  fieldLabel: {
    color: "#86A9C8",
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(3, 11, 29, 0.96)",
    color: "#CFFFE0",
    border: "1px solid rgba(92,255,149,0.22)",
    borderRadius: 16,
    padding: "14px 16px",
    fontSize: 16,
    outline: "none",
    boxShadow: "0 0 14px rgba(92,255,149,0.06)",
  },

  bottomNav: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: 12,
    width: "min(430px, calc(100% - 24px))",
    background: "rgba(2, 10, 28, 0.88)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0, 180, 255, 0.12)",
    borderRadius: 24,
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
    zIndex: 10,
  },

  navBtn: {
    background: "transparent",
    border: "none",
    padding: "12px 8px",
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 14,
  },

  glowA: {
    position: "fixed",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "rgba(0, 153, 255, 0.12)",
    filter: "blur(40px)",
    top: -70,
    left: -60,
    zIndex: 0,
    pointerEvents: "none",
  },

  glowB: {
    position: "fixed",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "rgba(92,255,149,0.09)",
    filter: "blur(46px)",
    bottom: 80,
    right: -70,
    zIndex: 0,
    pointerEvents: "none",
  },

  glowC: {
    position: "fixed",
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(0, 212, 255, 0.10)",
    filter: "blur(44px)",
    top: "45%",
    right: -50,
    zIndex: 0,
    pointerEvents: "none",
  },
};