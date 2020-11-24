import RobotInterface from "./src/RobotInterface.mjs";
import CRCLCommand from "./src/CRCLCommand.mjs";
import CommandFactory from "./src/CommandFactory.mjs";

const d = {
    "FestoOriginPart3": {"x": 646.762, "y": 238.548, "z": 288.424, "a": 0.020, "b": 0, "c": 0},
    "FestoOriginPart4": {"x": 647.246, "y": 200.635, "z": 288.923, "a": 0.040, "b": 0, "c": 0},
    "FestoOriginPart5": {"x": 669.721, "y": 159.904, "z": 289.474, "a": 0.040, "b": 0, "c": 0},
    "FestoOriginPart6": {"x": 676.796, "y": 228.829, "z": 288.231, "a": 0.040, "b": 0, "c": 0},
    "FestoOriginPart7": {"x": 670.012, "y": 264.314, "z": 287.916, "a": 0.060, "b": 0, "c": 0},
    "FestoOriginPart8": {"x": 663.841, "y": 291.051, "z": 293.557, "a": 0.040, "b": 0, "c": 0},

    "FestoTargetPart3": {"x": 89.426, "y": 139.036, "z": 160.131, "a": 0.040, "b": 0, "c": 0},
    "FestoTargetPart4": {"x": 88.334, "y": 93.503, "z": 160.831, "a": 0.040, "b": 0, "c": 0},
    "FestoTargetPart5": {"x": 167.716, "y": 83.242, "z": 161.125, "a": 0.040, "b": 0, "c": 0},
    "FestoTargetPart6": { "x": 170.164, "y": 157.425, "z": 160.585, "a": 0.040, "b": 0, "c": 0},
    "FestoTargetPart7": {"x": 164.360, "y": 221.729, "z": 160.428, "a": 0.060, "b": 0, "c": 0},
    "FestoTargetPart8": {"x": 161.962, "y": 277.735, "z": 163.818, "a": 0.080, "b": 0, "c": 0},

    "KukaOriginPart3": {"x": 78.9594116,"y": -610.566895,"z": 116.009666,"a": 90.5686188,"b": -0.00127616385,"c": -179.985306},
    "KukaTargetPart3" : {"x": 481.262878,"y": 611.208374,"z": 377.814697,"a": 179.528625,"b": -0.609380901,"c": 178.589218},

    "KukaOriginPart4": {"x": 78.23,"y": -557.09,"z": 115.57,"a": -88.04,"b": -0.13,"c": -179.89},
    "KukaTargetPart4" : {"x": 481.2966,"y": 535.103271,"z": 377.781,"a": -177.988113,"b": -4.36264133,"c": 179.927032},

    "KukaOriginPart5": {"x": 160.582047,"y": -552.524597,"z": 113.958778,"a": -89.9629669,"b": -1.83182085,"c": 179.783},
    "KukaTargetPart5" : {"x": 476.543671,"y": 558.34259,"z": 376.051147,"a": -0.297377676,"b": -1.87697458,"c": 179.789505},

    "KukaOriginPart7": {"x": 157.428833,"y": -688.923645,"z": 116.399742,"a": 90.78965,"b": 0.0101134852,"c": -179.98616},
    "KukaTargetPart7" : {"x": 464.059113,"y": 599.769714,"z": 377.643341,"a": 0.688721359,"b": 0.0135463141,"c": 178.526474},

    "KukaOriginPart8": {"x": 153.594299,"y": -744.390808,"z": 113.840439,"a": -89.7869492,"b": -1.80688977,"c": -179.882446},
    "KukaTargetPart8" : {"x": 477.022308,"y": 574.364868,"z": 375.161926,"a": 0.119267054,"b": -1.8120935,"c": 176.730362},
}

async function runKuka(){
    const kuka = new RobotInterface(3)
    await kuka.connect(54600, '192.168.42.130')
    const kukaSafetyHeight = 550.0
    const commands = []
    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["KukaOriginPart"+i]
        commands.push(new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))
        commands.push(new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(origin, 25)}))
        commands.push(new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        commands.push(new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));
        commands.push(new CRCLCommand('MoveTo', 'Move above Origin'+i, {"Straight":false,"Pose":setHeight(origin, kukaSafetyHeight)}))

        const target = d["KukaTargetPart"+i]
        commands.push(new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
        commands.push(new CRCLCommand('MoveTo', 'Move little bit above Target'+i, {"Straight":false,"Pose":addHeight(target, 25)}))
        commands.push(new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        commands.push(new CRCLCommand('SetEndEffector',"Picking Target"+i,{"Setting": 0.0}));
        commands.push(new CRCLCommand('MoveTo', 'Move above Target'+i, {"Straight":false,"Pose":setHeight(target, kukaSafetyHeight)}))
    }
    for (let a of commands){
        console.log(a.toJSON())
    }
    await kuka.schedule(commands)
    //kuka.disconnect()
}

async function runFesto(){
    /*
    const festo = new RobotInterface(3)
    await festo.connect(9910, '192.168.42.xx')*/
    const festoSafetyHeight = 130.0
    const commands = []
    for (let i of [3, 4, 5,   7, 8]){
        const origin = d["FestoOriginPart"+i]
        commands.push(new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))
        commands.push(new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(origin, 25)}))
        commands.push(new CRCLCommand('MoveTo', 'Move at Origin'+i, {"Straight":false,"Pose":origin}))
        commands.push(new CRCLCommand('SetEndEffector',"Picking Part"+i,{"Setting": 1.0}));
        commands.push(new CRCLCommand('MoveTo', 'Move high above Origin'+i, {"Straight":false,"Pose":setHeight(origin, festoSafetyHeight)}))

        const target = d["FestoTargetPart"+i]
        commands.push(new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
        commands.push(new CRCLCommand('MoveTo', 'Move little bit above Origin'+i, {"Straight":false,"Pose":addHeight(target, 25)}))
        commands.push(new CRCLCommand('MoveTo', 'Move at Target'+i, {"Straight":false,"Pose":target}))
        commands.push(new CRCLCommand('SetEndEffector',"Picking Target"+i,{"Setting": 0.0}));
        commands.push(new CRCLCommand('MoveTo', 'Move high above Target'+i, {"Straight":false,"Pose":setHeight(target, festoSafetyHeight)}))
    }
    for (let a of commands){
        console.log(a.toJSON())
    }
    //await ri.schedule(commands)
    //ri.disconnect()

}

function setHeight(c, height){
    return {'x':c['x'], 'y':c['y'], 'z':height, 'a':c['a'], 'b':c['b'], 'c':c['c']}
}

function addHeight(c, height){
    return {'x':c['x'], 'y':c['y'], 'z':c['z']+height, 'a':c['a'], 'b':c['b'], 'c':c['c']}
}

//runKuka()
runFesto()