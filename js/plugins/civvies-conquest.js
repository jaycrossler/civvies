function build_ui_controls (game) {
    //Build a $ object that will be added to a div on the corresponding pane
    return $("<hr>");
}
function redraw_ui_controls (game) {

}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}},
    {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades:{masonry:true, domestication:true}},
    {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades:{writing:true, weaponry:true, shields:true}}
];
new Civvies('add_game_option', 'upgrades', upgrades);


//--Build a workflow that will show on a custom pane-------------
var workflow_conquest = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_conquest);

console.log('Conquest plugin loaded');
