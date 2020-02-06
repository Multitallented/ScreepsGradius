
export class LeaveRoomAction {
    static KEY = 'leave-room';

    static getRandomExit(room:Room):ExitConstant {
        let directions = [ ];
        if (room.hasExit(FIND_EXIT_TOP)) {
            directions.push(FIND_EXIT_TOP);
        }
        if (room.hasExit(FIND_EXIT_BOTTOM)) {
            directions.push(FIND_EXIT_BOTTOM);
        }
        if (room.hasExit(FIND_EXIT_LEFT)) {
            directions.push(FIND_EXIT_LEFT);
        }
        if (room.hasExit(FIND_EXIT_RIGHT)) {
            directions.push(FIND_EXIT_RIGHT);
        }
        if (directions.length) {
            return directions[Math.floor(Math.random() * directions.length)]
        }
        return null;
    }

    static moveIntoRoom(creep:Creep) {
        if (creep.pos.x === 0) {
            creep.moveTo(1, creep.pos.y);
        } else if (creep.pos.x === 49) {
            creep.moveTo(48, creep.pos.y);
        } else if (creep.pos.y === 0) {
            creep.moveTo(creep.pos.x, 1);
        } else if (creep.pos.y === 49) {
            creep.moveTo(creep.pos.x, 48);
        }
    }

    static moveOutOfRoom(creep:Creep) {
        if (creep.pos.x === 1) {
            creep.moveTo(0, creep.pos.y);
        } else if (creep.pos.x === 48) {
            creep.moveTo(49, creep.pos.y);
        } else if (creep.pos.y === 1) {
            creep.moveTo(creep.pos.x, 0);
        } else if (creep.pos.y === 48) {
            creep.moveTo(creep.pos.x, 49);
        }
    }

    static run(creep:Creep) {
        if (!creep.memory['originRoom']) {
            creep.memory['originRoom'] = creep.room.name;
        }
        if (creep.memory['originRoom'] !== creep.room.name) {
            LeaveRoomAction.moveIntoRoom(creep);
            delete creep.memory['path'];
            delete creep.memory['destination'];
            creep.setNextAction();
        } else {
            LeaveRoomAction.moveOutOfRoom(creep);
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep, direction:ExitConstant) {
        if (!direction || !creep.room.hasExit(direction)) {
            direction = LeaveRoomAction.getRandomExit(creep.room);
        }

        let exitPoint = creep.pos.findClosestByPath(direction);
        creep.memory['destination'] = exitPoint;
        creep.memory['path'] = creep.pos.findPathTo(exitPoint.x, exitPoint.y);
        creep.memory['originRoom'] = creep.room.name;
        creep.memory['action'] = this.KEY;
        switch (direction) {
            case FIND_EXIT_BOTTOM:
                creep.say('☟ bye');
                break;
            case FIND_EXIT_TOP:
                creep.say('☝ bye');
                break;
            case FIND_EXIT_LEFT:
                creep.say('☜ bye');
                break;
            case FIND_EXIT_RIGHT:
            default:
                creep.say('☞ bye');
                break;
        }
    }
}