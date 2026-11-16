# Photos

Each category page reads its photos from its own folder:

| Folder       | Page             | Instagram              |
|--------------|------------------|------------------------|
| `weddings/`  | `weddings.html`  | @weddings_by_moiz_alvi |
| `fashion/`   | `fashion.html`   | @moizalvi.official     |
| `food/`      | `food.html`      | @photolicious9         |
| `corporate/` | `corporate.html` | @moizalvi.co           |
| `studio/`    | `studio.html`    | @artloft_studios       |

In each folder:

- `cover.jpg` is the big arch photo at the top of the page. It is also the thumbnail on the home page.
- `01.jpg`, `02.jpg`, `03.jpg`, and so on are the gallery photos. Add one line per photo inside
  `<div class="gal" id="gal">` in the page (the page has a commented example line to copy).

Until `cover.jpg` exists, the page shows a maroon "M·A" placeholder. The gallery section stays
hidden until it has at least one photo.

Keep photos around 1600px on the long side, saved as JPG, so pages load fast on mobile data.
