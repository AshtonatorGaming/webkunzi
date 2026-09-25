# Inkunzi terrain v16

Causal worldgen on the existing 360x206 crust.

1. Crust noise still chooses land (presets still drive sea / scale / breakup / wrap).
2. Plate IDs (Worley) mark live margins. Uplift lands on those margins.
3. Stream-power + thermal erosion carves height before cover is painted.
4. Moisture is advected with trade / westerly / polar belts over that relief.
5. Cover is a lookup on temp+moist. Quotas loosened. Cache key `inkunzi.terrain.v16`.

Presets unchanged: Earthlike, Continents, Pangaea, Archipelago, Islands, Theater.
Mountains slider now scales uplift and incision, not a ranked noise paint.
