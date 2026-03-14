/* Profile Shapes Interactive Infographic */
/* Vanilla JS - mounts into curriculum chapter content */

(function () {
  "use strict";

  var SHAPES = [
    {
      name: "P Shape",
      bars: [0.55, 0.7, 0.82, 0.9, 0.82, 0.7, 0.52, 0.3, 0.22, 0.16, 0.12, 0.1, 0.08],
      vaStart: 0, vaEnd: 7,
      description: "Volume clustered at the top with a thin tail below.",
      signal: "Signals short covering or selling into strength. Institutions exiting short positions, not necessarily initiating new longs.",
      trade: "Look for selling opportunities near the volume cluster. Do not chase longs. The thin tail below represents fast, one sided movement."
    },
    {
      name: "b Shape",
      bars: [0.08, 0.1, 0.12, 0.16, 0.22, 0.3, 0.52, 0.7, 0.82, 0.9, 0.82, 0.7, 0.55],
      vaStart: 6, vaEnd: 13,
      description: "Volume clustered at the bottom with a thin tail above.",
      signal: "Signals long liquidation or buying into weakness. Institutions selling out of positions until they find buyers.",
      trade: "Look for buying opportunities near the volume cluster. Do not chase shorts. The thin tail above was a fast rejection."
    },
    {
      name: "Bell / Normal (D Shape)",
      bars: [0.12, 0.22, 0.4, 0.6, 0.78, 0.9, 0.95, 0.95, 0.9, 0.78, 0.6, 0.4, 0.22],
      vaStart: 2, vaEnd: 11,
      description: "Symmetric distribution. Volume peaks at center, tapers evenly on both sides.",
      signal: "Balanced market with two sided trade. Neither buyers nor sellers dominant. Day timeframe traders in control.",
      trade: "Fade the extremes. Enter at VAH or VAL, target the opposite edge of the value area. This is the classic balance day profile."
    },
    {
      name: "Thin / Elongated",
      bars: [0.38, 0.42, 0.45, 0.48, 0.5, 0.52, 0.5, 0.52, 0.48, 0.45, 0.42, 0.38, 0.35],
      vaStart: 0, vaEnd: 13,
      description: "Narrow, stretched profile with no dominant volume cluster.",
      signal: "Strong trend or one sided auction. Other timeframe participants driving price directionally with conviction.",
      trade: "Trade with the trend only. Fading this profile is dangerous. Single prints form as price moves fast through levels."
    },
    {
      name: "Bimodal (Double Distribution)",
      bars: [0.55, 0.82, 0.95, 0.82, 0.55, 0.12, 0.08, 0.12, 0.55, 0.82, 0.95, 0.82, 0.55],
      vaStart: 0, vaEnd: 13,
      isBimodal: true,
      lvnIndex: [5, 6, 7],
      description: "Two distinct volume clusters separated by a low volume node.",
      signal: "Created by two timeframe activity. The market established value at one level, then migrated to a new value area entirely.",
      trade: "The LVN between clusters is the decision point. Trade the breakout or rejection at the gap. Two separate distributions mean two separate value areas."
    }
  ];

  function mount(container) {
    var state = { active: null };

    function render() {
      var html = '<div class="ig-profile-shapes">' +
        '<div class="ig-cards">';

      SHAPES.forEach(function (shape, i) {
        var isActive = state.active === i;
        html += '<div class="ig-card' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
          '<div class="ig-card-top">' +
          '<div class="ig-profile-bars">';

        shape.bars.forEach(function (b, bi) {
          var inVA = bi >= shape.vaStart && bi < shape.vaEnd;
          var isLVN = shape.lvnIndex && shape.lvnIndex.indexOf(bi) !== -1;
          var barClass = 'ig-bar';
          if (isLVN) barClass += ' lvn';
          else if (inVA) barClass += ' va';
          if (isActive) barClass += ' active';

          html += '<div class="' + barClass + '" style="width:' + (b * 100) + '%;transition-delay:' + (bi * 30) + 'ms"></div>';
        });

        html += '</div>' +
          '<div class="ig-card-text">' +
          '<div class="ig-shape-name">' + shape.name + '</div>' +
          '<div class="ig-shape-desc">' + shape.description + '</div>' +
          '</div></div>' +
          '<div class="ig-card-expanded">' +
          '<div class="ig-expanded-inner">' +
          '<div class="ig-section">' +
          '<div class="ig-section-label">SIGNAL</div>' +
          '<div class="ig-section-text">' + shape.signal + '</div>' +
          '</div>' +
          '<div class="ig-section">' +
          '<div class="ig-section-label">HOW TO TRADE IT</div>' +
          '<div class="ig-section-text">' + shape.trade + '</div>' +
          '</div></div></div></div>';
      });

      html += '</div></div>';
      container.innerHTML = html;

      // Bind click events
      var cards = container.querySelectorAll('.ig-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          var idx = parseInt(this.getAttribute('data-index'), 10);
          state.active = state.active === idx ? null : idx;
          render();
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
      });
    }

    render();

    return {
      unmount: function () {
        container.innerHTML = '';
      }
    };
  }

  window.InfographicProfileShapes = { mount: mount };
})();
