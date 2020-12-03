import _ from 'lodash'
import CRCLCommand from "./CRCLCommand.mjs";

function Command(cmd, name, param, cid){
    return new CRCLCommand(cmd, name, param, cid)
}

function MoveTo(name, poseMatrix, straight) {
    if (straight === undefined) straight = false;
    let r = new BABYLON.Quaternion();
    let t = new BABYLON.Vector3();
    poseMatrix.decompose(undefined, r, t);
    const a = [];
    r.toEulerAngles("XYZ").toArray(a); // XYZ KUKA/ABB default
    poseMatrix = {
        "X": t.x,
        "Y": t.y,
        "Z": t.z,
        "A": a[0],
        "B": a[1],
        "C": a[2],
    }
    return Command("MoveTo", name, {"Straight": straight, "Pose": poseMatrix});
}

function SetEndEffector(name, setting) {
    return Command("SetEndEffector", name, {"Setting" : setting});
}

function SetEndEffectorParameters(name, toolid) {
    return Command("SetEndEffectorParameters", name, {"ToolID" : toolid});
}

function Wait(name, time) {
    return Command("Wait", name, {"Time" : time});
}

function SetTransSpeed(name, relative) {
    return Command("SetTransSpeed", name, {"Relative" : relative});
}

function SetTransAccel(name, relative) {
    return Command("SetTransAccel", name, {"Relative" : relative});
}

const CommandFactory = {
    Command,
    MoveTo,
    SetEndEffector,
    SetEndEffectorParameters,
    Wait,
    SetTransSpeed,
    SetTransAccel,
};

export default CommandFactory;

