import * as _ from "lodash";

export class CreepSpawnData {
    public bodyArray: Array<BodyPartConstant>;
    public name: string;
    public memory: Object;

    static getBodyPartCost(bodyPartConstant:BodyPartConstant):number {
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
    }

    constructor(bodyArray:Array<BodyPartConstant>, name:string, memory:Object) {
        this.bodyArray = bodyArray;
        this.name = name;
        this.memory = memory;
    }

    getEnergyRequired(): number {
        let total = 0;
        _.forEach(this.bodyArray, (bodyPart:BodyPartConstant) => {
            total += CreepSpawnData.getBodyPartCost(bodyPart);
        });
        return total;
    }
}