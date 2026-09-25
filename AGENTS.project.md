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

**Map:** Play rectangle defaults to 6145×3530, CRS.Simple, Leaflet `key` + dynamic import. Staff pick the size (about 2048×1176 up to what the cell budget can carry). Cells stay near 17px until the cap (about 800×450); past that the ground stretches. The ground is a generated planet unrolled on the rectangle: the same seed keeps the same height field at every size (crust grown at table grain, then painted onto the play grid). Land is whatever sea level cuts out of that field. Mountain belts are high elevation after plate collision and after rivers carve it, not named arcs and not a ranked noise paint. A cell is a stack: relief, cover, climate, and water can all be true, and the game adds them. Play starts on river-valley hearths under a per-cell fog mask (a disk around each hearth, shaped by staff and by marching), wherever the field put good water, not on a scripted western half. Ages are table time; they do not unlock rectangles. Under is its own cavern field, not a silhouette of the surface. Sky is weather — wind, cloud, and the rain that writes surface moisture — not the ground seen through a tint. Atlas presets choose Earthlike, Continents, Pangaea, Archipelago, Islands, or Theater; they change sea fraction, variance, and wrap, not a painted seating. Earthlike land comes out unequal — one large body, a smaller one, and an arc — and a closed basin can stay an inland sea. A void gate is an attachment, not a second planet. Relief (ocean, shelf, lowland, hills, range, peak, ice) is orography. Cover is a lookup. Color is cover; range is shade on that fill; water is a stroke on top. Light is slope, so plains stay flat and desert hills and jungle ranges read off the same painting. East meets west. North does not wrap. Generated worlds and traced paintings both wrap unless staff explicitly set Theater. The rectangle is an equirectangular unrolling of a spheroid: longitude wraps, latitude does not, and polar width shrinks with cos(lat). Dragging east, the west shore slides in; the camera recenters on the cylinder without a teleport. Zoom-out may show the whole painting; a second copy only appears when the viewport is wider than the world. Branded rails frame the north and south. A corner minimap jumps the camera. Climate is continentality and rain shadow, not latitude stripes. Polar ice is broken floes and land sheets, not a footer. Shelf is 1–3 cells and offset. Mountains paint as rock and snow on the cover, not a darkened costume. Hover names the stack; move and forage only on the Military layer. Sky words are air. Under words are cave. With nothing open, the painting is the screen: outliner and the terrain key start closed, and the atlas (size, seed, climate sliders, Planet/Theater, generate, paint, import) is a staff window. Hover names cover, relief, climate, and height. Map modes recolor the open plane: Terrain, Climate, Height, Political, and the ledgers. The plane dock is Surface, Under, and Sky. The old raster is not the out-of-the-box map. A later globe preview may reuse the terrain pack; it is not the play map. Never call any map Jackson. No hex tiles. Never empty-array hydrate.

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
