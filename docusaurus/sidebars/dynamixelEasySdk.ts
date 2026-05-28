import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const dynamixelEasySdkSidebar: SidebarsConfig[string] = [
  doc('software/dynamixel_easy_sdk/dynamixel_easy_sdk', 'DYNAMIXEL Easy SDK'),
  doc('software/dynamixel_easy_sdk/getting_started', 'Getting Started'),
  {
    type: 'category',
    label: 'Single Motor Tutorial',
    link: {type: 'doc', id: 'software/dynamixel_easy_sdk/single_motor_tutorial/single_motor_tutorial'},
    items: [
      doc('software/dynamixel_easy_sdk/single_motor_tutorial/single_motor_tutorial_step1', 'Step 1: Moving Dynamixel'),
      doc('software/dynamixel_easy_sdk/single_motor_tutorial/single_motor_tutorial_step2', 'Step 2: Read Data from Dynamixel'),
      doc('software/dynamixel_easy_sdk/single_motor_tutorial/single_motor_tutorial_step3', 'Step 3: Leader and Follower'),
      doc('software/dynamixel_easy_sdk/single_motor_tutorial/single_motor_tutorial_step4', 'Step 4: OMX Teleoperation'),
    ],
  },
  {
    type: 'category',
    label: 'Group Motor Tutorial',
    link: {type: 'doc', id: 'software/dynamixel_easy_sdk/group_motor_tutorial/group_motor_tutorial'},
    items: [
      doc('software/dynamixel_easy_sdk/group_motor_tutorial/group_motor_tutorial_step5', 'Step 5: Multi Motor Sync Read/Write'),
      doc('software/dynamixel_easy_sdk/group_motor_tutorial/group_motor_tutorial_step6', 'Step 6: Multi Motor Bulk Read/Write'),
      doc('software/dynamixel_easy_sdk/group_motor_tutorial/group_motor_tutorial_step7', 'Step 7: Group Motor Teleoperation'),
    ],
  },
  {
    type: 'category',
    label: 'API Reference',
    link: {type: 'doc', id: 'software/dynamixel_easy_sdk/api_reference/api_reference'},
    items: [
      doc('software/dynamixel_easy_sdk/api_reference/api_reference_connector', 'Connector'),
      doc('software/dynamixel_easy_sdk/api_reference/api_reference_motor', 'Motor'),
      doc('software/dynamixel_easy_sdk/api_reference/api_reference_group_executor', 'Group Executor'),
      doc('software/dynamixel_easy_sdk/api_reference/api_reference_data_types', 'Data Types'),
      doc('software/dynamixel_easy_sdk/api_reference/api_reference_dynamixel_error', 'DYNAMIXEL Error'),
    ],
  },
];

export default dynamixelEasySdkSidebar;
