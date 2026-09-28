export type Vec3 = [number, number, number];
export interface Part {
  id: number;
  node: string;
  sourceName: string;
  label: string;
  group: number;
  groupName: string;
  center: Vec3;
  finalPosition: Vec3;
  cable?: boolean;
}
export interface Step {
  focusBounds?: { center: Vec3; size: Vec3 };
  morphTracks?: Record<string, number[][]>;
  rotationTracks?: Record<string, { axis: Vec3; keys: number[][] }>;
  staticReview?: boolean;
  reference?: { url: string; label: string };
  index: number;
  label: string;
  chapter: string;
  title: string;
  part: string;
  officialLabel?: string;
  officialLabelNote?: string;
  officialLabelSource?: { video: string; timeSeconds: number; url: string };
  quantity: string;
  instructions: string[];
  prepareInstruction?: string;
  routing?: { frameId: number; openings: { label: string; point: Vec3 }[] };
  sourceFrames: {
    start: number;
    appear: number;
    insert: number;
    seated: number;
    end: number;
  } | null;
  motionTiming?: { prepareEnd: number };
  wiringCable?: number;
  duration: number;
  visible: number[];
  active: number[];
  offsets: Record<string, Vec3>;
  tracks: Record<string, number[][]>;
  camera: { target: Vec3; direction: Vec3; scale: number };
  isJoin: boolean;
}
export interface CableEnd {
  label: string;
  base: Vec3;
  normal: Vec3;
  right: Vec3;
  depth: Vec3;
  partId: number;
}
export interface Cable {
  partId: number;
  from: CableEnd;
  to: CableEnd;
}
export interface Manual {
  asset?: string;
  hardware?: string;
  cables?: Cable[];
  schemaVersion: number;
  model: "leader" | "follower";
  revision: string;
  sourceFPS: number;
  units: string;
  parts: Part[];
  steps: Step[];
  scope: string;
  appearance: string;
  legacyStepLabels?: string[];
}
