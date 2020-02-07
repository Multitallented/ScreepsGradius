
export class WaitAction {
    static KEY = 'wait';
    static run(creep:Creep) {
        // Do nothing
    }

    static setAction(creep:Creep) {
        creep.memory['action'] = 'wait';
        creep.say('Zz sleep');
    }
}