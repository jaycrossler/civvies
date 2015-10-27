function build_ui_controls(game) {
    //Build a $ object that will be added to a div on the corresponding pane
    return $("<hr>");
}
function redraw_ui_controls(game) {

}

function run_battle_state(game) {
    console.log('test battle');
}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
    {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}},
    {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades: {masonry: true, domestication: true}},
    {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades: {writing: true, weaponry: true, shields: true}}
];
new Civvies('add_game_option', 'upgrades', upgrades);

//--Buildings---------------------------------
var buildings = [
    {name: 'barracks', type: 'business', costs: {food: 20, wood: 60, stone: 120}, supports: {soldiers: 5, gold:2}, upgrades: {weaponry: true, masonry:true}},
    {name: 'stable', type: 'business', costs: {food: 60, wood: 60, stone: 120, leather: 10}, supports: {cavalry: 5}, upgrades: {horseback: true}},
    {name: 'fortification', type: 'upgrade', costs: {stone: 100}, options: {defense_improvement: 5}, supports: {gold: 10}, notes: "Improves Defenses", upgrades: {codeoflaws: true, palisade: true}}
];
new Civvies('add_game_option', 'buildings', buildings);

//--Variables---------------------------------
new Civvies('add_game_option', 'variables', {name: "soldiers", initial: 0.05});
new Civvies('add_game_option', 'variables', {name: "cavalry", initial: 0.08});


//--Add some jobs for warriors---------------
var jobs = [
    {name: 'soldiers', type: 'warfare', consumes: {food: 2}, supports: {battle: "soldiers"}, upgrades: {}, cull_order: 8},
    {name: 'cavalry', type: 'warfare', consumes: {food: 1, herbs: 1}, supports: {battle: "cavalry"}, upgrades: {horseback: true}, cull_order: 7},
    {name: 'siege', type: 'warfare', costs: {metal: 10, wood: 100}, supports: {battle: .1}, upgrades: {construction: true, mathematics: true}, doesnt_require_office: true, doesnt_consume_food: true, achievement: 'siege'}
];
new Civvies('add_game_option', 'populations', jobs);

//Add a new set of variables to track armies
new Civvies('set_game_option', 'armies', [
    {name: 'home army'}
]);
new Civvies('add_game_option', 'arrays_to_map_to_arrays', 'armies');


//Add a new function to process ongoing battles
new Civvies('add_game_option', 'functions_each_tick', run_battle_state);


//--Build a workflow that will show on a custom pane-------------
var workflow_conquest = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_conquest);