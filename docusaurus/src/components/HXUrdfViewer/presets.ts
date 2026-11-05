import type {HXJointMeta, HXUrdfViewerProps} from './types';

const HX5_D20_ASSET_BASE = '/assets/hx/hx5_d20';
const HX4_D12_ASSET_BASE = '/assets/hx/hx4_d12';
const HX3_D11_ASSET_BASE = '/assets/hx/hx3_d11';
const HX1_ASSET_BASE = '/assets/hx/hx1';

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

/** HX4-D12: thumb + 3 fingers, 12 DOF. */
export const HX4_D12_RIGHT_JOINT_META: Record<string, HXJointMeta> = {
  finger_r_joint_1: {label: 'Thumb Joint 1', group: 'Thumb'},
  finger_r_joint_2: {label: 'Thumb Joint 2', group: 'Thumb'},
  finger_r_joint_3: {label: 'Thumb Joint 3', group: 'Thumb'},
  finger_r_joint_4: {label: 'Index Joint 1', group: 'Index'},
  finger_r_joint_5: {label: 'Index Joint 2', group: 'Index'},
  finger_r_joint_6: {label: 'Index Joint 3', group: 'Index'},
  finger_r_joint_7: {label: 'Middle Joint 1', group: 'Middle'},
  finger_r_joint_8: {label: 'Middle Joint 2', group: 'Middle'},
  finger_r_joint_9: {label: 'Middle Joint 3', group: 'Middle'},
  finger_r_joint_10: {label: 'Ring Joint 1', group: 'Ring'},
  finger_r_joint_11: {label: 'Ring Joint 2', group: 'Ring'},
  finger_r_joint_12: {label: 'Ring Joint 3', group: 'Ring'},
};

export const HX4_D12_RIGHT_VIEWER: HXUrdfViewerProps = {
  title: 'HX4-D12',
  urdfUrl: `${HX4_D12_ASSET_BASE}/urdf/hx4_d12_right.urdf`,
  packages: {
    hx4_d12: HX4_D12_ASSET_BASE,
  },
  jointMeta: HX4_D12_RIGHT_JOINT_META,
  groupOrder: ['Thumb', 'Index', 'Middle', 'Ring'],
};

/** HX3-D11: 3-finger hand, 11 DOF. */
export const HX3_D11_RIGHT_JOINT_META: Record<string, HXJointMeta> = {
  finger_r_joint_1: {label: 'Finger 1 Joint 1', group: 'Finger 1'},
  finger_r_joint_2: {label: 'Finger 1 Joint 2', group: 'Finger 1'},
  finger_r_joint_3: {label: 'Finger 1 Joint 3', group: 'Finger 1'},
  finger_r_joint_4: {label: 'Finger 1 Joint 4', group: 'Finger 1'},
  finger_r_joint_5: {label: 'Finger 2 Joint 1', group: 'Finger 2'},
  finger_r_joint_6: {label: 'Finger 2 Joint 2', group: 'Finger 2'},
  finger_r_joint_7: {label: 'Finger 2 Joint 3', group: 'Finger 2'},
  finger_r_joint_8: {label: 'Finger 3 Joint 1', group: 'Finger 3'},
  finger_r_joint_9: {label: 'Finger 3 Joint 2', group: 'Finger 3'},
  finger_r_joint_10: {label: 'Finger 3 Joint 3', group: 'Finger 3'},
  finger_r_joint_11: {label: 'Finger 3 Joint 4', group: 'Finger 3'},
};

export const HX3_D11_RIGHT_VIEWER: HXUrdfViewerProps = {
  title: 'HX3-D11',
  urdfUrl: `${HX3_D11_ASSET_BASE}/urdf/hx3_d11_right.urdf`,
  packages: {
    hx3_d11: HX3_D11_ASSET_BASE,
  },
  jointMeta: HX3_D11_RIGHT_JOINT_META,
  groupOrder: ['Finger 1', 'Finger 2', 'Finger 3'],
};

/** HX1: 3-DOF all-pitch finger from HX5-D20 index pitch chain. */
export const HX1_JOINT_META: Record<string, HXJointMeta> = {
  hx1_joint_1: {label: 'Joint 1', group: 'Finger'},
  hx1_joint_2: {label: 'Joint 2', group: 'Finger'},
  hx1_joint_3: {label: 'Joint 3', group: 'Finger'},
};

export const HX1_VIEWER: HXUrdfViewerProps = {
  title: 'HX1-D03',
  urdfUrl: `${HX1_ASSET_BASE}/urdf/hx1.urdf`,
  packages: {
    hx1: HX1_ASSET_BASE,
  },
  jointMeta: HX1_JOINT_META,
  groupOrder: ['Finger'],
};
