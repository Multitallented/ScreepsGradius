import {SpawnPrototype} from "./spawn-prototype";
import {CreepSpawnData} from "./creep-spawn-data";

export class SpawnController {
    static run(spawn:StructureSpawn) {
        SpawnPrototype.init();
        let nextCreepToSpawn: CreepSpawnData = spawn.getNextCreepToSpawn();
        if (nextCreepToSpawn && nextCreepToSpawn.options &&
                nextCreepToSpawn.options['memory'] && nextCreepToSpawn.options['memory']['role']) {
            spawn.room.displayMessage(spawn.pos, nextCreepToSpawn.options['memory']['role']);
            if (nextCreepToSpawn.getEnergyRequired() <= spawn.room.energyAvailable &&
                (nextCreepToSpawn.getEnergyRequired() + 100 < spawn.room.energyAvailable ||
                    spawn.room.energyAvailable / spawn.room.energyCapacityAvailable > nextCreepToSpawn.minPercentCapacity)) {
                spawn.spawnCreep(nextCreepToSpawn.bodyArray, nextCreepToSpawn.name, nextCreepToSpawn.options);
            }
        } else if (spawn.spawning && spawn.spawning['memory'] && spawn.spawning['memory']['role']) {
            spawn.room.displayMessage(spawn.pos, spawn.spawning['memory']['role']);
        }
    }
}