# Marketplace guide screenshots

Captured on 2026-11-26 from the actual Cyclo Studio frontend at commit `84c8ed29877d432006c77e8e41bd8b4e62460edf`.

- `catalog`, `asset-details`, `cart`, and `library` show the English interface; `-ko` files show Korean.
- Catalog, detail, and cart screenshots were recaptured with real robot demonstration photography and simulation images from this ROBOTIS documentation repository. The two library screenshots remain unchanged because that view contains no product thumbnail.
- The local preview used example catalog, entitlement, and account data. These are not screenshots of the live sales catalog, a customer account, or a completed transaction. The dev website returned CloudFront HTTP 403 during the capture attempt.
- Photographic previews are frames of the original robot demonstration GIFs as rendered by the application. Screenshots were not composited or retouched.
- Next.js and query debugging controls were hidden for capture; product controls were unchanged. No order was submitted and no license consent or payment was accepted.

## Preview image sources

All paths below are relative to `docusaurus/static/` in this repository. The images are already used by the corresponding ROBOTIS robot guides; no external stock or generated images were added.

| Example asset | Original media |
| --- | --- |
| FFW tabletop pick-and-place | `img/systems/aiworker/resources/technical_story/centerpose/box_pick.gif` — physical robot demonstration |
| K1 balance motion / K1 walking motion | `img/systems/aisapiens/development_guide/sim2sim/k1_mujoco_sim2sim.png` — K1 MuJoCo simulation |
| FFW bin-picking demonstrations | `img/systems/aiworker/resources/technical_story/centerpose/bottle_pick.gif` — physical robot demonstration |
| Workbench 3D scene | `img/systems/aiworker/simulation/simulation/ffw_sg2_mjcf.png` — FFW MuJoCo simulation |
| FFW sorting demonstrations | `img/systems/aiworker/overview/introduction/aiworker_front.png` — official product image |
