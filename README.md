# Virtus Lissone Calcio — sito statico

Clone statico del sito ufficiale **virtuslissonecalcio.it** (originariamente WordPress + Elementor),
ricostruito come sito statico HTML/CSS/JS per essere ospitato gratuitamente (GitHub Pages, Netlify, Cloudflare Pages)
senza più costi di hosting WordPress.

## Struttura
- `index.html` e le altre pagine (`iscrizioni`, `squadre`, le squadre `under-*` / `open-*`, `storia`, `sponsor`, `contatti`)
- `assets/` — CSS, JS, immagini e font

## Pubblicazione con GitHub Pages
1. Push del repository su GitHub.
2. Settings → Pages → Source: branch `main`, cartella `/root`.
3. Il sito sarà online su `https://<utente>.github.io/<repo>/`.

## Note
- Il **form Contatti** era gestito da WordPress e in versione statica non invia email.
  Va collegato a un servizio esterno gratuito (es. Formspree / FormSubmit) o sostituito con un link email.
- Contenuti aggiornati alla data della clonazione.

Anteprima locale:
```bash
python3 -m http.server 8899
# poi apri http://localhost:8899
```
