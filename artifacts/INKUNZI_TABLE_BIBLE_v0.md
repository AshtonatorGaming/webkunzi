# Inkunzi Table Bible v0
Compiled 2026-09-21 from Google Drive. This is **table canon**, not a reprint of every season.

If a number in a guide and a number on the sheet disagree, the sheet wins for *that season*. The table wins for *this app*. Staff override always wins on Friday.

---

## 0. What I could actually read

Drive access works. There is no Inkunzi folder; files are loose copies, mostly owned by WeebTrAsh, plus shared originals.

### Treat as current sources (Sep 2026 copies)

| File | Modified | Role |
|---|---|---|
| [Copy of Project Inkunzi: Revengeance Sheet](https://docs.google.com/spreadsheets/d/12xTMvqH9wIqUbkUsRugGa8yRbrPOpjdpuIsISwO31zU) | 2026-09-17 | **Brain.** 32 tabs. Latest copy. |
| [Copy of Inkunzi The Guide V2](https://docs.google.com/document/d/1Rlqv-4WFn-WNKYBV0z7LCHnT8DutGV7t1ztPoB8q6c8) | 2026-09-16 | Older player-facing guide. Simpler jobs/stats. "If it is not on the Spreadsheet, it does not count." |
| [I3 Guide](https://docs.google.com/document/d/1YY2ot0Vb0nHbyeCAjpauX5CWiROkP6fhtRiSx22YC0M) | 2026-09-15 | Season 10 / New Beginnings. Dynasty + prestige rewrite. |
| [Copy of Revengeance Guide v4.5](https://docs.google.com/document/d/1JHh07U7CxhKut-IzhWLiLEJVTg2E6XPMBBsGbdEYbSY) | 2026-09-15 | Season 9 player bible. Huge. Characters, intrigue, crafting, culture tables. |
| [couple bits of info...](https://docs.google.com/document/d/1iTZm2wCcvINulS-CDSkBMCxguRX30B6Ms-F2mGNDWxQ) | 2026-09-21 (today) | Living house-rule dump, mostly 2020–2021 Discord (Lunu / Jackson). Not a system. |

### Originals (older than the copies)

- Revengeance Sheet original — badabing160 — 2026-07-13
- Revengeance Guide v4.5 original — badabing160 — 2025-09-25

### Noise to ignore unless a specific formula is missing

Dozens of `Copy of Inkunzi 3.EXE TWO` sheets from 2024–2025. Same skeleton, drifted numbers. Do not merge them.

### Scripts (now read)

[Inkunzi Scripts Rip](https://docs.google.com/document/d/1qN1r9Z_COVHu82x8o4QhjssubFV48eQqCjPvPIpzeHg) — 2026-09-22. Two projects:

- **Revengeance** — Armies, Characters, Conversions, Economy, Expansions, InternalFactions, Main, Nations, Quicksheet, Research, Revolts, Loans. This is Saturday.
- **Inkunzi 3 / I3.5** — Armies, Characters, Nations only. Short on purpose: StabWSTick + character age/condition. Not a missing dump.

Still missing: private Discord pins, Jackson paint sources, any *bound* script that was never in those two standalone projects.

---

## 1. The plot, recovered

Inkunzi is not EU4 and not a GIS. It is a **staffed tabletop nation RP** over a **painted rectangle**. Players are characters. Nations are the thing the table tracks. Mods run Friday war and Saturday tick. The sheet was the only object that "counted." The app exists so staff can run a week without that sheet, and so a stranger recognizes Inkunzi in five seconds.

Season stack (do not flatten these into one ruleset):

1. StreamTeam / CDLU planet sim (the YouTube thing).
2. Early Discord seasons — Guide V2 + 3.EXE sheets + Lunu's couple-bits.
3. **Revengeance (S9)** — v4.5 guide + 32-tab sheet. Started tribal, ended Dark Ages. This is the densest mechanical fossil.
4. **New Beginnings / I3 (S10)** — zoomed Bronze/Classical, then walked back to "ages again" after Jackson stepped back. Dynasty, prestige, occupations.
5. **This table (App Inkunzi)** — not a season. A staff tool that should *feel* like Friday on Jackson's map.

v1 of the app is allowed to implement **a slice**. It is not allowed to pretend it is all four seasons at once.

---

## 2. Two canons (keep them apart)

### SOURCE LAW
Whatever the live sheet + the guide that matches that sheet say. Contradictory on purpose because seasons rewrote pops, gold, sessions, and war.

### TABLE LAW (this app, freeze these)

These are the decisions already made in the table work. Do not silently revert them to a random guide paragraph.

- Painted Jackson map, CRS.Simple, no hex, no globe wrap, no GIS.
- Pops are dots, not provinces.
- Auth off.
- Windows float over an isolated z-0 map layer.
- Friday is war. Saturday is tick.
- Wars need an explicit Attack. Approach can be legal. Through-ZOC clips; ZOC is a block, not a trap.
- Named army lines, not a blob. Posture on the stack.
- Battle is 3-phase. Report is the I2/I3 panel: cream `{GRADE} {SIDE} {PHASE} VICTORY`, ATTACKERS | map crop | DEFENDERS, fielded/remain tables, casualties by faction, totals, CONTINUE.
- Staff can override anything on the report.
- No mission tree.

If a Drive doc disagrees with TABLE LAW, the doc is background, not a ticket.

---

## 3. Week clock

All sources agree on the *shape*. Numbers drift.

| Day | Source law (Revengeance v4.5 / V2) | Table law |
|---|---|---|
| Sunday | Session start / off / reform updates. No surprise wars after midnight PST in V2. | Off / prep. |
| Mon–Thu | Mechanical actions. Wars declared Sun–Wed (v4.5) or before Thu midnight (V2). | Staff + players log intent. |
| Friday 14:00 PST | Build cutoff in V2. War day. | **War day.** Resolve declared wars. |
| Saturday | Tick. Sheet updates. | **Tick.** Apply casualties, treasury, stab, WS, occupations. |

PST is source-server time. Table can keep a single staff timezone displayed; do not fork two clocks.

Session length in fiction: Tribal messy; Classical often **20 years** (v4.5 and couple-bits #103). I3 wanted two-week sessions + time skips. Table v1: one session = one week of real time. In-world years are flavor on the tick screen, not a sim clock.

---

## 4. The objects that actually matter

### 4.1 Pops
Dots on the painted map. Each pop has culture + religion. Border color: settled (black) vs nomadic (red) in v4.5.

**Pop value is the loudest contradiction in the archive.**

| Source | People per pop |
|---|---|
| Revengeance sheet Meta (2026-09-17 copy) | **11,500** (world 6,905 pops → 79.4M) |
| Revengeance Guide v4.5 (map chapter) | 27,500 |
| Guide V2 | 100,000 |
| couple bits #106 | 20,000 |

**Table freeze:** store pops as integer dots. Display people = `popCount * POP_VALUE`. Put `POP_VALUE` in one config constant. Default to the **live sheet Meta: 11500** until staff pick another. Do not bake 27,500 into copy.

Accepted pops (primary + friend culture) are the ones that feed religion-stability. Non-accepted go to a non-core bucket (V2 + couple-bits #74–75).

Casualties can delete pops (couple-bits #9). Free-troop deaths hit war support but not pop-loss (couple-bits #34–35).

### 4.2 Nations
Player-controlled through a character. Co-op allowed. Source cap: 2 countries per player if non-adjacent regions (v4.5).

Nation modifiers that show up in every source:

- Stability
- War support
- Infamy
- Manpower
- Tech / age
- Treasury
- Resources
- Centralisation / legitimacy / cohesiveness (Revengeance)
- Government type + laws
- Primary culture + religion + traits

NPCs are passive until poked. They refuse total annexation and dislike vassalage (v4.5). They fight as well as players (couple-bits #10). Military access is assumed until proven otherwise (couple-bits #58). Marching a non-allied army through you is −1 stab per 1,000 troops, with optional ambush (couple-bits #80–81).

### 4.3 Characters
Three incompatible stat blocks exist. Do not merge them.

| | Guide V2 | Revengeance v4.5 | I3 |
|---|---|---|---|
| Points | 10, cap 4 | 18 (20 if age ≥50), cap 10 | 12, cap 4 |
| Stats | Rulership, Charisma, Land/Sea Tactics, Intrigue, Business | WAR, MAR, INT, STA, CHA, EDU, CRA | Rulership, Charisma, Warfare, Business, Intrigue, Martial (+ Piety listed) |
| Jobs | Occupation table with baked bonuses | Traits + skills + one mastery | Occupation auto-added by sheet |
| Extra | Age death from 60 | Ruler death −1 legitimacy | Prestige + dynasty |

**Table v1:** character is a named card on a nation (ruler / general / priest). Stats can be a single Warfare / Intrigue / Statecraft trio plus a freeform trait string. Full v4.5 skill tree is not v1.

### 4.4 Armies
Source (couple-bits #36): at most **three armies on the map**.
Source (couple-bits #68–70): commander cap by nation size; one commander per culture; ask staff to mint a new one.
Source (V2 / doctrines): military type + army doctrine + navy doctrine change advantage.

**Table law already chosen:** named unit lines inside a stack, posture, ZOC circle on the pin, explicit Attack.

Movement from Soup via couple-bits #121: 1 movement + 1 action per war-turn, or dump the action for a second move.

### 4.5 Wars
Declare in the window. Log wargoals. Fight Friday.

Sheet Wars tab is a **ledger of named wars**, not a resolver: type (PvP/PvE), main aggressor, extra aggressors, players, Discord wargoal link, defenders.

Battle law from mixed sources + table work:

- Defender auto-wins if they take <1% casualties (couple-bits #37). Keep as a staff flag, not a silent auto-resolve, until the resolver is trusted.
- No reinforce mid-battle. Loser may retreat anytime; after 3 defensive losses forced retreat to nearest friendly city outside the fought region (couple-bits #102).
- Table: 3 phases, grade, side, named lines, I2 report.
- War-turns ~4 per Friday (table addendum). Do not import EU4 tick-per-day.

Wargoals, CBs, holy-war land locks, infamy thresholds (50 / 75 / 100 / 125 / 150 in V2) — source law. Table v1 only needs: declared, sides, wargoal sentence, resolved/unresolved.

### 4.6 Economy (defer most of it)
Sheet has National Economy, Resources, Districts, Loans, Technology, Buildings, Wonders.

v4.5 one-liner players actually need:

- Nodes on the map extract resources.
- Grain/Fish feed pops.
- Stone/Lumber feed districts.
- Base/War metals raise troops.
- Gold/Exotic make money.
- Trade is a logged deal.

Do **not** port inflation dual-track (couple-bits #112–118), warehouse-corp factory labor, or full district caps into v1. Show treasury + a resource bag + "staff set this."

### 4.7 Culture / religion / factions
Traits are real and shared across V2 / v4.5 / I3 (Warlike, Peaceful, Mercantile, Isolationist, Absolute, Freedom, etc.).

I3 explicitly says friend/rival culture is **lore, not a tracker**. Revengeance still has mechanical friend/rival + conversion DCs.

couple-bits that will bite if ignored:

- Random event per cultural trait per session (#5–8)
- Factions act on their own, can stockpile actions (#4, #23, #25–30)
- Suppress an internal faction → rebel movement (#14)
- You cannot really delete rebels except by stabilizing (#15)
- Second cultural trait arrives at end of Tribal (#16)
- Two-plus traits: expansion must take pops/resources, not empty land (#88)

**Table v1:** primary culture, primary religion, trait list as tags. Faction sim is a staff note, not an engine.

---

## 5. Sheet map (the 32-tab brain)

From `Copy of Project Inkunzi: Revengeance Sheet` (2026-09-17):

| Tab | Use for the table |
|---|---|
| Meta | Age, pop value, world totals. **Read this first.** |
| Mod Quicksheet | Staff HUD. Closest analog to the floating windows. |
| Nations / Characters / Rankings | Cards. |
| National Laws / NPC Vassals | Law + subject flags. |
| National Economy / Resources / Districts / Loans | Saturday numbers. Import later as formulas, not UI. |
| Diplomacy / Conversions | Ledgers. |
| Armies / Wars | Friday. |
| Demo Culture / Demo Religion | Pop composition. |
| Cultures / Religions | Trait dictionaries. |
| Units / Buildings / Technology / Wonders / Artifacts | Catalogs. |
| ~Research ~Imperial* ~Expansions ~Revolts ~Internal Factions ~Conversions | Staff scratch. Tilde = not player-facing. |

Units / Buildings / Tech catalogs are the right thing to extract into `src/engine` data tables when Saturday is built. Wars/Armies are the right thing to extract now.

---

## 6. Known contradictions (do not "average" these)

1. **People per pop** — 11.5k / 20k / 27.5k / 100k.
2. **Character system** — three seasons, three point-buys.
3. **Session length** — weekly + 20yr Classical vs I3 two-week + time skips.
4. **War declaration window** — Sun–Wed (v4.5) vs Thursday midnight (V2).
5. **Army cap** — three stacks on map (couple-bits) vs however many named lines the table already shows.
6. **"If it's not on the sheet it doesn't count"** (V2) vs table goal "staff run a week without Sheets."
7. **Race has no mechanical impact** (couple-bits #38) vs later racial conversion locks (v4.5 / #97).
8. **Guide v4.5 is mid-Fall of the Crown; sheet Meta is Dark Ages.** The copy is a later world than the guide preface.

When implementing, pick one row and write it in TABLE LAW. Do not leave both live.

---

## 7. What v1 should implement vs what to refuse

### Implement (this is the week-without-Sheets test)

- Painted map + pins + ZOC rings + named stacks
- Nation window, war window, battle report (I2 panel)
- Staff declare war / resolve / continue
- Saturday stub: apply report casualties to stacks and a treasury field
- Pop dots with culture/religion tags
- Seed one recognizable nation (Vestoria already in the table work)

### Explicitly not v1

- Full Revengeance intrigue cell economy
- Duel 2d100 + injury tables
- Crafting / artifacts / wonders
- Corp factories, inflation, warehouses
- Dynasty prestige thresholds
- Mission tree, hex, auth, globe wrap
- Auto-ticking factions and random-event engine
- Importing the entire Nations tab as live play data (that's a season archive, not a fresh table)

---

## 8. Mapping engine — recommendation

**Keep Leaflet + CRS.Simple + the Jackson PNG.**

Why this is the right engine for *this* object:

- The world is a painted rectangle (6145×3530), not a spheroid.
- Pins, circles, and a crop-zoom for the I2 report are solved.
- Staff need to drag windows over the map, not query polygons.
- No tileset, no EPSG, no dateline.

When people say "different mapping engine" they usually mean one of these. All of them are a downgrade for v1:

| Engine | Verdict |
|---|---|
| Mapbox / Google / ArcGIS | Geo-earth. Fights a painted map. |
| OpenLayers / MapLibre | Fine, not better. Port cost for zero Friday value. |
| Cesium / globe | Explicitly deferred. The painting is a rectangle. |
| Hex / grids | Against table law. |
| Raw canvas / Pixi | More control, you rebuild every Leaflet thing you already have. Only reopen if pins + ZOC + crop become the bottleneck. |
| Unity / Godot | Wrong product. This is a browser table. |

Revisit engines only after staff run a Friday on the current map and can point at a *specific* failure (perf at full pop-dot count, crop quality, wrap). Not before.

---

## 9. Reset or not

**Do not start the app from scratch.** The table already has the hard parts: SSR Leaflet, window drag, banner pins, war/ZOC/attack law, I2 report.

**Do reset the rules conversation.** Auto Grok chats flattened four seasons into one vibe. That is why the plot feels lost. The fix is this file plus a short "TABLE LAW" block in `AGENTS.project.md`, not a new repo.

Reconsider only the decisions that were never frozen:

- Pop value constant
- Which character stat block, if any, is on the nation card
- Whether Saturday formulas come from Revengeance Meta or from a tiny new engine
- Whether Vestoria is flavor-seed or season-canon

Do not reconsider Leaflet, no-hex, no-auth, Friday war, named lines, or the I2 panel unless staff say those failed in play.

---

## 10. Next mechanical import (when you say go)

Priority order, from Drive, without boiling the ocean:

1. Units tab → `engine/units.ts` catalog (names, age, role). Not every modifier.
2. Cultures / Religions tabs → trait dictionary.
3. Meta pop value + age label → config.
4. Saturday tick from Revengeance scripts (section 11). Start with WS / Stab / Infamy misc decay + ledger + tooltips.
5. Units / Cultures / Religions catalogs.

Do not import the Wars ledger of Ameria / Skullantium / Fellowship as live table state. That is a finished season's graveyard.

---

## 11. Saturday tick (from the script rip)

Decay does **not** walk the displayed total toward a law default. Displayed WS / Stab are live sums. Scripts only chew the **misc / burst** columns, plus a few pools.

Revengeance `StatDecay` / `StabTick` / `WSTick` (table freeze):

```
if |misc| <= 0.5: misc = 0
else:             misc = misc - misc/3     // keep 2/3, drop 1/3 toward 0
```

Same 1/3 toward zero for faction loyalty and influence.

| Pool | Saturday write | Notes |
|---|---|---|
| Stab Misc | 1/3 toward 0, snap \|x\|≤0.5 | Hover as “this session’s leftover burst” |
| WS Misc | same | Declare costs, RP spends, staff hits land here |
| Infamy | `infamy - infamy/3`, snap ≤1 → 0 | Always decays; never grows in the tick |
| Casualties | `cas = max(0, cas - 0.15 * armySize)` | Not 1/3 of the pool. 15% of **current army** comes off the wound pile |
| Exhaust | Peace: 1/3 toward 0. War: **add** scale × culture | Raid 2.5 / Minor 5 / Mod 10 / Major 20 / Total 40. Defender is 1 / 3 / 6 / 12 / 25. Warlike 0.75×, Peaceful 1.1×, stacked per trait |
| Treasury | `treasury += profits` | EconomyTick is that add. Upkeep already sits in profits. |
| Characters | age += 20, then condition roll | Revengeance. I3.5 has its own Fine/Ill table. |
| Research / loans / revolts / conversions | exist in Revengeance | Deferred past v1 Saturday |

I3.5 `DecayMod_SWS(n, 0.33)` is the same 1/3 on Stab Misc and WS Misc, plus a liberty-desire rebel flag. Use Revengeance as the tick. Keep I3.5 only if you need that vassal/rebel write.

**Displayed WS** (sheet formulas, not scripts):

`WS = ageBase + culture/religion nation + govt + armyBurden + casualtyBurden + WS Misc`

- Army burden: `-400 * (army / pops)`, or `-50` if army exists and pops is 0
- Casualty burden: `-400 * (casualties / pops)`
- If WS < 0, Stability takes `1.5 × WS` as WS Mod
- Funding law multiplies army upkeep: Minimal 0.25 … Extreme 2.5

Laws and culture set the **resting displayed value**. Misc is the bruise. Saturday heals the bruise, not the rest.

## 12. Paradox tooltip + ledger (table law)

Players never open the sheet. Every modifier that would have been a cell is a hover.

Nation card WS (same pattern for Stab, Infamy, Exhaust):

```
War Support  18
  Age base              +12
  Honour                +4
  Classical monarchy    +5
  Standing army         −7
  Casualties            −3
  This session          −9   ← WS Misc
  Resting without bruise 21
  Next Saturday         bruise → −6
```

Rules for the tooltip:

- Green / bone-cream for positive, ink-red for negative. No EU4 chrome. Same parchment panel language as I2.
- Every line is a named source (trait, law, army, casualty, staff hit, declare spend).
- Current, resting, and next-tick bruise are always visible.
- Click opens the **ledger**: `{session, stat, delta, reason, actor, before, after}`.
- Staff override is a ledger line, not a silent edit.

When WS is hit on Friday, write the line immediately. Do not wait for Saturday. Saturday only writes the decay line (`bruise −9 → −6`). That is how a player sees how badly they were hit.

---

## 13. Friday reel (frozen 2026-09-21)

Phases are **Shock → Early → Late**. All named lines fight in every phase. Weights change by unit *type* (Melee / Ranged / Mounted from the Units tab). Exact multipliers were not in the sheet; they lived in the old calc. Draft matrix until staff retune:

| Type | Shock | Early | Late |
|---|---|---|---|
| Mounted | 1.4 | 0.8 | 0.7 |
| Ranged | 0.7 | 1.3 | 0.8 |
| Melee | 0.9 | 1.0 | 1.3 |

Wipe = **every unit on that side is dead**. If a side hits 0 remain, the reel stops. Late still plays if both sides have anyone left after Shock and Early.

Ghost army: a stack at 0 remain that was not wiped off the map (routed empty, unreinforced) can be Attacked and deleted. That is not a fourth phase.

Occupy: winner of an Attack takes the defender’s pin. If that stack has **not already moved** this war-turn, it may move after occupy. That leftover move has **no Attack**. Not a double-move, not a second action.

Siege / city / fort: deferred. Guess is best-of-three field reels with a wall modifier. Do not build it until a Friday of field fights survives.

CONTINUE is next phase. Staff can freeze and rewrite remain before the next phase commits.
