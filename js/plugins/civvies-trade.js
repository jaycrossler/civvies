(function (Civvies) {

    var _c = new Civvies('get_private_functions');
    var $pointers_trade = {trade_buttons: [], traders: {}};

    //TODO: Have trader desired amount be based on resource

    function buy_resource_with_gold(game, resource, amount) {
        if (game.data.resources.gold > 0) {
            game.data.resources[resource.name] += amount;  //TODO: Resources that go over limit get reduced on tick clock
            game.data.resources.gold--;

            game.data.achievements.merchant = true;
        }
        _c.redraw_data(game);
    }

    function buy_gold_with_resource(game, resource, amount) {
        if (game.data.resources[resource.name] >= amount * 1000) {
            game.data.resources[resource.name] -= amount * 1000;
            game.data.resources.gold++;
            game.data.achievements.merchant = true;
        }
        _c.redraw_data(game);
    }

    function build_trade_buttons_ui_controls(game) {
        //Build a $ object that will be added to a div on the corresponding pane
        var $div = $('<div>');

        var resources = _.filter(game.game_options.resources, function (r) {
            return r.purchase_with_gold
        });
        _.each(resources, function (resource) {
            var $btn = $('<button>')
                .text('Buy ' + resource.purchase_with_gold + ' ' + Helpers.pluralize(resource.name))
                .addClass('tradeResource')
                .on('click', function () {
                    buy_resource_with_gold(game, resource, resource.purchase_with_gold)
                })
                .appendTo($div);
            $('<br>')
                .appendTo($div);
            $pointers_trade.trade_buttons.push($btn);
        });

        $pointers_trade.traders_holder = $('#jobsContainer').find('h3').first();

        return $div;
    }

    function redraw_active_trader_details(game) {
        for (var key in $pointers_trade.traders) {
            var $trader = $pointers_trade.traders[key];
            var trader = $pointers_trade.traders[key].trader;

            if (trader && $trader) {
                var $btn = $trader.find('button');
                var can_buy = (game.data.resources[trader.resource.name] >= (trader.desired_amount * 1000));
                $btn.prop('disabled', !can_buy);
            }
        }
    }

    function redraw_ui_controls(game) {
        _.each($pointers_trade.trade_buttons, function ($btn) {
            $btn.prop('disabled', (game.data.resources.gold < 1))
        });
    }

    function show_trader(game, trader) {
        var is_time_over = (trader.tick_started + trader.event_length) < game.data.tick_count;

        var $trader = $pointers_trade.traders[trader.tick_started];
        if (!$trader) {
            $pointers_trade.traders[trader.tick_started] = create_$trader_object(game, trader);
            $pointers_trade.traders[trader.tick_started].trader = trader;

            $pointers_trade.traders_holder.append($pointers_trade.traders[trader.tick_started]);
        }

        if (is_time_over) {
            remove_$trader_object(game, trader, $pointers_trade.traders[trader.tick_started]);
        }

        return !is_time_over;
    }

    function create_$trader_object(game, trader) {
        var res_names = Helpers.pluralize(trader.resource.name);
        var res_amount = Math.round(trader.desired_amount * 1000);
        var res_amount_text = Math.round(trader.desired_amount) + ",000";

        var can_buy = (game.data.resources[trader.resource.name] >= (trader.desired_amount * 1000));

        var msg = "A Trader is offering to purchase " + res_amount + " " + res_names + ' and will pay 1 gold for each set of them. ';
        var $div = $('<div>')
            .addClass('trader')
            .attr('title', msg);
        $('<span>')
            .html("Trader in town for a short while. ")
            .css({width: '220px', margin: '2px 10px'})
            .appendTo($div);
        $('<button>')
            .text("Sell " + res_amount_text + " " + res_names + " for 1 gold")
            .css({width: '220px', margin: '2px 10px'})
            .prop('disabled', !can_buy)
            .click(function () {
                buy_gold_with_resource(game, trader.resource, trader.desired_amount);
            })
            .appendTo($div);

        return $div;
    }

    function remove_$trader_object(game, trader, $trader) {
        $trader.remove();
    }

    function trader_comes_to_town(game) {
        var desired_amount = _c.randInt(60, game.game_options) + 5;
        var resource = _c.randOption(game.game_options.resources, game.game_options, game.game_options.resources.gold);
        var length = _c.randInt(25, game.game_options) + 5;

        var name = 'Trader from remote village';
        var trade_event = {status: 'active', type: 'trade', name: name,
            desired_amount: desired_amount, resource: resource,
            tick_started: game.data.tick_count, event_length: length};

        game.logMessage(name + " comes to purchase " + resource.name);
        game.data.events.push(trade_event);
    }

    function check_for_trader(game) {
        if (_c.random(game.game_options) < _c.variable(game, 'traderArrive')) {
            trader_comes_to_town(game);
        }

        //Process traders and get rid of old ones
        var activeTraders = _.filter(game.data.events, function (event) {
            return event.status == 'active';
        });
        _.each(activeTraders, function (event) {
            var is_trade_continuing = show_trader(game, event);
            if (!is_trade_continuing) {
                event.status = 'finished';
                event.tick_ended = game.data.tick_count;
            }
        });

        redraw_active_trader_details(game);
    }

//--Build some specialized upgrades-------------
    var upgrades = [
        {name: "trade", type: 'commerce', costs: {gold: 1}, upgrades: {writing: true}, variable_increase: {traderArrive: 0.003}},
        {name: "currency", type: 'commerce', costs: {gold: 10, ore: 1000}, upgrades: {writing: true, trade: true}, variable_increase: {traderArrive: 0.003}},
        {name: "commerce", type: 'commerce', costs: {gold: 100, piety: 10000}, upgrades: {currency: true, civilservice: true}, variable_increase: {traderArrive: 0.003}}
    ];
    new Civvies('add_game_option', 'upgrades', upgrades);

    new Civvies('add_game_option', 'functions_each_tick', check_for_trader);

//--Add special resource
    var resource = {name: 'gold', grouping: 2, image: '../images/civclicker/gold.png', notes: "Created from trading goods with Traders"};
    new Civvies('add_game_option', 'resources', resource);


    new Civvies('add_game_option', 'achievements', {name: "merchant", category: "trade"});

    new Civvies('add_game_option', 'variables', {name: "traderArrive", initial: 0.004, category: "trade"});

//--Build a workflow that will show on a custom pane-------------
    var workflow_upgrades = {name: 'trade', selection_pane: true, upgrade_categories: ['commerce'], setup_function: build_trade_buttons_ui_controls, redraw_function: redraw_ui_controls};
    new Civvies('add_game_option', 'workflows', workflow_upgrades);

})(Civvies);