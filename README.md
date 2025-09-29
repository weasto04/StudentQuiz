# Random Forest Intuition Quiz

Simple, lightweight (no build tools, no frameworks) interactive page to practice reasoning about how a Random Forest combines votes from multiple tiny decision trees.

## Goal
Help students build intuition: given several shallow (depth 2) binary decision trees and a single test point (x1, x2), can they mentally evaluate each tree and predict the forest's majority (Red vs Blue)?

## How It Works
1. Each tree randomly:
	- Chooses a feature (`x1` or `x2`).
	- Picks a threshold from a small discrete grid.
	- Assigns a color class (Red = 0, Blue = 1) to each leaf (left/right). Most trees have different colors on each side for information variety.
2. A random test point `(x1, x2)` in `[0,1]^2` is generated.
3. You see: the structure of all trees and the numeric test point values — but NOT the individual tree votes yet.
4. You predict the overall Random Forest color (Red or Blue) based on majority vote intuition.
5. After guessing, the app reveals each tree's vote color and the forest majority tally.

Because the number of trees is forced to be odd, there's always a clear majority.

## Features
* Adjustable odd number of trees (3–15).
* Infinite variation – press "New Question" for new trees + test point.
* Immediate feedback on correctness.
* Clean, responsive layout; accessible (semantic regions + `aria-live` for feedback).
* Zero dependencies: just open `index.html` in any modern browser.

## Run Locally
No build step required.

Option 1 (double click):
Open `index.html` directly in your browser (works for this simple static setup).

Option 2 (recommended local server for future extensions):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## File Overview
| File | Purpose |
|------|---------|
| `index.html` | Structure and UI regions (controls, trees, votes). |
| `style.css` | Visual styling, layout grid, color theme. |
| `script.js` | Random tree + point generation, rendering, interaction logic. |

## Code Highlights
* Trees kept intentionally minimal: an object with `feature`, `threshold`, `left`, `right`.
* Vote computed by simple comparison `value <= threshold ? left : right`.
* Majority color derived by counting Blue vs Red votes (odd tree count avoids ties).
* Separation of generation, evaluation, and rendering for clarity.

## Ideas for Extension (Not Implemented Yet)
* Show 2D scatter plot of synthetic training data that could have produced these trees.
* Difficulty modes (narrower thresholds, identical leaves to highlight uninformative trees).
* Track score / streak.
* Add explanation popover describing Random Forest formally.
* Allow more than two colors (multi-class) mini-forests.
* Option to hide thresholds until after guess (increase challenge).

## License
Educational sample. Use freely for teaching, labs, or demos.

---
Enjoy exploring ensemble intuition!