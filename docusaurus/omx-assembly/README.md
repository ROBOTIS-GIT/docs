# OMX interactive assembly

This application provides part-level assembly and cable-routing steps for OMX-L
and OMX-F. It is embedded on the existing Assembly Guide route:

`/docs/systems/omx/quick_start_guide/assembly_guide`

The document component in `src/components/OmxAssemblyGuide` owns preparation (including factory-preset actuator IDs),
reference videos and the public URL. This Vite application owns the 3D workspace.
An isolated, same-origin iframe prevents its styles and Three.js version from
affecting other documentation viewers. No external service is required at runtime.

## Development

Use Node.js 22.12 or later. From `docusaurus/`:

```sh
npm ci
npm ci --prefix omx-assembly
npm run test:omx
npm start
```

For work on the standalone viewer, run `npm run dev --prefix omx-assembly`.
For the complete documentation build:

```sh
npm run typecheck
npm run build -- --locale en
npm run build -- --locale ko
npm run serve
```

The prebuild/prestart hook builds this application into the ignored `generated/`
directory. Docusaurus serves those files alongside its static assets. The
postbuild check keeps one copy at `build/interactive/omx/`, removes the redundant
Korean copy and enforces a 125 MiB application budget. Korean documentation keeps
the existing English-only notice for this page. Do not commit generated bundles.

## Content and assets

- `public/models/*.json` defines ordered steps, part labels, camera framing,
  transform tracks and cable morph tracks.
- `models/*.glb.gz` stores the matching GLB exports with lossless gzip compression.
  `prepare:models` verifies the decompressed byte length and SHA-256 against
  `models/manifest.json`. Uncompressed GLBs are generated, not tracked.
- `src/timeline.mjs` evaluates the mechanical and cable tracks.
- `src/viewer.ts` renders, frames and selects parts.
- `src/main.ts` manages navigation, playback, search and completion.
- `tests/` covers part identity, sequential fastening, cable routing, connector
  seating, camera continuity, playback and share-query validation. Mechanical
  fixtures retain the assembly tracks used before the wiring steps were added.

Only the selected model is fetched: Leader, Follower BIC30 or Follower XL4015.
The legacy variant changes the upper link and DC converter arrangement. It does
not duplicate a separate set of assembly instructions for unrelated hardware.
Model names, part node names and morph targets are part of the animation contract;
do not merge meshes or rename nodes during export. Update JSON, GLB and manifest
together. The checked-in gzip streams decode byte-for-byte to the exported GLBs.

The source geometry is derived from ROBOTIS OMX engineering assemblies, including
the `OMX_260915` drawing release, the legacy `OMX_Follower.stp`, OpenRB-150 Rev-B,
and BIC30_A01_E001_REV02. Original STEP/Gerber/Blender files and rendered films are
not included. OpenRB source resources are linked in the
[official controller manual](https://emanual.robotis.com/docs/en/parts/controller/openrb-150/).
Package labels and legacy converter terminal order follow the existing OMX
assembly videos. Cable shape, screw turns and insertion motion are instructional
visualizations, not harness manufacturing drawings or torque specifications.

Third-party runtime and font license texts are consolidated in
`public/THIRD_PARTY_NOTICES.txt`; the source logo attribution is retained in
`licenses/ROBOTIS-logo-provenance.json`.
ROBOTIS product geometry and trademarks are distinct from the Three.js and Inter
licenses. Preserve these notices when publishing the application.

## Navigation and lifecycle

Public links use `model=leader|follower`, optional `converter=xl4015`, and a
one-based `step`. `view=prepare|3d|videos` selects the document view. Messages
between the parent and iframe accept only assembly query state and verify both
the sender window and origin. Shared links point to the document, not its
internal iframe URL. Browser Back/Forward restores the selected view and step.

The viewer mounts only after starting assembly or following a step link. Leaving
the 3D view removes the iframe and releases its WebGL resources. Completion stays
in the browser's local storage; it is not an account or cross-device sync feature.
Reduced motion disables automatic playback. Reference videos remain available
without WebGL. New rendered videos should replace the reference mode only after
their public asset locations and hardware applicability have been reviewed.

Before changing the integration, verify Leader, both Follower variants, refresh
and Back/Forward on a deep link, mobile layout, and returning to an ordinary docs
page. Check the model against its actual hardware rather than treating a passing
animation test as a substitute for mechanical review.

## Reference illustrations

Converter selection cards and the horn-alignment illustration are rendered from
the same model assets, rather than enlarged screenshots. Their WebP outputs live
in `static/img/systems/omx/quick_start_guide/assembly_guide/`. To regenerate them
from `omx-assembly/`, use Blender and Python with Pillow (not required for CI):

```sh
npm run prepare:models
blender -b -P scripts/render-reference.py -- public/models /tmp/omx-reference leader horn
blender -b -P scripts/render-reference.py -- public/models /tmp/omx-reference follower horn
blender -b -P scripts/render-reference.py -- public/models /tmp/omx-reference follower board
blender -b -P scripts/render-reference.py -- public/models /tmp/omx-reference follower-xl4015 board
python scripts/compose-reference.py /tmp/omx-reference ../static/img/systems/omx/quick_start_guide/assembly_guide public/fonts
```

The horn detail camera magnifies the modeled reference grooves. Recheck that
framing whenever changing the actuator assets. Converter images show the component
side and emphasize the TTL sockets versus screw terminals for visual identification.

The XL430 models use the official XL/XC/2XL/2XC430 horn geometry, including
the single and paired index grooves. The central FHS_M2_5X06_NYLOK screw and
four inserts follow the official XC430 assembly placement. These factory-fitted
components are included in the actuator mesh, not separate assembly steps.
The illustration pairs the complete actuator with separate upper and lower
macro views. Teal section labels are instructional graphics, not physical paint
on the actuator. XL330 retains its existing single and paired CAD grooves.
