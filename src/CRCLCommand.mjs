import _ from 'lodash'

let CommandIDCount = 0;

export class CRCLCommand {

    static fromJSON(json) {
        const cmd = JSON.parse(json)
        return new CRCLCommand(cmd.CRCLCommand, cmd.Name, cmd.CRCLParam, cmd.CommandID)
    }

    constructor(cmd, name, param, cid) {
        this.cmd = cmd;
        this.name = name;
        this.param = param;
        this.cid = _.isUndefined(cid) ? CommandIDCount++ : cid;
    }

    toJSON(pretty = false){
        return JSON.stringify({
            CommandID: this.cid,
            Name: this.name,
            CRCLCommand: this.cmd,
            CRCLParam: this.param,
        }, null, pretty ? 2 : 0)
    }

    toString(){
        return `${this.name}: ${this.cmd} (${this.cid}) ${JSON.stringify(this.param)} `
    }
}

function Command(cmd, name, param, cid){
    return new CRCLCommand(cmd, name, param, cid)
}

function MoveTo(name, poseMatrix, straight) {
    if (straight === undefined) straight = false;
    let r = new BABYLON.Quaternion();
    let t = new BABYLON.Vector3();
    poseMatrix.decompose(undefined, r, t);
    const a = [];
    r.toEulerAngles("YZX").toArray(a); // YZX default
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

function SetEndEffectorParameters(name, setting) {
    return Command("SetEndEffectorParameters", name, {"Setting" : setting});
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

