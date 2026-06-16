/* ============================================================
   SureGut LLC — interactions & animations
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
    "use strict";

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- Sticky nav: add backdrop once scrolled ---- */
    var nav = document.getElementById("nav");
    function onScroll() {
        if (!nav) return;
        nav.classList.toggle("scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Scroll-reveal via IntersectionObserver ---- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

    if (prefersReduced || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, i) {
                if (entry.isIntersecting) {
                    // small stagger for groups revealing together
                    var delay = Math.min(i * 70, 210);
                    setTimeout(function () {
                        entry.target.classList.add("is-visible");
                    }, delay);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

        revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---- Animated stat counters ---- */
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        if (prefersReduced) { el.textContent = target + suffix; return; }

        var duration = 1100;
        var start = null;
        function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            // easeOutCubic
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window && counters.length) {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { countObserver.observe(el); });
    } else {
        counters.forEach(animateCount);
    }

    /* ---- Subtle pointer-reactive glow on the product card ---- */
    if (!prefersReduced) {
        var card = document.querySelector(".product-card");
        if (card) {
            card.addEventListener("pointermove", function (e) {
                var rect = card.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
                var y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
                card.style.transform = "translateY(-6px) rotateX(" + (-y) + "deg) rotateY(" + x + "deg)";
            });
            card.addEventListener("pointerleave", function () {
                card.style.transform = "";
            });
        }
    }

    /* ---- Smooth-scroll for in-page anchors (older browsers) ---- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            var id = link.getAttribute("href");
            if (id.length < 2) return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
        });
    });
})();
