(function (Civvies) {

    var _c = new Civvies('get_private_functions');

    function heal_the_wounded(game) {
        var sick = _.filter(game.game_options.populations, function (person) {
            return person.healing_cost
        });
        sick.sort(function (a, b) {
            return b.healing_cost - a.healing_cost
        });
        _.each(sick, function (person) {
            var name = person.name;
            var sick_count = Math.ceil(game.data.populations[name]) || 0;
            var cost = (person.healing_cost || 1);

            var heal_to = person.better_to || 'unemployed';
            if (_.isArray(heal_to)) {
                heal_to = _c.randOption(heal_to, game.game_options);
            }

            var amount_can_heal = Math.min(Math.floor((game.data.resources.healing || 0) / cost), sick_count);
            if (amount_can_heal) {
                game.data.populations[name] -= amount_can_heal;
                game.data.populations[heal_to] += amount_can_heal;
                game.data.resources.healing -= amount_can_heal * cost;
                game.logMessage(sick_count + ' ' + name + ' people healed to be ' + heal_to);
            }
        });

        _.each(sick, function (person) {
            if (game.data.populations[person.name] < 0) {
                game.data.populations[person.name] = 0;
            }
        });

    }

    function populations_possibly_get_sick(game) {
        //TODO: Track where sick people came from, and return them to those jobs if possible when healed - some queue?

        var current_disease_rate = _c.variable(game, "diseaseCurrent");
        var num_healers_buffer = Math.sqrt(game.data.populations.apothecaries + (game.data.populations.clerics / 2 ));

        var disease_spread_chance = .01;
        var num_corpses = game.data.populations.corpses || 0;
        if (num_corpses > 5) {
            disease_spread_chance *= Math.sqrt(num_corpses);
        }

        //Check everyone that consumes food to see if they got sick
        var populations = _.filter(game.game_options.populations, function (job) {
            return !job.doesnt_consume_food
        });
        _.each(populations, function (job_data) {
            var jobs = game.data.populations[job_data.name];

            var people_became_sick = _c.randManyRolls(jobs, current_disease_rate, game.game_options);
            if (people_became_sick > num_healers_buffer) {
                game.data.populations[job_data.name] -= people_became_sick;
                var num_sick = Math.round(people_became_sick * (1-disease_spread_chance));
                if (num_sick > num_healers_buffer) {
                    game.logMessage(people_became_sick + ' ' + Helpers.pluralize(job_data.title || job_data.name) + ' became sick', true);
                    game.data.populations.sick += num_sick;
                }

                var num_diseased = Math.round(people_became_sick * (disease_spread_chance));
                if (num_diseased > num_healers_buffer) {
                    game.logMessage(people_became_sick + ' ' + Helpers.pluralize(job_data.title || job_data.name) + ' became sick', true);
                    game.data.populations.diseased += num_diseased;
                }
            }
        });


        //Disease rate trends 1% towards steady
        var disease_steady = _c.variable(game, "diseaseSteady");
        current_disease_rate = (current_disease_rate * .99) + (disease_steady * .01);
        current_disease_rate = maths.clamp(current_disease_rate, disease_steady, .11);
        _c.variable(game, 'diseaseCurrent', current_disease_rate);

        //Healing loses efficacy by 1% every turn
        game.data.resources.healing = game.data.resources.healing || 0;
        game.data.resources.healing = Math.max((game.data.resources.healing - .1) * 0.99, 0);

        if (current_disease_rate >= .1) {
            game.data.achievements.diseased = true;
        }
    }

    function bury_the_dead(game) {
        var corpses = game.data.resources.corpses || 0;
        var graves_filled = game.data.variables.gravesFilled || 0;
        var burying_amount = 0;
        var plots = 0;

        //Find Plots
        _.each(game.game_options.buildings, function (building) {
            if (building.supports && building.supports.grave_spot) {
                plots += (game.data.buildings[building.name] * building.supports.grave_spot);
            }
        });
        var plots_free = plots - graves_filled;

        //Burying Amount per turn
        _.each(game.game_options.populations, function (job) {
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

    var sick_people = [
        {name: 'sick', title: 'sick people', type: 'basic', consumes: {food: 1}, notes: "Sick workers that need medical help and eat a large amount", unassignable: true, cull_order: 2, healing_cost: 1, better_to: 'farmers', worse_to: 'ill'},
        {name: 'ill', title: 'ill people', type: 'basic', consumes: {food: 1}, notes: "Ill workers that are very sick", unassignable: true, cull_order: 1, healing_cost: 2, better_to: 'sick', worse_to: ['dying', 'diseased']},
        {name: 'diseased', title: 'diseased people', type: 'basic', consumes: {food: 1}, notes: "Diseased workers that are spread disease", unassignable: true, cull_order: 1, healing_cost: 3, better_to: 'ill', worse_to: 'corpse'},
        {name: 'dying', title: 'dying people', type: 'basic', consumes: {food: 1}, notes: "Workers that are almost dying", unassignable: true, cull_order: 1, dont_capture: true, healing_cost: 3, better_to: 'ill', worse_to: 'corpse'}
    ];

    new Civvies('add_game_option', 'populations', sick_people);

    new Civvies('add_game_option', 'achievements', {name: "diseased", category: "health"});
    new Civvies('add_game_option', 'achievements', {name: "plague", category: "health"});

    new Civvies('add_game_option', 'functions_each_tick', populations_possibly_get_sick);
    new Civvies('add_game_option', 'functions_each_tick', heal_the_wounded);
    new Civvies('add_game_option', 'functions_each_tick', bury_the_dead);

})(Civvies);