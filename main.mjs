import RobotInterface from "./src/RobotInterface.mjs";
import CRCLCommand from "./src/CRCLCommand.mjs";
import CommandFactory from "./src/CommandFactory.mjs";
import fs from "fs"

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
    const kuka = new RobotInterface(maxQueued)
    kuka.name = 'Kuka'
    const festo = new RobotInterface(maxQueued)
    festo.name = 'Festo'
    const conveyor = new RobotInterface(maxQueued)
    conveyor.name = 'Conveyor'

    addToQueue(festo, new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper_2mm", {"ToolID": 1}))
    addToQueue(kuka, new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper_2mm", {"ToolID": 2}))

    addToQueue(festo, CommandFactory.SetTransSpeed('Set fast speed', fast))
    addToQueue(kuka, CommandFactory.SetTransSpeed('Set fast speed', fast))


    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["FestoOriginPart"+i]
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":addHeight(origin, approachdistance)}))
        addToQueue(festo, CommandFactory.SetTransSpeed('Set slow speed', slow))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        addToQueue(festo, new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));
        addToQueue(festo, new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": waittime}));
        addToQueue(festo, CommandFactory.SetTransSpeed('Set fast speed', fast))
        addToQueue(festo, CommandFactory.Wait('Wait for 0.5s', waittime))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))

        const target = d["FestoTargetPart"+i]
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Target'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":addHeight(target, approachdistance)}))
        addToQueue(festo, CommandFactory.SetTransSpeed('Set slow speed', slow))

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));

        addToQueue(festo, new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        addToQueue(festo, new CRCLCommand('SetEndEffector',"Releasing Target"+i,{"Setting": 0.0}));
        addToQueue(festo, CommandFactory.SetTransSpeed('Set fast speed', fast))
        addToQueue(festo, new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": 0.5}));

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Closing Nest"+i,{"Setting": 0.0}));

        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Target'+i, {/*"Blending": blending,*/ "Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
    }

    addToQueue(conveyor, new CRCLCommand('MoveTo', 'Moving right', {"Straight":false,"Pose":{"X": 1, "Y": 0, "Z": 0, "A": 0, "B": 0, "C": 0}}))

    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["KukaOriginPart"+i]
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":addHeight(origin, approachdistance)}))
        addToQueue(kuka, CommandFactory.SetTransSpeed('Set slow speed', slow))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        addToQueue(kuka, new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));
        addToQueue(kuka, CommandFactory.SetTransSpeed('Set fast speed', fast))
        addToQueue(kuka, CommandFactory.Wait('Wait for 0.5s', waittime))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move above Origin'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))

        const target = d["KukaTargetPart"+i]
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move little bit above Target'+i, {"Blending" : blending, "Straight":false,"Pose":addHeight(target, approachdistance)}))
        addToQueue(kuka, CommandFactory.SetTransSpeed('Set slow speed', slow))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        addToQueue(kuka, new CRCLCommand('SetEndEffector',"Picking Target"+i,{"Setting": 0.0}));
        addToQueue(kuka, CommandFactory.SetTransSpeed('Set fast speed', fast))
        addToQueue(kuka, CommandFactory.Wait('Wait for 0.5s', waittime))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move above Target'+i, {"Blending" : blending, "Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
    }

    await kuka.connect(54600, '192.168.42.130')
    //await festo.connect(9809, '192.168.42.110')
    //await conveyor.connect(9902, '192.168.42.151')

    queue = queue.filter(e =>
        e.robot === kuka
        //e.robot === conveyor ||
        //e.robot === festo
    )

    const groupByRobot = d => d.reduce((r,c,i,a) =>
        (a[i].robot == (a[i-1] && a[i-1].robot)
            ? r[r.length-1].push(c)
            : r.push([c]), r), [])

    let groups = groupByRobot(queue)

    console.log("GROUPED PLAN")
    for (const g of groups){
        console.log(g[0].robot.name)
        g.forEach(cmd => console.log("  "+cmd.cmd))
    }
    console.log("")

    console.log("PLAN EXECUTION")
    for (const g of groups){
        console.log(g[0].robot.name)
        //g.forEach(cmd => console.log("  "+cmd.cmd.name))
        g.forEach(cmd => console.log("  "+cmd.cmd.toJSON()))
        await g[0].robot.schedule(g.map(e => e.cmd))
    }
}

function addToQueue(robot, ...command){
    queue.push(...command.map(cmd => {return {robot: robot, cmd: cmd}}))
}

function setHeight(c, height){
    return {"X":c["X"], "Y":c["Y"], "Z":height, "A":c["A"], "B":c["B"], "C":c["C"]}
}

function addHeight(c, height){
    return {"X":c["X"], "Y":c["Y"], "Z":c["Z"]+height, "A":c["A"], "B":c["B"], "C":c["C"]}
}

runAll()