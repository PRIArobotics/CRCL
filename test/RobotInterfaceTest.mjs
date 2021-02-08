import {CRCLCommand, CommandFactory, RobotInterface} from 'crcljs';

import assert from 'assert';
import sinon from 'sinon';
import chai from 'chai';
import TCPRobotConnection from "../src/TCPRobotConnection.mjs";
import MockRobot from "./MockRobot.mjs";
const {expect} = chai;

describe('MockRobotTest', function() {

    it('TestRobotInterfaces', async function() {
        this.timeout(3000)

        const port = 8857
        const server = new MockRobot('MockRobot')
        await server.start(port) // at localhost

        const ri = new RobotInterface(new TCPRobotConnection('Testbot', port, 'localhost'))
        await ri.connect()

        const c1 = new CRCLCommand('SetEndEffector',"Picking0",{"Setting": 0.0})
        const c2 = new CRCLCommand('SetEndEffector',"Picking1",{"Setting": 1.0})

        await ri.schedule([c1, c2])
        ri.disconnect()
        server.stop()
    });

});