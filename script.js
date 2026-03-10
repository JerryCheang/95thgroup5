document.addEventListener("DOMContentLoaded", () => {
    setupScrollReveal();
    setupActiveNav();
    setupBackToTop();
    setupImageLightbox();
    setupScrollProgress();
    setupNavRipple();
    setupDataCountUp();
    setupHeroParallax();
});

function setupScrollReveal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll(
        ".hero, .Show, .Video, .ContentSection, .SDG, .FloorPlan, .Sustainable_Feature, .DataSurvey, .SDG li, .feature-card, .DataSurvey figure, .data-highlights article"
    );

    targets.forEach((el) => el.classList.add("js-reveal"));

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        targets.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    // Fallback: if observer callback does not run in time, keep content visible.
    window.setTimeout(() => {
        targets.forEach((el) => el.classList.add("is-visible"));
    }, 1500);
}

function setupActiveNav() {
    const links = Array.from(document.querySelectorAll(".site-nav a"));
    if (!links.length) return;

    const orderedIds = links
        .map((link) => link.getAttribute("href")?.replace("#", ""))
        .filter(Boolean);

    const sections = orderedIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (!sections.length) return;

    const setActive = (id) => {
        links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
    };

    links.forEach((link) => {
        const id = link.getAttribute("href")?.replace("#", "");
        if (!id) return;
        link.addEventListener("click", () => setActive(id));
    });

    let ticking = false;
    const updateActiveByScroll = () => {
        const header = document.querySelector("header");
        const headerOffset = (header ? header.offsetHeight : 0) + 20;
        const y = window.scrollY + headerOffset;

        let activeId = sections[0].id;
        for (const section of sections) {
            if (section.offsetTop <= y) {
                activeId = section.id;
            } else {
                break;
            }
        }

        setActive(activeId);
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            updateActiveByScroll();
            ticking = false;
        });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActiveByScroll);
    onScroll();
}

function setupBackToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.textContent = "Top";
    document.body.appendChild(button);

    const toggleButton = () => {
        button.classList.toggle("is-visible", window.scrollY > 520);
    };

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function setupImageLightbox() {
    const images = Array.from(document.querySelectorAll(".FloorPlan img, .DataSurvey img"));
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
        <button class="lightbox-nav prev" type="button" aria-label="Previous image">&#10094;</button>
        <figure class="lightbox-figure">
            <img class="lightbox-image" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button class="lightbox-nav next" type="button" aria-label="Next image">&#10095;</button>
    `;
    document.body.appendChild(overlay);

    const imageEl = overlay.querySelector(".lightbox-image");
    const captionEl = overlay.querySelector(".lightbox-caption");
    const closeBtn = overlay.querySelector(".lightbox-close");
    const prevBtn = overlay.querySelector(".lightbox-nav.prev");
    const nextBtn = overlay.querySelector(".lightbox-nav.next");
    let currentIndex = 0;

    const render = (index) => {
        const item = images[index];
        imageEl.src = item.src;
        imageEl.alt = item.alt || "Expanded image";
        captionEl.textContent = item.alt || "";
    };

    const open = (index) => {
        currentIndex = index;
        render(currentIndex);
        overlay.classList.add("open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    };

    const close = () => {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    };

    const next = () => {
        currentIndex = (currentIndex + 1) % images.length;
        render(currentIndex);
    };

    const prev = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        render(currentIndex);
    };

    images.forEach((img, idx) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => open(idx));
    });

    closeBtn.addEventListener("click", close);
    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    document.addEventListener("keydown", (event) => {
        if (!overlay.classList.contains("open")) return;
        if (event.key === "Escape") close();
        if (event.key === "ArrowRight") next();
        if (event.key === "ArrowLeft") prev();
    });
}

function setupScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        bar.style.transform = `scaleX(${ratio})`;
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
}

function setupNavRipple() {
    const links = document.querySelectorAll(".site-nav a");
    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const rect = link.getBoundingClientRect();
            const ripple = document.createElement("span");
            ripple.className = "nav-ripple";
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;
            link.appendChild(ripple);

            window.setTimeout(() => ripple.remove(), 500);
        });
    });
}

function setupDataCountUp() {
    const items = Array.from(document.querySelectorAll(".data-highlights h3"));
    if (!items.length || !("IntersectionObserver" in window)) return;

    const parseValue = (text) => {
        const clean = text.replace(/,/g, "");
        const match = clean.match(/(\d+)(?:-(\d+))?/);
        if (!match) return null;
        const start = Number.parseInt(match[1], 10);
        const end = match[2] ? Number.parseInt(match[2], 10) : start;
        const suffix = text.replace(/^[\d,\-\s]+/, "").trim();
        return { start, end, suffix, isRange: Boolean(match[2]) };
    };

    const animateNumber = (el) => {
        const raw = el.textContent ? el.textContent.trim() : "";
        const parsed = parseValue(raw);
        if (!parsed) return;

        const duration = 1100;
        const startTime = performance.now();
        const from = Math.max(0, Math.floor(parsed.start * 0.7));
        const to = parsed.end;

        const tick = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = Math.round(from + (to - from) * eased);

            if (parsed.isRange) {
                const minCurrent = Math.max(parsed.start, current - (parsed.end - parsed.start));
                el.textContent = `${minCurrent.toLocaleString()}-${current.toLocaleString()}${parsed.suffix ? ` ${parsed.suffix}` : ""}`;
            } else {
                el.textContent = `${current.toLocaleString()}${parsed.suffix ? ` ${parsed.suffix}` : ""}`;
            }

            if (t < 1) {
                window.requestAnimationFrame(tick);
            } else {
                el.textContent = raw;
            }
        };

        window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.6 }
    );

    items.forEach((item) => observer.observe(item));
}

function setupHeroParallax() {
    const frame = document.querySelector(".hero-model .model-frame");
    const wrapper = document.querySelector(".hero-model");
    if (!frame || !wrapper) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let raf = 0;
    const setTransform = (x, y) => {
        const rotateY = ((x - 0.5) * 4).toFixed(2);
        const rotateX = ((0.5 - y) * 3).toFixed(2);
        frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    };

    wrapper.addEventListener("mousemove", (event) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(() => setTransform(x, y));
    });

    wrapper.addEventListener("mouseleave", () => {
        frame.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
}