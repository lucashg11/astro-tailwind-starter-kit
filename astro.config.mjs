// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// Cambia esto por el dominio real del sitio migrado.
// `site` es imprescindible para sitemap, canonical y Open Graph.
const SITE = 'https://www.example.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    sitemap(),
    icon({
      // Iconos vía Iconify (Phosphor). Cero SVG a mano.
      // Uso: <Icon name="ph:list-bold" />
      iconDir: 'src/assets/icons',
    }),
  ],
  vite: {
    // `@tailwindcss/vite` resuelve una major de vite distinta a la que usa
    // astro, así que sus tipos de plugin no coinciden. El cast evita el falso
    // error en `astro check` sin cambiar nada en el build.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  image: {
    // Habilita el procesamiento de imágenes remotas si migras assets externos.
    // Añade aquí los dominios permitidos.
    domains: [],
  },
});
