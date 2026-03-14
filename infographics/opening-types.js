/* Opening Types Interactive Infographic */
/* Vanilla JS - mounts into curriculum chapter content */

(function () {
  "use strict";

  var TYPES = [
    {
      abbr: "OD",
      name: "Open Drive",
      path: "M 10,180 C 30,170 50,150 70,130 C 90,110 110,85 130,65 C 150,50 170,38 190,28 C 210,22 230,18 250,15",
      refLine: { y: 180, label: "open price" },
      markers: [{ x: 10, y: 180, label: "OPEN" }],
      desc: "Price moves aggressively in one direction from the open and never returns to the opening price. Strong conviction from other timeframe participants.",
      signal: "Trend day likely. Do not fade an Open Drive. Trade in the direction of the drive only. The IB will typically be narrow and one sided."
    },
    {
      abbr: "OTD",
      name: "Open Test Drive",
      path: "M 10,120 C 25,130 40,150 55,165 C 65,172 72,170 80,160 C 95,135 110,110 130,85 C 150,65 170,48 190,35 C 210,25 235,18 255,14",
      markers: [{ x: 10, y: 120, label: "OPEN" }, { x: 65, y: 175, label: "test", below: true }],
      desc: "Price probes one direction first, reverses to test the opposite side, then drives in the original direction. An initial liquidity grab before the true move.",
      signal: "Trend day likely after the test completes. Wait for the reversal to confirm. Traders who fade the initial probe get caught in the true move."
    },
    {
      abbr: "ORR",
      name: "Open Rejection Reverse",
      path: "M 10,110 C 30,85 45,60 60,40 C 70,32 78,35 85,45 C 100,70 115,100 130,130 C 150,155 170,175 195,190 C 215,198 235,202 255,205",
      markers: [{ x: 10, y: 110, label: "OPEN" }, { x: 60, y: 30, label: "rejection", above: true }],
      desc: "Price probes one direction aggressively, gets rejected, and reverses to sustain the opposite direction. A failed breakout attempt at the open.",
      signal: "The rejection IS the signal. Trade with the reversal direction. The failed probe traps participants who committed early, fueling the reversal."
    },
    {
      abbr: "OA",
      name: "Open Auction",
      path: "M 10,110 C 25,98 40,85 55,92 C 70,100 80,115 95,122 C 110,128 120,120 135,108 C 150,98 160,102 175,112 C 190,120 200,118 215,108 C 230,100 240,105 255,112",
      refLines: [{ y: 78, label: "IBH" }, { y: 135, label: "IBL" }],
      markers: [{ x: 10, y: 110, label: "OPEN" }],
      desc: "Price rotates within a range with no clear directional intent. Neither side is dominant. The market is in equilibrium during the open.",
      signal: "Balance day likely. Fade the IB extremes and expect the range to contain most of the session. Distinguish genuine balance from pre breakout compression."
    }
  ];

  function mount(container) {
    var state = { active: null };

    function animatePath(pathEl) {
      var len = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = len;
      pathEl.style.strokeDashoffset = len;
      // Force reflow
      pathEl.getBoundingClientRect();
      pathEl.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
      pathEl.style.strokeDashoffset = '0';
    }

    function render() {
      var html = '<div class="ig-opening-types">';

      TYPES.forEach(function (type, i) {
        var isActive = state.active === i;
        html += '<div class="ig-ot-card' + (isActive ? ' active' : '') + '" data-index="' + i + '" tabindex="0" role="button">' +
          '<div class="ig-ot-card-top">' +
          '<div class="ig-ot-chart">' +
          '<svg viewBox="0 0 270 220" preserveAspectRatio="xMidYMid meet">' +
          '<line x1="5" y1="210" x2="265" y2="210" stroke="#333" stroke-width="0.5"/>' +
          '<line x1="5" y1="0" x2="5" y2="210" stroke="#333" stroke-width="0.5"/>' +
          '<text x="10" y="218" fill="#555" font-size="9" font-family="monospace">9:30</text>' +
          '<text x="125" y="218" fill="#555" font-size="9" font-family="monospace">9:45</text>' +
          '<text x="240" y="218" fill="#555" font-size="9" font-family="monospace">10:00</text>';

        if (type.refLine) {
          html += '<line x1="5" y1="' + type.refLine.y + '" x2="265" y2="' + type.refLine.y + '" stroke="#00C9A7" stroke-width="0.8" stroke-dasharray="4,4" opacity="0.25"/>' +
            '<text x="260" y="' + (type.refLine.y - 4) + '" fill="#555" font-size="8" text-anchor="end">' + type.refLine.label + '</text>';
        }

        if (type.refLines) {
          type.refLines.forEach(function (rl) {
            html += '<line x1="5" y1="' + rl.y + '" x2="265" y2="' + rl.y + '" stroke="#E8E8E8" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.2"/>' +
              '<text x="260" y="' + (rl.y - 3) + '" fill="#555" font-size="8" text-anchor="end">' + rl.label + '</text>';
          });
        }

        type.markers.forEach(function (m) {
          var textY = m.below ? m.y + 14 : (m.above ? m.y - 8 : m.y + 4);
          html += '<circle cx="' + m.x + '" cy="' + m.y + '" r="4" fill="#00C9A7"/>' +
            '<text x="' + (m.x + 8) + '" y="' + textY + '" fill="#00C9A7" font-size="9" font-family="sans-serif">' + m.label + '</text>';
        });

        html += '<path class="ig-ot-path" data-card="' + i + '" d="' + type.path + '" fill="none" stroke="#00C9A7" stroke-width="3" stroke-linecap="round"/>' +
          '</svg></div>' +
          '<div class="ig-ot-text">' +
          '<div class="ig-ot-name">' + type.name + ' <span class="ig-ot-abbr">(' + type.abbr + ')</span></div>' +
          '<div class="ig-ot-desc">' + type.desc + '</div>' +
          '</div></div>' +
          '<div class="ig-ot-signal">' +
          '<div class="ig-ot-signal-label">SESSION SIGNAL</div>' +
          '<div class="ig-ot-signal-text">' + type.signal + '</div>' +
          '</div></div>';
      });

      html += '</div>';
      container.innerHTML = html;

      // Initialize path lengths and bind events
      var cards = container.querySelectorAll('.ig-ot-card');
      cards.forEach(function (card) {
        var idx = parseInt(card.getAttribute('data-index'), 10);
        var pathEl = card.querySelector('.ig-ot-path');

        // Initialize path to hidden state
        if (pathEl) {
          var len = pathEl.getTotalLength();
          pathEl.style.strokeDasharray = len;
          pathEl.style.strokeDashoffset = state.active === idx ? '0' : len;
        }

        card.addEventListener('click', function () {
          var wasActive = state.active === idx;
          state.active = wasActive ? null : idx;

          // Update active states
          cards.forEach(function (c, ci) {
            var isNowActive = state.active === ci;
            c.classList.toggle('active', isNowActive);

            var p = c.querySelector('.ig-ot-path');
            if (p) {
              if (isNowActive) {
                animatePath(p);
              } else {
                p.style.transition = 'none';
                var pLen = p.getTotalLength();
                p.style.strokeDashoffset = pLen;
              }
            }
          });
        });

        card.addEventListener('keydown', function (e) {
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

  window.InfographicOpeningTypes = { mount: mount };
})();
