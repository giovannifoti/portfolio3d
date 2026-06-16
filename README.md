# Catalogo Portfolio Stampa 3D

Web app Next.js semplice per pubblicare un catalogo di prodotti stampati in 3D. L'admin inserisce manualmente titolo, descrizione e categoria, carica il file `.3mf`, e la pagina prodotto mostra il modello con un viewer 3D interattivo.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS per UI responsive dark/light
- SQLite con `better-sqlite3`
- Upload locale in `public/uploads`
- Three.js puro con `ThreeMFLoader` e `OrbitControls`
- Netlify config con `@netlify/plugin-nextjs`

## Avvio locale

```bash
npm install
cp .env.example .env
npm run dev
```

Apri `http://localhost:3000`.

Credenziali admin:

```env
ADMIN_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-long-random-string
```

Se non crei il file `.env` in sviluppo, la password fallback e' `admin`. In produzione devi configurare `ADMIN_PASSWORD`.

## Variabili ambiente

```env
ADMIN_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-long-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_PATH=.data/catalog.sqlite
UPLOAD_DIR=public/uploads
```

## Workflow

1. Vai su `/admin`.
2. Inserisci titolo, descrizione e categoria opzionale.
3. Carica un file `.3mf`.
4. Il prodotto appare nel catalogo.
5. La pagina dettaglio carica il file `.3mf` e lo renderizza in 3D nel browser.

## Funzionalita'

- Home minimalista.
- Catalogo con ricerca e filtro categoria.
- Card prodotto con descrizione manuale e pulsante WhatsApp.
- Pagina dettaglio con viewer 3D interattivo.
- Area admin protetta da password.
- Creazione, modifica ed eliminazione prodotti.
- Upload solo `.3mf`.
- Statistiche visualizzazioni prodotto.
- Tema dark/light.
- Sitemap e robots automatici.
- Meta tag SEO dinamici per prodotto.

## Deploy Netlify

Il file `netlify.toml` e' pronto per build Next.js:

```bash
npm run build
```

Su Netlify configura almeno:

```env
ADMIN_PASSWORD=...
AUTH_SECRET=...
NEXT_PUBLIC_SITE_URL=https://tuo-dominio.netlify.app
```

Nota produzione: Netlify Functions sono serverless e il filesystem locale non e' uno storage persistente per upload generati dagli utenti. Per un catalogo live usa PostgreSQL gestito e storage cloud per sostituire SQLite e `public/uploads`.

## Comandi

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Struttura

```text
app/
  admin/                 Area admin e login
  api/                   API auth, prodotti e statistiche
  catalogo/              Catalogo filtrabile
  prodotti/[slug]/       Dettaglio prodotto con viewer 3D
components/              UI, viewer 3D, dashboard admin
lib/                     Auth, DB, storage e query prodotti
public/uploads/          File `.3mf` caricati
types/                   Tipi condivisi
```
