
export class BuildAction {
    static KEY = 'build';

    static run(creep:Creep) {
        if (creep.store.getUsedCapacity() === 0 || !creep.memory['target']) {
            delete creep.memory['target'];
            delete creep.memory['path'];
            creep.setNextAction();
            return;
        }
        let constructionSite = Game.getObjectById(creep.memory['target']);
        if (!constructionSite || (!constructionSite['progress'] && !constructionSite['progressTotal'])) {
            creep.setNextAction();
            return;
        }
        let buildMessage = creep.build(<ConstructionSite> constructionSite);
        if (buildMessage === ERR_NOT_IN_RANGE) {
            creep.moveToTarget();
        }
    }

    static setAction(creep:Creep, target:ConstructionSite) {
        creep.memory['target'] = target.id;
        creep.memory['action'] = this.KEY;
        creep.say('✍ build');
    }
}