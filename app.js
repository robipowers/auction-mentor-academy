/* app.js — Auction Mentor Academy: Routing, State & Rendering */
/* Data comes from data.js (SECTIONS, QUIZZES, RULES, PHASES) */
/* global SECTIONS, QUIZZES, RULES, PHASES */

(function () {
  "use strict";

  // ── State ──
  var state = {
    completedSections: {},
    completedChapters: {},
    quizScores: {},
    currentSection: null,
    currentChapter: 0,
    currentQuiz: null,
    currentQuestion: 0,
    quizAnswers: [],
    quizAnswered: false,
    sidebarOpen: false,
    theme: "dark"
  };

  // ── Helpers ──
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function getSection(id) {
    return SECTIONS.find(function (s) { return s.id === Number(id); });
  }

  function countCompleted() {
    var chapters = Object.keys(state.completedChapters).length;
    var sections = Object.keys(state.completedSections).length;
    var total = SECTIONS.reduce(function (n, s) { return n + s.chapters.length; }, 0);
    return { chapters: chapters, sections: sections, total: total };
  }

  // ── SVG Helpers ──
  var ICONS = {
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chevronDown: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    chevronLeft: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevronRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    book: '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    clock: '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    sun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    external: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>',
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    slides: '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    video: '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    trophy: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22h10c0-2-0.85-3.25-2.03-3.79A1.07 1.07 0 0 1 14 17v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    xCircle: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
    circle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    checkCircle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>'
  };

  var LOGO_SVG = '<svg viewBox="0 0 32 32" fill="none" aria-label="Auction Mentor Academy logo">' +
    '<rect x="2" y="18" width="4" height="10" rx="1" fill="currentColor" opacity="0.4"/>' +
    '<rect x="8" y="12" width="4" height="16" rx="1" fill="currentColor" opacity="0.6"/>' +
    '<rect x="14" y="6" width="4" height="22" rx="1" fill="currentColor" opacity="1"/>' +
    '<rect x="20" y="10" width="4" height="18" rx="1" fill="currentColor" opacity="0.6"/>' +
    '<rect x="26" y="16" width="4" height="12" rx="1" fill="currentColor" opacity="0.4"/>' +
    '<circle cx="16" cy="14" r="2" fill="currentColor" opacity="0"/>' +
    '<line x1="5" y1="14" x2="27" y2="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.3"/>' +
    '</svg>';

  // ── Theme Toggle ──
  function initTheme() {
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    state.theme = dark ? "dark" : "light";
    // Default to dark as per spec
    state.theme = "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", state.theme);
    var btn = $("#theme-toggle");
    if (btn) {
      btn.innerHTML = state.theme === "dark" ? ICONS.sun : ICONS.moon;
      btn.setAttribute("aria-label", "Switch to " + (state.theme === "dark" ? "light" : "dark") + " mode");
    }
  }

  // ── Reading Progress ──
  function updateReadingProgress() {
    var bar = $("#reading-progress");
    if (!bar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
    bar.style.width = pct + "%";
  }

  // ── Router ──
  function getRoute() {
    var hash = window.location.hash.slice(1) || "dashboard";
    var parts = hash.split("/");
    return { view: parts[0], id: parts[1] || null };
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function onRouteChange() {
    var route = getRoute();
    var app = $("#app");

    // Reset sidebar state
    state.sidebarOpen = false;

    // Clear reading progress
    var rp = $("#reading-progress");
    if (rp) rp.style.width = "0%";

    switch (route.view) {
      case "section":
        renderSectionView(app, route.id);
        break;
      case "quiz":
        renderQuizView(app, route.id);
        break;
      case "rules":
        renderRulesView(app);
        break;
      case "glossary":
        renderGlossaryView(app);
        break;
      default:
        renderDashboard(app);
    }

    // Animate entrance
    requestAnimationFrame(function () {
      var main = $(".view-enter");
      if (main) {
        requestAnimationFrame(function () {
          main.classList.add("view-active");
          main.classList.remove("view-enter");
        });
      }
    });
  }

  // ── Render: Top Bar ──
  function renderTopBar() {
    var stats = countCompleted();
    var pct = stats.total > 0 ? Math.round((stats.chapters / stats.total) * 100) : 0;

    return '<header class="topbar">' +
      '<a href="#dashboard" class="topbar-logo" aria-label="Go to dashboard">' + LOGO_SVG +
      '<span class="topbar-logo-text">Auction Mentor</span></a>' +
      '<nav class="topbar-progress">' +
      '<span class="topbar-progress-label">' + stats.chapters + ' / ' + stats.total + '</span>' +
      '<div class="progress-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">' +
      '<div class="progress-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</nav>' +
      '<div class="topbar-actions">' +
      '<a href="#glossary" class="nav-link" aria-label="AMT Glossary">Glossary</a>' +
      '<a href="#rules" class="nav-link" aria-label="Trading Rules">Rules</a>' +
      '<button id="theme-toggle" class="btn-icon" aria-label="Switch to light mode" style="margin-right:12px;">' +
      (state.theme === "dark" ? ICONS.sun : ICONS.moon) + '</button>' +
      '<button id="auth-signout" class="btn btn-secondary" style="padding:6px 12px;font-size:13px;border-color:#3a3a4e;">Sign Out</button>' +
      '</div></header>';
  }

  // ── Render: Footer ──
  function renderFooter() {
    return '<footer class="site-footer">' +
      '<a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer">Created with Perplexity Computer</a>' +
      '</footer>';
  }

  // ── Render: Dashboard ──
  function renderDashboard(app) {
    var stats = countCompleted();

    var html = renderTopBar() +
      '<div id="reading-progress" class="reading-progress" style="width:0%"></div>' +
      '<main id="main-content" class="dashboard view-enter">';

    // Welcome
    html += '<div class="dashboard-welcome">' +
      '<h1>NQ Futures Day Trading Curriculum</h1>' +
      '<div class="dashboard-stats">' +
      '<span>' + ICONS.book + ' <span class="stat-value">' + stats.sections + '</span> of 13 sections</span>' +
      '<span>' + ICONS.clock + ' <span class="stat-value">' + stats.chapters + '</span> of ' + stats.total + ' chapters</span>' +
      '</div></div>';

    // Phases
    PHASES.forEach(function (phase) {
      html += '<div class="phase-group">' +
        '<div class="phase-header">' +
        '<span class="phase-num">Phase ' + phase.num + '</span>' +
        '<span class="phase-title">' + phase.title + '</span>' +
        '</div><div class="sections-grid">';

      phase.sections.forEach(function (sId) {
        var s = getSection(sId);
        if (!s) return;
        var isComplete = state.completedSections[s.id];
        var score = state.quizScores[s.id];
        var chapCount = s.chapters.length;
        var completedCount = 0;
        s.chapters.forEach(function (_, ci) {
          if (state.completedChapters[s.id + "-" + ci]) completedCount++;
        });

        html += '<div class="section-card" role="link" tabindex="0" data-section="' + s.id + '">' +
          '<div class="section-card-top">' +
          '<span class="section-badge">S' + String(s.id).padStart(2, "0") + '</span>';
        if (isComplete) {
          html += '<span class="section-complete-badge">' + ICONS.checkCircle + ' Complete</span>';
        }
        html += '</div>' +
          '<h3>' + s.title + '</h3>' +
          '<p>' + s.desc + '</p>' +
          '<div class="section-card-meta">' +
          '<span>' + ICONS.book + ' ' + chapCount + ' chapters</span>' +
          '<span>' + ICONS.clock + ' ' + s.readTime + '</span>';
        if (s.youtubeId || s.youtubeId2) {
          html += '<span class="video-badge">' + ICONS.play + ' Video</span>';
        }
        if (s.gammaDecks && s.gammaDecks.length > 0) {
          html += '<span class="slides-badge">' + ICONS.slides + ' Slides</span>';
        }
        if (score !== undefined) {
          var passed = score >= 3;
          html += '<span class="quiz-score-badge ' + (passed ? "pass" : "fail") + '">' + score + '/5</span>';
        }
        html += '</div></div>';
      });

      html += '</div></div>';
    });

    html += '</main>' + renderFooter();
    app.innerHTML = html;

    // Bind card clicks
    $$(".section-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = this.getAttribute("data-section");
        navigate("section/" + id);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    bindTopBarEvents();
  }

  // ── Render: Section View ──
  function renderSectionView(app, sectionId) {
    var section = getSection(sectionId);
    if (!section) { navigate("dashboard"); return; }
    state.currentSection = section;
    state.currentChapter = 0;

    var html = renderTopBar() +
      '<div id="reading-progress" class="reading-progress" style="width:0%"></div>' +
      '<div class="sidebar-backdrop" id="sidebar-backdrop"></div>' +
      '<div class="section-view view-enter">' +
      renderChapterSidebar(section) +
      '<main id="main-content" class="content-area">' +
      renderChapterContent(section, 0) +
      '</main></div>';

    app.innerHTML = html;

    bindTopBarEvents();
    bindSidebarEvents(section);
    bindContentEvents(section);

    // Mark first chapter as complete
    markChapterComplete(section.id, 0);

    // Scroll listener for reading progress
    window.addEventListener("scroll", updateReadingProgress);
  }

  function renderChapterSidebar(section) {
    var html = '<aside class="chapter-sidebar" id="chapter-sidebar">' +
      '<div class="chapter-sidebar-header">' +
      '<h2>' + section.title + '</h2>' +
      '<button class="sidebar-close" id="sidebar-close" aria-label="Close sidebar">' + ICONS.close + '</button>' +
      '</div><ul class="chapter-list" role="list">';

    section.chapters.forEach(function (ch, i) {
      var isActive = i === state.currentChapter;
      var isCompleted = state.completedChapters[section.id + "-" + i];
      var cls = "chapter-item" + (isActive ? " active" : "") + (isCompleted ? " completed" : "");

      html += '<li class="' + cls + '" data-chapter="' + i + '" role="button" tabindex="0">' +
        '<span class="chapter-num">' + (i + 1) + '</span>' +
        '<span class="chapter-check">' + (isCompleted ? ICONS.checkCircle : ICONS.circle) + '</span>' +
        '<span class="chapter-item-title">' + ch.title + '</span>' +
        '</li>';
    });

    html += '</ul></aside>';
    return html;
  }

  function renderChapterContent(section, chapterIdx) {
    var ch = section.chapters[chapterIdx];
    var isFirst = chapterIdx === 0;
    var isLast = chapterIdx === section.chapters.length - 1;

    var html = '<div class="content-inner">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb">' +
      '<a href="#dashboard">Dashboard</a>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<a href="#section/' + section.id + '">' + section.title + '</a>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-current">' + ch.title + '</span>' +
      '</nav>';

    // Mobile sidebar toggle
    html += '<button class="mobile-sidebar-toggle" id="mobile-sidebar-toggle" aria-label="Open chapter list">' + ICONS.menu + '</button>';

    html += '<div class="chapter-header"><h1>' + ch.title + '</h1></div>';

    // Section video on first chapter
    if (isFirst && section.youtubeId) {
      html += '<div class="section-video">' +
        '<div class="video-player-wrapper yt-wrapper">' +
        '<iframe src="https://www.youtube.com/embed/' + section.youtubeId + '?rel=0&modestbranding=1&showinfo=0" ' +
        'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen title="Section Overview" loading="lazy"></iframe>' +
        '</div>' +
        '<div class="video-label">' + ICONS.play + ' Section Overview</div>' +
        '</div>';
    }

    if (isFirst && section.youtubeId2) {
      html += '<div class="section-video">' +
        '<div class="video-player-wrapper yt-wrapper">' +
        '<iframe src="https://www.youtube.com/embed/' + section.youtubeId2 + '?rel=0&modestbranding=1&showinfo=0" ' +
        'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen title="Deep Dive" loading="lazy"></iframe>' +
        '</div>' +
        '<div class="video-label">' + ICONS.play + ' Deep Dive</div>' +
        '</div>';
    }

    // Slide deck embeds
    if (isFirst && section.gammaDecks && section.gammaDecks.length > 0) {
      section.gammaDecks.forEach(function (url, idx) {
        var label = section.gammaDecks.length > 1 ? 'Slide Deck ' + (idx + 1) : 'Slide Deck';
        html += '<div class="section-slides">' +
          '<div class="slides-header">' +
          '<span class="slides-toggle" data-deck="' + section.id + '-' + idx + '" role="button" tabindex="0">' +
          ICONS.slides + ' ' + label +
          '<span class="slides-toggle-hint">Click to expand</span>' +
          '</span>' +
          '</div>' +
          '<div class="slides-embed" id="deck-' + section.id + '-' + idx + '" data-src="' + url + '">' +
          '</div></div>';
      });
    }

    // Content
    html += '<div class="chapter-content">' + ch.content + '</div>';

    // Navigation
    html += '<div class="chapter-nav">';
    if (!isFirst) {
      html += '<button class="btn btn-secondary" id="prev-chapter">' +
        ICONS.chevronLeft + ' Previous</button>';
    } else {
      html += '<span></span>';
    }

    if (isLast) {
      html += '<button class="btn btn-primary" id="take-quiz">Take Quiz ' + ICONS.chevronRight + '</button>';
    } else {
      html += '<button class="btn btn-primary" id="next-chapter">Next Chapter ' + ICONS.chevronRight + '</button>';
    }
    html += '</div></div>';

    return html;
  }

  function switchChapter(section, idx) {
    state.currentChapter = idx;
    markChapterComplete(section.id, idx);

    var contentArea = $(".content-area");
    if (contentArea) {
      contentArea.innerHTML = renderChapterContent(section, idx);
      window.scrollTo(0, 0);
      bindContentEvents(section);
    }

    // Update sidebar active state
    $$(".chapter-item").forEach(function (item, i) {
      var isActive = i === idx;
      var isCompleted = state.completedChapters[section.id + "-" + i];
      item.classList.toggle("active", isActive);
      item.classList.toggle("completed", isCompleted);
      var checkEl = item.querySelector(".chapter-check");
      if (checkEl) {
        checkEl.innerHTML = isCompleted ? ICONS.checkCircle : ICONS.circle;
      }
    });

    // Update topbar progress
    updateTopBarProgress();

    // Close mobile sidebar
    closeSidebar();
  }

  function markChapterComplete(sectionId, chapterIdx) {
    var key = sectionId + "-" + chapterIdx;
    if (!state.completedChapters[key]) {
      state.completedChapters[key] = true;
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chapter', sectionId: sectionId, chapterIdx: chapterIdx })
      }).catch(function () { });
    }
  }

  function closeSidebar() {
    state.sidebarOpen = false;
    var sidebar = $("#chapter-sidebar");
    var backdrop = $("#sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
  }

  function openSidebar() {
    state.sidebarOpen = true;
    var sidebar = $("#chapter-sidebar");
    var backdrop = $("#sidebar-backdrop");
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
  }

  function bindSidebarEvents(section) {
    $$(".chapter-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-chapter"), 10);
        switchChapter(section, idx);
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    var closeBtn = $("#sidebar-close");
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);

    var backdrop = $("#sidebar-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeSidebar);
  }

  function bindContentEvents(section) {
    var nextBtn = $("#next-chapter");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (state.currentChapter < section.chapters.length - 1) {
          switchChapter(section, state.currentChapter + 1);
        }
      });
    }

    var prevBtn = $("#prev-chapter");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (state.currentChapter > 0) {
          switchChapter(section, state.currentChapter - 1);
        }
      });
    }

    var quizBtn = $("#take-quiz");
    if (quizBtn) {
      quizBtn.addEventListener("click", function () {
        navigate("quiz/" + section.id);
      });
    }

    var mobileToggle = $("#mobile-sidebar-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", function () {
        if (state.sidebarOpen) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    // Slide deck toggles
    $$(".slides-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var deckId = this.getAttribute("data-deck");
        var embed = $("#deck-" + deckId);
        if (!embed) return;
        var isOpen = embed.classList.contains("open");
        if (isOpen) {
          embed.classList.remove("open");
          embed.innerHTML = "";
          this.querySelector(".slides-toggle-hint").textContent = "Click to expand";
        } else {
          var src = embed.getAttribute("data-src");
          embed.innerHTML = '<iframe src="' + src + '" ' +
            'style="width:100%;height:100%;border:none" ' +
            'allow="fullscreen" ' +
            'title="Slide Deck" ' +
            'loading="lazy"></iframe>';
          embed.classList.add("open");
          this.querySelector(".slides-toggle-hint").textContent = "Click to collapse";
        }
      });
      toggle.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  function updateTopBarProgress() {
    var stats = countCompleted();
    var pct = stats.total > 0 ? Math.round((stats.chapters / stats.total) * 100) : 0;
    var label = $(".topbar-progress-label");
    var fill = $(".progress-bar-fill");
    if (label) label.textContent = stats.chapters + " / " + stats.total;
    if (fill) fill.style.width = pct + "%";
  }

  // ── Render: Quiz View ──
  function renderQuizView(app, sectionId) {
    var section = getSection(sectionId);
    if (!section) { navigate("dashboard"); return; }
    var questions = QUIZZES[sectionId];
    if (!questions) { navigate("dashboard"); return; }

    state.currentQuiz = sectionId;
    state.currentQuestion = 0;
    state.quizAnswers = [];
    state.quizAnswered = false;

    var html = renderTopBar() +
      '<div id="reading-progress" class="reading-progress" style="width:0%"></div>' +
      '<main id="main-content" class="quiz-view view-enter">' +
      '<div class="quiz-header">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb">' +
      '<a href="#dashboard">Dashboard</a>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<a href="#section/' + sectionId + '">' + section.title + '</a>' +
      '<span class="breadcrumb-sep">/</span>' +
      '<span class="breadcrumb-current">Quiz</span>' +
      '</nav>' +
      '<h1>' + section.title + ' Quiz</h1>' +
      '<div class="quiz-progress">' +
      '<span class="quiz-progress-label">1 / ' + questions.length + '</span>' +
      '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + (100 / questions.length) + '%"></div></div>' +
      '</div></div>' +
      '<div id="quiz-body"></div>' +
      '</main>' + renderFooter();

    app.innerHTML = html;
    bindTopBarEvents();
    renderQuestion();
  }

  function renderQuestion() {
    var questions = QUIZZES[state.currentQuiz];
    var q = questions[state.currentQuestion];
    var qNum = state.currentQuestion + 1;
    var letters = ["A", "B", "C", "D"];

    var html = '<div class="quiz-question-num">Question ' + qNum + ' of ' + questions.length + '</div>' +
      '<div class="quiz-question">' + q.q + '</div>' +
      '<div class="quiz-options">';

    q.options.forEach(function (opt, i) {
      html += '<div class="quiz-option" data-index="' + i + '" role="button" tabindex="0">' +
        '<span class="quiz-option-letter">' + letters[i] + '</span>' +
        '<span>' + opt + '</span></div>';
    });

    html += '</div><div id="quiz-feedback"></div><div class="quiz-next-btn" id="quiz-next-container"></div>';

    var body = $("#quiz-body");
    if (body) body.innerHTML = html;

    state.quizAnswered = false;

    // Bind option clicks
    $$(".quiz-option").forEach(function (opt) {
      opt.addEventListener("click", function () { handleAnswer(parseInt(this.getAttribute("data-index"), 10)); });
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  function handleAnswer(idx) {
    if (state.quizAnswered) return;
    state.quizAnswered = true;

    var questions = QUIZZES[state.currentQuiz];
    var q = questions[state.currentQuestion];
    var correct = q.correct;

    state.quizAnswers.push(idx === correct ? 1 : 0);

    // Mark all as disabled
    $$(".quiz-option").forEach(function (opt, i) {
      opt.classList.add("disabled");
      if (i === correct) opt.classList.add("correct");
      if (i === idx && idx !== correct) opt.classList.add("incorrect");
    });

    // Show explanation
    var feedback = $("#quiz-feedback");
    if (feedback) {
      feedback.innerHTML = '<div class="quiz-explanation">' + q.explanation + '</div>';
    }

    // Show next button
    var container = $("#quiz-next-container");
    var isLast = state.currentQuestion === questions.length - 1;
    if (container) {
      container.innerHTML = '<button class="btn btn-primary" id="quiz-next">' +
        (isLast ? "See Results" : "Next Question") + ' ' + ICONS.chevronRight + '</button>';
      $("#quiz-next").addEventListener("click", function () {
        if (isLast) {
          showQuizResults();
        } else {
          state.currentQuestion++;
          state.quizAnswered = false;
          renderQuestion();
          updateQuizProgress();
        }
      });
    }
  }

  function updateQuizProgress() {
    var questions = QUIZZES[state.currentQuiz];
    var pct = ((state.currentQuestion + 1) / questions.length) * 100;
    var label = $(".quiz-progress-label");
    var fill = $(".quiz-progress .progress-bar-fill");
    if (label) label.textContent = (state.currentQuestion + 1) + " / " + questions.length;
    if (fill) fill.style.width = pct + "%";
  }

  function showQuizResults() {
    var score = state.quizAnswers.reduce(function (a, b) { return a + b; }, 0);
    var total = state.quizAnswers.length;
    var passed = score >= 3;

    state.quizScores[state.currentQuiz] = score;
    if (passed) {
      state.completedSections[state.currentQuiz] = true;
    }

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quiz', sectionId: state.currentQuiz, score: score, passed: passed })
    }).catch(function () { });

    var section = getSection(state.currentQuiz);
    var nextSection = getSection(Number(state.currentQuiz) + 1);

    var html = '<div class="quiz-results">' +
      '<div class="quiz-results-icon ' + (passed ? "pass" : "fail") + '">' +
      (passed ? ICONS.trophy : ICONS.xCircle) + '</div>' +
      '<h2>' + (passed ? "Section Complete!" : "Not Quite") + '</h2>' +
      '<div class="quiz-results-score ' + (passed ? "pass" : "fail") + '">' + score + ' / ' + total + '</div>' +
      '<p class="quiz-results-message">' +
      (passed
        ? "You passed the " + (section ? section.title : "") + " quiz. Great work!"
        : "You need at least 3 correct answers to pass. Review the material and try again.") +
      '</p><div class="quiz-results-actions">';

    if (!passed) {
      html += '<button class="btn btn-secondary" onclick="location.hash=\'section/' + state.currentQuiz + '\'">Review Section</button>';
      html += '<button class="btn btn-primary" id="retry-quiz">Retry Quiz</button>';
    } else {
      html += '<button class="btn btn-secondary" onclick="location.hash=\'dashboard\'">Dashboard</button>';
      if (nextSection) {
        html += '<button class="btn btn-primary" onclick="location.hash=\'section/' + nextSection.id + '\'">Next Section ' + ICONS.chevronRight + '</button>';
      }
    }

    html += '</div></div>';

    var body = $("#quiz-body");
    if (body) body.innerHTML = html;

    // Update progress bar to 100%
    var fill = $(".quiz-progress .progress-bar-fill");
    if (fill) fill.style.width = "100%";
    var label = $(".quiz-progress-label");
    if (label) label.textContent = total + " / " + total;

    // Bind retry
    var retryBtn = $("#retry-quiz");
    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        state.currentQuestion = 0;
        state.quizAnswers = [];
        state.quizAnswered = false;
        renderQuestion();
        updateQuizProgress();
      });
    }

    updateTopBarProgress();
  }

  // ── Render: Rules View ──
  function renderRulesView(app) {
    var html = renderTopBar() +
      '<div id="reading-progress" class="reading-progress" style="width:0%"></div>' +
      '<main id="main-content" class="rules-view view-enter">' +
      '<h1>The 8 Trading Rules</h1>' +
      '<div class="rules-list">';

    RULES.forEach(function (rule) {
      html += '<div class="rule-card" data-rule="' + rule.num + '">' +
        '<div class="rule-header" role="button" tabindex="0" aria-expanded="false">' +
        '<span class="rule-num">' + rule.num + '</span>' +
        '<span class="rule-title">' + rule.title + '</span>' +
        '<span class="rule-chevron">' + ICONS.chevronDown + '</span>' +
        '</div>' +
        '<div class="rule-body"><div class="rule-body-inner">' + rule.body + '</div></div>' +
        '</div>';
    });

    html += '</div></main>' + renderFooter();

    app.innerHTML = html;
    bindTopBarEvents();

    // Bind accordions
    $$(".rule-header").forEach(function (header) {
      header.addEventListener("click", function () {
        var card = this.closest(".rule-card");
        var isOpen = card.classList.contains("open");
        card.classList.toggle("open");
        this.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });
      header.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  // ── Render: Glossary View ──
  function renderGlossaryView(app) {
    var html = renderTopBar() +
      '<div id="reading-progress" class="reading-progress" style="width:0%"></div>' +
      '<main id="main-content" class="glossary-view view-enter">' +
      '<h1>AMT Glossary</h1>' +
      '<p class="glossary-intro">Key terms and concepts from Auction Market Theory. Use this as a quick reference while studying the curriculum.</p>' +
      '<div class="glossary-search-wrapper">' +
      '<input type="text" id="glossary-search" class="glossary-search" placeholder="Search terms..." autocomplete="off" />' +
      '</div>' +
      '<div class="glossary-alpha-bar" id="glossary-alpha"></div>' +
      '<div class="glossary-list" id="glossary-list">' +
      '<div class="glossary-loading">Loading glossary...</div>' +
      '</div>' +
      '</main>' + renderFooter();

    app.innerHTML = html;
    bindTopBarEvents();
    loadGlossaryTerms();
  }

  function loadGlossaryTerms() {
    fetch('/api/glossary')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error || !data.terms) {
          document.getElementById('glossary-list').innerHTML = '<div class="glossary-error">Failed to load glossary. Please refresh the page.</div>';
          return;
        }
        renderGlossaryTerms(data.terms);
      })
      .catch(function () {
        document.getElementById('glossary-list').innerHTML = '<div class="glossary-error">Failed to load glossary. Please refresh the page.</div>';
      });
  }

  function renderGlossaryTerms(terms) {
    var grouped = {};
    var letters = [];

    terms.forEach(function (t) {
      var letter = t.term.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
        letters.push(letter);
      }
      grouped[letter].push(t);
    });

    letters.sort();

    var alphaHtml = letters.map(function (l) {
      return '<a href="#glossary-letter-' + l + '" class="glossary-alpha-link">' + l + '</a>';
    }).join('');
    document.getElementById('glossary-alpha').innerHTML = alphaHtml;

    var listHtml = '';
    letters.forEach(function (letter) {
      listHtml += '<div class="glossary-letter-group" id="glossary-letter-' + letter + '">' +
        '<div class="glossary-letter-header">' + letter + '</div>';

      grouped[letter].forEach(function (term) {
        listHtml += '<div class="glossary-term" data-term="' + term.term.toLowerCase() + '">' +
          '<div class="glossary-term-name">' + term.term + '</div>' +
          '<div class="glossary-term-def">' + term.definition + '</div>' +
          '</div>';
      });

      listHtml += '</div>';
    });

    document.getElementById('glossary-list').innerHTML = listHtml;

    var searchInput = document.getElementById('glossary-search');
    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      var termEls = document.querySelectorAll('.glossary-term');
      var groupEls = document.querySelectorAll('.glossary-letter-group');

      if (!q) {
        termEls.forEach(function (el) { el.style.display = ''; });
        groupEls.forEach(function (el) { el.style.display = ''; });
        return;
      }

      var visibleLetters = {};
      termEls.forEach(function (el) {
        var termName = el.getAttribute('data-term');
        var termDef = el.querySelector('.glossary-term-def').textContent.toLowerCase();
        if (termName.indexOf(q) !== -1 || termDef.indexOf(q) !== -1) {
          el.style.display = '';
          var letter = termName.charAt(0).toUpperCase();
          visibleLetters[letter] = true;
        } else {
          el.style.display = 'none';
        }
      });

      groupEls.forEach(function (el) {
        var letter = el.id.replace('glossary-letter-', '');
        el.style.display = visibleLetters[letter] ? '' : 'none';
      });
    });
  }

  // ── Bind Top Bar Events ──
  function bindTopBarEvents() {
    var themeBtn = $("#theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }
    var signoutBtn = $("#auth-signout");
    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        fetch('/api/auth/logout', { method: 'POST' })
          .then(function () { window.location.reload(); })
          .catch(function () { window.location.reload(); });
      });
    }
  }

  // ── Init ──
  async function loadProgressFromDB() {
    try {
      var res = await fetch('/api/progress');
      if (!res.ok) return;
      var data = await res.json();

      if (data.chapters) {
        data.chapters.forEach(function (c) {
          state.completedChapters[c.section_id + "-" + c.chapter_idx] = true;
        });
      }

      if (data.scores) {
        data.scores.forEach(function (s) {
          state.quizScores[s.section_id] = s.score;
          if (s.passed) {
            state.completedSections[s.section_id] = true;
          }
        });
      }
    } catch (e) {
      // Progress load failed, continue with empty state
    }
  }

  async function init() {
    initTheme();

    // Quick loading state while fetching database progress
    var app = document.getElementById("app");
    if (app) app.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#888;">Loading your progress...</div>';

    await loadProgressFromDB();
    onRouteChange();
    window.addEventListener("hashchange", onRouteChange);
  }

  // Triggered by index.html when Supabase auth confirms the session
  window.onAppReady = function () {
    if (window.appInitialized) return;
    window.appInitialized = true;
    init();
  };
})();
