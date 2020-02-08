
export class MoveAction {
    static KEY = 'move';

    static run(creep:Creep) {
        if (creep.memory['destination'] && creep.pos.inRangeTo(creep.memory['destination'], 1)) {
            creep.setNextAction();
            return;
        } else if (creep.memory['target'] && creep.pos.inRangeTo(creep.memory['target'].pos, 1)) {
            creep.setNextAction();
            return;
        } else if (!creep.memory['target'] && !creep.memory['destination']) {
            delete creep.memory['target'];
            delete creep.memory['destination'];
            creep.setNextAction();
            return;
        } else {
            creep.moveToTarget();
        }
    }

    static setActionPos(creep:Creep, pos:RoomPosition) {
        creep.memory['destination'] = pos;
        creep.memory['action'] = MoveAction.KEY;
        creep.say('→ move');
    }
    static setActionTarget(creep:Creep, thing:Structure|Creep) {
        creep.memory['target'] = thing.id;
        creep.memory['action'] = MoveAction.KEY;
        creep.say('→ move');
    }
}