(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    function populations_produce_products(game) {
        var resource_changes = {};

        for (var val in game.data.populations) {
            var number = game.data.populations[val];
            if (number) {
                var job_details = _c.info(game, 'populations', val);
                var consumes = job_details.consumes;
                var produces = job_details.produces;
                var resource;

                var can_produce = number;

                if (consumes) {
                    var can_consume = number; //TODO: find the amount that can be consumed if it's only partial
                    for (resource in consumes) {
                        var res_c = _c.info(game, 'resources', resource);
                        var amount_c = consumes[resource];
                        if (_.isString(amount_c)) {
                            amount_c = game.data.variables[amount_c];
                        }
                        resource_changes[res_c.name] = resource_changes[res_c.name] || 0;
                        resource_changes[res_c.name] += can_consume * -amount_c;
                    }
                    can_produce = can_consume;
                }

                if (produces && can_produce) {
                    for (resource in produces) {
                        var res_p = _c.info(game, 'resources', resource);
                        var amount_p = produces[resource];
                        if (_.isString(amount_p)) {
                            amount_p = game.data.variables[amount_p];
                        }
                        resource_changes[res_p.name] = resource_changes[res_p.name] || 0;
                        resource_changes[res_p.name] += can_produce * amount_p;
                    }
                }
            }
        }

        //Make the actual changes after all taken into account
        for (var key in resource_changes) {
            _c.increment_resource(game, _c.info(game, 'resources', key), resource_changes[key]);
        }

    }

    function eat_food_or_die(game) {
        var population = _c.population(game);

        if (population.current_that_eats <= game.data.resources.food) {
            //Enough food, everyone is happy
            game.data.resources.food -= population.current_that_eats;
        } else {
            //First, try assigning any unemployed workers to farms
            var food_that_needs_to_be_found = population.current - game.data.resources.food;

            if (game.data.populations.unemployed) {
                var unemployed_moved = Math.min(food_that_needs_to_be_found, game.data.populations.unemployed);

                game.logMessage("Not enough food, assigned " + unemployed_moved + " vagrants to farms", true);
                _c.assign_workers(game, _c.info(game, 'populations', 'farmers'), unemployed_moved);
                return;
            }

            //The culling, eat most of the food, then start removing non-essential people
            game.data.resources.food *= .4;

            //Remove many of the remaining people
            var to_remove = population.current_that_eats - game.data.resources.food - (game.data.populations.farmers/2) + .5;
            to_remove = Math.round(to_remove);
            if (to_remove >= 1) {
                to_remove = _c.randManyRolls(to_remove, .7, game.game_options); //70% of the remaining starve
            }
            if (to_remove < 1) return;

            //TODO: population eats corpses instead, and gets sick

            game.logMessage("Not enough food, " + to_remove + " workers starved to death", true);

            var culling_order = game.game_options.populations.sort(function (a, b) {
                var a_ord = a.cull_order || ((a.doesnt_consume_food) ? 15 : 5);
                var b_ord = b.cull_order || ((b.doesnt_consume_food) ? 15 : 5);

                return a_ord - b_ord;
            });

            for (var p = 0; p < culling_order.length; p++) {
                if (to_remove > 0 && !culling_order[p].doesnt_consume_food) {
                    var name = culling_order[p].name;
                    var num = game.data.populations[name];
                    if (num >= to_remove) {
                        game.data.populations[name] -= to_remove;
                        to_remove = 0;  //Culling stops here
                    } else {
                        to_remove -= game.data.populations[name];
                        game.data.populations[name] = 0;
                    }
                }
            }
        }
    }

    //---------------------------
    var game_loop_timer = null;
    _c.start_game_loop = function (game, game_options) {
        game_options = game_options || {};

        //Run game tick every second
        _c.stop_game_loop(game);
        game.logMessage('Game Loop Starting');
        game_loop_timer = setInterval(function () {
            _c.tick_interval(game)
        }, game_options.tick_time || 1000);
    };
    _c.stop_game_loop = function (game) {
        if (game_loop_timer) {
            clearInterval(game_loop_timer);
            game.logMessage('Game Loop Stopped');
        }
    };
    _c.tick_interval = function (game) {
//        //The whole game runs on a single setInterval clock.
        _c.autosave_if_time(game);

        //TODO: Have a buffer so that food can be over the limit for the loop
        //TODO: Have all changes to resources first run and build a change matrix, then apply them at the end (so food surplus isn't removed beforehand)

        eat_food_or_die(game);
        populations_produce_products(game);
//        check_for_attacks(game);
//        check_for_accidents(game);
//        build_a_wonder(game);


        //Run each registered plugin function
        _.each(game.game_options.functions_each_tick, function (func) {
            func(game);
        });

        _c.redraw_data(game);

        //Advance the tick clock
        game.data.tick_count = game.data.tick_count || 0;
        game.data.tick_count++;
    }

})(Civvies);