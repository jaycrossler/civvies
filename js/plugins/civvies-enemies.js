(function (Civvies) {

    var _c = new Civvies('get_private_functions');
    var $pointers_enemies = {invasions: {}};

    function check_for_enemy_attacking(game) {
        if (_c.random(game.game_options) < _c.variable(game, 'enemiesAttacking')) {
            enemy_attacks_town(game);
        }

        //Show attacks and get rid of old ones happens in battle queue
        redraw_active_attacker_battle_details(game);

        if (!$pointers_enemies.enemies_holder) {
            $pointers_enemies.enemies_holder = $('#jobsContainer').find('h3').first();
        }
    }

    function enemy_attacks_town(game) {
        var pop = _c.population(game);
        var current_population = (pop.current + (pop.buildings)) / 2;  //Base target strength on a mix of people and buildings, TODO: adjust by overall game difficulty?

        //Build the player's defense force
        var defender_player = {};
        _.each(game.game_options.populations, function (f) {
            if (f.can_join_army) {
                defender_player[f.name] = game.data.populations[f.name] || 0;
            }
        });

        var fortifications = 0;
        var fortification_buildings = _.filter(game.game_options.buildings, function (f) {
            return f.defense && f.defense.troops;
        });
        _.each(fortification_buildings, function (fort) {
            fortifications += game.data.buildings[fort.name] * (_c.variable(game, 'fortification_strength') || 1);
        });
        defender_player.fortification = fortifications || 0;


        var attacker;
        var attack_from_town = _c.randOption([false, true, true], game.game_options); // 66% of the invasions are from other towns
        if (attack_from_town) {
            //Pick one of the three closest lands (in terms of population)
            var towns = _.clone(game.game_options.land_names);
            towns.sort(function (a, b) {
                return Math.abs(current_population - a.population_min) - Math.abs(current_population - b.population_min);
            });
            var attacker_land = _c.randOption(_.first(towns, 3), game.game_options);
            attacker = _c.build_enemy_force_from_land_name(game, attacker_land, false);

        } else {
            //Attack comes from a roving force
            attacker = build_enemy_force_from_enemy_list(game, current_population, false);
        }

        var battle = {player_state: 'defender', in_progress: true, started: game.data.tick_count, defender: defender_player, attacker: attacker, options: {}, func_finish: battle_ended, tie_after_ticks: 20};
        battle.attacker_size_initial = _c.army_size(game, battle.attacker);
        battle.defender_size_initial = _c.army_size(game, battle.defender);

        game.data.battles.push(battle);
        draw_enemy_army_div(game, battle);
        game.logMessage("Incoming attack from invaders (size " + battle.attacker_size_initial + " vs your force of " + battle.defender_size_initial + ")");
    }

    function draw_enemy_army_div(game, battle) {
        var name = _.str.titleize(battle.attacker.name);

        var msg = name + ' attacking, troops: ' + (battle.attacker.army_size || _c.army_size(game, battle.attacker));
        var $attacker = $('<div>')
            .addClass('invader')
            .text(msg)
            .appendTo($pointers_enemies.enemies_holder);

        $pointers_enemies.invasions[battle.started] = $attacker;
        return $attacker;
    }

    function redraw_active_attacker_battle_details(game) {
        //Draw attacker divs
        var active_invasions = _.filter(game.data.battles, function (b) {
            return b.in_progress && b.player_state == 'defender';
        });

        _.each(active_invasions, function (battle) {
            var $attacker = $pointers_enemies.invasions[battle.started];
            if ($attacker) {
                //Update div status
                var msg = battle.attacker.name + ' attacking! [Units: ' + (battle.attacker.army_size || _c.army_size(game, battle.attacker)) + ' of ' + battle.attacker_size_initial + ']';
                $attacker
                    .text(msg);
            } else {
                //Build the div and show it
                draw_enemy_army_div(game, battle);
            }
        });
    }

    function battle_ended(game, battle) {
        //TODO: Determine how much loot lost/won after invasion

        var $attacker = $pointers_enemies.invasions[battle.started];
        if ($attacker) {
            var msg = '';
            var name = _.str.titleize(battle.attacker.name);
            var color;
            if (battle.victor == 'attacker') {
                msg += name + ' won, and looted. ';
                color = 'red';
            } else if (battle.victor == 'defender') {
                msg += 'You repelled ' + name + '. ';
                color = 'lightgreen';
            } else {
                msg += 'It was a tie. ';
                color = 'yellow';
            }
            var they_lost = battle.attacker_size_initial - (battle.attacker.army_size || _c.army_size(game, battle.attacker));
            var you_lost = battle.defender_size_initial - (battle.defender.army_size || _c.army_size(game, battle.defender));
            msg += 'You lost: ' + you_lost + ', they lost: ' + they_lost;


            $attacker
                .css({backgroundColor: color})
                .text(msg);

            setTimeout(function () {
                $attacker
                    .hide('slow');
            }, 20000);
        } else {
            console.error('Div not drawn')
        }
    }

    function build_enemy_force_from_enemy_list(game, current_population, is_defending) {

        //TODO: Should there be a locally kept enemies list of enemies that the player has accumulated?
        var possible_enemies = _.filter(game.game_options.enemies, function (enemy) {
            return (!enemy.magic && enemy.size_min >= 10 && enemy.size_max <= 1000);
        });
        var enemy = _c.randOption(possible_enemies, game.game_options) || {name: 'barbarians', mounted: .3, size: current_population / 15};


        var nick_name = _.str.titleize(enemy.title || enemy.name);
        var name = 'Raiding ' + nick_name;

        var resistance = enemy.size || _c.randRange(enemy.size_min || 20, enemy.size_max || 200, false);
        var cavalry_pct = enemy.mounted || (.05 + (_c.random(game.game_options) * (.5 - .05)));
        var siege_pct = enemy.siege_weapons ? .02 + (_c.random(game.game_options) * (.2 - .01)) : 0;

        var soldiers = resistance * (1 - cavalry_pct);
        var cavalry = resistance * cavalry_pct;
        var siege = resistance * siege_pct;

        var fortification = (resistance * .01 * _c.random(game.game_options));

        var economy = ((fortification * 10) + (siege_pct * 6) + (cavalry * 3) + soldiers) / 2;

        var origin_land = _c.randOption(game.game_options.land_names, game.game_options);

        //NOTE: Don't use army_size if using conquest plugin
        return {land_name: origin_land.name, name: name, nick_name: nick_name,
            soldiers: Math.round(soldiers), cavalry: Math.round(cavalry), siege: Math.round(siege),
            economy: economy, land_size: 0};
    }

    var enemies = [
        {name: 'wolves', humans: false, technology: 'none', warfare: 'medium', strength: 'low', size_min: 4, size_max: 40, siege_weapons: false, scouts: false},
        {name: 'lions', humans: false, technology: 'none', warfare: 'medium', strength: 'medium', size_min: 4, size_max: 40, siege_weapons: false, scouts: false},
        {name: 'rampaging elephants', humans: false, technology: 'none', warfare: 'low', strength: 'high', size_min: 10, size_max: 60, siege_weapons: false, scouts: false},
        {name: 'locusts', humans: false, technology: 'none', warfare: 'none', strength: 'low', size_min: 10000, size_max: 100000, siege_weapons: false, scouts: false},
        {name: 'fire ants', humans: false, technology: 'none', warfare: 'low', strength: 'tiny', size_min: 10000, size_max: 100000, siege_weapons: false, scouts: false},
        {name: 'pillaging dragon', humans: false, basic: false, magic: true, technology: 'medium', warfare: 'great', strength: 'great', weapon: 'fireball', armor: 'impenetrable scales', damage_bonus: 'great', defense_bonus: 'great', size_min: 1, size_max: 1, siege_weapons: false, scouts: false},
        {name: 'zombie swarm', humans: false, basic: false, undead: true, technology: 'none', warfare: 'none', strength: 'great', size_min: 10, size_max: 4000, siege_weapons: false, scouts: false, no_tribute: true},
        {name: 'dragon riders', humans: false, basic: false, magic: true, technology: 'medium', warfare: 'high', strength: 'great', weapon: 'fireball', armor: 'impenetrable scales', damage_bonus: 'high', defense_bonus: 'high', size_min: 2, size_max: 8, siege_weapons: false, scouts: false},

        {name: 'barbarians', humans: true, technology: 'low', mounted: .3, warfare: 'medium', strength: 'medium', size_min: 20, size_max: 200, siege_weapons: false, scouts: true},
        {name: 'raiders', humans: true, technology: 'low', mounted: .5, warfare: 'medium', strength: 'high', size_min: 30, size_max: 600, siege_weapons: false, scouts: true},
        {name: 'horse warriors', humans: true, technology: 'medium', mounted: .9, warfare: 'high', strength: 'medium', size_min: 100, size_max: 2000, siege_weapons: true, scouts: true},
        {name: 'refugees', humans: true, basic: false, technology: 'low', mounted: .1, warfare: 'none', strength: 'low', size_min: 100, size_max: 2000, siege_weapons: false, scouts: false, can_welcome: true},
        {name: 'heroic knights', humans: true, technology: 'medium', mounted: .9, warfare: 'high', strength: 'great', size_min: 10, size_max: 100, siege_weapons: true, scouts: true},
        {name: 'army', humans: true, technology: 'medium', mounted: .1, warfare: 'high', strength: 'medium', size_min: 100, size_max: 2000, siege_weapons: true, scouts: true},
        {name: 'inquisition army', humans: true, technology: 'medium', mounted: .2, warfare: 'high', strength: 'low', size_min: 200, size_max: 4000, siege_weapons: true, scouts: true},
        {name: 'crusaders', humans: true, technology: 'medium', mounted: .3, warfare: 'high', strength: 'medium', size_min: 300, size_max: 4000, siege_weapons: true, scouts: true, no_tribute: true}
    ];

    new Civvies('add_game_option', 'arrays_to_map_to_arrays', 'enemies');
    new Civvies('add_game_option', 'enemies', enemies);

    new Civvies('add_game_option', 'variables', {name: "enemiesAttacking", initial: 0.002});

    new Civvies('add_game_option', 'functions_each_tick', check_for_enemy_attacking);

})(Civvies);