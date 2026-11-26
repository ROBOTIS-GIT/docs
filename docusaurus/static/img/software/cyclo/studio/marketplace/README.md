# Marketplace guide screenshots

## Live English catalog and details

`catalog.png` and `asset-details.png` were captured on 2026-11-26 from https://cyclo-dev-api.robotis.com/en/marketplace/ using Chrome's built-in screenshot command. The deployed frontend commit was not established.

- The catalog shows the active **LeRobot Dataset** filter and real ROBOTIS product photographs.
- The detail screenshot shows **Shower Puff Pick & Place** in a separate public browsing window, with **Buy now** and **Add to cart** available. The original authenticated session was retained.
- Viewport: 1440 × 1000 CSS pixels; original PNG: 2880 × 2000 pixels (DPR 2). Screenshots were not composited, cropped, or retouched.
- Browser chrome, account identity, credentials, and signed media URLs are excluded by the browser's page capture command.

## Local example screenshots

`catalog-ko.png`, `asset-details-ko.png`, `cart.png`, `cart-ko.png`, `library.png`, and `library-ko.png` were captured on 2026-11-26 from the actual Cyclo Studio frontend at commit `84c8ed29877d432006c77e8e41bd8b4e62460edf`, using local example catalog, entitlement, and account data. These files do not depict the live sales catalog, a customer account, or a completed transaction.

The Korean catalog/detail and both cart screenshots use physical robot demonstration photography and simulation images from this ROBOTIS documentation repository. The library views contain no product thumbnail. Original PNG size: 1577 × 1041 pixels.

Next.js and query debugging controls were hidden in the local preview; product controls were unchanged. Photographic previews are frames of original robot demonstration GIFs as rendered by the application. Screenshots were not composited or retouched.

All paths below are relative to `docusaurus/static/` in this repository.

| Example asset | Original media |
| --- | --- |
| FFW tabletop pick-and-place | `img/systems/aiworker/resources/technical_story/centerpose/box_pick.gif` — physical robot demonstration |
| K1 balance motion / K1 walking motion | `img/systems/aisapiens/development_guide/sim2sim/k1_mujoco_sim2sim.png` — K1 MuJoCo simulation |
| FFW bin-picking demonstrations | `img/systems/aiworker/resources/technical_story/centerpose/bottle_pick.gif` — physical robot demonstration |
| Workbench 3D scene | `img/systems/aiworker/simulation/simulation/ffw_sg2_mjcf.png` — FFW MuJoCo simulation |
| FFW sorting demonstrations | `img/systems/aiworker/overview/introduction/aiworker_front.png` — official product image |

No live order, cart change, entitlement change, license consent, or payment was submitted during either capture workflow.
