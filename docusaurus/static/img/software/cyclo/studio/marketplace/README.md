# Marketplace guide screenshots

## Live catalog and asset details

`catalog.png`, `asset-details.png`, `catalog-ko.png`, and `asset-details-ko.png` were captured on 2026-11-26 from the English and Korean Marketplace at https://cyclo-dev-api.robotis.com/ using Chrome's built-in screenshot command. The deployed frontend commit was not established.

- Catalogs show the active **LeRobot Dataset** filter and actual ROBOTIS product photographs.
- Details show **Shower Puff Pick & Place** in a separate public browsing window, with **Buy now / 바로 구매** and **Add to cart / 장바구니 담기** available. The original authenticated session was retained.
- Viewport: 1440 × 1000 CSS pixels; original PNGs: 2880 × 2000 pixels (DPR 2). Screenshots were not composited, cropped, or retouched.
- Browser chrome, account identity, credentials, and signed media URLs are excluded by the browser's page capture command.

## Illustrative cart and library screens

`cart.png`, `cart-ko.png`, `library.png`, and `library-ko.png` are illustrative screen recreations made with sample catalog, entitlement, and account data in the actual Cyclo Studio frontend at commit `84c8ed29877d432006c77e8e41bd8b4e62460edf`. They were captured on 2026-11-26 and do not depict a live customer account or completed transaction. Both guides label these figures as example screens.

- Cart thumbnails show physical robot demonstration imagery from `docusaurus/static/img/systems/aiworker/resources/technical_story/centerpose/box_pick.gif` in this repository. Library views contain no product thumbnail.
- Original PNGs: 1577 × 1041 pixels. Next.js and query debugging controls were hidden; product controls were unchanged. The examples were rendered by the application rather than painted over screenshot pixels.

No live order, cart change, entitlement change, license consent, or payment was submitted during either capture workflow.
