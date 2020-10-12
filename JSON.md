
# CRCLCommand

Convention of the order of the attribute keys has to be

1. `CRCLCommand` : string - type of command determines the crcl params
2. `CommandID` : integer - unique positive identifier, incremental
3. (`Name`) : string - description of the command for humans
4. `CRCLParam` : object - additional parameters

## MoveTo

### CRCLParam:

1. `Pose` : object - target TCP position `X`, (`Y`), (`Z`), (`A`), (`B`), (`C`)
2. `Straight` : boolean - if true, TCP stays in line between origin and target position, otherwise arbitrary trajectory
3. `Blend` : float - factor to blend this movement with the next movement

### Examples

```json
{
    "CommandID" : 1,
    "Name" : "Move Kuka",
    "CRCLCommand" : "MoveTo",
    "CRCLParam" : { 
        "Pose" : {
            "X": -60.0,
            "Y": 120.0,
            "Z": 90.0,
            "A": -80.0,
            "B": 100.0,
            "C": 130.0
        },
        "Straight" : true
    }
}
```

```json
{
    "CommandID" : 2,
    "Name" : "Move Conveyor",
    "CRCLCommand" : "MoveTo",
    "CRCLParam" : { 
        "Pose" : {
            "X" : 0.0,
        },
        "Straight" : true,
    }
}
```

```json
{
    "CommandID" : 3,
    "Name" : "Move Festo",
    "CRCLCommand" : "MoveTo",
    "CRCLParam" : { 
        "Pose" : {
            "X" : -60.0,
            "Y" : 120.0,
            "Z" : 90.0,
            "C" : 130.0
        },
        "Straight" : true,
    }
}
```

## SetEndEffector

```json
{
    "CRCLCommand" : "SetEndEffector", 
    "Name" : "Grasp", 
    "CommandID" : 4, 
    "CRCLParam" : {
        "Setting" : 0.0
    }
}
```

### Examples

1. `Setting` : integer - tool, for example gripper, state between 0.0 and 1.0

## SetEndEffectorParameter

```json
{
    "CRCLCommand" : "SetEndEffectorParameter", 
    "Name" : "Use Tool 7", 
    "CommandID" : 5, 
    "CRCLParam" : {
        "Setting" : 7
    }
}
```

### Examples

1. `Setting` : integer - id of tool, for example gripper

## Status response

```json
{
    "CommandStatus": {
        "CommandID": 1,
        "StatusID": 1,
        "CommandState": "Ready for execution"
    }
}
```

### Examples

1. `CommandID` : integer - the CommandID of the command which is referenced with this status message
2. `StatusID` : integer - the unique positive status identifier, incremental
3. `CommandState` : string - state description enum: `CRCL_Ready`, `CRCL_Working`, `CRCL_Done` and `CRCL_Error`
