import net from "net"
import _ from 'lodash'
import {CRCLCommand, CRCLCommandStatus} from 'crcljs';

export default class MockRobot {

    constructor() {
        this.queue = []
    }

    async start(port, address) {
        this.queue = []

        address = address || 'localhost'

        this.connection = net.createServer((s) => this.onClientConnected(s, this));
        console.log(`SERVER: Creating server @ ${address}:${port}`)

        return new Promise(resolve => {
            this.connection.listen(port, address, resolve);
        })
    }

    onClientConnected(socket){
        this.socket = socket
        setTimeout(() => this.serve(), 1);
        this.socket.on('data', (b) => this.onData(b));

        this.socket.on('close', () => {
            console.log(`SERVER: Connection to client closed`);
        });

        this.socket.on('error', (err) => {
            console.log(`SERVER: Connection to failed: ${err.message}`);
        });
    }

    onData(buffer){
        for (const line of buffer.toString().split(/\r?\n/).filter(_.negate(_.isEmpty))){
            const cmd = CRCLCommand.fromJSON(line)
            //console.log(`SERVER: Received: ${cmd.toString()}`);
            this.queue.push(cmd)
            this.sendStatus(new CRCLCommandStatus('CRCL_Queued', cmd.cid, 0))
        }
    }

    serve(){
        let sleep = 100
        if (this.inOperation){
            //console.log(`SERVER: Sending Done: ${this.inOperation.toString()}`);
            this.sendStatus(new CRCLCommandStatus('CRCL_Done', this.inOperation.cid, 2))
            sleep = 0
            this.inOperation = undefined
        } else if (this.queue && this.queue.length > 0){
            this.inOperation = this.queue.shift()
            //console.log(`SERVER: Sending Working: ${this.inOperation.toString()}`);
            this.sendStatus(new CRCLCommandStatus('CRCL_Working', this.inOperation.cid, 1))
            sleep = this.getRandom(50,1000)
        }
        if (!this.socket.destroyed){
            setTimeout(() => this.serve(), sleep);
        }
    }

    sendStatus(status){
        this.socket.write(`${status.toJSON()}\r\n`);
    }

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min
    }

    async stop(){
        this.socket.destroy()
        this.connection.close()
    }
}
