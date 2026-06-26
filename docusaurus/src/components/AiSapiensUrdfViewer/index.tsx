import React, {useEffect, useRef, useState} from 'react';
import './styles.css';

const ASSET_BASE = '/assets/aisapiens/k1/ai_sapiens_description';
const URDF_URL = `${ASSET_BASE}/urdf/k1_rev1/k1.urdf`;

type ViewerState = 'loading' | 'ready' | 'error';

export default function AiSapiensUrdfViewer(): React.JSX.Element {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const resetRef = useRef<(() => void) | null>(null);
  const autoRotateRef = useRef<((enabled: boolean) => void) | null>(null);
  const jointFramesRef = useRef<((visible: boolean) => void) | null>(null);
  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [statusText, setStatusText] = useState('Loading AI Sapiens K1 URDF...');
  const [autoRotate, setAutoRotate] = useState(true);
  const [jointFramesVisible, setJointFramesVisible] = useState(false);

  useEffect(() => {
    let disposed = false;
    let animationFrame = 0;
    let finalizeTimer = 0;
    let resizeObserver: ResizeObserver | null = null;
    let renderer: any = null;
    let controls: any = null;
    let scene: any = null;

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

        const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
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
        controls.autoRotateSpeed = 0.55;
        controls.screenSpacePanning = true;

        scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd2dc, 1.7));

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
        keyLight.position.set(2.5, -3.5, 4.8);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(2048, 2048);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.65);
        fillLight.position.set(-3, 2, 2);
        scene.add(fillLight);

        const floor = new THREE.GridHelper(1.8, 18, 0xb8c0cc, 0xd7dce4);
        floor.rotation.x = Math.PI / 2;
        floor.position.z = 0;
        floor.material.transparent = true;
        floor.material.opacity = 0.58;
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

        const finishWhenGeometryReady = () => {
          if (disposed || finalized || !loadedRobot) return;
          if (!geometryLoadDone) return;

          loadedRobot.updateMatrixWorld(true);
          const pendingBox = new THREE.Box3().setFromObject(loadedRobot);
          const pendingSize = new THREE.Vector3();
          pendingBox.getSize(pendingSize);
          const meshReady = !pendingBox.isEmpty() && Math.max(pendingSize.x, pendingSize.y, pendingSize.z) > 0.05;

          if (!meshReady) {
            finalizeTimer = window.setTimeout(finishWhenGeometryReady, 120);
            return;
          }

          loadedRobot.traverse((object: any) => {
            if (!object.isMesh) return;
            object.castShadow = true;
            object.receiveShadow = true;

            const material = object.material;
            if (material) {
              material.color?.set?.(0xb9c0ca);
              material.roughness = 0.58;
              material.metalness = 0.08;
              material.needsUpdate = true;
            }
          });

          finalized = true;

          window.requestAnimationFrame(() => {
            if (disposed) return;
            resize();
            frameRobot(loadedRobot);
            createJointFrameHelpers(loadedRobot);
            applyHomeView();
            controls.saveState();
            controls.autoRotate = autoRotate;
            setStatusText('AI Sapiens K1 URDF loaded');
            setViewerState('ready');

            resetRef.current = () => {
              controls.reset();
              applyHomeView();
              controls.saveState();
            };
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
        loader.packages = {
          ai_sapiens_description: ASSET_BASE,
        };

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

          const maxDim = Math.max(size.x, size.y, size.z, 1);
          const target = new THREE.Vector3(0, 0, size.z * 0.62);
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
          const radius = Math.max(...corners.map((corner: any) => corner.distanceTo(target)));
          const verticalFov = THREE.MathUtils.degToRad(camera.fov);
          const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
          const fitFov = Math.min(verticalFov, horizontalFov);
          const distance = (radius / Math.sin(fitFov / 2)) * 1.32;
          const cameraDirection = new THREE.Vector3(0.72, -1.12, 0.34).normalize();

          homeView = {
            cameraPosition: target.clone().add(cameraDirection.multiplyScalar(distance)),
            target,
            near: Math.max(maxDim / 200, 0.001),
            far: distance + radius * 6,
            floorScale: Math.max(1, maxDim * 1.2),
          };
          applyHomeView();
        };

        const createJointFrameHelpers = (robot: any) => {
          if (jointFrameHelpers.length > 0) return;

          const joints = Object.values(robot.joints || {}).filter((joint: any) => (
            joint?.jointType && joint.jointType !== 'fixed'
          ));

          jointFrameHelpers = joints.map((joint: any) => {
            const helper = new THREE.AxesHelper(0.085);
            helper.name = `${joint.name || 'joint'}_frame_helper`;
            helper.renderOrder = 10;
            helper.traverse((object: any) => {
              if (object.material) {
                object.material.depthTest = false;
                object.material.transparent = true;
                object.material.opacity = 0.92;
              }
            });
            helper.visible = jointFramesVisible;
            joint.add(helper);
            return helper;
          });
        };

        loader.load(
          URDF_URL,
          (robot: any) => {
            if (disposed || !scene) {
              disposeObjectResources(robot);
              return;
            }

            loadedRobot = robot;
            scene.add(robot);
            finishWhenGeometryReady();
          },
          undefined,
          (error: unknown) => {
            if (disposed) return;
            console.error('[AiSapiensUrdfViewer] Failed to load URDF', error);
            setViewerState('error');
            setStatusText('Could not load the K1 URDF model.');
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
        console.error('[AiSapiensUrdfViewer] Viewer initialization failed', error);
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
      resetRef.current = null;
      autoRotateRef.current = null;
      jointFramesRef.current = null;
    };
  }, []);

  useEffect(() => {
    autoRotateRef.current?.(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    jointFramesRef.current?.(jointFramesVisible);
  }, [jointFramesVisible]);

  return (
    <section className="ai-sapiens-urdf-viewer" aria-label="AI Sapiens K1 interactive URDF model">
      <div className="ai-sapiens-urdf-viewer__stage" ref={mountRef}>
        <div className={`ai-sapiens-urdf-viewer__status ai-sapiens-urdf-viewer__status--${viewerState}`}>
          {statusText}
        </div>
        <button
          type="button"
          className="ai-sapiens-urdf-viewer__canvas-toggle"
          aria-label={jointFramesVisible ? 'Hide joint frames' : 'Show joint frames'}
          aria-pressed={jointFramesVisible}
          onClick={() => setJointFramesVisible((value) => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{jointFramesVisible ? 'Hide Joint Frames' : 'Show Joint Frames'}</span>
        </button>
      </div>

      <div className="ai-sapiens-urdf-viewer__toolbar">
        <div>
          <p className="ai-sapiens-urdf-viewer__title">AI Sapiens K1</p>
          <p className="ai-sapiens-urdf-viewer__hint">Drag to orbit and scroll to zoom.</p>
        </div>
        <div className="ai-sapiens-urdf-viewer__actions">
          <button type="button" onClick={() => resetRef.current?.()}>
            Reset View
          </button>
          <button
            type="button"
            aria-pressed={autoRotate}
            onClick={() => setAutoRotate((value) => !value)}
          >
            {autoRotate ? 'Pause Rotate' : 'Auto Rotate'}
          </button>
        </div>
      </div>
    </section>
  );
}
