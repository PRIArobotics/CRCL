import net from "net"
import PromiseSocket from "promise-socket"
import _ from 'lodash'
import {CRCLCommandStatus, BufferedRobotInterface} from 'crcljs';

export default class TCPRobotInterface extends BufferedRobotInterface{

    constructor(maxQueued = 5, maxSent = 1) {
        super(maxQueued, maxSent)
    }

    async connect(port, address) {
        this.socket = new net.Socket()
        this.socket.on('data', (d) => this.receive(d))
        this.socket.on('end', () => console.log('Socket received end'))
        this.socket.on('ready', () => console.log('Socket ready'))
        this.socket.on('connect', () => console.log('Socket connect'))
        this.socket.on('error', (e) => console.log('Socket error:', e))
        this.socket.on('close', () => console.log('Socket closed'))

        this.promiseSocket = new PromiseSocket.PromiseSocket(this.socket)
        console.log(`Connecting to robot @ ${address}:${port}`);
        await this.promiseSocket.connect(port, address)
        console.log(`Connected to robot`)
        return this;
    }

    isConnected(){
        if (!this.socket) return false
        return this.socket.readyState === 'open';
    }

    schedule(cmds){
        if (!this.isConnected()) throw new Error('Can not schedule commands for disconnected RobotInterface!');
        return super.schedule(cmds);
    }

    async send(cmd){
        await this.promiseSocket.write(Buffer.from(cmd.toJSON() + '\r\n', 'utf8'));
    }

    async receive(buffer) {
        await super.receive(buffer.toString().split(/\r?\n/).filter(_.negate(_.isEmpty)))
    }

    async disconnect(){
        console.log("Disconnecting from robot");
        await this.promiseSocket.end()
        this.socket.destroy()
    }
}