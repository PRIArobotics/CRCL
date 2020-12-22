import {CRCLCommand, CommandFactory} from 'crcljs';

import assert from 'assert';
import sinon from 'sinon';
import chai from 'chai';
import TCPRobotInterface from "../src/TCPRobotInterface.mjs";
import MockRobot from "./MockRobot.mjs";
const {expect} = chai;

describe('MockRobotTest', function() {

    it('TestRobotInterfaces', async function() {

        this.timeout(10000)

        const server = new MockRobot()
        await server.start(9913) // at localhost

        const ri = new TCPRobotInterface(9913, 'localhost', 3)
        await ri.connect()

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
            target1, target2, target3, selectP1Vacuum, selectP2Vacuum, grabPPart,
            releasePart, wait, setTransSpeed, setTransAccel
        ];
        await ri.schedule(commands)
        expect(ri.sent.size).to.equal(0)
        expect(ri.queue.length).to.equal(0)
        ri.disconnect()
        server.stop()
    });

});