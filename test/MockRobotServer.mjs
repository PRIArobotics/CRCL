import MockRobot from "./MockRobot.mjs";

const server1 = new MockRobot()
await server1.start(6666)

const server2 = new MockRobot()
await server2.start(6667)

const server3 = new MockRobot()
await server3.start(6668)