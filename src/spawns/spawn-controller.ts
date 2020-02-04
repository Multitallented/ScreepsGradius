import {SpawnPrototype} from "./spawn-prototype";
import {CreepSpawnData} from "./creep-spawn-data";

export class SpawnController {
    static run(spawn:StructureSpawn) {
        SpawnPrototype.init();
        let nextCreepToSpawn: CreepSpawnData = spawn.getNextCreepToSpawn();
        if (nextCreepToSpawn && nextCreepToSpawn.options['memory']['role']) {
            spawn.room.displayMessage(spawn.pos, nextCreepToSpawn.options['memory']['role']);
            if (nextCreepToSpawn.getEnergyRequired() <= spawn.store.energy) {
                spawn.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.options);
            }
        } else if (spawn.spawning) {
            spawn.room.displayMessage(spawn.pos, spawn.spawning['memory']['role']);
        }
    }
}