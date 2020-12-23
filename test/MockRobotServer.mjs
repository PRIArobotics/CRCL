import MockRobot from "./MockRobot.mjs";

const server1 = new MockRobot('Festo')
await server1.start(6666)

const server2 = new MockRobot('Kuka')
await server2.start(6667)

const server3 = new MockRobot('Conveyor')
await server3.start(6668)