import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  Atom,
  Binary,
  Bot,
  BrainCircuit,
  Braces,
  Bug,
  Boxes,
  Cloud,
  Coffee,
  Container,
  Cpu,
  Code2,
  Database,
  FileCode,
  FileText,
  GitBranch,
  Globe,
  Layers,
  LayoutDashboard,
  Network,
  Package,
  Palette,
  Pin,
  Plug,
  Puzzle,
  Search,
  Server,
  Shield,
  Sparkles,
  Table,
  Terminal,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import "./SkillsShowcase.css";

/* ---------- category look & feel ---------- */

const CATEGORY_META = {
  "Core CS": { color: "#f59e0b", to: "#f97316", Icon: Cpu },
  "Programming Languages": { color: "#fb7185", to: "#e11d48", Icon: Code2 },
  Frontend: { color: "#ec4899", to: "#c026d3", Icon: Layers },
  "Backend & Databases": { color: "#8b5cf6", to: "#6366f1", Icon: Database },
  Salesforce: { color: "#0ea5e9", to: "#2563eb", Icon: Cloud },
  "AI, Cloud & DevOps": { color: "#10b981", to: "#0d9488", Icon: Sparkles },
};

const FALLBACK_META = { color: "#8b5cf6", to: "#6366f1", Icon: Code2 };
const metaOf = (type) => CATEGORY_META[type] || FALLBACK_META;

// Only categories whose tab label differs from the category name.
const TAB_LABELS = {
  "Programming Languages": "Languages",
  "Backend & Databases": "Backend & DB",
  "AI, Cloud & DevOps": "AI & Cloud",
};

/* "Sreevi (portfolio)" -> { title: "Sreevi", tag: "portfolio" } */
const parsePlace = (place) => {
  const match = place.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return match ? { title: match[1], tag: match[2] } : { title: place, tag: null };
};

/* Each skill gets its own icon (first matching rule), falling back to its category icon. */
const ICON_RULES = [
  [/system design|architecture/i, Network],
  [/data structures|algorithm/i, Binary],
  [/object.?oriented|\boop\b/i, Boxes],
  [/microservice/i, Puzzle],
  [/javascript/i, Braces],
  [/typescript/i, FileCode],
  [/python/i, Terminal],
  [/^java$/i, Coffee],
  [/react|next\.?js/i, Atom],
  [/html/i, Globe],
  [/css|tailwind|sass|styled/i, Palette],
  [/redux|toolkit/i, Package],
  [/\brag\b|vector|embedding/i, BrainCircuit],
  [/agent|llm|gpt|openai|claude|gemini|langchain|bedrock/i, Bot],
  [/prompt|applied ai|machine learning|\bml\b|\bai\b/i, Sparkles],
  [/apex/i, Zap],
  [/lwc|lightning|aura|visualforce/i, LayoutDashboard],
  [/soql|sosl|search/i, Search],
  [/flow|automation|workflow|integration/i, Workflow],
  [/appexchange|salesforce|sfdx|crm/i, Cloud],
  [/docker|container|kubernetes|k8s/i, Container],
  [/\bgit|ci\/?cd|devops|pipeline|jenkins|github/i, GitBranch],
  [/\baws\b|azure|\bgcp\b|cloud|lambda|\bs3\b/i, Cloud],
  [/sql|mongo|postgres|mysql|redis|dynamo|database/i, Database],
  [/node|express|spring|server|backend/i, Server],
  [/\brest\b|\bapi\b|graphql|webhook/i, Plug],
  [/auth|jwt|oauth|security/i, Shield],
  [/excel|spreadsheet|csv/i, Table],
  [/document|docx|pdf|xml/i, FileText],
  [/\btest|jest|junit|debug/i, Bug],
];

const skillIcon = (skill) =>
  ICON_RULES.find(([test]) => test.test(skill.name))?.[1] || metaOf(skill.type).Icon;

/* ---------- derived data (computed from the skills in the store) ---------- */

function buildSkillsView(skills) {
  const categories = [...new Set(skills.map((skill) => skill.type))];

  const tabs = [
    { key: "all", color: "#8b5cf6", Icon: Sparkles, label: "All", count: skills.length },
    ...categories.map((type) => ({
      key: type,
      ...metaOf(type),
      label: TAB_LABELS[type] || type,
      count: skills.filter((s) => s.type === type).length,
    })),
  ];

  // Top 5 by how widely each skill is used (ties fall back to your own `rank`).
  const topSkills = [...skills]
    .sort((a, b) => b.usedIn.length - a.usedIn.length || a.rank - b.rank)
    .slice(0, 5);

  // The most used skill sets the full bar width in the idle panel.
  const maxUsed = topSkills[0]?.usedIn.length || 1;

  // Round-robin across categories so neighbouring chips alternate colours.
  const buckets = categories.map((type) =>
    skills.filter((skill) => skill.type === type).sort((a, b) => a.rank - b.rank)
  );
  const mixed = [];
  const longest = Math.max(0, ...buckets.map((bucket) => bucket.length));
  for (let i = 0; i < longest; i++) {
    buckets.forEach((bucket) => bucket[i] && mixed.push(bucket[i]));
  }

  const half = Math.ceil(mixed.length / 2);
  const rows = [
    { skills: mixed.slice(0, half), reverse: false },
    { skills: mixed.slice(half), reverse: true },
  ];

  return { skills, categories, tabs, topSkills, maxUsed, rows };
}

/* ---------- hooks ---------- */

function useMediaQuery(query) {
  const subscribe = useCallback(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/* Tracks whether a scroller has more content before / after the visible area.
   Used for the edge shadows on the list (y) and the tab row (x). */
function useScrollEdges(ref, axis) {
  const horizontal = axis === "x";
  const [edges, setEdges] = useState({ start: false, end: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pos = horizontal ? el.scrollLeft : el.scrollTop;
    const size = horizontal ? el.clientWidth : el.clientHeight;
    const total = horizontal ? el.scrollWidth : el.scrollHeight;
    const start = pos > 4;
    const end = pos + size < total - 4;
    setEdges((cur) => (cur.start === start && cur.end === end ? cur : { start, end }));
  }, [ref, horizontal]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [ref, sync]);

  return [edges, sync];
}

/* ---------- hover card for the marquee (mouse only) ---------- */

function SkillTooltip({ skill, rect }) {
  const ref = useRef(null);
  const { color, Icon } = metaOf(skill.type);

  // Positioning happens after render, so the ref is only touched inside an effect.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    let top = rect.bottom + 12;
    if (top + h > window.innerHeight - 12) top = rect.top - 12 - h;
    const left = Math.max(
      12,
      Math.min(window.innerWidth - w - 12, rect.left + rect.width / 2 - w / 2)
    );
    el.style.left = `${left}px`;
    el.style.top = `${Math.max(12, top)}px`;
    el.style.visibility = "visible";
  }, [skill, rect]);

  return createPortal(
    <div
      ref={ref}
      className="skills-showcase__tip"
      style={{ "--c": color, visibility: "hidden" }}
      role="tooltip"
    >
      <span className="skills-showcase__tip-category">
        <Icon size={13} strokeWidth={2.4} /> {skill.type}
      </span>
      <strong className="skills-showcase__tip-name">{skill.name}</strong>
      <span className="skills-showcase__tip-label">Where I&apos;ve used it</span>
      <ul className="skills-showcase__tip-list">
        {skill.usedIn.map((place) => (
          <li key={place}>{parsePlace(place).title}</li>
        ))}
      </ul>
      <span className="skills-showcase__tip-hint">Click to open</span>
    </div>,
    document.body
  );
}

/* ---------- skill card (modal list) ---------- */

function SkillCard({ skill, pinned, peeked, onPin, onPeek, onUnpeek }) {
  const { color, to } = metaOf(skill.type);
  const Icon = skillIcon(skill);

  return (
    <button
      type="button"
      data-pinned={pinned || undefined}
      className={`skills-showcase__skill ${pinned ? "skills-showcase__skill--pinned" : ""} ${
        peeked ? "skills-showcase__skill--peek" : ""
      }`}
      style={{ "--c": color, "--to": to }}
      /* Only real mouse movement counts as hover. A card sliding under a
         still cursor while scrolling reports zero movement, so it is ignored. */
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || (e.movementX === 0 && e.movementY === 0)) return;
        onPeek(skill);
      }}
      onPointerLeave={() => onUnpeek(skill)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && onPeek(skill)}
      onBlur={() => onUnpeek(skill)}
      onClick={() => onPin(skill)}
      aria-pressed={pinned}
    >
      <span className="skills-showcase__skill-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span className="skills-showcase__skill-name">{skill.name}</span>
      <Pin
        className="skills-showcase__pin"
        size={14}
        strokeWidth={2.3}
        fill={pinned ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </button>
  );
}

/* ---------- detail: side panel on desktop, inline on mobile ---------- */

function SkillDetail({ skill, pinned, inline = false, onClose }) {
  const { color, to, Icon: CategoryIcon } = metaOf(skill.type);
  const Icon = skillIcon(skill);

  return (
    <div
      className={`skills-showcase__detail ${inline ? "skills-showcase__detail--inline" : ""}`}
      style={{ "--c": color, "--to": to }}
    >
      <div className="skills-showcase__stage">
        <Icon className="skills-showcase__stage-mark" size={150} strokeWidth={1.2} aria-hidden="true" />

        <div className="skills-showcase__stage-top">
          <span className="skills-showcase__mono">
            <Icon size={inline ? 22 : 26} strokeWidth={2} />
          </span>
          {pinned ? (
            <button type="button" className="skills-showcase__unpin" onClick={onClose}>
              {inline ? <X size={13} strokeWidth={2.6} /> : <Pin size={12} fill="currentColor" />}
              {inline ? "Close" : "Unpin"}
            </button>
          ) : (
            <span className="skills-showcase__badge">Preview</span>
          )}
        </div>

        <div className="skills-showcase__stage-bottom">
          <span className="skills-showcase__detail-category">
            <CategoryIcon size={13} strokeWidth={2.4} /> {skill.type}
          </span>
          <h3 className="skills-showcase__detail-name">{skill.name}</h3>
        </div>
      </div>

      <div className="skills-showcase__used">
        <h4 className="skills-showcase__detail-label">Where I&apos;ve used it</h4>
        <ul className="skills-showcase__used-list">
          {skill.usedIn.map((place) => {
            const { title, tag } = parsePlace(place);
            return (
              <li key={place}>
                <span className="skills-showcase__used-dot" />
                <span className="skills-showcase__detail-title">{title}</span>
                {tag && <small>{tag}</small>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- idle panel: mini "hover -> detail" illustration + the five most used skills ---------- */

function SkillOverview({ view, onSkill }) {
  const { topSkills, maxUsed } = view;
  if (topSkills.length === 0) return null;
  const { color, to } = metaOf(topSkills[0].type);

  return (
    <div className="skills-showcase__overview">
      <div className="skills-showcase__demo" aria-hidden="true" style={{ "--c": color, "--to": to }}>
        <div className="skills-showcase__demo-list">
          <span />
          <span data-on />
          <span />
        </div>
        <svg className="skills-showcase__demo-cursor" width="16" height="16" viewBox="0 0 24 24">
          <path
            d="M5 3l14 8-6 2-3 6z"
            fill="currentColor"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div className="skills-showcase__demo-card">
          <i />
          <b />
          <b />
          <div className="skills-showcase__demo-tags">
            <em />
            <em />
            <em />
          </div>
        </div>
      </div>

      <h3 className="skills-showcase__ov-title">Peek into any skill</h3>
      <p className="skills-showcase__ov-sub">Hover to preview it, click to pin it here.</p>

      <div className="skills-showcase__favs-head">Most used</div>

      <ol className="skills-showcase__favs">
        {topSkills.map((skill, i) => {
          const { color, to } = metaOf(skill.type);
          const width = Math.max(18, (skill.usedIn.length / maxUsed) * 100);
          return (
            <li key={skill.name}>
              <button
                type="button"
                className="skills-showcase__fav"
                style={{ "--c": color, "--to": to, "--i": i, "--w": `${width}%` }}
                onClick={() => onSkill(skill)}
              >
                <span className="skills-showcase__fav-dot" />
                <span className="skills-showcase__fav-name">{skill.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- the dialog ---------- */

function SkillsModal({ view, initialCategory, initialSkill, onClose }) {
  const { skills, categories, tabs } = view;
  const [active, setActive] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [peekName, setPeekName] = useState(null);
  const [pinnedName, setPinnedName] = useState(initialSkill);
  const isMobile = useMediaQuery("(max-width: 760px)");
  const closeRef = useRef(null);
  const listRef = useRef(null);
  const tabsRef = useRef(null);
  const [edges, syncEdges] = useScrollEdges(listRef, "y");
  const [tabEdges, syncTabEdges] = useScrollEdges(tabsRef, "x");

  // Lock page scroll, close on Escape, and hand focus back when the dialog closes.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onClose]);

  // Keep the selected tab visible (also when it was chosen from the panel).
  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  // Bring the opened skill into view (important on phones, where the detail opens inline).
  useEffect(() => {
    if (!pinnedName) return;
    const el = listRef.current?.querySelector('[data-pinned="true"]');
    el?.scrollIntoView({ block: isMobile ? "start" : "nearest", behavior: "smooth" });
  }, [pinnedName, isMobile]);

  const pin = (skill) => setPinnedName((current) => (current === skill.name ? null : skill.name));
  const peek = (skill) => setPeekName(skill.name);
  const unpeek = (skill) => setPeekName((current) => (current === skill.name ? null : current));
  const unpin = () => setPinnedName(null);

  const onListScroll = () => {
    syncEdges();
    setPeekName(null); // cards scrolling under a still cursor must not count as hover
  };

  const changeTab = (tab) => {
    setActive(tab);
    setPeekName(null);
    listRef.current?.scrollTo({ top: 0 });
  };

  const pickSkill = (skill) => {
    setActive(skill.type);
    setQuery("");
    setPeekName(null);
    setPinnedName(skill.name);
  };

  const q = query.trim().toLowerCase();
  const groups = (active === "all" ? categories : [active])
    .map((type) => ({
      type,
      items: skills.filter((s) => s.type === type && (!q || s.name.toLowerCase().includes(q))),
    }))
    .filter((group) => group.items.length > 0);

  // Pinned wins over hover.
  const shownName = pinnedName ?? peekName;
  const shownSkill = skills.find((s) => s.name === shownName) || null;

  return createPortal(
    <div
      className="skills-showcase__overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="skills-showcase__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skills-showcase-title"
      >
        <header className="skills-showcase__modal-head">
          <div className="skills-showcase__modal-heading">
            <h2 id="skills-showcase-title" className="skills-showcase__modal-title">
              The stack behind <span>the work.</span>
            </h2>
            <p className="skills-showcase__modal-sub">
              {skills.length} skills across {categories.length} areas
            </p>
          </div>

          <label className="skills-showcase__search">
            <Search size={16} strokeWidth={2.3} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills"
              aria-label="Search skills"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </label>

          <button
            ref={closeRef}
            type="button"
            className="skills-showcase__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div
          className="skills-showcase__tabs-wrap"
          data-left={tabEdges.start || undefined}
          data-right={tabEdges.end || undefined}
        >
          <div
            className="skills-showcase__tabs"
            role="tablist"
            ref={tabsRef}
            onScroll={syncTabEdges}
            onWheel={(e) => {
              // mouse wheel scrolls the tab row sideways
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY;
            }}
          >
            {tabs.map(({ key, color, Icon, label, count }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active === key}
                className={`skills-showcase__tab ${
                  active === key ? "skills-showcase__tab--active" : ""
                }`}
                style={{ "--c": color }}
                onClick={() => changeTab(key)}
              >
                <Icon size={14} strokeWidth={2.4} />
                {label}
                <b>{count}</b>
              </button>
            ))}
          </div>
        </div>

        <div className="skills-showcase__split">
          <div
            className="skills-showcase__list-wrap"
            data-top={edges.start || undefined}
            data-bottom={edges.end || undefined}
          >
            <div className="skills-showcase__list" ref={listRef} onScroll={onListScroll}>
              <div className="skills-showcase__list-inner">
                {groups.map(({ type, items }) => {
                  const { color, to } = metaOf(type);
                  return (
                    <section
                      key={type}
                      className="skills-showcase__group"
                      style={{ "--c": color, "--to": to }}
                    >
                      {active === "all" && (
                        <h3 className="skills-showcase__group-title">
                          <span className="skills-showcase__group-dot" />
                          <span className="skills-showcase__group-name">{type}</span>
                          <em>{items.length}</em>
                        </h3>
                      )}

                      <div className="skills-showcase__cards">
                        {items.map((skill) => {
                          const isPinned = pinnedName === skill.name;
                          return (
                            <Fragment key={skill.name}>
                              <SkillCard
                                skill={skill}
                                pinned={isPinned}
                                peeked={peekName === skill.name}
                                onPin={pin}
                                onPeek={peek}
                                onUnpeek={unpeek}
                              />
                              {isMobile && isPinned && (
                                <SkillDetail skill={skill} pinned inline onClose={unpin} />
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                {groups.length === 0 && (
                  <p className="skills-showcase__none">No skills match “{query}”.</p>
                )}
              </div>
            </div>

            <span className="skills-showcase__fade skills-showcase__fade--top" aria-hidden="true" />
            <span className="skills-showcase__fade skills-showcase__fade--bottom" aria-hidden="true" />
          </div>

          {!isMobile && (
            <aside className="skills-showcase__side" aria-live="polite">
              {shownSkill ? (
                <SkillDetail
                  key={shownSkill.name}
                  skill={shownSkill}
                  pinned={pinnedName === shownSkill.name}
                  onClose={unpin}
                />
              ) : (
                <SkillOverview view={view} onSkill={pickSkill} />
              )}
            </aside>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- main component ---------- */

function SkillsShowcase() {
  const skills = useSelector((state) => state.skills.data);
  const view = useMemo(() => buildSkillsView(skills), [skills]);

  const [tip, setTip] = useState(null); // { skill, rect } (mouse hover only)
  const [modal, setModal] = useState(null); // { category, skill } | null
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const hideTip = useCallback(() => setTip(null), []);
  const closeModal = useCallback(() => setModal(null), []);
  const showTip = (skill, el) => setTip({ skill, rect: el.getBoundingClientRect() });

  // The hover card is position: fixed, so hide it as soon as the page scrolls.
  useEffect(() => {
    window.addEventListener("scroll", hideTip, { passive: true });
    return () => window.removeEventListener("scroll", hideTip);
  }, [hideTip]);

  // Skills haven't arrived from the backend yet. Must stay below every hook.
  if (skills.length === 0) return null;

  const openModal = (category, skill = null) => {
    hideTip();
    setModal({ category, skill });
  };

  return (
    <div className={`skills-showcase ${modal ? "skills-showcase--paused" : ""}`}>
      <div className="skills-showcase__header">
        <h2 className="skills-showcase__heading">
          <span className="skills-showcase__heading-bar" />
          Skills I work with
        </h2>
        <button type="button" className="skills-showcase__view-all" onClick={() => openModal("all")}>
          Explore all {skills.length}
          <ArrowUpRight size={15} strokeWidth={2.4} />
        </button>
      </div>

      <div className="skills-showcase__marquee" onMouseLeave={hideTip}>
        {view.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`skills-showcase__track ${
              row.reverse ? "skills-showcase__track--reverse" : ""
            }`}
          >
            {/* list is rendered twice so the -50% loop is seamless */}
            {[0, 1].map((copy) =>
              row.skills.map((skill) => {
                const { color, Icon } = metaOf(skill.type);
                const isClone = copy === 1;
                return (
                  <button
                    key={`${copy}-${skill.name}`}
                    type="button"
                    className={`skills-showcase__chip ${
                      tip?.skill.name === skill.name ? "skills-showcase__chip--active" : ""
                    }`}
                    style={{ "--c": color }}
                    tabIndex={isClone ? -1 : 0}
                    aria-hidden={isClone || undefined}
                    onMouseEnter={(e) => canHover && showTip(skill, e.currentTarget)}
                    onFocus={(e) =>
                      e.currentTarget.matches(":focus-visible") && showTip(skill, e.currentTarget)
                    }
                    onBlur={hideTip}
                    onClick={() => openModal(skill.type, skill.name)}
                  >
                    <span className="skills-showcase__chip-icon">
                      <Icon size={13} strokeWidth={2.4} />
                    </span>
                    {skill.name}
                  </button>
                );
              })
            )}
          </div>
        ))}
      </div>

      <ul className="skills-showcase__legend">
        {view.categories.map((type) => (
          <li key={type}>
            <button
              type="button"
              className="skills-showcase__legend-item"
              style={{ "--c": metaOf(type).color }}
              onClick={() => openModal(type)}
            >
              <span className="skills-showcase__legend-dot" />
              {type}
            </button>
          </li>
        ))}
      </ul>

      {tip && canHover && <SkillTooltip skill={tip.skill} rect={tip.rect} />}
      {modal && (
        <SkillsModal
          view={view}
          initialCategory={modal.category}
          initialSkill={modal.skill}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default SkillsShowcase;