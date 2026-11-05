export type HXJointMeta = {
  label: string;
  group: string;
};

export type HXUrdfViewerProps = {
  /** Display title in the toolbar */
  title: string;
  /** Absolute site path to the URDF file, e.g. `/assets/hx/hx5_d20/urdf/hx5_d20_right.urdf` */
  urdfUrl: string;
  /**
   * Maps `package://` names from the URDF to static asset bases.
   * Example: `{ hx5_d20: '/assets/hx/hx5_d20' }`
   */
  packages: Record<string, string>;
  /** Optional short hint under the title */
  hint?: string;
  /** Friendly joint labels / finger groups. Unknown joints fall back to raw names. */
  jointMeta?: Record<string, HXJointMeta>;
  /** Preferred group display order. Extra groups append after these. */
  groupOrder?: string[];
  /** Start with auto-rotate enabled (defaults to true) */
  initialAutoRotate?: boolean;
};
