(function (Civvies) {

    var $pointers = {};

    var purchase_multiples = [1, 10, 100, 1000];
    var assign_multiples = ['-all', -100, -10, -1, 'info', 1, 10, 100, '+max'];

    //------------------------------------------
    function show_basic_resources(game) {
        $('<h3>')
            .text('Resources')
            .appendTo($pointers.basic_resources);
        var $table = $('<table>')
            .appendTo($pointers.basic_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 1) {
                var name = _.str.titleize(resource.title || resource.name);
                var $tr = $('<tr>')
                    .appendTo($table);
                var $td1 = $('<td>')
                    .appendTo($tr);
                var times = resource.amount_from_click || 1;
                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, resource, true, times);

                $('<button>')
                    .text('Gather ' + name)
                    .popover({title: "Manually Gather " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                    .on('click', function () {
                        _c.increment_from_click(game, resource);
                    })
                    .appendTo($td1);
                $('<td>')
                    .text(name + ":")
                    .appendTo($tr);
                resource.$holder = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-' + resource.name)
                    .text(0)
                    .appendTo($tr);
                var $td4 = $('<td>')
                    .addClass('icon')
                    .appendTo($tr);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($td4);
                resource.$max = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-max-' + resource.name)
                    .text("(Max: " + game.game_options.storage_initial + ")")
                    .appendTo($tr);
                resource.$rate = $('<td>')
                    .addClass('number net')
                    .attr('id', 'resource-rate-' + resource.name)
                    .text("0/s")
                    .appendTo($tr);
            }
        });
    }

    function show_secondary_resources(game) {
        //TODO: Add some info on popover
        $('<h3>')
            .text('Special Resources')
            .appendTo($pointers.secondary_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 2) {
                var name = _.str.titleize(resource.title || resource.name);

                var $div = $('<div>')
                    .addClass('icon resource-holder')
                    .appendTo($pointers.secondary_resources);
                $('<span>')
                    .text(name + ":")
                    .appendTo($div);
                resource.$holder = $('<span>')
                    .attr('id', 'resource-' + resource.name)
                    .text(0)
                    .appendTo($div);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($div);
            }
        });
    }

    function update_resources(game) {
        var rates = _c.calculate_increment_costs(game);
        _.each(game.game_options.resources, function (resource) {
            if (resource.$holder) {
                var res_data = game.data.resources[resource.name];
                res_data = Helpers.abbreviateNumber(res_data);
                resource.$holder.text(res_data)
            }

            if (resource.$max) {
                var res_max = _c.getResourceMax(game, resource);
                res_max = Helpers.abbreviateNumber(res_max);
                resource.$max.text("(Max: " + res_max + ")")
            }

            if (resource.$rate) {
                var res_rate = Helpers.abbreviateNumber(rates[resource.name]) || 0;
                resource.$rate.text(res_rate + "/s"); //TODO: Calculate if tick frequence not 1s
            }
        });

        _.each(game.game_options.buildings, function (building) {
            if (building.$holder) {
                var building_data = game.data.buildings[building.name];
                building_data = Helpers.abbreviateNumber(building_data);
                building.$holder.text(building_data)
            }
        });
    }

    //------------------------------------------
    function show_building_buttons(game) {
        $('<h3>')
            .text('Buildings')
            .hide()
            .appendTo($pointers.building_list);
        var $table = $('<table>')
            .appendTo($pointers.building_list);

        var lastStyle = game.game_options.buildings[0].type;

        _.each(game.game_options.buildings, function (building) {
            var name = _.str.titleize(building.title || building.name);
            var amount = game.data.buildings[building.name];

            if (building.type != lastStyle) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            lastStyle = building.type;

            var $tr = $('<tr>')
                .appendTo($table);
            if (!amount) $tr.hide();

            var $td1 = $('<td>')
                .appendTo($tr);
            _.each(purchase_multiples, function (times) {
                var text = (times > 1) ? "x" + times : 'Build ' + name;
                var btn_class = (times > 1) ? "x" + times : '';

                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, building, true, times);

                building["$btn_x" + times] = $('<button>')
                    .text(text)
                    .popover({title: "Build " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                    .prop({disabled: true})
                    .addClass(btn_class)
                    .on('click', function () {
                        _c.create_building(game, building, times);
                    })
                    .appendTo($td1);
            });
            $('<td>')//TODO: These aren't aligning properly
                .text(Helpers.pluralize(name) + ": ")
                .appendTo($tr);
            building.$holder = $('<td>')
                .addClass('number')
                .attr('id', 'building-' + building.name)
                .text(amount)
                .appendTo($tr);

            building.$display = $tr;
        });

    }

    function update_building_buttons(game) {
        var buildings_shown = false;
        _.each(game.game_options.buildings, function (building) {

            var purchasable = _c.building_is_purchasable(game, building, 1);
            var enabled;

            if (!building.shown_before && purchasable) {
                building.shown_before = true;
                building.$display.css({display: "block"});
            }
            if (building.shown_before) {
                buildings_shown = true;

                enabled = purchasable;
                _.each(purchase_multiples, function (times) {
                    enabled = _c.building_is_purchasable(game, building, times);
                    var $btn = building["$btn_x" + times];
                    var currently_disabled = $btn.prop('disabled');
                    if (!currently_disabled && !enabled) {
                        //Changing to disabled, so turn off any popovers
                        $btn.popover('hide');
                    }
                    $btn.prop({disabled: !enabled});
                });
            }
        });
        if (buildings_shown) {
            $pointers.building_list.find('h3').show();
        }
    }

    //------------------------------------------
    function show_population_data(game) {
        $('<h3>')
            .text('Population')
            .appendTo($pointers.population_info);

        var population = _c.population(game);
        var population_current = population.current;
        var population_max = population.max;

        var $d1 = $('<div>')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Current Population: ")
            .appendTo($d1);
        $pointers.population_current = $("<span>")
            .text(population_current)
            .appendTo($d1);

        var $d2 = $('<div>')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Maximum Population: ")
            .appendTo($d2);
        $pointers.population_max = $("<span>")
            .text(population_max)
            .appendTo($d2);


        var $d3 = $("<div>")
            .appendTo($pointers.population_info);
        _.each(purchase_multiples, function (times) {
            var $inner = $('<div>')
                .appendTo($d3);

            var text = (times > 1) ? "Create " + times + " workers" : "Create worker";

            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            $pointers["create_workers_x" + times] = $('<button>')
                .text(text)
                .prop({disabled: true})
                .on('click', function () {
                    _c.create_workers(game, times);
                    _c.redraw_data(game);
                })
                .appendTo($inner);
            $pointers["create_workers_x" + times + "_cost"] = $("<span>")
                .text(description)
                .appendTo($inner);
        });
    }

    function update_population_data(game) {
        var population = _c.population(game);
        var population_current = population.current;
        var population_max = population.max;

        $pointers.population_current.text(population_current);
        $pointers.population_max.text(population_max);

        _.each(purchase_multiples, function (times) {
            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            $pointers["create_workers_x" + times]
                .prop({disabled: !_c.workers_are_creatable(game, times)});

            $pointers["create_workers_x" + times + "_cost"]
                .text(description);
        });
    }

    //------------------------------------------
    function show_jobs_list(game) {
        $('<h3>')
            .text('Jobs')
            .hide()
            .appendTo($pointers.jobs_list);

        var $table = $('<table>')
            .appendTo($pointers.jobs_list);

        var lastStyle = game.game_options.populations[0].type;
        _.each(game.game_options.populations, function (job) {
            var name = _.str.titleize(job.title || job.name);
            var amount = game.data.populations[job.name];

            if (job.type != lastStyle) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            lastStyle = job.type;

            var $tr = $('<tr>')
                .appendTo($table);
            if (!amount) $tr.hide();

            var $td1 = $('<td>')
                .appendTo($tr);
            _.each(assign_multiples, function (times) {
                var times_text;
                var use_button = false;
                var show = false;

                if (_.isNumber(times)) {
                    if (times > 0) {
                        times_text = "+" + times;
                    } else {
                        times_text = times;
                    }
                    if (!job.unassignable) {
                        use_button = true;
                        show = true;
                    }
                } else if (times == 'info') {
                    times_text = name + ": ";
                    show = true;
                } else {
                    times_text = times;
                    use_button = true;
                    if (!job.unassignable) {
                        show = true;
                    }
                }

                var title = (_.isString(times)) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(game, job, true, times);

                if (show) {
                    if (use_button) {
                        job["$btn_x" + times] = $('<button>')
                            .text(times_text)
                            .popover({title: "Assign " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                            .prop({disabled: true})
                            .addClass('multiplier')
                            .on('click', function () {
                                _c.assign_workers(game, job, times);
                                _c.redraw_data(game);
                            })
                            .appendTo($td1);
                    } else {
                        var $inner = $('<div>')
                            .addClass('multiplier_holder')
                            .popover({title: title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                            .appendTo($td1);
                        $('<span>')
                            .text(times_text)
                            .appendTo($inner);
                        job.$holder = $('<span>')
                            .addClass('number')
                            .attr('id', 'job-' + job.name)
                            .text(amount)
                            .appendTo($inner);
                    }
                }
            });

            job.$display = $tr;
        });
    }

    function update_jobs_list(game) {
        var jobs_shown = false;
        _.each(game.game_options.populations, function (job) {

            var amount = game.data.populations[job.name];
            var assignable = _c.population_is_assignable(game, job, 1);
            var enabled;

            if (!job.shown_before && (assignable || amount)) {
                job.shown_before = true;
                job.$display.css({display: "block"});
            }
            if (job.shown_before) {
                jobs_shown = true;

                enabled = assignable;
                job.$holder.text(amount);

                _.each(assign_multiples, function (times) {
                    enabled = _c.population_is_assignable(game, job, times);
                    var $btn = job["$btn_x" + times];
                    if ($btn) {
                        var currently_disabled = $btn.prop('disabled');
                        if (!currently_disabled && !enabled) {
                            //Changing to disabled, so turn off any popovers
                            $btn.popover('hide');
                        }
                        $btn.prop({disabled: !enabled});
                    }
                });
            }
        });
        if (jobs_shown) {
            $pointers.jobs_list.find('h3').show();
        }
    }

    //------------------------------------------
    function show_upgrades_list(game) {
        var $available = $('<h3>')
            .text('Available Upgrades')
            .appendTo($pointers.upgrade_list);
        $("<div>")
            .appendTo($available);

        var $researched = $('<h3>')
            .text('Researched Upgrades')
            .appendTo($pointers.upgrade_list);
        $("<div>")
            .appendTo($researched);

        var lastStyle = '';
        //TODO: Show deity (and trade, conquest, trade) elsewhere
        var upgrades_non_deity = _.filter(game.game_options.upgrades, function (up) {
            return up.type != 'deity'
        });
        _.each(upgrades_non_deity, function (upgrade) {
            var name = _.str.titleize(upgrade.title || upgrade.name);
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            var title = "Upgrade: " + name;
            var description = _c.cost_benefits_text(game, upgrade, true);

            if (upgrade.type != lastStyle) {
                $('<div>')
                    .css({fontSize: '8px'})
                    .text(_.str.titleize(upgrade.type) + ":")
                    .appendTo($available);
            }
            lastStyle = upgrade.type;

            upgrade.$holder = $('<button>')
                .text(name)
                .css({display: has_upgrade ? 'none' : 'inline-block'})
                .prop({disabled: !can_purchase})
                .popover({title: title, content: description, trigger: 'hover', placement: 'top', html: true})
                .on('click', function () {
                    upgrade.$holder.popover('hide');
                    _c.purchase_upgrade(game, upgrade);
                    _c.redraw_data(game);
                })
                .addClass('icon upgrade_holder')
                .appendTo($available);

            upgrade.$holder_purchased = $('<div>')
                .text(name)
                .css({backgroundColor: 'lightgreen', display: has_upgrade ? 'inline-block' : 'none'})
                .popover({title: 'Purchased ' + title, content: description, trigger: 'hover', placement: 'top', html: true})
                .addClass('icon upgrade_holder')
                .appendTo($researched);
        });
    }

    function update_upgrade_list(game) {
        var upgrades_non_deity = _.filter(game.game_options.upgrades, function (up) {
            return up.type != 'deity'
        });
        _.each(upgrades_non_deity, function (upgrade) {
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            upgrade.$holder
                .css({display: has_upgrade ? 'none' : 'inline-block'})
                .prop({disabled: !can_purchase});

            upgrade.$holder_purchased
                .css({display: has_upgrade ? 'inline-block' : 'none'})
        });
    }

    //------------------------------------------
    function show_achievements_list(game) {
        $('<h3>')
            .text('Achievements')
            .appendTo($pointers.achievements_list);
        $("<div>")
            .appendTo($pointers.achievements_list);

        _.each(game.game_options.achievements, function (achievement) {
            var has_achievement = (game.data.achievements[achievement.name]);
            var color = has_achievement ? "#aaf" : "#faa";
            var name = _.str.titleize(achievement.title || achievement.name);
            var description = name + "<br/>" + (achievement.notes || "");
            description += has_achievement ? "<br/>You have this achievement" : "<br/>You have not achieved this yet";

            achievement.$holder = $('<div>')
                .text(name)
                .css({backgroundColor: color, display: 'inline-block'})
                .popover({title: 'Achievement', content: description, trigger: 'hover', placement: 'top', html: true})
                .addClass('achievement_holder')
                .appendTo($pointers.achievements_list);
        });
    }

    function update_achievements_list(game) {
        _.each(game.game_options.achievements, function (achievement) {
            var has_achievement = (game.data.achievements[achievement.name]);
            var color = has_achievement ? "#aaf" : "#faa";
            var name = _.str.titleize(achievement.title || achievement.name);
            var description = name + "<br/>" + (achievement.notes || "");
            description += has_achievement ? "<br/>You have this achievement" : "<br/>You have not achieved this yet";

            achievement.$holder
                .popover({title: 'Achievement', content: description, trigger: 'hover', placement: 'top', html: true})
                .css({backgroundColor: color, display: 'inline-block'})
        });
    }

    //-------------------------------------------------
    var _c = new Civvies('get_private_functions');
    _c.buildInitialDisplay = function (game) {
        $pointers.basic_resources = $('#basic_resources');
        show_basic_resources(game);

        $pointers.secondary_resources = $('#secondary_resources');
        show_secondary_resources(game);

        $pointers.building_list = $('#buildingsPane');
        show_building_buttons(game);

        $pointers.population_info = $('#populationContainer');
        show_population_data(game);

        $pointers.jobs_list = $('#jobsContainer');
        show_jobs_list(game);

        $pointers.logs = $('#eventsContainer');

        $pointers.upgrade_list = $('#upgradesPane');
        show_upgrades_list(game);

        $pointers.achievements_list = $('#achievementsList');
        show_achievements_list(game);
    };

    _c.redraw_data = function (game) {
        //TODO: Don't show these every time
        update_resources(game);
        update_building_buttons(game);
        update_population_data(game);
        update_jobs_list(game);
        update_upgrade_list(game);
        update_achievements_list(game);
    };

    _c.log_display = function (game) {
        if ($pointers.logs) {
            var log = "<b>Civvies: [seed:" + game.game_options.rand_seed + "]</b>";

            var head_log = _.last(game.timing_log, 5);
            _.each(head_log.reverse(), function (log_item) {
                if (log_item.name == 'exception') {
                    if (log_item.ex && log_item.ex.name) {
                        log += "<br/> -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                    } else if (log_item.msg) {
                        log += "<br/> -- EXCEPTION: " + log_item.msg;
                    } else {
                        log += "<br/> -- EXCEPTION";
                    }
                } else if (log_item.elapsed) {
                    log += "<br/> - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
                } else {
                    log += "<br/> - " + log_item.name;
                }
            });
            $pointers.logs.html(log);
        }
    };

    _c.updateBuildingTotals = function () {

    };
    _c.updateSpawnButtons = function () {

    };
    _c.updateJobs = function () {

    };
    _c.updateJobButtons = function () {

    };
    _c.updateUpgrades = function () {

    };
    _c.updateDeity = function () {

    };
    _c.updateOldDeities = function () {

    };
    _c.updateMobs = function () {

    };
    _c.updateDevotion = function () {

    };
    _c.updateRequirements = function () {

    };
    _c.updateAchievements = function () {

    };
    _c.updateParty = function () {

    };
    _c.updatePartyButtons = function () {

    };
    _c.updateTargets = function () {

    };
    _c.updateHappiness = function () {

    };
    _c.updateWonder = function () {

    };
    _c.updateWonderList = function () {

    };
    _c.updateReset = function () {

    };
    _c.paneSelect = function () {

    };
    _c.toggleCustomIncrements = function () {

    };
    _c.toggleNotes = function () {

    };
    _c.impExp = function () {

    };
    _c.tips = function () {

    };
    _c.versionAlert = function () {

    };
    _c.text = function () {

    };
    _c.textShadow = function () {

    };
    _c.iconToggle = function () {

    };
    _c.prettify = function () {

    };
    _c.toggleDelimiters = function () {

    };
    _c.toggleWorksafe = function () {

    };
    _c.gameLog = function () {

    };


})(Civvies);