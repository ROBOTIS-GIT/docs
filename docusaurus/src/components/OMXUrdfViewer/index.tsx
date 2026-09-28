import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {OMXUrdfViewerProps} from './types';
import './styles.css';

export type {OMXJointMeta, OMXUrdfViewerProps} from './types';

type ViewerState = 'loading' | 'ready' | 'error';

type JointControl = {
  name: string;
  label: string;
  group: string;
  type: string;
  lower: number;
  upper: number;
  value: number;
};

const DEFAULT_GROUP_ORDER = ['Arm', 'Gripper'];

function formatJointValue(joint: JointControl): string {
  if (joint.type === 'prismatic') {
    return `${(joint.value * 1000).toFixed(1)} mm`;
  }
  return `${((joint.value * 180) / Math.PI).toFixed(0)}°`;
}

function groupJoints(
  joints: JointControl[],
  groupOrder: string[],
): Array<{group: string; joints: JointControl[]}> {
  const known = new Set(groupOrder);
  const orderedGroups = [
    ...groupOrder,
    ...Array.from(new Set(joints.map((joint) => joint.group))).filter((group) => !known.has(group)),
  ];

  return orderedGroups
    .map((group) => ({
      group,
      joints: joints.filter((joint) => joint.group === group),
    }))
    .filter((entry) => entry.joints.length > 0);
}

export default function OMXUrdfViewer({
  title,
  urdfUrl,
  packages,
  hint = 'Drag to orbit, scroll to zoom, and use the sliders to pose joints.',
  jointMeta = {},
  hiddenJoints = [],
  groupOrder = DEFAULT_GROUP_ORDER,
  initialAutoRotate = true,
}: OMXUrdfViewerProps): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const robotRef = useRef<any>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  const resetPoseRef = useRef<(() => void) | null>(null);
  const autoRotateRef = useRef<((enabled: boolean) => void) | null>(null);
  const jointFramesRef = useRef<((visible: boolean) => void) | null>(null);
  const jointMetaRef = useRef(jointMeta);
  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [statusText, setStatusText] = useState(`Loading ${title} URDF...`);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [jointFramesVisible, setJointFramesVisible] = useState(false);
  const [joints, setJoints] = useState<JointControl[]>([]);

  jointMetaRef.current = jointMeta;
  const packagesKey = JSON.stringify(packages);
  const hiddenJointsKey = JSON.stringify(hiddenJoints);

  const groupedJoints = useMemo(
    () => groupJoints(joints, groupOrder),
    [joints, groupOrder],
  );

  useEffect(() => {
    let disposed = false;
    let animationFrame = 0;
    let finalizeTimer = 0;
    let resizeObserver: ResizeObserver | null = null;
    let renderer: any = null;
    let controls: any = null;
    let scene: any = null;
    const resolvedPackages = JSON.parse(packagesKey) as Record<string, string>;
    const hiddenJointNames = new Set(JSON.parse(hiddenJointsKey) as string[]);

    setViewerState('loading');
    setStatusText(`Loading ${title} URDF...`);
    setJoints([]);
    setAutoRotate(initialAutoRotate);
    setJointFramesVisible(false);

    const disposeTextureValue = (value: any) => {
      if (!value) return;
      if (value.isTexture) {
        value.dispose();
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(disposeTextureValue);
      }
    };

    const disposeMaterial = (material: any) => {
      Object.values(material).forEach(disposeTextureValue);
      if (material.uniforms) {
        Object.values(material.uniforms).forEach((uniform: any) => {
          disposeTextureValue(uniform?.value);
        });
      }
      material.dispose?.();
    };

    const disposeObjectResources = (root: any) => {
      root.traverse((object: any) => {
        object.geometry?.dispose?.();

        if (Array.isArray(object.material)) {
          object.material.forEach(disposeMaterial);
        } else if (object.material) {
          disposeMaterial(object.material);
        }
      });
    };

    const isControllableJoint = (joint: any) =>
      joint?.jointType &&
      joint.jointType !== 'fixed' &&
      !joint.isURDFMimicJoint &&
      !hiddenJointNames.has(joint.name);

    async function initViewer() {
      const mount = mountRef.current;
      if (!mount) return;

      try {
        const [{default: URDFLoader}, THREE, {OrbitControls}] = await Promise.all([
          import('urdf-loader'),
          import('three'),
          import('three/examples/jsm/controls/OrbitControls.js'),
        ]);

        if (disposed || !mountRef.current) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf6f7f9);

        const camera = new THREE.PerspectiveCamera(38, 1, 0.001, 20);
        camera.up.set(0, 0, 1);

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        mount.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.7;
        controls.screenSpacePanning = true;

        scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd2dc, 1.7));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
        keyLight.position.set(0.8, -1.2, 1.6);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.7);
        fillLight.position.set(-1.1, 0.8, 0.7);
        scene.add(fillLight);

        const floor = new THREE.GridHelper(0.6, 24, 0xb8c0cc, 0xd7dce4);
        floor.rotation.x = Math.PI / 2;
        floor.position.z = 0;
        floor.material.transparent = true;
        floor.material.opacity = 0.5;
        scene.add(floor);

        let loadedRobot: any = null;
        let homeView: {
          cameraPosition: any;
          target: any;
          near: number;
          far: number;
          floorScale: number;
        } | null = null;
        let finalized = false;
        let geometryLoadDone = false;
        let initialJoints: JointControl[] = [];
        let jointFrameHelpers: any[] = [];

        const applyHomeView = () => {
          if (!homeView) return;

          camera.near = homeView.near;
          camera.far = homeView.far;
          camera.zoom = 1;
          camera.position.copy(homeView.cameraPosition);
          camera.lookAt(homeView.target);
          camera.updateProjectionMatrix();

          controls.target.copy(homeView.target);
          controls.update();

          floor.scale.setScalar(homeView.floorScale);
          floor.position.z = 0;
        };

        const syncJointsFromRobot = (robot: any) => {
          const movable = Object.values(robot.joints || {})
            .filter(isControllableJoint)
            .sort((a: any, b: any) =>
              String(a.name).localeCompare(String(b.name), undefined, {numeric: true}),
            );

          return movable.map((joint: any) => {
            const meta = jointMetaRef.current[joint.name] || {
              label: joint.name,
              group: 'Other',
            };
            const lower = Number.isFinite(joint.limit?.lower) ? joint.limit.lower : -Math.PI;
            const upper = Number.isFinite(joint.limit?.upper) ? joint.limit.upper : Math.PI;
            const value = Number.isFinite(joint.angle) ? joint.angle : 0;
            return {
              name: joint.name,
              label: meta.label,
              group: meta.group,
              type: joint.jointType,
              lower,
              upper,
              value,
            } satisfies JointControl;
          });
        };

        const finishWhenGeometryReady = () => {
          if (disposed || finalized || !loadedRobot) return;
          if (!geometryLoadDone) return;

          loadedRobot.updateMatrixWorld(true);
          const pendingBox = new THREE.Box3().setFromObject(loadedRobot);
          const pendingSize = new THREE.Vector3();
          pendingBox.getSize(pendingSize);
          const meshReady =
            !pendingBox.isEmpty() && Math.max(pendingSize.x, pendingSize.y, pendingSize.z) > 0.01;

          if (!meshReady) {
            finalizeTimer = window.setTimeout(finishWhenGeometryReady, 120);
            return;
          }

          loadedRobot.traverse((object: any) => {
            if (!object.isMesh) return;
            object.castShadow = true;
            object.receiveShadow = true;
          });

          finalized = true;
          initialJoints = syncJointsFromRobot(loadedRobot);
          setJoints(initialJoints);

          window.requestAnimationFrame(() => {
            if (disposed) return;
            resize();
            frameRobot(loadedRobot);
            createJointFrameHelpers(loadedRobot);
            applyHomeView();
            controls.saveState();
            controls.autoRotate = initialAutoRotate;
            setStatusText(`${title} URDF loaded`);
            setViewerState('ready');

            resetViewRef.current = () => {
              controls.reset();
              applyHomeView();
              controls.saveState();
            };

            resetPoseRef.current = () => {
              if (!robotRef.current) return;
              initialJoints.forEach((joint) => {
                robotRef.current.setJointValue(joint.name, 0);
              });
              setJoints(initialJoints.map((joint) => ({...joint, value: 0})));
            };
          });
        };

        const createJointFrameHelpers = (robot: any) => {
          if (jointFrameHelpers.length > 0) return;

          const movableJoints = Object.values(robot.joints || {}).filter(isControllableJoint);

          jointFrameHelpers = movableJoints.map((joint: any) => {
            const helper = new THREE.AxesHelper(0.04);
            helper.name = `${joint.name || 'joint'}_frame_helper`;
            helper.renderOrder = 10;
            helper.traverse((object: any) => {
              if (object.material) {
                object.material.depthTest = false;
                object.material.transparent = true;
                object.material.opacity = 0.92;
              }
            });
            helper.visible = false;
            joint.add(helper);
            return helper;
          });
        };

        const loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = (_url: string, loaded: number, total: number) => {
          if (disposed) return;
          if (!finalized && total > 0) {
            setStatusText(`Loading meshes ${loaded}/${total}...`);
          }
        };
        loadingManager.onLoad = () => {
          if (disposed) return;
          geometryLoadDone = true;
          finishWhenGeometryReady();
        };

        const loader = new URDFLoader(loadingManager);
        loader.packages = resolvedPackages;

        const resize = () => {
          if (!mountRef.current || !renderer) return;
          const rect = mountRef.current.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width));
          const height = Math.max(1, Math.round(rect.height));
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };

        const frameRobot = (robot: any) => {
          robot.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(robot);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          robot.position.x -= center.x;
          robot.position.y -= center.y;
          robot.position.z -= box.min.z;
          robot.updateMatrixWorld(true);

          const fittedBox = new THREE.Box3().setFromObject(robot);
          fittedBox.getSize(size);
          fittedBox.getCenter(center);

          const maxDim = Math.max(size.x, size.y, size.z, 0.05);
          const target = center.clone();
          const corners = [
            new THREE.Vector3(fittedBox.min.x, fittedBox.min.y, fittedBox.min.z),
            new THREE.Vector3(fittedBox.min.x, fittedBox.min.y, fittedBox.max.z),
            new THREE.Vector3(fittedBox.min.x, fittedBox.max.y, fittedBox.min.z),
            new THREE.Vector3(fittedBox.min.x, fittedBox.max.y, fittedBox.max.z),
            new THREE.Vector3(fittedBox.max.x, fittedBox.min.y, fittedBox.min.z),
            new THREE.Vector3(fittedBox.max.x, fittedBox.min.y, fittedBox.max.z),
            new THREE.Vector3(fittedBox.max.x, fittedBox.max.y, fittedBox.min.z),
            new THREE.Vector3(fittedBox.max.x, fittedBox.max.y, fittedBox.max.z),
          ];
          const radius = Math.max(
            ...corners.map((corner: any) => corner.distanceTo(target)),
            maxDim * 0.5,
          );
          const verticalFov = THREE.MathUtils.degToRad(camera.fov);
          const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
          const fitFov = Math.min(verticalFov, horizontalFov);
          const distance = (radius / Math.sin(fitFov / 2)) * 1.45;
          const cameraDirection = new THREE.Vector3(0.85, -1.05, 0.55).normalize();

          homeView = {
            cameraPosition: target.clone().add(cameraDirection.multiplyScalar(distance)),
            target,
            near: Math.max(maxDim / 400, 0.0005),
            far: distance + radius * 8,
            floorScale: Math.max(1, maxDim * 3.2),
          };
          applyHomeView();
        };

        loader.load(
          urdfUrl,
          (robot: any) => {
            if (disposed || !scene) {
              disposeObjectResources(robot);
              return;
            }

            loadedRobot = robot;
            robotRef.current = robot;
            scene.add(robot);
            finishWhenGeometryReady();
          },
          undefined,
          (error: unknown) => {
            if (disposed) return;
            console.error('[OMXUrdfViewer] Failed to load URDF', error);
            setViewerState('error');
            setStatusText(`Could not load the ${title} URDF model.`);
          },
        );

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        resize();

        autoRotateRef.current = (enabled: boolean) => {
          if (controls) {
            controls.autoRotate = enabled;
          }
        };
        jointFramesRef.current = (visible: boolean) => {
          jointFrameHelpers.forEach((helper) => {
            helper.visible = visible;
          });
        };

        const animate = () => {
          if (disposed) return;
          controls.update();
          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(animate);
        };
        animate();
      } catch (error) {
        if (disposed) return;
        console.error('[OMXUrdfViewer] Viewer initialization failed', error);
        setViewerState('error');
        setStatusText('Could not initialize the 3D viewer.');
      }
    }

    initViewer();

    return () => {
      disposed = true;
      if (finalizeTimer) window.clearTimeout(finalizeTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (resizeObserver) resizeObserver.disconnect();
      if (controls) controls.dispose();
      if (scene) {
        disposeObjectResources(scene);
        scene.clear();
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement?.remove();
      }
      robotRef.current = null;
      resetViewRef.current = null;
      resetPoseRef.current = null;
      autoRotateRef.current = null;
      jointFramesRef.current = null;
    };
  }, [title, urdfUrl, packagesKey, hiddenJointsKey, initialAutoRotate]);

  useEffect(() => {
    autoRotateRef.current?.(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    jointFramesRef.current?.(jointFramesVisible);
  }, [jointFramesVisible]);

  const onJointChange = (name: string, value: number) => {
    robotRef.current?.setJointValue(name, value);
    setJoints((prev) => prev.map((joint) => (joint.name === name ? {...joint, value} : joint)));
  };

  return (
    <section className="omx-urdf-viewer" aria-label={`${title} interactive URDF model`}>
      <div className="omx-urdf-viewer__layout">
        <div className="omx-urdf-viewer__stage" ref={mountRef}>
          <div className={`omx-urdf-viewer__status omx-urdf-viewer__status--${viewerState}`}>
            {statusText}
          </div>
          <button
            type="button"
            className="omx-urdf-viewer__canvas-toggle"
            aria-label={jointFramesVisible ? 'Hide joint frames' : 'Show joint frames'}
            aria-pressed={jointFramesVisible}
            onClick={() => setJointFramesVisible((value) => !value)}
            disabled={viewerState !== 'ready'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{jointFramesVisible ? 'Hide Joint Frames' : 'Show Joint Frames'}</span>
          </button>
        </div>

        <aside className="omx-urdf-viewer__joints" aria-label="Joint controls">
          <div className="omx-urdf-viewer__joints-header">
            <p className="omx-urdf-viewer__joints-title">Joint Controls</p>
            <p className="omx-urdf-viewer__joints-hint">Move each joint to preview arm and gripper motion.</p>
          </div>

          {viewerState !== 'ready' && joints.length === 0 ? (
            <p className="omx-urdf-viewer__joints-empty">Joints appear after the model loads.</p>
          ) : (
            groupedJoints.map(({group, joints: groupJoints}) => (
              <div key={group} className="omx-urdf-viewer__joint-group">
                <p className="omx-urdf-viewer__joint-group-title">{group}</p>
                {groupJoints.map((joint) => (
                  <label key={joint.name} className="omx-urdf-viewer__joint-row">
                    <span className="omx-urdf-viewer__joint-label">
                      <span>{joint.label}</span>
                      <span className="omx-urdf-viewer__joint-value">{formatJointValue(joint)}</span>
                    </span>
                    <input
                      type="range"
                      min={joint.lower}
                      max={joint.upper}
                      step={(joint.upper - joint.lower) / 200 || 0.01}
                      value={joint.value}
                      onChange={(event) => onJointChange(joint.name, Number(event.target.value))}
                      disabled={viewerState !== 'ready'}
                    />
                  </label>
                ))}
              </div>
            ))
          )}
        </aside>
      </div>

      <div className="omx-urdf-viewer__toolbar">
        <div>
          <p className="omx-urdf-viewer__title">{title}</p>
          <p className="omx-urdf-viewer__hint">{hint}</p>
        </div>
        <div className="omx-urdf-viewer__actions">
          <button type="button" onClick={() => resetPoseRef.current?.()} disabled={viewerState !== 'ready'}>
            Reset Pose
          </button>
          <button type="button" onClick={() => resetViewRef.current?.()} disabled={viewerState !== 'ready'}>
            Reset View
          </button>
          <button
            type="button"
            aria-pressed={autoRotate}
            onClick={() => setAutoRotate((value) => !value)}
            disabled={viewerState !== 'ready'}
          >
            {autoRotate ? 'Pause Rotate' : 'Auto Rotate'}
          </button>
        </div>
      </div>
    </section>
  );
}
