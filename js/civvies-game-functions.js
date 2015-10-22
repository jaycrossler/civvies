(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    _c.increment_from_click = function (game, resource) {
        _c.increment_resource(game, resource, resource.amount_from_click || 1);
        _c.redraw_data(game);
        //TODO: Add in a delay, and a gui-countdown wipe in orange

    };
    _c.buildInitialData = function (game) {
        game.data = game.data || {};

        game.data.resources = game.data.resources || {};
        _.each(game.game_options.resources, function (resource) {
            game.data.resources[resource.name] = resource.initial || 0;
        });

        game.data.buildings = game.data.buildings || {};
        _.each(game.game_options.buildings, function (building) {
            game.data.buildings[building.name] = building.initial || 0;
        });

        game.data.populations = game.data.populations || {};
        _.each(game.game_options.populations, function (population) {
            game.data.populations[population.name] = population.initial || 0;
        });

        game.data.variables = game.data.variables || {};
        _.each(game.game_options.variables, function (variable) {
            game.data.variables[variable.name] = variable.value || 0;
        });

        game.data.upgrades = game.data.upgrades || {};
        _.each(game.game_options.upgrades, function (upgrade) {
            game.data.upgrades[upgrade.name] = upgrade.initial || false;
        });

        game.data.achievements = game.data.achievements || {};
        _.each(game.game_options.achievements, function (achievement) {
            game.data.achievements[achievement.name] = achievement.initial || false;
        });
    };
    _c.info = function (game, kind, name, sub_var, if_not_listed) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        var val = _.find(game.game_options[kind], function (item) {
            return item.name == name
        });
        if (val && sub_var && val[sub_var]) {
            val = val[sub_var];
        }
        if (!val) val = if_not_listed;

        return val;
    };
    _c.getResourceMax = function (game, resource) {
        var storage = game.game_options.storage_initial;
        _.each(game.game_options.buildings, function (building) {
            if (building.supports && building.supports[resource.name]) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.supports[resource.name]);
            }
        });
        return storage;
    };
    _c.getResourceRate = function (game, resource) {

    };
    _c.cost_benefits_text = function (item, as_html, times) {
        times = times || 1;
        var costs = [];
        var benefits = [];
        var supports = [];
        var key, amount, out;

        for (key in item.costs || {}) {
            amount = item.costs[key] * times;
            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='cost_text'>" + out + "</span>"
            }
            costs.push(out);
        }

        for (key in item.benefits || {}) {
            amount = item.benefits[key] * times;
            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            benefits.push(out);
        }
        for (key in item.supports || {}) {
            amount = item.supports[key] * times;
            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            supports.push(out);
        }
        if (item.population_supports) {
            if (amount == 1) {
                out = "houses 1 person";
            } else {
                out = "houses " + Helpers.abbreviateNumber(item.population_supports * times) + " people";
            }
            if (as_html) {
                out = "<span class='benefit_population_text'>" + out + "</span>"
            }
            benefits.push(out);
        }
        var notes;
        if (item.notes) {
            notes = item.notes;
            if (as_html) {
                notes = "<span class='notes_text'>" + notes + "</span>";
            }
        }
        var gather;
        if (item.amount_from_click) {
            gather = "Gather " + item.amount_from_click + ' ' + Helpers.pluralize(item.name);
            if (as_html) {
                gather = "<span class='benefit_text'>" + gather + "</span>";
            }
        }
        var chances = [];
        _.each(item.chances || [], function(chance){
            out = "";
            if (chance.resource) {
                out = "Chance to find " + chance.resource;
            }
            if (as_html) {
                out = "<span class='notes_text'>" + out + "</span>"
            }
            chances.push(out);
        });

        var text_pieces = [];
        if (gather) text_pieces.push(gather);
        if (costs.length) text_pieces.push("Costs: "+costs.join(", "));
        if (benefits.length) text_pieces.push("Benefits: "+benefits.join(", "));
        if (chances.length) text_pieces.push(chances.join(", "));
        if (supports.length) text_pieces.push("Supports: "+supports.join(", "));
        if (notes) text_pieces.push("Notes: "+notes);

        var join_text = as_html ? ".</br>" : ".  ";

        return text_pieces.join(join_text) || "";
    };
    _c.create_building = function (game, building, amount) {
        amount = amount || 1;
        if (_c.building_is_purchasable(game, building, amount)) {
            var resource_costs = building.costs || {};
            for (var cost in resource_costs) {
                game.data.resources[cost] -= (amount * resource_costs[cost])
            }
            game.data.buildings[building.name] += amount;
            _c.redraw_data(game);

            game.logMessage("Purchased: " + amount + "x " + building.name, true);
        } else {
            console.error("Can't purchase building: " + amount + "x " + building.name);
        }
    };
    _c.building_is_purchasable = function (game, building, amount) {
        amount = amount || 1;
        var resource_costs = building.costs || {};
        var upgrades_cost = building.upgrades || {};

        var buildable = true;
        for (var cost in resource_costs) {
            var current = game.data.resources[cost];
            if (current < (amount * resource_costs[cost])) {
                buildable = false;
                break;
            }
        }
        if (buildable) {
            for (var ucost in upgrades_cost) {
                var has_upgrade = game.data.upgrades[ucost];
                if (!has_upgrade) {
                    buildable = false;
                    break;
                }
            }
        }
        return buildable;
    };
    _c.test = function (game) {
        _c.increment_resource(game, _c.info(game, 'resources', 'food'), 1000);
        _c.increment_resource(game, _c.info(game, 'resources', 'wood'), 1000);
        _c.increment_resource(game, _c.info(game, 'resources', 'stone'), 1000);
        _c.redraw_data(game);
    };
    _c.increment_resource = function (game, resource, amount) {

        //TODO: This now only does one roll, then gives resources if roll passes. Needs to simulate doing 'amount' roles
        var max = _c.getResourceMax(game, resource);
        game.data.resources[resource.name] = maths.clamp(game.data.resources[resource.name] + amount, 0, max);

        if (resource.chances) {
            _.each(resource.chances || [], function(chance){
                var percent = chance.chance || 0.01;
                if (_.isString(percent)) {
                    percent = game.data.variables[percent];
                }
                if (_.isNumber(percent)){
                    if (_c.random(game.game_options) < percent) {
                        if (chance.resource) {
                            game.data.resources[chance.resource] += amount;
                        }
                    }
                }
            });
        }
    };
    _c.population = function(game) {
        var pop = {current:0, max:0};

        var people = 0;
        for (var key in game.data.populations) {
            people += game.data.populations[key];
        }
        pop.current = people;

        var storage = 0;
        _.each(game.game_options.buildings, function (building) {
            if (building.population_supports) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.population_supports);
            }
        });
        pop.max = storage;

        return pop;
    };
    _c.worker_food_cost = function(game, times) {
        var initial_cost = _c.info(game,'variables','foodCostInitial', 'value', 20);
        times = times || 1;

        var pop = _c.population(game);
        var food_cost = initial_cost + Math.floor((pop.current+times) / 100);

        return food_cost*times;
    };
    _c.create_workers = function(game, times) {
        if (_c.workers_are_creatable(game, times)){
            game.data.resources.food -= _c.worker_food_cost(game, times);
            game.data.populations.unemployed += times;

            game.logMessage("Purchased: " + times + "x unemployed workers", true);
        }
    };
    _c.workers_are_creatable = function(game, times) {
        var enough_food = (_c.worker_food_cost(game, times) <= game.data.resources.food);
        var enough_space = false;
        if (enough_food) {
            var pop = _c.population(game);
            enough_space = (pop.current+times <= pop.max);
        }
        return enough_food && enough_space;
    };



    //-Not implemented yet------------------
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