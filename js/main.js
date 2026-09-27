// ==========================================================================
// Vuka — shared site behaviour (static build)
// ==========================================================================

/* Mobile nav toggle — runs on every page */
(function initBurgerMenu() {
  const burgerBtn = document.getElementById("burgerBtn");
  const navRight = document.getElementById("navRight");
  if (!burgerBtn || !navRight) return;

  burgerBtn.addEventListener("click", () => {
    const isOpen = navRight.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
  });
})();

/* Module pages: highlight the active topic in the sidebar while scrolling */
(function initTopicScrollspy() {
  const topicLinks = document.querySelectorAll(".topic-nav a.topic-link");
  const topicSections = document.querySelectorAll(".topic-section");
  if (!topicLinks.length || !topicSections.length) return;

  const linkById = new Map();
  topicLinks.forEach((link) => {
    const id = link.getAttribute("href").replace("#", "");
    linkById.set(id, link);
  });

  function setActive(id) {
    topicLinks.forEach((link) => link.classList.remove("active"));
    const active = linkById.get(id);
    if (active) active.classList.add("active");
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    topicSections.forEach((section) => observer.observe(section));
  }

  const initialId = window.location.hash ? window.location.hash.replace("#", "") : topicSections[0].id;
  setActive(initialId);
})();

// ==========================================================================
// Journey 1 — Checklist (partial-progress message + automatic badge at 100%)
// ==========================================================================
(function () {
  var READY_THRESHOLD = 0.6;
  var READY_MESSAGE = "Umsebenzi omuhle. Ukhombisa izimpawu zangempela zokukhula!";

  var list = document.getElementById("checklistList");
  if (!list) return; // not on this page

  var inputs = list.querySelectorAll(".checklist-input");
  var countEl = document.getElementById("checklistCount");
  var percentEl = document.getElementById("checklistPercent");
  var fillEl = document.getElementById("checklistProgressFill");
  var barEl = document.getElementById("checklistProgressBar");
  var messageEl = document.getElementById("checklistMessage");
  var messageTextEl = document.getElementById("checklistMessageText");
  var badgeSection = document.getElementById("growthBadgeSection");

  if (!countEl || !percentEl || !fillEl || !barEl || !messageEl || !messageTextEl || !badgeSection) {
    console.warn(
      "Uhlu lokuhlola loHambo 1: kuntula into eyodwa noma ezingaphezulu ezidingekayo.",
      { countEl: !!countEl, percentEl: !!percentEl, fillEl: !!fillEl, barEl: !!barEl,
        messageEl: !!messageEl, messageTextEl: !!messageTextEl, badgeSection: !!badgeSection }
    );
    return;
  }

  function updateChecklist() {
    var total = inputs.length;
    var checked = 0;

    inputs.forEach(function (input) {
      if (input.checked) checked++;
    });

    var percent = total === 0 ? 0 : Math.round((checked / total) * 100);

    countEl.textContent = checked + " of " + total + " complete";
    percentEl.textContent = percent + "%";
    fillEl.style.width = percent + "%";
    barEl.setAttribute("aria-valuenow", percent);

    var isPartiallyReady = total > 0 && checked / total >= READY_THRESHOLD;
    var isFullyComplete = total > 0 && checked === total;

    if (isPartiallyReady) {
      messageTextEl.textContent = READY_MESSAGE;
      messageEl.classList.add("is-visible");
    } else {
      messageEl.classList.remove("is-visible");
    }

    if (isFullyComplete) {
      localStorage.setItem("growthSignalBadge", "earned");
      showBadge();
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  inputs.forEach(function (input) {
    input.addEventListener("change", updateChecklist);
  });

  if (localStorage.getItem("growthSignalBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  updateChecklist();
})();

// ==========================================================================
// Confetti burst — fires once when all Journey 1 checklist items are checked
// ==========================================================================
(function () {
  var list = document.getElementById("checklistList");
  if (!list) return;

  var inputs = list.querySelectorAll(".checklist-input");
  if (!inputs.length) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasCelebrated = false;

  function allChecked() {
    var checked = 0;
    inputs.forEach(function (input) {
      if (input.checked) checked++;
    });
    return checked === inputs.length;
  }

  function launchConfetti() {
    if (prefersReducedMotion) return;

    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    var colors = ["#319966", "#1fc652", "#b7d64a", "#1daec6", "#f09c3a"];
    var pieceCount = 140;
    var pieces = [];

    for (var i = 0; i < pieceCount; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.5,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: -8 + Math.random() * 16,
        speedY: 2 + Math.random() * 3,
        speedX: -1.5 + Math.random() * 3,
        opacity: 1,
      });
    }

    var startTime = null;
    var duration = 3200;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      pieces.forEach(function (p) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (elapsed > duration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(frame);
  }

  function checkForCelebration() {
    if (hasCelebrated) return;
    if (allChecked()) {
      hasCelebrated = true;
      launchConfetti();
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("change", checkForCelebration);
  });
})();

// ==========================================================================
// Journey 1 — Reflection textbox (partial-progress message + automatic badge)
// ==========================================================================
(function () {
  var READY_MESSAGE = "Ukucabanga okuhle! Ulungele ukuthatha isinyathelo esilandelayo.";

  var textarea = document.getElementById("growthReflectionInput");
  var messageEl = document.getElementById("reflectionMessage");
  var messageTextEl = document.getElementById("reflectionMessageText");
  var badgeSection = document.getElementById("riseBadgeSection");

  if (!textarea || !messageEl || !messageTextEl || !badgeSection) {
    if (textarea) {
      console.warn(
        "Journey 1 reflection: missing one or more required elements.",
        { messageEl: !!messageEl, messageTextEl: !!messageTextEl, badgeSection: !!badgeSection }
      );
    }
    return;
  }

  function updateReflection() {
    var hasContent = textarea.value.trim().length > 0;

    if (hasContent) {
      messageTextEl.textContent = READY_MESSAGE;
      messageEl.classList.add("is-visible");
      localStorage.setItem("readyToRiseBadge", "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  textarea.addEventListener("input", updateReflection);

  if (localStorage.getItem("readyToRiseBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  updateReflection();
})();

// ==========================================================================
// Journey 2 — Profit calculator + badge
// ==========================================================================
(function () {
  var form = document.getElementById("profit-calculator");
  var moneyInInput = document.getElementById("money-in");
  var moneyOutInput = document.getElementById("money-out");
  var calcBtn = document.getElementById("calc-profit");
  var profitResult = document.getElementById("profit-result");
  var badgeSection = document.getElementById("badge-section");
  var numbersBadge = document.getElementById("numbers-badge");

  if (!calcBtn || !moneyInInput || !moneyOutInput || !profitResult || !badgeSection || !numbersBadge) {
    return; // not on this page
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    numbersBadge.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (localStorage.getItem("numbersKnowHowBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  calcBtn.addEventListener("click", function () {
    var moneyIn = parseFloat(moneyInInput.value) || 0;
    var moneyOut = parseFloat(moneyOutInput.value) || 0;
    var profit = moneyIn - moneyOut;

    var message;
    if (profit > 0) {
      message = "Inzuzo yakho kuleli sonto ngu- <strong>" + profit.toFixed(2) + "</strong>. Wenze kahle!";
    } else if (profit === 0) {
      message = "You broke even kuleli sonto: <strong>0.00</strong> profit.";
    } else {
      message = "Ulahlekelwe ngu- <strong>" + Math.abs(profit).toFixed(2) + "</strong> this week.";
    }

    profitResult.innerHTML = message;
    profitResult.classList.remove("hidden");
    profitResult.classList.remove("result-error");

    localStorage.setItem("numbersKnowHowBadge", "earned");
    showBadge();
  });
})();

// ==========================================================================
// Journey 2 — "Separate & Secure": three money containers
// ==========================================================================
(function () {
  var btn = document.getElementById("save-separate-plan");
  if (!btn) return;

  var businessInput = document.getElementById("business-place");
  var personalInput = document.getElementById("personal-place");
  var emergencyInput = document.getElementById("emergency-place");
  var resultEl = document.getElementById("separate-result");
  var badgeEl = document.getElementById("badge-separate");

  var form = document.getElementById("separate-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var business = businessInput.value.trim();
    var personal = personalInput.value.trim();
    var emergency = emergencyInput.value.trim();

    if (!business && !personal && !emergency) {
      resultEl.textContent = "Gcwalisa okungenani indawo eyodwa ukuze ugcine uhlelo lwakho.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (business) parts.push("Business: " + business);
    if (personal) parts.push("Personal: " + personal);
    if (emergency) parts.push("Emergency: " + emergency);

    resultEl.innerHTML = "Your plan — " + parts.join(" · ");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Cost Cutter": biggest expense + reduction idea
// ==========================================================================
(function () {
  var btn = document.getElementById("save-leaks-plan");
  if (!btn) return;

  var expenseInput = document.getElementById("big-expense");
  var amountInput = document.getElementById("expense-amount");
  var ideaInput = document.getElementById("cut-idea");
  var resultEl = document.getElementById("leaks-result");
  var badgeEl = document.getElementById("badge-leaks");

  var form = document.getElementById("leaks-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var expense = expenseInput.value.trim();
    var amount = parseFloat(amountInput.value) || 0;
    var idea = ideaInput.value.trim();

    if (!expense || !idea) {
      resultEl.textContent = "Engeza izindleko zakho ezinkulu kunazo zonke nombono owodwa wokuzinciphisa.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML =
      "Biggest expense: <strong>" + expense + "</strong>" +
      (amount ? " (~R" + amount.toFixed(2) + "/week)" : "") +
      "<br>Your plan: " + idea;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Proof Keeper": first two transactions
// ==========================================================================
(function () {
  var btn = document.getElementById("save-proof-entries");
  if (!btn) return;

  var descInputs = document.querySelectorAll(".tx-desc");
  var amountInputs = document.querySelectorAll(".tx-amount");
  var typeSelects = document.querySelectorAll(".tx-type");
  var resultEl = document.getElementById("proof-result");
  var badgeEl = document.getElementById("badge-proof");

  var form = document.getElementById("proof-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var rows = [];
    var hasEntry = false;

    for (var i = 0; i < descInputs.length; i++) {
      var desc = descInputs[i].value.trim();
      var amount = parseFloat(amountInputs[i].value) || 0;
      var type = typeSelects[i].value;

      if (desc) {
        hasEntry = true;
        rows.push(
          (type === "in" ? "Money In" : "Money Out") +
          ": " + desc +
          (amount ? " — R" + amount.toFixed(2) : "")
        );
      }
    }

    if (!hasEntry) {
      resultEl.textContent = "Add at least one transaction description.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML = rows.join("<br>");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Banked & Building": bank choice + requirements + plan
// ==========================================================================
(function () {
  var bankSelect = document.getElementById("bank-choice");
  if (!bankSelect) return;

  var stepsEl = document.getElementById("bank-steps");
  var requirementsEl = document.getElementById("bank-requirements");
  var saveBtn = document.getElementById("save-bank-plan");
  var resultEl = document.getElementById("bank-result");
  var badgeEl = document.getElementById("badge-bank");
  var taskChecks = document.querySelectorAll(".bank-task");

  var form = document.getElementById("bank-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var requirements = {
    capitec: [
      "I-akhawunti yakho ekhona ye-Capitec GlobalOne yomuntu siqu",
      "I-ID yakho yaseNingizimu Afrika",
      "Ayikho inani eliphansi lokubeka ukuze uvule",
    ],
    tyme: [
      "I-akhawunti yakho ekhona ye-TymeBank yomuntu siqu ethi \"Good Friends\"",
      "Ihlelwa ku-app: My Profile > My Details > Business Benefits",
      "Ivulwa mahhala",
    ],
  };

  bankSelect.addEventListener("change", function () {
    var choice = bankSelect.value;
    if (!choice) {
      stepsEl.classList.add("hidden");
      return;
    }

    requirementsEl.innerHTML = "";
    requirements[choice].forEach(function (req) {
      var li = document.createElement("li");
      li.textContent = req;
      requirementsEl.appendChild(li);
    });

    stepsEl.classList.remove("hidden");
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var chosenTasks = [];
      taskChecks.forEach(function (check) {
        if (check.checked) chosenTasks.push(check.parentElement.textContent.trim());
      });

      if (!bankSelect.value) {
        resultEl.textContent = "Choose a bank first.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      if (!chosenTasks.length) {
        resultEl.textContent = "Phawula okungenani into eyodwa ozoyenza kuleli sonto.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      resultEl.innerHTML = "This week: " + chosenTasks.join(", ");
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      badgeEl.classList.remove("hidden");
      badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();

// ==========================================================================
// Journey 03 — "Officially Official": CIPC document checklist
// ==========================================================================

(function () {
  var btn = document.getElementById("save-cipc-checklist");
  if (!btn) return;

  var notesInput = document.getElementById("cipc-checklist-notes");
  var resultEl = document.getElementById("cipc-checklist-result");
  var badgeEl = document.getElementById("badge-cipc-checklist");

  var form = document.getElementById("cipc-checklist-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var notes = notesInput.value.trim();

    if (!notes) {
      resultEl.textContent = "Engeza okungenani incwadi eyodwa noma imvume ozoyidinga.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML = "Your list: " + notes;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Food Safe": municipal health office details
// ==========================================================================

(function () {
  var btn = document.getElementById("save-health-permit");
  if (!btn) return;

  var addressInput = document.getElementById("health-office-address");
  var phoneInput = document.getElementById("health-office-phone");
  var resultEl = document.getElementById("health-permit-result");
  var badgeEl = document.getElementById("badge-health-permit");

  var form = document.getElementById("health-permit-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var address = addressInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!address && !phone) {
      resultEl.textContent = "Add the office address or contact number.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (address) parts.push("Address: " + address);
    if (phone) parts.push("Phone: " + phone);

    resultEl.innerHTML = parts.join(" · ");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Paper Trail Pro": permits audit
// ==========================================================================

(function () {
  var btn = document.getElementById("save-permits-audit");
  if (!btn) return;

  var haveInput = document.getElementById("permits-have");
  var missingInput = document.getElementById("permits-missing");
  var resultEl = document.getElementById("permits-audit-result");
  var badgeEl = document.getElementById("badge-permits-audit");

  var form = document.getElementById("permits-audit-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var have = haveInput.value.trim();
    var missing = missingInput.value.trim();

    if (!have && !missing) {
      resultEl.textContent = "List at least one permit you have or are missing.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (have) parts.push("Have: " + have);
    if (missing) parts.push("Missing: " + missing);

    resultEl.innerHTML = parts.join("<br>");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Tax Tracker": 12-month sales picture calculator
// ==========================================================================
(function () {
  var form = document.getElementById("sales-picture-form");
  if (!form) return; // not on this page

  var VAT_THRESHOLD = 2300000; // R2.3 million, effective 1 April 2026 (SARS)

  var monthInputs = document.querySelectorAll(".month-input");
  var notTradingChecks = document.querySelectorAll(".not-trading-check");
  var actualBtn = document.getElementById("records-actual-btn");
  var estimateBtn = document.getElementById("records-estimate-btn");
  var totalAmountEl = document.getElementById("sales-total-amount");
  var averageAmountEl = document.getElementById("sales-average-amount");
  var progressPercentEl = document.getElementById("vat-progress-percent");
  var progressBarEl = document.getElementById("vat-progress-bar");
  var progressFillEl = document.getElementById("vat-progress-fill");
  var calcBtn = document.getElementById("calc-sales-picture");
  var resultEl = document.getElementById("sales-picture-result");
  var badgeEl = document.getElementById("badge-sales-picture");

  var recordsType = "actual";

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  function setRecordsType(type) {
    recordsType = type;
    var isActual = type === "actual";
    actualBtn.classList.toggle("active", isActual);
    actualBtn.setAttribute("aria-pressed", String(isActual));
    estimateBtn.classList.toggle("active", !isActual);
    estimateBtn.setAttribute("aria-pressed", String(!isActual));
  }

  if (actualBtn) actualBtn.addEventListener("click", function () { setRecordsType("actual"); });
  if (estimateBtn) estimateBtn.addEventListener("click", function () { setRecordsType("estimate"); });

  notTradingChecks.forEach(function (check) {
    check.addEventListener("change", function () {
      var month = check.getAttribute("data-month");
      var input = document.getElementById("month-" + month);
      var row = check.closest(".month-row");
      if (!input) return;

      input.disabled = check.checked;
      if (check.checked) input.value = "";
      if (row) row.classList.toggle("is-not-trading", check.checked);
    });
  });

  calcBtn.addEventListener("click", function () {
    var total = 0;
    var monthsTrading = 0;
    var anyEntry = false;

    monthInputs.forEach(function (input) {
      var month = input.getAttribute("data-month");
      var notTrading = document.querySelector('.not-trading-check[data-month="' + month + '"]');
      if (notTrading && notTrading.checked) return;

      var value = parseFloat(input.value);
      if (!isNaN(value) && input.value.trim() !== "") {
        total += value;
        monthsTrading++;
        anyEntry = true;
      }
    });

    if (!anyEntry) {
      resultEl.textContent = 'Enter at least one month\'s sales, or mark months as "not trading yet."';
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var average = monthsTrading > 0 ? total / monthsTrading : 0;
    var percent = Math.min(100, Math.round((total / VAT_THRESHOLD) * 100));

    totalAmountEl.textContent = "R " + total.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
    averageAmountEl.textContent = "R " + average.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
    progressPercentEl.textContent = percent + "%";
    progressBarEl.setAttribute("aria-valuenow", percent);
    progressFillEl.style.width = percent + "%";

    progressFillEl.classList.remove("near-limit", "over-limit");
    resultEl.classList.remove("result-warning", "result-alert", "result-error");

    var statusLine;
    if (total >= VAT_THRESHOLD) {
      progressFillEl.classList.add("over-limit");
      resultEl.classList.add("result-alert");
      statusLine = "Ukuthengisa kwakho kusesilinganisweni noma ngaphezu kwesilinganiso se-VAT. Qinisekisa isikhundla sakho ne-SARS masinyane.";
    } else if (percent >= 80) {
      progressFillEl.classList.add("near-limit");
      resultEl.classList.add("result-warning");
      statusLine = "Usondela — cishe u-R" + (VAT_THRESHOLD - total).toLocaleString("en-ZA", { maximumFractionDigits: 0 }) + " ngaphansi kwesilinganiso se-VAT esingu-R2.3 million.";
    } else {
      statusLine = "Uphansi ngo-R" + (VAT_THRESHOLD - total).toLocaleString("en-ZA", { maximumFractionDigits: 0 }) + " ngaphansi kwesilinganiso esiphoqelekile se-VAT esingu-R2,300,000.";
    }

    var recordLabel = recordsType === "estimate" ? "This is only an estimate." : "These are actual records.";

    resultEl.innerHTML =
      "Kurekhodwe ezinyangeni ezingu-" + monthsTrading + ": <strong>R" + total.toLocaleString("en-ZA", { maximumFractionDigits: 2 }) + "</strong><br>" +
      statusLine + "<br>" +
      '<span class="small">' + recordLabel + "</span>";
    resultEl.classList.remove("hidden");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Tax Smart": choose one tax action + date + reminder
// ==========================================================================
(function () {
  var btn = document.getElementById("save-tax-next-step");
  if (!btn) return;

  var choiceSelect = document.getElementById("tax-action-select");
  var dateInput = document.getElementById("tax-action-date");
  var ackCheckbox = document.getElementById("tax-guidance-ack");
  var resultEl = document.getElementById("tax-next-step-result");
  var badgeEl = document.getElementById("badge-tax-next-step");

  var form = document.getElementById("tax-next-step-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var actionLabels = {
    records: "Qala ukugcina amarekhodi ezokuthengisa zenyanga",
    "turnover-tax": "Hlola ukuthi ngiyafanelekela yini i-Turnover Tax",
    efiling: "Ngena noma wenze iphrofayela yami ye-SARS eFiling",
    branch: "Bhukha isikhathi se-SARS noma uvakashele igatsha",
    practitioner: "Khuluma nochwepheshe wentela obhalisiwe",
  };

  var reminderLabels = {
    none: "Asikho isikhumbuzo esisethiwe",
    "3days": "Isikhumbuzo sisethelwe ezinsukwini ezi-3 ezizayo",
    "1week": "Isikhumbuzo sisethelwe ngesonto elilandelayo",
  };

  btn.addEventListener("click", function () {
    var missing = [];
    if (!choiceSelect.value) missing.push("khetha isinyathelo");
    if (!dateInput.value) missing.push("khetha usuku oluhlosiwe");
    if (!ackCheckbox.checked) missing.push("qinisekisa ukuthi uyaqonda ukuthi lesi isiqondiso, hhayi isinqumo se-SARS");

    if (missing.length) {
      resultEl.innerHTML = "Please " + missing.join(", ") + ".";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var reminderChecked = document.querySelector('input[name="tax-reminder"]:checked');
    var reminderValue = reminderChecked ? reminderChecked.value : "none";

    var formattedDate = new Date(dateInput.value + "T00:00:00").toLocaleDateString("en-ZA", {
      year: "numeric", month: "long", day: "numeric",
    });

    resultEl.innerHTML =
      "Your plan: <strong>" + actionLabels[choiceSelect.value] + "</strong> by <strong>" + formattedDate + "</strong>.<br>" +
      reminderLabels[reminderValue];
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Compliance Mapped": personalised compliance map
// ==========================================================================
(function () {
  var btn = document.getElementById("build-compliance-map");
  if (!btn) return;

  var whereSelect = document.getElementById("compliance-where");
  var whatSelect = document.getElementById("compliance-what");
  var setupSelect = document.getElementById("compliance-setup");
  var resultEl = document.getElementById("compliance-map-result");
  var badgeEl = document.getElementById("badge-compliance-map");

  var form = document.getElementById("compliance-map-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var whereText = {
    home: "trade from home or a yard",
    stall: "thengisa esitalini, etafuleni, endleleni yabahamba ngezinyawo, noma endaweni yomphakathi",
    shop: "thengisa esitolo noma esitsheni",
    online: "thengisa ku-inthanethi noma ngokulethelwa",
  };

  var whatText = {
    packaged: "thengisa impahla epakishiwe",
    food: "thengisa ukudla okusha noma okulungisiwe",
    services: "nikeza izinsizakalo",
    other: "thengisa okunye",
  };

  var setupText = {
    sole: "Njengamanje uthengisa njengomnikazi oyedwa.",
    partnership: "Njengamanje uthengisa njengobambiswano.",
    company: "Usunayo inkampani ebhalisiwe.",
    unsure: "Awuqiniseki okwamanje ngesakhiwo sebhizinisi lakho — kuyafaneleka ukukuxazulula ngokushesha, njengoba kuthinta intela nomthwalo wemfanelo.",
  };

  function buildRecommendations(where, what) {
    var recs = [];

    if (where === "stall") recs.push("hlola izidingo zemvume yokuthengisa okungahlelekile kamasipala wakini");
    else if (where === "home") recs.push("hlola ukuthi impahla yakho ihlelelwe ukusetshenziselwa ibhizinisi yini");
    else if (where === "shop") recs.push("hlola izidingo zelayisense yebhizinisi lamasipala zendawo ebekiwe");
    else if (where === "online") recs.push("hlola imithetho ye-Consumer Protection Act yokuthengisa ku-inthanethi nokuthengisa kude");

    if (what === "food") recs.push("hlola i-Certificate of Acceptability yehhovisi lakho lasekhaya le-Environmental Health (imvume yokuphepha kokudla)");
    else if (what === "packaged") recs.push("hlola ukuthi ukulebula kwakho kuhambisana yini nemithetho ye-Foodstuffs, Cosmetics and Disinfectants Act, uma kuyasebenza");
    else if (what === "services") recs.push("hlola ukuthi uhlobo lwakho lwensizakalo ludinga yini ukubhaliswa noma ilayisense yochwepheshe ehlukile");

    recs.push("bhalisa ibhizinisi lakho ne-CIPC uma ungakenzi, ngoba lokhu kusekela konke okunye");

    return recs;
  }

  btn.addEventListener("click", function () {
    if (!whereSelect.value || !whatSelect.value || !setupSelect.value) {
      resultEl.innerHTML = "Sicela uphendule yonke imibuzo emithathu.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var where = whereSelect.value;
    var what = whatSelect.value;
    var setup = setupSelect.value;

    var recs = buildRecommendations(where, what);
    var recList = recs.map(function (r) { return "<li>" + r.charAt(0).toUpperCase() + r.slice(1) + "</li>"; }).join("");

    resultEl.innerHTML =
      '<p class="compliance-map-summary">Ngoba ' + whereText[where] + " futhi " + whatText[what] + ", nakhu okufanele ukuphenye kuqala:</p>" +
      '<ul class="compliance-map-list">' + recList + "</ul>" +
      '<span class="small">' + setupText[setup] + "</span>";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Shared helper — reflection textarea with partial message + automatic badge
// Used by Journey 07, 08, 09, 10 (and any future reflection challenges)
// ==========================================================================
function initReflection(config) {
  var textarea = document.getElementById(config.inputId);
  var messageEl = document.getElementById(config.messageId);
  var messageTextEl = document.getElementById(config.messageTextId);
  var badgeSection = document.getElementById(config.badgeSectionId);

  if (!textarea || !messageEl || !messageTextEl || !badgeSection) return; // not on this page

  function update() {
    var hasContent = textarea.value.trim().length > 0;

    if (hasContent) {
      messageTextEl.textContent = config.readyMessage;
      messageEl.classList.add("is-visible");
      localStorage.setItem(config.storageKey, "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  textarea.addEventListener("input", update);

  if (localStorage.getItem(config.storageKey) === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
}

// ==========================================================================
// Journey 07 — Reflection challenges (Brand Aware, Strategy Starter,
// Found My Voice)
// ==========================================================================
initReflection({
  inputId: "brandAwareInput",
  messageId: "brandAwareMessage",
  messageTextId: "brandAwareMessageText",
  badgeSectionId: "brandAwareBadgeSection",
  readyMessage: "Nice — that's a clear picture of your brand.",
  storageKey: "brandAwareBadge",
});

initReflection({
  inputId: "strategyStarterInput",
  messageId: "strategyStarterMessage",
  messageTextId: "strategyStarterMessageText",
  badgeSectionId: "strategyStarterBadgeSection",
  readyMessage: "Kuhle kakhulu — inhloso nombono sekuqaphelekile.",
  storageKey: "strategyStarterBadge",
});

initReflection({
  inputId: "foundVoiceInput",
  messageId: "foundVoiceMessage",
  messageTextId: "foundVoiceMessageText",
  badgeSectionId: "foundVoiceBadgeSection",
  readyMessage: "Usuwutholile umusho wakho oyisiqubulo!",
  storageKey: "foundMyVoiceBadge",
});

// ==========================================================================
// Journey 08 — Reflection challenges (Clear Communicator, Time Tamer,
// Team Builder, Pro Mode, Well Connected)
// ==========================================================================
initReflection({
  inputId: "clearCommunicatorInput",
  messageId: "clearCommunicatorMessage",
  messageTextId: "clearCommunicatorMessageText",
  badgeSectionId: "clearCommunicatorBadgeSection",
  readyMessage: "Amasu amahle okuphatha isikhathi esinzima.",
  storageKey: "clearCommunicatorBadge",
});

initReflection({
  inputId: "timeTamerInput",
  messageId: "timeTamerMessage",
  messageTextId: "timeTamerMessageText",
  badgeSectionId: "timeTamerBadgeSection",
  readyMessage: "Lolo wuhlelo lwansuku zonke oluqinile.",
  storageKey: "timeTamerBadge",
});

initReflection({
  inputId: "teamBuilderInput",
  messageId: "teamBuilderMessage",
  messageTextId: "teamBuilderMessageText",
  badgeSectionId: "teamBuilderBadgeSection",
  readyMessage: "Izindima ezicacile zakha ithimba eliqinile.",
  storageKey: "teamBuilderBadge",
});

initReflection({
  inputId: "proModeInput",
  messageId: "proModeMessage",
  messageTextId: "proModeMessageText",
  badgeSectionId: "proModeBadgeSection",
  readyMessage: "Lowo ngumkhuba okufanele uwuthuthukise.",
  storageKey: "proModeBadge",
});

initReflection({
  inputId: "wellConnectedInput",
  messageId: "wellConnectedMessage",
  messageTextId: "wellConnectedMessageText",
  badgeSectionId: "wellConnectedBadgeSection",
  readyMessage: "Unabantu ongabacela usizo.",
  storageKey: "wellConnectedBadge",
});

initReflection({
  inputId: "pitchReadyInput",
  messageId: "pitchReadyMessage",
  messageTextId: "pitchReadyMessageText",
  badgeSectionId: "pitchReadyBadgeSection",
  readyMessage: "Leso yisiqalo sesethulo esiqinile sokufuna uxhaso lwezimali.",
  storageKey: "pitchReadyBadge",
});

initReflection({
  inputId: "structureCheckInput",
  messageId: "structureCheckMessage",
  messageTextId: "structureCheckMessageText",
  badgeSectionId: "structureCheckBadgeSection",
  readyMessage: "Kuhle — kufanelekile ukuthi ubuyele kukho njengoba ibhizinisi lakho likhula.",
  storageKey: "structureCheckBadge",
});

// ==========================================================================
// Journey 07 — "Look Locked In": brand colour picker
// ==========================================================================
(function () {
  var primaryInput = document.getElementById("brandColorPrimary");
  var secondaryInput = document.getElementById("brandColorSecondary");
  var primaryValueEl = document.getElementById("brandColorPrimaryValue");
  var secondaryValueEl = document.getElementById("brandColorSecondaryValue");
  var messageEl = document.getElementById("lookLockedInMessage");
  var messageTextEl = document.getElementById("lookLockedInMessageText");
  var badgeSection = document.getElementById("lookLockedInBadgeSection");

  if (!primaryInput || !secondaryInput || !messageEl || !messageTextEl || !badgeSection) return; // not on this page

  var READY_MESSAGE = "Ubunjalo bomkhiqizo wakho sebuqinisekisiwe.";
  var STORAGE_KEY = "lookLockedInBadge";
  var hasInteracted = false;

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function update() {
    primaryValueEl.textContent = primaryInput.value.toUpperCase();
    secondaryValueEl.textContent = secondaryInput.value.toUpperCase();

    if (!hasInteracted) return; // don't fire on the default pre-set colours alone

    messageTextEl.textContent = READY_MESSAGE;
    messageEl.classList.add("is-visible");
    localStorage.setItem(STORAGE_KEY, "earned");
    showBadge();
  }

  primaryInput.addEventListener("input", function () {
    hasInteracted = true;
    update();
  });

  secondaryInput.addEventListener("input", function () {
    hasInteracted = true;
    update();
  });

  if (localStorage.getItem(STORAGE_KEY) === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
})();

// ==========================================================================
// Journey 08 — "Tap to Trade": Yoco Sign-Up Checklist quiz
// ==========================================================================
(function () {
  var checkBtn = document.getElementById("checkYocoChecklist");
  if (!checkBtn) return; // not on this page

  var options = document.querySelectorAll(".yoco-checklist-option");
  var resultEl = document.getElementById("yocoChecklistResult");
  var badgeSection = document.getElementById("tapToTradeBadgeSection");
  var form = document.getElementById("yocoChecklistForm");

  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var CORRECT_ANSWERS = ["A", "C", "D", "E", "G"];

  var CORRECT_MESSAGE =
    "Umsebenzi omuhle! Awudingi ukubhaliswa yi-CIPC ukuze ubhalise njengoMnikazi " +
    "Oyedwa (Sole Proprietor). Udinga imininingwane yakho siqu, ubuqinisekiso " +
    "besazisi saseNingizimu Afrika, ikheli lokuhweba, kanye ne-akhawunti " +
    "yasebhange yaseNingizimu Afrika egameni lakho. Ungabe usukhetha umshini " +
    "wamakhadi ofanele ibhizinisi lakho.";

  var INCORRECT_MESSAGE =
    "Zama futhi. Khumbula: I-Yoco ivumela abanikazi bamabhizinisi azimele " +
    "ukuthi babhalise ngaphandle kokubhalisa kwa-CIPC. Gxila ebufakazini " +
    "bobunikazi, ekhelini, kanye nemininingwane yasebhange edingekayo ukuze " +
    "usethe uhlelo lokwamukela izinkokhelo zamakhadi.";

  function clearHighlights() {
    options.forEach(function (option) {
      option.closest(".quiz-option").classList.remove("correct-answer", "incorrect-answer");
    });
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  checkBtn.addEventListener("click", function () {
    var selected = [];
    options.forEach(function (option) {
      if (option.checked) selected.push(option.value);
    });

    clearHighlights();

    var isCorrect =
      selected.length === CORRECT_ANSWERS.length &&
      CORRECT_ANSWERS.every(function (answer) { return selected.indexOf(answer) !== -1; });

    options.forEach(function (option) {
      var wrapper = option.closest(".quiz-option");
      var isCorrectAnswer = CORRECT_ANSWERS.indexOf(option.value) !== -1;

      if (isCorrectAnswer && option.checked) {
        wrapper.classList.add("correct-answer");
      } else if (!isCorrectAnswer && option.checked) {
        wrapper.classList.add("incorrect-answer");
      } else if (isCorrectAnswer && !option.checked && !isCorrect) {
        wrapper.classList.add("incorrect-answer");
      }
    });

    resultEl.classList.remove("result-success", "result-retry");

    if (isCorrect) {
      resultEl.textContent = CORRECT_MESSAGE;
      resultEl.classList.add("result-success");
      resultEl.classList.remove("hidden");

      localStorage.setItem("tapToTradeBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = INCORRECT_MESSAGE;
      resultEl.classList.add("result-retry");
      resultEl.classList.remove("hidden");
    }
  });

  if (localStorage.getItem("tapToTradeBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 09 — "Find Your Funding Contact": NYDA/SEDFA contact-point activity
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFundingContact");
  if (!btn) return; // not on this page

  var orgSelect = document.getElementById("orgSelected");
  var branchInput = document.getElementById("branchContact");
  var townInput = document.getElementById("townArea");
  var contactMethodSelect = document.getElementById("contactMethod");
  var detailInput = document.getElementById("contactDetail");
  var questionInput = document.getElementById("fundingQuestion");
  var messageEl = document.getElementById("fundingContactMessage");
  var messageTextEl = document.getElementById("fundingContactMessageText");
  var badgeSection = document.getElementById("fundingContactBadgeSection");

  var form = document.getElementById("fundingContactForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var COMPLETED_MESSAGE =
    "Uthole indawo yokuxhumana ukuze uthole uxhaso. Ukungabhalisi " +
    "akudingeki kukuvimbele ekuhloleni amathuba onawo. Isinyathelo sakho " +
    "esilandelayo wukuxhumana nenhlangano bese ubuza ukuthi ingabe " +
    "umbono webhizinisi lakho uyahlangabezana yini nezidingo zayo.";

  var INCOMPLETE_MESSAGE =
    "Sicela ugcwalise igama lenhlangano, igatsha elithile noma indawo yokuxhumana, " +
    "idolobha noma indawo ohlala kuyo, indlela yokuxhumana, inombolo yocingo noma i-imeyili, kanye " +
    "nombuzo owodwa ongawubuza umxhasi.";

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (localStorage.getItem("fundingAwareBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  btn.addEventListener("click", function () {
    var hasOrg = orgSelect.value.trim() !== "";
    var hasBranch = branchInput.value.trim() !== "";
    var hasTown = townInput.value.trim() !== "";
    var hasMethod = contactMethodSelect.value.trim() !== "";
    var hasDetail = detailInput.value.trim() !== "";
    var hasQuestion = questionInput.value.trim() !== "";

    messageEl.classList.remove("is-visible");

    if (hasOrg && hasBranch && hasTown && hasMethod && hasDetail && hasQuestion) {
      messageTextEl.textContent = COMPLETED_MESSAGE;
      messageEl.classList.add("is-visible");
      messageEl.classList.remove("message-error");

      localStorage.setItem("fundingAwareBadge", "earned");
      showBadge();
    } else {
      messageTextEl.textContent = INCOMPLETE_MESSAGE;
      messageEl.classList.add("is-visible");
      messageEl.classList.add("message-error");
    }
  });
})();

// ==========================================================================
// Journey 10 — "Fair Employer": employer readiness check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFairEmployer");
  if (!btn) return;

  var situationOptions = document.querySelectorAll(".employer-situation-option");
  var checklistBlock = document.getElementById("employerChecklistBlock");
  var hiringBlock = document.getElementById("employerHiringBlock");
  var reflectionInput = document.getElementById("employerReflection");
  var hireDateInput = document.getElementById("hireDate");
  var resultEl = document.getElementById("fairEmployerResult");
  var badgeSection = document.getElementById("fairEmployerBadgeSection");

  var form = document.getElementById("fairEmployerForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  situationOptions.forEach(function (option) {
    option.addEventListener("change", function () {
      checklistBlock.classList.toggle("hidden", option.value !== "A" || !option.checked);
      hiringBlock.classList.toggle("hidden", option.value !== "B" || !option.checked);
    });
  });

  btn.addEventListener("click", function () {
    var situation = document.querySelector('input[name="employerSituation"]:checked');

    if (!situation) {
      resultEl.textContent = "Sicela ukhethe isitatimende esichaza ibhizinisi lakho namuhla.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var complete = false;
    var summary = "";

    if (situation.value === "A") {
      var uif = document.querySelector('input[name="req-uif"]:checked');
      var coida = document.querySelector('input[name="req-coida"]:checked');
      var payslips = document.querySelector('input[name="req-payslips"]:checked');
      var partTime = document.querySelector('input[name="req-parttime"]:checked');
      var hasReflection = reflectionInput.value.trim() !== "";

      complete = !!(uif && coida && payslips && partTime && hasReflection);
      summary = complete ? "First requirement to sort out: " + reflectionInput.value.trim() : "";
    } else if (situation.value === "B") {
      complete = hireDateInput.value.trim() !== "";
      summary = complete ? "Planned hire date: " + hireDateInput.value : "";
    } else {
      complete = true;
      summary = "Azikho izinhlelo zamanje zabasebenzi noma zokuqasha eziphawuliwe.";
    }

    if (complete) {
      resultEl.textContent = summary;
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("fairEmployerBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = "Sicela ugcwalise uhlu lokuhlola noma isitatimende sokuqasha ngaphambi kokulondoloza.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
    }
  });

  if (localStorage.getItem("fairEmployerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Retail Ready": supplier checklist
// ==========================================================================
(function () {
  var btn = document.getElementById("saveRetailReady");
  if (!btn) return;

  var buyerName = document.getElementById("buyerName");
  var safetyRequirement = document.getElementById("safetyRequirement");
  var resultEl = document.getElementById("retailReadyResult");
  var badgeSection = document.getElementById("retailReadyBadgeSection");

  var form = document.getElementById("retailReadyForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!buyerName.value.trim() || !safetyRequirement.value.trim()) {
      resultEl.textContent = "Sicela usho umthengi othize bese ubhala imfuneko eyodwa yomhlinzeki noma umbuzo.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Kugciniwe: " + buyerName.value.trim() + " — " + safetyRequirement.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("retailReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("retailReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Packaging Aware": packaging material check
// ==========================================================================
(function () {
  var btn = document.getElementById("savePackagingCheck");
  if (!btn) return;

  var materialSelect = document.getElementById("packagingMaterial");
  var proQuestion = document.getElementById("proQuestion");
  var resultEl = document.getElementById("packagingResult");
  var badgeSection = document.getElementById("packagingBadgeSection");

  var form = document.getElementById("packagingForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!materialSelect.value || !proQuestion.value.trim()) {
      resultEl.textContent = "Sicela ukhethe izinto zokupakisha bese ubhala umbuzo ozowuhlola.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Material: " + materialSelect.value + " — Question noted.";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("packagingAwareBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("packagingAwareBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Brand Protector": trademark search result
// ==========================================================================
(function () {
  var btn = document.getElementById("saveBrandSearch");
  if (!btn) return;

  var nameSearched = document.getElementById("nameSearched");
  var brandNextStep = document.getElementById("brandNextStep");
  var resultEl = document.getElementById("brandSearchResult");
  var badgeSection = document.getElementById("brandSearchBadgeSection");

  var form = document.getElementById("brandSearchForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!nameSearched.value.trim() || !brandNextStep.value) {
      resultEl.textContent = "Sicela ufake igama eliseshiwe bese ukhetha isinyathelo esilandelayo.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Searched: " + nameSearched.value.trim() + " — Next step: " + brandNextStep.value;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("brandProtectorBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("brandProtectorBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Deal Ready": document readiness planner
// ==========================================================================
(function () {
  var btn = document.getElementById("saveDealReady");
  if (!btn) return;

  var taxStatus = document.getElementById("taxStatus");
  var bbeeStatus = document.getElementById("bbeeStatus");
  var qualifiesEME = document.getElementById("qualifiesEME");
  var resultEl = document.getElementById("dealReadyResult");
  var badgeSection = document.getElementById("dealReadyBadgeSection");

  var form = document.getElementById("dealReadyForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!taxStatus.value || !bbeeStatus.value || !qualifiesEME.value) {
      resultEl.textContent = "Sicela ugcwalise kokubili izimo zedokhumenti kanye nokuhlola kwakho kwe-EME.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Tax: " + taxStatus.value + " · B-BBEE: " + bbeeStatus.value + " · EME check: " + qualifiesEME.value;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("dealReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("dealReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Data Responsible": customer-data audit
// ==========================================================================
(function () {
  var btn = document.getElementById("saveDataAudit");
  if (!btn) return;

  var collectSelects = document.querySelectorAll(".data-collect-select");
  var purposeStatement = document.getElementById("dataPurposeStatement");
  var otherType = document.getElementById("dataOtherType");
  var resultEl = document.getElementById("dataAuditResult");
  var badgeSection = document.getElementById("dataAuditBadgeSection");

  var form = document.getElementById("dataAuditForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOneYes = false;
    collectSelects.forEach(function (select) {
      if (select.value === "Yes") hasAtLeastOneYes = true;
    });
    if (otherType.value.trim() !== "") hasAtLeastOneYes = true;

    var hasStatement = purposeStatement.value.trim() !== "";

    if (!hasAtLeastOneYes || !hasStatement) {
      resultEl.textContent = "Sicela umake okungenani uhlobo olulodwa lwedatha oluqoqayo bese ubhala isitatimende senhloso esifushane.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = 'Saved. "We use your personal information only to ' + purposeStatement.value.trim() + '"';
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("dataResponsibleBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("dataResponsibleBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Growth Thinker": alternative growth plan
// ==========================================================================
(function () {
  var btn = document.getElementById("saveGrowthPlan");
  if (!btn) return;

  var optionRadios = document.querySelectorAll(".growth-option-radio");
  var otherRadio = document.getElementById("growthOptionOtherRadio");
  var otherText = document.getElementById("growthOptionOtherText");
  var researchInput = document.getElementById("growthResearch");
  var actionInput = document.getElementById("growthIsinyathelo");
  var resultEl = document.getElementById("growthPlanResult");
  var badgeSection = document.getElementById("growthPlanBadgeSection");

  var form = document.getElementById("growthPlanForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  optionRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      otherText.disabled = !otherRadio.checked;
      if (!otherRadio.checked) otherText.value = "";
    });
  });

  btn.addEventListener("click", function () {
    var chosen = document.querySelector('input[name="growthOption"]:checked');
    var chosenLabel = chosen ? (chosen.value === "Other" ? otherText.value.trim() : chosen.value) : "";

    if (!chosen || (chosen.value === "Other" && !otherText.value.trim()) || !researchInput.value.trim() || !actionInput.value.trim()) {
      resultEl.textContent = "Sicela ukhethe inketho yokukhula bese ubhala umbuzo owodwa wocwaningo kanye nesenzo esilandelayo.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Growth option: " + chosenLabel + " — Research: " + researchInput.value.trim() + " — Next 7 days: " + actionInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("growthThinkerBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("growthThinkerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Kitchen Ready": safety checklist
// ==========================================================================
(function () {
  var list = document.getElementById("kitchenChecklistList");
  if (!list) return;

  var inputs = list.querySelectorAll(".checklist-input");
  var countEl = document.getElementById("kitchenChecklistCount");
  var percentEl = document.getElementById("kitchenChecklistPercent");
  var fillEl = document.getElementById("kitchenChecklistProgressFill");
  var barEl = document.getElementById("kitchenChecklistProgressBar");
  var messageEl = document.getElementById("kitchenChecklistMessage");
  var messageTextEl = document.getElementById("kitchenChecklistMessageText");
  var badgeSection = document.getElementById("kitchenReadyBadgeSection");

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function update() {
    var total = inputs.length;
    var checked = 0;
    inputs.forEach(function (input) { if (input.checked) checked++; });

    var percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    countEl.textContent = checked + " of " + total + " complete";
    percentEl.textContent = percent + "%";
    fillEl.style.width = percent + "%";
    barEl.setAttribute("aria-valuenow", percent);

    if (total > 0 && checked === total) {
      messageTextEl.textContent = "Kuhle! Izisekelo zekhishini lakho ziphelele.";
      messageEl.classList.add("is-visible");
      localStorage.setItem("kitchenReadyBadge", "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  inputs.forEach(function (input) { input.addEventListener("change", update); });

  if (localStorage.getItem("kitchenReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
})();

// ==========================================================================
// Journey 04 — "Trust Builder": label check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveLabelCheck");
  if (!btn) return;

  var presentSelects = document.querySelectorAll(".label-present-select");
  var nutritionClaimSelect = document.getElementById("hasNutritionClaim");
  var nutritionTableField = document.getElementById("nutritionTableField");
  var improvementInput = document.getElementById("labelImprovement");
  var resultEl = document.getElementById("labelCheckResult");
  var badgeSection = document.getElementById("labelCheckBadgeSection");

  var form = document.getElementById("labelCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nutritionClaimSelect.addEventListener("change", function () {
    nutritionTableField.classList.toggle("hidden", nutritionClaimSelect.value !== "Yes");
  });

  btn.addEventListener("click", function () {
    var allChecked = true;
    presentSelects.forEach(function (select) {
      if (!select.value) allChecked = false;
    });

    if (!allChecked || !improvementInput.value.trim()) {
      resultEl.textContent = "Sicela uhlole zonke izidingo ezinhlanu zelebula futhi ubhale ukuthuthukiswa okukodwa.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Next improvement: " + improvementInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("trustBuilderBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("trustBuilderBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Cold Chain Champion": temperature log
// ==========================================================================
(function () {
  var btn = document.getElementById("saveTempLog");
  if (!btn) return;

  var hasThermometerYes = document.getElementById("hasThermometerYes");
  var hasThermometerNo = document.getElementById("hasThermometerNo");
  var tempLogBlock = document.getElementById("tempLogBlock");
  var noThermometerBlock = document.getElementById("noThermometerBlock");
  var tempReading = document.getElementById("tempReading");
  var tempColdEnough = document.getElementById("tempColdEnough");
  var thermometerGetByDate = document.getElementById("thermometerGetByDate");
  var thermometerCheckDate = document.getElementById("thermometerCheckDate");
  var resultEl = document.getElementById("tempLogResult");
  var badgeSection = document.getElementById("tempLogBadgeSection");

  var form = document.getElementById("tempLogForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hasThermometerYes.addEventListener("change", function () {
    tempLogBlock.classList.remove("hidden");
    noThermometerBlock.classList.add("hidden");
  });

  hasThermometerNo.addEventListener("change", function () {
    tempLogBlock.classList.add("hidden");
    noThermometerBlock.classList.remove("hidden");
  });

  btn.addEventListener("click", function () {
    if (hasThermometerYes.checked) {
      if (tempReading.value.trim() === "" || !tempColdEnough.value) {
        resultEl.textContent = "Please record a temperature reading and whether the food is cold enough.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent = "Recorded: " + tempReading.value + "°C — " + tempColdEnough.value;
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("coldChainBadge", "earned");
      showBadge();
    } else if (hasThermometerNo.checked) {
      if (!thermometerGetByDate.value || !thermometerCheckDate.value) {
        resultEl.textContent = "Sicela ubeke usuku lokuthola ithemomitha nosuku lokuhlola kwakho kokuqala.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent = "Plan saved: get a thermometer by " + thermometerGetByDate.value + ", check on " + thermometerCheckDate.value + ".";
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("coldChainBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = "Sicela ukhethe ukuthi unayo yini ithemomitha.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
    }
  });

  if (localStorage.getItem("coldChainBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Clean Team": training check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveTrainingCheck");
  if (!btn) return;

  var nameInputs = document.querySelectorAll(".training-name-input");
  var proofSelects = document.querySelectorAll(".training-proof-select");
  var actionInput = document.getElementById("trainingAction");
  var resultEl = document.getElementById("trainingCheckResult");
  var badgeSection = document.getElementById("trainingCheckBadgeSection");

  var form = document.getElementById("trainingCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOnePerson = false;
    nameInputs.forEach(function (input) {
      if (input.value.trim() !== "") hasAtLeastOnePerson = true;
    });

    var hasProofAnswer = false;
    proofSelects.forEach(function (select) {
      if (select.value) hasProofAnswer = true;
    });

    if (!hasAtLeastOnePerson || !hasProofAnswer || !actionInput.value.trim()) {
      resultEl.textContent = "Sicela urekhode okungenani wena uqobo, ubeke uphawu ekutholakaleni kobufakazi, futhi wengeze isinyathelo esisodwa.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Next action: " + actionInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("cleanTeamBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("cleanTeamBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Ready to Scale": product risk check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveProductRisk");
  if (!btn) return;

  var productNameInputs = document.querySelectorAll(".product-name-input");
  var riskProductName = document.getElementById("riskProductName");
  var riskQuestion = document.getElementById("riskQuestion");
  var resultEl = document.getElementById("productRiskResult");
  var badgeSection = document.getElementById("productRiskBadgeSection");

  var form = document.getElementById("productRiskForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOneProduct = false;
    productNameInputs.forEach(function (input) {
      if (input.value.trim() !== "") hasAtLeastOneProduct = true;
    });

    if (!hasAtLeastOneProduct || !riskProductName.value.trim() || !riskQuestion.value.trim()) {
      resultEl.textContent = "Sicela ubhale okungenani umkhiqizo owodwa ohleliwe nombuzo owodwa okufanele uphenywe.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Investigating: " + riskProductName.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("readyToScaleBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("readyToScaleBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "FIFO Focused": fridge/storage check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFifoCheck");
  if (!btn) return;

  var itemInputs = document.querySelectorAll(".fifo-item-input");
  var frontSelects = document.querySelectorAll(".fifo-front-select");
  var actionInput = document.getElementById("fifoAction");
  var resultEl = document.getElementById("fifoCheckResult");
  var badgeSection = document.getElementById("fifoCheckBadgeSection");

  var form = document.getElementById("fifoCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasItem = false;
    itemInputs.forEach(function (input) { if (input.value.trim() !== "") hasItem = true; });

    var hasAnswer = false;
    frontSelects.forEach(function (select) { if (select.value) hasAnswer = true; });

    var hasNo = false;
    frontSelects.forEach(function (select) { if (select.value === "No") hasNo = true; });

    if (!hasItem || !hasAnswer) {
      resultEl.textContent = "Sicela uhlole okungenani into eyodwa futhi uqinisekise ukuthi isitoko esidala kunazo zonke siphambili yini.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (hasNo && !actionInput.value.trim()) {
      resultEl.textContent = "Uphawule into njengengalandeli i-FIFO. Sicela ubhale isinyathelo osithathile.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. " + (actionInput.value.trim() ? "Action: " + actionInput.value.trim() : "Isitoko sakho esidala kunazo zonke sibekwe ngendlela efanele.");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("fifoFocusedBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("fifoFocusedBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Par Level Pro": reorder planning
// ==========================================================================
(function () {
  var btn = document.getElementById("saveParLevel");
  if (!btn) return;

  var itemInputs = document.querySelectorAll(".par-item-input");
  var levelInputs = document.querySelectorAll(".par-level-input");
  var reorderInputs = document.querySelectorAll(".par-reorder-input");
  var resultEl = document.getElementById("parLevelResult");
  var badgeSection = document.getElementById("parLevelBadgeSection");

  var form = document.getElementById("parLevelForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasCompleteRow = false;
    for (var i = 0; i < itemInputs.length; i++) {
      if (itemInputs[i].value.trim() && levelInputs[i].value.trim() && reorderInputs[i].value.trim()) {
        hasCompleteRow = true;
        break;
      }
    }

    if (!hasCompleteRow) {
      resultEl.textContent = "Sicela ugcwalise okungenani umugqa owodwa ophelele: into, izinga le-par, nephuzu lokuoda kabusha.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Par levels saved.";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("parLevelProBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("parLevelProBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Pattern Spotter": sell-out log
// ==========================================================================
(function () {
  var btn = document.getElementById("saveSellOutLog");
  if (!btn) return;

  var soldOutYes = document.getElementById("soldOutYes");
  var soldOutNo = document.getElementById("soldOutNo");
  var logBlock = document.getElementById("sellOutLogBlock");
  var itemInputs = document.querySelectorAll(".sellout-item-input");
  var changeInput = document.getElementById("sellOutChange");
  var patternReflection = document.getElementById("patternReflection");
  var resultEl = document.getElementById("sellOutResult");
  var badgeSection = document.getElementById("sellOutBadgeSection");

  var form = document.getElementById("sellOutForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  soldOutYes.addEventListener("change", function () { logBlock.classList.remove("hidden"); });
  soldOutNo.addEventListener("change", function () { logBlock.classList.add("hidden"); });

  btn.addEventListener("click", function () {
    var choice = document.querySelector('input[name="anySoldOut"]:checked');

    if (!choice) {
      resultEl.textContent = "Sicela ukhethe ukuthi kukhona okuphelile yini namuhla.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (choice.value === "yes") {
      var hasItem = false;
      itemInputs.forEach(function (input) { if (input.value.trim() !== "") hasItem = true; });

      if (!hasItem || !changeInput.value.trim()) {
        resultEl.textContent = "Sicela urekhode okungenani into eyodwa ephelile nokushintsha okukodwa kwesikhathi esilandelayo.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      resultEl.textContent = "Saved. Next time: " + changeInput.value.trim();
    } else {
      resultEl.textContent = "Nothing sold out today. Tomorrow, keep tracking stock and record any item that runs out.";
    }

    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("patternSpotterBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("patternSpotterBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Smart Stocker": ordering plan
// ==========================================================================
(function () {
  var btn = document.getElementById("saveOrderPlan");
  if (!btn) return;

  var perishableItem = document.getElementById("perishableItem");
  var perishablePlan = document.getElementById("perishablePlan");
  var dryItem = document.getElementById("dryItem");
  var dryPlan = document.getElementById("dryPlan");
  var supplierItemName = document.getElementById("supplierItemName");
  var supplierPreview = document.getElementById("supplierQuestionPreview");
  var resultEl = document.getElementById("orderPlanResult");
  var badgeSection = document.getElementById("orderPlanBadgeSection");

  var form = document.getElementById("orderPlanForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  supplierItemName.addEventListener("input", function () {
    supplierPreview.textContent = supplierItemName.value.trim() || "[item]";
  });

  btn.addEventListener("click", function () {
    if (!perishableItem.value.trim() || !perishablePlan.value.trim() || !dryItem.value.trim() || !dryPlan.value.trim() || !supplierItemName.value.trim()) {
      resultEl.textContent = "Please complete both items with an ordering plan, and name an item for your supplier question.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Supplier question ready for: " + supplierItemName.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("smartStockerBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("smartStockerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Business Ready": WhatsApp profile checklist
// ==========================================================================
(function () {
  var btn = document.getElementById("saveWaProfile");
  if (!btn) return;

  var checks = document.querySelectorAll(".wa-profile-check");
  var nameInput = document.getElementById("waBusinessName");
  var productsInput = document.getElementById("waProducts");
  var hoursInput = document.getElementById("waHours");
  var namePreview = document.getElementById("waNamePreview");
  var productsPreview = document.getElementById("waProductsPreview");
  var hoursPreview = document.getElementById("waHoursPreview");
  var resultEl = document.getElementById("waProfileResult");
  var badgeSection = document.getElementById("waProfileBadgeSection");

  var form = document.getElementById("waProfileForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nameInput.addEventListener("input", function () { namePreview.textContent = nameInput.value.trim() || "[business name]"; });
  productsInput.addEventListener("input", function () { productsPreview.textContent = productsInput.value.trim() || "[products]"; });
  hoursInput.addEventListener("input", function () { hoursPreview.textContent = hoursInput.value.trim() || "[hours]"; });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) { if (!select.value) allChecked = false; });

    if (!allChecked || !nameInput.value.trim() || !productsInput.value.trim() || !hoursInput.value.trim()) {
      resultEl.textContent = "Sicela ugcwalise uhlu lokuhlola bese ubhala imininingwane yomyalezo wakho wokubingelela.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Iphrofayili igcinelwe u " + nameInput.value.trim() + ".";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("businessReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("businessReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Catalogue Built": WhatsApp catalogue builder
// ==========================================================================
(function () {
  var btn = document.getElementById("saveCatalogue");
  if (!btn) return;

  var nameInputs = document.querySelectorAll(".cat-name-input");
  var priceInputs = document.querySelectorAll(".cat-price-input");
  var shareMethod = document.getElementById("catShareMethod");
  var updateFrequency = document.getElementById("catUpdateFrequency");
  var resultEl = document.getElementById("catalogueResult");
  var badgeSection = document.getElementById("catalogueBadgeSection");

  var form = document.getElementById("catalogueForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < nameInputs.length; i++) {
      if (nameInputs[i].value.trim() && priceInputs[i].value.trim()) completeCount++;
    }

    if (completeCount < 3 || !shareMethod.value || !updateFrequency.value.trim()) {
      resultEl.textContent = "Sicela ufake igama nenani lazo zontathu izinto, ukhethe indlela yokwabelana, futhi usethe uhlelo lokuvuselela.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Catalogue saved with 3 items. Sharing via: " + shareMethod.value;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("catalogueBuiltBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("catalogueBuiltBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Connected": social-media connection check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveConnection");
  if (!btn) return;

  var platformSelected = document.getElementById("platformSelected");
  var isLinked = document.getElementById("isLinked");
  var whatCustomersCanDo = document.getElementById("whatCustomersCanDo");
  var linkedDateBlock = document.getElementById("linkedDateBlock");
  var linkByDate = document.getElementById("linkByDate");
  var resultEl = document.getElementById("connectionResult");
  var badgeSection = document.getElementById("connectionBadgeSection");

  var form = document.getElementById("connectionForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  isLinked.addEventListener("change", function () {
    linkedDateBlock.classList.toggle("hidden", isLinked.value === "Yes");
  });

  btn.addEventListener("click", function () {
    if (!platformSelected.value || !isLinked.value || !whatCustomersCanDo.value.trim()) {
      resultEl.textContent = "Sicela ukhethe inkundla, uqinisekise isimo sesixhumanisi sakho, bese uchaza ukuthi amakhasimende azokwazi ukwenzani.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (isLinked.value !== "Yes" && !linkByDate.value) {
      resultEl.textContent = "Sicela usethe usuku ozoxhumanisa ngalo i-akhawunti yakho.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Platform: " + platformSelected.value + (isLinked.value === "Yes" ? " (already linked)" : " — linking by " + linkByDate.value);
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("connectedBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("connectedBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Camera Ready": food photo checklist + caption
// ==========================================================================
(function () {
  var btn = document.getElementById("savePhotoChallenge");
  if (!btn) return;

  var checks = document.querySelectorAll(".photo-check-select");
  var dishInput = document.getElementById("captionDish");
  var locationInput = document.getElementById("captionLocation");
  var priceInput = document.getElementById("captionPrice");
  var dishPreview = document.getElementById("captionDishPreview");
  var locationPreview = document.getElementById("captionLocationPreview");
  var pricePreview = document.getElementById("captionPricePreview");
  var resultEl = document.getElementById("photoChallengeResult");
  var badgeSection = document.getElementById("photoChallengeBadgeSection");

  var form = document.getElementById("photoChallengeForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  dishInput.addEventListener("input", function () { dishPreview.textContent = dishInput.value.trim() || "[dish]"; });
  locationInput.addEventListener("input", function () { locationPreview.textContent = locationInput.value.trim() || "[location]"; });
  priceInput.addEventListener("input", function () { pricePreview.textContent = priceInput.value.trim() || "[price]"; });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) { if (!select.value) allChecked = false; });

    if (!allChecked || !dishInput.value.trim() || !locationInput.value.trim() || !priceInput.value.trim()) {
      resultEl.textContent = "Please complete the photo checklist and fill in your caption details.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Saved. Caption ready for: " + dishInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("cameraReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("cameraReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Idea Bank": monthly content idea bank
// ==========================================================================
(function () {
  var btn = document.getElementById("saveIdeaBank");
  if (!btn) return;

  var textInputs = document.querySelectorAll(".idea-text-input");
  var formatSelects = document.querySelectorAll(".idea-format-select");
  var whenInputs = document.querySelectorAll(".idea-when-input");
  var weeklyPostDay = document.getElementById("weeklyPostDay");
  var resultEl = document.getElementById("ideaBankResult");
  var badgeSection = document.getElementById("ideaBankBadgeSection");

  var form = document.getElementById("ideaBankForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < textInputs.length; i++) {
      if (textInputs[i].value.trim() && formatSelects[i].value && whenInputs[i].value.trim()) completeCount++;
    }

    if (completeCount < 3 || !weeklyPostDay.value) {
      resultEl.textContent = "Please add three complete post ideas and choose a weekly posting day.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Ibhange lemibono ligciniwe. Izothunyelwa njalo " + weeklyPostDay.value + ".";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("ideaBankBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("ideaBankBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Page completion: congratulatory modal + "download my responses" PDF
// Generic — works on any module page via the .badge-section/"hidden"
// convention already used by every challenge across Journeys 1–10.
// ==========================================================================
(function () {
  var moduleMain = document.querySelector(".module-main");
  if (!moduleMain) return; // not a module/journey page

  var badgeSections = document.querySelectorAll(".badge-section");
  if (!badgeSections.length) return; // no challenges on this page

  function allComplete() {
    return Array.prototype.every.call(badgeSections, function (el) {
      return !el.classList.contains("hidden");
    });
  }

  function getModuleTitle() {
    var h1 = document.querySelector(".module-header h1");
    return h1 ? h1.textContent.trim() : document.title;
  }

  // ---- Strip emoji before anything reaches jsPDF ----
  // jsPDF's built-in fonts (Helvetica/Times/Courier) have no glyphs for
  // emoji. Leaving them in causes garbled characters and broken letter
  // spacing on the whole line (emoji are surrogate pairs, which throws off
  // jsPDF's width calculations). This only affects the PDF text — the
  // on-screen HTML keeps its emoji as normal.
  function sanitizeForPdf(text) {
    if (!text) return text;
    return text
      .replace(/\p{Extended_Pictographic}/gu, "") // emoji
      .replace(/\uFE0F/g, "") // emoji variation selector
      .replace(/\s{2,}/g, " ") // collapse the gap left behind
      .trim();
  }

  // ---- Congratulatory modal ----
  function getEarnedBadgeNames() {
    var names = [];
    badgeSections.forEach(function (section) {
      var badgeEl = section.querySelector(".badge");
      if (badgeEl) {
        names.push(badgeEl.textContent.trim().replace(/\s+/g, " "));
      }
    });
    return names;
  }

  // ---- Confetti behind the pop-up (skipped if the visitor prefers reduced motion) ----
  function launchCompletionConfetti() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      var canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
      document.body.appendChild(canvas);

      var ctx = canvas.getContext("2d");
      if (!ctx) {
        canvas.remove();
        return;
      }
      var dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);

      var colors = ["#319966", "#1fc652", "#b7d64a", "#1daec6", "#f09c3a"];
      var pieces = [];
      for (var i = 0; i < 180; i++) {
        pieces.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * window.innerHeight * 0.6,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: -8 + Math.random() * 16,
          speedY: 2 + Math.random() * 3,
          speedX: -1.5 + Math.random() * 3,
          opacity: 1,
        });
      }

      var startTime = null;
      var duration = 4500;

      function frame(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        pieces.forEach(function (p) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotationSpeed;
          if (elapsed > duration * 0.6) {
            p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
          }
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        if (elapsed < duration) {
          requestAnimationFrame(frame);
        } else {
          canvas.remove();
        }
      }

      requestAnimationFrame(frame);
    } catch (e) {
      /* confetti is decoration only - never let it block the pop-up */
    }
  }

  function showCongratsToast() {
    var badgeNames = getEarnedBadgeNames();

    var overlay = document.createElement("div");
    overlay.className = "page-complete-overlay";

    var badgeListHtml = "";
    if (badgeNames.length) {
      badgeListHtml =
        '<ul class="page-complete-badge-list">' +
        badgeNames.map(function (name) { return "<li>" + name + "</li>"; }).join("") +
        "</ul>";
    }

    var modal = document.createElement("div");
    modal.className = "page-complete-modal";
    modal.setAttribute("role", "status");
    modal.setAttribute("aria-live", "polite");
    modal.innerHTML =
      '<div class="page-complete-icon">🎉</div>' +
      "<h2>Great work!</h2>" +
      "<p>Uqede yonke imisebenzi eyinselele ekuleli khasi futhi uthole:</p>" +
      badgeListHtml +
      '<button type="button" class="btn btn-primary page-complete-close">Continue</button>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
    });

    launchCompletionConfetti();

    function dismiss() {
      overlay.classList.remove("is-visible");
      setTimeout(function () {
        overlay.remove();
      }, 400);
    }

    modal.querySelector(".page-complete-close").addEventListener("click", dismiss);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) dismiss();
    });

    setTimeout(dismiss, 35000);
  }

  // ---- Download button ----
  function addDownloadButton() {
    if (document.getElementById("downloadResponsesBtn")) return;

    var wrap = document.createElement("div");
    wrap.className = "download-responses-wrap";

    var note = document.createElement("p");
    note.className = "download-responses-note";
    note.textContent = "Thola ikhophi ye-PDF yakho konke okugcwalisile kuleli khasi.";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "downloadResponsesBtn";
    btn.className = "btn btn-primary";
    btn.textContent = "⬇ Landa Izimpendulo Zami (PDF)";
    btn.addEventListener("click", generateResponsesPdf);

    wrap.appendChild(note);
    wrap.appendChild(btn);
    moduleMain.appendChild(wrap);
  }

  // ---- Generic response harvester ----
  function labelForInput(el) {
    if (el.id) {
      var lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl) return lbl.textContent.trim();
    }
    var parentLabel = el.closest("label");
    if (parentLabel) {
      var clone = parentLabel.cloneNode(true);
      var innerInput = clone.querySelector("input, select, textarea");
      if (innerInput) innerInput.remove();
      return clone.textContent.trim();
    }
    var field = el.closest(".form-field");
    if (field) {
      var flabel = field.querySelector("label");
      if (flabel) return flabel.textContent.trim();
    }
    return null;
  }

  function valueForSelect(sel) {
    if (sel.selectedIndex < 0) return "";
    var opt = sel.options[sel.selectedIndex];
    return opt ? opt.textContent.trim() : sel.value;
  }

  function collectSection(container) {
    var titleEl = container.querySelector(".checklist-intro h2") || container.querySelector("h2");
    var title = titleEl ? titleEl.textContent.trim() : "Challenge";

    var promptEl = container.querySelector(".checklist-intro .lead") || container.querySelector(".lead");
    var prompt = promptEl ? promptEl.textContent.trim() : null;

    var qa = []; // { question, answer }
    var tables = []; // { headers: [...], rows: [[...], ...] }

    // Checklist items — each item's text is its own question
    container.querySelectorAll(".checklist-item").forEach(function (item) {
      var input = item.querySelector(".checklist-input");
      var text = item.querySelector(".checklist-text");
      if (input && text) {
        qa.push({
          question: text.textContent.trim(),
          answer: input.checked ? "Yes, checked" : "Not checked",
        });
      }
    });

    // Tables — captured as real table data, not flattened into Q&A
    container.querySelectorAll(".requirement-table, table").forEach(function (table) {
      if (table.closest(".example-answer") || table.classList.contains("example-table")) return;

      var headers = Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) {
        return th.textContent.trim();
      });

      var rows = [];
      table.querySelectorAll("tbody tr").forEach(function (tr) {
        var cells = tr.querySelectorAll("td");
        var hasContent = false;
        var rowValues = Array.prototype.map.call(cells, function (td) {
          var input = td.querySelector("input, select, textarea");
          var val = "";
          if (input) {
            if (input.tagName === "SELECT") val = valueForSelect(input);
            else if (input.type === "checkbox" || input.type === "radio") val = input.checked ? "Yes" : "";
            else val = input.value;
          } else {
            val = td.textContent.trim();
          }
          if (val) hasContent = true;
          return val || "-";
        });
        if (hasContent) rows.push(rowValues);
      });

      if (rows.length) {
        tables.push({ headers: headers, rows: rows });
      }
    });

    // Radio groups (skip ones already captured as table cells above)
    var seenRadioNames = {};
    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      if (radio.closest("td")) return;
      var name = radio.name;
      if (!name || seenRadioNames[name]) return;
      seenRadioNames[name] = true;
      var group = container.querySelectorAll('input[type="radio"][name="' + CSS.escape(name) + '"]');
      var checked = Array.prototype.find.call(group, function (r) { return r.checked; });
      if (checked) {
        var lbl = checked.closest("label");
        var text = lbl ? lbl.textContent.trim() : name;
        qa.push({ question: "Which did you select?", answer: text });
      }
    });

    // Standalone checkboxes (quiz options, task lists)
    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      if (cb.closest(".checklist-item")) return;
      var label = cb.closest("label");
      if (!label || !cb.checked) return;
      var clone = label.cloneNode(true);
      var innerInput = clone.querySelector("input");
      if (innerInput) innerInput.remove();
      var text = clone.textContent.trim();
      if (text) qa.push({ question: "Selected", answer: text });
    });

    // Text/number/date/time/color inputs, selects, textareas
    var freeInputs = container.querySelectorAll(
      'input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="color"], textarea, select'
    );
    var freeInputList = Array.prototype.filter.call(freeInputs, function (el) {
      return !el.closest("td") && !el.closest(".example-answer");
    });

    // Single free-text question (e.g. a reflection textarea) — use the
    // challenge's own prompt as the question instead of a generic field label.
    if (freeInputList.length === 1 && prompt) {
      var value = freeInputList[0].value;
      if (value) {
        qa.push({ question: prompt, answer: value });
      }
      freeInputList = [];
    }

    freeInputList.forEach(function (el) {
      var label = labelForInput(el);
      if (!label) return;
      var value = el.tagName === "SELECT" ? valueForSelect(el) : el.value;
      if (!value) return;
      qa.push({ question: label, answer: value });
    });

    return { title: title, prompt: prompt, qa: qa, tables: tables };
  }

  function collectAllResponses() {
    var containers = document.querySelectorAll(".checklist-card, .challenge-box");
    var sections = [];
    containers.forEach(function (c) {
      var data = collectSection(c);
      if (data.qa.length || data.tables.length) sections.push(data);
    });
    return sections;
  }

  // Embedded as a data URI (not fetched) so the PDF header logo always
  // renders, regardless of how the page is opened (file://, no server,
  // offline, etc.) - fetch() of local files is blocked under file://.
  var VUKA_LOGO_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAEuCAMAAAAp7VMSAAADAFBMVEVMaXGx1NT////p5dX7///////////+8rb56tPBqXv8tAP///+qyMj3/Pz8uQP9qAiLs7X6/f37pgX//ubz+Pj8ogX5uQX//eDS4OHo8fL5sQb/+NO6z8/////4tQf///3//vr///D75Z7///Rckpbf6ur/+tj/+NL7rQ/8rQP///j6qQgoaGn6kAb9/fz+//6UtbT60Xv92XP6x2r75qH755qcsrP63IP////6kBPH2tmNt7n41IXF3+L41o/7lRn4ogf/+M/64Ix8mZv+78D+98n+9MH53ZL95ZP87LD988H86bj867v4phOqysrS4+Olw8P5wHf7fhH52Zn5iQebu7z+8MeMs7T+8b397rD53ajO3t75yonB1db8nwjd6uv867Pi7e7S4eLE2Nirx8e0zs/63aeyzc/+76irxsf866765aL+9tP3yXXC09PV5ua81tfJ4OH75K74nQP71pDf7u7S5eX66Lfy+fq+1tb6462vycn75q3E2Nj52pb3yJT8rV/6zAT636W209bS5ub99br74aH52pL52IPznQP60qX887z6v4P////////+ghj/tgn/tAj/qAz/uwf/uAf/rAn/vgb/uwv+qgj+vAb/xAn/qhD+ow7/vQn/pQ3+wgr+ug//sgr/1gb+sAf9twf/qAf/lxv/lQv+zQf+txD+oxj/uQv/hBv/mwj+xwn9qwr+vA3+nxv+shH+pQf9rgv+rRX9ugj/vwv+kgv9qg/+pxj/qhb/0Af/oAb+lwn9vwr7vQj+1Ab/nR/+nBn/lx/7uBD+ygj+mRn+jg3/rgv+hRT+lg/+oBfu9/f+pxL9vhD9swn9pQv+iBL+ig71+/zx+Pj5///+rhD+shX8tBD/owj+y1v9myD8lQ78hRr/vz//2Vj+0Gr/y0j/uTL+whz/yzD/xVH/1E3+tSf/3mn/yTn/1mH+3Xz+wy7/yCP/0j/8vSD+iCD7txj9u2b+pzP9nyn9rSH/rUH/tVH/5YT/5XP/nkL/ki//4zb+2SD/7lvaTmr/AAAA+nRSTlMABPwFAvz9AwEC/CArDf3+NxL8Uwj8/V/5/PxzsRb8LTNH3j8O/Gp9/vw5/Rj9HChv+/790eqb+ST+khrvK979/YjuY4eVq+T5wKGjlf49xln7/ND8S2AmuM3L7+vR/dm159a6c3u7ZeeS3MNM6+mkVWuw/PmtlXvjiaCkqKS+1f79k0R/wa+rx/ui+7b////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+PVuHDgAAAAlwSFlzAAALEgAACxIB0t1+/AAAIABJREFUeNrtvQlcVPe5+H1g5sMsyBBZ4xCGLSJLwctWpFJA/iii0sSlVo0hZjOJS5Kqrb02e5q0vfflEwQUCWKwYlJCEkbFIWgbpjGTxBpZGhUpKpsCsijB3aQ37/P8zpkFmHNmRUDPE0U0OsDwnWdfKOruFRG1dCnlQPHCy9iIgErbQEn454GXMRIJ9XYc/yzwMoYSmMg/B7yMoaRH+VFC/mngZazkT7fdwRPkhZcxkvWtwRAL88LL2MQgovWX5/FhMC/UWKUBw2LOZ/AA8kKNVRrQvbcklgeQlzHTgMGt5X/iAeRlzACc3Z7PA8jL2AG44LI0fgafCORlrKLgeT3yW0F8HoaXsQIw44LiIg8gL2MG4NpLitZZPIC8jBmA5xVdy3gAeRkrAP/0nvTCKh5AXsYOQMWlDTyAvIyJCKnpUTKv83/kAeSFGps0YNAthVddkgcl5p8MXsYEwGipWjF3Op+J5mVsAAy4qFApovmeaF7GrBdBmifrdeedQF7GBsBpXQBgqw8PIC9jA+C8dgCwazY/FcLL2AA4p0daLr28gAeQl7EBcNUFqUp64Q3eBPMyNgC+fUmqKr30R74llZexA1ClifPlM9G8jIGIqVfOqwDA+DA+EciLGbwI7M2fb3oJAKi47W3/KETII03djd0D9n20GZvqVWqV4qKP3QEUS3ijftfZy0gfDzsDOL1vTzkA2DrN3gAKqTC+vnfXRQz+/2vfkoWQ8m/bk69SSS/bG0Ax5bImjc/tUHdd//xcf3uqFRHsRZCWA4AXNtsZQJg3nsvX9+4+Feh9e609M3bQi9CMAJZeWmXfRCCQfStxMp/aues0oHNqb7AddZWAmtUlLy9XldYF2rUlVUxNDmydwye370IC5/fAPlOJ/QCcfVkKAOaXpLrYE0AJNburOYC3wNTdt8vK++LAWwK7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";

  function generateResponsesPdf() {
    if (!window.jspdf) {
      alert("Sorry, the PDF tool did not load. Please refresh the page and try again.");
      return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var moduleTitle = getModuleTitle();
    var date = new Date().toLocaleDateString("en-ZA");
    var margin = 16;
    var maxTextWidth = pageWidth - margin * 2;

    function drawHeader() {
      doc.setFillColor(6, 72, 70);
      doc.rect(0, 0, pageWidth, 26, "F");
    }

    function checkPageBreak(y, needed) {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        return 20;
      }
      return y;
    }

    function renderPdf(logoDataUrl) {
      drawHeader();

      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", margin, 6, 32, 14);
        } catch (err) {
          console.warn("Could not add logo to PDF:", err);
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("My Responses", pageWidth - margin, 12, { align: "right" });
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text("Downloaded on " + date, pageWidth - margin, 18, { align: "right" });

      var y = 40;

      doc.setTextColor(6, 72, 70);
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      var titleLines = doc.splitTextToSize(sanitizeForPdf(moduleTitle), maxTextWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 7 + 6;

      var sections = collectAllResponses();

      sections.forEach(function (section) {
        y = checkPageBreak(y, 20);

        doc.setFillColor(242, 238, 235);
        doc.rect(margin, y - 6, maxTextWidth, 10, "F");
        doc.setTextColor(6, 72, 70);
        doc.setFontSize(13);
        doc.setFont(undefined, "bold");
        doc.text(sanitizeForPdf(section.title), margin + 3, y + 1);
        y += 14;

        section.qa.forEach(function (pair) {
          var questionLines = doc.splitTextToSize(sanitizeForPdf(pair.question), maxTextWidth);
          var answerLines = doc.splitTextToSize(sanitizeForPdf(String(pair.answer)), maxTextWidth - 4);
          var blockHeight = questionLines.length * 5.5 + answerLines.length * 5.5 + 10;

          y = checkPageBreak(y, blockHeight);

          doc.setTextColor(6, 72, 70);
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.text(questionLines, margin, y);
          y += questionLines.length * 5.5 + 2;

          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          doc.setFont(undefined, "normal");
          doc.text(answerLines, margin + 4, y);
          y += answerLines.length * 5.5 + 8;
        });

        section.tables.forEach(function (tableData) {
          y = checkPageBreak(y, 24);

          var cleanHeaders = tableData.headers.map(sanitizeForPdf);
          var cleanRows = tableData.rows.map(function (row) {
            return row.map(sanitizeForPdf);
          });

          doc.autoTable({
            startY: y,
            margin: { left: margin, right: margin },
            head: cleanHeaders.length ? [cleanHeaders] : undefined,
            body: cleanRows,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50], overflow: "linebreak" },
            headStyles: { fillColor: [6, 72, 70], textColor: [255, 255, 255], fontStyle: "bold" },
            alternateRowStyles: { fillColor: [242, 238, 235] },
          });

          y = doc.lastAutoTable.finalY + 12;
        });

        y += 4;
      });

      if (!sections.length) {
        doc.setFontSize(11);
        doc.setTextColor(95, 95, 95);
        doc.text("Azikho izimpendulo ezitholakele ezingafakwa kule PDF.", margin, y);
      }

      var pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "Page " + i + " of " + pageCount,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      var safeName = moduleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      doc.save(safeName + "_my_responses.pdf");
    }

    renderPdf(VUKA_LOGO_DATA_URL);
  }

  // ---- Wire it up ----
  // The pop-up celebrates finishing the page DURING this visit. Badges are saved in
  // the browser, so a visitor who already finished earlier just gets the download
  // button when the page loads (no pop-up). No saved "already shown" flag is used,
  // so an old test run can never silence the pop-up.
  var wasCompleteOnLoad = allComplete();
  var handledCompletion = false;

  function checkCompletion() {
    if (handledCompletion || !allComplete()) return;
    if (document.getElementById("downloadResponsesBtn")) return;
    handledCompletion = true;

    if (wasCompleteOnLoad) {
      addDownloadButton();
    } else {
      showCongratsToast();
      setTimeout(addDownloadButton, 4500);
    }
  }

  checkCompletion(); // returning visitors who already finished: download button only
  document.addEventListener("change", checkCompletion);
  document.addEventListener("click", function () {
    setTimeout(checkCompletion, 50);
  });
})();