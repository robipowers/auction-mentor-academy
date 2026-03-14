/* Value Area Anatomy Interactive Infographic */
/* Vanilla JS - mounts into curriculum chapter content */

(function () {
  "use strict";

  var LABELS = [
    { id: "vah", name: "VAH", full: "Value Area High", y: 22, color: "#00C9A7", desc: "Upper boundary of the zone where 70% of volume traded. Acts as resistance in a balanced market and a breakout level in a trending market. Responsive sellers often defend VAH from below." },
    { id: "hvn", name: "HVN", full: "High Volume Node", y: 38, color: "#00C9A7", desc: "Area of heavy two sided trade and high agreement on value. Price tends to slow, chop, and rotate at HVNs. Acts as a value magnet that attracts price back when it moves away." },
    { id: "lvn", name: "LVN", full: "Low Volume Node", y: 52, color: "#FFB347", desc: "Area of disagreement and fast price movement. Price moves quickly through LVNs because participants rejected this price as fair value. Acts as an inflection point, not a resting place." },
    { id: "poc", name: "POC", full: "Point of Control", y: 62, color: "#FF6B6B", desc: "The single price level with the highest volume in the profile. The market's best estimate of fair value for the session. Price is naturally attracted to POC and tends to return to it." },
    { id: "val", name: "VAL", full: "Value Area Low", y: 80, color: "#00C9A7", desc: "Lower boundary of the 70% volume zone. Acts as support in a balanced market and a breakdown level in a trending market. Responsive buyers often defend VAL from above." }
  ];

  var BARS = [
    { w: 15, va: false }, { w: 22, va: false }, { w: 30, va: false }, { w: 38, va: false },
    { w: 48, va: false }, { w: 55, va: false },
    { w: 70, va: true }, { w: 80, va: true }, { w: 75, va: true }, { w: 65, va: true },
    { w: 90, va: true, hvn: true }, { w: 95, va: true, hvn: true }, { w: 98, va: true, hvn: true },
    { w: 30, va: true, lvn: true }, { w: 25, va: true, lvn: true }, { w: 28, va: true, lvn: true },
    { w: 100, va: true, poc: true }, { w: 97, va: true, poc: true }, { w: 99, va: true, poc: true },
    { w: 85, va: true }, { w: 75, va: true }, { w: 68, va: true }, { w: 78, va: true },
    { w: 72, va: true }, { w: 62, va: true }, { w: 55, va: true },
    { w: 45, va: false }, { w: 35, va: false }, { w: 28, va: false },
    { w: 20, va: false }, { w: 15, va: false }, { w: 12, va: false }
  ];

  function getBarHighlight(bar, activeId, barIndex) {
    if (!activeId) return null;
    if (activeId === "vah" && barIndex === 6) return "boundary";
    if (activeId === "val" && barIndex === 26) return "boundary";
    if (activeId === "hvn" && bar.hvn) return true;
    if (activeId === "lvn" && bar.lvn) return true;
    if (activeId === "poc" && bar.poc) return true;
    return null;
  }

  function mount(container) {
    var state = { active: null };

    function render() {
      var activeLabel = LABELS.find(function (l) { return l.id === state.active; });

      var html = '<div class="ig-value-area">' +
        '<div class="ig-va-layout">' +
        '<div class="ig-va-profile">' +
        '<div class="ig-va-bracket' + (state.active === "vah" || state.active === "val" || !state.active ? ' visible' : '') + '">' +
        '<span class="ig-va-bracket-label">VALUE AREA 70%</span></div>';

      BARS.forEach(function (bar, i) {
        var hl = getBarHighlight(bar, state.active, i);
        var barClass = 'ig-va-bar';
        if (bar.va) barClass += ' va';
        if (hl === true) barClass += ' highlight';
        if (hl === "boundary") barClass += ' boundary';
        if (state.active && !hl) barClass += ' dimmed';

        var bgColor = '';
        if (hl === true && activeLabel) bgColor = activeLabel.color;
        if (hl === "boundary") bgColor = "#00C9A7";

        html += '<div class="' + barClass + '" style="width:' + bar.w + '%' + (bgColor ? ';background:' + bgColor : '') + '"></div>';
      });

      html += '</div>' +
        '<div class="ig-va-labels">';

      LABELS.forEach(function (label) {
        var isActive = state.active === label.id;
        html += '<div class="ig-va-label' + (isActive ? ' active' : '') + '" data-id="' + label.id + '" tabindex="0" role="button">' +
          '<div class="ig-va-label-header">' +
          '<span class="ig-va-label-dot" style="background:' + label.color + '"></span>' +
          '<span class="ig-va-label-name" style="color:' + label.color + '">' + label.name + '</span>' +
          '<span class="ig-va-label-full">' + label.full + '</span>' +
          '</div>' +
          '<div class="ig-va-label-desc">' + label.desc + '</div>' +
          '</div>';
      });

      html += '</div></div>' +
        '<div class="ig-va-legend">' +
        '<div class="ig-legend-item"><span class="ig-legend-box va"></span>Inside Value Area</div>' +
        '<div class="ig-legend-item"><span class="ig-legend-box outside"></span>Outside Value Area</div>' +
        '</div></div>';

      container.innerHTML = html;

      // Bind events
      var labels = container.querySelectorAll('.ig-va-label');
      labels.forEach(function (el) {
        el.addEventListener('click', function () {
          var id = this.getAttribute('data-id');
          state.active = state.active === id ? null : id;
          render();
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
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

  window.InfographicValueAreaAnatomy = { mount: mount };
})();
