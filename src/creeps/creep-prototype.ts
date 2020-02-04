import {Jack} from "./roles/jack";
import {MineEnergyAction} from "./actions/mine";
import {UpgradeControllerAction} from "./actions/upgrade-controller";

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
        case Jack.KEY:
        default:
            Jack.setAction(this);
    }
};

const runAction = function() {
    if (!this.memory['action']) {
        this.memory['action'] = MineEnergyAction.KEY;
    }
    switch (this.memory['action']) {
        case UpgradeControllerAction.KEY:
            UpgradeControllerAction.run(this);
            break;
        case MineEnergyAction.KEY:
        default:
            MineEnergyAction.run(this);
            break;
    }
};

declare global {
    interface Creep {
        getBodyPartCost(bodyPartConstant:string): number;
        moveToTarget();
        setNextAction();
        runAction();
        init: boolean;
    }
}

export class CreepPrototype {
    static init() {
        if (!Creep['init']) {
            Creep.prototype.getBodyPartCost = getBodyPartCost;
            Creep.prototype.moveToTarget = moveToTarget;
            Creep.prototype.setNextAction = setNextAction;
            Creep.prototype.runAction = runAction;
            Creep.prototype.init = true;
        }
    }
}