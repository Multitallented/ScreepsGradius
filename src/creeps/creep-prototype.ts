import {Jack} from "./roles/jack";
import {MineEnergyAction} from "./actions/mine-energy";
import {UpgradeControllerAction} from "./actions/upgrade-controller";
import {TransferAction} from "./actions/transfer";
import {Upgrader} from "./roles/upgrader";
import {Builder} from "./roles/builder";
import {BuildAction} from "./actions/build";
import {WithdrawAction} from "./actions/withdraw";
import {Miner} from "./roles/miner";
import {RepairAction} from "./actions/repair";
import {Courier} from "./roles/courier";
import {PickupAction} from "./actions/pickup";


const moveToTarget = function() {
    if (!this.memory['path']) {
        let source:RoomObject = Game.getObjectById(this.memory['target']);
        if (source && source.pos) {
            this.memory['path'] = this.room.findPath(this.pos, source.pos);
        } else {
            delete this.memory['target'];
        }
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
    if (!this.memory['actionSwitched']) {
        this.memory['actionSwitched'] = true;
    } else {
        return;
    }
    switch (this.memory['role']) {
        case Courier.KEY:
            Courier.setAction(this);
            break;
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
        case PickupAction.KEY:
            PickupAction.run(this);
            break;
        case RepairAction.KEY:
            RepairAction.run(this);
            break;
        case UpgradeControllerAction.KEY:
            UpgradeControllerAction.run(this);
            break;
        case BuildAction.KEY:
            BuildAction.run(this);
            break;
        case TransferAction.KEY:
            TransferAction.run(this);
            break;
        case WithdrawAction.KEY:
            WithdrawAction.run(this);
            break;
        case MineEnergyAction.KEY:
            MineEnergyAction.run(this);
        default:
            this.getDefaultAction()(this);
            break;
    }
};

const getDefaultAction = function():Function {
    if (!this.memory['role']) {
        return MineEnergyAction.run;
    }
    switch (this.memory['role']) {
        case Miner.KEY:
            if (!this.memory['actionSwitched']) {
                this.memory['actionSwitched'] = true;
                this.memory['action'] = TransferAction.KEY;
                Miner.setAction(this);
            }
            return MineEnergyAction.run;
        case Courier.KEY:
            return WithdrawAction.run;
        case Jack.KEY:
            return MineEnergyAction.run;
        default:
            return WithdrawAction.run;
    }
};

declare global {
    interface Creep {
        getDefaultAction():Function;
        moveToTarget();
        setNextAction();
        runAction();
        init: boolean;
    }
}

export class CreepPrototype {
    static init() {
        if (!Creep['init']) {
            Creep.prototype.getDefaultAction = getDefaultAction;
            Creep.prototype.moveToTarget = moveToTarget;
            Creep.prototype.setNextAction = setNextAction;
            Creep.prototype.runAction = runAction;
            Creep.prototype.init = true;
        }
    }
}