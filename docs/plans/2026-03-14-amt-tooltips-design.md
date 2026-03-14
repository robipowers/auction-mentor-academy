# AMT Abbreviation Tooltips Design

## Overview

Add hover tooltips to AMT (Auction Market Theory) abbreviations throughout curriculum content. Tooltips show full term plus brief definition on first occurrence per chapter.

## Requirements

- **Frequency:** First occurrence per chapter only
- **Trigger:** Hover on desktop, tap on mobile
- **Content:** Full term + brief definition (e.g., "Point of Control — The price level with the highest traded volume")
- **Visual:** Subtle dotted underline indicates interactivity

## Implementation Approach

Static markup in data.js with centralized glossary in app.js.

### Glossary Object (app.js)

```javascript
var GLOSSARY = {
  "POC": { term: "Point of Control", def: "The price level with the highest traded volume" },
  "VAH": { term: "Value Area High", def: "Upper boundary of the 70% volume zone" },
  // ... ~25 terms
};
```

### Markup (data.js)

First occurrences wrapped with:
```html
<span class="amt-term" data-term="POC">POC</span>
```

### CSS (app.css)

- `.amt-term` base styles with dotted underline
- `::after` pseudo-element for tooltip content
- Hover state shows tooltip
- Mobile: tap to toggle

### JS (app.js)

- On chapter render, populate `data-tooltip` from GLOSSARY lookup
- Mobile touch handler for tap-to-show behavior

## Terms to Include

POC, VAH, VAL, VA, HVN, LVN, IB, IBH, IBL, IBM, IBR, OD, OTD, ORR, OA, OAIR, OAOR, DTF, OTF, CD, CVD, ATR, VWAP, TPO, RTH, ETH, NQ, ES

## Files Modified

- `app.js`: Add GLOSSARY object and tooltip initialization
- `app.css`: Add tooltip styles
- `data.js`: Wrap first occurrences with `amt-term` spans
