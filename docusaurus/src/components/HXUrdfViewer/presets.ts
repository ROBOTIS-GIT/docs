import type {HXJointMeta, HXUrdfViewerProps} from './types';

const HX5_D20_ASSET_BASE = '/assets/hx/hx5_d20';

/** Right-hand joint labels aligned with HX5-D20 hardware nomenclature. */
export const HX5_D20_RIGHT_JOINT_META: Record<string, HXJointMeta> = {
  finger_r_joint_1: {label: 'Thumb CMC', group: 'Thumb'},
  finger_r_joint_2: {label: 'Thumb MCP Yaw', group: 'Thumb'},
  finger_r_joint_3: {label: 'Thumb MCP Pitch', group: 'Thumb'},
  finger_r_joint_4: {label: 'Thumb IP', group: 'Thumb'},
  finger_r_joint_5: {label: 'Index MCP Roll', group: 'Index'},
  finger_r_joint_6: {label: 'Index MCP Pitch', group: 'Index'},
  finger_r_joint_7: {label: 'Index PIP', group: 'Index'},
  finger_r_joint_8: {label: 'Index DIP', group: 'Index'},
  finger_r_joint_9: {label: 'Middle MCP Roll', group: 'Middle'},
  finger_r_joint_10: {label: 'Middle MCP Pitch', group: 'Middle'},
  finger_r_joint_11: {label: 'Middle PIP', group: 'Middle'},
  finger_r_joint_12: {label: 'Middle DIP', group: 'Middle'},
  finger_r_joint_13: {label: 'Ring MCP Roll', group: 'Ring'},
  finger_r_joint_14: {label: 'Ring MCP Pitch', group: 'Ring'},
  finger_r_joint_15: {label: 'Ring PIP', group: 'Ring'},
  finger_r_joint_16: {label: 'Ring DIP', group: 'Ring'},
  finger_r_joint_17: {label: 'Pinky MCP Roll', group: 'Pinky'},
  finger_r_joint_18: {label: 'Pinky MCP Pitch', group: 'Pinky'},
  finger_r_joint_19: {label: 'Pinky PIP', group: 'Pinky'},
  finger_r_joint_20: {label: 'Pinky DIP', group: 'Pinky'},
};

export const HX5_D20_RIGHT_VIEWER: HXUrdfViewerProps = {
  title: 'HX5-D20',
  urdfUrl: `${HX5_D20_ASSET_BASE}/urdf/hx5_d20_right.urdf`,
  packages: {
    hx5_d20: HX5_D20_ASSET_BASE,
  },
  jointMeta: HX5_D20_RIGHT_JOINT_META,
};
