(function (Civvies) {

    var _c = new Civvies('get_private_functions');
    var army_id_to_assign_to = 0;

    var $pointers_conquest = {forces: [], lands: []};
//TODO: Save game after each battle round
//TODO: Allow multiple armies
//TODO: Too much treasure and buildings
//TODO: Take func_finish out and put string in so battles can be resumed mid-save
//TODO: Have a delay up front for army moving out

    _c.build_enemy_force_from_land_name = function (game, land_name, is_defensive) {
        var nick_name = _.str.titleize(land_name.title || land_name.name);
        var name;
        if (is_defensive) {
            name = nick_name +"'s defensive militia";
        } else {
            name = "Invaders from a nearby "+ nick_name;
        }

        var min = (land_name.population_min / 20) * .9;
        var max = min * 10;

        var i = _.indexOf(game.game_options.land_names, land_name);
        var next = game.game_options.land_names[i + 1];
        if (next && next.population_min) {
            max = next.population_min / 10;
        }
        max = max * 1.1;
        var resistance = min + (_c.random(game.game_options) * (max - min));

        return {land_name: land_name.name, name: name, army_size: Math.round(resistance), nick_name: nick_name, economy: resistance / 2, land_size: Math.round(Math.sqrt(land_name.population_min))};
    };
    _c.calculate_reward_after_battle = function (game, battle) {
        var economy = battle.defender.economy / 4;
        var chest = {resources: {food: Math.round(economy * 10)}, buildings: {}, populations: {}, upgrades: {}};

        var treasure_options = [];
        var last_resource = game.game_options.resources.length;
        var i;

        var resources = _.filter(game.game_options.resources, function (res) {
            return !res.dont_capture
        });
        var populations = _.filter(game.game_options.populations, function (res) {
            return !res.dont_capture
        });
        var buildings = _.filter(game.game_options.buildings, function (res) {
            return !res.dont_capture
        });

        for (i = 0; i < 8; i++) {
            _.each(resources, function (resource, i) {
                treasure_options.push({type: 'resources', name: resource, amount: economy * (last_resource - i)});
            });
        }
        for (i = 0; i < 2; i++) {
            _.each(populations, function (resource) {
                treasure_options.push({type: 'populations', name: resource, amount: economy / 5});
            });
        }
        _.each(buildings, function (resource) {
            treasure_options.push({type: 'buildings', name: resource, amount: economy / 10});
        });

        for (i = 0; i < economy; i++) {
            var rand_item = _c.randOption(treasure_options, game.game_options);
            if (rand_item) {
                chest[rand_item.type][rand_item.name.name] = chest[rand_item.type][rand_item.name.name] || 0;
                chest[rand_item.type][rand_item.name.name] += rand_item.amount;
            }
        }

        if (battle.defender.land_size) {
            chest.land = {name: 'Conquered area from ' + battle.defender.name, size: battle.defender.land_size};
        }
        chest.from = battle.defender.nick_name;

        if (chest.resources.gold) {
            chest.resources.gold = Math.min(3, Math.pow(economy, 1 / 5));
        }

        return chest;
    };
    _c.fight_using_battle_state = function (game, battle_state) {
        var state = _.clone(battle_state);
        state.time = game.data.tick_count;

        var attackers = _c.army_size(game, state.attacker);
        var defenders = _c.army_size(game, state.defender);

        var attackers_down = _c.randManyRolls(defenders, .35, game.game_options); //Higher chance to loose force, but might be less if forces don't exist in army
        var defenders_down = _c.randManyRolls(attackers, .25, game.game_options);

        defenders_down -= _c.randManyRolls(state.defender.fortification || 0, 0.5, game.game_options); //Each Fortification has 50% to protect a defender

        var army_units = _.filter(game.game_options.populations, function (f) {
            return f.can_join_army
        });
        for (var i = 0; i < attackers_down; i++) {
            var unit_dead = _c.randOption(army_units, game.game_options);
            battle_state.attacker[unit_dead.name] = Math.max(0, battle_state.attacker[unit_dead.name] - 1);
        }

        state.attacker_count = _c.army_size(game, state.attacker);
        state.defender_count = Math.max(defenders - defenders_down, 0);
        state.defender.army_size = state.defender_count;

        //Every round of battle increases disease a little
        game.data.variables.diseaseCurrent *= 1.01;

        //Check for a victory
        if ((state.attacker_count > 0) && (state.defender_count <= 0)) {
            state.victor = 'attacker';
        } else if ((state.defender_count > 0) && (state.attacker_count <= 0)) {
            state.victor = 'defender';
        } else if ((state.defender_count <= 0) && (state.attacker_count <= 0)) {
            state.victor = 'tie';
        }
        return state;
    };

//-- Local Functions -----------
    function run_battle(game, battle) {
        battle.history = battle.history || [];

        var battle_state = _.last(battle.history) || create_battle_state_from_battle(game, battle);
        battle_state = _c.fight_using_battle_state(game, battle_state);

        if (game.data.tick_count > (battle.started + battle.tie_after_ticks)) {
            //Battle timed out
            battle_state.victor = 'tie';
            battle_state.note = 'Time out as battle took too long.';
        }

        //Save the history of this phase of the battle
        battle.history.push(battle_state);


        //Update the army's forces with casualties
        _.each(game.game_options.populations, function (job) {
            if (job.can_join_army) {
                battle.attacker[job] = battle_state.attacker[job] || 0;
                battle.defender[job] = battle_state.defender[job] || 0;
                if (battle.player_state == 'defender') {
                    game.data.populations[job] = battle.defender[job] || 0;
                }
            }
        });


        //If the battle is over
        if (battle_state.victor) {
            var attacker_people_lost = battle.attacker_size_initial - _c.army_size(game, battle.attacker);
            var defender_people_lost = battle.defender_size_initial - _c.army_size(game, battle.defender);

            if (battle.player_state == 'attacker' && battle_state.victor == 'attacker') {
                battle.reward = _c.calculate_reward_after_battle(game, battle);

                if (battle.attacker_size_initial > 500 && attacker_people_lost < (battle.attacker_size_initial * .2)) {
                    game.data.achievements.conquest = true;
                }
            }

            //End battle metadata
            game.data.achievements.battle = true;
            battle.in_progress = false;
            battle.victor = battle_state.victor;
            battle.ended = game.data.tick_count;

            //Build a log message and add achievements
            var msg = "Battle finished.  ";
            var you_won = (battle.player_state == battle_state.victor);
            if (you_won) {
                game.data.achievements.victor = true;
                msg += 'You won.  ';

                if (battle.attacker_size_initial > 500 && battle.defender_size_initial > 500) {
                    game.data.achievements.war = true;
                }
            } else {
                msg += 'You did not win.  ';
            }

            //Increase disease
            game.data.variables.diseaseCurrent *= 1.3;
            if (battle_state.victor == 'tie') {
                game.data.variables.diseaseCurrent *= 1.3;
            } else if (battle_state.victor == 'defender') {
                game.data.variables.diseaseCurrent *= 1.6;
            }

            //Move dead to be corpses
            if (battle.player_state == 'attacker' && attacker_people_lost) {
                game.data.resources.corpses += attacker_people_lost;
                msg += attacker_people_lost + " corpses."
            } else if (battle.player_state == 'defender' && defender_people_lost) {
                game.data.resources.corpses += defender_people_lost;
                msg += defender_people_lost + " corpses."
            }
            game.logMessage(msg);

            if (battle.func_finish) {
                battle.func_finish(game, battle)
            }
        }
    }

    function assign_to_army(game, job, amount, army_id) {
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
    }

    function attack_with_army(game, army_id, land_name, options, func_finish) {
        var enemy = _c.build_enemy_force_from_land_name(game, land_name, true);

        var battle = {player_state: 'attacker', in_progress: true, started: game.data.tick_count, defender: enemy, attacker: game.data.armies[army_id], options: {}, func_finish: func_finish, tie_after_ticks: 20};

        battle.attacker.id = army_id;

        battle.attacker_size_initial = _c.army_size(game, battle.attacker);
        battle.defender_size_initial = _c.army_size(game, battle.defender);
        if (battle.attacker_size_initial > 100) {
            game.data.achievements.army = true;
        }

        game.data.battles.push(battle);
    }

    function create_battle_state_from_battle(game, battle) {
        return {time: game.data.tick_count, defender: _.clone(battle.defender), attacker: _.clone(battle.attacker)}
    }

    function run_battles_each_tick(game) {
        var battles = _.filter(game.data.battles, function (battle) {
            return battle.in_progress
        }) || [];

        _.each(battles, function (battle) {
            run_battle(game, battle);
        });
    }

    _c.army_size = function(game, army) {
        if (army.army_size) return army.army_size;
        var count = 0;
        var army_units = _.filter(game.game_options.populations, function (f) {
            return f.can_join_army
        });
        _.each(army_units, function (unit) {
            var num = army[unit.name];
            if (num && _.isNumber(num)) {
                count += num;
            }
        });
        return count;
    };

    function battle_result_details(game, battle_result) {
        //TODO: Increase battle details
        var texts = [];
        _.each(battle_result.history, function (state) {
            var text = "Time [" + state.time + "]: Attackers: " + state.attacker_count + ", Defenders: " + state.defender_count + ". " + (state.note || '');

            texts.push(text);
        });

        return "<span style='font-size: .8em'>" + texts.join("<br/>") + "</span>";
    }

    function open_battle_chest(game, rewards, $holder) {

        var msg = "";
        _.each(['resources', 'buildings', 'populations'], function (key_c) {
            var category = rewards[key_c];

            var cat_text = "";
            if (key_c == 'resources') {
                cat_text = "<b>Resources Looted:</b>";
            } else if (key_c == 'buildings') {
                cat_text = "<b>Buildings Conquered:</b>";
            } else {
                cat_text = "<b>People Converted:</b>";
            }

            var loot = [];
            for (var key_i in category) {
                var count = category[key_i];
                count = Math.round(count);
                if (count > 0) {
                    var text = Helpers.abbreviateNumber(count, true) + ' ' + Helpers.pluralize(key_i);
                    loot.push(text);

                    game.data[key_c][key_i] = game.data[key_c][key_i] || 0;
                    game.data[key_c][key_i] += count;
                }
            }
            if (loot.length) {
                msg += cat_text + "<br/>" + loot.join(",<br/>") + ".<br/>";
            }
        });

        if (rewards.land) {
            msg += "<br/>Gained " + rewards.land.size + " land!";
            game.data.land.push(rewards.land);


            var pop = _c.population(game);
            if (game.data.land.count > 200 && pop.land_max > 2000) {
                game.data.achievement.domination = true;
            }
        }

        if (msg) {
            game.data.achievements.raider = true;
        } else {
            msg = "No treasure found";
        }

        if (game.data.populations.cats) {
            game.data.achievements.cat = true;
        }

        $holder
            .html(msg);

        setTimeout(function () {
            $holder
                .text("[]")
                .css({display: 'inline-block'})
                .popover({title: "Battle Chest from " + (rewards.from || 'conquering'), content: msg, trigger: 'hover', placement: 'left', html: true})

        }, 8000);

    }

    function build_ui_controls(game) {
        //Return a $ object that will be added to a div on the corresponding pane
        game.data.armies = game.data.armies || [];

        var $holder = $('<div>');
        $('<hr>').appendTo($holder);

        _.each(game.data.armies, function (army, army_id) {

            $pointers_conquest.armies = $pointers_conquest.armies || [];
            $pointers_conquest.armies[army_id] = $pointers_conquest.armies[army_id] || {};
            $pointers_conquest.armies[army_id].army_holder = $('<div>')
                .css({fontWeight: 'bold'})
                .popover({title: "Build up an invading armed force", content: "Transfer troops between your city and your army.", trigger: 'hover', placement: 'bottom'})
                .appendTo($holder);

            $pointers_conquest.armies[army_id].army_name = $('<span>')
                .text(army.name || 'Your Army')
                .appendTo($pointers_conquest.armies[army_id].army_holder);

            $pointers_conquest.armies[army_id].army_note = $('<span>')
                .text('')
                .css({fontWeight: 'normal'})
                .appendTo($pointers_conquest.armies[army_id].army_holder);

            _.each(game.game_options.populations, function (job) {
                if (job.can_join_army) {

                    army[job.name] = army[job.name] || 0;
                    $pointers_conquest.forces[job.name] = $pointers_conquest.forces[job.name] || {};

                    var amount = army[job.name];//game.data.populations[job.name];
                    var $unit = $('<div>')
                        .appendTo($holder);

                    $pointers_conquest.forces[job.name].remove100 = $('<button>')
                        .text('-100')
                        .popover({title: "Remove 100 from army", content: "Remove 100 " + job.name, trigger: 'hover', placement: 'bottom'})
                        .prop({disabled: true})
                        .addClass('multiplier')
                        .on('click', function () {
                            assign_to_army(game, job, -100, army_id_to_assign_to);
                            _c.redraw_data(game);
                        })
                        .appendTo($unit);
                    $pointers_conquest.forces[job.name].remove10 = $('<button>')
                        .text('-10')
                        .popover({title: "Remove 10 from army", content: "Remove 10 " + job.name, trigger: 'hover', placement: 'bottom'})
                        .prop({disabled: true})
                        .addClass('multiplier')
                        .on('click', function () {
                            assign_to_army(game, job, -10, army_id_to_assign_to);
                            _c.redraw_data(game);
                        })
                        .appendTo($unit);
                    $pointers_conquest.forces[job.name].remove1 = $('<button>')
                        .text('-1')
                        .popover({title: "Remove 1 from army", content: "Remove 1 " + job.name, trigger: 'hover', placement: 'bottom'})
                        .prop({disabled: true})
                        .addClass('multiplier')
                        .on('click', function () {
                            assign_to_army(game, job, -1, army_id_to_assign_to);
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
                            assign_to_army(game, job, 1, army_id_to_assign_to);
                            _c.redraw_data(game);
                        })
                        .appendTo($unit);
                    $pointers_conquest.forces[job.name].add10 = $('<button>')
                        .text('+10')
                        .popover({title: "Add 10 to army", content: "Add 10 " + job.name, trigger: 'hover', placement: 'bottom'})
                        .prop({disabled: true})
                        .addClass('multiplier')
                        .on('click', function () {
                            assign_to_army(game, job, 10, army_id_to_assign_to);
                            _c.redraw_data(game);
                        })
                        .appendTo($unit);
                    $pointers_conquest.forces[job.name].add100 = $('<button>')
                        .text('+100')
                        .popover({title: "Add 100 to army", content: "Add 100 " + job.name, trigger: 'hover', placement: 'bottom'})
                        .prop({disabled: true})
                        .addClass('multiplier')
                        .on('click', function () {
                            assign_to_army(game, job, 100, army_id_to_assign_to);
                            _c.redraw_data(game);
                        })
                        .appendTo($unit);
                }
            });
        });

        $('<hr>').appendTo($holder);
        var $battle_holder = $('<div>').appendTo($holder);

        var $land_holder = $('<div>')
            .css({display: 'inline-block'})
            .appendTo($battle_holder);

        $pointers_conquest.battle_result_holder = $('<div>')
            .css({display: 'inline-block', verticalAlign: 'top', margin: '0px 20px', height: '300px', overflowY: 'hidden', overflowX: 'scroll'})
            .appendTo($battle_holder);

        _.each(game.game_options.land_names, function (land_name, i) {
            $pointers_conquest.lands[land_name.name] = $pointers_conquest.lands[land_name.name] || {};

            var func_finish = function (game, battle_result) {
                var $battle_result = $('<div>')
                    .css({padding: '10px', margin: '0px 5px 5px 5px', borderRadius: '8px'})
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
                var result_message = "";
                if (battle_result.victor == 'tie') {
                    result_message = "Tie with " + battle_result.defender.nick_name;
                } else if (battle_result.victor == 'attacker') {
                    result_message = "Win vs. a " + battle_result.defender.nick_name;
                } else {
                    result_message = "Loss vs. a " + battle_result.defender.nick_name;
                }
                var result_details = battle_result_details(game, battle_result);
                $('<span>')
                    .text(result_message)
                    .popover({title: 'Battle Results', content: result_details, trigger: 'hover', placement: 'top', html: true})
                    .css({padding: '8px', margin: '0px 5px', color: 'white'})
                    .appendTo($battle_result);

                if (battle_result.reward) {
                    var $chest = $('<div>')
                        .text('Open Victory Chest!')
                        .css({padding: '4px', backgroundColor: 'brown', borderRadius: '8px', color: 'gold', cursor: 'pointer', html: true})
                        .on('click', function () {
                            open_battle_chest(game, battle_result.reward, $chest);
                        })
                        .appendTo($battle_result);
                }
            };

            var $land = $('<div>')
                .appendTo($land_holder);
            $pointers_conquest.lands[land_name.name].button = $('<button>')
                .text('Invade!')
                .css({width: '100px'})
                .prop({disabled: true})
                .on('click', function () {
                    attack_with_army(game, army_id_to_assign_to, land_name, {}, func_finish);
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

                _.each([-100, -10, -1, 1, 10, 100], function (amount) {
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


        var can_invade = true;
        _.each(game.data.armies, function (army, army_id) {
            $pointers_conquest.armies[army_id].army_name.text(army.name || "Your Army");

            var note_text = '';
            var active_battle = _.find(game.data.battles, function (battle) {
                return battle.in_progress && battle.attacker.id == army_id;
            });

            var army_count = _c.army_size(game, army);
            if (active_battle && active_battle.attacker) {
                var last_round = _.last(active_battle.history);
                if (last_round && last_round.time) {
                    var current_count = _c.army_size(game, active_battle.attacker);
                    army_count = active_battle.attacker_size_initial;
                    var round = last_round.time - active_battle.started;
                    note_text = " (Attacking, casualties: " + current_count + " of " + army_count + ", round: " + round + ")";
                }
                can_invade = false;
            } else {
                note_text = " (size: " + army_count + ")";
            }

            $pointers_conquest.armies[army_id].army_note.text(note_text);
        });

        var army = game.data.armies[army_id_to_assign_to];
        var army_count = _c.army_size(game, army);
        _.each(game.game_options.land_names, function (land_name) {
            $pointers_conquest.lands[land_name.name].button.prop('disabled', (army_count < 1) || !can_invade);
        });
    }

//--Build some specialized upgrades-------------
    var upgrades = [
        {name: "fighting", type: 'weaponry', costs: {wood: 200, food: 200, stone: 100, metal: 5, herbs: 5}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01}},
        {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01, siege_accuracy: 0.01}, upgrades: {fighting: true}},
        {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldiers_accuracy: 0.01, cavalry_accuracy: 0.01}, upgrades: {fighting: true}},
        {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}, upgrades: {fighting: true}},
        {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades: {masonry: true, domestication: true}, variable_increase: {soldiers_accuracy: 0.01, siege_accuracy: 0.02}},
        {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades: {writing: true, weaponry: true, shields: true}, variable_increase: {soldiers_accuracy: 0.02, cavalry_accuracy: 0.02, siege_accuracy: 0.02}}
    ];
    new Civvies('add_game_option', 'upgrades', upgrades);

//--Buildings---------------------------------
    var buildings = [
        {name: 'barracks', type: 'business', costs: {food: 20, wood: 60, stone: 120}, supports: {soldiers: 5, gold: 1}, upgrades: {fighting: true, masonry: true}},
        {name: 'stable', type: 'business', costs: {food: 60, wood: 60, stone: 120, leather: 10}, supports: {cavalry: 5}, upgrades: {fighting: true, horseback: true}},
        {name: 'fortification', type: 'upgrade', costs: {stone: 100, metal:10}, supports: {gold: 2}, defense:{troops:"fortification_strength"}, notes: "Improves Defenses", upgrades: {palisade: true}}
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
        {name: 'Your army'}
    ]);
    new Civvies('set_game_option', 'battles', []);
    new Civvies('add_game_option', 'arrays_to_map_to_arrays', ['armies', 'battles']);


//Add a new function to process ongoing battles
    new Civvies('add_game_option', 'functions_each_tick', run_battles_each_tick);


    new Civvies('add_game_option', 'achievements', {name: "battle", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "victor", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "raider", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "army", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "conquest", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "war", category: "conquest"});
    new Civvies('add_game_option', 'achievements', {name: "domination", category: "conquest"});


//--Build a workflow that will show on a custom pane-------------
    var workflow_conquest = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
    new Civvies('add_game_option', 'workflows', workflow_conquest);


})(Civvies);