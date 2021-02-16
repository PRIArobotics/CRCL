import fs from "fs"

import {CommandFactory, MultiRobotInterface, CRCLCommand, RobotInterface} from 'crcljs';
import {TCPRobotConnection} from "./module.mjs";

const d = JSON.parse(fs.readFileSync('positions.json', 'utf8'));

let queue = []

async function runAll(){
    const kukaSafetyHeight = 550.0
    const festoSafetyHeight = -130.0
    const blending = 100
    const slow = 0.1
    const fast = 0.5
    const waittime = 0.5
    const approachdistance = 25

    const maxQueued = 5

    const robots = new MultiRobotInterface()
    robots.addRobot(new RobotInterface(new TCPRobotConnection('Kuka', 54600, '192.168.42.130')))
    robots.addRobot(new RobotInterface(new TCPRobotConnection('Festo', 9811, '192.168.42.110')))
    robots.addRobot(new RobotInterface(new TCPRobotConnection('Conveyor', 9912,'192.168.42.111')))
    const enabledRobots = ['Festo']

    robots.addToQueue('Festo', new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper_2mm", {"ToolID": 1}))
    robots.addToQueue('Kuka', new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper_2mm", {"ToolID": 2}))

    robots.addToQueue('Festo', CommandFactory.SetTransSpeed('Set fast speed', fast))
    robots.addToQueue('Kuka', CommandFactory.SetTransSpeed('Set fast speed', fast))

    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["FestoOriginPart"+i]
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move high above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":addHeight(origin, approachdistance)}))
        robots.addToQueue('Festo', CommandFactory.SetTransSpeed('Set slow speed', slow))
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        robots.addToQueue('Festo', new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));
        robots.addToQueue('Festo', new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": waittime}));
        robots.addToQueue('Festo', CommandFactory.SetTransSpeed('Set fast speed', fast))
        robots.addToQueue('Festo', CommandFactory.Wait('Wait for 0.5s', waittime))
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move high above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))

        const target = d["FestoTargetPart"+i]
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move high above Target'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":addHeight(target, approachdistance)}))
        robots.addToQueue('Festo', CommandFactory.SetTransSpeed('Set slow speed', slow))

        robots.addToQueue('Conveyor', new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        robots.addToQueue('Conveyor', new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));

        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        robots.addToQueue('Festo', new CRCLCommand('SetEndEffector',"Releasing Target"+i,{"Setting": 0.0}));
        robots.addToQueue('Festo', CommandFactory.SetTransSpeed('Set fast speed', fast))
        robots.addToQueue('Festo', new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": 0.5}));

        robots.addToQueue('Conveyor', new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        robots.addToQueue('Conveyor', new CRCLCommand('SetEndEffector',"Closing Nest"+i,{"Setting": 0.0}));

        robots.addToQueue('Festo', new CRCLCommand('MoveTo', 'Move high above Target'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
    }

    robots.addToQueue('Conveyor', new CRCLCommand('MoveTo', 'Moving right', {"Straight":false,"Pose":{"X": 1, "Y": 0, "Z": 0, "A": 0, "B": 0, "C": 0}}))

    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["KukaOriginPart"+i]
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":addHeight(origin, approachdistance)}))
        robots.addToQueue('Kuka', CommandFactory.SetTransSpeed('Set slow speed', slow))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        robots.addToQueue('Kuka', new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));

        robots.addToQueue('Conveyor', new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        robots.addToQueue('Conveyor', new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));
        robots.addToQueue('Kuka', CommandFactory.SetTransSpeed('Set fast speed', fast))
        robots.addToQueue('Kuka', CommandFactory.Wait('Wait for 0.5s', waittime))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))

        const target = d["KukaTargetPart"+i]
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move little bit above Target'+i, {"Blending" : blending, "Straight":false,"Pose":addHeight(target, approachdistance)}))
        robots.addToQueue('Kuka', CommandFactory.SetTransSpeed('Set slow speed', slow))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        robots.addToQueue('Kuka', new CRCLCommand('SetEndEffector',"Picking Target"+i,{"Setting": 0.0}));
        robots.addToQueue('Kuka', CommandFactory.SetTransSpeed('Set fast speed', fast))
        robots.addToQueue('Kuka', CommandFactory.Wait('Wait for 0.5s', waittime))
        robots.addToQueue('Kuka', new CRCLCommand('MoveTo', 'Move above Target'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
    }

    const deleteRobots = robots.getRobotNamesList().filter(rn => rn != enabledRobots)
    deleteRobots.map(rn => robots.getRobotByName(rn)).forEach(r => robots.removeRobot(r))

    await robots.groupQueue()
    await robots.printQueue()
    await robots.connectAll()
    await robots.sendQueues()
    await robots.disconnectAll()
}

function setHeight(c, height){
    return {"X":c["X"], "Y":c["Y"], "Z":height, "A":c["A"], "B":c["B"], "C":c["C"]}
}

function addHeight(c, height) {
    return setHeight(c, c["Z"] + height)
}

runAll()