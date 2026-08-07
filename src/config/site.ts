/**
 * Fuente única de verdad para los datos del sitio.
 * Al migrar un sitio estático, edita SOLO este archivo para
 * cambiar marca, navegación, SEO por defecto y redes sociales.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Icono opcional de Phosphor, p. ej. "ph:house". */
  icon?: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Icono de Phosphor, p. ej. "ph:github-logo". */
  icon: string;
}

export const site = {
  /** Nombre de la marca / sitio. */
  name: 'Starter Kit',
  /** Título por defecto para la etiqueta <title> y OG. */
  title: 'Astro + Tailwind Starter Kit',
  /** Plantilla de título: %s se reemplaza por el título de página. */
  titleTemplate: '%s · Starter Kit',
  /** Descripción por defecto (meta description / OG). */
  description:
    'Template base para migrar sitios estáticos a Astro + Tailwind con tokens de diseño, SEO y componentes reutilizables.',
  /** Idioma del documento. */
  locale: 'es_ES',
  lang: 'es',
  /** Debe coincidir con `site` en astro.config.mjs. */
  url: 'https://www.example.com',
  /** Imagen social por defecto (ruta en /public o import de asset). */
  defaultOgImage: '/og-default.png',
  /** Autor / organización para metadatos. */
  author: 'Tu Nombre',
  /** @handle de Twitter/X sin la arroba, opcional. */
  twitter: 'starterkit',
  themeColor: '#4f46e5',
} as const;

export const mainNav: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Características', href: '/#features' },
  { label: 'Contacto', href: '/#contact' },
];

export const footerNav: NavItem[] = [
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Términos', href: '/terminos' },
];

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com', icon: 'ph:github-logo' },
  { label: 'X', href: 'https://x.com', icon: 'ph:x-logo' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'ph:linkedin-logo' },
];
