var _c = new Civvies('get_private_functions');
var army_id_to_assign_to = 0;

var $pointers_conquest = {forces: [], lands: []};
//TODO: Save game after each battle round
//TODO: Show more battle status
//TODO: Move much of this to main so that it's extensible
//TODO: Allow multiple armies


_c.assign_to_army = function (game, job, amount, army_id) {
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
_c.attack_with_army = function (game, army_id, land_name, options, func_finish) {
    var enemy = enemy_from_land_name(game, land_name, true);

    var battle = {player_state: 'attacker', in_progress: true, started: game.data.tick_count, defender: enemy, attacker: game.data.armies[army_id], options: {}, func_finish: func_finish, tie_after_ticks: 20};

    battle.attacker_size_initial = army_size(game, battle.attacker);
    battle.defender_size_initial = army_size(game, battle.defender);
    if (battle.attacker_size_initial > 100) {
        game.data.achievements.army = true;
    }

    game.data.battles.push(battle);
};

function enemy_from_land_name(game, land_name, is_defensive) {
    var name = _.str.titleize(land_name.title || land_name.name);
    name += (is_defensive) ? ' defensive forces' : ' invading army';

    var min = (land_name.population_min / 20) * .9;
    var max = min * 10;

    var i = _.indexOf(game.game_options.land_names, land_name);
    var next = game.game_options.land_names[i + 1];
    if (next && next.population_min) {
        max = next.population_min / 10;
    }
    max = max * 1.1;
    var resistance = min + (_c.random(game.game_options) * (max - min));
    var cavalry_pct = .05 + (_c.random(game.game_options) * (.5 - .05));
    var siege_pct = .01 + (_c.random(game.game_options) * (.2 - .01));

    var soldiers = resistance * (1 - cavalry_pct);
    var cavalry = resistance * cavalry_pct;
    var siege = resistance * siege_pct;

    return {name: name, soldiers: Math.round(soldiers), cavalry: Math.round(cavalry), siege: Math.round(siege)};
}
function calculate_reward(game, battle) {
    //TODO: Make this random
    return {resources: {food: 100, wood: 100, gold: 1}, buildings: {barn: 1, woodstock: 1, stonestock: 1}, populations: {farmers: 50, miners: 50}}
}

function run_battle(game, battle) {
    battle.history = battle.history || [];

    var battle_state = _.last(battle.history) || create_battle_state_from_battle(game, battle);
    battle_state = fight_using_battle_state(game, battle_state);

    if (game.data.tick_count > battle.started + battle.tie_after_ticks) {
        //Battle timed out
        battle_state.victor = 'tie';
        battle_state.note = 'Time out as battle took too long.';
    }

    //Save the history of this phase of the battle
    battle.history.push(battle_state);

    if (battle.player_state == 'attacker') {
        //If the battle was won, build a war chest

        if (battle_state.victor == 'attacker') {
            battle.reward = calculate_reward(game, battle);
            game.data.achievements.victor = true;

            if (battle.attacker_size_initial > 500 && battle.defender_size_initial > 500) {
                game.data.achievements.war = true;
            }

            var loses = battle.attacker_size_initial - army_size(game, battle_state.attacker);
            if (battle.attacker_size_initial > 500 && loses < (battle.attacker_size_initial * .2)) {
                game.data.achievements.conquest = true;
            }

        }

        //Update the army's forces with casualties
        battle.attacker.soldiers = battle_state.attacker.soldiers;
        battle.attacker.cavalry = battle_state.attacker.cavalry;
        battle.attacker.siege = battle_state.attacker.siege;
    }

    if (battle_state.victor) {
        game.data.achievements.battle = true;
        battle.in_progress = false;
        battle.victor = battle_state.victor;
        battle.ended = game.data.tick_count;
        if (battle.func_finish) {
            battle.func_finish(game, battle)
        }
        game.logMessage('Battle finished');
    }
}

function create_battle_state_from_battle(game, battle) {
    return {time: game.data.tick_count, defender: _.clone(battle.defender), attacker: _.clone(battle.attacker)}
}
function fight_using_battle_state(game, battle_state) {
    var state = _.clone(battle_state);

    //Calculate the amount of each force that hit an enemy
    //TODO: Modify by defender's technology and warfare levels, currently using player's variables
    var forces = {};

    //Build a matrix of forces and their attack efficacy
    _.each(['defender', 'attacker'], function (force) {
        forces[force] = {};
        _.each(['cavalry', 'soldiers', 'siege'], function (unit) {
            forces[force][unit] = {
                count: (battle_state[force][unit] || 0),
                accuracy: _c.random(game.game_options) * 2 * (_c.variable(game, unit + '_accuracy') || .03),
                attack: function () {
                    return this.count * this.accuracy;
                },
                is_hit: function (casualties) {
                    var remainder = 0;
                    if (this.count - casualties < 0) {
                        remainder = casualties - this.count;
                        this.count = 0;
                    } else {
                        this.count -= casualties;
                    }
                    return remainder;
                }
            };
        })
    });
    forces.defender.fortification = {
        count: (battle_state.defender.fortification || 0),
        strength: _c.random(game.game_options) * 2 * (_c.variable(game, 'fortification_strength') || 1),
        block: function (attackers_total) {
            //The amount of force that gets through the fortification
            return attackers_total - (this.count * this.strength);
        },
        is_hit: function (casualties) {
            if (this.count - casualties < 0) {
                this.count = 0;
            } else {
                this.count -= casualties;
            }
        }
    };


    //First, Defender Siege weapons hit attacking cavalry and soldiers
    forces.attacker.cavalry.is_hit(forces.defender.siege.attack() * .8);
    forces.attacker.soldiers.is_hit(forces.defender.siege.attack() * .2);

    //Next, Defender soldiers and Cavalry are hit, though protected by fortifications
    var attackers_total = forces.attacker.cavalry.attack() + forces.attacker.soldiers.attack() + forces.attacker.siege.attack();
    var remainder = forces.defender.fortification.block(attackers_total);
    if (remainder > 0) {
        remainder = forces.defender.cavalry.is_hit(remainder);
    }
    if (remainder > 0) {
        remainder = forces.defender.soldiers.is_hit(remainder);
    }
    forces.defender.siege.is_hit(remainder);

    //Next, Defender fortifications are hit by 10% of siege weapons
    forces.defender.fortification.is_hit(forces.attacker.siege.attack() * .1);

    //Last, remaining Defenders ground troops attack
    remainder = forces.defender.cavalry.attack() + forces.defender.soldiers.attack() + forces.defender.siege.attack();
    if (remainder > 0) {
        remainder = forces.attacker.cavalry.is_hit(remainder);
    }
    if (remainder > 0) {
        remainder = forces.attacker.soldiers.is_hit(remainder);
    }
    forces.attacker.siege.is_hit(remainder);


    //Update battle_state numbers, remove any casualties or wounded
    _.each(['defender', 'attacker'], function (force) {
        _.each(['cavalry', 'soldiers', 'siege'], function (unit) {
            state[force][unit] = Math.floor(forces[force][unit].count);
        });
    });
    state.defender.fortification = Math.ceil(forces.defender.fortification.count);

    //Check for a victory
    state.victor = check_for_victor(game, state);
    return state;
}

function check_for_victor(game, battle_state) {
    //If troops = 0, set victor
    //if time > delay, set tie
    var attacker_count = army_size(game, battle_state.attacker);
    var defender_count = army_size(game, battle_state.defender);
    var victory_state = false;

    if ((attacker_count > 0) && (defender_count <= 0)) {
        victory_state = 'attacker';
    } else if ((defender_count > 0) && (attacker_count <= 0)) {
        victory_state = 'defender';
    } else if ((defender_count <= 0) && (attacker_count <= 0)) {
        victory_state = 'tie';
    }
    return victory_state;
}

function run_battles_each_tick(game) {
    var battles = _.filter(game.data.battles, function (battle) {
        return battle.in_progress
    }) || [];

    _.each(battles, function (battle) {
        run_battle(game, battle);
    });
}
function army_size(game, army) {
    var count = 0;
    for (var key in army) {
        if (key != 'name' && _.isNumber(army[key])) {
            count += army[key];
        }
    }
    return count;
}
function battle_result_details (game, battle_result){
 //TODO: Increase text
    return "Awesome battle!"
}
function open_battle_chest (game, rewards) {
//TODO: Add spoils
    console.log(rewards);
}
function build_ui_controls(game) {
    //Return a $ object that will be added to a div on the corresponding pane
    game.data.armies = game.data.armies || [];

    var $holder = $('<div>');
    $('<hr>').appendTo($holder);

    $('<div>')
        .text('Your Army')
        .css({fontWeight: 'bold'})
        .popover({title: "Build up an invading armed force", content: "Transfer soldiers and cavalry between your city and your army.", trigger: 'hover', placement: 'bottom'})
        .appendTo($holder);

    _.each(game.game_options.populations, function (job) {
        if (job.can_join_army) {
            var army = game.data.armies[army_id_to_assign_to] || {};

            army[job.name] = army[job.name] || 0;
            $pointers_conquest.forces[job.name] = $pointers_conquest.forces[job.name] || {};

            var amount = army[job.name];//game.data.populations[job.name];
            var $unit = $('<div>')
                .appendTo($holder);

            $pointers_conquest.forces[job.name].remove10 = $('<button>')
                .text('-10')
                .popover({title: "Remove 10 from army", content: "Remove 10 " + job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, -10, army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
            $pointers_conquest.forces[job.name].remove1 = $('<button>')
                .text('-1')
                .popover({title: "Remove 1 from army", content: "Remove 1 " + job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, -1, army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);

            var $div = $('<div>')
                .css({width: '120px', display: 'inline-block', textAlign: 'center'})
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
                .popover({title: "Add 1 to army", content: "Add 1 " + job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, 1, army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
            $pointers_conquest.forces[job.name].add10 = $('<button>')
                .text('+10')
                .popover({title: "Add 10 to army", content: "Add 10 " + job.name, trigger: 'hover', placement: 'bottom'})
                .prop({disabled: true})
                .addClass('multiplier')
                .on('click', function () {
                    _c.assign_to_army(game, job, 10, army_id_to_assign_to);
                    _c.redraw_data(game);
                })
                .appendTo($unit);
        }
    });

    $('<hr>').appendTo($holder);
    var $battle_holder = $('<div>').appendTo($holder);

    var $land_holder = $('<div>')
        .css({display: 'inline-block'})
        .appendTo($battle_holder);

    $pointers_conquest.battle_result_holder = $('<div>')
        .css({display: 'inline-block', verticalAlign: 'top', margin: '0px 20px'})
        .appendTo($battle_holder);

    _.each(game.game_options.land_names, function (land_name, i) {
        $pointers_conquest.lands[land_name.name] = $pointers_conquest.lands[land_name.name] || {};

        var func_finish = function (game, battle_result) {
            var $battle_result = $('<div>')
                .prependTo($pointers_conquest.battle_result_holder);

            if (battle_result.victor == 'attacker') {
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor: 'green'});
                $battle_result
                    .css({backgroundColor: 'green'});

            } else if (battle_result.victor == 'defender') {
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor: 'red'});
                $battle_result
                    .css({backgroundColor: 'red'});
            } else {
                $pointers_conquest.lands[land_name.name].button
                    .css({backgroundColor: 'orange'});
                $battle_result
                    .css({backgroundColor: 'orange'});
            }
            var result_message = battle_result.victor == 'tie' ? 'Tie, no winner' : _.str.titleize(battle_result.victor) + ' wins!';
            var result_details = battle_result_details (game, battle_result);
            $('<span>')
                .text(result_message)
                .popover({title:'Battle Results', content:result_details, trigger:'hover'})
                .css({padding: '10px'})
                .appendTo($battle_result);

            if (battle_result.reward) {
                var $chest = $('<div>')
                    .text('Open Victory Chest!')
                    .css({padding: '4px', backgroundColor:'brown', borderRadius:'4px', color:'gold', cursor:'pointer'})
                    .on('click', function(){
                        $chest.hide();
                        open_battle_chest(game, battle_result.reward);
                    })
                    .appendTo($battle_result);
            }
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
        var min = land_name.population_min / 20;
        var max = min * 10;
        var next = game.game_options.land_names[i + 1];
        if (next && next.population_min) {
            max = next.population_min / 10;
        }
        var description = "A " + name + " has at least " + Helpers.abbreviateNumber(land_name.population_min) +
            " citizens. They likely have between " + Helpers.abbreviateNumber(min) + " and " +
            Helpers.abbreviateNumber(max) + " protectors";
        $('<span>')
            .html(name)
            .css({fontWeight: 'bold'})
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

    _.each(game.game_options.populations, function (job) {
        if (job.can_join_army) {
            var army = game.data.armies[army_id_to_assign_to] || {};
            $pointers_conquest.forces[job.name].number.text(army[job.name]);

            var current_at_city = game.data.populations[job.name] || 0;
            var current_in_army = army[job.name] || 0;

            _.each([-10, -1, 1, 10], function (amount) {
                if (amount > 0) {
                    $pointers_conquest.forces[job.name]['add' + Math.abs(amount)]
                        .prop({disabled: (current_at_city < amount)})
                        .popover('hide');
                } else {
                    $pointers_conquest.forces[job.name]['remove' + Math.abs(amount)]
                        .prop({disabled: (current_in_army + amount < 0)})
                        .popover('hide');
                }
            });
        }
    });

    var army = game.data.armies[army_id_to_assign_to];
    var army_count = army_size(game, army);
    _.each(game.game_options.land_names, function (land_name) {
        $pointers_conquest.lands[land_name.name].button.prop('disabled', (army_count < 1));
    });
}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "fighting", type: 'weaponry', costs: {wood: 200, food: 200, stone:100, metal:5, herbs:5}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01}},
    {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01, siege_accuracy:0.01}, upgrades: {fighting: true}},
    {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01}, upgrades: {fighting: true}},
    {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}, upgrades: {fighting: true}},
    {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades: {masonry: true, domestication: true}, variable_increase: {soldiers_accuracy: 0.01, siege_accuracy:0.02}},
    {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades: {writing: true, weaponry: true, shields: true}, variable_increase: {soldiers_accuracy: 0.02, cavalry_accuracy: 0.02, siege_accuracy:0.02}}
];
new Civvies('add_game_option', 'upgrades', upgrades);

//--Buildings---------------------------------
var buildings = [
    {name: 'barracks', type: 'business', costs: {food: 20, wood: 60, stone: 120}, supports: {soldiers: 5, gold: 1}, upgrades: {fighting: true, masonry: true}},
    {name: 'stable', type: 'business', costs: {food: 60, wood: 60, stone: 120, leather: 10}, supports: {cavalry: 5}, upgrades: {fighting: true, horseback: true}},
    {name: 'fortification', type: 'upgrade', costs: {stone: 100}, supports: {gold: 2}, notes: "Improves Defenses", upgrades: {codeoflaws: true, palisade: true}}
];
new Civvies('add_game_option', 'buildings', buildings);

//--Variables---------------------------------
new Civvies('add_game_option', 'variables', {name: "soldiers_accuracy", initial: 0.05});
new Civvies('add_game_option', 'variables', {name: "cavalry_accuracy", initial: 0.08});
new Civvies('add_game_option', 'variables', {name: "siege_accuracy", initial: 0.02});
new Civvies('add_game_option', 'variables', {name: "fortification_strength", initial: 1});


//--Add some jobs for warriors---------------
var jobs = [
    {name: 'soldiers', type: 'warfare', consumes: {food: .2}, upgrades: {}, cull_order: 8, can_join_army: true},
    {name: 'cavalry', type: 'warfare', consumes: {food: .1, herbs: .2}, upgrades: {horseback: true}, cull_order: 7, can_join_army: true},
    {name: 'siege', type: 'warfare', costs: {metal: 10, wood: 100}, upgrades: {construction: true, mathematics: true}, doesnt_require_building: true, doesnt_consume_food: true, achievement: 'siege', can_join_army: true}
];
new Civvies('add_game_option', 'populations', jobs);

//Add a new set of variables to track armies
new Civvies('set_game_option', 'armies', [
    {name: 'home army'}
]);
new Civvies('set_game_option', 'battles', []);
new Civvies('add_game_option', 'arrays_to_map_to_arrays', ['armies', 'battles']);


//Add a new function to process ongoing battles
new Civvies('add_game_option', 'functions_each_tick', run_battles_each_tick);


new Civvies('add_game_option', 'achievements', {name: "battle"});
new Civvies('add_game_option', 'achievements', {name: "victor"});
new Civvies('add_game_option', 'achievements', {name: "army"});
new Civvies('add_game_option', 'achievements', {name: "conquest"});
new Civvies('add_game_option', 'achievements', {name: "war"});



//--Build a workflow that will show on a custom pane-------------
var workflow_conquest = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_conquest);