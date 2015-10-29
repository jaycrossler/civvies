function build_ui_controls (game) {
    //Build a $ object that will be added to a div on the corresponding pane
    return $("<hr>");
}
function redraw_ui_controls (game) {

}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "deity", type: 'deity', costs: {piety: 1000}, special: "choose deity", upgrades:{responsibility:true, writing: true}},
//  TODO: Figure out how to use type of deity - maybe a variable that can be chosen between options?
//  {name:"deityType"},

    {name: "lure", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "companion", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "comfort", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
    {name: "blessing", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "waste", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "stay", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
    {name: "riddle", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "throne", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "lament", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
    {name: "book", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "feast", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
    {name: "secrets", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}}
];
new Civvies('add_game_option', 'upgrades', upgrades);


var buildings = [
    {name: 'battleAltar', title: "Battle Altar", type: 'altar', costs: {devotion: 1, stone: 200, metal: 50, piety: 200}, upgrades:{deity:true}, dont_capture:true},
    {name: 'fieldsAltar', title: "Fields Altar", type: 'altar', costs: {devotion: 1, food: 500, wood: 500, stone: 200, piety: 200}, upgrades:{deity:true}, dont_capture:true},
    {name: 'underworldAltar', title: "Underworld Altar", type: 'altar', costs: {devotion: 1, stone: 200, piety: 200, corpses: 1}, upgrades:{deity:true}, dont_capture:true},
    {name: 'catAltar', title: "Cat Altar", type: 'altar', costs: {devotion: 1, herbs: 100, stone: 200, piety: 200}, upgrades:{deity:true}, dont_capture:true}
];
new Civvies('add_game_option', 'buildings', buildings);


//--Build a workflow that will show on a custom pane-------------
var workflow_deity = {name: 'deity', selection_pane: true, upgrade_categories: ['deity'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_deity);