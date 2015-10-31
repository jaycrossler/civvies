//TODO: Mood
//TODO: Raiding
//TODO: Raising dead

(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    _c.increment_from_click = function (game, resource) {
        //Increment basic resource when it's clicked on to manually gather
        _c.increment_resource(game, resource, resource.amount_from_click || 1);
        _c.redraw_data(game);
        //TODO: Add in a delay, and a gui-countdown wipe in orange

    };
    _c.buildInitialData = function (game) {
        game.data = game.data || {};

        var arrays_to_data_objects = game.game_options.arrays_to_map_to_objects || [];
        _.each(arrays_to_data_objects, function (game_options_name) {
            //Add objects for each game_objects array to the game data
            game.data[game_options_name] = game.data[game_options_name] || {};
            _.each(game.game_options[game_options_name], function (item) {
                game.data[game_options_name][item.name] = game.data[game_options_name][item.name] || item.initial || 0;
            });
        });

        var arrays_to_array_objects = game.game_options.arrays_to_map_to_arrays || [];
        _.each(arrays_to_array_objects, function (game_options_name) {
            //Add an array for game_objects to the game data
            if (game.data[game_options_name] !== undefined) {
                //Already exists, don't add it
            } else {
                game.data[game_options_name] = game.data[game_options_name] || [];
                _.each(game.game_options[game_options_name], function (item) {
                    game.data[game_options_name].push(JSON.parse(JSON.stringify(item)));
                });
            }
        });

        game.data.rand_seed = game.data.rand_seed || game.game_options.rand_seed;
        game.data.tick_count = game.data.tick_count || 0;
    };
    _c.info = function (game, kind, name, sub_var, if_not_listed) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        var val = _.find(game.game_options[kind], function (item) {
            return item.name == name
        });
        if (val && sub_var) {
            val = val[sub_var];
        }
        if (!val) val = if_not_listed;

        return val;
    };
    _c.variable = function (game, var_name, set_to) {
        if (set_to === undefined) {
            return game.data.variables[var_name];
        } else {
            game.data.variables[var_name] = set_to;
        }
    };
    _c.getResourceMax = function (game, resource) {
        var storage = _c.variable(game, 'storageInitial');
        _.each(game.game_options.buildings, function (building) {
            if (building.supports && building.supports[resource.name]) {
                var num_buildings = game.data.buildings[building.name];
                storage += (num_buildings * building.supports[resource.name]);
            }
        });
        return storage;
    };
    _c.cost_text = function (game, item, times) {
        //Used to show on mouse hovers when popovers wot show
        var costs = [];
        for (key in item.costs || {}) {
            var amount = item.costs[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            var out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            costs.push(out);
        }

        return costs.length ? "Costs: " + costs.join(", ") : "";
    };

    _c.cost_benefits_text = function (game, item, as_html, times) {
        times = times || 1;
        if (!_.isNumber(times)) times = 1;

        var costs = [];
        var consumes = [];
        var benefits = [];
        var supports = [];
        var produces = [];
        var key, amount, out;

        for (key in item.costs || {}) {
            amount = item.costs[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

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
        for (key in item.consumes || {}) {
            amount = item.consumes[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='cost_text'>" + out + "</span>"
            }
            consumes.push(out);
        }
        for (key in item.benefits || {}) {
            amount = item.benefits[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

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
        for (key in item.produces || {}) {
            amount = item.produces[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

            out = Helpers.abbreviateNumber(amount) + " ";
            if (amount == 1) {
                out += key;
            } else {
                out += Helpers.pluralize(key);
            }
            if (as_html) {
                out = "<span class='benefit_text'>" + out + "</span>"
            }
            produces.push(out);
        }
        for (key in item.supports || {}) {
            amount = item.supports[key];
            if (_.isString(amount)) amount = game.data.variables[amount];
            amount *= times;

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
        _.each(item.chances || [], function (chance) {
            out = "";
            if (chance.resource) {
                out = "Chance to find " + chance.resource;
            }
            if (as_html) {
                out = "<span class='notes_text'>" + out + "</span>"
            }
            chances.push(out);
        });
        var style;
        if (item.type) {
            style = _.str.titleize(item.type);
            if (as_html) {
                style = "<b>Type: <span class='notes_text'>" + style + "</span></b>";
            } else {
                style = "Type: " + style;
            }
        }

        var text_pieces = [];
        if (style) text_pieces.push(style);
        if (gather) text_pieces.push(gather);
        if (costs.length) text_pieces.push("Costs: " + costs.join(", "));
        if (consumes.length) text_pieces.push("Consumes: " + consumes.join(", "));
        if (benefits.length) text_pieces.push("Benefits: " + benefits.join(", "));
        if (produces.length) text_pieces.push("Produces: " + produces.join(", "));
        if (chances.length) text_pieces.push(chances.join(", "));
        if (supports.length) text_pieces.push("Supports: " + supports.join(", "));
        if (notes) text_pieces.push("Notes: " + notes);

        var join_text = as_html ? ".</br>" : ".  ";

        return text_pieces.join(join_text) || "";
    };
    _c.upgrades_in_workflow = function(game, workflow) {
        return _.filter(game.game_options.upgrades, function(up){ return _.indexOf(workflow.upgrade_categories || [], up.type) > -1}) || [];
    };
    _c.upgrades_not_in_workflows = function (game) {
        var upgrades = [];
        var blocked = [];
        _.each(game.game_options.workflows, function (workflow) {
            if (workflow.upgrade_categories) {
                blocked = blocked.concat(workflow.upgrade_categories);
            }
        });
        _.each(game.game_options.upgrades, function (up) {
            if (up.type && _.indexOf(blocked, up.type) == -1) {
                upgrades.push(up);
            }
        });
        return upgrades;
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
            console.info("Can't purchase building: " + amount + "x " + building.name);
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
        _c.increment_resource(game, _c.info(game, 'resources', 'herbs'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'skins'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'ore'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'leather'), 10);
        _c.increment_resource(game, _c.info(game, 'resources', 'metal'), 10);

        _c.redraw_data(game);
    };
    _c.test2 = function (game) {
        _c.test(game);
        _c.create_building(game, _c.info(game, 'buildings', 'woodstock'), 1);
        _c.test(game);
        _c.create_building(game, _c.info(game, 'buildings', 'woodstock'), 2);
        _c.test(game);
        _c.create_building(game, _c.info(game, 'buildings', 'woodstock'), 4);
        _c.test(game);
        _c.create_building(game, _c.info(game, 'buildings', 'woodstock'), 2);
        _c.create_building(game, _c.info(game, 'buildings', 'stonestock'), 2);
        _c.create_building(game, _c.info(game, 'buildings', 'barn'), 2);
        _c.create_building(game, _c.info(game, 'buildings', 'hut'), 10);
        _c.test(game);
        _c.create_building(game, _c.info(game, 'buildings', 'woodstock'), 3);
        _c.create_building(game, _c.info(game, 'buildings', 'stonestock'), 3);
        _c.create_building(game, _c.info(game, 'buildings', 'barn'), 3);
        _c.test(game);

        _c.redraw_data(game);
    };


    _c.increment_resource = function (game, resource, amount) {

        var max = _c.getResourceMax(game, resource);
        game.data.resources[resource.name] = maths.clamp(game.data.resources[resource.name] + amount, 0, max);

        if (resource.chances) {
            _.each(resource.chances || [], function (chance) {
                var percent = chance.chance || 0.01;
                if (_.isString(percent)) {
                    percent = game.data.variables[percent];
                }
                if (_.isNumber(percent) && amount > 0) {
                    var num_special_resources = _c.randManyRolls(amount, percent, game.game_options);
                    _c.increment_resource(game, _c.info(game, 'resources', chance.resource), num_special_resources);
                }
            });
        }
    };
    _c.population = function (game) {
        var pop = {current: 0, max: 0, current_that_eats: 0, land_current: 0, land_max: 0};

        var people = 0;
        var eaters = 0;
        for (var key in game.data.populations) {
            people += game.data.populations[key];
            if (!_c.info(game, 'populations', key, 'doesnt_consume_food', false)) {
                eaters += game.data.populations[key];
            }
        }
        //TODO: Move this into the conquest plugin?
        //Count population and eaters in army
        if (game.data.armies) {
            _.each(game.data.armies, function(army){
                for (var key in army) {
                    if (key != 'name') {
                        var valid_person = (game.data.populations[key] !== undefined);

                        if (valid_person) {
                            people += army[key];

                            if (!_c.info(game, 'populations', key, 'doesnt_consume_food', false)) {
                                eaters += army[key];
                            }
                        }
                    }
                }
            });
        }

        pop.current = Math.round(people);
        pop.current_that_eats = Math.round(eaters);

        var storage = 0;
        var building_count = 0;
        _.each(game.game_options.buildings, function (building) {
            var num_buildings = game.data.buildings[building.name];
            if (building.population_supports) {
                storage += (num_buildings * building.population_supports);
            }
            var building_size = 1;
            if (building.land_size !== undefined) {
                building_size = building.land_size;
            }
            building_count += (num_buildings * building_size);
        });
        pop.land_current = Math.round(building_count);
        pop.max = Math.round(storage);

        var land_size = 0;
        _.each(game.data.land, function (land) {
            if (land.size) {
                land_size += land.size;
            }
        });
        pop.land_max = Math.round(land_size);

        var highest_pop = game.data.variables.highest_population || 0;
        if (pop.current > highest_pop) {
            _c.update_highest_population(game, pop.current);
        }
        if (highest_pop > 1000 && pop.current < 1) {
            game.data.achievements.ghostTown = true;
        }

        return pop;
    };
    _c.update_highest_population = function (game, current) {
        game.data.variables.highest_population = current;
        var city_type = _c.redraw_city_honorific(game);
        game.data.achievements[city_type] = true;
    };

    _c.redraw_city_honorific = function (game) {
        var current = game.data.variables.highest_population || 1;
        var city_type = 'Thorp';
        _.each(game.game_options.land_names, function (land_name) {
            if (current >= land_name.population_min) {
                city_type = land_name.name;
            }
        });
        game.data.variables.land_name = _.str.titleize(city_type.title || city_type);

        $('#civType')
            .text(game.data.variables.land_name);

        return city_type;
    };
    _c.worker_food_cost = function (game, times) {
        var initial_cost = _c.info(game, 'variables', 'foodCostInitial', 'value', 20);
        times = times || 1;

        var pop = _c.population(game);
        var food_cost = initial_cost + Math.floor((pop.current + times) / 100);

        return food_cost * times;
    };
    _c.create_workers = function (game, times) {
        if (_c.workers_are_creatable(game, times)) {
            game.data.resources.food -= _c.worker_food_cost(game, times);
            game.data.populations.unemployed += times;

            game.logMessage("Purchased: " + times + "x unemployed workers", true);
        }
    };
    _c.workers_are_creatable = function (game, times) {
        var enough_food = (_c.worker_food_cost(game, times) <= game.data.resources.food);
        var enough_space = false;
        if (enough_food) {
            var pop = _c.population(game);
            enough_space = (pop.current + times <= pop.max);
        }
        return enough_food && enough_space;
    };
    _c.population_is_assignable = function (game, job, times) {
        times = times || 1;
        //TODO: Take into account all/max

        var assignable = false;
        if (!job.unassignable) {
            var current = game.data.populations[job.name];
            if (_.isNumber(times)) {
                if (times > 0) {
                    var unassigned_workers = game.data.populations.unemployed;
                    if (times <= unassigned_workers) assignable = true;
                } else {
                    if ((current + times) >= 0) assignable = true;
                }
            }
            if (assignable && !job.doesnt_require_building) {
                //Check through buildings
                var offices_total = 0;
                _.each(game.game_options.buildings, function (building) {
                    if (building.supports) {
                        var offices_per = building.supports[job.name];
                        if (offices_per) {
                            offices_total += (game.data.buildings[building.name] * offices_per);
                        }
                    }
                });
                assignable = ((current + times) <= offices_total);
            }
            if (assignable && job.upgrades) {
                for (var ucost in job.upgrades) {
                    var has_upgrade = game.data.upgrades[ucost];
                    if (!has_upgrade) {
                        assignable = false;
                        break;
                    }
                }
            }

        }
        return assignable;
    };
    _c.assign_workers = function (game, job, times) {
        //TODO: Take into account all/max
        if (_c.population_is_assignable(game, job, times)) {
            if (_.isNumber(times)) {
                game.data.populations[job.name] += times;
                game.data.populations.unemployed -= times;

                if (job.achievement) {
                    game.data.achievements[job.achievement] = true;
                }
            }
        }
    };
    _c.can_purchase_upgrade = function (game, upgrade) {
        var resource_costs = upgrade.costs;

        var buildable = true;
        for (var cost in resource_costs) {
            var current = game.data.resources[cost];
            if (current < (resource_costs[cost])) {
                buildable = false;
                break;
            }
        }
        if (buildable) {
            for (var val in upgrade.upgrades) {
                if (!game.data.upgrades[val]) {
                    buildable = false;
                    break;
                }
            }
        }

        return buildable;
    };
    _c.purchase_upgrade = function (game, upgrade) {
        if (_c.can_purchase_upgrade(game, upgrade)) {

            var resource_costs = upgrade.costs;

            for (var cost in resource_costs) {
                var amount = resource_costs[cost];
                _c.increment_resource(game, _c.info(game, 'resources', cost), -amount);
            }
            game.data.upgrades[upgrade.name] = true;

            if (upgrade.variable_increase) {
                for (var val in upgrade.variable_increase) {
                    var inc_amount = upgrade.variable_increase[val];
                    if (game.data.variables[val] === undefined) {
                        game.data.variables[val] = inc_amount;
                    } else {
                        game.data.variables[val] += inc_amount;
                    }
                }
            }
            if (upgrade.variable_set) {
                for (var val in upgrade.variable_increase) {
                    game.data.variables[val] = upgrade.variable_increase[val];
                }
            }
        }
    };
    _c.rate_of_job_from_resource = function (game, job, resource, amount) {
        var rate = 0;
        if (amount && job.produces && job.produces[resource.name]) {
            var rate_per = job.produces[resource.name];
            if (_.isString(rate_per)) rate_per = game.data.variables[rate_per];
            rate += (rate_per * amount);
        }

        if (amount && job.consumes && job.consumes[resource.name]) {
            var rate_less = job.consumes[resource.name];
            if (_.isString(rate_less)) rate_less = game.data.variables[rate_less];
            rate -= (rate_less * amount);
        }
        return rate;
    };
    _c.calculate_resource_rates = function (game) {
        var increments = {};
        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 1) {
                var rate = 0;
                //How much is being produced and consumed
                _.each(game.game_options.populations, function (job) {
                    rate += _c.rate_of_job_from_resource(game, job, resource, game.data.populations[job.name]);
                });
                //TODO: Move to conquest plugin?

                //Also count consumbales from armies
                if (game.data.armies) {
                    _.each(game.data.armies, function(army){
                        for (var key in army) {
                            if (key != 'name') {
                                var job = _c.info(game, 'populations', key);

                                if (job !== undefined) {
                                    rate += _c.rate_of_job_from_resource(game, job, resource, army[key]);
                                }
                            }
                        }
                    });
                }

                if (resource.name == 'food') {
                    var population = _c.population(game);
                    rate -= population.current_that_eats;
                }
                increments[resource.name] = rate;
            }
        });
        return increments;
    };


    //-Not implemented yet------------------
//    _c.raiseDead = function () {
//
//    };
//    _c.shade = function () {
//
//    };
//    _c.upgrade = function () {
//
//    };
//    _c.digGraves = function () {
//
//    };
//    _c.randomWorker = function () {
//
//    };
//    _c.wickerman = function () {
//
//    };
//    _c.walk = function () {
//
//    };
//    _c.pestControl = function () {
//
//    };
//    _c.plague = function () {
//
//    };
//    _c.spawnMob = function () {
//
//    };
//    _c.smite = function () {
//
//    };
//    _c.party = function () {
//
//    };
//    _c.partyCustom = function () {
//
//    };
//    _c.invade = function () {
//
//    };
//    _c.plunder = function () {
//
//    };
//    _c.glory = function () {
//
//    };
//    _c.grace = function () {
//
//    };
//    _c.mood = function () {
//
//    };
//    _c.startWonder = function () {
//
//    };
//    _c.renameWonder = function () {
//
//    };
//    _c.wonderBonus = function () {
//
//    };
//    _c.updateWonderLimited = function () {
//
//    };
//    _c.tradeTimer = function () {
//
//    };
//    _c.trade = function () {
//
//    };
//    _c.buy = function () {
//
//    };
//    _c.speedWonder = function () {
//
//    };

})(Civvies);