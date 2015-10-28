var _c = new Civvies('get_private_functions');
var army_id_to_assign_to = 0;

var $pointers_conquest = {forces:[], lands:[]};


_c.assign_to_army = function(game, job, amount, army_id) {
    game.data.armies[army_id] = game.data.armies[army_id] || {};
    game.data.armies[army_id][job.name] = game.data.armies[army_id][job.name] || 0;

    var current_at_city = game.data.populations[job.name];
    var current_in_army = game.data.armies[army_id][job.name];

    if ((amount > 0) && (current_at_city >= amount)) {
        game.data.populations[job.name] -= amount;
        game.data.armies[army_id][job.name] += amount;
        _c.redraw_data(game);
    } else if ((amount < 0) && (current_in_army >= -amount)) {
        game.data.populations[job.name] -= amount;
        game.data.armies[army_id][job.name] += amount;
        _c.redraw_data(game);
    }

};
_c.attack_with_army = function(game, army_id, land_name, options, func_finish) {

    func_finish(game, {result: Math.random() <.5 ? 'victory' : 'defeat'})
};
function army_size(game, army_id) {
    var army = game.data.armies[army_id];
    var count = 0;
    for (var key in army) {
        if (key != 'name' && _.isNumber(army[key])) {
            count += army[key];
        }
    }
    return count;
}

function build_ui_controls(game) {
    //Return a $ object that will be added to a div on the corresponding pane
    game.data.armies = game.data.armies || [];

    var $holder = $('<div>');
    $('<hr>').appendTo($holder);

    $('<div>')
        .text('Your Army')
        .css({fontWeight:'bold'})
        .popover({title: "Build up an invading armed force", content: "Transfer soldiers and cavalry between your city and your army.", trigger: 'hover', placement: 'bottom'})
        .appendTo($holder);

    _.each(game.game_options.populations, function(job){
        if (job.can_join_army) {
            var army = game.data.armies[army_id_to_assign_to] || {};

            army[job.name] = army[job.name] || 0;
            $pointers_conquest.forces[job.name] = $pointers_conquest.forces[job.name] || {};

            var amount = army[job.name];//game.data.populations[job.name];
            var $unit = $('<div>')
                .appendTo($holder);

            $pointers_conquest.forces[job.name].remove10 = $('<button>')
                .text('-10')
                .popover({title: "Remove 10 from army", content: "Remove 10 "+job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, -10 , army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
            $pointers_conquest.forces[job.name].remove1 = $('<button>')
                .text('-1')
                .popover({title: "Remove 1 from army", content: "Remove 1 "+job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, -1 , army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);

            var $div = $('<div>')
                .css({width:'120px', display:'inline-block', textAlign:'center'})
                .appendTo($unit);

            $('<span>')
                .text(_.str.titleize(job.title || job.name) + ": ")
                .appendTo($div);
            $pointers_conquest.forces[job.name].number = $('<span>')
                .text(amount)
                .addClass('number')
                .appendTo($div);

            $pointers_conquest.forces[job.name].add1 = $('<button>')
                .text('+1')
                .popover({title: "Add 1 to army", content: "Add 1 "+job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, 1 , army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
            $pointers_conquest.forces[job.name].add10 = $('<button>')
                .text('+10')
                .popover({title: "Add 10 to army", content: "Add 10 "+job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, 10 , army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
        }
    });

    $('<hr>').appendTo($holder);
    var $battle_holder = $('<div>').appendTo($holder);

    var $land_holder = $('<div>')
        .css({display:'inline-block'})
        .appendTo($battle_holder);

    $pointers_conquest.battle_result_holder = $('<div>')
        .css({display:'inline-block',verticalAlign:'top'})
        .appendTo($battle_holder);

    _.each(game.game_options.land_names, function(land_name, i){
        $pointers_conquest.lands[land_name.name] = $pointers_conquest.lands[land_name.name] || {};

        var func_finish = function(game, battle_result) {
            var $battle_result = $('<div>')
                .prependTo($pointers_conquest.battle_result_holder);

            if (battle_result.result == 'victory'){
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor:'green'});
                $battle_result
                    .css({backgroundColor:'green'});

            } else if (battle_result.result == 'defeat'){
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor:'red'});
                $battle_result
                    .css({backgroundColor:'red'});
            } else {
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor:'orange'});
                $battle_result
                    .css({backgroundColor:'orange'});
            }
            $('<span>')
                .text(_.str.titleize(battle_result.result)+'!')
                .css({padding:'10px'})
                .appendTo($battle_result);

            //TODO: Add a battlechest and more result details
        };

        var $land = $('<div>')
            .appendTo($land_holder);
        $pointers_conquest.lands[land_name.name].button = $('<button>')
            .text('Attack with your army')
            .prop({disabled: true})
            .on('click', function () {
                _c.attack_with_army(game, army_id_to_assign_to, land_name, {}, func_finish);
                _c.redraw_data(game);
            })
            .appendTo($land);

        var name = _.str.titleize(land_name.title || land_name.name);
        var min = land_name.population_min  /20;
        var max = min * 10;
        var next = game.game_options.land_names[i+1];
        if (next && next.population_min) {
            max = next.population_min / 10;
        }
        var description = "A " + name + " has at least "+ Helpers.abbreviateNumber(land_name.population_min) +
            " citizens. They likely have between " + Helpers.abbreviateNumber(min) + " and " +
            Helpers.abbreviateNumber(max) + " protectors";
        $('<span>')
            .html(name)
            .css({fontWeight:'bold'})
            .popover({title: "Attack " + name, content: description, trigger: 'hover', placement: 'bottom'})
            .appendTo($land);
        $pointers_conquest.lands[land_name.name].attack_details = $('<span>')
            .html('')
            .appendTo($land);

    });

    $('<hr>').appendTo($holder);

    return $holder;
}
function redraw_ui_controls(game) {

    _.each(game.game_options.populations, function(job) {
        if (job.can_join_army) {
            var army = game.data.armies[army_id_to_assign_to] || {};
            $pointers_conquest.forces[job.name].number.text(army[job.name]);


            var current_at_city = game.data.populations[job.name] || 0;
            var current_in_army = army[job.name] || 0;

            _.each([-10,-1,1,10], function(amount){
                if (amount > 0) {
                    $pointers_conquest.forces[job.name]['add' + Math.abs(amount)]
                        .prop({disabled: (current_at_city < amount)})
                        .popover('hide');
                } else {
                    $pointers_conquest.forces[job.name]['remove' + Math.abs(amount)]
                        .prop({disabled: (current_in_army+amount<0)})
                        .popover('hide');
                }

            });

        }
    });

    var army_count = army_size(game, army_id_to_assign_to);
    _.each(game.game_options.land_names, function(land_name) {
        $pointers_conquest.lands[land_name.name].button.prop('disabled', (army_count < 1));
    });

}

function run_battle_state(game) {
    console.log('test battle');
}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}},
    {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades: {masonry: true, domestication: true}},
    {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades: {writing: true, weaponry: true, shields: true}}
];
new Civvies('add_game_option', 'upgrades', upgrades);

//--Buildings---------------------------------
var buildings = [
    {name: 'barracks', type: 'business', costs: {food: 20, wood: 60, stone: 120}, supports: {soldiers: 5, gold:2}, upgrades: {weaponry: true, masonry:true}},
    {name: 'stable', type: 'business', costs: {food: 60, wood: 60, stone: 120, leather: 10}, supports: {cavalry: 5}, upgrades: {horseback: true}},
    {name: 'fortification', type: 'upgrade', costs: {stone: 100}, options: {defense_improvement: 5}, supports: {gold: 10}, notes: "Improves Defenses", upgrades: {codeoflaws: true, palisade: true}}
];
new Civvies('add_game_option', 'buildings', buildings);

//--Variables---------------------------------
new Civvies('add_game_option', 'variables', {name: "soldiers", initial: 0.05});
new Civvies('add_game_option', 'variables', {name: "cavalry", initial: 0.08});


//--Add some jobs for warriors---------------
var jobs = [
    {name: 'soldiers', type: 'warfare', consumes: {food:.2}, supports: {battle: "soldiers"}, upgrades: {}, cull_order: 8, can_join_army:true},
    {name: 'cavalry', type: 'warfare', consumes: {food: .1, herbs: .2}, supports: {battle: "cavalry"}, upgrades: {horseback: true}, cull_order: 7, can_join_army:true},
    {name: 'siege', type: 'warfare', costs: {metal: 10, wood: 100}, supports: {battle: .1}, upgrades: {construction: true, mathematics: true}, doesnt_require_building: true, doesnt_consume_food: true, achievement: 'siege', can_join_army:true}
];
new Civvies('add_game_option', 'populations', jobs);

//Add a new set of variables to track armies
new Civvies('set_game_option', 'armies', [{name: 'home army'}]);
new Civvies('set_game_option', 'battles', []);
new Civvies('add_game_option', 'arrays_to_map_to_arrays', ['armies','battles']);


//Add a new function to process ongoing battles
new Civvies('add_game_option', 'functions_each_tick', run_battle_state);


//--Build a workflow that will show on a custom pane-------------
var workflow_conquest = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_conquest);