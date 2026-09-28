export type OMXJointMeta = {
  label: string;
  group: string;
};

export type OMXUrdfViewerProps = {
  /** Display title in the toolbar */
  title: string;
  /** Absolute site path to the URDF file, e.g. `/assets/omx/urdf/omx_f/omx_f.urdf` */
  urdfUrl: string;
  /**
   * Maps `package://` names from the URDF to static asset bases.
   * Example: `{ omx: '/assets/omx' }`
   */
  packages: Record<string, string>;
  /** Optional short hint under the title */
  hint?: string;
  /** Friendly joint labels / groups. Unknown joints fall back to raw names. */
  jointMeta?: Record<string, OMXJointMeta>;
  /** Joint names to leave out of the controls, e.g. joints driven by a mimic tag. */
  hiddenJoints?: string[];
  /** Preferred group display order. Extra groups append after these. */
  groupOrder?: string[];
  /** Start with auto-rotate enabled (defaults to true) */
  initialAutoRotate?: boolean;
};
