import type {OMXJointMeta, OMXUrdfViewerProps} from './types';

const OMX_ASSET_BASE = '/assets/omx';

/** Joint names follow `open_manipulator_bringup/config/omx_f_follower_ai/hardware_controller_manager.yaml`. */
export const OMX_JOINT_META: Record<string, OMXJointMeta> = {
  joint1: {label: 'Joint 1', group: 'Arm'},
  joint2: {label: 'Joint 2', group: 'Arm'},
  joint3: {label: 'Joint 3', group: 'Arm'},
  joint4: {label: 'Joint 4', group: 'Arm'},
  joint5: {label: 'Joint 5', group: 'Arm'},
  gripper_joint_1: {label: 'Gripper', group: 'Gripper'},
};

export const OMX_F_VIEWER: OMXUrdfViewerProps = {
  title: 'OMX-F',
  urdfUrl: `${OMX_ASSET_BASE}/urdf/omx_f/omx_f.urdf`,
  packages: {
    omx: OMX_ASSET_BASE,
  },
  jointMeta: OMX_JOINT_META,
  hiddenJoints: ['gripper_joint_2'],
};

export const OMX_L_VIEWER: OMXUrdfViewerProps = {
  title: 'OMX-L',
  urdfUrl: `${OMX_ASSET_BASE}/urdf/omx_l/omx_l.urdf`,
  packages: {
    omx: OMX_ASSET_BASE,
  },
  jointMeta: OMX_JOINT_META,
};
