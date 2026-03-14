/* Day Type Decision Tree Interactive Infographic */
/* Vanilla JS - mounts into curriculum chapter content */

(function () {
  "use strict";

  var TREE = {
    question: "Where did price open relative to yesterday's Value Area?",
    options: [
      {
        label: "Above VA",
        question: "Is price accepting above VAH?",
        options: [
          {
            label: "Yes, accepting",
            result: {
              name: "Trend Day (Up)",
              range: "2x+ Initial Balance",
              behavior: "Sustained one sided extension upward. Value migrates away from prior day. Single prints form as price moves directionally. Other timeframe participants are driving.",
              strategy: "Trade with momentum only. Never fade a trend day. Use pullbacks to VWAP or prior levels as entries in the direction of the trend."
            }
          },
          {
            label: "No, rejected",
            result: {
              name: "Normal Variation",
              range: "1.5 to 2x Initial Balance",
              behavior: "IB breaks in one direction but the extension stalls. Starts as a potential trend day but loses momentum and the market balances in the extended range.",
              strategy: "Be ready to shift from trend model to balance model. Once extension stalls, fade the new extremes and target the midpoint of the expanded range."
            }
          }
        ]
      },
      {
        label: "Inside VA",
        question: "What is the IB width and opening type?",
        options: [
          {
            label: "Narrow IB + OD or OTD",
            result: {
              name: "Trend Day",
              range: "2x+ Initial Balance",
              behavior: "Narrow IB followed by sustained extension. Open Drive or Open Test Drive confirms strong conviction from other timeframe participants.",
              strategy: "Trade in the direction of the drive. The narrow IB signals that the day will likely expand significantly. Do not fade the extension."
            }
          },
          {
            label: "Average IB + Open Auction",
            result: {
              name: "Normal Day",
              range: "Approximately 1x Initial Balance",
              behavior: "Range holds near the IB. Balanced, rotational activity where day timeframe traders are dominant. IB extensions get rejected and price returns to the range.",
              strategy: "Fade the IB extremes. Enter at IBH or IBL and target the opposite edge or the IB midpoint. This is the most common day type."
            }
          },
          {
            label: "Wide IB, contained",
            result: {
              name: "Neutral Day",
              range: "Session contained within the wide IB",
              behavior: "Wide IB contains the entire session. Price extends both above and below IB but neither side takes control. Ends near the middle of the range.",
              strategy: "Low conviction environment. Use small targets within the IB range. Do not expect a breakout. Reduce position size."
            }
          }
        ]
      },
      {
        label: "Below VA",
        question: "Is price accepting below VAL?",
        options: [
          {
            label: "No, rejected",
            result: {
              name: "Normal Variation",
              range: "1.5 to 2x Initial Balance",
              behavior: "Directional extension stalls. Starts as a trend attempt but the market fails to sustain acceptance below VAL and balances in the extended range.",
              strategy: "Shift from trend to balance model. Once the rejection is confirmed, look for responsive buying and fade the lows targeting the midpoint."
            }
          },
          {
            label: "Yes, accepting",
            result: {
              name: "Trend Day (Down)",
              range: "2x+ Initial Balance",
              behavior: "Persistent selling with one timeframe down structure. Range extends well beyond the IB. Value migrates lower. Single prints form on the way down.",
              strategy: "Trade with the selling pressure. Never fade. Use bounces to VWAP or prior structure as short entries. Let the trend run."
            }
          }
        ]
      }
    ]
  };

  var SIGNALS = [
    { title: "IB Width", items: ["Narrow (bottom 25%): Trend day likely", "Average: Day type uncertain, wait for clues", "Wide (top 25%): Neutral or balance likely"] },
    { title: "Opening Type", items: ["Open Drive: Strong conviction, trend likely", "Open Test Drive: Probe then trend", "Open Auction: Balance, rotational day"] },
    { title: "First IB Extension", items: ["Extension holds: Directional day developing", "Extension fails: Rotational day confirmed", "Fade extremes, target opposite side"] },
    { title: "Overnight Inventory", items: ["Aligned with gap: Continuation likely", "Opposing gap: Inventory correction expected", "First 30 to 60 minutes of RTH are key"] }
  ];

  function mount(container) {
    var state = { step: 0, branch: null, sub: null };

    function reset() {
      state.step = 0;
      state.branch = null;
      state.sub = null;
      render();
    }

    function selectBranch(i) {
      state.branch = i;
      state.step = 1;
      render();
    }

    function selectSub(i) {
      state.sub = i;
      state.step = 2;
      render();
    }

    function render() {
      var currentBranch = state.branch !== null ? TREE.options[state.branch] : null;
      var result = currentBranch && state.sub !== null ? currentBranch.options[state.sub].result : null;

      var html = '<div class="ig-day-tree">' +
        '<div class="ig-tree-progress">';
      for (var s = 0; s < 3; s++) {
        html += '<div class="ig-tree-progress-bar' + (s <= state.step ? ' active' : '') + '"></div>';
      }
      html += '</div>';

      // Step 0: Root question
      if (state.step === 0) {
        html += '<div class="ig-tree-question root">' + TREE.question + '</div>' +
          '<div class="ig-tree-options">';
        TREE.options.forEach(function (opt, i) {
          html += '<button class="ig-tree-option" data-branch="' + i + '">' + opt.label + '</button>';
        });
        html += '</div>';
      }

      // Step 1: Sub question
      if (state.step === 1 && currentBranch) {
        html += '<div class="ig-tree-breadcrumb">' +
          '<span class="ig-tree-crumb">' + currentBranch.label + '</span>' +
          '<span class="ig-tree-crumb-note">selected</span></div>' +
          '<div class="ig-tree-question">' + currentBranch.question + '</div>' +
          '<div class="ig-tree-options">';
        currentBranch.options.forEach(function (opt, i) {
          html += '<button class="ig-tree-option" data-sub="' + i + '">' + opt.label + '</button>';
        });
        html += '</div>';
      }

      // Step 2: Result
      if (state.step === 2 && result) {
        html += '<div class="ig-tree-breadcrumb">' +
          '<span class="ig-tree-crumb">' + currentBranch.label + '</span>' +
          '<span class="ig-tree-crumb-arrow">→</span>' +
          '<span class="ig-tree-crumb">' + currentBranch.options[state.sub].label + '</span></div>' +
          '<div class="ig-tree-result-header">' +
          '<div class="ig-tree-result-name">' + result.name + '</div>' +
          '<div class="ig-tree-result-range">Expected range: ' + result.range + '</div></div>' +
          '<div class="ig-tree-result-section">' +
          '<div class="ig-tree-result-label">EXPECTED BEHAVIOR</div>' +
          '<div class="ig-tree-result-text">' + result.behavior + '</div></div>' +
          '<div class="ig-tree-result-section">' +
          '<div class="ig-tree-result-label">STRATEGY</div>' +
          '<div class="ig-tree-result-text">' + result.strategy + '</div></div>';
      }

      // Reset button
      if (state.step > 0) {
        html += '<button class="ig-tree-reset">Start Over</button>';
      }

      // Signals reference
      html += '<div class="ig-tree-signals">' +
        '<div class="ig-tree-signals-title">Early Decision Signals</div>' +
        '<div class="ig-tree-signals-grid">';
      SIGNALS.forEach(function (sig) {
        html += '<div class="ig-tree-signal-card">' +
          '<div class="ig-tree-signal-title">' + sig.title + '</div>';
        sig.items.forEach(function (item) {
          html += '<div class="ig-tree-signal-item">' + item + '</div>';
        });
        html += '</div>';
      });
      html += '</div></div></div>';

      container.innerHTML = html;

      // Bind events
      var branchBtns = container.querySelectorAll('[data-branch]');
      branchBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectBranch(parseInt(this.getAttribute('data-branch'), 10));
        });
      });

      var subBtns = container.querySelectorAll('[data-sub]');
      subBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectSub(parseInt(this.getAttribute('data-sub'), 10));
        });
      });

      var resetBtn = container.querySelector('.ig-tree-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', reset);
      }
    }

    render();

    return {
      unmount: function () {
        container.innerHTML = '';
      }
    };
  }

  window.InfographicDayTypeTree = { mount: mount };
})();
