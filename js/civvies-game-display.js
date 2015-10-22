(function (Civvies) {

    var $pointers = {};

    var purchase_multiples = [1, 10, 100, 1000];
    var assign_multiples = ['-all', -100, -10, -1, 'info', 1, 10, 100, '+max'];

    function show_basic_resources(game) {
        $('<h3>')
            .text('Resources')
            .appendTo($pointers.basic_resources);
        var $table = $('<table>')
            .appendTo($pointers.basic_resources);

        _.each(game.game_options.resources, function (resource) {
            if (resource.grouping == 1) {
                var name = _.str.titleize(resource.name);
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
                var name = _.str.titleize(resource.name);

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
                var res_rate = _c.getResourceRate(game, resource);
                resource.$rate.text(res_rate)
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

                if (show){
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

//
//    <div id="jobsContainer">
//        <h3>Jobs</h3>
//        <table id="jobs">
//            <tr id="customJobIncrement">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td>Increment:</td>
//                <td><input id="jobCustom" type="number" min="1" step="1" value="1"></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note"></span></td>
//            </tr>
//            <tr id="unempgroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td>Unemployed: </td>
//                <td class="number"><span id="unemployed">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note">Unassigned Workers</span></td>
//            </tr>
//            <tr id="sickGroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td>Sick: </td>
//                <td class="number"><span id="sickTotal">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note">Sick workers</span></td>
//            </tr>
//            <tr id="farmergroup">
//                <td class="jobNone"><button onmousedown="fireAll('farmers');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('farmers');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('farmers',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('farmers',10);">-10</button></td>
//                <td><button onmousedown="fire('farmers',1);">&lt;</button></td>
//                <td class="job">Farmers: </td>
//                <td class="number"><span id="farmers">0</span></td>
//                <td><button onmousedown="hire('farmers',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('farmers',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('farmers',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('farmers');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('farmers');">Max</button></td>
//                <td><span class="note">Automatically gather food</span></td>
//            </tr>
//            <tr id="woodcuttergroup">
//                <td class="jobNone"><button onmousedown="fireAll('woodcutters');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('woodcutters');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('woodcutters',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('woodcutters',10);">-10</button></td>
//                <td><button onmousedown="fire('woodcutters',1);">&lt;</button></td>
//                <td class="job">Woodcutters: </td>
//                <td class="number"><span id="woodcutters">0</span></td>
//                <td><button onmousedown="hire('woodcutters',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('woodcutters',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('woodcutters',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('woodcutters');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('woodcutters');">Max</button></td>
//                <td><span class="note">Automatically gather wood</span></td>
//            </tr>
//            <tr id="minergroup">
//                <td class="jobNone"><button onmousedown="fireAll('miners');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('miners');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('miners',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('miners',10);">-10</button></td>
//                <td><button onmousedown="fire('miners',1);">&lt;</button></td>
//                <td class="job">Miners: </td>
//                <td class="number"><span id="miners">0</span></td>
//                <td><button onmousedown="hire('miners',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('miners',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('miners',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('miners');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('miners');">Max</button></td>
//                <td><span class="note">Automatically gather stone</span></td>
//            </tr>
//            <tr id="tannergroup">
//                <td class="jobNone"><button onmousedown="fireAll('tanners');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('tanners');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('tanners',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('tanners',10);">-10</button></td>
//                <td><button onmousedown="fire('tanners',1);">&lt;</button></td>
//                <td class="job">Tanners: </td>
//                <td class="number"><span id="tanners">0</span></td>
//                <td><button onmousedown="hire('tanners',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('tanners',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('tanners',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('tanners');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('tanners');">Max</button></td>
//                <td><span class="note">Convert skins to leather</span></td>
//            </tr>
//            <tr id="blacksmithgroup">
//                <td class="jobNone"><button onmousedown="fireAll('blacksmiths');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('blacksmiths');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('blacksmiths',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('blacksmiths',10);">-10</button></td>
//                <td><button onmousedown="fire('blacksmiths',1);">&lt;</button></td>
//                <td class="job">Blacksmiths: </td>
//                <td class="number"><span id="blacksmiths">0</span></td>
//                <td><button onmousedown="hire('blacksmiths',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('blacksmiths',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('blacksmiths',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('blacksmiths');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('blacksmiths');">Max</button></td>
//                <td><span class="note">Convert ore to metal</span></td>
//            </tr>
//            <tr id="apothecarygroup">
//                <td class="jobNone"><button onmousedown="fireAll('apothecaries');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('apothecaries');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('apothecaries',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('apothecaries',10);">-10</button></td>
//                <td><button onmousedown="fire('apothecaries',1);">&lt;</button></td>
//                <td class="job">Apothecaries: </td>
//                <td class="number"><span id="apothecaries">0</span></td>
//                <td><button onmousedown="hire('apothecaries',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('apothecaries',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('apothecaries',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('apothecaries');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('apothecaries');">Max</button></td>
//                <td><span class="note">Cure sick workers</span></td>
//            </tr>
//            <tr id="clericgroup">
//                <td class="jobNone"><button onmousedown="fireAll('clerics');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('clerics');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('clerics',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('clerics',10);">-10</button></td>
//                <td><button onmousedown="fire('clerics',1);">&lt;</button></td>
//                <td class="job">Clerics: </td>
//                <td class="number"><span id="clerics">0</span></td>
//                <td><button onmousedown="hire('clerics',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('clerics',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('clerics',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('clerics');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('clerics');">Max</button></td>
//                <td><span class="note">Generate piety, bury corpses</span></td>
//            </tr>
//            <tr id="labourergroup">
//                <td class="jobNone"><button onmousedown="fireAll('labourers');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('labourers');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('labourers',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('labourers',10);">-10</button></td>
//                <td><button onmousedown="fire('labourers',1);">&lt;</button></td>
//                <td class="job">Labourers: </td>
//                <td class="number"><span id="labourers">0</span></td>
//                <td><button onmousedown="hire('labourers',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('labourers',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('labourers',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('labourers');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('labourers');">Max</button></td>
//                <td><span class="note">Use resources to build wonder</span></td>
//            </tr>
//            <tr id="soldiergroup">
//                <td class="jobNone"><button onmousedown="fireAll('soldiers');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('soldiers');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('soldiers',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('soldiers',10);">-10</button></td>
//                <td><button onmousedown="fire('soldiers',1);">&lt;</button></td>
//                <td class="job">Soldiers: </td>
//                <td class="number"><span id="soldiers">0</span></td>
//                <td><button onmousedown="hire('soldiers',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('soldiers',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('soldiers',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('soldiers');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('soldiers');">Max</button></td>
//                <td><span class="cost">10 metal, 10 leather</span><span class="note">: Protect from attack</span></td>
//            </tr>
//            <tr id="cavalrygroup">
//                <td class="jobNone"><button onmousedown="fireAll('cavalry');">-All</button></td>
//                <td class="jobCustom"><button onmousedown="fireCustom('cavalry');">-Custom</button></td>
//                <td class="job100"><button onmousedown="fire('cavalry',100);">-100</button></td>
//                <td class="job10"><button onmousedown="fire('cavalry',10);">-10</button></td>
//                <td><button onmousedown="fire('cavalry',1);">&lt;</button></td>
//                <td class="job"><span id="cavName">Cavalry</span>: </td>
//                <td class="number"><span id="cavalry">0</span></td>
//                <td><button onmousedown="hire('cavalry',1);">&gt;</button></td>
//                <td class="job10"><button onmousedown="hire('cavalry',10);">+10</button></td>
//                <td class="job100"><button onmousedown="hire('cavalry',100);">+100</button></td>
//                <td class="jobCustom"><button onmousedown="hireCustom('cavalry');">+Custom</button></td>
//                <td class="jobAll"><button onmousedown="hireAll('cavalry');">Max</button></td>
//                <td><span class="cost">20 food, 20 leather</span><span class="note">: Protect from attack</span></td>
//            </tr>
//            <tr id="shadesgroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td>Shades: </td>
//                <td class="number"><span id="shades">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note">Insubstantial spirits</span></td>
//            </tr>
//            <tr id="wolfgroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td class="enemy">Wolves: </td>
//                <td class="number"><span id="wolves">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note"></span></td>
//            </tr>
//            <tr id="banditgroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td class="enemy">Bandits: </td>
//                <td class="number"><span id="bandits">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note"></span></td>
//            </tr>
//            <tr id="barbariangroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td class="enemy">Barbarians: </td>
//                <td class="number"><span id="barbarians">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note"></span></td>
//            </tr>
//            <tr id="esiegegroup">
//                <td class="jobNone"></td>
//                <td class="jobCustom"></td>
//                <td class="job100"></td>
//                <td class="job10"></td>
//                <td></td>
//                <td class="enemy">Siege Engines: </td>
//                <td class="number"><span id="esiege">0</span></td>
//                <td></td>
//                <td class="job10"></td>
//                <td class="job100"></td>
//                <td class="jobCustom"></td>
//                <td class="jobAll"></td>
//                <td><span class="note"></span></td>
//            </tr>
//        </table>
//    </div>


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

    };

    _c.redraw_data = function (game) {
        update_resources(game);
        update_building_buttons(game);
        update_population_data(game);
        update_jobs_list(game);
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