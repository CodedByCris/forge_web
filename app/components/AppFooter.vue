<template>
  <footer
    class="py-16 px-4"
    style="background: #0a0a0a; border-top: 1px solid #2a2a2a"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Top row -->
      <div class="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 mb-12">
        <!-- Brand -->
        <div class="flex flex-col items-center lg:items-start gap-2">
          <span class="text-3xl font-black text-gradient-orange">Forge</span>
          <span class="text-forge-muted text-sm">Entrena. Progresa. Compite.</span>
        </div>

        <!-- Contact -->
        <div class="flex flex-col items-center lg:items-start gap-3">
          <p class="text-forge-text text-xs font-semibold uppercase tracking-widest mb-1">Contacto</p>
          <a
            href="mailto:codedbycris@gmail.com"
            class="flex items-center gap-2 text-forge-muted text-sm hover:text-forge-accent transition-colors duration-200"
          >
            <!-- Mail icon -->
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            codedbycris@gmail.com
          </a>
        </div>

        <!-- Síguenos -->
        <!-- <div class="flex flex-col items-center lg:items-start gap-3">
          <p class="text-forge-text text-xs font-semibold uppercase tracking-widest mb-1">Síguenos</p>
          <div class="flex items-center gap-4">
            <!~~ Instagram ~~>
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-forge-muted text-sm hover:text-forge-accent transition-colors duration-200 group"
              aria-label="Instagram"
            >
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style="background: #1A1A1A; border: 1px solid #2A2A2A"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </span>
              Instagram
            </a>

            <!~~ TikTok ~~>
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-forge-muted text-sm hover:text-forge-accent transition-colors duration-200 group"
              aria-label="TikTok"
            >
              <span
                class="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style="background: #1A1A1A; border: 1px solid #2A2A2A"
              >
                <svg width="16" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.8 1.54V6.78a4.85 4.85 0 0 1-1.03-.09z"/>
                </svg>
              </span>
              TikTok
            </a>
          </div>
        </div> -->
      </div>

      <!-- Divider -->
      <div class="w-full h-px mb-8" style="background: #2A2A2A" />

      <!-- Bottom row -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-forge-muted text-xs">© 2026 Coded by Criss</p>
        <p class="text-forge-muted text-xs">Hecho con ❤️ para los que no se rinden</p>
      </div>
    </div>
  </footer>
</template>
