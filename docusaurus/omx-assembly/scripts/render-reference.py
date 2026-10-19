"""Render isolated actuator or converter CAD views. See README for commands."""

import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector, Matrix

args = sys.argv[sys.argv.index("--") + 1 :]
root = Path(args[0]).resolve()
out = Path(args[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
kind = args[2]
mode = args[3] if len(args) > 3 else "horn"
bpy.ops.wm.read_factory_settings(use_empty=True)
m = json.loads((root / f"{kind}.json").read_text())
keep = {
    p["node"]
    for p in m["parts"]
    if (p["group"] == 7 if mode == "horn" else p["group"] in (92, 310))
}
bpy.ops.import_scene.gltf(filepath=str(root / f"{kind}.glb"))
objects = [o for o in bpy.context.scene.objects if o.name in keep]
meshes = []
for o in objects:
    if o.type == "MESH":
        meshes.append(o)
    meshes.extend(c for c in o.children_recursive if c.type == "MESH")
meshes = list(set(meshes))
# Freeze CAD assembly placement before removing other components.
for o in meshes:
    w = o.matrix_world.copy()
    o.parent = None
    o.matrix_world = w
for o in list(bpy.context.scene.objects):
    if o not in meshes:
        bpy.data.objects.remove(o, do_unlink=True)
rot = Matrix.Rotation(-math.pi / 2 if mode == "horn" else math.pi, 4, "X")
for o in meshes:
    o.matrix_world = rot @ o.matrix_world
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
lo = Vector(tuple(min(v[i] for v in pts) for i in range(3)))
hi = Vector(tuple(max(v[i] for v in pts) for i in range(3)))
center = (lo + hi) / 2
for o in meshes:
    o.location -= center
size = hi - lo
# Soft studio illumination reveals molded reference marks without changing the geometry.
world = bpy.data.worlds.new("Studio")
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.7, 0.75, 0.8, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = (
    0.12 if mode == "board" else 0.4
)
for name, loc, power, area in [
    ("Key", (-0.09, 0.09, 0.12), 3, 0.08),
    ("Fill", (0.10, 0.05, 0.04), 1.5, 0.07),
    ("Rim", (0.03, -0.08, 0.08), 2, 0.06),
]:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power * (0.022 if mode == "board" else 0.18)
    data.shape = "DISK"
    data.size = area
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (-o.location).to_track_quat("-Z", "Y").to_euler()
bpy.ops.object.camera_add(
    location=(0.064, 0.12, 0.054) if mode == "horn" else (0.07, -0.11, 0.16)
)
cam = bpy.context.object
cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
cam.data.type = "ORTHO"
cam.data.ortho_scale = max(size) * 1.52
bpy.context.scene.camera = cam
s = bpy.context.scene
s.render.engine = "CYCLES"
s.cycles.samples = 32
s.cycles.use_denoising = True
s.render.resolution_x = 1400 if mode == "horn" else 1200
s.render.resolution_y = 1600 if mode == "horn" else 900
s.render.resolution_percentage = 100
s.render.film_transparent = True
s.render.image_settings.file_format = "PNG"
s.render.filepath = str(out / f"{kind}-{mode}.png")
s.view_settings.view_transform = "AgX"
s.view_settings.exposure = -0.6 if mode == "horn" else 0
bpy.ops.render.render(write_still=True)
(out / f"{kind}-{mode}-bounds.json").write_text(
    json.dumps(
        {
            "size": list(size),
            "center": list(center),
            "objects": [o.name for o in meshes],
        },
        indent=2,
    )
)

if mode == "horn":
    q = cam.rotation_euler.to_quaternion()
    scale = cam.data.ortho_scale
    # The molded case mark and horn notch, located in the full CAD view.
    cam.location += q @ Vector(
        ((860 / 1400 - 0.5) * scale, (0.5 - 445 / 1600) * scale * 1600 / 1400, 0)
    )
    cam.data.ortho_scale = scale * 0.34
    s.render.resolution_x = 1200
    s.render.resolution_y = 800
    s.render.filepath = str(out / f"{kind}-detail.png")
    bpy.ops.render.render(write_still=True)

    # The opposed pair of grooves sits on the lower rim; show it from below.
    cam.location = (0.01, 0.15, -0.025)
    cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.ortho_scale = max(size) * 1.52
    s.render.resolution_x, s.render.resolution_y = 1400, 1600
    frame = cam.data.view_frame(scene=s)
    xmin, xmax = min(v.x for v in frame), max(v.x for v in frame)
    ymin, ymax = min(v.y for v in frame), max(v.y for v in frame)
    px, py = 720, 750 if kind == "leader" else 695
    offset = Vector(
        (xmin + px / 1400 * (xmax - xmin), ymax - py / 1600 * (ymax - ymin), 0)
    )
    cam.location += cam.rotation_euler.to_quaternion() @ offset
    cam.data.ortho_scale *= 0.30
    data = bpy.data.lights.new("Lower detail fill", "AREA")
    data.energy, data.size = 0.13, 0.05
    light = bpy.data.objects.new("Lower detail fill", data)
    bpy.context.collection.objects.link(light)
    light.location = (0, 0.10, -0.04)
    light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    s.render.resolution_x, s.render.resolution_y = 1200, 700
    s.render.filepath = str(out / f"{kind}-bottom.png")
    bpy.ops.render.render(write_still=True)
