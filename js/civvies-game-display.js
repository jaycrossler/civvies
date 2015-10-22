(function (Civvies) {

    var $pointers = {};

    var purchase_multiples = [1,10,100,1000];

    function show_basic_resources (game){
        $('<h3>')
            .text('Resources')
            .appendTo($pointers.basic_resources);
        var $table = $('<table>')
            .appendTo($pointers.basic_resources);

        _.each(game.game_options.resources, function(resource){
            if (resource.grouping == 1) {
                var name = _.str.titleize(resource.name);
                var $tr = $('<tr>')
                    .appendTo($table);
                var $td1 = $('<td>')
                    .appendTo($tr);
                var times = resource.amount_from_click || 1;
                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(resource, true, times);

                $('<button>')
                    .text('Gather ' + name)
                    .popover({title:"Manually Gather "+ title, content:description, trigger:'hover', placement:'bottom', html:true})
                    .on('click', function(){
                        _c.increment_from_click(game,resource);
                    })
                    .appendTo($td1);
                $('<td>')
                    .text(name + ":")
                    .appendTo($tr);
                resource.$holder = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-'+resource.name)
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
                    .attr('id', 'resource-max-'+resource.name)
                    .text("(Max: "+game.game_options.storage_initial+")")
                    .appendTo($tr);
                resource.$rate = $('<td>')
                    .addClass('number net')
                    .attr('id', 'resource-rate-'+resource.name)
                    .text("0/s")
                    .appendTo($tr);
            }
        });
    }
    function show_secondary_resources (game){
        $('<h3>')
            .text('Special Resources')
            .appendTo($pointers.secondary_resources);

        _.each(game.game_options.resources, function(resource){
            if (resource.grouping == 2) {
                var name = _.str.titleize(resource.name);

                var $div = $('<div>')
                    .addClass('icon resource-holder')
                    .appendTo($pointers.secondary_resources);
                $('<span>')
                    .text(name+":" )
                    .appendTo($div);
                resource.$holder = $('<span>')
                    .attr('id', 'resource-'+resource.name)
                    .text(0)
                    .appendTo($div);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($div);
            }
        });
    }
    function show_building_buttons (game) {
        $('<h3>')
            .text('Buildings')
            .hide()
            .appendTo($pointers.building_list);
        var $table = $('<table>')
            .appendTo($pointers.building_list);

        var lastStyle = game.game_options.buildings[0].type;

        _.each(game.game_options.buildings, function(building){
            var name = _.str.titleize(building.title || building.name);
            var amount = game.data.buildings[building.name];

            if (building.type != lastStyle) {
                $('<tr>')
                    .css({height:'6px'})
                    .appendTo($table);
            }
            lastStyle = building.type;

            var $tr = $('<tr>')
                .appendTo($table);
            if (!amount) $tr.hide();

            var $td1 = $('<td>')
                .appendTo($tr);
            _.each(purchase_multiples, function(times){
                var text = (times > 1) ? "x"+times : 'Build ' + name;
                var btn_class = (times > 1) ? "x"+times : '';

                var title = (times == 1) ? name : times + " " + Helpers.pluralize(name);
                var description = _c.cost_benefits_text(building, true, times);

                building["$btn_x"+times] = $('<button>')
                    .text(text)
                    .popover({title:"Build "+ title, content:description, trigger:'hover', placement:'bottom', html:true})
                    .prop({disabled:true})
                    .addClass(btn_class)
                    .on('click', function(){
                        _c.create_building(game, building, times);
                    })
                    .appendTo($td1);
            });
            $('<td>')//TODO: These aren't aligning properly
                .text(Helpers.pluralize(name)+": ")
                .appendTo($tr);
            building.$holder = $('<td>')
                .addClass('number')
                .attr('id', 'building-'+building.name)
                .text(amount)
                .appendTo($tr);
//            $('<td>')
//                .addClass('cost')
//                .text(_c.cost_benefits_text(building))
//                .appendTo($tr);

            building.$display = $tr;
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

    };

    _c.redraw_data = function(game) {
        _c.updateResources(game);
        _c.updateBuildingButtons(game);
    };

    _c.updateResources = function(game) {
        _.each(game.game_options.resources, function(resource) {
            if (resource.$holder) {
                var res_data = game.data.resources[resource.name];
                res_data = Helpers.abbreviateNumber(res_data);
                resource.$holder.text(res_data)
            }

            if (resource.$max) {
                var res_max = _c.getResourceMax(game, resource);
                res_max = Helpers.abbreviateNumber(res_max);
                resource.$max.text("(Max: "+res_max+")")
            }

            if (resource.$rate) {
                var res_rate = _c.getResourceRate(game, resource);
                resource.$rate.text(res_rate)
            }
        });

        _.each(game.game_options.buildings, function(building) {
            if (building.$holder) {
                var building_data = game.data.buildings[building.name];
                building_data = Helpers.abbreviateNumber(building_data);
                building.$holder.text(building_data)
            }
        });
    };

    _c.updateBuildingButtons = function (game) {
        var buildings_shown = false;
        _.each(game.game_options.buildings, function(building) {

            var purchasable = _c.building_is_purchasable(game, building, 1);
            var enabled;

            if (!building.shown_before && purchasable) {
                building.shown_before = true;
                building.$display.css({display:"block"});
            }
            if (building.shown_before) {
                buildings_shown = true;

                enabled = purchasable;
                _.each(purchase_multiples, function (times) {
                    enabled = _c.building_is_purchasable(game, building, times);
                    var $btn = building["$btn_x"+times];
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
    };

    _c.updateBuildingTotals = function () {

    };
    _c.updatePopulation = function () {

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