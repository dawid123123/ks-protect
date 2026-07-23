# KS Protect — zapisana kopia (21 Jul 2026)

Pełna kopia strony KS Protect sprzed startu drugiej strony od zera.

## Gdzie leży

- Folder: `~/Downloads/ks-protect-backup-YYYYMMDD/`
- ZIP: `~/Downloads/ks-protect-backup-YYYYMMDD.zip`
- Lista plików: `~/Downloads/ks-protect-backup-filelist.txt`
- W repo (oryginał): branch `ks-protect-saved` (jeśli utworzony)

## Co warto ewentualnie reuse’ować

| Obszar | Pliki / folder | Po co |
|--------|----------------|-------|
| Konfigurator PPF | `components/PPF*.tsx`, `ppfData.ts`, `ppfTypes.ts`, `CarViewer`, `TopView`/`SideView`/`RearView` | interaktywny wybór części auta + ceny |
| Konfigurator tint | `components/Tint*.tsx`, `tintData.ts`, `tintTypes.ts`, photo zones | przyciemnianie szyb |
| Sklep | `components/Shop*.tsx`, `lib/shop*`, `app/api/shop/*`, `app/netverslun` | katalog, koszyk, admin |
| Ceny / admin | `lib/pricing*.ts`, `PriceBossAdmin.tsx`, `app/api/pricing` | edycja cen |
| i18n | `lib/i18n/*` | IS / EN (i inne jeśli są) |
| Layout / UI | `Hero`, `Navbar`, `Footer`, `Gallery`, `globals.css` | design systemu |
| Assety | `public/`, `mercedes.png`, `siteImages.ts` | zdjęcia i ścieżki |

## Uwaga

Kopia **bez** `node_modules` i `.next` — odtworzenie: `npm install` w folderze backupu.
