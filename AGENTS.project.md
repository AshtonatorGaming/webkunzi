# Inkunzi — project law

This sandbox is **TanStack Start + Vite** (preview contract). Canon repo is Next.js — steal engine and table law, not that framework. Auth stays off. No hex tiles. No mission tree.

**Product:** a staffed nation RP table. Pixels and pops, not province IDs. Players submit; mods adjudicate. Weekly clock. Character is the player; nation is the machine.

**Look:** EU4 chrome (map modes, country window, outliner, date, ledgers) over a painted map. Dark ink, parchment, bronze hairlines. Armies are banners. Polish is not later. The map is the bottom layer. Country / war / queue / character / clock are floating windows you drag across the painting. Banners plant on their pin (pole base = coordinate).

**Lanes (do not collapse):**
1. AUTO — legal, paid, no judgment (`auto: true`)
2. AUTO START — action exists; dice/staff color the result (`needsRoll`)
3. STAFF GATE — map change or war day (`pending` until accept)

Staff live = god mode for mapping tests. Label it.

**Week:** War day is the fight. Tick day is the numbers. Log like staff.

**Map:** Play rectangle defaults to 6145×3530, CRS.Simple, Leaflet `key` + dynamic import. Staff pick the size (about 2048×1176 up to what the cell budget can carry). Cells stay near 17px until the cap (about 800×450); past that the ground stretches. The ground is a generated planet unrolled on the rectangle: the same seed keeps the same plates at every size (crust grown at table grain, then painted onto the play grid). Land is a platform. Mountain belts are named arcs (one Old World range with a pass, one New World spine), histogram-clamped, not a washboard. Old World and New World sit on opposite sides of a wide ocean. Play starts on river-valley hearths under a per-cell fog mask (a disk around each hearth, shaped by staff and by marching). Ages are table time; they do not unlock rectangles. Under is cave chambers under the continents, not a copy of the ranges. Sky is the surface seen through air, with clouds over moist land. Atlas presets choose Earthlike, Continents, Pangaea, Archipelago, Islands, or Theater; Earthlike stays the default. A void gate is an attachment, not a second planet. Relief (ocean, shelf, lowland, hills, range, peak, ice), latitude climate, and a cover lookup (ocean, shelf, grainland, forest, marsh, desert, river, lake, steppe, savanna, jungle, taiga, tundra, ice, sea ice). Color is cover. Light is slope, so plains stay flat and desert hills and jungle ranges read off the same painting. East meets west. North does not wrap. Generated worlds and traced paintings both wrap unless staff explicitly set Theater. One world-width is on screen. Dragging east, the west shore slides in; the camera recenters on the cylinder without a teleport. No second copy of the coast when the whole world fits. With nothing open, the painting is the screen: outliner and the terrain key start closed, and the atlas (size, seed, climate sliders, Planet/Theater, generate, paint, import) is a staff window. Hover names cover, relief, climate, and height. Map modes recolor the open plane: Terrain, Climate, Height, Political, and the ledgers. The plane dock is Surface, Under, and Sky. The old raster is not the out-of-the-box map. A later globe preview may reuse the terrain pack; it is not the play map. Never call any map Jackson. No hex tiles. Never empty-array hydrate.

**ZOC / contact / attack:**
- ZOC blocks pathing *through* a stack or its disk. Approach *to* a flag or town in the disk is legal.
- Contact ≠ battle. Attack is an explicit order (staff or allowed player). No auto-fight on kiss.
- Coverage = eligible to join. Garrisoned inside = urban/siege. Covering outside = field, still protects. Leaving a city to intercept is a Move.
- Offset stacked banners; picker when stacked.

**War-turns (~4):** 1 Move + 1 Action. Double march spends Action. Force-march = debuff if attacked. Entrench = tortoise sit bonus. Skirmish = double-move and a weaker attack.

**Battle:** attacker picks allied banners; defender adds ZOC-eligible stacks that still have a fight. No focus-fire if neighbors can join. Units are named per-faction lines (type + optional proper name), never one composition blob. **Reel, not recap:** Shock → Early → Late. CONTINUE is next phase. Wipe = every line on that side at 0 remain; otherwise Late still plays after a lost Shock and Early. No best-of-three stop. Weights live in `battleConfig.ts` (Mounted 1.4/0.8/0.7, Ranged 0.7/1.3/0.8, Melee 0.9/1.0/1.3). Report is the I2 overlay: cream `{GRADE} {SIDE} {PHASE} VICTORY` title; ATTACKERS | map crop | DEFENDERS; unit type / fielded / remain; dead by faction; casualty totals; CONTINUE. Staff may freeze and rewrite remain before CONTINUE commits. After Late (or wipe): winner pin takes the defender pin. If that stack has not moved this war-turn it may Move once more with Attack spent. A 0-unit pin is a ghost; explicit Attack deletes it if it has not reinforced. Grade from odds vs losses (legendary / crushing / hard fought / pyrrhic / narrow / inconclusive). Staff can override.

**Seats:** Players never see a battle / RP switch. An open war is the war, not a mode — they already know. Court letters still go out during a war; districts and the tick wait. Staff clock (RP week / War day), Tick day, declare, reel, and line corrections are staff-only.

**Battle bookkeeping:** One order per banner. Named lines take their dead from the reel. Staff does not retype remain every phase. Fight it out runs Shock → Early → Late in one action. Correct lines only when a ruling is wrong.

**War day mode:** same map, same pins. Staff clock only. War dock (declared wars, war-turns left ~4) is staff. Players at war see the war itself, and can still write. ZOC and Attack stay hot. Never label the player table Friday, battle mode, or RP mode. The numbers button is Tick day, staff only.

**v1 done when:** staff can run a week without Sheets; a player likes the nation window; a stranger knows it is Inkunzi in five seconds.

Pins: national treasury; migrate stab still open; exact OG admin formula later.
