import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SideQuestEconomy.css';

const INITIAL_CATEGORIES = [
  { name: "The actual task", color: "#42623e", minutes: 0 },
  { name: "Font hunting", color: "#ad7d36", minutes: 0 },
  { name: "Full redesign", color: "#6e7262", minutes: 0 },
  { name: "New framework", color: "#78647d", minutes: 0 },
  { name: "Doomscrolling", color: "#bc4129", minutes: 0 },
  { name: "Snack logistics", color: "#788893", minutes: 0 }
];

const QUESTS = [
  {
    category: 1,
    title: "Find a better font",
    cost: 12,
    excuse: "The button needs a personality.",
    unlock: "Requires: one font crisis",
    notes: [
      "You compared 18 fonts. Selected the original font.",
      "You discovered a font with a very compelling lowercase g.",
      "You downloaded a font family. You have no family time left."
    ]
  },
  {
    category: 2,
    title: "Rethink the layout",
    cost: 28,
    excuse: "Now the rest of the site looks wrong.",
    requires: 1,
    unlock: "Requires: one font crisis",
    notes: [
      "The button now needs a new website to go with it.",
      "You moved the sidebar. Then moved it back.",
      "You renamed the redesign “a quick visual polish.”"
    ]
  },
  {
    category: 3,
    title: "Switch frameworks",
    cost: 45,
    excuse: "This is clearly a stack problem.",
    requires: 2,
    unlock: "Requires: one redesign",
    notes: [
      "You rebuilt the environment. The button remains untouched.",
      "You read a migration guide written for people with free weekends.",
      "Congratulations. The same button now has 83 dependencies."
    ]
  },
  {
    category: 4,
    title: "Gather inspiration",
    cost: 20,
    excuse: "A respectable name for doomscrolling.",
    notes: [
      "You watched a man restore a frying pan. Essential research.",
      "Six productivity videos. No productivity recorded.",
      "You know how otters sleep now. The button is still blue."
    ]
  },
  {
    category: 5,
    title: "Secure provisions",
    cost: 8,
    excuse: "Productivity requires infrastructure.",
    notes: [
      "You made a snack for the task you have not started.",
      "The coffee required a second, supporting biscuit.",
      "You checked the fridge again. No updates available."
    ]
  }
];

export default function SideQuestEconomy() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [done, setDone] = useState(false);
  const [detours, setDetours] = useState(0);
  const [visits, setVisits] = useState(QUESTS.map(() => 0));
  const [logs, setLogs] = useState([
    {
      time: "00:00 / OPENED",
      text: "You sat down to change one button. A beautiful, innocent moment."
    }
  ]);
  const [statusMsg, setStatusMsg] = useState(
    "Start here: choose a detour, follow a random distraction, or finish immediately."
  );
  const [sampleDone, setSampleDone] = useState(false);

  const ghostRef = useRef(null);
  const receiptTitleRef = useRef(null);

  // Wandering Ghost Animator
  const moveGhost = useCallback(() => {
    if (!ghostRef.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const ghost = ghostRef.current;
    const padding = (ghost.offsetWidth || 75) / 2 + 12;
    const availableX = Math.max(0, window.innerWidth - 2 * padding);
    const availableY = Math.max(0, window.innerHeight - 2 * padding);
    const rotation = (Math.random() * 20 - 10).toFixed(1);

    ghost.style.left = `${padding + Math.random() * availableX}px`;
    ghost.style.top = `${padding + Math.random() * availableY}px`;
    ghost.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }, []);

  useEffect(() => {
    moveGhost();
    const interval = setInterval(moveGhost, 5200);
    return () => clearInterval(interval);
  }, [moveGhost]);

  // Time Formatter HH:MM
  const time = (minutes) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const remainingMinutes = String(minutes % 60).padStart(2, "0");
    return `${hours}:${remainingMinutes}`;
  };

  const total = categories.reduce((sum, cat) => sum + cat.minutes, 0);

  const available = (quest) => {
    if (!quest.requires) return true;
    return categories[quest.requires].minutes > 0;
  };

  const addLog = (note, isClosed = false) => {
    const timestamp = `${time(total)} / ${isClosed ? "CLOSED" : "EXPENSE"}`;
    setLogs((prev) => [{ time: timestamp, text: note }, ...prev.slice(0, 3)]);
  };

  const take = (index) => {
    const quest = QUESTS[index];
    if (done || !available(quest)) return;

    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === quest.category ? { ...cat, minutes: cat.minutes + quest.cost } : cat
      )
    );

    const visitCount = visits[index];
    const note = quest.notes[visitCount % quest.notes.length];

    setVisits((prev) => {
      const next = [...prev];
      next[index] += 1;
      return next;
    });

    setDetours((prev) => prev + 1);
    addLog(note);
    moveGhost();

    const unlockMessage =
      index === 0 && visitCount === 0
        ? " Full redesign unlocked."
        : index === 1 && visitCount === 0
        ? " Framework research unlocked."
        : "";

    setStatusMsg(`+${quest.cost} minutes. ${note}${unlockMessage}`);
  };

  const handleRandom = () => {
    if (done) return;
    const options = QUESTS.map((q, idx) => idx).filter((idx) => available(QUESTS[idx]));
    if (options.length === 0) return;
    const randomIndex = options[Math.floor(Math.random() * options.length)];
    take(randomIndex);
  };

  const handleFinish = () => {
    if (done) return;

    setDone(true);
    setSampleDone(true);
    setCategories((prev) =>
      prev.map((cat, idx) => (idx === 0 ? { ...cat, minutes: 5 } : cat))
    );

    addLog("Five minutes of work. The button is now terracotta.", true);
    setStatusMsg("Task complete. Your closing statement is ready below.");
    moveGhost();

    setTimeout(() => {
      if (receiptTitleRef.current) {
        receiptTitleRef.current.focus();
      }
    }, 100);
  };

  const handleSampleClick = () => {
    setStatusMsg(
      done
        ? "Yes. It really did only need a different color."
        : "Inspection complete: this is, in fact, one button. Use “Change the button” to finish."
    );
  };

  const handleReset = () => {
    setDone(false);
    setSampleDone(false);
    setDetours(0);
    setVisits(QUESTS.map(() => 0));
    setCategories(INITIAL_CATEGORIES);
    setLogs([
      {
        time: "00:00 / OPENED",
        text: "You sat down to change one button. Again."
      }
    ]);
    setStatusMsg("Fresh budget. Same questionable instincts.");
    moveGhost();
  };

  const max = Math.max(20, ...categories.map((c) => c.minutes));
  const scale = Math.ceil(max / 20) * 20;

  const stampText = done
    ? "Case closed"
    : detours === 0
    ? "Still on the brief"
    : total < 60
    ? "Brief abandoned"
    : "Budget is folklore";

  const currentStep = done ? 3 : detours > 0 ? 2 : 1;

  return (
    <div className="sqe-container">
      {/* Wandering Ghost */}
      <img
        ref={ghostRef}
        className="floating-ghost"
        id="floatingGhost"
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdG5wMnZ6MTJheW5ybXFzcnp5ODBkbG9yaWpqODM1bmo1aHMxYXdpMCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/38md9VwIj0pyAkOmqW/giphy.gif"
        alt=""
        aria-hidden="true"
      />

      <main>
        <header className="masthead">
          <span>Department of Unfinished Business</span>
          <span>Time & attention / September 2026</span>
        </header>

        <section className="intro">
          <h1>
            The side
            <br />
            quest <span>economy.</span>
          </h1>
          <div className="intro-note">
            <div className="issue">VOL. 005</div>
            <p>An audit of everything except what you came here to do.</p>
          </div>
        </section>

        <section className="brief" aria-label="Your assignment">
          <div>
            <span className="eyebrow">The entire assignment</span>
            <strong>Change one button.</strong>
          </div>
          <div className="estimate">
            <span className="eyebrow">Original estimate</span>
            <strong>5 minutes. Probably.</strong>
          </div>
          <button
            type="button"
            className={`sample ${sampleDone ? "done" : ""}`}
            id="sample"
            aria-label="Preview button, click to inspect"
            onClick={handleSampleClick}
          >
            {sampleDone ? "Changed. Finally. ↗" : "The button ↗"}
          </button>
        </section>

        <section className="choices" id="choices" aria-labelledby="choices-title">
          <div className="flow-guide" aria-label="How this works">
            <span
              data-step="1"
              className={currentStep === 1 ? "active" : currentStep > 1 ? "complete" : ""}
            >
              <b>01</b> Choose a detour
            </span>
            <span
              data-step="2"
              className={currentStep === 2 ? "active" : currentStep > 2 ? "complete" : ""}
            >
              <b>02</b> Watch the bars grow
            </span>
            <span
              data-step="3"
              className={currentStep === 3 ? "active" : ""}
            >
              <b>03</b> Finish the task
            </span>
          </div>

          <div className="choices-header">
            <div>
              <span className="eyebrow">Your first decision</span>
              <h2 id="choices-title">Take a side quest—or do the work.</h2>
            </div>
            <p>Tap a card below. Some bad decisions unlock worse decisions.</p>
          </div>

          <div className="menu" id="menu" aria-label="Available side quests">
            {QUESTS.map((quest, index) => {
              const isAvail = available(quest);
              return (
                <button
                  key={index}
                  type="button"
                  className="quest"
                  id={`quest-${index}`}
                  disabled={done || !isAvail}
                  onClick={() => take(index)}
                >
                  <span className="cost">
                    <span>0{index + 1}</span>
                    <span>+{quest.cost} MIN ↗</span>
                  </span>
                  <b>{quest.title}</b>
                  <span className="excuse">{quest.excuse}</span>
                  <span className="unlock" id={`unlock-${index}`}>
                    {done
                      ? "Expense account closed"
                      : isAvail
                      ? "Available for poor decisions"
                      : quest.unlock}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="status" id="status" aria-live="polite" aria-atomic="true">
            {statusMsg}
          </p>

          <div className="actions">
            <div className="action-summary" aria-live="polite">
              <span>Time charged</span>
              <strong id="actionTime">{time(total)}</strong>
              <small>
                <span id="actionCount">{detours}</span> detours
              </small>
            </div>
            <button
              className="finish"
              id="finish"
              disabled={done}
              onClick={handleFinish}
            >
              Change the button ↗
            </button>
            <button
              className="random"
              id="random"
              disabled={done}
              onClick={handleRandom}
            >
              Surprise me ↝
            </button>
            <button
              className="reset"
              id="reset"
              hidden={detours === 0 && !done}
              onClick={handleReset}
            >
              Start over
            </button>
          </div>
        </section>

        <div className="workspace">
          <section aria-labelledby="chart-title">
            <div className="section-title">
              <h2 id="chart-title">Where the time went</h2>
              <small>SIMULATED MINUTES / NOT TO SCALE? IT IS.</small>
            </div>
            <div
              className="chart"
              id="chart"
              role="img"
              aria-label={`Time spent in simulated minutes. ${categories
                .map((c) => `${c.name}: ${c.minutes}`)
                .join("; ")}. Scale: 0 to ${scale} minutes.`}
            >
              {categories.map((category, index) => {
                const widthPct = (category.minutes / scale) * 100;
                return (
                  <div key={index} className="chart-row">
                    <span className="name">{category.name}</span>
                    <div className="track">
                      <div
                        className="bar"
                        id={`bar-${index}`}
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                    <span className="value" id={`value-${index}`}>
                      {category.minutes} min
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="axis" id="axis" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index}>{(scale * index) / 4}</span>
              ))}
            </div>

            <p className="chart-caption">
              Every detour is billable. Unfortunately, you are also the client.
            </p>

            <div className="totals">
              <div>
                <span className="eyebrow">Actual work</span>
                <strong className="total-number" id="work">
                  {categories[0].minutes} min
                </strong>
              </div>
              <div>
                <span className="eyebrow">Side quests</span>
                <strong className="total-number red" id="waste">
                  {total - categories[0].minutes} min
                </strong>
              </div>
              <div>
                <span className="eyebrow">Detours taken</span>
                <strong className="total-number" id="count">
                  {String(detours).padStart(2, "0")}
                </strong>
              </div>
            </div>
          </section>

          <aside className="aside">
            <div>
              <span className="eyebrow">Time charged to this task</span>
              <div className="clock">
                <span id="clock">{time(total)}</span>
                <small>h:m</small>
              </div>
              <span className="eyebrow">Budget: 00:05</span>
              <div className="stamp" id="stamp">
                {stampText}
              </div>
            </div>
            <div>
              <p className="log-title">Notes from the incident</p>
              <ol className="log" id="log">
                {logs.map((logItem, idx) => (
                  <li key={idx}>
                    <time>{logItem.time}</time>
                    {logItem.text}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {done && (
          <section
            className="receipt"
            id="receipt"
            aria-labelledby="receipt-title"
          >
            <span className="eyebrow">
              Department of Unfinished Business / closing statement
            </span>
            <h2 id="receipt-title" tabIndex={-1} ref={receiptTitleRef}>
              The button has been changed.
            </h2>
            <p id="receipt-total">
              A 5-minute task completed in <strong>{total} minutes</strong>.{" "}
              {(total / 5).toFixed(1)}× the original estimate.
            </p>
            <p id="receipt-comment">
              {detours === 0
                ? "You completed the task without a single detour. Suspiciously professional."
                : `${detours} detour${detours === 1 ? "" : "s"}. ${
                    total - 5
                  } minutes spent preparing to spend 5 minutes.`}
            </p>
            <p>Payment method: your one finite life.</p>
          </section>
        )}

        <footer>
          <span>SQE / ALL FIGURES ARE SELF-INFLICTED.</span>
          <span>CODEPEN CHALLENGE · LINES & BARS</span>
        </footer>
      </main>
    </div>
  );
}
