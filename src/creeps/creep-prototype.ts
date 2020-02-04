import {Jack} from "./roles/jack";
import {MineEnergyAction} from "./actions/mine-energy";
import {UpgradeControllerAction} from "./actions/upgrade-controller";
import {TransferEnergyAction} from "./actions/transfer-energy";
import {Upgrader} from "./roles/upgrader";


const moveToTarget = function() {
    if (!this.memory['path']) {
        let source:RoomObject = Game.getObjectById(this.memory['target']);
        this.memory['path'] = this.room.findPath(this.pos, source.pos);
    }
    this.moveByPath(this.memory['path']);
};

const setNextAction = function() {
    switch (this.memory['role']) {
        case Upgrader.KEY:
            Upgrader.setAction(this);
            break;
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
        case TransferEnergyAction.KEY:
            TransferEnergyAction.run(this);
            break;
        case MineEnergyAction.KEY:
        default:
            MineEnergyAction.run(this);
            break;
    }
};

declare global {
    interface Creep {
        moveToTarget();
        setNextAction();
        runAction();
        init: boolean;
    }
}

export class CreepPrototype {
    static init() {
        if (!Creep['init']) {
            Creep.prototype.moveToTarget = moveToTarget;
            Creep.prototype.setNextAction = setNextAction;
            Creep.prototype.runAction = runAction;
            Creep.prototype.init = true;
        }
    }
}