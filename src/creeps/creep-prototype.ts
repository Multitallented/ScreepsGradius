import {Harvester} from "./roles/harvester";

const getBodyPartCost = function(bodyPartConstant:string):number {
    switch (bodyPartConstant) {
        case WORK:
            return 100;
        case ATTACK:
            return 80;
        case RANGED_ATTACK:
            return 150;
        case HEAL:
            return 250;
        case CLAIM:
            return 600;
        case TOUGH:
            return 10;
        case MOVE:
        case CARRY:
        default:
            return 50;
    }
};

const moveToTarget = function() {
    if (!this.memory['path']) {
        let source:RoomObject = Game.getObjectById(this.memory['target']);
        this.memory['path'] = this.room.findPath(this.pos, source.pos);
    }
    this.moveByPath(this.memory['path']);
};

const setNextAction = function() {
    switch (this.memory['role']) {
        case Harvester.KEY:
        default:
            Harvester.setAction(this);
    }
};

export class CreepPrototype {
    static init() {
        if (!Creep['init']) {
            Creep.prototype['getBodyPartCost'] = getBodyPartCost;
            Creep.prototype['moveToTarget'] = moveToTarget;
            Creep.prototype['setNextAction'] = setNextAction;
            Creep.prototype['init'] = true;
        }
    }
}