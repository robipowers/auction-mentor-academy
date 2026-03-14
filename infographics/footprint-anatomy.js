/* Footprint Anatomy Interactive Infographic */
/* Vanilla JS - mounts into curriculum chapter content */

(function () {
  "use strict";

  var ELEMENTS = [
    { id: "bidask", name: "Bid x Ask Volume", color: "#00C9A7", desc: "Each price level shows two numbers. Left = bid volume (sells hitting bids). Right = ask volume (buys lifting offers). This reveals who is aggressive at each price, which is invisible on a standard candlestick." },
    { id: "imbalance", name: "Imbalance Stacking", color: "#00C9A7", desc: "Three or more consecutive price levels where one side dominates by 200% or more. When ask volume overwhelms bid volume at stacked levels, it signals strong directional buying conviction. The reverse signals aggressive selling." },
    { id: "absorption", name: "Absorption Pattern", color: "#FFB347", desc: "High volume on one side of the book but price fails to move. Aggressive sellers are being absorbed by passive limit buyers (or vice versa). This exhaustion of one side often precedes a reversal." },
    { id: "delta", name: "Delta Per Bar", color: "#FF6B6B", desc: "Net difference between total ask volume and total bid volume for each candle. Positive delta = net buying pressure. Negative delta = net selling pressure. Reveals the true aggressor behind each bar." },
    { id: "cumdelta", name: "Cumulative Delta", color: "#8B5CF6", desc: "Running total of delta across the session. When cumulative delta diverges from price (price making highs but delta declining), it reveals hidden weakness or strength the candlestick alone cannot show." }
  ];

  var INSIGHTS = [
    { title: "Green candle + negative delta = hidden weakness", desc: "Price rose but sellers were more aggressive. The move may not be sustainable. The footprint reveals what the candlestick hides." },
    { title: "Red candle + positive delta = hidden strength", desc: "Price fell but buyers were more aggressive. Sellers are being absorbed. The move down is losing conviction. Watch for reversal." },
    { title: "Diagonal footprint pattern = initiative activity", desc: "Rising diagonal of high ask volume confirms aggressive buying. Falling diagonal of high bid volume confirms aggressive selling." }
  ];

  var CANDLES = [
    {
      type: "bear", open: 2, close: 8,
      levels: [
        { price: "4518", bid: 45, ask: 12 },
        { price: "4516", bid: 120, ask: 85 },
        { price: "4514", bid: 230, ask: 95, body: true },
        { price: "4512", bid: 310, ask: 110, body: true },
        { price: "4510", bid: 280, ask: 75, body: true },
        { price: "4508", bid: 190, ask: 60, body: true },
        { price: "4506", bid: 85, ask: 30 }
      ],
      delta: -793
    },
    {
      type: "bear", open: 4, close: 8, hasAbsorption: true,
      levels: [
        { price: "4510", bid: 65, ask: 40 },
        { price: "4508", bid: 140, ask: 90, body: true },
        { price: "4506", bid: 200, ask: 120, body: true },
        { price: "4504", bid: 250, ask: 100, body: true },
        { price: "4502", bid: 180, ask: 420, absorption: true, body: true },
        { price: "4500", bid: 60, ask: 380, absorption: true }
      ],
      delta: -285
    },
    {
      type: "bull", open: 8, close: 4, hasImbalance: true,
      levels: [
        { price: "4510", bid: 80, ask: 220, body: true },
        { price: "4508", bid: 95, ask: 310, body: true },
        { price: "4506", bid: 70, ask: 280, body: true },
        { price: "4504", bid: 40, ask: 350, imbalance: true },
        { price: "4502", bid: 35, ask: 380, imbalance: true },
        { price: "4500", bid: 25, ask: 290, imbalance: true }
      ],
      delta: 1535
    },
    {
      type: "bull", open: 6, close: 2,
      levels: [
        { price: "4516", bid: 55, ask: 180, body: true },
        { price: "4514", bid: 90, ask: 250, body: true },
        { price: "4512", bid: 110, ask: 200, body: true },
        { price: "4510", bid: 75, ask: 160 }
      ],
      delta: 660
    }
  ];

  var CUM_DELTA = [-793, -1078, 457, 1117, 1222];

  function mount(container) {
    var state = { active: null };

    function render() {
      var activeEl = ELEMENTS.find(function (e) { return e.id === state.active; });

      var html = '<div class="ig-footprint">' +
        '<div class="ig-fp-filters">';

      ELEMENTS.forEach(function (el) {
        var isActive = state.active === el.id;
        html += '<button class="ig-fp-filter' + (isActive ? ' active' : '') + '" data-id="' + el.id + '" style="' +
          (isActive ? 'background:' + el.color + '20;border-color:' + el.color + ';color:' + el.color : '') + '">' +
          el.name + '</button>';
      });

      html += '</div>';

      // Active element description
      if (activeEl) {
        html += '<div class="ig-fp-desc" style="border-left-color:' + activeEl.color + '">' +
          '<div class="ig-fp-desc-name" style="color:' + activeEl.color + '">' + activeEl.name + '</div>' +
          '<div class="ig-fp-desc-text">' + activeEl.desc + '</div></div>';
      }

      // Footprint chart
      html += '<div class="ig-fp-chart"><div class="ig-fp-candles">';

      CANDLES.forEach(function (candle) {
        var isBull = candle.type === "bull";
        var baseColor = isBull ? "#00C9A7" : "#FF4444";

        html += '<div class="ig-fp-candle">';

        candle.levels.forEach(function (level) {
          var isAbsorption = level.absorption && state.active === "absorption";
          var isImbalance = level.imbalance && state.active === "imbalance";
          var highlightBidAsk = state.active === "bidask" || state.active === "delta";

          var levelClass = 'ig-fp-level';
          if (isAbsorption) levelClass += ' absorption';
          if (isImbalance) levelClass += ' imbalance';
          if (level.body) levelClass += ' body';

          var bidClass = 'ig-fp-bid';
          var askClass = 'ig-fp-ask';
          if (state.active && !highlightBidAsk && !isAbsorption && !isImbalance) {
            bidClass += ' dimmed';
            askClass += ' dimmed';
          }
          if (highlightBidAsk) {
            bidClass += ' highlight';
            askClass += ' highlight';
          }
          if (level.absorption) askClass += ' absorption-value';
          if (level.imbalance) askClass += ' imbalance-value';

          html += '<div class="' + levelClass + '" style="' +
            (level.body ? 'border-color:' + baseColor + '22' : '') + '">' +
            '<span class="' + bidClass + '" style="color:' + (isBull ? '#AAAAAA' : '#FF6666') + '">' + level.bid + '</span>' +
            '<span class="ig-fp-x">×</span>' +
            '<span class="' + askClass + '">' + level.ask + '</span>' +
            '<span class="ig-fp-price">' + level.price + '</span></div>';
        });

        // Delta bar
        var deltaClass = 'ig-fp-delta';
        if (state.active === "delta" || state.active === "cumdelta") deltaClass += ' highlight';
        else if (state.active) deltaClass += ' dimmed';

        html += '<div class="' + deltaClass + '" style="' +
          'background:' + (candle.delta > 0 ? 'rgba(0,201,167,0.2)' : 'rgba(255,68,68,0.2)') + ';' +
          'color:' + (candle.delta > 0 ? '#00C9A7' : '#FF6666') + ';' +
          (state.active === "delta" ? 'border-color:' + (candle.delta > 0 ? '#00C9A7' : '#FF6666') : '') + '">' +
          (candle.delta > 0 ? '+' : '') + candle.delta + '</div></div>';
      });

      html += '</div>';

      // Cumulative delta row
      var cumClass = 'ig-fp-cumdelta';
      if (state.active === "cumdelta") cumClass += ' highlight';
      else if (state.active) cumClass += ' dimmed';

      html += '<div class="' + cumClass + '">' +
        '<div class="ig-fp-cumdelta-label">CUMULATIVE DELTA</div>' +
        '<div class="ig-fp-cumdelta-values">';

      CUM_DELTA.forEach(function (v) {
        html += '<div class="ig-fp-cumdelta-val" style="color:' + (v > 0 ? '#00C9A7' : '#FF6666') + '">' +
          (v > 0 ? '+' : '') + v + '</div>';
      });

      html += '</div></div></div>';

      // Reading the Footprint insights
      html += '<div class="ig-fp-insights">' +
        '<div class="ig-fp-insights-title">Reading the Footprint</div>';

      INSIGHTS.forEach(function (insight) {
        html += '<div class="ig-fp-insight">' +
          '<div class="ig-fp-insight-title">' + insight.title + '</div>' +
          '<div class="ig-fp-insight-desc">' + insight.desc + '</div></div>';
      });

      html += '</div>';

      // Legend
      html += '<div class="ig-fp-legend">' +
        '<div class="ig-legend-item"><span class="ig-legend-box" style="background:#FF4444;opacity:0.5"></span>Bid (sells)</div>' +
        '<div class="ig-legend-item"><span class="ig-legend-box" style="background:#00C9A7;opacity:0.5"></span>Ask (buys)</div>' +
        '<div class="ig-legend-item"><span class="ig-legend-box" style="border:1.5px solid #FFB347"></span>Absorption</div>' +
        '<div class="ig-legend-item"><span class="ig-legend-box" style="border:1.5px solid #00C9A7"></span>Imbalance</div>' +
        '</div></div>';

      container.innerHTML = html;

      // Bind filter events
      var filters = container.querySelectorAll('.ig-fp-filter');
      filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = this.getAttribute('data-id');
          state.active = state.active === id ? null : id;
          render();
        });
      });
    }

    render();

    return {
      unmount: function () {
        container.innerHTML = '';
      }
    };
  }

  window.InfographicFootprintAnatomy = { mount: mount };
})();
