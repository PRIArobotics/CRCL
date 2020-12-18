import net from "net"
import PromiseSocket from "promise-socket"
import _ from 'lodash'
import CRCLCommandStatus from "./CRCLCommandStatus.mjs";

export default class RobotInterface {

    constructor(maxQueued) {
        this.queue = [] // list of commands to send in the future
        this.sent = new Map() // all sent commands with their newest status
        this.maxQueued = maxQueued // maximum number of entries in the sent queue
        this.maxSent = 1
        this.sending = false; // currently sending?
        this.callbacks = new Map()
    }

    async connect(port, address) {
        this.socket = new net.Socket()
        this.socket.on('data', (d) => this.receive(d))
        this.socket.on('end', (e) => console.log('socket end', e))
        this.socket.on('ready', (e) => console.log('socket ready', e))
        this.socket.on('connect', (e) => console.log('socket connect', e))
        this.socket.on('error', (e) => console.log('socket error', e))
        this.socket.on('close', (e) => console.log('closed socket'))

        this.promiseSocket = new PromiseSocket.PromiseSocket(this.socket)
        console.log(`Connecting to robot @ ${address}:${port}`);
        await this.promiseSocket.connect(port, address)
        console.log(`Connected to robot`)
        return this;
    }

    isConnected(){
        return !this.socket.pending;
    }

    schedule(cmds){
        return new Promise((resolve, error) => {
            this.queue.push(...cmds)
            this.addCallback(resolve, error, cmds[cmds.length-1].cid)
            this.sendNext()
        });
    }

    addCallback(resolve, error, cid){
        this.callbacks.set(cid, {resolve: resolve, error:error})
    }

    async sendNext(){
        if (this.sending) return // skip if currently sending
        this.sending = true

        const sentList = [...this.sent.values()]
        const currentlySent = sentList.filter(status => status.state === 'CRCL_Sent').length
        const currentlyQueued = sentList.filter(status => status.state === 'CRCL_Queued').length

        if (currentlySent < this.maxSent && currentlyQueued < this.maxQueued && this.queue.length > 0){
            const c = this.queue.shift()
            console.log(`Sending: ${c.cmd} (${c.cid}): ${c.toString()}`);
            this.sent.set(c.cid, new CRCLCommandStatus('CRCL_Sent', c.cid, -1))
            await this.promiseSocket.write(Buffer.from(c.toJSON() + '\r\n', 'utf8'));
        }
        this.sending = false
    }

    async receive(buffer){
        for (const line of buffer.toString().split(/\r?\n/).filter(_.negate(_.isEmpty))){
            const status = CRCLCommandStatus.fromJSON(line)
            console.log(`Received: ${status.toString()}`)

            if (status.state === 'CRCL_Queued' || status.state === 'CRCL_Working' ) {
                // update status if newer
                const oldstatus = this.sent.get(status.cid)
                if (oldstatus.sid < status.sid) this.sent.set(status.cid, status)

            } else if (status.state === 'CRCL_Done') {
                // remove from currently sent
                this.sent.delete(status.cid)

                const callback = this.callbacks.get(status.cid)
                if (callback) callback.resolve()
            } else {
                const error = 'Received invalid message:' + status.toString()
                console.log(error)
                for (c of this.callbacks.values()) c.error(error)
                this.disconnect()
            }
        }
        await this.sendNext()
    }

    async disconnect(){
        console.log("Disconnecting from robot");
        await this.promiseSocket.end()
        this.socket.destroy()
    }
}