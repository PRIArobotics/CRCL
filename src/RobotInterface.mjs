import net from "net"
import PromiseSocket from "promise-socket"
import _ from 'lodash'
import CRCLCommandStatus from "./CRCLCommandStatus.mjs";

export class RobotInterface {

    constructor(maxSent) {
        this.queue = [] // list of commands to send in the future
        this.sent = new Map() // all sent commands with their newest status
        this.done = [] // archive of finished commands
        this.maxSent = maxSent // maximum number of entries in the sent queue
        this.sending = false; // currently sending?
        this.callbacks = new Map()
    }

    async connect(port, address) {
        this.socket = new net.Socket()
        this.socket.on('data', (d) => this.receive(d))

        this.promiseSocket = new PromiseSocket.PromiseSocket(this.socket)
        console.log(`Connecting to robot @ ${address}:${port}`);
        await this.promiseSocket.connect(port, address)
        console.log(`Connected to robot`)
        return this;
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

        // Send currently sent count difference to maxSent or queue maximum if lower
        const sendCount = Math.min(this.maxSent-this.sent.size, this.queue.length)
        if (sendCount > 0) console.log(`Sending ${sendCount} new messages`);
        for (let i = 0; i<sendCount; i++){
            const c = this.queue.shift()
            console.log(`Sending: ${c.cmd} (${c.cid})`);
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
                // remove from currently sent and put in archive
                this.sent.delete(status.cid)
                this.done.push(status);

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

    disconnect(){
        console.log("Disconnecting from robot");
        this.socket.destroy()
    }
}