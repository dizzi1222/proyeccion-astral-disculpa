# Proyección Astral: Misión Disculpa

> _De Diego para Marian_

Página web melancólica y romántica creada como disculpa personal. Una experiencia interactiva con estética cósmica, línea de tiempo horizontal, mural de recuerdos y carta animada.

## Tech Stack

- **TypeScript** — toda la lógica del frontend tipada
- **HTML5 + CSS3** con animaciones y efectos visuales
- **Tailwind CSS** (CDN) — utilidades de estilo
- **Lenis** (CDN) — scroll suave
- **Canvas API** — starfield interactivo

## Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ver en navegador (o abre index.html directamente)
npm run preview
```

## Estructura

```
├── index.html          # Página principal (HTML + CSS inline + Tailwind CDN)
├── src/
│   └── main.ts         # Lógica TypeScript (starfield, cursor, timeline, etc.)
├── dist/
│   └── main.js         # JS compilado (autogenerado, no committear)
├── assets/             # Imágenes y audio (bg-lain.mp3)
├── package.json
├── tsconfig.json
└── README.md
```

## Deploy

El proyecto es estático — compilar con `npm run build` y servir `index.html` + `dist/` + `assets/`.

Hecho con culpa, arrepentimiento y cariño cósmico.
