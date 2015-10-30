function heal_the_wounded(game) {
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
function populations_possibly_get_sick(game) {
    //TODO: More unburied corpses means more disease
    //TODO: Have health variable remove disease
    //TODO: Sick people move to being ill, then swap back to their positions if healed, or to more ill, until dead (have a counter?)

    var current_disease_rate = _c.variable(game, "diseaseCurrent");
    var disease_steady = _c.variable(game, "diseaseSteady");

    var populations = _.filter(game.game_options.populations, function (job) {
        return !job.doesnt_consume_food
    });
    _.each(populations, function (job_data) {
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
    current_disease_rate = (current_disease_rate * .99) + (disease_steady * .01);
    _c.variable(game, 'diseaseCurrent', current_disease_rate);

    //Healing loses efficiency by 1% every turn
    game.data.resources.healing = game.data.resources.healing || 0;
    game.data.resources.healing = Math.max((game.data.resources.healing - .1) * 0.99, 0);

    if (current_disease_rate > .3) {
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
    {name: 'sick', title: 'sick people', type: 'basic', consumes: {food: 1}, notes: "Sick workers that need medical help and eat a large amount", unassignable: true, cull_order: 2},
    {name: 'ill', title: 'ill people', type: 'basic', consumes: {food: 1}, notes: "Ill workers that are very sick", unassignable: true, cull_order: 1},
    {name: 'diseased', title: 'diseased people', type: 'basic', consumes: {food: 1}, notes: "Diseased workers that are spread disease", unassignable: true, cull_order: 0},
    {name: 'dying', title: 'dying people', type: 'basic', consumes: {food: 1}, notes: "Workers that are almost dying", unassignable: true, cull_order: 0}
];

new Civvies('add_game_option', 'populations', sick_people);

new Civvies('add_game_option', 'achievements', {name: "diseased"});
new Civvies('add_game_option', 'achievements', {name: "plague"});

new Civvies('add_game_option', 'functions_each_tick', populations_possibly_get_sick);
new Civvies('add_game_option', 'functions_each_tick', bury_the_dead);
new Civvies('add_game_option', 'functions_each_tick', heal_the_wounded);