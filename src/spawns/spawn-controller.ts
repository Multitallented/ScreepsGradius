import {SpawnPrototype} from "./spawn-prototype";
import {CreepSpawnData} from "./creep-spawn-data";

export class SpawnController {
    static run(spawn:StructureSpawn) {
        SpawnPrototype.init();
        let nextCreepToSpawn: CreepSpawnData = spawn.getNextCreepToSpawn();
        if (nextCreepToSpawn != null) {
            spawn.room.displayMessage(spawn.pos, nextCreepToSpawn.memory['role']);
            if (nextCreepToSpawn.getEnergyRequired() <= spawn.store.energy) {
                spawn.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.memory);
            }
        }
    }
}