
export class StructureUtil {
    static getStructureTypePriority(structureType:StructureConstant):number {
        switch (structureType) {
            case STRUCTURE_TOWER:
                return 200;
            case STRUCTURE_SPAWN:
            case STRUCTURE_POWER_SPAWN:
                return 125;
            case STRUCTURE_CONTAINER:
                return 100;
            case STRUCTURE_ROAD:
                return 10;
            default:
                return 0;
        }
    }
}