# Introduction

Dynamixel Wizard helps the users manage Dynamixel more easily.  
The main roles of the program are as follows:
- Manage Dynamixel's firmware.
- Check Dynamixel's status.
- Set up the necessary modes.

![](/img/software/rplus1/wizard/dynamixel_wizard_001.png)

# Connecting Dynamixel

1. Connect Dynamixel to PC through [USB2DYNAMIXEL].
  - Please refer to [USB2DYNAMIXEL] for how to connect.
  - The appropriate power cable for Dynamixel must be connected separately.
 
2. Select the communication port.  

    ![](/img/software/rplus1/wizard/dynamixel_wizard_002.png)

    If the relevant port is appeared as "In Use," then Dynamixel Wizard cannot be used.
 
3. Search Dynamixel. The search range can be set, if necessary.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_003.png)

4. Check the searched Dynamixel in the list on the left.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_004.png)
 
5. Start the management. (Please refer to how to manage for each Dynamixel.)

    ![](/img/software/rplus1/wizard/dynamixel_wizard_005.png)

# Firmware Update

Firmware is a program installed in Dynamixel, and it controls Dynamixel.  
Dynamixel Wizard automatically detects a new firmware through internet and always keeps it updated.

![](/img/software/rplus1/wizard/dynamixel_wizard_006.png)
 
## How to update Dynamixel Firmware

1. If Dynamixel is searched, the icon of Dynamixel is checked, and it announces the update is possible as below. Select the relevant Dynamixel, and then click firmware update button.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_007.png)

2. The firmware update is started with simple messages. Especially, please be careful not to disconnect or turn off the power during the update.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_008.png)
 
3. The name of currently connected Dynamixel model and firmware information can be checked.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_009.png)
 
4. If "Next" button is clicked, the firmware update is started. Please be careful not to disconnect or turn off the power until the update is completed.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_010.png)

5. The installation result of Dynamixel firmware is checked.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_011.png)

# Firmware Recovery

If any problems occur in Dynamixel firmware, Dynamixel Wizard can restore the firmware.

**CAUTION** : Every data value will be initialized after the firmware restoration. Please check once again the ID and Baud rate before executing the program if you restored the firmware.  
Please check the mode on the USB2DYNAMIXEL. 3 pin cables should be set to TTL and 4 pin cables should be set to the RS485 switch.

## How to Restore Dynamixel Firmware

1. Execute Dynamixel Firmware Restoration Wizard.  
    Execute Dynamixel Firmware Wizard by clicking firmware restoration button on the tools.  
    When COM port is connected, the corresponding button will be inactivated. Then, please disconnect the port, and start the firmware restoration wizard.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_012.png)
 
2. Dynamixel Firmware Restoration Wizard is started with simple messages.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_013.png)
 
3. Connect only 1 Dynamixel when Dynamixel firmware is being restored.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_014.png)
 
4. Select Dynamixel Connection Port  
    Dynamixel cannot be searched automatically because the firmware is not recognized. Therefore, the users must set the Dynamixel connected port manually.  Since Dynamixel cannot be recognized if the port is in use, finish other programs, and then continue the procedure.  
    Select USB2DYNAMIXEL-connected port and press "Search" button.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_015.png)
 
5. Turn off the power of Dynamixel and then turn it back on.  
    Turn off the power of Dynamixel for restoration and then turn it on again to detect Dynamixel.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_016.png)
 
6. If Dynamixel search is succeeded, you can see the window as below.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_017.png)
 
7. Select Dynamixel Firmware  
    If Dynamixel is found, the information of downloadable firmware is appeared.  The users must select the correct model because the model name cannot be recognized automatically in Dynamixel firmware restoration mode. If an incorrect model is chosen, it is not operated normally.
 
    ![](/img/software/rplus1/wizard/dynamixel_wizard_018.png)
 
8. Restore Firmware  
    Click "Next" button to start firmware restoration.  Please be careful not to disconnect or turn off the power until it is completed.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_019.png)
 
9. Check Dynamixel Firmware Restoration Result.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_020.png)

# Test and Setup

## Management Window

The window for Dynamixel test and set up is as below.  
If the search is complete,  the searched Dynamixel is appeared on the left of the list.

![](/img/software/rplus1/wizard/dynamixel_wizard_021.png)
 
When the correct Dynamixel is selected from the list to test/setup as below, a appropriate management window is displayed on the right.  
The window helps the users manage Dynamixel more easily.  Please refer to Dynamixel manual for more information regarding each function.

![](/img/software/rplus1/wizard/dynamixel_wizard_022.png)

# MX Series Calibration

If during gear replacement the horn’s position becomes misaligned position can be realigned with calibration.
 
`Attention` This feature is only available in the MX series.

## MX Series Calibration Procedure

1. Connect hardware  
    Connect the MX hardware to USB2DYNAMIXEL. Select the switch to either TTL or RS485.  
    Use a separate power supply for the calibration adapter.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_023.jpg)

2. Run Dynamixel Wizard and click on the calibration icon.  
    Click on the calibration icon before selecting the COM port

    ![](/img/software/rplus1/wizard/dynamixel_wizard_024.jpg)

3. Begin Dynamixel calibration 

    ![](/img/software/rplus1/wizard/dynamixel_wizard_025.jpg)
 
4. Connect only one Dynamixel at a time.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_026.jpg)
 
5. Select Dynamixel connection port.  
    If the firmware does not allow connection then automatic connection is not possible. In such case select the port manually and connect.  
    If Dynamixel cannot be detected by the port due use by another program then close that other program and start again. Select the port and click on the search icon.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_027.jpg)
 
6. Dynamixel power on/off  
    Turn power off and on for search. A message will pop for successful search.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_028.jpg)
 
7. Select connected Dynamixel

    ![](/img/software/rplus1/wizard/dynamixel_wizard_029.jpg)

    ![](/img/software/rplus1/wizard/dynamixel_wizard_030.jpg)

8. Install Dynamixel calibration firmware.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_031.jpg)
 
9. Select first position.

    ![](/img/software/rplus1/wizard/dynamixel_wizard_032.jpg)

10. Select second position

    ![](/img/software/rplus1/wizard/dynamixel_wizard_033.jpg)

11. Select third position

    ![](/img/software/rplus1/wizard/dynamixel_wizard_034.jpg)

12. Select fourth position

    ![](/img/software/rplus1/wizard/dynamixel_wizard_035.jpg)

13. Calibration complete

    ![](/img/software/rplus1/wizard/dynamixel_wizard_036.jpg)

# Videos

[Video](https://www.youtube.com/watch?v=YJ9b68hx5Qc)

[Video](https://www.youtube.com/watch?v=PRVtfENb3Ok)

[Video](https://www.youtube.com/watch?v=mAm_9C1MoAs)

[USB2DYNAMIXEL]: https://emanual.robotis.com/docs/en/parts/interface/usb2dynamixel/
