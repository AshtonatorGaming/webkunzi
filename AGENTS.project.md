# Inkunzi — project law

This sandbox is **TanStack Start + Vite** (preview contract). Canon repo is Next.js — steal engine and table law, not that framework. Auth stays off. No hex tiles. No mission tree.

**Product:** a staffed nation RP table. Pixels and pops, not province IDs. Players submit; mods adjudicate. Weekly clock. Character is the player; nation is the machine.

**Look:** EU4 chrome (map modes, country window, outliner, date, ledgers) over a painted map. Dark ink, parchment, bronze hairlines. Armies are banners. Polish is not later. The map is the bottom layer. Country / war / queue / character / clock are floating windows you drag across the painting. Banners plant on their pin (pole base = coordinate).

**Lanes (do not collapse):**
1. AUTO — legal, paid, no judgment (`auto: true`)
2. AUTO START — action exists; dice/staff color the result (`needsRoll`)
3. STAFF GATE — map change or Friday (`pending` until accept)

Staff live = god mode for mapping tests. Label it.

**Week:** Friday is war. Saturday is numbers. Log like staff.

**Map:** Jackson PNG at 6145×3530, CRS.Simple, Leaflet `key` + dynamic import. Never empty-array hydrate. Raster remains the placeholder painting.

**ZOC / contact / attack:**
- ZOC blocks pathing *through* a stack or its disk. Approach *to* a flag or town in the disk is legal.
- Contact ≠ battle. Attack is an explicit order (staff or allowed player). No auto-fight on kiss.
- Coverage = eligible to join. Garrisoned inside = urban/siege. Covering outside = field, still protects. Leaving a city to intercept is a Move.
- Offset stacked banners; picker when stacked.

**War-turns (~4):** 1 Move + 1 Action. Double march spends Action. Force-march = debuff if attacked. Entrench = tortoise sit bonus. Skirmish = double-move and a weaker attack.

**Battle:** attacker picks allied banners; defender adds ZOC-eligible stacks that still have a fight. No focus-fire if neighbors can join. Units are named per-faction lines (type + optional proper name), never one composition blob. **Reel, not recap:** Shock → Early → Late. CONTINUE is next phase. Wipe = every line on that side at 0 remain; otherwise Late still plays after a lost Shock and Early. No best-of-three stop. Weights live in `battleConfig.ts` (Mounted 1.4/0.8/0.7, Ranged 0.7/1.3/0.8, Melee 0.9/1.0/1.3). Report is the I2 overlay: cream `{GRADE} {SIDE} {PHASE} VICTORY` title; ATTACKERS | map crop | DEFENDERS; unit type / fielded / remain; dead by faction; casualty totals; CONTINUE. Staff may freeze and rewrite remain before CONTINUE commits. After Late (or wipe): winner pin takes the defender pin. If that stack has not moved this war-turn it may Move once more with Attack spent. A 0-unit pin is a ghost; explicit Attack deletes it if it has not reinforced. Grade from odds vs losses (legendary / crushing / hard fought / pyrrhic / narrow / inconclusive). Staff can override.

**Friday mode:** same Jackson map, same pins. Dim nation/economy windows. War dock (declared wars, war-turns left ~4). ZOC and Attack stay hot.

**v1 done when:** staff can run a week without Sheets; a player likes the nation window; a stranger knows it is Inkunzi in five seconds.

Pins: national treasury; migrate stab still open; exact OG admin formula later.
