# Template Name

Website template structure.


## Theme and RTL controls

- `assets/css/theme.css` is the shared theme/control layer.
- `assets/css/dark-mode.css` and `assets/css/rtl.css` are included as extension files.
- Dark/light and RTL/LTR toggles are implemented with HTML checkboxes + CSS `:has()`; no JavaScript is required.
- Light mode keeps the existing template colors. Dark mode only changes surfaces, text, borders, and form controls to dark-surface equivalents while preserving the existing accent identity.
- Because this version is HTML/CSS only, the toggle state is not persisted with `localStorage`.

## Device support (Galaxy S8+ / iPad Mini)

- `assets/css/responsive.css` is the responsive layer. It must stay the LAST stylesheet on every page.
- Tested viewports: Galaxy S8+ 360x740 (portrait) / 740x360 (landscape), iPad Mini 768x1024 and 744x1133 (portrait), 1024x768 and 1133x744 (landscape).
- Breakpoints: 1100px, 960px (hamburger menu), 600px (phones), 400px (small phones), short landscape (height <= 480px).
- Header/menu pattern follows the reference app (sparkden): 72px header, square 3-bar hamburger that turns into an X, full-screen left-aligned menu, Home accordion, and the header CTA ("Visit Booking") moved into the menu on tablet/phone.
- The hamburger menu is wired in `initMobileMenu()` in `assets/js/main.js` (`#nav-toggle` + `#main-navigation`).
- Dark mode and RTL are supported in the mobile menu and all layouts.
