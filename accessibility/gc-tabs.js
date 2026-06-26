/* gc-tabs.js
 * A WCAG 2.1 AA-compliant tab/toggle system for Government of Canada web pages.
 * Compatible with WET-BOEW v4 plugin containers.
 *
 * Markup:
 *   <div class="gc-tabs [collapse-sm] [collapse-xs]">
 *     <details id="tab1"><summary>Label</summary><p>Content</p></details>
 *     <details id="tab2"><summary>Label</summary><p>Content</p></details>
 *   </div>
 *
 * Dependencies: Font Awesome 5 (for scroll arrow icons)
 */
(function () {
  'use strict';

  /* =========================================================
     INITIALIZER â€” runs on DOMContentLoaded and wb-ready.wb
     ========================================================= */
  function initAll() {
    var groups = document.querySelectorAll('.gc-tabs');
    for (var g = 0; g < groups.length; g++) {
      initGroup(groups[g]);
    }
    registerHashHandlers();
     // Re-equalize all gc-tabs-eqht groups on resize (breakpoints may change)
var eqhtResizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(eqhtResizeTimer);
  eqhtResizeTimer = setTimeout(function () {
    var groups = document.querySelectorAll('.gc-tabs.gc-tabs-eqht');
    for (var g = 0; g < groups.length; g++) {
      if (isCollapseMode(groups[g])) {
        clearEqualHeights(groups[g]);
      } else {
        equalizeHeights(groups[g]);
      }
    }
  }, 150);
});
  }

  /* =========================================================
     GROUP INITIALIZER
     ========================================================= */
  function initGroup(group) {
    // Prevent double-initialization
    if (group.getAttribute('data-gc-tabs-init') === 'true') return;
    group.setAttribute('data-gc-tabs-init', 'true');

    var detailsEls = toArray(group.querySelectorAll(':scope > details'));
    if (!detailsEls.length) return;

    /* --- 1. Determine which details element should be open --- */
 /* --- 1. Determine which details element should be open --- */

let openIndex = Array.from(detailsEls).findIndex(el =>
  el.hasAttribute('open')
);

if (openIndex === -1) {
  openIndex = 0;
}


// Override with saved session tab (if any, and not session-ignore)
var savedId = restoreSession(group);
if (savedId) {
  for (var i = 0; i < detailsEls.length; i++) {
    if (detailsEls[i].id === savedId) {
      openIndex = i;
      break;
    }
  }
}

    /* --- 2. Enforce: exactly one open, at openIndex --- */
    for (var i = 0; i < detailsEls.length; i++) {
      if (i === openIndex) {
        detailsEls[i].setAttribute('open', '');
      } else {
        detailsEls[i].removeAttribute('open');
      }
    }

    /* --- 3. Restructure <details> internals --- */
    for (var i = 0; i < detailsEls.length; i++) {
      structureDetails(detailsEls[i]);
    }

    /* --- 4. Build the tab-container DOM --- */
    var tabContainer = buildTabContainer(group, detailsEls, openIndex);
    group.insertBefore(tabContainer, group.firstChild);

    /* --- 5. Attach summary click handlers (collapse/accordion mode) --- */
    var tabButtons = toArray(tabContainer.querySelectorAll('[role="tab"]'));
    attachSummaryHandlers(group, detailsEls, tabButtons);

    /* --- 6. Set up scroll buttons --- */
    var tabList     = tabContainer.querySelector('[role="tablist"]');
    var leftScroll  = tabContainer.querySelector('.btn-container-left');
    var rightScroll = tabContainer.querySelector('.btn-container-right');
    setupScrollButtons(tabList, leftScroll, rightScroll);

    /* --- 7. Store state on group node for hash handling --- */
    group._gcTabsData = { detailsEls: detailsEls, tabButtons: tabButtons };
      /* --- 8. Equal heights (gc-tabs-eqht) --- */
// Initial equalization after layout settles
if (group.classList.contains('gc-tabs-eqht')) {
  setTimeout(function () { equalizeHeights(group); }, 50);
}
  }


/*function clearEqualHeights(group) {
  var panels = toArray(group.querySelectorAll('.tgl-panel'));
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.minHeight = '';
  }
}*/
    
    
    
  /* =========================================================
     STRUCTURE DETAILS ELEMENT
     Wraps non-summary children in .tgl-panel and updates IDs.
     ========================================================= */
  function structureDetails(det) {
    var summary = det.querySelector(':scope > summary');
    if (!summary) return;

    var detId = det.id;

    // Set summary id
    summary.id = detId + '-label';

    // Remove existing disclosure triangle / list marker
   // summary.style.listStyle = 'none';

    // Collect all non-summary child nodes
    var children = toArray(det.childNodes).filter(function (n) {
      return n !== summary;
    });

    // Wrap them in tgl-panel
    var panel = document.createElement('div');
    panel.className = 'tgl-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('aria-labelledby', detId + '-label');

    for (var i = 0; i < children.length; i++) {
      panel.appendChild(children[i]);
    }

    det.appendChild(panel);
  }

  /* =========================================================
     BUILD TAB CONTAINER
     Returns fully constructed tab-container div.
     ========================================================= */
  function buildTabContainer(group, detailsEls, openIndex) {
    var tabContainer = document.createElement('div');
    tabContainer.className = 'tab-container';

    /* --- Left scroll button (hidden by default) --- */
    var leftBtn = createScrollButton('left');
    tabContainer.appendChild(leftBtn);

    /* --- Tab list --- */
    var tabList = document.createElement('ul');
    tabList.setAttribute('role', 'tablist');
    tabList.className = 'gc-tabs-list';

    var tabButtons = [];

    for (var i = 0; i < detailsEls.length; i++) {
      var det     = detailsEls[i];
      var summary = det.querySelector(':scope > summary');
      var detId   = det.id;

      var li  = document.createElement('li');
      li.setAttribute('role', 'presentation');

      var btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-controls', detId);
      btn.id = detId + '-tab';

        var focusSpan = document.createElement('span');
        focusSpan.className = 'focus';
        btn.appendChild(focusSpan);
        
      if (i === openIndex) {
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-selected', 'false');
      }

      // Copy summary content (may contain HTML)
      focusSpan.innerHTML = summary ? summary.innerHTML : '';

      // Click: activate this tab
      (function (btnRef, index) {
      btnRef.addEventListener('click', function () {
  activateTab(tabButtons, detailsEls, index);
  saveSession(group, detailsEls[index].id);  // ← add this line
  btnRef.focus();
});
      }(btn, i));

      li.appendChild(btn);
      tabList.appendChild(li);
      tabButtons.push(btn);
    }

    /* --- Keyboard navigation (arrow keys, Home, End) --- */
    tabList.addEventListener('keydown', function (e) {
      var focused = focusedTabIndex(tabButtons);
      if (focused === -1) return;

      var newIndex = -1;
      switch (e.key) {
        case 'ArrowRight': newIndex = (focused + 1) % tabButtons.length;                   break;
        case 'ArrowLeft':  newIndex = (focused - 1 + tabButtons.length) % tabButtons.length; break;
        case 'Home':       newIndex = 0;                                                    break;
        case 'End':        newIndex = tabButtons.length - 1;                                break;
        default: return;
      }

      e.preventDefault();
      activateTab(tabButtons, detailsEls, newIndex);
saveSession(group, detailsEls[newIndex].id);  // ← add this line
tabButtons[newIndex].focus();
        
   
    });
      tabList.addEventListener('focusin', function (e) {
  var btn = e.target && e.target.closest('[role="tab"]');
  if (!btn) return;
  btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
});

      
    tabContainer.appendChild(tabList);

    /* --- Right scroll button (hidden by default) --- */
    var rightBtn = createScrollButton('right');
    tabContainer.appendChild(rightBtn);

    return tabContainer;
  }

  /* =========================================================
     CREATE SCROLL BUTTON
     ========================================================= */
  function createScrollButton(direction) {
     var btnCntr = document.createElement('div');
    btnCntr.className = 'btn-container-' + direction + ' hidden';
      
    var btn = document.createElement('button');
    btn.className = 'btn-scroll scroll-' + direction;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-hidden', 'true');
    btn.setAttribute('tabindex', '-1');
btnCntr.append(btn);      
    // Glyphicon icon 
    if (direction === 'left') {
     
      btn.innerHTML = '<span class="glyphicon glyphicon-chevron-left"></span>';
        
    } else {
      btn.innerHTML = '<span class="glyphicon glyphicon-chevron-right"></span>';
    }
 
      
    return btnCntr;
  }

  /* =========================================================
     ACTIVATE TAB
     Sets open state on details and updates all button ARIA attrs.
     ========================================================= */
  function activateTab(tabButtons, detailsEls, activeIndex) {
    for (var i = 0; i < tabButtons.length; i++) {
      if (i === activeIndex) {
        tabButtons[i].setAttribute('tabindex', '0');
        tabButtons[i].setAttribute('aria-selected', 'true');
        detailsEls[i].setAttribute('open', '');
      } else {
        tabButtons[i].setAttribute('tabindex', '-1');
        tabButtons[i].setAttribute('aria-selected', 'false');
        detailsEls[i].removeAttribute('open');
      }
    }
  }

  /* =========================================================
     ATTACH SUMMARY CLICK HANDLERS (accordion/collapse mode)
     ========================================================= */
function attachSummaryHandlers(group, detailsEls, tabButtons) {

  var summaries = [];
  for (var i = 0; i < detailsEls.length; i++) {
    var s = detailsEls[i].querySelector(':scope > summary');
    summaries.push(s || null);
        
      
      
  }

  function updateSummaryTabindex(activeIdx) {
    for (var i = 0; i < summaries.length; i++) {
      if (!summaries[i]) continue;
  let summariesSpan = document.createElement('span');
        summariesSpan.className = 'toggleRoot';
        while (summaries[i].firstChild) {
    summariesSpan.appendChild(summaries[i].firstChild);
}
summaries[i].appendChild(summariesSpan);
        
      summaries[i].setAttribute('tabindex', i === activeIdx ? '0' : '-1');
    }
  }

  function openPanel(idx) {
    for (var j = 0; j < detailsEls.length; j++) {
      detailsEls[j].removeAttribute('open');
      tabButtons[j].setAttribute('tabindex', '-1');
      tabButtons[j].setAttribute('aria-selected', 'false');
    }
    detailsEls[idx].setAttribute('open', '');
    tabButtons[idx].setAttribute('tabindex', '0');
    tabButtons[idx].setAttribute('aria-selected', 'true');
    updateSummaryTabindex(idx);
    saveSession(group, detailsEls[idx].id);
  }

  function closeAll() {
    for (var j = 0; j < detailsEls.length; j++) {
      detailsEls[j].removeAttribute('open');
      tabButtons[j].setAttribute('tabindex', '-1');
      tabButtons[j].setAttribute('aria-selected', 'false');
    }
  }

  var initialActive = 0;
  for (var i = 0; i < detailsEls.length; i++) {
    if (detailsEls[i].hasAttribute('open')) { initialActive = i; break; }
  }
  updateSummaryTabindex(initialActive);

  for (var i = 0; i < detailsEls.length; i++) {
    (function (det, idx) {
      var summary = summaries[idx];
      if (!summary) return;

      // Flag: was focus triggered by a pointer (mouse/touch)?
      // If so, the click handler takes over — focus handler stands down.
      var focusFromPointer = false;

      summary.addEventListener('mousedown', function () {
        focusFromPointer = true;
      });

      summary.addEventListener('touchstart', function () {
        focusFromPointer = true;
      });

      // --- Click handler — mouse clicks and Enter/Space ---
      summary.addEventListener('click', function (e) {
        if (!isCollapseMode(group)) return;
        e.preventDefault();
        focusFromPointer = false; // reset after click completes

        var wasOpen = det.hasAttribute('open');
        closeAll();
        if (!wasOpen) {
          openPanel(idx);
        }
      });

      // --- Focus handler — keyboard navigation only ---
      summary.addEventListener('focus', function () {
        if (!isCollapseMode(group)) return;

        // Pointer-triggered focus: let click handle it
        if (focusFromPointer) {
          focusFromPointer = false;
          return;
        }

        // Keyboard-triggered focus: auto-open immediately
        openPanel(idx);
      });

      // --- Keydown handler — arrow key navigation between summaries ---
      summary.addEventListener('keydown', function (e) {
        if (!isCollapseMode(group)) return;

        var newIdx = -1;
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight': newIdx = (idx + 1) % summaries.length;                    break;
          case 'ArrowUp':
          case 'ArrowLeft':  newIdx = (idx - 1 + summaries.length) % summaries.length; break;
          case 'Home':       newIdx = 0;                                                break;
          case 'End':        newIdx = summaries.length - 1;                             break;
          default: return;
        }

        e.preventDefault();
        if (summaries[newIdx]) summaries[newIdx].focus();
      });

    }(detailsEls[i], i));
  }
}

  /* =========================================================
     SCROLL BUTTON LOGIC
     ========================================================= */
function setupScrollButtons(tabList, leftBtn, rightBtn) {

  // Track whether the user is navigating by keyboard or pointer.
  // 'keyboard' suppresses scroll buttons entirely and auto-scrolls
  // the focused tab into view instead.
 

function updateVisibility() {
  var hasOverflow = tabList.scrollWidth > tabList.clientWidth + 1;

  if (!hasOverflow) {
    addClass(leftBtn, 'hidden');
    addClass(rightBtn, 'hidden');
    return;
  }

  removeClass(leftBtn, 'hidden');
  removeClass(rightBtn, 'hidden');
}

  function scrollByOneTab(direction) {
    var buttons  = toArray(tabList.querySelectorAll('button[role="tab"]'));
    var listRect = tabList.getBoundingClientRect();

    if (direction === 'right') {
      for (var i = 0; i < buttons.length; i++) {
        var rect = buttons[i].getBoundingClientRect();
        if (rect.right > listRect.right + 1) {
          tabList.scrollBy({ left: rect.right - listRect.right + 8, behavior: 'smooth' });
          break;
        }
      }
    } else {
      for (var i = buttons.length - 1; i >= 0; i--) {
        var rect = buttons[i].getBoundingClientRect();
        if (rect.left < listRect.left - 1) {
          tabList.scrollBy({ left: -(listRect.left - rect.left + 8), behavior: 'smooth' });
          break;
        }
      }
    }
  }

  // Scroll the newly focused tab into view during keyboard navigation


  leftBtn.addEventListener('click', function () {
   
    scrollByOneTab('left');
  });

  rightBtn.addEventListener('click', function () {
 
    scrollByOneTab('right');
  });

  /*tabList.addEventListener('scroll', updateVisibility);*/
  window.addEventListener('resize', updateVisibility);

  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(updateVisibility);
    ro.observe(tabList);
  }

  setTimeout(updateVisibility, 0);
}

  /* =========================================================
     HASH / ANCHOR HANDLING
     ========================================================= */
  var hashHandlersRegistered = false;

  function registerHashHandlers() {
    if (hashHandlersRegistered) return;
    hashHandlersRegistered = true;

    // Fire on page load
    if (window.location.hash) {
      activateByHash(window.location.hash.slice(1));
    }

    // Fire on hash change (browser back/forward, direct URL change)
    window.addEventListener('hashchange', function () {
      if (window.location.hash) {
        activateByHash(window.location.hash.slice(1));
      }
    });

    // Intercept anchor link clicks
    document.addEventListener('click', function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      // Delay slightly so the hash change fires first, then we sync state
      setTimeout(function () { activateByHash(id); }, 0);
    });
  }

  function activateByHash(id) {
    if (!id) return;

    var target = document.getElementById(id);
    if (!target) return;

    var detailsEl = null;
    var group     = null;

    // Case 1: the id IS a details element
    if (target.tagName && target.tagName.toLowerCase() === 'details') {
      var parentGroup = target.closest('.gc-tabs');
      if (parentGroup) { detailsEl = target; group = parentGroup; }
    } else {
      // Case 2: the id is somewhere INSIDE a details element within gc-tabs
      var parentDetails = target.closest && target.closest('.gc-tabs > details');
      if (parentDetails) {
        detailsEl = parentDetails;
        group = parentDetails.closest('.gc-tabs');
      }
    }

    if (!detailsEl || !group || !group._gcTabsData) return;

    var data  = group._gcTabsData;
    var index = data.detailsEls.indexOf(detailsEl);
    if (index === -1) return;

    activateTab(data.tabButtons, data.detailsEls, index);

    // Scroll to inner element if the hash points inside the panel
    if (target !== detailsEl) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  /* =========================================================
     HELPERS
     ========================================================= */
  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function addClass(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }

  function removeClass(el, cls) {
    if (el) el.classList.remove(cls);
  }

  function isCollapseMode(group) {
    var w = window.innerWidth;
    if (group.classList.contains('collapse-sm') && w < 992) return true;
    if (group.classList.contains('collapse-xs') && w < 768) return true;
    return false;
  }

  function focusedTabIndex(tabButtons) {
    for (var i = 0; i < tabButtons.length; i++) {
      if (tabButtons[i] === document.activeElement) return i;
    }
    return -1;
  }
/* =========================================================
   EQUAL HEIGHT  (gc-tabs-eqht)
   ========================================================= */

function equalizeHeights(group) {
  if (!group.classList.contains('gc-tabs-eqht')) return;
  if (isCollapseMode(group)) return;

  var panels = toArray(group.querySelectorAll('.tgl-panel'));
  var detailsEls = toArray(group.querySelectorAll(':scope > details'));
  if (!panels.length) return;

  // Clear previous overrides so we read natural heights
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.minHeight = '';
  }

  // Temporarily open all closed details so the browser renders their
  // content and offsetHeight is accurate for every panel.
  var closedOnes = [];
  for (var i = 0; i < detailsEls.length; i++) {
    if (!detailsEls[i].hasAttribute('open')) {
      detailsEls[i].setAttribute('open', '');
      closedOnes.push(detailsEls[i]);
    }
  }

  // All panels are now rendered — measure them
  var maxHeight = 0;
  for (var i = 0; i < panels.length; i++) {
    var h = panels[i].offsetHeight;
    if (h > maxHeight) maxHeight = h;
  }

  // Restore closed details
  for (var i = 0; i < closedOnes.length; i++) {
    closedOnes[i].removeAttribute('open');
  }

  if (maxHeight > 0) {
    for (var i = 0; i < panels.length; i++) {
      panels[i].style.minHeight = maxHeight + 'px';
    }
  }
}
/* =========================================================
   SESSION STORAGE  (last-open tab persistence)
   ========================================================= */

/**
 * Returns a stable sessionStorage key for a gc-tabs group.
 * Uses the group's own id if present, otherwise the first
 * details element's id as a reliable anchor.
 */
function getGroupKey(group) {
  var id = group.id
    || (group.querySelector(':scope > details') || {}).id
    || '';
  return id ? 'gc-tabs:' + id : null;
}

/** Saves the active details id for this group to sessionStorage. */
function saveSession(group, activeDetailsId) {
  if (group.classList.contains('session-ignore')) return;
  var key = getGroupKey(group);
  if (!key) return;
  try {
    sessionStorage.setItem(key, activeDetailsId);
  } catch (e) { /* sessionStorage unavailable — fail silently */ }
}

/** Returns the saved details id for this group, or null. */
function restoreSession(group) {
  if (group.classList.contains('session-ignore')) return null;
  var key = getGroupKey(group);
  if (!key) return null;
  try {
    return sessionStorage.getItem(key);
  } catch (e) { return null; }
}
    
    
function clearEqualHeights(group) {
  var panels = toArray(group.querySelectorAll('.tgl-panel'));
  for (var i = 0; i < panels.length; i++) {
    panels[i].style.minHeight = '';
  }
}


  /* =========================================================
     BOOT
     ========================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // WET-BOEW compatibility: re-init on wb-ready (fires after WET enhances DOM)
  document.addEventListener('wb-ready.wb', initAll);

}());
