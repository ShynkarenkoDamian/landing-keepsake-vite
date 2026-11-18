# Keepsake — Digital & Branding Agency

Односторінковий лендінг агенції Keepsake, зверстаний з **Pug + SCSS** на **Vite**, з оптимізованими зображеннями та автоматичними перевірками якості (lab-09).

**Демо:** https://ShynkarenkoDamian.github.io/landing-keepsake-vite/

---

## 🔧 Вимоги до середовища

| Інструмент | Версія                            |
| ---------- | --------------------------------- |
| Node.js    | 22 LTS (мінімум 20.19 для Vite 8) |
| npm        | 10+                               |
| Git        | будь-яка актуальна версія         |

Перевірка:

```bash
node -v
npm -v
```

---

## 🚀 Команди

| Команда           | Що робить                                                                    |
| ----------------- | ---------------------------------------------------------------------------- |
| `npm install`     | Встановлює залежності та через `prepare` активує git-хуки Husky              |
| `npm run dev`     | Dev-сервер Vite з гарячим оновленням (http://localhost:5173)                 |
| `npm run build`   | Продакшн-збірка в `dist/` (CSS мінімізується, зображення копіюються файлами) |
| `npm run preview` | Локальний перегляд продакшн-збірки (з урахуванням `base`)                    |
| `npm run images`  | Генерує AVIF/WebP/JPEG з `images-src/` у `src/assets/images/`                |
| `npm run format`  | Форматує весь проєкт Prettier (Pug, SCSS, JS, JSON, MD, YAML)                |
| `npm run lint`    | Stylelint для SCSS + перевірка форматування Prettier                         |

---

## 🌐 Деплой на GitHub Pages

Сайт публікується автоматично з гілки `main` через [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. `actions/checkout` → `actions/setup-node` (Node 22, кеш npm)
2. `npm ci` з `HUSKY=0` (у CI хуки не потрібні)
3. `npm run lint` → `npm run build`
4. `actions/configure-pages` → `actions/upload-pages-artifact` (`dist`) → `actions/deploy-pages`

У `vite.config.js` задано `base: "/landing-keepsake-vite/"`, тому всі шляхи до CSS, зображень, `srcset` і favicon отримують префікс репозиторію. Каталог `dist/` у репозиторій не комітиться.

Щоб увімкнути публікацію вперше: **Settings → Pages → Source: GitHub Actions**.

---

## 🧩 Структура проєкту

```text
.
├─ .github/workflows/deploy.yml   # CI/CD для GitHub Pages
├─ images-src/                    # вихідні JPEG (поза збіркою, 14 файлів)
├─ scripts/images.mjs             # конвеєр зображень на sharp
├─ src/
│  ├─ assets/
│  │  ├─ favicon.svg
│  │  └─ images/                  # 84 згенерованих AVIF/WebP/JPEG
│  ├─ components/
│  │  ├─ header.pug
│  │  ├─ footer.pug
│  │  └─ sections/                # hero, works, work-cta, services, stats, clients, journal
│  ├─ data/                       # content, navigation, portfolio, footer, index
│  ├─ includes/                   # head, meta, fonts, icons (svg-спрайт)
│  ├─ layouts/main.pug            # каркас сторінки з блоками
│  ├─ mixins/                     # btn, icon, picture, work-card, index
│  ├─ pages/index.pug             # єдина сторінка, extends layouts/main
│  └─ styles/
│     ├─ abstracts/               # _tokens, _mixins, _functions, _index
│     ├─ base/                    # reset, typography
│     ├─ layout/                  # container, page, tokens (CSS custom properties)
│     ├─ components/              # стилі секцій і компонентів
│     └─ main.scss
├─ postcss.config.js              # Autoprefixer
├─ vite.config.js                 # base, assetsInlineLimit: 0, псевдоніми
├─ .browserslistrc
├─ .stylelintrc.json
├─ .prettierrc
└─ commitlint.config.js
```

---

## 🏗 Архітектура Pug

- **Layout + blocks.** [`src/layouts/main.pug`](src/layouts/main.pug) описує каркас (`head`, `header`, `content`, `footer`) і блоги `data`, `icons`, `header`, `content`, `footer`. Сторінка [`src/pages/index.pug`](src/pages/index.pug) розширює його через `extends`, задає `block title`, додає метадані через `block append meta` і підключає шрифти через `block prepend styles`.
- **Include.** Спільні частини (`head`, `meta`, `fonts`, `icons`) і секції (`components/sections/*.pug`) підключаються директивою `include`, тому розмітка не дублюється.
- **Mixin.** Повторювані елементи винесені в міксини: `btn` (з `block` та `&attributes`), `icon` (з `case` для вибору SVG та `use`), `picture` (адаптивні зображення), `work-card` (картка портфоліо).
- **Дані окремо.** Масиви навігації, робіт, послуг, статистики та журналу лежать у `src/data/*.pug` як `const`, а секції обходяться через `each` — додати нову картку чи пункт меню можна без правок розмітки.
- **SVG-спрайт.** Іконки та логотип — інлайн SVG (`symbol` + `use`), без растрових іконок.

---

## 🎨 Архітектура SCSS

- **`@use` / `@forward`.** [`src/styles/main.scss`](src/styles/main.scss) підключає чотири шари: `abstracts`, `base`, `layout`, `components`. Кожен шар має `_index.scss`, який реекспортує модулі через `@forward`.
- **Дизайн-токени.** Кольори, шрифти та розміри описані Sass-картами в `abstracts/_tokens.scss`, а `layout/_tokens.scss` генерує з них CSS custom properties (`--color-*`, `--font-*`, `--section-space` тощо). Адаптивні значення перевизначаються в `:root` на брейкпоінтах `md` і `xl`.
- **Міксини.** `mq($bp)` — mobile-first медіазапит за мапою брейкпоінтів (`md: 768px`, `xl: 1280px`); `rem()` — конвертація px у rem через `sass:math`; також `visually-hidden`, `focus-ring`, `section-heading`.
- **БЕМ і обмеження.** Класи мають вигляд `block__element--modifier`; Stylelint перевіряє БЕМ-патерн, забороняє `id`-селектори та `!important`, обмежує вкладеність трьома рівнями.

---

## 🛠 Інструменти

| Інструмент                                     | Для чого потрібен                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| **Vite 8**                                     | Dev-сервер, продакшн-збірка, обробка ассетів і `base` для GitHub Pages |
| **Vituum + @vituum/vite-plugin-pug**           | Pug як entrypoint, компіляція layout/includes у HTML                   |
| **Sass**                                       | SCSS-модулі, `@use`/`@forward`, функції та міксини                     |
| **PostCSS + Autoprefixer**                     | Вендорні префікси відповідно до Browserslist                           |
| **sharp**                                      | Конвертація JPEG → AVIF/WebP/JPEG у двох ширинах, PNG-фолбек для альфи |
| **Stylelint + stylelint-config-standard-scss** | Єдині правила SCSS: БЕМ, вкладеність ≤ 3, без `!important`             |
| **Prettier + @prettier/plugin-pug**            | Єдине форматування Pug, SCSS, JS, JSON, MD, YAML                       |
| **Husky**                                      | Git-хуки `pre-commit` і `commit-msg`                                   |
| **lint-staged**                                | Перевіряє лише додані у коміт файли, а не весь репозиторій             |
| **commitlint + config-conventional**           | Валідація повідомлень комітів у форматі Conventional Commits           |

---

## 🌍 Цільові браузери

`.browserslistrc`:

```text
last 2 Chrome versions
last 2 Firefox versions
last 2 Edge versions
last 2 Safari versions
last 2 ios_saf versions
```

За цим списком Autoprefixer додає потрібні префікси, а Vite формує production-таргети. Адаптивність макета побудована на двох брейкпоінтах: **768px** (`md`) і **1280px** (`xl`).

---

## ⚡ Продуктивність

### CSS: до і після мініфікації

| Етап                                            | Розмір  | gzip    |
| ----------------------------------------------- | ------- | ------- |
| Скомпільований SCSS (expanded, без мініфікації) | 33.3 kB | 5.85 kB |
| `dist` CSS (мініфікація Vite/lightningcss)      | 27.5 kB | 5.46 kB |
| **Економія**                                    | −17.5 % | −6.7 %  |

### Зображення: за форматами

| Набір                              | Формат         | Файлів | Розмір    | Економія vs вихідних |
| ---------------------------------- | -------------- | ------ | --------- | -------------------- |
| Вихідні (`images-src/`)            | JPEG           | 14     | 2591.3 kB | —                    |
| Згенеровані (`src/assets/images/`) | AVIF 400w/800w | 28     | 357.0 kB  | −86.2 %              |
| Згенеровані                        | WebP 400w/800w | 28     | 538.2 kB  | −79.2 %              |
| Згенеровані                        | JPEG 400w/800w | 28     | 731.9 kB  | −71.8 %              |
| **Разом**                          | AVIF/WebP/JPEG | 84     | 1627.1 kB | −37.2 %              |

Міксин `picture` віддає AVIF → WebP → JPEG з `srcset`/`sizes` під реальні брейкпоінти. Hero-зображення завантажується з `loading="eager"` і `fetchpriority="high"`, усі решта — `loading="lazy"`. `assetsInlineLimit: 0` гарантує, що в `dist` кожне зображення лежить окремим файлом (без base64-інлайнів).

---

## ✅ Контроль якості

- **pre-commit** (`.husky/pre-commit`): `lint-staged` — для `*.scss` запускає `stylelint --fix` і `prettier --write`, для `*.{pug,js,json,md}` — `prettier --write`.
- **commit-msg** (`.husky/commit-msg`): `commitlint` перевіряє Conventional Commits (`feat:`, `fix:`, `chore:` тощо).
- **CI**: `npm run lint` виконується перед збіркою; `HUSKY=0` вимикає встановлення хуків у GitHub Actions.
- **Валідація HTML**: згенерована сторінка перевірена [W3C Nu Validator](https://validator.w3.org/nu/) — 0 помилок і попереджень.
