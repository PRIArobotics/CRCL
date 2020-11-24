import RobotInterface from "./src/RobotInterface.mjs";
import CRCLCommand from "./src/CRCLCommand.mjs";
import CommandFactory from "./src/CommandFactory.mjs";

async function run(){
    const ri = new RobotInterface(3)
    await ri.connect(9910, 'localhost')

    const target1 = new CRCLCommand('MoveTo', 'Move to Con4Target', {"Straight":false,"Pose":{"X":680.54,"Y":500.0,"Z":-20.0,"A":0.0,"B":0.0,"C":0.0}});
    const target2 = new CRCLCommand('MoveTo', 'Move to Con3',{"Straight":false,"Pose":{"X":680.54,"Y":400.0,"Z":-20.0,"A":0.0,"B":0.0,"C":0.0}});
    const target3 = new CRCLCommand('MoveTo', 'Move to Con3',{"Straight":false,"Pose":{"X":680.54,"Y":300.0,"Z":-20.0,"A":0.0,"B":0.0,"C":0.0}});
    const selectP1Vacuum = new CRCLCommand("SetEndEffectorParameters","Using :VacuumGripper_2mm", {"ToolID": 0});
    const selectP2Vacuum = new CRCLCommand("SetEndEffectorParameters","Using :VacuumGripper_4mm",{"ToolID": 1});
    const grabPPart = new CRCLCommand('SetEndEffector',"Picking :Part_REL1",{"Setting": 1.0});
    const releasePart = new CRCLCommand('SetEndEffector',"Picking :Part_REL1",{"Setting": 0.0});
    const wait = CommandFactory.Wait('Wait for 0.5s', 0.5)
    const setTransSpeed = CommandFactory.SetTransSpeed('Set acceleration to 50 percent', 0.5)
    const setTransAccel = CommandFactory.SetTransAccel('Set speed to 50 percent', 0.5)


    const commands = [
        target1, grabPPart, wait, setTransSpeed, setTransAccel, target2, selectP1Vacuum, target3, selectP2Vacuum,
        releasePart,
    ];
    await ri.schedule(commands)
    //ri.disconnect()
}

run()