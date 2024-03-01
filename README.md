# CRCLJS - NodeJS

NodeJS implementation of the queued streaming robot motion interface [CRCL-JS](https://github.com/PRIARobotics/CRCLJS), an adapted minimal JSON-based version of [CRCL](https://github.com/usnistgov/crcl/blob/master/doc/Reference.md).

There are also two specific implementations:

- a general Javascript implementation with the reference: [CRCL-JS](https://github.com/PRIARobotics/CRCLJS)
- a browser version with websockets: [CRCL-JS-WS](https://github.com/prIArobotics/CRCLJS-ws), which needs a socket-websocket-gateway, the [CRCLJS-WSAdapter](https://github.com/PRIARobotics/CRCLJS-WSAdapter).

## Getting Started

Try it out here with the robot or clone this repo and start it as follows:

```bash
# Install project dependency CRCLJS
cd ../CRCLJS
npm install
npm link

# Install and add dependency
cd ../CRCLJS-Node
npm install
npm link crcljs
npm start # Compile and launch 
```

## Testing

Test the interface implementation with the Mock-Robot as follows:

```bash
npm test
```

## Author

* **Timon Höbert**
