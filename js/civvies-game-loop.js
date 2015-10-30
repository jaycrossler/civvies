(function (Civvies) {
    var _c = new Civvies('get_private_functions');

    function populations_produce_products(game) {
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
                        _c.increment_resource(game, res_c, can_consume * -amount_c);
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
                        _c.increment_resource(game, res_p, can_produce * amount_p);
                    }
                }
            }
        }
    }

    function eat_food_or_die(game) {
        var population = _c.population(game);

        if (population.current <= game.data.resources.food) {
            //Enough food, everyone is happy
            game.data.resources.food -= population.current_that_eats;
        } else {

            //First, try assigning any unemployed workers to farms

            if (game.data.populations.unemployed) {
                game.logMessage("Not enough food, assigned " + game.data.populations.unemployed+ " vagrants to farms", true);
                _c.assign_workers(game, _c.info(game,'populations','farmers'),game.data.populations.unemployed);
                return;
            }

            //The culling, eat most of the food, then start removing non-essential people
            game.data.resources.food *= .2;

            var to_remove = population.current_that_eats - game.data.resources.food - game.data.populations.farmers + .5;
            to_remove = Math.round(to_remove);
            if (to_remove < 0) return;

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

    function heal_the_wounded (game) {
        var sick_population = Math.ceil(game.data.populations.sick) || 0;
//        var ill_population = Math.ceil(game.data.populations.ill) || 0;  //TODO: Move from sick to ill
//        var dying_population = Math.ceil(game.data.populations.dying) || 0;

        var healing_amount = (Math.ceil(game.data.resources.healing) || 0) / 5;

        if (sick_population > 0 && healing_amount > 0) {
            if (healing_amount >= sick_population) {
                game.data.populations.sick = 0;
                game.data.populations.unemployed += sick_population;
                game.data.resources.healing -= sick_population;
                game.logMessage(sick_population + ' sick people healed');

            } else {
                game.data.populations.sick -= healing_amount;
                game.data.populations.unemployed += healing_amount;
                game.data.resources.healing = 0;
                game.logMessage(healing_amount + ' sick people healed');
            }
        }
    }
    function populations_possibly_get_sick (game) {
        //TODO: More unburied corpses means more disease
        //TODO: Have health variable remove disease
        //TODO: Sick people move to being ill, then swap back to their positions if healed, or to more ill, until dead (have a counter?)

        var current_disease_rate = _c.variable(game, "diseaseCurrent");
        var disease_steady = _c.variable(game, "diseaseSteady");

        var populations = _.filter(game.game_options.populations, function(job){return !job.doesnt_consume_food});
        _.each(populations, function(job_data){
            var jobs = game.data.populations[job_data.name];

            var disease_roll = _c.random(game.game_options);
            if (disease_roll < current_disease_rate) {
                var sick = Math.round(_c.random(game.game_options) * Math.sqrt(jobs));
                if (sick > 0) {
                    game.data.populations[job_data.name] -= sick;
                    game.data.populations.sick += sick;
                    game.logMessage(sick + ' ' + Helpers.pluralize(job_data.title || job_data.name) + ' became sick', true);
                }

            }
        });

        //TODO: Have disease spread
        //TODO: Have sick turn ill and then dying then corpse

        //Disease rate trends 1% towards steady
        current_disease_rate = (current_disease_rate * .99) + (disease_steady *.01);
        _c.variable(game, 'diseaseCurrent', current_disease_rate);

        //Healing loses efficiency by 1% every turn
        game.data.resources.healing = game.data.resources.healing || 0;
        game.data.resources.healing = Math.max((game.data.resources.healing - .1) * 0.99, 0);
    }
    function bury_the_dead (game) {
        var corpses = game.data.resources.corpses || 0;
        var graves_filled = game.data.variables.gravesFilled || 0;
        var burying_amount = 0;
        var plots = 0;

        //Find Plots
        _.each(game.game_options.buildings, function(building){
            if (building.supports && building.supports.grave_spot) {
                plots += (game.data.buildings[building.name] * building.supports.grave_spot);
            }
        });
        var plots_free = plots-graves_filled;

        //Burying Amount per turn
        _.each(game.game_options.populations, function(job){
            if (job.supports && job.supports.burying) {
                burying_amount += (game.data.populations[job.name] * job.supports.burying);
            }
        });

        if (burying_amount && corpses && plots_free) {
            var amount_buried = Math.min(Math.min(burying_amount, plots_free), game.data.resources.corpses);

            game.data.resources.corpses -= amount_buried;
            game.data.variables.gravesFilled += amount_buried;
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
        //TODO: Food seems to be eaten twice
        //TODO: Herbs went over upper limit, check limits are always in effect on random rolls

//        //Resource-related
        eat_food_or_die(game);
        populations_produce_products(game);
        populations_possibly_get_sick(game);
//        check_for_attacks(game);
//        check_for_accidents(game);
//        check_for_traders(game);
        bury_the_dead(game);
        heal_the_wounded(game);
//        build_a_wonder(game);


        //Run each registered function
        _.each(game.game_options.functions_each_tick, function(func){
            func(game);
        });

        _c.redraw_data(game);

        //Advance the tick clock
        game.data.tick_count = game.data.tick_count || 0;
        game.data.tick_count++;
    }

})(Civvies);