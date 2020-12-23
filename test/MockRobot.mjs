import net from "net"
import _ from 'lodash'
import {CRCLCommand, CRCLCommandStatus, MockRobotConnection} from 'crcljs';

export default class MockRobot {

    constructor(name) {
        this.mockRobotConnection = new MockRobotConnection(name)
        this.mockRobotConnection.connect()
        this.mockRobotConnection.on(this.name, (line) => this.onStatus(line))
    }

    get name(){
        return this.mockRobotConnection.name
    }

    log(message){
        console.log(`${this.name}: ${message}`)
    }

    async start(port, address) {
        address = address || 'localhost'

        this.connection = net.createServer((s) => this.onClientConnected(s, this));
        this.log(`Creating server @ ${address}:${port}`)

        return new Promise(resolve => {
            this.connection.listen(port, address, resolve);
        })
    }

    onClientConnected(socket){
        this.socket = socket
        this.socket.on('data', (b) => this.onCommand(b));

        this.socket.on('close', () => {
            this.log(`Connection to client closed`);
        });

        this.socket.on('error', (err) => {
            this.log(`Connection to failed: ${err.message}`);
        });
    }

    onCommand(buffer){
        //this.log(`Received: ${buffer.toString()}`)
        const lines = buffer.toString().split(/\r?\n/).filter(_.negate(_.isEmpty))
        lines.forEach(line => this.mockRobotConnection.emit(this.name, line))
    }

    onStatus(line){
        //this.log(`Sending: ${line}`)
        this.socket.write(Buffer.from(line + '\r\n', 'utf8'));
    }

    async stop(){
        this.mockRobotConnection.disconnect()
        this.socket.destroy()
        this.connection.close()
    }
}
