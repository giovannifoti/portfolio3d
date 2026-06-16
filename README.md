# Catalogo Portfolio Stampa 3D

Web app Next.js per pubblicare un catalogo professionale di prodotti stampati in 3D. L'admin inserisce manualmente titolo, descrizioni e categoria, carica il file `.3mf`, e il browser genera una copertina dal modello senza usare AI.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS per UI responsive dark/light
- Supabase database + storage in produzione
- SQLite e upload locale come fallback sviluppo
- Three.js, React Three Fiber, Drei e `ThreeMFLoader`
- React Hook Form, Zod, Framer Motion, Lucide
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

Se non crei il file `.env` in sviluppo, la password fallback e' `admin`. In produzione devi configurare `ADMIN_PASSWORD` e `AUTH_SECRET`.

## Variabili ambiente

```env
ADMIN_PASSWORD=change-this-password
AUTH_SECRET=replace-with-a-long-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=product-assets

DATABASE_PATH=.data/catalog.sqlite
UPLOAD_DIR=public/uploads
MAX_MODEL_UPLOAD_MB=40
MAX_IMAGE_UPLOAD_MB=8
```

Con Supabase configurato, prodotti e file vengono salvati in cloud. Senza Supabase, l'app usa SQLite e `public/uploads` solo per sviluppo locale.

## Workflow

1. Vai su `/admin`.
2. Inserisci titolo, descrizione e categoria opzionale.
3. Carica un file `.3mf`.
4. Il browser genera una copertina WebP dal modello.
5. Il prodotto appare nel catalogo con ricerca, filtri e pulsante WhatsApp.
6. La pagina dettaglio carica il file `.3mf` e lo renderizza in 3D nel browser.

## Funzionalita'

- Home minimalista con sezioni contenuto, prodotti recenti e CTA.
- Catalogo con ricerca istantanea, filtro categoria, ordinamento e paginazione.
- Card prodotto con descrizione manuale e pulsante WhatsApp.
- Pagina dettaglio con viewer 3D interattivo, galleria fullscreen, link copiabile e prodotti correlati.
- Area admin protetta da password.
- Creazione, modifica ed eliminazione prodotti.
- Upload solo `.3mf`.
- Statistiche visualizzazioni prodotto.
- Tema dark/light.
- Sitemap e robots automatici.
- Meta tag SEO dinamici per prodotto.
- Schema.org Product, manifest, favicon SVG, pagina 404 e pagina manutenzione.
- Rate limiting base su login e upload API.

## Deploy Netlify

Il file `netlify.toml` e' pronto per build Next.js e Netlify Functions:

```bash
npm run build
```

Su Netlify configura almeno:

```env
ADMIN_PASSWORD=...
AUTH_SECRET=...
NEXT_PUBLIC_SITE_URL=https://tuo-dominio.netlify.app
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=product-assets
```

Prima del deploy esegui lo script `supabase/schema.sql` nel SQL editor di Supabase. Il bucket pubblico predefinito e' `product-assets`.

Nota produzione: Netlify Functions sono serverless e il filesystem locale non e' uno storage persistente per upload generati dagli utenti. Per un catalogo live usa Supabase.

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
supabase/schema.sql      Schema database e bucket storage
types/                   Tipi condivisi
```
