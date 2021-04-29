import {CRCLCommand, CommandFactory, RobotInterface} from 'crcljs';
import MockRobot from "./MockRobot.mjs";
import TCPRobotConnection from "../src/TCPRobotConnection.mjs";

const port = 8857
const server = new MockRobot('MockRobot')
await server.start(port) // at localhost

const ri = new RobotInterface(new TCPRobotConnection('Testbot', port, 'localhost'))
await ri.connect()

const cmds = []
for (let i = 0; i<15; i++){
    cmds.push(new CRCLCommand('SetEndEffector',"Picking"+i,{"Setting": 0.0}))
}

await ri.schedule(cmds)
ri.disconnect()
server.stop()