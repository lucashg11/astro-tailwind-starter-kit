# Astro + Tailwind Starter Kit — Metodología de uso

Template base para **migrar sitios estáticos** (HTML/CSS/JS vanilla) a
[Astro](https://astro.build) + [Tailwind CSS v4](https://tailwindcss.com), con
tokens de diseño, SEO, pipeline de imágenes WebP y componentes reutilizables.

Este documento describe **cómo trabajar** con el kit: convenciones, flujo de
migración y —en detalle— **cómo implementar el pipeline de imágenes cuando un
componente renderiza más de un `OptimizedImage`**.

---

## 1. Principios de trabajo

1. **Una fuente de verdad por dominio.**
   Marca, navegación, SEO y redes viven en [`src/config/site.ts`](src/config/site.ts).
   Los tokens visuales, en[`src/styles/global.css`](src/styles/global.css) (`@theme`).
   No repartas estos datos por las páginas.
2. **Componentes declarativos, cero duplicados.**
   Si necesitas una variante, añade una **prop** al componente existente;
   no crees `Button2`, `CardGrande`, etc.
3. **Composición, no copia.**
4. Una página se arma combinando `Section`, `Hero`, `Card`, `Form`…
   No copies markup entre páginas.
5. **Estilos con tokens.**
   Usa utilidades derivadas de los tokens (`bg-brand-600`, `rounded-card`, `py-section`)
   en vez de valores mágicos.
6. **Imágenes siempre por el pipeline.**
   Nunca uses `<img src="...">` para assets locales;
   pasa por `OptimizedImage` (ver §5 y §6).

---

## 2. Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # build de producción en dist/
npm run preview  # sirve el build
```

---

## 3. Estructura y responsabilidades

```
src/
├── config/site.ts        ⭐ marca, nav, SEO por defecto, redes
├── styles/global.css     ⭐ tokens de diseño (@theme) + estilos base
├── layouts/BaseLayout.astro   <head> + SEO + Header/Footer + <slot/>
├── components/
│   ├── layout/    Header, Footer          (globales del sitio)
│   ├── sections/  Hero, Section           (bloques de página)
│   ├── ui/        Button, Card, OptimizedImage
│   ├── forms/     Form, FormField
│   └── seo/       Seo                      (metadatos por página)
├── assets/images/         imágenes fuente (se optimizan en build)
└── pages/                 una ruta = un archivo .astro
```

**Alias de importación** (en `tsconfig.json`): `@/*`, `@components/*`,
`@layouts/*`, `@config/*`, `@assets/*`, `@lib/*`.

---

## 4. Crear una página

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Section from '@components/sections/Section.astro';
---

<BaseLayout title="Servicios" description="Lo que hacemos.">
  <Section eyebrow="Servicios" title="Cómo ayudamos" align="center">
    <!-- contenido -->
  </Section>
</BaseLayout>
```

El `title`/`description` alimentan automáticamente `<title>`, `meta description`,
canonical, Open Graph y Twitter Cards vía [`Seo.astro`](src/components/seo/Seo.astro).

---

## 5. Pipeline de imágenes — caso simple (una imagen)

Coloca la imagen en `src/assets/images/`, **impórtala estáticamente** y pásala a
`OptimizedImage`:

```astro
---
import OptimizedImage from '@components/ui/OptimizedImage.astro';
import foto from '@assets/images/foto.jpg';
---

<OptimizedImage
  src={foto}
  alt="Descripción significativa"
  widths={[400, 800, 1200]}
  sizes="(min-width: 1024px) 50vw, 100vw"
/>
```

`OptimizedImage` genera **WebP responsive** (`srcset`), con `loading="lazy"` y
`decoding="async"` por defecto. Marca `priority` **solo** en la imagen visible
al cargar (LCP), para desactivar el lazy-loading en ese caso.

> **Regla de oro del build:** Astro solo optimiza imágenes que puede analizar
> estáticamente, es decir, **importadas con `import`** (o vía `import.meta.glob`).
> Nunca construyas la ruta como string en tiempo de ejecución
> (`src={"/img/" + nombre}`): eso rompe el pipeline.

---

## 6. Pipeline cuando un componente renderiza MÁS DE UN `OptimizedImage`

Este es el caso de una **galería, un grid de tarjetas con foto, un carrusel o un
logo wall**. La clave: **cada imagen debe seguir siendo un import estático**, y
`OptimizedImage` se **reutiliza en un bucle** — no se duplica el componente.

Hay dos patrones según de dónde vengan las imágenes.

### Patrón A — Set conocido en tiempo de autor (recomendado por defecto)

La **página padre** importa cada imagen y pasa un **array de objetos** al
componente. El componente solo itera y renderiza.

**Página / uso:**

```astro
---
import Gallery from '@components/sections/Gallery.astro';
import img1 from '@assets/images/proyecto-1.jpg';
import img2 from '@assets/images/proyecto-2.jpg';
import img3 from '@assets/images/proyecto-3.jpg';

const items = [
  { src: img1, alt: 'Proyecto 1' },
  { src: img2, alt: 'Proyecto 2' },
  { src: img3, alt: 'Proyecto 3' },
];
---

<Gallery items={items} />
```

**Componente reutilizable (`src/components/sections/Gallery.astro`):**

```astro
---
import type { ImageMetadata } from 'astro';
import OptimizedImage from '@components/ui/OptimizedImage.astro';

interface GalleryItem {
  src: ImageMetadata;
  alt: string;
}

export interface Props {
  items: GalleryItem[];
  /** Columnas del grid; determina el `sizes` de cada imagen. */
  columns?: 2 | 3 | 4;
}

const { items, columns = 3 } = Astro.props;

// `sizes` DEBE reflejar el ancho real de cada celda del grid,
// no el del viewport completo. Si no, el navegador descarga
// variantes demasiado grandes y se pierde el beneficio.
const sizesByColumns = {
  2: '(min-width: 768px) 50vw, 100vw',
  3: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  4: '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
} as const;

const gridCols = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};
---

<ul class:list={['grid gap-6', gridCols[columns]]}>
  {
    items.map((item, i) => (
      <li>
        <OptimizedImage
          src={item.src}
          alt={item.alt}
          widths={[300, 600, 900]}
          sizes={sizesByColumns[columns]}
          class="aspect-[4/3] w-full rounded-card object-cover shadow-card"
          {/* Solo la primera imagen es candidata a LCP; el resto, lazy. */}
          priority={i === 0}
        />
      </li>
    ))
  }
</ul>
```

### Patrón B — Muchas imágenes desde una carpeta (`import.meta.glob`)

Cuando son demasiadas para importarlas a mano (p. ej. un directorio entero de
un blog o portfolio), usa `import.meta.glob` con `eager: true`. Sigue siendo
**estático**, así que el pipeline funciona.

```astro
---
import type { ImageMetadata } from 'astro';
import OptimizedImage from '@components/ui/OptimizedImage.astro';

// Mapa { ruta -> { default: ImageMetadata } } resuelto en build.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/portfolio/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

// Orden estable por nombre de archivo.
const entries = Object.entries(images).sort(([a], [b]) => a.localeCompare(b));
---

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {
    entries.map(([path, mod], i) => (
      <OptimizedImage
        src={mod.default}
        alt={path.split('/').pop()?.replace(/\.\w+$/, '') ?? ''}
        widths={[300, 600, 900]}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        class="aspect-square w-full rounded-card object-cover"
        priority={i === 0}
      />
    ))
  }
</div>
```

> Si necesitas emparejar cada imagen con datos (título, enlace…), guarda en tus
> datos la **clave/ruta** de la imagen y resuélvela contra el mapa `images` de
> `import.meta.glob`. Nunca guardes una ruta string para pasarla directa a
> `<img>`.

### Reglas al renderizar múltiples `OptimizedImage`

| Regla | Por qué |
| --- | --- |
| **Un único `OptimizedImage` reutilizado en bucle.** | Cero duplicación; una sola fuente de verdad para el markup de imagen. |
| **Imports estáticos** (`import` o `import.meta.glob`), nunca rutas string en runtime. | Es lo único que el optimizador de `astro:assets` puede procesar. |
| **`sizes` = ancho real de la celda**, no del viewport. | En un grid de 3 columnas cada imagen ocupa ~33vw; declarar `100vw` descarga variantes de más. |
| **Solo 1 imagen con `priority`** (la del LCP, above-the-fold). El resto, lazy (por defecto). | Varias imágenes `eager`/`fetchpriority=high` compiten y empeoran el LCP. |
| **`widths` acorde al tamaño de render.** Miniaturas → widths pequeños. | Evita generar y servir variantes innecesariamente grandes. |
| **Define `aspect-*` + `object-cover`.** | Reserva el espacio (evita CLS) aunque las fuentes tengan proporciones distintas. |

---

## 7. Iconos (sin SVG a mano)

```astro
---
import { Icon } from 'astro-icon/components';
---
<Icon name="ph:rocket-launch" class="size-6" />
```

Explora el set Phosphor en <https://icones.js.org/collection/ph>.

---

## 8. Tokens de diseño

Definidos en [`src/styles/global.css`](src/styles/global.css) con `@theme`.
Tailwind genera las utilidades automáticamente:

| Token | Utilidades |
| --- | --- |
| `--color-brand-600` | `bg-brand-600`, `text-brand-600`, `border-brand-600`… |
| `--font-heading` | `font-heading` |
| `--radius-card` | `rounded-card` |
| `--spacing-section` | `py-section`, `mt-section`… |
| `--shadow-card` | `shadow-card` |

Para re-tematizar el sitio, cambia los valores de los tokens: se propagan a todo.

---

## 9. Checklist de migración desde HTML estático

1. Reconstruye cada `<section>` original con `<Section>`.
2. Sustituye botones/enlaces por `<Button>`, tarjetas por `<Card>`.
3. Mueve cabecera y pie a `Header`/`Footer` (edita `mainNav`/`footerNav`).
4. Mueve las imágenes a `src/assets/images/` y reemplaza `<img>` por
   `<OptimizedImage>` (§5–§6).
5. Cambia estilos inline/CSS por utilidades Tailwind con tokens.
6. Crea una página por ruta en `src/pages/` usando `BaseLayout`.
7. Ajusta `site` en `astro.config.mjs`, los datos de `src/config/site.ts` y el
   `Sitemap:` de `public/robots.txt` con el dominio real.
8. `npm run build` y verifica que las imágenes se convierten a WebP y que
   `sitemap-index.xml` se genera.
