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

    function populations_possibly_get_sick (game) {
        //TODO: Have a disease factor
        //TODO: More unburied corpses means more disease
        //TODO: Have health variable that removes disease
        //TODO: Sick people move to being ill, then swap back to their positions if healed, or to more ill, until dead (have a counter?)
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

//        //Resource-related
        eat_food_or_die(game);
        populations_produce_products(game);
        populations_possibly_get_sick(game);
//        check_for_attacks(game);
//        check_for_accidents(game);
//        check_for_traders(game);
//        bury_the_dead(game);
//        heal_the_wounded(game);
//        build_a_wonder(game);


//
//        var millMod = 1;
//        if (population.current > 0 || population.zombies > 0) millMod = population.current / (population.current + population.zombies);
//        food.total += population.farmers * (1 + (efficiency.farmers * efficiency.happiness)) * (1 + efficiency.pestBonus) * (1 + (wonder.food / 10)) * (1 + walkTotal / 120) * (1 + mill.total * millMod / 200); //Farmers farm food
//        if (upgrades.skinning == 1 && population.farmers > 0) { //and sometimes get skins
//            x = Math.random();
//            if (x < food.specialchance) {
//                z = 0;
//                if (upgrades.butchering == 1) {
//                    z = population.farmers / 15
//                }
//                ;
//                skins.total += ((food.increment + z) * (1 + (wonder.skins / 10)));
//            }
//        }
//        wood.total += population.woodcutters * (efficiency.woodcutters * efficiency.happiness) * (1 + (wonder.wood / 10)); //Woodcutters cut wood
//        if (upgrades.harvesting == 1 && population.woodcutters > 0) { //and sometimes get herbs
//            x = Math.random();
//            if (x < wood.specialchance) {
//                z = 0;
//                if (upgrades.gardening == 1) {
//                    z = population.woodcutters / 5
//                }
//                ;
//                herbs.total += (wood.increment + z) * (1 + (wonder.herbs / 10));
//            }
//        }
//        stone.total += population.miners * (efficiency.miners * efficiency.happiness) * (1 + (wonder.stone / 10)); //Miners mine stone
//        if (upgrades.prospecting == 1 && population.miners > 0) { //and sometimes get ore
//            x = Math.random();
//            if (x < stone.specialchance) {
//                z = 0;
//                if (upgrades.extraction == 1) {
//                    z = population.miners / 5
//                }
//                ;
//                ore.total += (stone.increment + z) * (1 + (wonder.ore / 10));
//            }
//        }
//        food.total -= population.current; //The living population eats food.
//        if (food.total < 0) { //and will starve if they don't have enough
//            if (upgrades.waste && population.corpses >= (food.total * -1)) { //population eats corpses instead
//                population.corpses = Math.floor(population.corpses + food.total);
//            } else if (upgrades.waste && population.corpses > 0) { //corpses mitigate starvation
//                var starve = Math.ceil((population.current - population.corpses) / 1000);
//                if (starve == 1) gameLog('A worker starved to death');
//                if (starve > 1) gameLog(prettify(starve) + ' workers starved to death');
//                for (var i = 0; i < starve; i++) {
//                    jobCull();
//                }
//                updateJobs();
//                population.corpses = 0;
//            } else { //they just starve
//                var starve = Math.ceil(population.current / 1000);
//                if (starve == 1) gameLog('A worker starved to death');
//                if (starve > 1) gameLog(prettify(starve) + ' workers starved to death');
//                for (var i = 0; i < starve; i++) {
//                    jobCull();
//                }
//                updateJobs();
//                mood(-0.01);
//            }
//            ;
//            food.total = 0;
//            updatePopulation(); //Called because jobCull doesn't. May just change jobCull?
//        }
//        //Resources occasionally go above their caps.
//        if (food.total > 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200)) {
//            food.total = 200 + ((barn.total + (barn.total * upgrades.granaries)) * 200);
//        }
//        ;
//        if (wood.total > 200 + (woodstock.total * 200)) {
//            wood.total = 200 + (woodstock.total * 200);
//        }
//        ;
//        if (stone.total > 200 + (stonestock.total * 200)) {
//            stone.total = 200 + (stonestock.total * 200);
//        }
//        ;
//        //Workers convert secondary resources into tertiary resources
//        if (ore.total >= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness)) {
//            metal.total += population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness) * (1 + (wonder.metal / 10));
//            ore.total -= population.blacksmiths * (efficiency.blacksmiths * efficiency.happiness);
//        } else if (population.blacksmiths) {
//            metal.total += ore.total * (1 + (wonder.metal / 10));
//            ore.total = 0;
//        }
//        ;
//        if (skins.total >= population.tanners * (efficiency.tanners * efficiency.happiness)) {
//            leather.total += population.tanners * (efficiency.tanners * efficiency.happiness) * (1 + (wonder.leather / 10));
//            skins.total -= population.tanners * (efficiency.tanners * efficiency.happiness);
//        } else if (population.tanners) {
//            leather.total += skins.total * (1 + (wonder.leather / 10));
//            skins.total = 0;
//        }
//        ;
//        //Clerics generate piety
//        piety.total += population.clerics * (efficiency.clerics + (efficiency.clerics * upgrades.writing)) * (1 + (upgrades.secrets * (1 - 100 / (graveyard.total + 100)))) * efficiency.happiness * (1 + (wonder.piety / 10));
//
//        //Timers - routines that do not occur every second
//
//        //Checks when mobs will attack
//        if (population.current + population.zombies > 0) attackCounter += 1;
//        if (population.current + population.zombies > 0 && attackCounter > (60 * 5)) { //Minimum 5 minutes
//            var check = Math.random() * 600;
//            if (check < 1) {
//                attackCounter = 0;
//                //Chooses which kind of mob will attack
//                if (population.current + population.zombies >= 10000) {
//                    var choose = Math.random();
//                    if (choose > 0.5) {
//                        spawnMob('barbarian');
//                    } else if (choose > 0.2) {
//                        spawnMob('bandit');
//                    } else {
//                        spawnMob('wolf');
//                    }
//                } else if (population.current + population.zombies >= 1000) {
//                    if (Math.random() > 0.5) {
//                        spawnMob('bandit');
//                    } else {
//                        spawnMob('wolf');
//                    }
//                } else {
//                    spawnMob('wolf');
//                }
//            }
//        }
//        //Decrements the pestTimer, and resets the bonus once it runs out
//        if (pestTimer > 0) {
//            pestTimer -= 1;
//        } else {
//            efficiency.pestBonus = 0;
//        }
//
//        //Handles the Glory bonus
//        if (gloryTimer > 0) {
//            document.getElementById('gloryTimer').innerHTML = gloryTimer;
//            gloryTimer -= 1;
//        } else {
//            document.getElementById('gloryGroup').style.display = 'none';
//        }
//
//        //traders occasionally show up
//        if (population.current + population.zombies > 0) tradeCounter += 1;
//        if (population.current + population.zombies > 0 && tradeCounter > (60 * (3 - upgrades.currency - upgrades.commerce))) {
//            var check = Math.random() * (60 * (3 - upgrades.currency - upgrades.commerce));
//            if (check < (1 + (0.2 * upgrades.comfort))) {
//                tradeCounter = 0;
//                tradeTimer();
//            }
//        }
//
//        updateResourceTotals(); //This is the point where the page is updated with new resource totals
//
//        //Population-related
//
//        //Handling wolf attacks (this is complicated)
//        if (population.wolves > 0) {
//            if (population.soldiers > 0 || population.cavalry > 0) { //FIGHT!
//                //handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                    population.wolvesCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.wolvesCas < 0) {
//                        population.wolvesCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.wolves - population.wolvesCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.wolves = Math.ceil(population.wolvesCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //handles soldiers
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                    population.wolvesCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.wolves * (0.05 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.wolvesCas < 0) {
//                        population.wolvesCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.wolves - population.wolvesCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.wolves = Math.ceil(population.wolvesCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                //Check to see if there are workers that the wolves can eat
//                if (population.healthy > 0) {
//                    //Choose random worker
//                    var target = randomWorker();
//                    if (Math.random() > 0.5) { //Wolves will sometimes not disappear after eating someone
//                        population.wolves -= 1;
//                        population.wolvesCas -= 1;
//                    }
//                    if (population.wolvesCas < 0) population.wolvesCas = 0;
//                    console.log('Wolves ate a ' + target);
//                    gameLog('Wolves ate a ' + target);
//                    if (target == "unemployed") {
//                        population.current -= 1;
//                        population.unemployed -= 1;
//                    } else if (target == "farmer") {
//                        population.current -= 1;
//                        population.farmers -= 1;
//                    } else if (target == "woodcutter") {
//                        population.current -= 1;
//                        population.woodcutters -= 1;
//                    } else if (target == "miner") {
//                        population.current -= 1;
//                        population.miners -= 1;
//                    } else if (target == "tanner") {
//                        population.current -= 1;
//                        population.tanners -= 1;
//                    } else if (target == "blacksmith") {
//                        population.current -= 1;
//                        population.blacksmiths -= 1;
//                    } else if (target == "apothecary") {
//                        population.current -= 1;
//                        population.apothecaries -= 1;
//                    } else if (target == "cleric") {
//                        population.current -= 1;
//                        population.clerics -= 1;
//                    } else if (target == "labourer") {
//                        population.current -= 1;
//                        population.labourers -= 1;
//                    } else if (target == "soldier") {
//                        population.current -= 1;
//                        population.soldiers -= 1;
//                        population.soldiersCas -= 1;
//                        if (population.soldiersCas < 0) {
//                            population.soldiers = 0;
//                            population.soldiersCas = 0;
//                        }
//                    } else if (target == "cavalry") {
//                        population.current -= 1;
//                        population.cavalry -= 1;
//                        population.cavalryCas -= 1;
//                        if (population.cavalryCas < 0) {
//                            population.cavalry = 0;
//                            population.cavalryCas = 0;
//                        }
//                    }
//                    updatePopulation();
//                } else {
//                    //wolves will leave
//                    var leaving = Math.ceil(population.wolves * Math.random());
//                    population.wolves -= leaving;
//                    population.wolvesCas -= leaving;
//                    updateMobs();
//                }
//                ;
//            }
//        }
//        if (population.bandits > 0) {
//            if (population.soldiers > 0 || population.cavalry > 0) {//FIGHT!
//                //Handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.banditsCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0)) * 1.5; //cavalry take 50% more casualties vs infantry
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.banditsCas < 0) {
//                        population.banditsCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.bandits - population.banditsCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.bandits = Math.ceil(population.banditsCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //Handles infantry
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.banditsCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.bandits * (0.07 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.banditsCas < 0) {
//                        population.banditsCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.bandits - population.banditsCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.bandits = Math.ceil(population.banditsCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                //Bandits will steal resources. Select random resource, steal random amount of it.
//                var num = Math.random();
//                var stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
//                if (num < 1 / 8) {
//                    if (food.total > 0) gameLog('Bandits stole food');
//                    if (food.total >= stolen) {
//                        food.total -= stolen;
//                    } else {
//                        food.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 2 / 8) {
//                    if (wood.total > 0) gameLog('Bandits stole wood');
//                    if (wood.total >= stolen) {
//                        wood.total -= stolen;
//                    } else {
//                        wood.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 3 / 8) {
//                    if (stone.total > 0) gameLog('Bandits stole stone');
//                    if (stone.total >= stolen) {
//                        stone.total -= stolen;
//                    } else {
//                        stone.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 4 / 8) {
//                    if (skins.total > 0) gameLog('Bandits stole skins');
//                    if (skins.total >= stolen) {
//                        skins.total -= stolen;
//                    } else {
//                        skins.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 5 / 8) {
//                    if (herbs.total > 0) gameLog('Bandits stole herbs');
//                    if (herbs.total >= stolen) {
//                        herbs.total -= stolen;
//                    } else {
//                        herbs.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 6 / 8) {
//                    if (ore.total > 0) gameLog('Bandits stole ore');
//                    if (ore.total >= stolen) {
//                        ore.total -= stolen;
//                    } else {
//                        ore.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (num < 7 / 8) {
//                    if (leather.total > 0) gameLog('Bandits stole leather');
//                    if (leather.total >= stolen) {
//                        leather.total -= stolen;
//                    } else {
//                        leather.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                } else {
//                    if (metal.total > 0) gameLog('Bandits stole metal');
//                    if (metal.total >= stolen) {
//                        metal.total -= stolen;
//                    } else {
//                        metal.total = 0;
//                        //some will leave
//                        var leaving = Math.ceil(population.bandits * Math.random() * 1 / 8);
//                        population.bandits -= leaving;
//                        population.banditsCas -= leaving;
//                        updateMobs();
//                    }
//                }
//                ;
//                population.bandits -= 1; //Bandits leave after stealing something.
//                population.banditsCas -= 1;
//                if (population.banditsCas < 0) population.banditsCas = 0;
//                updateResourceTotals();
//                updatePopulation();
//            }
//        }
//        if (population.barbarians) {
//            if (population.soldiers > 0 || population.cavalry > 0) {//FIGHT!
//                //Handles cavalry
//                if (population.cavalry > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.barbariansCas -= (population.cavalry * efficiency.cavalry);
//                    population.cavalryCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0)) * 1.5; //Cavalry take 50% more casualties vs. infantry
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.barbariansCas < 0) {
//                        population.barbariansCas = 0;
//                    }
//                    if (population.cavalryCas < 0) {
//                        population.cavalryCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.barbarians - population.barbariansCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.cavalry - population.cavalryCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.barbarians = Math.ceil(population.barbariansCas);
//                    population.cavalry = Math.ceil(population.cavalryCas);
//                }
//                //Handles infantry
//                if (population.soldiers > 0) {
//                    //Calculate each side's casualties inflicted and subtract them from an effective strength value
//                    population.barbariansCas -= (population.soldiers * efficiency.soldiers);
//                    population.soldiersCas -= (population.barbarians * (0.09 - (0.01 * upgrades.palisade)) * Math.max(1 - (fortification.total / 100), 0));
//                    //If this reduces effective strengths below 0, reset it to 0.
//                    if (population.barbariansCas < 0) {
//                        population.barbariansCas = 0;
//                    }
//                    if (population.soldiersCas < 0) {
//                        population.soldiersCas = 0;
//                    }
//                    //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                    var mobCasualties = population.barbarians - population.barbariansCas,
//                        mobCasFloor = Math.floor(mobCasualties),
//                        casualties = population.soldiers - population.soldiersCas,
//                        casFloor = Math.floor(casualties);
//                    if (!(mobCasFloor > 0)) mobCasFloor = 0;
//                    if (!(casFloor > 0)) casFloor = 0;
//                    //Increments enemies slain, corpses, and piety
//                    population.enemiesSlain += mobCasFloor;
//                    if (upgrades.throne) throneCount += mobCasFloor;
//                    population.corpses += (casFloor + mobCasFloor);
//                    if (upgrades.book) {
//                        piety.total += (casFloor + mobCasFloor) * 10;
//                    }
//                    ;
//                    //Resets the actual numbers based on effective strength
//                    population.barbarians = Math.ceil(population.barbariansCas);
//                    population.soldiers = Math.ceil(population.soldiersCas);
//                }
//                //Updates population figures (including total population)
//                updatePopulation();
//            } else {
//                var havoc = Math.random(); //barbarians do different things
//                if (havoc < 0.3) {
//                    //Kill people, see wolves
//                    if (population.healthy > 0) {
//                        //No honor in killing the sick who will starve anyway
//                        var target = randomWorker(); //Choose random worker
//                        population.barbarians -= 1; //Barbarians always disappear after killing
//                        population.barbariansCas -= 1;
//                        if (population.barbariansCas < 0) population.barbariansCas = 0;
//                        console.log('Barbarians killed a ' + target);
//                        gameLog('Barbarians killed a ' + target);
//                        if (target == "unemployed") {
//                            population.current -= 1;
//                            population.unemployed -= 1;
//                        } else if (target == "farmer") {
//                            population.current -= 1;
//                            population.farmers -= 1;
//                        } else if (target == "woodcutter") {
//                            population.current -= 1;
//                            population.woodcutters -= 1;
//                        } else if (target == "miner") {
//                            population.current -= 1;
//                            population.miners -= 1;
//                        } else if (target == "tanner") {
//                            population.current -= 1;
//                            population.tanners -= 1;
//                        } else if (target == "blacksmith") {
//                            population.current -= 1;
//                            population.blacksmiths -= 1;
//                        } else if (target == "apothecary") {
//                            population.current -= 1;
//                            population.apothecaries -= 1;
//                        } else if (target == "cleric") {
//                            population.current -= 1;
//                            population.clerics -= 1;
//                        } else if (target == "labourer") {
//                            population.current -= 1;
//                            population.labourers -= 1;
//                        } else if (target == "soldier") {
//                            population.current -= 1;
//                            population.soldiers -= 1;
//                            population.soldiersCas -= 1;
//                            if (population.soldiersCas < 0) {
//                                population.soldiers = 0;
//                                population.soldiersCas = 0;
//                            }
//                        } else if (target == "cavalry") {
//                            population.current -= 1;
//                            population.cavalry -= 1;
//                            population.cavalryCas -= 1;
//                            if (population.cavalryCas < 0) {
//                                population.cavalry = 0;
//                                population.cavalryCas = 0;
//                            }
//                        }
//                        population.corpses += 1; //Unlike wolves, Barbarians leave corpses behind
//                        updatePopulation();
//                    } else {
//                        var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 3);
//                        population.barbarians -= leaving;
//                        population.barbariansCas -= leaving;
//                        updateMobs();
//                    }
//                } else if (havoc < 0.6) {
//                    //Steal shit, see bandits
//                    var num = Math.random();
//                    var stolen = Math.floor((Math.random() * 1000)); //Steal up to 1000.
//                    if (num < 1 / 8) {
//                        if (food.total > 0) gameLog('Barbarians stole food');
//                        if (food.total >= stolen) {
//                            food.total -= stolen;
//                        } else {
//                            food.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 2 / 8) {
//                        if (wood.total > 0) gameLog('Barbarians stole wood');
//                        if (wood.total >= stolen) {
//                            wood.total -= stolen;
//                        } else {
//                            wood.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 3 / 8) {
//                        if (stone.total > 0) gameLog('Barbarians stole stone');
//                        if (stone.total >= stolen) {
//                            stone.total -= stolen;
//                        } else {
//                            stone.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 4 / 8) {
//                        if (skins.total > 0) gameLog('Barbarians stole skins');
//                        if (skins.total >= stolen) {
//                            skins.total -= stolen;
//                        } else {
//                            skins.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 5 / 8) {
//                        if (herbs.total > 0) gameLog('Barbarians stole herbs');
//                        if (herbs.total >= stolen) {
//                            herbs.total -= stolen;
//                        } else {
//                            herbs.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 6 / 8) {
//                        if (ore.total > 0) gameLog('Barbarians stole ore');
//                        if (ore.total >= stolen) {
//                            ore.total -= stolen;
//                        } else {
//                            ore.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 7 / 8) {
//                        if (leather.total > 0) gameLog('Barbarians stole leather');
//                        if (leather.total >= stolen) {
//                            leather.total -= stolen;
//                        } else {
//                            leather.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else {
//                        if (metal.total > 0) gameLog('Barbarians stole metal');
//                        if (metal.total >= stolen) {
//                            metal.total -= stolen;
//                        } else {
//                            metal.total = 0;
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 24);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    }
//                    ;
//                    population.barbarians -= 1; //Barbarians leave after stealing something.
//                    population.barbariansCas -= 1;
//                    if (population.barbariansCas < 0) population.barbariansCas = 0;
//                    updateResourceTotals();
//                    updatePopulation();
//                } else {
//                    //Destroy buildings
//                    var num = Math.random(); //Barbarians attempt to destroy random buildings (and leave if they do)
//                    if (num < 1 / 16) {
//                        if (tent.total > 0) {
//                            tent.total -= 1;
//                            gameLog('Barbarians destroyed a tent');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 2 / 16) {
//                        if (whut.total > 0) {
//                            whut.total -= 1;
//                            gameLog('Barbarians destroyed a wooden hut');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 3 / 16) {
//                        if (cottage.total > 0) {
//                            cottage.total -= 1;
//                            gameLog('Barbarians destroyed a cottage');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 4 / 16) {
//                        if (house.total > 0) {
//                            house.total -= 1;
//                            gameLog('Barbarians destroyed a house');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 5 / 16) {
//                        if (mansion.total > 0) {
//                            mansion.total -= 1;
//                            gameLog('Barbarians destroyed a mansion');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 6 / 16) {
//                        if (barn.total > 0) {
//                            barn.total -= 1;
//                            gameLog('Barbarians destroyed a barn');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 7 / 16) {
//                        if (woodstock.total > 0) {
//                            woodstock.total -= 1;
//                            gameLog('Barbarians destroyed a wood stockpile');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 8 / 16) {
//                        if (stonestock.total > 0) {
//                            stonestock.total -= 1;
//                            gameLog('Barbarians destroyed a stone stockpile');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 9 / 16) {
//                        if (tannery.total > 0) {
//                            tannery.total -= 1;
//                            gameLog('Barbarians destroyed a tannery');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 10 / 16) {
//                        if (smithy.total > 0) {
//                            smithy.total -= 1;
//                            gameLog('Barbarians destroyed a smithy');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 11 / 16) {
//                        if (apothecary.total > 0) {
//                            apothecary.total -= 1;
//                            gameLog('Barbarians destroyed an apothecary');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 12 / 16) {
//                        if (temple.total > 0) {
//                            temple.total -= 1;
//                            gameLog('Barbarians destroyed a temple');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 13 / 16) {
//                        if (fortification.total > 0) {
//                            fortification.total -= 1;
//                            gameLog('Barbarians damaged fortifications');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 14 / 16) {
//                        if (stable.total > 0) {
//                            stable.total -= 1;
//                            gameLog('Barbarians destroyed a stable');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else if (num < 15 / 16) {
//                        if (mill.total > 0) {
//                            mill.total -= 1;
//                            gameLog('Barbarians destroyed a mill');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    } else {
//                        if (barracks.total > 0) {
//                            barracks.total -= 1;
//                            gameLog('Barbarians destroyed a barracks');
//                        } else {
//                            //some will leave
//                            var leaving = Math.ceil(population.barbarians * Math.random() * 1 / 112);
//                            population.barbarians -= leaving;
//                            population.barbariansCas -= leaving;
//                            updateMobs();
//                        }
//                    }
//                    ;
//                    population.barbarians -= 1;
//                    population.barbariansCas -= 1;
//                    if (population.barbarians < 0) population.barbarians = 0;
//                    if (population.barbariansCas < 0) population.barbariansCas = 0;
//                    updateBuildingTotals();
//                    updatePopulation();
//                }
//            }
//        }
//        if (population.shades > 0) {
//            if (population.wolves >= population.shades / 4) {
//                population.wolves -= Math.floor(population.shades / 4);
//                population.wolvesCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.wolves > 0) {
//                population.shades -= Math.floor(population.wolves);
//                population.wolves = 0;
//                population.wolvesCas = 0;
//            }
//            if (population.bandits >= population.shades / 4) {
//                population.bandits -= Math.floor(population.shades / 4);
//                population.banditsCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.bandits > 0) {
//                population.shades -= Math.floor(population.bandits);
//                population.bandits = 0;
//                population.banditsCas = 0;
//            }
//            if (population.barbarians >= population.shades / 4) {
//                population.barbarians -= Math.floor(population.shades / 4);
//                population.barbariansCas -= population.shades / 4;
//                population.shades -= Math.floor(population.shades / 4);
//            } else if (population.bandits > 0) {
//                population.shades -= Math.floor(population.barbarians);
//                population.barbarians = 0;
//                population.barbariansCas = 0;
//            }
//            population.shades = Math.floor(population.shades * 0.95);
//            if (population.shades < 0) population.shades = 0;
//            updatePopulation();
//        }
//        if (population.esiege > 0) {
//            //First check there are enemies there defending them
//            if (population.bandits > 0 || population.barbarians > 0) {
//                if (fortification.total > 0) { //needs to be something to fire at
//                    var firing = Math.ceil(Math.min(population.esiege / 2, 100)); //At most half or 100 can fire at a time
//                    for (var i = 0; i < firing; i++) {
//                        if (fortification.total > 0) { //still needs to be something to fire at
//                            var hit = Math.random();
//                            if (hit < 0.1) { //each siege engine has 10% to hit
//                                fortification.total -= 1;
//                                gameLog('Enemy siege engine damaged our fortifications');
//                                updateRequirements(fortification);
//                            } else if (hit > 0.95) { //each siege engine has 5% to misfire and destroy itself
//                                population.esiege -= 1;
//                            }
//                        }
//                    }
//                    updateBuildingTotals();
//                }
//                ;
//            } else if (population.soldiers > 0 || population.cavalry > 0) {
//                //the siege engines are undefended
//                if (upgrades.mathematics) { //Can we use them?
//                    gameLog('Captured ' + prettify(population.esiege) + ' enemy siege engines.');
//                    population.siege += population.esiege; //capture them
//                    updateParty(); //show them in conquest pane
//                } else {
//                    //we can't use them, therefore simply destroy them
//                    gameLog('Destroyed ' + prettify(population.esiege) + ' enemy siege engines.');
//                }
//                population.esiege = 0;
//            }
//            updateMobs();
//        }
//
//        if (raiding.raiding) { //handles the raiding subroutine
//            if (population.soldiersParty > 0 || population.cavalryParty || raiding.victory) { //technically you can win, then remove all your soldiers
//                if (population.esoldiers > 0) {
//                    /* FIGHT! */
//                    //Handles cavalry
//                    if (population.cavalryParty > 0) {
//                        //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                        population.esoldiersCas -= (population.cavalryParty * efficiency.cavalry) * Math.max(1 - population.eforts / 100, 0);
//                        population.cavalryPartyCas -= (population.esoldiers * 0.05 * 1.5); //Cavalry takes 50% more casualties vs. infantry
//                        //If this reduces effective strengths below 0, reset it to 0.
//                        if (population.esoldiersCas < 0) {
//                            population.esoldiersCas = 0;
//                        }
//                        if (population.cavalryPartyCas < 0) {
//                            population.cavalryPartyCas = 0;
//                        }
//                        //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                        var mobCasualties = population.esoldiers - population.esoldiersCas,
//                            mobCasFloor = Math.floor(mobCasualties),
//                            casualties = population.cavalryParty - population.cavalryPartyCas,
//                            casFloor = Math.floor(casualties);
//                        if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                        if (!(casFloor > 0)) casFloor = 0;
//                        //Increments enemies slain, corpses, and piety
//                        population.enemiesSlain += mobCasFloor;
//                        if (upgrades.throne) throneCount += mobCasFloor;
//                        population.corpses += (casFloor + mobCasFloor);
//                        updatePopulation();
//                        if (upgrades.book) {
//                            piety.total += (casFloor + mobCasFloor) * 10;
//                            updateResourceTotals();
//                        }
//                        ;
//                        //Resets the actual numbers based on effective strength
//                        population.esoldiers = Math.ceil(population.esoldiersCas);
//                        population.cavalryParty = Math.ceil(population.cavalryPartyCas);
//                    }
//                    //Handles infantry
//                    if (population.soldiersParty > 0) {
//                        //Calculate each side's casualties inflicted and subtract them from an effective strength value (xCas)
//                        population.esoldiersCas -= (population.soldiersParty * efficiency.soldiers) * Math.max(1 - population.eforts / 100, 0);
//                        population.soldiersPartyCas -= (population.esoldiers * 0.05);
//                        //If this reduces effective strengths below 0, reset it to 0.
//                        if (population.esoldiersCas < 0) {
//                            population.esoldiersCas = 0;
//                        }
//                        if (population.soldiersPartyCas < 0) {
//                            population.soldiersPartyCas = 0;
//                        }
//                        //Calculates the casualties dealt based on difference between actual numbers and new effective strength
//                        var mobCasualties = population.esoldiers - population.esoldiersCas,
//                            mobCasFloor = Math.floor(mobCasualties),
//                            casualties = population.soldiersParty - population.soldiersPartyCas,
//                            casFloor = Math.floor(casualties);
//                        if (!(mobCasFloor > 0)) mobCasFloor = 0; //weirdness with floating point numbers. not sure why this is necessary
//                        if (!(casFloor > 0)) casFloor = 0;
//                        //Increments enemies slain, corpses, and piety
//                        population.enemiesSlain += mobCasFloor;
//                        if (upgrades.throne) throneCount += mobCasFloor;
//                        population.corpses += (casFloor + mobCasFloor);
//                        updatePopulation();
//                        if (upgrades.book) {
//                            piety.total += (casFloor + mobCasFloor) * 10;
//                            updateResourceTotals();
//                        }
//                        ;
//                        //Resets the actual numbers based on effective strength
//                        population.esoldiers = Math.ceil(population.esoldiersCas);
//                        population.soldiersParty = Math.ceil(population.soldiersPartyCas);
//                    }
//                    //Handles siege engines
//                    if (population.siege > 0 && population.eforts > 0) { //need to be siege weapons and something to fire at
//                        var firing = Math.ceil(Math.min(population.siege / 2, population.eforts * 2));
//                        if (firing > population.siege) firing = population.siege; //should never happen
//                        for (var i = 0; i < firing; i++) {
//                            if (population.eforts > 0) { //still needs to be something to fire at
//                                var hit = Math.random();
//                                if (hit < 0.1) { //each siege engine has 10% to hit
//                                    population.eforts -= 1;
//                                } else if (hit > 0.95) { //each siege engine has 5% to misfire and destroy itself
//                                    population.siege -= 1;
//                                }
//                            }
//                        }
//                    }
//
//                    /* END FIGHT! */
//
//                    //checks victory conditions (needed here because of the order of tests)
//                    if (population.esoldiers <= 0) {
//                        population.esoldiers = 0; //ensure esoldiers is 0
//                        population.esoldiersCas = 0; //ensure esoldiers is 0
//                        population.eforts = 0; //ensure eforts is 0
//                        gameLog('Raid victorious!'); //notify player
//                        raiding.victory = true; //set victory for future handling
//                        //conquest achievements
//                        if (!achievements.raider) {
//                            achievements.raider = 1;
//                            updateAchievements();
//                        }
//                        if (raiding.last == 'empire' && !achievements.domination) {
//                            achievements.domination = 1;
//                            updateAchievements();
//                        }
//                        //lamentation
//                        if (upgrades.lament) {
//                            attackCounter -= Math.ceil(raiding.iterations / 100);
//                        }
//                        //ups the targetMax and improves mood (reverse order to prevent it being immediate set to Empire)
//                        if (raiding.last == 'empire') {
//                            mood(0.12);
//                        }
//                        if (raiding.last == 'largeNation') {
//                            if (targetMax == 'largeNation') targetMax = 'empire';
//                            mood(0.11);
//                        }
//                        if (raiding.last == 'nation') {
//                            if (targetMax == 'nation') targetMax = 'largeNation';
//                            mood(0.10);
//                        }
//                        if (raiding.last == 'smallNation') {
//                            if (targetMax == 'smallNation') targetMax = 'nation';
//                            mood(0.09);
//                        }
//                        if (raiding.last == 'metropolis') {
//                            if (targetMax == 'metropolis') targetMax = 'smallNation';
//                            mood(0.08);
//                        }
//                        if (raiding.last == 'largeCity') {
//                            if (targetMax == 'largeCity') targetMax = 'metropolis';
//                            mood(0.07);
//                        }
//                        if (raiding.last == 'smallCity') {
//                            if (targetMax == 'smallCity') targetMax = 'largeCity';
//                            mood(0.06);
//                        }
//                        if (raiding.last == 'largeTown') {
//                            if (targetMax == 'largeTown') targetMax = 'smallCity';
//                            mood(0.05);
//                        }
//                        if (raiding.last == 'smallTown') {
//                            if (targetMax == 'smallTown') targetMax = 'largeTown';
//                            mood(0.04);
//                        }
//                        if (raiding.last == 'village') {
//                            if (targetMax == 'village') targetMax = 'smallTown';
//                            mood(0.03);
//                        }
//                        if (raiding.last == 'hamlet') {
//                            if (targetMax == 'hamlet') targetMax = 'village';
//                            mood(0.02);
//                        }
//                        if (raiding.last == 'thorp') {
//                            if (targetMax == 'thorp') targetMax = 'hamlet';
//                            mood(0.01);
//                        }
//                        updateTargets(); //update the new target
//                    }
//                    ;
//                    updateParty(); //display new totals for army soldiers and enemy soldiers
//                } else if (raiding.victory) {
//                    //handles the victory outcome
//                    document.getElementById('victoryGroup').style.display = 'block';
//                } else {
//                    //victory outcome has been handled, end raid
//                    raiding.raiding = false;
//                    raiding.iterations = 0;
//                }
//            } else {
//                gameLog('Raid defeated');
//                population.esoldiers = 0;
//                population.esoldiersCas = 0;
//                population.eforts = 0;
//                population.siege = 0;
//                updateParty();
//                raiding.raiding = false;
//                raiding.iterations = 0;
//            }
//        } else {
//            document.getElementById('raidGroup').style.display = 'block'
//        }
//
//        if (population.corpses > 0 && population.graves > 0) {
//            //Clerics will bury corpses if there are graves to fill and corpses lying around
//            for (var i = 0; i < population.clerics; i++) {
//                if (population.corpses > 0 && population.graves > 0) {
//                    population.corpses -= 1;
//                    population.graves -= 1;
//                }
//            }
//            updatePopulation();
//        }
//        if (population.totalSick > 0 && population.apothecaries + (population.cats * upgrades.companion) > 0) {
//            //Apothecaries curing sick people
//            for (var i = 0; i < population.apothecaries + (population.cats * upgrades.companion); i++) {
//                if (herbs.total > 0) {
//                    //Increment efficiency counter
//                    cureCounter += (efficiency.apothecaries * efficiency.happiness);
//                    while (cureCounter >= 1 && herbs.total >= 1) { //OH GOD WHY AM I USING THIS
//                        //Decrement counter
//                        //This is doubly important because of the While loop
//                        cureCounter -= 1;
//                        //Select a sick worker to cure, with certain priorities
//                        if (population.apothecariesIll > 0) { //Don't all get sick
//                            population.apothecariesIll -= 1;
//                            population.apothecaries += 1;
//                            herbs.total -= 1;
//                        } else if (population.farmersIll > 0) { //Don't starve
//                            population.farmersIll -= 1;
//                            population.farmers += 1;
//                            herbs.total -= 1;
//                        } else if (population.soldiersIll > 0) { //Don't get attacked
//                            population.soldiersIll -= 1;
//                            population.soldiers += 1;
//                            population.soldiersCas += 1;
//                            herbs.total -= 1;
//                        } else if (population.cavalryIll > 0) { //Don't get attacked
//                            population.cavalryIll -= 1;
//                            population.cavalry += 1;
//                            population.cavalryCas += 1;
//                            herbs.total -= 1;
//                        } else if (population.clericsIll > 0) { //Bury corpses to make this problem go away
//                            population.clericsIll -= 1;
//                            population.clerics += 1;
//                            herbs.total -= 1;
//                        } else if (population.labourersIll > 0) {
//                            population.labourersIll -= 1;
//                            population.labourers += 1;
//                            herbs.total -= 1;
//                        } else if (population.woodcuttersIll > 0) {
//                            population.woodcuttersIll -= 1;
//                            population.woodcutters += 1;
//                            herbs.total -= 1;
//                        } else if (population.minersIll > 0) {
//                            population.minersIll -= 1;
//                            population.miners += 1;
//                            herbs.total -= 1;
//                        } else if (population.tannersIll > 0) {
//                            population.tannersIll -= 1;
//                            population.tanners += 1;
//                            herbs.total -= 1;
//                        } else if (population.blacksmithsIll > 0) {
//                            population.blacksmithsIll -= 1;
//                            population.blacksmiths += 1;
//                            herbs.total -= 1;
//                        } else if (population.unemployedIll > 0) {
//                            population.unemployedIll -= 1;
//                            population.unemployed += 1;
//                            herbs.total -= 1;
//                        }
//                    }
//                }
//            }
//            updatePopulation();
//        }
//        if (population.corpses > 0) {
//            //Corpses lying around will occasionally make people sick.
//            var sickChance = Math.random() * (50 + (upgrades.feast * 50));
//            if (sickChance < 1) {
//                var sickNum = Math.floor(population.current / 100 * Math.random());
//                if (sickNum > 0) plague(sickNum);
//            }
//        }
//
//        if (throneCount >= 100) {
//            //If sufficient enemies have been slain, build new temples for free
//            temple.total += Math.floor(throneCount / 100);
//            throneCount = 0;
//            updateBuildingTotals();
//        }
//
//        if (graceCost > 1000) {
//            graceCost -= 1;
//            graceCost = Math.floor(graceCost);
//            document.getElementById('graceCost').innerHTML = prettify(graceCost);
//        }
//
//        if (walkTotal > 0) {
//            if (population.healthy > 0) {
//                for (var i = 0; i < walkTotal; i++) {
//                    var target = randomWorker();
//                    if (target == "unemployed") {
//                        population.current -= 1;
//                        population.unemployed -= 1;
//                    } else if (target == "farmer") {
//                        population.current -= 1;
//                        population.farmers -= 1;
//                    } else if (target == "woodcutter") {
//                        population.current -= 1;
//                        population.woodcutters -= 1;
//                    } else if (target == "miner") {
//                        population.current -= 1;
//                        population.miners -= 1;
//                    } else if (target == "tanner") {
//                        population.current -= 1;
//                        population.tanners -= 1;
//                    } else if (target == "blacksmith") {
//                        population.current -= 1;
//                        population.blacksmiths -= 1;
//                    } else if (target == "apothecary") {
//                        population.current -= 1;
//                        population.apothecaries -= 1;
//                    } else if (target == "cleric") {
//                        population.current -= 1;
//                        population.clerics -= 1;
//                    } else if (target == "labourer") {
//                        population.current -= 1;
//                        population.labourers -= 1;
//                    } else if (target == "soldier") {
//                        population.current -= 1;
//                        population.soldiers -= 1;
//                        population.soldiersCas -= 1;
//                        if (population.soldiersCas < 0) {
//                            population.soldiers = 0;
//                            population.soldiersCas = 0;
//                        }
//                    } else if (target == "cavalry") {
//                        population.current -= 1;
//                        population.cavalry -= 1;
//                        population.cavalryCas -= 1;
//                        if (population.cavalryCas < 0) {
//                            population.cavalry = 0;
//                            population.cavalryCas = 0;
//                        }
//                    }
//                }
//                updatePopulation();
//            } else {
//                walkTotal = 0;
//                document.getElementById('ceaseWalk').disabled = true;
//            }
//        }
//
//        if (wonder.building) {
//            if (wonder.progress >= 100) {
//                //Wonder is finished! First, send workers home
//                population.unemployed += population.labourers;
//                population.unemployedIll += population.labourersIll;
//                population.labourers = 0;
//                population.labourersIll = 0;
//                updatePopulation();
//                //hide limited notice
//                document.getElementById('lowResources').style.display = 'none';
//                //then set wonder.completed so things will be updated appropriately
//                wonder.completed = true;
//                //check to see if neverclick was achieved
//                if (!achievements.neverclick && resourceClicks <= 22) {
//                    achievements.neverclick = 1;
//                    gameLog('Achievement Unlocked: Neverclick!');
//                    updateAchievements();
//                }
//            } else {
//                //we're still building
//                //first, check for labourers
//                if (population.labourers > 0) {
//                    //then check we have enough resources
//                    if (food.total >= population.labourers && stone.total >= population.labourers && wood.total >= population.labourers && skins.total >= population.labourers && herbs.total >= population.labourers && ore.total >= population.labourers && metal.total >= population.labourers && leather.total >= population.labourers && piety.total >= population.labourers) {
//                        //remove resources
//                        food.total -= population.labourers;
//                        wood.total -= population.labourers;
//                        stone.total -= population.labourers;
//                        skins.total -= population.labourers;
//                        herbs.total -= population.labourers;
//                        ore.total -= population.labourers;
//                        leather.total -= population.labourers;
//                        metal.total -= population.labourers;
//                        piety.total -= population.labourers;
//                        //increase progress
//                        wonder.progress += population.labourers / (1000000 * Math.pow(1.5, wonder.total));
//                        //hide limited notice
//                        document.getElementById('lowResources').style.display = 'none';
//                    } else if (food.total >= 1 && stone.total >= 1 && wood.total >= 1 && skins.total >= 1 && herbs.total >= 1 && ore.total >= 1 && metal.total >= 1 && leather.total >= 1 && piety.total >= 1) {
//                        //or at least some resources
//                        var number = Math.min(food.total, wood.total, stone.total, skins.total, herbs.total, ore.total, leather.total, metal.total, piety.total);
//                        //remove resources
//                        food.total -= number;
//                        wood.total -= number;
//                        stone.total -= number;
//                        skins.total -= number;
//                        herbs.total -= number;
//                        ore.total -= number;
//                        leather.total -= number;
//                        metal.total -= number;
//                        piety.total -= number;
//                        //increase progress
//                        wonder.progress += number / (1000000 * Math.pow(1.5, wonder.total));
//                        //show limited notice
//                        document.getElementById('lowResources').style.display = 'block';
//                        updateWonderLimited();
//                    } else {
//                        //we don't have enough resources to do any work
//                        //show limited notice
//                        document.getElementById('lowResources').style.display = 'block';
//                        updateWonderLimited();
//                    }
//                } else {
//                    //we're not working on the wonder, so hide limited notice
//                    document.getElementById('lowResources').style.display = 'none';
//                }
//            }
//            updateWonder();
//        }
//
//        //Trader stuff
//
//        if (trader.timer > 0) {
//            if (trader.timer > 1) {
//                trader.timer -= 1;
//            } else {
//                document.getElementById('tradeContainer').style.display = 'none';
//                trader.timer -= 1;
//            }
//        }
//
//        updateUpgrades();
//        updateBuildingButtons();
//        updateJobs();
//        updatePartyButtons();
//        updateSpawnButtons();
//        updateReset();

        _c.redraw_data(game);

    }

})(Civvies);