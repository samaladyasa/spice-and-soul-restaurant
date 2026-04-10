"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const FOOD_CHARS = ["🍛","🌶️","🍚","🫓","🍰","🥘","🧁","🍵","🥗","🍢","🫕","🍋","🍩","🧈","🍪","🥧"];

const FOOD_MEMES: Record<string, string[]> = {
  "🍛": ["Curry is bae 😍", "Main character energy", "No curry no life", "Sheesh that's fire 🔥"],
  "🌶️": ["It's getting hot 🥵", "Spice level: god", "Bro chose violence 🔥", "Too hot to handle"],
  "🍚": ["Rice supremacy 🙏", "No rice no life", "Certified rice enjoyer", "Carbs go brr"],
  "🫓": ["Naan-stop vibes 🙌", "Bread but legendary", "Naan > everything", "Absolute unit"],
  "🍰": ["Slay-ke 🎂", "It’s giving dessert", "Core memory unlocked", "Sugar rush bussin"],
  "🥘": ["Stew-pendous 💯", "Comfort in a bowl", "Hits different at night", "10/10 no cap"],
  "🧁": ["Cupcake era 🧁", "Smol but deadly sweet", "Serotonin boost", "Treat yourself king"],
  "🍵": ["Sip sip hooray ☕", "Tea is the way", "Chai supremacy", "Certified vibe check"],
  "🥗": ["Healthy queen 💅", "Grass never tasted so good", "Green flag fr", "salad era"],
  "🍢": ["Skewer me timbers 🏴‍☠️", "Grill master flex", "Kebab go crazy", "Smoky perfection"],
  "🫕": ["Hot pot supremacy", "Warm hug in a pot", "Stew-pid good 🤤", "That pot be bussin"],
  "🍋": ["When life gives lemons", "Sour power ⚡", "Lemon-ade your day", "Zesty queen"],
  "🍩": ["Donut worry be happy", "Hole lotta flavor", "Glaze & praise 🙏", "Donut king"],
  "🧈": ["Butter believe it 🧑", "Smooth operator", "Butter makes it better", "Slide into flavor"],
  "🍪": ["That’s one tough cookie", "Crispy legend 🍪", "Cookie monster mode", "Snack attack"],
  "🥧": ["Easy as pie 🥧", "Slice of heaven", "Pie-fection", "Crusty & trusty"],
};
const GENERIC_MEMES = ["Bussin fr fr 💯","No cap that slaps","W food 🌟","Absolutely goated","Main character meal","Peak flavor unlocked"];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const foodRefs = useRef<HTMLSpanElement[]>([]);
  const textZoneRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const COUNT = 14;
    const container = hero.querySelector(".food-flyers") as HTMLElement;
    if (!container) return;

    container.innerHTML = "";
    foodRefs.current = [];

    interface Critter {
      el: HTMLSpanElement;
      x: number; y: number;
      vx: number; vy: number;
      wobble: number; wobbleSpeed: number;
      size: number;
      renderX: number; renderY: number; renderScale: number; renderOpacity: number;
      baseOpacity: number;
      dead: boolean;
    }
    const critters: Critter[] = [];
    const w = () => hero.offsetWidth;
    const h = () => hero.offsetHeight;

    const layers = [
      { count: 4, sizeMin: 16, sizeMax: 22, speed: 0.3, opacity: 0.3, blur: 2, className: "food-critter layer-back" },
      { count: 6, sizeMin: 24, sizeMax: 32, speed: 0.55, opacity: 0.7, blur: 0, className: "food-critter layer-mid" },
      { count: 4, sizeMin: 34, sizeMax: 44, speed: 0.8, opacity: 0.9, blur: 0, className: "food-critter layer-front" },
    ];
    let idx = 0;

    for (const layer of layers) {
    for (let li = 0; li < layer.count; li++, idx++) {
      const i = idx;
      const el = document.createElement("span");
      el.className = layer.className;
      const emoji = FOOD_CHARS[Math.floor(Math.random() * FOOD_CHARS.length)];
      el.innerHTML = `<span class="critter-glow"></span><span class="critter-emoji">${emoji}</span>`;
      el.dataset.emoji = emoji;
      const size = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
      el.style.fontSize = size + "px";
      el.style.opacity = "0";
      if (layer.blur) el.style.filter = `blur(${layer.blur}px)`;
      container.appendChild(el);
      foodRefs.current.push(el);
      setTimeout(() => { el.style.transition = "opacity 0.8s ease"; el.style.opacity = String(layer.opacity); }, 200 + i * 120);

      const startX = Math.random() * w();
      const startY = Math.random() * h();
      const critter: Critter = {
        el,
        x: startX, y: startY,
        vx: (Math.random() - 0.5) * layer.speed,
        vy: (Math.random() - 0.5) * layer.speed,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.012 + Math.random() * 0.015,
        size,
        renderX: startX, renderY: startY, renderScale: 1, renderOpacity: layer.opacity,
        baseOpacity: layer.opacity,
        dead: false,
      };
      critters.push(critter);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (critter.dead) return;
        critter.dead = true;
        const cx = critter.renderX;
        const cy = critter.renderY;

        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = `translate(${cx}px, ${cy}px) scale(0)`;

        const ring = document.createElement("span");
        ring.className = "burst-ring";
        ring.style.left = cx + "px";
        ring.style.top = cy + "px";
        hero.appendChild(ring);
        setTimeout(() => ring.remove(), 800);

        const currentEmoji = el.dataset.emoji || "";
        const pool = FOOD_MEMES[currentEmoji] || GENERIC_MEMES;
        const word = document.createElement("span");
        word.className = "burst-word";
        word.textContent = pool[Math.floor(Math.random() * pool.length)];
        word.style.left = cx + "px";
        word.style.top = cy + "px";
        hero.appendChild(word);

        const burstItems = ["✨","💫","⭐","🌟","💛","🧡"];
        for (let j = 0; j < 8; j++) {
          const spark = document.createElement("span");
          spark.className = "food-spark";
          spark.textContent = burstItems[Math.floor(Math.random() * burstItems.length)];
          const angle = (j / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          const dist = 30 + Math.random() * 40;
          spark.style.setProperty("--sx", Math.cos(angle) * dist + "px");
          spark.style.setProperty("--sy", Math.sin(angle) * dist + "px");
          spark.style.left = cx + "px";
          spark.style.top = cy + "px";
          spark.style.animationDelay = (j * 0.04) + "s";
          hero.appendChild(spark);
          setTimeout(() => spark.remove(), 1000);
        }

        setTimeout(() => {
          word.remove();
          const respX = Math.random() * w();
          critter.x = respX;
          critter.y = -40;
          critter.renderX = respX;
          critter.renderY = -40;
          critter.vx = (Math.random() - 0.5) * layer.speed;
          critter.vy = 0.25 + Math.random() * 0.4;
          const newEmoji = FOOD_CHARS[Math.floor(Math.random() * FOOD_CHARS.length)];
          el.innerHTML = `<span class="critter-glow"></span><span class="critter-emoji">${newEmoji}</span>`;
          el.dataset.emoji = newEmoji;
          el.style.transition = "none";
          el.style.opacity = "0";
          el.style.transform = `translate(${respX}px, -40px) scale(0.6)`;
          critter.dead = false;
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.8s ease-in";
            el.style.opacity = String(layer.opacity);
          });
        }, 1200);
      });
    }
    }

    let raf = 0;
    const heroContent = hero.querySelector(".hero-content") as HTMLElement;
    const updateTextZone = () => {
      if (heroContent) {
        const heroRect = hero.getBoundingClientRect();
        const contentRect = heroContent.getBoundingClientRect();
        textZoneRef.current = new DOMRect(
          contentRect.left - heroRect.left - 30,
          contentRect.top - heroRect.top - 20,
          contentRect.width + 60,
          contentRect.height + 40
        );
      }
    };
    updateTextZone();
    window.addEventListener("resize", updateTextZone);

    const LERP = 0.06; // smoothing factor (lower = smoother/slower follow)
    const tick = () => {
      const W = w();
      const H = h();
      const tz = textZoneRef.current;
      for (const c of critters) {
        if (c.dead) continue;
        c.wobble += c.wobbleSpeed;
        c.x += c.vx + Math.sin(c.wobble) * 0.25;
        c.y += c.vy + Math.cos(c.wobble * 0.7) * 0.2;

        if (c.x < -40) c.x = W + 30;
        if (c.x > W + 40) c.x = -30;
        if (c.y < -40) c.y = H + 30;
        if (c.y > H + 40) c.y = -30;

        c.renderX += (c.x - c.renderX) * LERP;
        c.renderY += (c.y - c.renderY) * LERP;

        let targetScale = 1;
        let targetOpacity = c.baseOpacity;
        if (tz && c.renderX > tz.x && c.renderX < tz.x + tz.width && c.renderY > tz.y && c.renderY < tz.y + tz.height) {
          const zx = tz.x + tz.width / 2;
          const zy = tz.y + tz.height / 2;
          const dx = Math.abs(c.renderX - zx) / (tz.width / 2);
          const dy = Math.abs(c.renderY - zy) / (tz.height / 2);
          const closeness = 1 - Math.max(dx, dy);
          targetScale = 1 - closeness * 0.65;
          targetOpacity = 0.12 + (1 - closeness) * 0.5;
        }
        c.renderScale += (targetScale - c.renderScale) * 0.08;
        c.renderOpacity += (targetOpacity - c.renderOpacity) * 0.06;

        const rot = Math.sin(c.wobble) * 8;
        const scl = (1 + Math.sin(c.wobble * 1.3) * 0.04) * c.renderScale;
        const bob = Math.sin(c.wobble * 0.6) * 2;
        c.el.style.transform = `translate(${c.renderX}px, ${c.renderY + bob}px) rotate(${rot}deg) scale(${scl})`;
        c.el.style.opacity = String(c.renderOpacity);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateTextZone);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <header className="hero" ref={heroRef}>
        <div className="food-flyers" aria-hidden />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tagline animate-hero-tag">
            ✦ EST. 2020 &bull; AUTHENTIC INDIAN CUISINE ✦
          </span>
          <h1 className="animate-hero-title">
            Taste the Soul<br />of India
          </h1>
          <p className="hero-subtitle animate-hero-subtitle">
            Authentic flavors, traditional recipes, and a dining experience
            you&apos;ll never forget.
          </p>
          <div className="hero-buttons animate-hero-buttons">
            <Link href="/services" className="btn-primary">
              View Our Menu
            </Link>
            <Link href="/contact" className="btn-secondary">
              Book a Table
            </Link>
          </div>
          <div className="hero-scroll-hint animate-hero-scroll">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </div>
      </header>

      <section className="features">
        <div className="features-header scroll-reveal">
          <h2>Why Spice &amp; Soul?</h2>
          <p>Three reasons guests keep coming back</p>
        </div>
        <div className="features-grid">
          <div className="feature-box scroll-reveal" style={{ transitionDelay: "0s" }}>
            <div className="feature-icon-wrap">
              <div className="feature-icon">🌿</div>
            </div>
            <h3>Fresh Ingredients</h3>
            <p>
              We source our spices directly from farms to ensure the richest
              aroma.
            </p>
          </div>
          <div className="feature-box scroll-reveal" style={{ transitionDelay: "0.15s" }}>
            <div className="feature-icon-wrap">
              <div className="feature-icon">🔥</div>
            </div>
            <h3>Traditional Recipes</h3>
            <p>
              Our chefs use secret recipes passed down through generations.
            </p>
          </div>
          <div className="feature-box scroll-reveal" style={{ transitionDelay: "0.3s" }}>
            <div className="feature-icon-wrap">
              <div className="feature-icon">🛵</div>
            </div>
            <h3>Fast Delivery</h3>
            <p>
              Hot and fresh food delivered right to your doorstep in 30 minutes.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section scroll-reveal">
        <div className="cta-inner">
          <span className="cta-badge">Don&apos;t Miss Out</span>
          <h2>Ready to eat?</h2>
          <p>Order online now or reserve your spot for dinner.</p>
          <Link href="/contact" className="btn-white">
            Reserve a Table
          </Link>
        </div>
      </section>
    </>
  );
}
