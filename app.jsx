const { useState, useMemo } = React;

// Minimal dependency-free icon set (standalone build has no bundler, so lucide-react's
// module isn't usable here — these are simplified stand-ins with the same names/props).
function IconBase({ size = 16, style, className, fill = "none", children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      {children}
    </svg>
  );
}
const Check = (p) => <IconBase {...p}><polyline points="4 12 9 17 20 6" /></IconBase>;
const X = (p) => <IconBase {...p}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></IconBase>;
const Circle = (p) => <IconBase {...p} fill={p.fill || "none"}><circle cx="12" cy="12" r="9" /></IconBase>;
const Trash2 = (p) => <IconBase {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" /></IconBase>;
const ArrowUp = (p) => <IconBase {...p}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" /></IconBase>;
const ArrowDown = (p) => <IconBase {...p}><line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" /></IconBase>;
const ChevronRight = (p) => <IconBase {...p}><polyline points="9 6 15 12 9 18" /></IconBase>;
const ChevronDown = (p) => <IconBase {...p}><polyline points="6 9 12 15 18 9" /></IconBase>;
const Search = (p) => <IconBase {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></IconBase>;
const Grid3x3 = (p) => <IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></IconBase>;
const Users = (p) => <IconBase {...p}><circle cx="8" cy="8" r="3.2" /><circle cx="16" cy="10" r="3.2" /><path d="M2.5 20c0-3 2.8-5.2 5.9-5.2s5.6 2 5.8 4.6" /><path d="M12.3 19.4c.3-2.6 2.7-4.6 5.6-4.6 3 0 5.6 2.2 5.6 5.2" /></IconBase>;
const User = (p) => <IconBase {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></IconBase>;
const Wrench = (p) => <IconBase {...p}><path d="M14.7 6.3a4 4 0 11-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 015.4-5.4l-2.8 2.8-2-2z" /></IconBase>;
const DoorOpen = (p) => <IconBase {...p}><path d="M3 21h4M13 21h8M6 21V4.6L14 3v18M14 12h.01" /></IconBase>;
const History = (p) => <IconBase {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" /><path d="M3 7v4h4" /></IconBase>;


const SUSPECTS = ["Miss Scarlet", "Colonel Mustard", "Mrs. White", "Reverend Green", "Mrs. Peacock", "Professor Plum"];
const WEAPONS = ["Candlestick", "Knife", "Lead Pipe", "Revolver", "Rope", "Wrench"];
const ROOMS = ["Ball Room", "Billiard Room", "Conservatory", "Dining Room", "Hall", "Kitchen", "Library", "Lounge", "Study"];
const CATEGORIES = [
  { name: "suspect", label: "Suspect", icon: User, cards: SUSPECTS, color: "#7c8fdb" },
  { name: "weapon", label: "Weapon", icon: Wrench, cards: WEAPONS, color: "#e0685c" },
  { name: "room", label: "Room", icon: DoorOpen, cards: ROOMS, color: "#4fb89c" },
];
const ALL_CARDS = [...SUSPECTS, ...WEAPONS, ...ROOMS];
const k = (p, c) => `${p}__${c}`;
const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function solve(players, handSizes, youName, yourHand, suggestions) {
  const status = {};
  players.forEach((p) => ALL_CARDS.forEach((c) => (status[k(p, c)] = "unknown")));
  ALL_CARDS.forEach((c) => {
    status[k(youName, c)] = yourHand.includes(c) ? "yes" : "no";
  });

  const constraints = [];
  suggestions.forEach((s) => {
    const cards = [s.suspect, s.weapon, s.room].filter(Boolean);
    s.passed.forEach((p) => cards.forEach((c) => { if (status[k(p, c)] !== "yes") status[k(p, c)] = "no"; }));
    if (s.shownBy) {
      if (s.suggester === youName && s.shownCard) {
        status[k(s.shownBy, s.shownCard)] = "yes";
      } else if (cards.length === 3) {
        constraints.push({ id: s.id, player: s.shownBy, cards, resolved: false });
      }
    }
  });

  let changed = true;
  while (changed) {
    changed = false;
    ALL_CARDS.forEach((card) => {
      const owner = players.find((p) => status[k(p, card)] === "yes");
      if (owner) {
        players.forEach((p) => {
          if (p !== owner && status[k(p, card)] !== "no") {
            status[k(p, card)] = "no";
            changed = true;
          }
        });
      }
    });
    constraints.forEach((c) => {
      if (c.resolved) return;
      const yesCard = c.cards.find((card) => status[k(c.player, card)] === "yes");
      if (yesCard) { c.resolved = true; return; }
      const noCards = c.cards.filter((card) => status[k(c.player, card)] === "no");
      if (noCards.length === 2) {
        const remaining = c.cards.find((card) => !noCards.includes(card));
        if (status[k(c.player, remaining)] !== "yes") {
          status[k(c.player, remaining)] = "yes";
          changed = true;
        }
        c.resolved = true;
      } else if (noCards.length === 3) {
        c.resolved = true;
      }
    });
    players.forEach((p) => {
      const size = handSizes[p];
      if (!size) return;
      const yesCards = ALL_CARDS.filter((c) => status[k(p, c)] === "yes");
      const noCards = ALL_CARDS.filter((c) => status[k(p, c)] === "no");
      if (yesCards.length >= size) {
        ALL_CARDS.forEach((c) => {
          if (status[k(p, c)] === "unknown") { status[k(p, c)] = "no"; changed = true; }
        });
      } else if (noCards.length === ALL_CARDS.length - size) {
        ALL_CARDS.forEach((c) => {
          if (status[k(p, c)] === "unknown") { status[k(p, c)] = "yes"; changed = true; }
        });
      }
    });
    CATEGORIES.forEach((cat) => {
      const withOwner = cat.cards.filter((card) => players.some((p) => status[k(p, card)] === "yes"));
      if (withOwner.length === cat.cards.length - 1) {
        const envCard = cat.cards.find((c) => !withOwner.includes(c));
        players.forEach((p) => {
          if (status[k(p, envCard)] !== "no") {
            status[k(p, envCard)] = "no";
            changed = true;
          }
        });
      }
    });
  }

  const envelope = {};
  CATEGORIES.forEach((cat) => {
    const noEverywhere = cat.cards.filter((card) => players.every((p) => status[k(p, card)] === "no"));
    envelope[cat.name] = noEverywhere.length === 1 ? noEverywhere[0] : null;
  });

  return { status, envelope };
}

function StatusDot({ value }) {
  if (value === "yes") return <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center shrink-0"><Check size={13} /></div>;
  if (value === "no") return <div className="w-6 h-6 rounded-full bg-rose-950 text-rose-300/70 flex items-center justify-center shrink-0"><X size={13} /></div>;
  return <div className="w-6 h-6 rounded-full bg-[#232230] text-[#4a4858] flex items-center justify-center shrink-0"><Circle size={7} fill="currentColor" /></div>;
}

function Logo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="wgold" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#e8c766" />
          <stop offset="1" stopColor="#a8791f" />
        </linearGradient>
      </defs>
      <circle cx="19" cy="19" r="14" stroke="url(#wgold)" strokeWidth="3" />
      <line x1="29" y1="29" x2="41" y2="41" stroke="url(#wgold)" strokeWidth="4" strokeLinecap="round" />
      <text x="19" y="25" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontSize="16" fill="#e8c766">W</text>
    </svg>
  );
}

// Estimated likelihood a still-unsolved card is the case-file answer.
// Heuristic, not a full probability model: fewer remaining "unknown" holders
// for a card means fewer people who could still be hiding it in their hand,
// so it's weighted as more likely to be the envelope card.
function computeLikelihoods(players, status, envelope, cat) {
  if (envelope[cat.name]) return [{ card: envelope[cat.name], pct: 100 }];
  const candidates = cat.cards.filter((c) => !players.some((p) => status[k(p, c)] === "yes"));
  if (candidates.length === 0) return [];
  const weights = candidates.map((c) => {
    const unknownHolders = players.filter((p) => status[k(p, c)] === "unknown").length;
    return { card: c, weight: 1 / (unknownHolders + 1) };
  });
  const total = weights.reduce((s, w) => s + w.weight, 0);
  return weights
    .map((w) => ({ card: w.card, pct: Math.round((w.weight / total) * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

// When you have more than one card that could be shown, prefer whichever gives
// away the least new information: a card you've already shown to this same
// suggester before (they've already seen it, so re-showing tells them nothing
// new), then a card you've shown to anyone before, then fall back to the first match.
function pickStrategicCard(candidates, suggestions, youName, suggesterName) {
  if (candidates.length <= 1) return candidates[0] || null;
  const shownToThisSuggester = candidates.find((c) =>
    suggestions.some((s) => s.shownBy === youName && s.shownCard === c && s.suggester === suggesterName)
  );
  if (shownToThisSuggester) return shownToThisSuggester;
  const shownBefore = candidates.find((c) =>
    suggestions.some((s) => s.shownBy === youName && s.shownCard === c)
  );
  if (shownBefore) return shownBefore;
  return candidates[0];
}

const MOTIVES = {
  "Miss Scarlet": (n) => [`${n} was sitting on a string of debts everyone assumed were long buried`, `${n} carried a rivalry no one else took seriously — until now`],
  "Colonel Mustard": (n) => [`${n} watched an inheritance about to slip through their fingers`, `${n} was hiding an old disgrace someone had threatened to expose`],
  "Mrs. White": (n) => [`${n} had found a blackmail note meant for someone else's pocket`, `${n} had spent years being overlooked, and it finally boiled over`],
  "Reverend Green": (n) => [`${n} was one scandal away from losing a career built on appearances`, `${n} owed a debt of honor no confession could settle`],
  "Mrs. Peacock": (n) => [`${n} was hiding a marriage the family could never learn of`, `${n} was about to be cut from a will being rewritten that very week`],
  "Professor Plum": (n) => [`${n} had stolen an idea about to be exposed as theft`, `${n} refused to share credit for a discovery that wasn't only theirs`],
};
const METHODS = {
  "Candlestick": (w, n) => [`the ${w} did its work — swift and close, improvised the moment the lights failed`, `a single blow from the ${w}, struck in the dark by ${n} before anyone could react`],
  "Knife": (w, n) => [`the ${w} was quick and precise, over before a sound could carry`, `one decisive motion from ${n} with the ${w}, then silence`],
  "Lead Pipe": (w, n) => [`the ${w} left no doubt — blunt, brutal, deliberate`, `${n} struck with the ${w}, too heavy to ever pass as an accident`],
  "Revolver": (w, n) => [`a single shot from the ${w}, muffled just enough to be missed`, `${n} risked the ${w} — loud enough to give it all away, which is exactly why no one expected it`],
  "Rope": (w, n) => [`the ${w} was patient and methodical, planned by ${n} well before the evening began`, `quiet enough with the ${w} that no one two rooms away heard a thing`],
  "Wrench": (w, n) => [`${n} improvised with the ${w} — whatever was close at hand`, `brutal in its simplicity: the ${w}, and a moment of opportunity`],
};
const OPPORTUNITIES = {
  "Ball Room": (r, o) => [`in the ${r}, during the one song loud enough to cover anything, while the rest of the house was drawn toward the ${o}`, `in the ${r}, with every eye on the dance floor instead of the ${o}`],
  "Billiard Room": (r, o) => [`in the ${r}, between games, while everyone assumed the noise from the ${o} accounted for their absence`, `in the ${r}, under cover of the click of billiard balls, while the ${o} held everyone else's attention`],
  "Conservatory": (r, o) => [`in the ${r}, among the plants where footsteps go unheard, while the crowd stayed in the ${o}`, `in the ${r}, the one room the staff rarely entered after dark, while everyone else lingered in the ${o}`],
  "Dining Room": (r, o) => [`in the ${r}, in the lull between courses, while attention stayed fixed on the ${o}`, `in the ${r}, while the staff cleared the previous course and every guest was still occupied with the ${o}`],
  "Hall": (r, o) => [`in the ${r}, in the one crossing everyone assumed someone else was watching, while the real attention was on the ${o}`, `in the ${r}, in the brief moment between rooms, while the ${o} kept everyone else occupied`],
  "Kitchen": (r, o) => [`in the ${r}, amid the noise and steam where nothing seems out of place, while guests stayed put in the ${o}`, `in the ${r}, while the staff's attention was entirely on the ovens and the guests' on the ${o}`],
  "Library": (r, o) => [`in the ${r}, behind a door no one thought to question, while everyone else was distracted in the ${o}`, `in the ${r}, in the quiet everyone mistook for solitude, while the ${o} held the rest of the house`],
  "Lounge": (r, o) => [`in the ${r}, in the comfort everyone assumes is safe, while attention was elsewhere in the ${o}`, `in the ${r}, while drinks were poured and no one was truly watching, distracted instead by the ${o}`],
  "Study": (r, o) => [`in the ${r}, behind a locked door built for privacy, while the ${o} kept everyone else occupied`, `in the ${r}, where every conversation that evening was assumed confidential, while the crowd stayed in the ${o}`],
};

const OPENERS = [
  "Ladies and gentlemen — if you'll indulge me a moment.",
  "If everyone could stay seated a moment longer — this won't take long.",
  "Before anyone leaves this room, allow me a moment of your attention.",
];
const ELIMINATION_LINES = [
  (n) => `Across ${n} suggestion${n === 1 ? "" : "s"}, every denial, every hesitation, every card reluctantly shown told its own small truth.`,
  (n) => `It took ${n} suggestion${n === 1 ? "" : "s"} to strip away every alibi that couldn't hold up to scrutiny.`,
  (n) => `${n} suggestion${n === 1 ? "" : "s"} in, and one by one, every other explanation quietly ran out of road.`,
];
const CLOSERS = [
  "There is only one conclusion left standing.",
  "Once you remove the impossible, what remains — however unwelcome — is the truth.",
  "Every other name, every other room, every other weapon has been accounted for. Only one story fits.",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function revealSpeech(envelope, suggestionCount) {
  const { suspect, weapon, room } = envelope;
  const otherRooms = ROOMS.filter((r) => r !== room);
  const distractionRoom = otherRooms.length ? pick(otherRooms) : "next room";

  const motiveFn = MOTIVES[suspect];
  const methodFn = METHODS[weapon];
  const oppFn = OPPORTUNITIES[room];

  const motive = motiveFn ? pick(motiveFn(suspect)) : `${suspect} had a motive that only became clear too late`;
  const method = methodFn ? pick(methodFn(weapon, suspect)) : `it was quick, and over before anyone could react`;
  const opportunity = oppFn ? pick(oppFn(room, distractionRoom)) : `a moment alone ${suspect} can't account for`;

  return `${pick(OPENERS)}

${pick(ELIMINATION_LINES)(suggestionCount)}

The motive: ${motive}. The method: ${method}. The opportunity came ${opportunity}.

${pick(CLOSERS)}

It was ${suspect}, with the ${weapon}, in the ${room}.`;
}

let idCounter = 0;
const nextId = () => `p${idCounter++}`;

const makeDefaultRoster = () => ([
  { id: nextId(), name: "Player 1", handSize: 0 },
  { id: nextId(), name: "Player 2", handSize: 0 },
  { id: nextId(), name: "Player 3", handSize: 0 },
  { id: nextId(), name: "Player 4", handSize: 0 },
]);

function Watson() {
  const [tab, setTab] = useState("setup");
  const [roster, setRoster] = useState(makeDefaultRoster);
  const [youId] = useState(() => roster[0].id); // fixed at setup — you are always this seat
  const [highIds, setHighIds] = useState(new Set()); // players who get the "extra" card when it can't split evenly
  const [yourHand, setYourHand] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [openCategory, setOpenCategory] = useState("suspect");

  const [builder, setBuilder] = useState(null);
  const [active, setActive] = useState(null);
  const [accusationPicker, setAccusationPicker] = useState(null);
  const [accusation, setAccusation] = useState(null);
  const [revealText, setRevealText] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("watson-game-history");
      if (raw) setGameHistory(JSON.parse(raw));
    } catch (e) {
      // no history saved yet, or storage unavailable
    }
  }, []);

  const persistHistory = (list) => {
    try { localStorage.setItem("watson-game-history", JSON.stringify(list)); } catch (e) { /* ignore */ }
  };

  const recordResult = (result, shownAccusation, currentSuggestionCount, currentPlayerCount) => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      suspect: shownAccusation.suspect,
      weapon: shownAccusation.weapon,
      room: shownAccusation.room,
      result,
      suggestionCount: currentSuggestionCount,
      playerCount: currentPlayerCount,
    };
    const next = [entry, ...gameHistory];
    setGameHistory(next);
    persistHistory(next);
    setYourHand([]);
    setSuggestions([]);
    setAccusation(null);
    setRevealText(null);
    setTab("history");
  };
  const clearHistory = () => { setGameHistory([]); persistHistory([]); };

  const players = roster.map((r) => r.name);
  const youName = roster.find((r) => r.id === youId)?.name ?? players[0];
  const numPlayers = roster.length;
  const baseHand = Math.floor(18 / numPlayers);
  const remainder = 18 % numPlayers; // this many players get baseHand + 1

  const handSizes = useMemo(() => {
    const map = {};
    roster.forEach((r) => { map[r.name] = baseHand + (highIds.has(r.id) ? 1 : 0); });
    return map;
  }, [roster, baseHand, highIds]);
  const totalDealt = Object.values(handSizes).reduce((a, b) => a + b, 0);
  const highCountOk = remainder === 0 || highIds.size === remainder;

  const { status, envelope } = useMemo(
    () => solve(players, handSizes, youName, yourHand, suggestions),
    [players.join("|"), handSizes, youName, yourHand, suggestions]
  );
  const solvedCount = Object.values(envelope).filter(Boolean).length;
  const shownAccusation = accusation || (solvedCount === 3 ? envelope : null);

  React.useEffect(() => {
    if (shownAccusation) {
      setRevealText(revealSpeech(shownAccusation, suggestions.length));
    } else {
      setRevealText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownAccusation?.suspect, shownAccusation?.weapon, shownAccusation?.room]);

  React.useEffect(() => {
    // reset the default "extra card" assignment whenever the player count changes
    const rem = 18 % roster.length;
    const ids = roster.slice(0, rem).map((r) => r.id);
    setHighIds(new Set(ids));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster.length]);

  const setPlayerCount = (n) => {
    n = Math.max(2, Math.min(8, n));
    setRoster((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ id: nextId(), name: `Player ${next.length + 1}`, handSize: 0 });
      while (next.length > n) {
        let idx = next.length - 1;
        while (idx >= 0 && next[idx].id === youId) idx--;
        if (idx < 0) break;
        next.splice(idx, 1);
      }
      return next;
    });
  };
  const renamePlayer = (idx, name) => setRoster((prev) => prev.map((r, i) => (i === idx ? { ...r, name } : r)));
  const setPlayerHigh = (id, high) => setHighIds((prev) => {
    const next = new Set(prev);
    if (high) next.add(id); else next.delete(id);
    return next;
  });
  const movePlayer = (idx, dir) => {
    setRoster((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const yourHandSize = handSizes[youName] ?? baseHand;
  const toggleHandCard = (card) => setYourHand((h) => {
    if (h.includes(card)) return h.filter((c) => c !== card);
    if (h.length >= yourHandSize) return h;
    return [...h, card];
  });

  const bestGuess = (cat) => envelope[cat.name] || computeLikelihoods(players, status, envelope, cat)[0]?.card || "";
  const startBuilder = () => setBuilder({
    suggesterId: youId,
    suspect: bestGuess(CATEGORIES[0]),
    weapon: bestGuess(CATEGORIES[1]),
    room: bestGuess(CATEGORIES[2]),
  });
  const startAccusationPicker = () => setAccusationPicker({
    suspect: bestGuess(CATEGORIES[0]),
    weapon: bestGuess(CATEGORIES[1]),
    room: bestGuess(CATEGORIES[2]),
  });
  const submitAccusation = () => {
    if (!accusationPicker.suspect || !accusationPicker.weapon || !accusationPicker.room) return;
    setAccusation({ ...accusationPicker });
    setAccusationPicker(null);
  };
  const beginAsking = () => {
    if (!builder.suspect || !builder.weapon || !builder.room) return;
    const startIdx = roster.findIndex((r) => r.id === builder.suggesterId);
    const order = [];
    for (let i = 1; i < roster.length; i++) order.push(roster[(startIdx + i) % roster.length].name);
    const suggesterName = roster.find((r) => r.id === builder.suggesterId).name;
    setActive({ suggester: suggesterName, suspect: builder.suspect, weapon: builder.weapon, room: builder.room, order, stepIndex: 0, passed: [], pickingCard: false, shownBy: null });
    setBuilder(null);
  };
  const cancelActive = () => setActive(null);

  const finalizeSuggestion = (shownBy, shownCard) => {
    setSuggestions((s) => [...s, {
      id: Date.now(),
      suggester: active.suggester,
      suspect: active.suspect,
      weapon: active.weapon,
      room: active.room,
      passed: active.passed,
      shownBy: shownBy || null,
      shownCard: shownCard || null,
    }]);
    setActive(null);
  };

  const markPassed = () => {
    const current = active.order[active.stepIndex];
    const passed = [...active.passed, current];
    if (active.stepIndex + 1 >= active.order.length) {
      finalizeSuggestion(null, null);
    } else {
      setActive({ ...active, passed, stepIndex: active.stepIndex + 1 });
    }
  };
  const markShowed = () => {
    const current = active.order[active.stepIndex];
    if (active.suggester === youName) {
      setActive({ ...active, pickingCard: true, shownBy: current });
    } else {
      finalizeSuggestion(current, null);
    }
  };
  const pickShownCard = (card) => finalizeSuggestion(active.shownBy, card);
  const removeSuggestion = (id) => setSuggestions((s) => s.filter((x) => x.id !== id));

  const TABS = [
    { id: "setup", label: "Setup", icon: Users },
    { id: "play", label: "Play", icon: Search },
    { id: "grid", label: "Grid", icon: Grid3x3 },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#121118] text-[#e8e3d6] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-5 pb-4 bg-[#121118]/95 backdrop-blur-md border-b border-[#2a2836]">
        <div className="flex items-center gap-3 mb-3.5">
          <Logo />
          <div>
            <h1 className="text-2xl leading-none" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}>Watson</h1>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#6b687c]">Case File</span>
          </div>
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => {
            const solved = envelope[cat.name];
            const Icon = cat.icon;
            const c = solved ? "#d4a531" : cat.color;
            return (
              <div key={cat.name}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
                style={{ backgroundColor: `${c}18`, borderColor: `${c}40` }}>
                <Icon size={12} style={{ color: c }} />
                <span className="text-xs font-medium truncate max-w-[72px]" style={{ color: c }}>
                  {solved || "—"}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto">
        {shownAccusation && (
          <div className="mb-4 space-y-3">
            <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 pl-4 pr-4 py-4 border-l-4 border-l-[#d4a531]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-[#d4a531] mb-1.5">
                    {accusation ? "Your Accusation" : "Ready to Accuse"}
                  </p>
                  <p className="text-lg leading-snug text-[#f2efe4]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}>
                    {shownAccusation.suspect}, with the {shownAccusation.weapon}, in the {shownAccusation.room}.
                  </p>
                </div>
                {accusation && (
                  <button onClick={() => setAccusation(null)} className="text-[10px] text-[#6b687c] underline shrink-0 mt-1">clear</button>
                )}
              </div>
            </div>
            <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-[#d4a531]">The Reveal — say this out loud</p>
                <button onClick={() => setRevealText(revealSpeech(shownAccusation, suggestions.length))}
                  className="text-[10px] text-[#6b687c] underline shrink-0">retell</button>
              </div>
              <p className="text-sm text-[#c9c5d8] whitespace-pre-line leading-relaxed">
                {revealText}
              </p>
            </div>
            <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4">
              <p className="text-xs text-[#8a8798] mb-3">Made the accusation at the table? How'd it go?</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => recordResult("correct", shownAccusation, suggestions.length, players.length)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-700 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] hover:bg-emerald-600">
                  <Check size={14} /> Correct
                </button>
                <button onClick={() => recordResult("incorrect", shownAccusation, suggestions.length, players.length)}
                  className="flex items-center justify-center gap-1.5 bg-rose-900 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] hover:bg-rose-800">
                  <X size={14} /> Incorrect
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "play" && solvedCount < 3 && (
          <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#6b687c] mb-3">Leading Theory</p>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const top = computeLikelihoods(players, status, envelope, cat).slice(0, 3);
                const Icon = cat.icon;
                return (
                  <div key={cat.name}>
                    <p className="flex items-center gap-1.5 text-xs text-[#8a8798] mb-1.5">
                      <Icon size={12} style={{ color: cat.color }} /> {cat.label}
                    </p>
                    <div className="space-y-1">
                      {top.map((t, i) => (
                        <div key={t.card} className="flex items-center gap-2">
                          <span className={`text-xs w-28 truncate ${i === 0 ? "text-[#e8e3d6]" : "text-[#6b687c]"}`}>{t.card}</span>
                          <div className="flex-1 h-1.5 bg-[#121118] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${t.pct}%`, backgroundColor: t.pct === 100 ? "#d4a531" : cat.color }} />
                          </div>
                          <span className="text-[10px] text-[#6b687c] w-9 text-right">{t.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-[#4a4858] mt-3">Estimated from what's been ruled out so far — not a certainty until fully solved.</p>
          </div>
        )}

        {tab === "play" && (
          <div className="space-y-4">
            {!builder && !active && !accusationPicker && (
              <div className="flex gap-2">
                <button onClick={startBuilder}
                  className="flex-1 bg-[#d4a531] text-[#121118] font-semibold py-3.5 rounded-xl text-sm shadow-md shadow-[#d4a531]/20 transition-all active:scale-[0.98] hover:brightness-105">
                  Log a New Suggestion
                </button>
                <button onClick={startAccusationPicker}
                  className="flex-1 bg-[#1b1a24] border border-[#2a2836] text-[#e8e3d6] font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] hover:border-[#3a3846]">
                  Make an Accusation
                </button>
              </div>
            )}

            {accusationPicker && (
              <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-[#6b687c]">Accuse...</p>
                <div className="grid grid-cols-1 gap-2">
                  <select value={accusationPicker.suspect} onChange={(e) => setAccusationPicker((b) => ({ ...b, suspect: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a suspect...</option>
                    {SUSPECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={accusationPicker.weapon} onChange={(e) => setAccusationPicker((b) => ({ ...b, weapon: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a weapon...</option>
                    {WEAPONS.map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <select value={accusationPicker.room} onChange={(e) => setAccusationPicker((b) => ({ ...b, room: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a room...</option>
                    {ROOMS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <p className="text-[10px] text-[#6b687c]">Pre-filled with Watson's current best guess — change any of these before accusing.</p>
                <div className="flex gap-2">
                  <button onClick={submitAccusation}
                    className="flex-1 bg-[#d4a531] text-[#121118] font-semibold py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] hover:brightness-105">
                    Accuse
                  </button>
                  <button onClick={() => setAccusationPicker(null)} className="px-4 text-[#8a8798] text-sm">Cancel</button>
                </div>
              </div>
            )}

            {builder && (
              <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-[#6b687c]">Who's suggesting?</p>
                <select value={builder.suggesterId} onChange={(e) => setBuilder((b) => ({ ...b, suggesterId: e.target.value }))}
                  className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                  {roster.map((r) => <option key={r.id} value={r.id}>{r.name}{r.id === youId ? " (you)" : ""}</option>)}
                </select>
                <p className="text-xs uppercase tracking-widest text-[#6b687c] pt-1">Suggests...</p>
                {builder.suggesterId === youId && (
                  <p className="text-[10px] text-[#6b687c] -mt-1">Pre-filled with Watson's best guess for your turn — change any of these to record what actually happened.</p>
                )}
                <div className="grid grid-cols-1 gap-2">
                  <select value={builder.suspect} onChange={(e) => setBuilder((b) => ({ ...b, suspect: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a suspect...</option>
                    {SUSPECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <select value={builder.weapon} onChange={(e) => setBuilder((b) => ({ ...b, weapon: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a weapon...</option>
                    {WEAPONS.map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <select value={builder.room} onChange={(e) => setBuilder((b) => ({ ...b, room: e.target.value }))}
                    className="w-full bg-[#121118] border border-[#2a2836] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4a531]/60 focus:border-[#d4a531]/60 transition-colors">
                    <option value="">Choose a room...</option>
                    {ROOMS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={beginAsking}
                    className="flex-1 bg-[#d4a531] text-[#121118] font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-1 transition-all active:scale-[0.98] hover:brightness-105">
                    Start Asking <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setBuilder(null)} className="px-4 text-[#8a8798] text-sm">Cancel</button>
                </div>
              </div>
            )}

            {active && !active.pickingCard && (() => {
              const askedPlayer = active.order[active.stepIndex];
              const isYourTurn = askedPlayer === youName;
              const candidates = isYourTurn ? [active.suspect, active.weapon, active.room].filter((c) => yourHand.includes(c)) : [];
              const yourMatch = isYourTurn ? pickStrategicCard(candidates, suggestions, youName, active.suggester) : null;
              const alreadyShownToThem = yourMatch && suggestions.some((s) => s.shownBy === youName && s.shownCard === yourMatch && s.suggester === active.suggester);
              const alreadyShownToOthers = yourMatch && !alreadyShownToThem && suggestions.some((s) => s.shownBy === youName && s.shownCard === yourMatch);
              return (
                <div className="bg-[#1b1a24] border border-[#d4a53150] rounded-2xl shadow-lg shadow-black/20 p-4">
                  <p className="text-xs text-[#8a8798] mb-3">
                    <span className="text-[#e8e3d6]">{active.suggester}</span> suggests {active.suspect}, the {active.weapon}, in the {active.room}
                  </p>
                  <div className="bg-[#121118] rounded-lg p-4 mb-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#6b687c] mb-1">Asking</p>
                    <p className="text-2xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: "#d4a531" }}>
                      {askedPlayer}{isYourTurn ? " (you)" : ""}
                    </p>
                  </div>
                  {isYourTurn ? (
                    <div className="mb-3">
                      <p className="text-sm text-[#c9c5d8] mb-1.5">
                        {yourMatch
                          ? <>You have the <span className="text-emerald-400">{yourMatch}</span> — show it to {active.suggester}.</>
                          : <>You don't have any of those three — you'll pass.</>}
                      </p>
                      {yourMatch && candidates.length > 1 && (
                        <p className="text-[10px] text-[#6b687c] mb-2">
                          {alreadyShownToThem
                            ? `Recommended: you've already shown ${active.suggester} this card, so it gives away nothing new.`
                            : alreadyShownToOthers
                            ? "Recommended: you've shown this card before, so it stays low-information."
                            : `You could show ${candidates.join(" or ")} — showing ${yourMatch} first.`}
                        </p>
                      )}
                      <button
                        onClick={() => (yourMatch ? finalizeSuggestion(youName, yourMatch) : markPassed())}
                        className="w-full bg-[#d4a531] text-[#121118] font-semibold py-3 rounded-lg text-sm transition-all active:scale-[0.98] hover:brightness-105">
                        Continue
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button onClick={markPassed} className="bg-[#2a2836] py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] hover:bg-[#33323f]">Passed</button>
                      <button onClick={markShowed} className="bg-emerald-700 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98] hover:bg-emerald-600">Showed a card</button>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[#6b687c]">{active.stepIndex + 1} of {active.order.length} asked</p>
                    <button onClick={cancelActive} className="text-[10px] text-[#6b687c] underline">cancel</button>
                  </div>
                </div>
              );
            })()}

            {active && active.pickingCard && (
              <div className="bg-[#1b1a24] border border-[#d4a53150] rounded-2xl shadow-lg shadow-black/20 p-4">
                <p className="text-sm mb-3">Which card did <span className="text-[#d4a531]">{active.shownBy}</span> show you?</p>
                <div className="flex flex-col gap-2">
                  {[active.suspect, active.weapon, active.room].map((c) => (
                    <button key={c} onClick={() => pickShownCard(c)} className="bg-emerald-700 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] hover:bg-emerald-600">{c}</button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div>
                <button onClick={() => setShowLog((s) => !s)} className="flex items-center gap-1 text-xs text-[#8a8798] mb-2">
                  {showLog ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Suggestion history ({suggestions.length})
                </button>
                {showLog && (
                  <div className="space-y-1.5">
                    {suggestions.slice().reverse().map((s) => (
                      <div key={s.id} className="flex items-start justify-between gap-2 text-xs bg-[#1b1a24] rounded-lg px-3 py-2 border border-[#2a2836]">
                        <span className="text-[#8a8798] leading-relaxed">
                          <span className="text-[#e8e3d6]">{s.suggester}</span> → {s.suspect}, {s.weapon}, {s.room}
                          {s.passed.length > 0 && <><br />{s.passed.join(", ")} passed</>}
                          {s.shownBy && <><br />shown by {s.shownBy}{s.shownCard ? ` (${s.shownCard})` : ""}</>}
                          {!s.shownBy && s.passed.length > 0 && <><br />no one could disprove</>}
                        </span>
                        <button onClick={() => removeSuggestion(s.id)} className="text-[#6b687c] hover:text-rose-400 shrink-0"><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "grid" && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-[10px] text-[#8a8798] px-1">
              <span className="flex items-center gap-1.5"><StatusDot value="yes" /> has it</span>
              <span className="flex items-center gap-1.5"><StatusDot value="no" /> doesn't</span>
              <span className="flex items-center gap-1.5"><StatusDot value="unknown" /> unknown</span>
            </div>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isOpen = openCategory === cat.name;
              const c = envelope[cat.name] ? "#d4a531" : cat.color;
              return (
                <div key={cat.name} className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 overflow-hidden border-l-4" style={{ borderLeftColor: c }}>
                  <button onClick={() => setOpenCategory(isOpen ? null : cat.name)}
                    className="w-full flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon size={15} style={{ color: c }} /> {cat.label}
                      {envelope[cat.name] && <span className="text-[10px] text-[#d4a531] ml-1">solved</span>}
                    </span>
                    {isOpen ? <ChevronDown size={16} className="text-[#6b687c]" /> : <ChevronRight size={16} className="text-[#6b687c]" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left font-normal text-[#6b687c] pb-2 pr-2">Card</th>
                              {players.map((p) => (
                                <th key={p} className="font-normal pb-2 px-1">
                                  <div title={p} className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] ${p === youName ? "bg-[#d4a531] text-[#121118]" : "bg-[#2a2836] text-[#8a8798]"}`}>
                                    {initials(p)}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {cat.cards.map((c) => (
                              <tr key={c} className={c === envelope[cat.name] ? "bg-[#d4a53112]" : ""}>
                                <td className={`py-1.5 pr-2 whitespace-nowrap ${c === envelope[cat.name] ? "text-[#d4a531]" : "text-[#e8e3d6]"}`}>{c}</td>
                                {players.map((p) => (
                                  <td key={p} className="py-1.5 px-1">
                                    <div className="flex justify-center"><StatusDot value={status[k(p, c)]} /></div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "setup" && (
          <div className="space-y-4">
            <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs uppercase tracking-widest text-[#6b687c]">Players & Turn Order</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPlayerCount(players.length - 1)} className="w-7 h-7 rounded-full bg-[#2a2836] flex items-center justify-center transition-all active:scale-95">−</button>
                  <span className="w-4 text-center text-sm">{players.length}</span>
                  <button onClick={() => setPlayerCount(players.length + 1)} className="w-7 h-7 rounded-full bg-[#2a2836] flex items-center justify-center transition-all active:scale-95">+</button>
                </div>
              </div>
              <p className="text-[10px] text-[#6b687c] mb-3">
                {remainder === 0
                  ? `Cards split evenly — everyone gets ${baseHand}.`
                  : `Cards can't split evenly — ${remainder} player${remainder === 1 ? "" : "s"} will have ${baseHand + 1}, the rest ${baseHand}.`}
              </p>

              <div className="space-y-2">
                {roster.map((r, idx) => {
                  const isYou = r.id === youId;
                  const isHigh = highIds.has(r.id);
                  return (
                    <div key={r.id} className="flex items-center gap-2 bg-[#121118] border border-[#232230] rounded-lg p-2.5 transition-colors focus-within:border-[#d4a531]/50">
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium ${isYou ? "bg-[#d4a531] text-[#121118]" : "bg-[#2a2836] text-[#6b687c]"}`}>
                        {isYou ? "You" : initials(r.name)}
                      </div>
                      <input value={r.name} onChange={(e) => renamePlayer(idx, e.target.value)}
                        className="bg-transparent text-sm flex-1 min-w-0 outline-none placeholder:text-[#4a4858]" />
                      {remainder === 0 ? (
                        <span className="text-xs text-[#6b687c] w-6 text-center shrink-0">{baseHand}</span>
                      ) : (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setPlayerHigh(r.id, false)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors"
                            style={!isHigh
                              ? { backgroundColor: "#d4a531", borderColor: "#d4a531", color: "#121118" }
                              : { backgroundColor: "transparent", borderColor: "#2a2836", color: "#6b687c" }}>
                            {baseHand}
                          </button>
                          <button onClick={() => setPlayerHigh(r.id, true)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors"
                            style={isHigh
                              ? { backgroundColor: "#d4a531", borderColor: "#d4a531", color: "#121118" }
                              : { backgroundColor: "transparent", borderColor: "#2a2836", color: "#6b687c" }}>
                            {baseHand + 1}
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col shrink-0">
                        <button onClick={() => movePlayer(idx, -1)} disabled={idx === 0} className="text-[#6b687c] disabled:opacity-20"><ArrowUp size={13} /></button>
                        <button onClick={() => movePlayer(idx, 1)} disabled={idx === roster.length - 1} className="text-[#6b687c] disabled:opacity-20"><ArrowDown size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!highCountOk && (
                <p className="text-[10px] text-[#e0685c] mt-3">
                  Select exactly {remainder} player{remainder === 1 ? "" : "s"} to receive {baseHand + 1} cards (currently {highIds.size} selected).
                </p>
              )}
              <p className="text-[10px] text-[#6b687c] mt-3">Row order = seating / turn order. Reorder with the arrows.</p>
            </div>

            <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-[#6b687c]">Your hand</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${yourHand.length === yourHandSize ? "text-[#d4a531]" : "text-[#6b687c]"}`}>
                    {yourHand.length} / {yourHandSize}
                  </span>
                  {yourHand.length > 0 && (
                    <button onClick={() => setYourHand([])} className="text-[10px] text-[#6b687c] underline">clear</button>
                  )}
                </div>
              </div>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="mb-3 last:mb-0">
                  <p className="text-[10px] mb-1.5" style={{ color: cat.color }}>{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.cards.map((c) => {
                      const selected = yourHand.includes(c);
                      const atLimit = !selected && yourHand.length >= yourHandSize;
                      return (
                        <button key={c} onClick={() => toggleHandCard(c)} disabled={atLimit}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                            selected
                              ? "bg-emerald-800 border-emerald-700 text-emerald-100"
                              : atLimit
                              ? "border-[#232230] text-[#4a4858] opacity-50 cursor-not-allowed"
                              : "border-[#2a2836] text-[#8a8798] hover:border-[#3a3846]"
                          }`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[#4a4858] text-center px-2">
              Watson is an unofficial companion app for Clue and is not affiliated with, endorsed by, or sponsored by Hasbro.
            </p>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {gameHistory.length === 0 ? (
              <div className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-6 text-center">
                <History size={22} className="text-[#4a4858] mx-auto mb-2" />
                <p className="text-sm text-[#6b687c]">No games recorded yet. Make an accusation and mark whether it was correct to start building history.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button onClick={clearHistory} className="text-[10px] text-[#6b687c] underline">clear history</button>
                </div>
                {gameHistory.map((g) => (
                  <div key={g.id} className="bg-[#1b1a24] border border-[#2a2836] rounded-2xl shadow-lg shadow-black/20 p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-[#6b687c]">
                        {new Date(g.date).toLocaleDateString()} · {new Date(g.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.result === "correct" ? "bg-emerald-800 text-emerald-100" : "bg-rose-950 text-rose-300"}`}>
                        {g.result === "correct" ? "Correct" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm text-[#e8e3d6]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}>
                      {g.suspect}, with the {g.weapon}, in the {g.room}
                    </p>
                    <p className="text-[10px] text-[#6b687c] mt-1">{g.suggestionCount} suggestion{g.suggestionCount === 1 ? "" : "s"} · {g.playerCount} players</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1b1a24]/95 backdrop-blur-md border-t border-[#2a2836] flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors">
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#d4a531]" />}
              <Icon size={18} className={isActive ? "text-[#d4a531]" : "text-[#6b687c]"} />
              <span className={`text-[10px] ${isActive ? "text-[#d4a531] font-medium" : "text-[#6b687c]"}`}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Watson />);
