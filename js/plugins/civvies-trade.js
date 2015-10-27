function build_ui_controls(game) {
    //Build a $ object that will be added to a div on the corresponding pane
    return $("<hr>");
}
function redraw_ui_controls(game) {

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


//--Build a workflow that will show on a custom pane-------------
var workflow_upgrades = {name: 'trade', selection_pane: true, upgrade_categories: ['commerce'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_upgrades);
