(function (Civvies) {

    //TODO: Battles are too easy against asymetric forces

    var _c = new Civvies('get_private_functions');

    function check_for_victor(game, battle_state) {
        //If troops = 0, set victor
        var attacker_count = battle_state.attacker_count || 0;
        var defender_count = battle_state.defender_count || 0;
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

    _c.build_enemy_force_from_land_name = function (game, land_name, is_defensive) {
        var nick_name = _.str.titleize(land_name.title || land_name.name);
        var name = nick_name + ((is_defensive) ? ' defensive forces' : ' invading army');

        //TODO: Have a random name or area name for enemy

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

        var fortification = (resistance * .01 * _c.random(game.game_options));

        var economy = ((fortification * 10) + (siege_pct * 6) + (cavalry * 3) + soldiers) / 2;

        return {land_name: land_name.name, name: name, nick_name: nick_name,
            soldiers: Math.round(soldiers), cavalry: Math.round(cavalry), siege: Math.round(siege), fortification: Math.round(fortification),
            economy: economy, land_size: Math.round(Math.sqrt(land_name.population_min))};
    };
    _c.fight_using_battle_state = function (game, battle_state) {
        var state = _.clone(battle_state);
        state.time = game.data.tick_count;

        //Calculate the amount of each force that hit an enemy
        //TODO: Modify by defender's technology and warfare levels, currently using player's variables
        var forces = {};

        //Build a matrix of forces and their attack efficacy
        var army_units = _.filter(game.game_options.populations, function (f) {
            return f.can_join_army
        });
        _.each(['defender', 'attacker'], function (force) {
            forces[force] = {};
            _.each(army_units, function (unit_type) {
                var unit = unit_type.name;
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
// TODO: Better take fortifications into account
//        var fortifications = 0;
//        var fortification_buildings = _.filter(game.game_options.buildings, function (f) {
//            return f.defense && f.defense.troops;
//        });
//        _.each(fortification_buildings, function(fort){
//           fortifications += game.data.buildings[fort.name] * (_c.variable(game, 'fortification_strength') || 1);
//        });


        forces.defender.fortification = {
            count: (battle_state.defender.fortification || 0),
            strength: _c.random(game.game_options) * 2 * (_c.variable(game, 'fortification_strength') || 1),
            block: function (attackers_total) {
                //The amount of force that gets through the fortification
                return Math.max(0,attackers_total - (this.count * this.strength));
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
        var siege_weapon_predamage = forces.defender.siege.attack();
        forces.attacker.cavalry.is_hit(siege_weapon_predamage * .8);
        forces.attacker.soldiers.is_hit(siege_weapon_predamage * .2);

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
            _.each(army_units, function (unit) {
                state[force][unit.name] = Math.floor(forces[force][unit.name].count);
            });
        });
        state.defender.fortification = Math.ceil(forces.defender.fortification.count);

        state.attacker_count = _c.army_size(game, state.attacker);
        state.defender_count = _c.army_size(game, state.defender);

        //Every round of battle increases disease a little
        game.data.variables.diseaseCurrent *= 1.01;

        //Check for a victory
        state.victor = check_for_victor(game, state);
        return state;
    };


})(Civvies);