var $pointers_trade = [];

function buy_resource_with_gold(game, resource, amount) {
    if (game.data.resources.gold > 0) {
        game.data.resources[resource.name] += resource.purchase_with_gold;
        game.data.resources.gold--;

        game.data.achievements.merchant = true;
    }
    _c.redraw_data(game);
}

function build_ui_controls(game) {
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
        $pointers_trade.push($btn);
    });

    return $div;
}
function redraw_ui_controls(game) {
    _.each($pointers_trade, function ($btn) {
        $btn.prop('disabled', (game.data.resources.gold < 1))
    });
}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "trade", type: 'commerce', costs: {gold: 1}, upgrades: {writing: true}},
    {name: "currency", type: 'commerce', costs: {gold: 10, ore: 1000}, upgrades: {writing: true, trade: true}},
    {name: "commerce", type: 'commerce', costs: {gold: 100, piety: 10000}, upgrades: {currency: true, civilservice: true}}
];
new Civvies('add_game_option', 'upgrades', upgrades);


//--Add special resource
var resource = {name: 'gold', grouping: 2, image: '../images/civclicker/gold.png', notes: "Created from trading goods with Traders"};
new Civvies('add_game_option', 'resources', resource);


new Civvies('add_game_option', 'achievements', {name: "merchant", category:"trade"});


//--Build a workflow that will show on a custom pane-------------
var workflow_upgrades = {name: 'trade', selection_pane: true, upgrade_categories: ['commerce'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_upgrades);
