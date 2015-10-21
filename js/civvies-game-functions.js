(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    _c.increment_from_click = function(game,resource){
        game.data.resources[resource.name]++;
        _c.updateResources(game);
        //TODO: Add in a delay, and a gui-countdown wipe in orange

    };
    _c.buildInitialData = function(game){
        game.data = game.data || {};

        game.data.resources = game.data.resources || {};
        _.each(game.game_options.resources, function(resource) {
            game.data.resources[resource.name] = resource.initial || 0;
        });

        game.data.buildings = game.data.buildings || {};
        _.each(game.game_options.buildings, function(building) {
            game.data.buildings[building.name] = building.initial || 0;
        });

        game.data.populations = game.data.populations || {};
        _.each(game.game_options.populations, function(population) {
            game.data.populations[population.name] = population.initial || 0;
        });

        game.data.variables = game.data.variables || {};
        _.each(game.game_options.variables, function(variable) {
            game.data.variables[variable.name] = variable.value || 0;
        });

        game.data.upgrades = game.data.upgrades || {};
        _.each(game.game_options.upgrades, function(upgrade) {
            game.data.upgrades[upgrade.name] = upgrade.initial || false;
        });

        game.data.achievements = game.data.achievements || {};
        _.each(game.game_options.achievements, function(achievement) {
            game.data.achievements[achievement.name] = achievement.initial || false;
        });
    };
    _c.info = function(game, kind, name) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        return _.find(game.game_options[kind], function(item){ return item.name == name});
    };
    _c.getResourceMax = function(game, resource) {
        var storage = game.game_options.storage_initial;
        _.each(game.game_options.buildings, function(building){
            if (building.supports && building.supports[resource.name]) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.supports[resource.name]);
            }
        });
        return storage;
    };
    _c.getResourceRate = function(game, resource) {

    };
    _c.cost_benefits_text = function(item) {

    };
    _c.create_building = function (game, building, amount) {

    };


    //-Not implemented yet------------------
    _c.createBuilding = function () {

    };
    _c.increment = function () {

    };
    _c.createBuilding = function () {

    };
    _c.buildCustom = function () {

    };
    _c.calcCost = function () {

    };
    _c.spawn = function () {

    };
    _c.spawnCustom = function () {

    };
    _c.jobCull = function () {

    };
    _c.hire = function () {

    };
    _c.hireAll = function () {

    };
    _c.fire = function () {

    };
    _c.fireAll = function () {

    };
    _c.fireCustom = function () {

    };
    _c.hireCustom = function () {

    };
    _c.raiseDead = function () {

    };
    _c.shade = function () {

    };
    _c.upgrade = function () {

    };
    _c.digGraves = function () {

    };
    _c.randomWorker = function () {

    };
    _c.wickerman = function () {

    };
    _c.walk = function () {

    };
    _c.pestControl = function () {

    };
    _c.plague = function () {

    };
    _c.spawnMob = function () {

    };
    _c.smite = function () {

    };
    _c.party = function () {

    };
    _c.partyCustom = function () {

    };
    _c.invade = function () {

    };
    _c.plunder = function () {

    };
    _c.glory = function () {

    };
    _c.grace = function () {

    };
    _c.mood = function () {

    };
    _c.startWonder = function () {

    };
    _c.renameWonder = function () {

    };
    _c.wonderBonus = function () {

    };
    _c.updateWonderLimited = function () {

    };
    _c.tradeTimer = function () {

    };
    _c.trade = function () {

    };
    _c.buy = function () {

    };
    _c.speedWonder = function () {

    };

})(Civvies);