# Pool Water

A single-file pool water calculator for a specific pool: 17,500 gallons, saltwater, Jandy TruClear
salt chlorinator, attached spa with a spillover waterfall, Santa Clarita fill water.

Open `index.html`. That is the whole application — no build step, no frameworks, no dependencies,
no network requests. It works with no signal.

## What it does

Enter six readings, get an ordered list of what to add and exactly how much, in cups, gallons, or
pounds. Every label is written in plain English: "chlorine," not FC; "alkalinity," not TA;
"stabilizer," not CYA.

- Big tap targets and plus/minus steppers, high contrast for reading in bright sun.
- Taylor test kit drop counts convert automatically (chlorine drops x 0.5, alkalinity x 10,
  calcium x 10, salt x 200).
- Each reading shows a bar with the good range shaded and a marker for where the water actually is.
- Tests are saved to `localStorage` and listed in a history table.

## Test instructions

Every reading card has a collapsed "How to test this" panel with the full procedure: which tube,
what to fill it to, which numbered reagent bottle, what color change to watch for, and what to
count.

These are written for the **Taylor K-2006**, plus the **K-1766** for salt. That kit is inferred from
the drop factors, which match it exactly: chlorine at 0.5 per drop is a 10 millilitre sample on the
powder titration, alkalinity and calcium at 10 per drop are 25 millilitre samples, salt at 200 per
drop is the separate silver nitrate titration, and stabilizer has no drop factor because it is the
cloudy-tube turbidity test. If the kit on hand is a different model, the sample volumes and the R
numbers in `READINGS[].test` are what need changing.

## Settings

- Acid strength on hand: 14.5% or 31.45%
- Liquid chlorine strength on hand: 10% or 12.5%
- "Fighting algae right now" on/off, which moves the chlorine target from 6.5 to 12

## The dosing math

All of it is sized for 17,500 gallons. Changing the pool size means changing `GALLONS` at the top of
the script.

| What | Rule |
|---|---|
| Liquid chlorine | One gallon of X percent raises 10,000 gallons by X parts per million, scaled to pool volume: `strength x (10000 / 17500)`. That is 7.14 ppm per gallon of 12.5%, 5.71 for 10%. Target 6.5, or 12 while fighting algae. |
| Muriatic acid | Only when pH is above 7.6. Ounces of 31.45% = `55 x (alkalinity / 100) x ((pH - 7.3) / 0.6)`, multiplied by 2.17 if only 14.5% is on hand. A single dose is capped at 1 gallon of 31.45% or 2 gallons of 14.5%, and anything over the cap is reported as a partial dose that needs repeating. |
| pH below 7.0 | Stop adding acid. Run the spa spillover instead and let aeration bring it back up. |
| Pool salt | A 40-pound bag raises salt about 275. Target 3,200, only when below 3,000. |
| Stabilizer | One pound raises it about 7. Target 55, only when below 45. Warns above 70. |
| Calcium above 600 | Monthly reminder: 28 ounces of Clorox Scale, Metal and Stain Control. Calcium here is a permanent condition to manage, not a problem to fix. |
| Chlorine above 8 | Do not swim yet, and add nothing. Wait it out. |

Two rules close every list: the pump runs for all of it, and acid and chlorine never go in together
with less than 30 minutes between them.

Alkalinity below 60 is flagged but **not** dosed. Baking soda is what raises it, and no amount is
calculated here on purpose.

## Running it on an iPhone

Host `index.html` and `sw.js` together over https, open the page in Safari, then Share > Add to
Home Screen. It launches full screen with its own icon, which the page draws on a canvas at load,
so the icon itself needs no file.

`sw.js` is what makes it work with no signal. A standalone home screen app still requests its own
document on launch, and offline that request fails; the service worker answers it from cache
instead. Bump `CACHE` in `sw.js` whenever `index.html` changes.

Opening the file straight from Files or iCloud Drive works for a quick look, but Safari treats
`file://` as a throwaway origin: no service worker registers, and saved tests may not persist.
Host it if the history matters. If the browser refuses to store anything, the history table says so
instead of silently dropping saves.
