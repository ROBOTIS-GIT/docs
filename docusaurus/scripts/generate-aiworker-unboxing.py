#!/usr/bin/env python3
"""Rebuild the unboxing MP4s and posters from the original packing animations.

Usage: python3 scripts/generate-aiworker-unboxing.py /path/to/originals
Requires FFmpeg with libx264. Set FFMPEG to use a non-default executable.
Timings are source seconds, start inclusive / end exclusive, in steps.json.
Clips run at four times the original speed. The first carton step is a procedural
3D illustration rendered by render-aiworker-cutting.cjs (requires Node, Three.js,
Playwright/Chromium); other steps reverse the original packing footage.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'src/components/AiWorkerUnboxing/steps.json'
OUTPUT = ROOT / 'static/img/systems/aiworker/unboxing'
# Exclude header, original instructions, timeline and footer from 1920x1080 input.
FILTER = 'crop=1400:880:510:80,scale=1120:704,reverse,setpts=(PTS-STARTPTS)/4,fps=24'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_directory', type=Path)
    args = parser.parse_args()
    ffmpeg = os.environ.get('FFMPEG', 'ffmpeg')
    packages = json.loads(MANIFEST.read_text())
    for package in packages:
        source = args.source_directory / package['source']
        if not source.is_file():
            parser.error(f'Missing original video: {source}')
    records = {}
    for package in packages:
        source = args.source_directory / package['source']
        records[source.name] = hashlib.sha256(source.read_bytes()).hexdigest()
        destination = OUTPUT / package['id']
        destination.mkdir(parents=True, exist_ok=True)
        for step in package['steps']:
            assert 0 <= step['start'] < step['end'], step['id']
            video = destination / f"{step['id']}.mp4"
            poster = destination / f"{step['id']}.jpg"
            if step.get('animation') == 'scissors':
                subprocess.run([
                    os.environ.get('NODE', 'node'),
                    str(ROOT / 'scripts/render-aiworker-cutting.cjs'),
                ], check=True)
            else:
                subprocess.run([
                    ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                    '-ss', str(step['start']), '-t', str(step['end'] - step['start']),
                    '-i', str(source),
                    '-vf', FILTER, '-an', '-c:v', 'libx264', '-preset', 'medium',
                    '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                    '-threads', '2', str(video),
                ], check=True)
            subprocess.run([
                ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                '-ss', '0.75' if step.get('animation') == 'scissors' else '0',
                '-i', str(video), '-frames:v', '1', '-q:v', '2', str(poster),
            ], check=True)
            method = '3D illustration' if step.get('animation') == 'scissors' else 'reversed source'
            print(f"{package['id']}/{step['id']}: {method} at 4x", flush=True)
    (OUTPUT / 'sources.json').write_text(json.dumps({
        'sourceSha256': records,
        'ffmpegVersion': subprocess.check_output([ffmpeg, '-version'], text=True).splitlines()[0],
        'filter': FILTER,
        'playbackSpeed': 4,
        'proceduralScenes': {'carton/cut-film-and-tape': {
            'renderer': 'scripts/render-aiworker-cutting.cjs',
            'scene': 'scripts/unboxing-cutting-scene.mjs',
            'sceneSha256': hashlib.sha256((ROOT / 'scripts/unboxing-cutting-scene.mjs').read_bytes()).hexdigest(),
            'description': 'New 3D cutting illustration; not reversed source footage',
        }},
        'encoding': 'H.264 libx264, CRF 22, medium, yuv420p, 24 fps, no audio, faststart',
        'timings': 'src/components/AiWorkerUnboxing/steps.json',
    }, indent=2) + '\n')


if __name__ == '__main__':
    main()
