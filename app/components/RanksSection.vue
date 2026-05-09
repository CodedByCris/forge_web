<script setup lang="ts">
import bronzeImg from "~/assets/ranks/bronze.svg";
import diamondImg from "~/assets/ranks/diamond.svg";
import emeraldImg from "~/assets/ranks/emerald.svg";
import goldImg from "~/assets/ranks/gold.svg";
import ironImg from "~/assets/ranks/iron.svg";
import platinumImg from "~/assets/ranks/platinum.svg";
import silverImg from "~/assets/ranks/silver.svg";
import woodImg from "~/assets/ranks/wood.svg";

const ranks = [
  {
    name: "Madera",
    img: woodImg,
    color: "#7A4E2D",
    glow: "rgba(122,78,45,0.35)",
    tier: 1,
  },
  {
    name: "Hierro",
    img: ironImg,
    color: "#6E6E7A",
    glow: "rgba(110,110,122,0.35)",
    tier: 2,
  },
  {
    name: "Bronce",
    img: bronzeImg,
    color: "#C4863A",
    glow: "rgba(196,134,58,0.35)",
    tier: 3,
  },
  {
    name: "Plata",
    img: silverImg,
    color: "#A0A0B4",
    glow: "rgba(160,160,180,0.35)",
    tier: 4,
  },
  {
    name: "Oro",
    img: goldImg,
    color: "#FFD700",
    glow: "rgba(255,215,0,0.4)",
    tier: 5,
  },
  {
    name: "Platino",
    img: platinumImg,
    color: "#7EC8D8",
    glow: "rgba(126,200,216,0.4)",
    tier: 6,
  },
  {
    name: "Diamante",
    img: diamondImg,
    color: "#4DBBFF",
    glow: "rgba(77,187,255,0.45)",
    tier: 7,
  },
  {
    name: "Esmeralda",
    img: emeraldImg,
    color: "#00C878",
    glow: "rgba(0,200,120,0.45)",
    tier: 8,
  },
];

onMounted(() => {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
});
</script>

<template>
  <section
    class="py-24 px-4"
    style="background: #0f0f0f; border-top: 1px solid #2a2a2a"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 reveal">
        <p
          class="text-forge-primary text-sm font-semibold uppercase tracking-widest mb-3"
        >
          Sistema de rangos
        </p>
        <h2 class="text-4xl sm:text-5xl font-black tracking-tight">
          Demuestra tu nivel.<br />
          <span class="text-gradient-orange">Escala la clasificación.</span>
        </h2>
        <p
          class="text-forge-muted mt-5 max-w-xl mx-auto text-base leading-relaxed"
        >
          Cada entreno suma XP. Sube de rango compitiendo en Modo Ranked y
          demostrando que eres el más constante del gym.
        </p>
      </div>

      <!-- Ranks grid -->
      <div
        class="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-3"
      >
        <div
          v-for="(rank, i) in ranks"
          :key="rank.name"
          :class="`reveal reveal-delay-${i}`"
        >
          <div
            class="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-forge-divider transition-all duration-300 hover:scale-105 cursor-default"
            style="background: #141414"
            :style="`--rank-glow: ${rank.glow}; --rank-color: ${rank.color}`"
          >
            <!-- Badge -->
            <div
              class="relative w-16 h-20 flex items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_16px_var(--rank-glow)]"
            >
              <img
                :src="rank.img"
                :alt="rank.name"
                class="w-full h-full object-contain"
                draggable="false"
              />
              <!-- Tier glow bg -->
              <div
                class="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                :style="`background: ${rank.color}`"
              />
            </div>

            <!-- Name -->
            <span
              class="text-xs font-bold uppercase tracking-wider transition-colors duration-200"
              :style="`color: ${rank.color}`"
            >
              {{ rank.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Progression bar -->
      <div class="mt-12 reveal">
        <div class="flex items-center gap-0 h-2 rounded-full overflow-hidden">
          <div class="flex-1 h-full" style="background: #7a4e2d" />
          <div class="flex-1 h-full" style="background: #6e6e7a" />
          <div class="flex-1 h-full" style="background: #c4863a" />
          <div class="flex-1 h-full" style="background: #a0a0b4" />
          <div class="flex-1 h-full" style="background: #ffd700" />
          <div class="flex-1 h-full" style="background: #7ec8d8" />
          <div class="flex-1 h-full" style="background: #4dbbff" />
          <div class="flex-1 h-full" style="background: #00c878" />
        </div>
        <div class="flex justify-between mt-2">
          <span class="text-forge-muted text-xs">Madera</span>
          <span class="text-xs font-semibold" style="color: #00c878"
            >Esmeralda</span
          >
        </div>
      </div>
    </div>
  </section>
</template>
