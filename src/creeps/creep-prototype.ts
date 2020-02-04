import {Jack} from "./roles/jack";
import {MineEnergyAction} from "./actions/mine-energy";
import {UpgradeControllerAction} from "./actions/upgrade-controller";
import {TransferEnergyAction} from "./actions/transfer-energy";
import {Upgrader} from "./roles/upgrader";
import {Builder} from "./roles/builder";
import {BuildAction} from "./actions/build";
import {WithdrawEnergyAction} from "./actions/withdraw-energy";
import {Miner} from "./roles/miner";
import {RepairAction} from "./actions/repair";


const moveToTarget = function() {
    if (!this.memory['path']) {
        let source:RoomObject = Game.getObjectById(this.memory['target']);
        this.memory['path'] = this.room.findPath(this.pos, source.pos);
    }
    let moveMessage:CreepMoveReturnCode = this.moveByPath(this.memory['path']);
    if (moveMessage !== ERR_TIRED) {
        if (this.memory['prevPos'] && this.memory['prevPos'].x == this.pos.x &&
                this.memory['prevPos'].y == this.pos.y) {
            delete this.memory['path'];
            delete this.memory['prevPos'];
            this.moveToTarget();
        } else {
            this.memory['prevPos'] = this.pos;
        }
    }
};

const setNextAction = function() {
    switch (this.memory['role']) {
        case Miner.KEY:
            Miner.setAction(this);
            break;
        case Upgrader.KEY:
            Upgrader.setAction(this);
            break;
        case Builder.KEY:
            Builder.setAction(this);
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
        case RepairAction.KEY:
            RepairAction.run(this);
            break;
        case UpgradeControllerAction.KEY:
            UpgradeControllerAction.run(this);
            break;
        case BuildAction.KEY:
            BuildAction.run(this);
            break;
        case TransferEnergyAction.KEY:
            TransferEnergyAction.run(this);
            break;
        case WithdrawEnergyAction.KEY:
            WithdrawEnergyAction.run(this);
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