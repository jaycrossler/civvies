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
                var max = _c.getResourceMax(game, resource);

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
                    .addClass('number_small')
                    .attr('id', 'resource-max-' + resource.name)
                    .text("(Max: " + max + ")")
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
        $('<h3>')
            .text('Special Resources')
            .appendTo($pointers.secondary_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 2) {
                var name = _.str.titleize(resource.title || resource.name);
                var description = _c.cost_benefits_text(game, resource, false, 1);
                var max = _c.getResourceMax(game, resource);

                var $div = $('<div>')
                    .addClass('icon resource-holder')
                    .appendTo($pointers.secondary_resources);
                $('<span>')
                    .text(name + ":")
                    .css({verticalAlign: 'top'})
                    .appendTo($div);
                var $holder = $('<span>')
                    .css({display: 'inline-block'})
                    .appendTo($div);
                resource.$holder = $('<span>')
                    .attr('id', 'resource-' + resource.name)
                    .addClass('number')
                    .text(0)
                    .appendTo($holder);
                resource.$max = $('<span>')
                    .attr('id', 'resource-max-' + resource.name)
                    .addClass('number_small')
                    .text("(Max: " + max + ")")
                    .appendTo($holder);
                $('<img>')
                    .attr('src', resource.image)
                    .css({verticalAlign: 'top'})
                    .popover({title: name, content: description, trigger: 'hover', placement: 'right', html: false, container: $div})
                    .addClass('icon icon-lg')
                    .appendTo($div);

            }
        });
    }

    function update_resources(game) {
        var rates = _c.calculate_resource_rates(game);
        _.each(game.game_options.resources, function (resource) {
            if (resource.$holder) {
                var res_data = game.data.resources[resource.name];
                res_data = Helpers.abbreviateNumber(res_data, false, true);
                resource.$holder.text(res_data)
            }

            if (resource.$max) {
                var res_max = _c.getResourceMax(game, resource);
                res_max = Helpers.abbreviateNumber(res_max);
                resource.$max.text("(Max: " + res_max + ")")
            }

            if (resource.$rate) {
                var res_rate = Helpers.abbreviateNumber(rates[resource.name]) || 0;
                var rate_text;
                if (res_rate < 0) {
                    rate_text = '<span style="color:red">' + res_rate + '/s';
                } else if (res_rate > 0) {
                    rate_text = '<span style="color:green">+' + res_rate + '/s';
                } else {
                    rate_text = res_rate + '/s';
                }
                resource.$rate.html(rate_text); //TODO: Calculate if tick frequency not 1s
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
    function show_building_buttons(game, $pane_holder) {
        $('<h3>')
            .text('Buildings')
            .appendTo($pane_holder);
        var $table = $('<table>')
            .appendTo($pane_holder);

        var last_displayed_type = game.game_options.buildings[0].type;

        _.each(game.game_options.buildings, function (building) {
            var name = _.str.titleize(building.title || building.name);
            var amount = game.data.buildings[building.name];

            if (building.type != last_displayed_type) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            last_displayed_type = building.type;

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
                var tooltip_text = _c.cost_text(game, building, times);

                building["$btn_x" + times] = $('<button>')
                    .text(text)
                    .popover({title: "Build " + title, content: description, trigger: 'hover', placement: 'top', html: true})
                    .attr({title: tooltip_text})
                    .prop({disabled: true})
                    .addClass(btn_class)
                    .on('click', function () {
                        _c.create_building(game, building, times);
                    })
                    .appendTo($td1);
            });
            $('<td>')//TODO: UI: These aren't aligning properly, replace with divs
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
                if (building.$display) building.$display.css({display: "block"});
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
//        if (buildings_shown) {
//            $pointers.building_list.find('h3').show();
//        }
    }

    //------------------------------------------
    function show_population_data(game) {
        $('<h3>')
            .text('Population')
            .appendTo($pointers.population_info);

        var population = _c.population(game);
        var population_current = population.current;
        var population_max = population.max;
        var land_current = population.land_current;
        var land_max = population.land_max;

        var $d1 = $('<div>')
            .addClass('population_holder')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Current Population: ")
            .appendTo($d1);
        $pointers.population_current = $("<span>")
            .addClass('number')
            .text(population_current)
            .appendTo($d1);

        var $d2 = $('<div>')
            .addClass('population_holder')
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Maximum Population: ")
            .appendTo($d2);
        $pointers.population_max = $("<span>")
            .addClass('number')
            .text(population_max)
            .appendTo($d2);

        $('<br/>')
            .appendTo($pointers.population_info);

        var $d4 = $('<div>')
            .addClass('population_holder')
            .popover({title: "Population", content: "If there are more buildings that this land can hold, then population happiness will decrease.", placement: 'top', trigger: 'hover'})
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Current Land Use: ")
            .appendTo($d4);
        $pointers.land_current = $("<span>")
            .addClass('number')
            .text(land_current)
            .appendTo($d4);

        var $d5 = $('<div>')
            .addClass('population_holder')
            .popover({title: "Population", content: "If there are more buildings that this land can hold, then population happiness will decrease.", placement: 'top', trigger: 'hover'})
            .appendTo($pointers.population_info);
        $("<span>")
            .text("Maximum Land Use: ")
            .appendTo($d5);
        $pointers.land_max = $("<span>")
            .addClass('number')
            .text(land_max)
            .appendTo($d5);
        $('<br/>')
            .appendTo($pointers.population_info);
        $('<br/>')
            .appendTo($pointers.population_info);


        //Build create workers buttons
        var $d3 = $("<div>")
            .appendTo($pointers.population_info);
        _.each(purchase_multiples, function (times) {
            var $inner = $('<div>')
                .appendTo($d3);

            var text = (times > 1) ? "Create " + times + " workers" : "Create worker";

            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            var $btn = $('<button>')
                .text(text)
                .prop({disabled: true})
                .on('click', function () {
                    _c.create_workers(game, times);
                    _c.redraw_data(game);
                })
                .appendTo($inner);
            var $btn_text = $("<span>")
                .text(description)
                .appendTo($inner);

            if (times > 1) {
                $btn.hide();
                $btn_text.hide();
            }
            $pointers["create_workers_x" + times] = $btn;
            $pointers["create_workers_x" + times + "_cost"] = $btn_text;
        });
    }

    function update_population_data(game) {
        var population = _c.population(game);

        $pointers.population_current.text(population.current);
        $pointers.population_max.text(population.max);
        $pointers.land_current.text(population.land_current);
        $pointers.land_max.text(population.land_max);


        _.each(purchase_multiples, function (times) {
            var food_cost = _c.worker_food_cost(game, times);
            var description = "Consume " + food_cost + " food";

            var $btn = $pointers["create_workers_x" + times];
            var $btn_text = $pointers["create_workers_x" + times + "_cost"];

            if (population.current >= (times * 4)) {
                $btn.show();
                $btn_text.show();
            }

            $btn
                .prop({disabled: !_c.workers_are_creatable(game, times)});
            $btn_text
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

        var last_displayed_type = game.game_options.populations[0].type;
        _.each(game.game_options.populations, function (job) {
            var name = _.str.titleize(job.title || job.name);
            var amount = game.data.populations[job.name];

            if (job.type != last_displayed_type) {
                $('<tr>')
                    .css({height: '6px'})
                    .appendTo($table);
            }
            last_displayed_type = job.type;

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
                        var $btn = $('<button>')
                            .text(times_text)
                            .popover({title: "Assign " + title, content: description, trigger: 'hover', placement: 'bottom', html: true})
                            .prop({disabled: true})
                            .addClass('multiplier')
                            .on('click', function () {
                                _c.assign_workers(game, job, times);
                                _c.redraw_data(game);
                            })
                            .appendTo($td1);

                        if (times == 1 || times == -1) {
                            $btn.show();
                        } else {
                            $btn.hide();
                        }
                        job["$btn_x" + times] = $btn;

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

                        if (game.data.variables.highest_population >= (4 * Math.abs(times))) {
                            $btn.show();
                        }
                    }
                });
            }
        });
        if (jobs_shown) {
            $pointers.jobs_list.find('h3').show();
        }
    }

    //------------------------------------------
    function show_upgrades_list(game, pane, workflow) {
        var workflow_title = '';
        var upgrade_grouping = 'basic';
        if (workflow) {
            workflow_title = _.str.titleize(workflow.title || workflow.name);
            upgrade_grouping = workflow.name;
        }
        var text_upgrade = 'Available ' + workflow_title + ' upgrades';
        var text_upgrade_no = 'No ' + workflow_title + ' upgrades currently available';
        var text_upgraded = 'Researched ' + workflow_title + ' upgrades';
        var text_upgraded_no = 'No ' + workflow_title + ' upgrades have been researched';


        pane.upgrade_available = $('<h4>')
            .text(text_upgrade)
            .appendTo(pane.content);
        $("<div>")
            .appendTo(pane.upgrade_available);
        pane.upgrade_available_alt = $('<h4>')
            .text(text_upgrade_no)
            .hide()
            .appendTo(pane.content);

        //If workflow was passed in and it has a draw function, call it and add to the pane
        if (workflow && workflow.setup_function) {
            var $setup = workflow.setup_function(game);
            if ($setup) {
                pane.workflow_content = $('<div>').appendTo(pane.content);
                $setup.appendTo(pane.workflow_content);
            }
        }

        pane.upgrade_researched = $('<h4>')
            .text(text_upgraded)
            .appendTo(pane.content);
        $("<div>")
            .appendTo(pane.upgrade_researched);
        pane.upgrade_researched_alt = $('<h4>')
            .text(text_upgraded_no)
            .hide()
            .appendTo(pane.content);

        var last_displayed_type = '';
        var $last_displayed_type_div;
        var number_available = 0;
        var number_purchased = 0;

        //Show all upgrade categories associated with this workflow, or all the others if not a workflow
        var upgrades_to_show = workflow ? _c.upgrades_in_workflow(game, workflow) || [] : _c.upgrades_not_in_workflows(game);
        _.each(upgrades_to_show, function (upgrade) {
            var name = _.str.titleize(upgrade.title || upgrade.name);
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            var title = "Upgrade: " + name;
            var description = _c.cost_benefits_text(game, upgrade, true);

            if (upgrade.type != last_displayed_type) {
                $last_displayed_type_div = $('<div>')
                    .css({fontSize: '9px'})
                    .hide()
                    .text(_.str.titleize(upgrade.type) + ":")
                    .appendTo(pane.upgrade_available);
            }
            last_displayed_type = upgrade.type;

            var show_purchasable = false;
            if (upgrade.shown_before) {
                show_purchasable = !has_upgrade;
            } else {
                if (can_purchase) {
                    show_purchasable = !has_upgrade;
                    upgrade.shown_before = true;
                }
            }
            if (show_purchasable) {
                $last_displayed_type_div.show();
                number_available++;
            }
            if (has_upgrade) {
                number_purchased++;
            }

            upgrade.$holder_category = $last_displayed_type_div;
            upgrade.$holder = $('<button>')
                .text(name)
                .css({display: show_purchasable ? 'inline-block' : 'none'})
                .prop({disabled: !can_purchase})
                .popover({title: title, content: description, trigger: 'hover', placement: 'top', html: true})
                .on('click', function () {
                    upgrade.$holder.popover('hide');
                    _c.purchase_upgrade(game, upgrade);
                    _c.redraw_data(game);
                })
                .addClass('icon upgrade_holder')
                .appendTo(pane.upgrade_available);

            upgrade.$holder_purchased = $('<div>')
                .text(name)
                .css({backgroundColor: 'lightgreen', display: has_upgrade ? 'inline-block' : 'none'})
                .popover({title: 'Purchased ' + title, content: description, trigger: 'hover', placement: 'top', html: true})
                .addClass('icon upgrade_holder')
                .appendTo(pane.upgrade_researched);
        });
        if (number_available > 0) {
            pane.upgrade_available.show();
            pane.upgrade_available_alt.hide();
        } else {
            pane.upgrade_available.hide();
            pane.upgrade_available_alt.show();
        }
        if (number_purchased > 0) {
            pane.upgrade_researched.show();
            pane.upgrade_researched_alt.hide();
        } else {
            pane.upgrade_researched.hide();
            pane.upgrade_researched_alt.show();
        }

    }

    function update_upgrade_list(game, pane, workflow) {
        var count_of_categories = 0;
        var last_displayed_type = '';
        var number_available = 0;
        var number_purchased = 0;

        //Redraw all upgrade categories associated with this workflow, or all the others if not a workflow
        var upgrades_to_show = workflow ? _c.upgrades_in_workflow(game, workflow) || [] : _c.upgrades_not_in_workflows(game);
        _.each(upgrades_to_show, function (upgrade) {
            var has_upgrade = game.data.upgrades[upgrade.name];
            var can_purchase = _c.can_purchase_upgrade(game, upgrade);

            var show_purchasable = false;
            if (upgrade.shown_before) {
                show_purchasable = !has_upgrade;
            } else {
                if (can_purchase) {
                    show_purchasable = !has_upgrade;
                    upgrade.shown_before = true;
                }
            }

            if (show_purchasable) {
                if (upgrade.$holder_category) upgrade.$holder_category.show();
                count_of_categories++;
                number_available++;
            }
            if (has_upgrade) {
                number_purchased++;
            }
            upgrade.$holder
                .css({display: show_purchasable ? 'inline-block' : 'none'})
                .prop({disabled: !can_purchase});

            upgrade.$holder_purchased
                .css({display: has_upgrade ? 'inline-block' : 'none'});


            if (upgrade.type != last_displayed_type) {
                // New category
                if (count_of_categories == 0) {
                    if (upgrade.$holder_category) upgrade.$holder_category.hide();
                }
                count_of_categories = 0;
            }
            last_displayed_type = upgrade.type;

        });
        if (number_available > 0) {
            pane.upgrade_available.show();
            pane.upgrade_available_alt.hide();
        } else {
            pane.upgrade_available.hide();
            pane.upgrade_available_alt.show();
        }
        if (number_purchased > 0) {
            pane.upgrade_researched.show();
            pane.upgrade_researched_alt.hide();
        } else {
            pane.upgrade_researched.hide();
            pane.upgrade_researched_alt.show();
        }

        //If there is a workflow passed in, redraw info within it
        if (workflow && workflow.redraw_function) {
            workflow.redraw_function(game, pane.workflow_content);
        }
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

    function select_workflow_pane(pane_selected) {
        //Called when user switches between the various panes on the left hand side of the interface

        _.each($pointers.panes, function(pane){
            if (pane == pane_selected) {
                pane.title.addClass('selected');
                pane.content.show();
            } else {
                pane.title.removeClass('selected');
                pane.content.hide();
            }
        });
    }

    //------------------------------------------
    function show_settings(game, $holder) {
        var $div_settings = $('<div>')
            .attr('id','settings')
            .appendTo($holder);

        var $div_stats = $('<div>')
            .attr('id','stats')
            .appendTo($holder);

        $('<h3>')
            .text('Settings')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.save(game, 'manual');
            })
            .text('Manual Save')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.toggleAutosave(game);
            })
            .text('Toggle AutoSave')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.load(game, 'localStorage');
            })
            .text('Manual Load')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.reset(game);
            })
            .text('Reset Game to gain new deities')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.deleteSave(game);
            })
            .text('Delete saved games')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.rename_game_object(game, 'civ');
            })
            .text('Rename Civilization')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.rename_game_object(game, 'ruler');
            })
            .text('Rename Ruler')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.rename_game_object(game, 'deity');
            })
            .text('Rename Deity')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.text(-1);
            })
            .text('Smaller Text')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.text(1);
            })
            .text('Larger Text')
            .appendTo($div_settings);
        $('<button>')
            .on('click', function () {
                _c.toggleWorksafe();
            })
            .text('Toggle Worksafe mode')
            .appendTo($div_settings);


        $('<h3>')
            .text('Stats')
            .appendTo($div_stats);

        var $d1 = $('<div>')
            .appendTo($div_stats);
        $('<span>')
            .text('Happiness: ')
            .appendTo($d1);
        $('<span>')
            .text('Content')
            .css({color: 'blue'})
            .appendTo($d1);

    }

    //------------------------------------------
    var _c = new Civvies('get_private_functions');
    _c.buildInitialDisplay = function (game) {
        $pointers.basic_resources = $('#basic_resources').empty();
        show_basic_resources(game);

        $pointers.secondary_resources = $('#secondary_resources').empty();
        show_secondary_resources(game);

        $pointers.population_info = $('#populationContainer').empty();
        show_population_data(game);

        $pointers.jobs_list = $('#jobsContainer').empty();
        show_jobs_list(game);

        $pointers.logs = $('#eventsContainer').empty();

        $pointers.achievements_list = $('#achievementsList').empty();
        show_achievements_list(game);

        //====Build Panes======
        $pointers.workflow_panes = $('#panesSelectors').empty();
        var $titles = $('<div>')
            .attr('id','selectors')
            .appendTo($pointers.workflow_panes);
        var $content = $('<div>')
            .appendTo($pointers.workflow_panes);

        $pointers.panes = {};

        //---Buildings----
        $pointers.panes.buildings = {};
        $pointers.panes.buildings.title = $('<div>')
            .text('Buildings')
            .addClass('paneSelector selected')
            .on('click', function(){select_workflow_pane($pointers.panes.buildings)})
            .appendTo($titles);
        $pointers.panes.buildings.content = $('<div>')
            .appendTo($content);
        show_building_buttons(game, $pointers.panes.buildings.content);

        //---Basic Upgrades----
        $pointers.panes.upgrades = {};
        $pointers.panes.upgrades.show_upgrades = true;
        $pointers.panes.upgrades.title = $('<div>')
            .text('Upgrades')
            .addClass('paneSelector')
            .on('click', function(){select_workflow_pane($pointers.panes.upgrades)})
            .appendTo($titles);
        $pointers.panes.upgrades.content = $('<div>')
            .hide()
            .appendTo($content);
        show_upgrades_list(game, $pointers.panes.upgrades);


        //---Worflow panes----
        var panes = _.filter(game.game_options.workflows, function (w) {
            return w.selection_pane == true
        });
        _.each(panes, function (workflow) {
            var name = workflow.name;
            $pointers.panes[name] = {};
            $pointers.panes[name].show_upgrades = true;
            $pointers.panes[name].workflow = workflow;
            $pointers.panes[name].title = $('<div>')
                .text(_.str.titleize(workflow.title || workflow.name))
                .addClass('paneSelector')
                .on('click', function(){select_workflow_pane($pointers.panes[name])})
                .appendTo($titles);
            $pointers.panes[name].content = $('<div>')
                .hide()
                .appendTo($content);
            show_upgrades_list(game, $pointers.panes[name], workflow);
        });

        //---Stats and Settings----
        $pointers.panes.stats = {};
        $pointers.panes.stats.title = $('<div>')
            .text('Settings')
            .addClass('paneSelector')
            .on('click', function(){select_workflow_pane($pointers.panes.stats)})
            .appendTo($titles);
        $pointers.panes.stats.content = $('<div>')
            .hide()
            .appendTo($content);
        show_settings(game, $pointers.panes.stats.content);

        $('<br>')
            .appendTo($titles);
    };



    _c.redraw_data = function (game) {
        //TODO: OPTIMIZATION: Don't show these every tick, only when content is modified
        update_resources(game);
        update_building_buttons(game);
        update_population_data(game);
        update_jobs_list(game);

        _.each($pointers.panes, function(pane){
            if (pane.show_upgrades) {
                update_upgrade_list(game, pane, pane.workflow);
            }
        });

        update_achievements_list(game, $pointers.upgrade_list);
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

    //------------------------------------------


    _c.rename_game_object = function(game, type) {
        //Prompts player, uses result as new civName
        var n;

        if (type == 'civ') {
            n = prompt('Please name your civilisation', game.data.civ_name);
            if (n != null) {
                game.data.civ_name = n;
                $('#civName').text(game.data.civ_name);
            }
        } else if (type == 'ruler') {
            n = prompt('What is your name?', game.data.ruler_name);
            if (n != null) {
                game.data.ruler_name = n;
                $('#rulerName').text(game.data.ruler_name);
            }
        } else if (type == 'deity') {
            n = prompt('Who do your people worship?', game.data.deity_name);
            if (n != null) {
                game.data.deity_name = n;
                $('#civName').text(game.data.deity_name);
            }
        }
    };

    var font_size = 1;
    _c.text = function(scale) {
        if (scale > 0) {
            font_size += 0.1 * scale;
        } else {
            if (font_size > 0.7) {
                font_size += 0.1 * scale;
            }
        }
        $('body').css('fontSize', font_size + "em");
    };

    _c.toggleWorksafe = function() {
        var $body = $('body');
        $('.icon').toggle();

        $body.css('backgroundImage', $body.css('backgroundImage') == 'none' ? 'url("../images/civclicker/constable.jpg")' : 'none');
    };

//    _c.updateBuildingTotals = function () {
//
//    };
//    _c.updateSpawnButtons = function () {
//
//    };
//    _c.updateJobs = function () {
//
//    };
//    _c.updateJobButtons = function () {
//
//    };
//    _c.updateUpgrades = function () {
//
//    };
//    _c.updateDeity = function () {
//
//    };
//    _c.updateOldDeities = function () {
//
//    };
//    _c.updateMobs = function () {
//
//    };
//    _c.updateDevotion = function () {
//
//    };
//    _c.updateRequirements = function () {
//
//    };
//    _c.updateAchievements = function () {
//
//    };
//    _c.updateParty = function () {
//
//    };
//    _c.updatePartyButtons = function () {
//
//    };
//    _c.updateTargets = function () {
//
//    };
//    _c.updateHappiness = function () {
//
//    };
//    _c.updateWonder = function () {
//
//    };
//    _c.updateWonderList = function () {
//
//    };
//    _c.updateReset = function () {
//
//    };
//    _c.paneSelect = function () {
//
//    };
//    _c.toggleCustomIncrements = function () {
//
//    };
//    _c.toggleNotes = function () {
//
//    };
//    _c.impExp = function () {
//
//    };
//    _c.tips = function () {
//
//    };
//    _c.versionAlert = function () {
//
//    };
//    _c.text = function () {
//
//    };
//    _c.textShadow = function () {
//
//    };
//    _c.iconToggle = function () {
//
//    };
//    _c.prettify = function () {
//
//    };
//    _c.toggleDelimiters = function () {
//
//    };
//    _c.toggleWorksafe = function () {
//
//    };
//    _c.gameLog = function () {
//
//    };


})(Civvies);