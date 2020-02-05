
export class StructureUtil {
    static getStructureTypePriority(structureType:StructureConstant):number {
        switch (structureType) {
            case STRUCTURE_TOWER:
                return 200;
            case STRUCTURE_SPAWN:
            case STRUCTURE_POWER_SPAWN:
                return 125;
            case STRUCTURE_EXTENSION:
                return 100;
            case STRUCTURE_CONTAINER:
                return 90;
            case STRUCTURE_STORAGE:
                return 75;
            case STRUCTURE_ROAD:
                return 10;
            case STRUCTURE_RAMPART:
                return 8;
            case STRUCTURE_WALL:
                return 7;
            default:
                return 0;
        }
    }

    static sortByPriority(array, tieBreaker:Function) {
        array.sort((x, y):number => {
            let xPriority:number = StructureUtil.getStructureTypePriority(x.structureType);
            let yPriority:number = StructureUtil.getStructureTypePriority(y.structureType);
            if (xPriority > yPriority) {
                return -1;
            } else if (yPriority > xPriority) {
                return 1;
            } else {
                if (tieBreaker) {
                    return tieBreaker(x, y);
                }
                return 0;
            }
        });
    }
}