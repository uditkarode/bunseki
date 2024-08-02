// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { strict: true },
  modules: ["@nuxtjs/google-fonts", "@nuxtjs/tailwindcss"],
  googleFonts: {
    preconnect: true,
    prefetch: true,
    preload: true,
    display: "swap",
    families: {
      "IBM Plex Sans": true,
      "Noto Serif JP": true,
    },
  },
});
