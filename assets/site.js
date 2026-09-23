/* Assembly Stats Data. Progressive enhancement only: every page works without this file.
   1. Copy buttons  2. TOC current section */
(function () {
  var d = document, each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  var buttons = d.querySelectorAll('[data-copy], [data-copy-target]');
  if (buttons.length) {
    var live = d.createElement('p');
    live.className = 'vh';
    live.setAttribute('role', 'status');
    d.body.appendChild(live);
    var say = function (m) { live.textContent = ''; setTimeout(function () { live.textContent = m; }, 50); };
    var flash = function (btn, text) { // the visible half of the feedback; the status region is the spoken half
      var label = btn.textContent;
      btn.setAttribute('data-done', '');
      btn.textContent = text;
      setTimeout(function () { btn.textContent = label; btn.removeAttribute('data-done'); }, 1600);
    };
    var done = function (btn, ok, source) {
      if (ok) { say('복사했습니다'); return flash(btn, '복사했습니다'); }
      if (!source) { say('복사하지 못했습니다'); return flash(btn, '복사하지 못했습니다'); }
      var r = d.createRange(); r.selectNodeContents(source); // no clipboard: select the text instead
      getSelection().removeAllRanges(); getSelection().addRange(r);
      say('선택했습니다. 직접 복사해 주세요.');
      flash(btn, '선택했습니다');
    };
    each(buttons, function (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        if (btn.hasAttribute('data-done')) return;
        var id = btn.getAttribute('data-copy-target');
        var source = id ? d.getElementById(id) : btn.previousElementSibling;
        var text = btn.getAttribute('data-copy') || (source ? source.textContent : '');
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { done(btn, true); }, function () { done(btn, false, source); });
        } else done(btn, false, source);
      });
    });
  }

  var toc = d.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {}, sections = [], current;
    each(toc.querySelectorAll('a[href^="#"]'), function (a) {
      var el = d.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (el) { links[el.id] = a; sections.push(el); }
    });
    var update = function () { // last section above the 30% line (the last one at the page end)
      var next = null;
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= innerHeight * 0.3) next = s; });
      if (innerHeight + scrollY >= d.documentElement.scrollHeight - 2) next = sections[sections.length - 1];
      if (next === current) return;
      if (current) links[current.id].removeAttribute('aria-current');
      if (next) links[next.id].setAttribute('aria-current', 'true');
      current = next;
    };
    var io = new IntersectionObserver(update, { rootMargin: '0px 0px -70% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    var end = d.querySelector('.site-footer');
    if (end) new IntersectionObserver(update, { threshold: [0, 1] }).observe(end);
    addEventListener('hashchange', update);
    update();
  }
})();
