import RobotInterface from "./src/RobotInterface.mjs";
import CRCLCommand from "./src/CRCLCommand.mjs";
import CommandFactory from "./src/CommandFactory.mjs";

const d = {
    "FestoOriginPart3": {"X": 646.762, "Y": -238.548, "Z": -288.424, "A": 0.020, "B": 0, "C": 0},
    "FestoOriginPart4": {"X": 647.246, "Y": -200.635, "Z": -288.923, "A": 0.040, "B": 0, "C": 0},
    "FestoOriginPart5": {"X": 669.721, "Y": -159.904, "Z": -289.474, "A": 0.040, "B": 0, "C": 0},
    "FestoOriginPart6": {"X": 676.796, "Y": -228.829, "Z": -288.231, "A": 0.040, "B": 0, "C": 0},
    "FestoOriginPart7": {"X": 670.012, "Y": -264.314, "Z": -287.916, "A": 0.060, "B": 0, "C": 0},
    "FestoOriginPart8": {"X": 663.841, "Y": -291.051, "Z": -293.557, "A": 0.040, "B": 0, "C": 0},

    "FestoTargetPart3": {"X": 89.426, "Y": -139.036, "Z": -160.131, "A": 0.040, "B": 0, "C": 0},
    "FestoTargetPart4": {"X": 88.334, "Y": -93.503, "Z": -160.831, "A": 0.040, "B": 0, "C": 0},
    "FestoTargetPart5": {"X": 167.716, "Y": -83.242, "Z": -161.125, "A": 0.040, "B": 0, "C": 0},
    "FestoTargetPart6": { "X": 170.164, "Y": -157.425, "Z": -160.585, "A": 0.040, "B": 0, "C": 0},
    "FestoTargetPart7": {"X": 164.360, "Y": -221.729, "Z": -160.428, "A": 0.060, "B": 0, "C": 0},
    "FestoTargetPart8": {"X": 161.962, "Y": -277.735, "Z": -163.818, "A": 0.080, "B": 0, "C": 0},

    "KukaOriginPart3": {"X": 78.9594116,"Y": -610.566895,"Z": 116.009666,"A": 90.5686188,"B": -0.00127616385,"C": -179.985306},
    "KukaTargetPart3" : {"X": 481.262878,"Y": 611.208374,"Z": 377.814697,"A": 179.528625,"B": -0.609380901,"C": 178.589218},

    "KukaOriginPart4": {"X": 78.23,"Y": -557.09,"Z": 115.57,"A": -88.04,"B": -0.13,"C": -179.89},
    "KukaTargetPart4" : {"X": 481.2966,"Y": 535.103271,"Z": 377.781,"A": -177.988113,"B": -4.36264133,"C": 179.927032},

    "KukaOriginPart5": {"X": 160.582047,"Y": -552.524597,"Z": 113.958778,"A": -89.9629669,"B": -1.83182085,"C": 179.783},
    "KukaTargetPart5" : {"X": 476.543671,"Y": 558.34259,"Z": 376.051147,"A": -0.297377676,"B": -1.87697458,"C": 179.789505},

    "KukaOriginPart7": {"X": 157.428833,"Y": -688.923645,"Z": 116.399742,"A": 90.78965,"B": 0.0101134852,"C": -179.98616},
    "KukaTargetPart7" : {"X": 464.059113,"Y": 599.769714,"Z": 377.643341,"A": 0.688721359,"B": 0.0135463141,"C": 178.526474},

    "KukaOriginPart8": {"X": 153.594299,"Y": -744.390808,"Z": 113.840439,"A": -89.7869492,"B": -1.80688977,"C": -179.882446},
    "KukaTargetPart8" : {"X": 477.022308,"Y": 574.364868,"Z": 375.161926,"A": 0.119267054,"B": -1.8120935,"C": 176.730362},
}

const queue = []

async function runAll(){
    const kukaSafetyHeight = 550.0
    const festoSafetyHeight = -130.0

    const kuka = new RobotInterface(3)
    kuka.name = 'Kuka'
    //await kuka.connect(54600, '192.168.42.130')

    const festo = new RobotInterface(3)
    festo.name = 'Festo'
      await festo.connect(9809, '192.168.42.110')

    const conveyor = new RobotInterface(3)
    conveyor.name = 'Conveyor'
   await conveyor.connect(9902, '192.168.42.151')

    addToQueue(festo, new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper2mm", {"ToolID": 1}))
    addToQueue(kuka, new CRCLCommand("SetEndEffectorParameters","Using VacuumGripper_2mm", {"ToolID": 2}))

    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["FestoOriginPart"+i]
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(origin, 25)}))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        addToQueue(festo, new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));
        addToQueue(festo,new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": 0.5}));
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))

        const target = d["FestoTargetPart"+i]
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(target, 25)}))

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));

        addToQueue(festo, new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        addToQueue(festo, new CRCLCommand('SetEndEffector',"Releasing Target"+i,{"Setting": 0.0}));
        addToQueue(festo,new CRCLCommand('Wait','Wait 0.5s'+i,{"Time": 0.5}));

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Closing Nest"+i,{"Setting": 0.0}));
        addToQueue(festo, new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))

    }

    addToQueue(conveyor, new CRCLCommand('MoveTo', 'Moving left', {"Straight":false,"Pose":{"X": -1, "Y": 0, "Z": 0, "A": 0, "B": 0, "C": 0}}))

    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["KukaOriginPart"+i]
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(origin, 25)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        addToQueue(kuka, new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));

        addToQueue(conveyor, new CRCLCommand("SetEndEffectorParameters","Using Nest"+i, {"ToolID": i}))
        addToQueue(conveyor, new CRCLCommand('SetEndEffector',"Opening Nest"+i,{"Setting": 1.0}));

        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move above Origin'+i, {"Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))

        const target = d["KukaTargetPart"+i]
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move little bit above Target'+i, {"Straight":false,"Pose":addHeight(target, 25)}))
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        addToQueue(kuka, new CRCLCommand('SetEndEffector',"Picking Target"+i,{"Setting": 0.0}));
        addToQueue(kuka, new CRCLCommand('MoveTo', 'Move above Target'+i, {"Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
    }

    const groupByRobot = d => d.reduce((r,c,i,a) =>
        (a[i].robot == (a[i-1] && a[i-1].robot)
            ? r[r.length-1].push(c)
            : r.push([c]), r), [])

    let groups = groupByRobot(queue)
    groups = groups.filter(e => e[0].robot.name != kuka.name)

    console.log("GROUPED PLAN")
    for (const g of groups){
        console.log(g[0].robot.name)
        g.forEach(cmd => console.log("  "+cmd.cmd.name))
    }
    console.log("")

    console.log("PLAN EXECUTION")
    for (const g of groups){
        console.log(g[0].robot.name)
        //g.forEach(cmd => console.log("  "+cmd.cmd.name))
        g.forEach(cmd => console.log("  "+cmd.cmd))
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