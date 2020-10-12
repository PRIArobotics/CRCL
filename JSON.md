## *Fragen:*

- *`CommandID` als Nummer oder String mit ? Länge* &rarr; als INTEGER!
- *`CommandState` als Text, der den State beschreibt, oder als Integer für eine Konstante?*

## Commands

Convention of the order of the attribute keys has to be

1. `CRCLCommand` - Type of command determines the crcl params
2. `CommandID`
3. (`Name`)
4. `CRCLParam`

### MoveTo for all robots

```json
{
    "CommandID" : 1,
    "Name" : "Move To for Kuka",
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

### SetEndEffector for Förderband

```json
{
	"CRCLCommand" : "SetEndEffector", 
    "Name" : "Grasp", 
    "CommandID" : 2, 
    "CRCLParam" : {
        "Setting" : 0.0
    }
}
```

- `setting`: number between 0.0 and 1.0, representing the gripper state 

### Status response

```json
{
    "CommandStatus": {
        "CommandID": 1,
        "StatusID": 15,
        "CommandState": "reade for execution"
    }
}
```

- `CommandState` als Text, der den State beschreibt oder als Integer für eine Konstante?

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

- `setting`: (beim Förderband) 0 bis 8 &rarr; welches Bauteil-Fach geöffnet wird (Zuordnung dokumentieren!)









---

### MoveTo for Festo

```json
{
    "CommandID" : 1,
    "Name" : "Move To for Festo",
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

### MoveTo for Förderband

```json
{
    "CommandID" : 1,
    "Name" : "Move To for Foerderband",
    "CRCLCommand" : "MoveTo",
    "CRCLParam" : { 
        "Pose" : {
            "Direction" : false,
            "Squeeze" : true
        },
        "Straight" : true,
    }
}
```

- direction: `false` &rarr; nach links; `true` &rarr; nach rechts
- squeeze: `false` &rarr; nicht zudrücken; `true` &rarr; zudrücken

(Betrachtung der Anlage von der Raum-Seite aus)
