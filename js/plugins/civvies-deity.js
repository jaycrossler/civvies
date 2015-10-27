function build_ui_controls (game) {
    //Build a $ object that will be added to a div on the corresponding pane
    return $("<hr>");
}
function redraw_ui_controls (game) {

}

//--Build some specialized upgrades-------------
var upgrades = [
    {name: "deity", type: 'deity', costs: {piety: 1000}, special: "choose deity", upgrades:{responsibility:true, writing: true}},
//  TODO: Figure out how to use this - maybe a variable?
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


//--Build a workflow that will show on a custom pane-------------
var workflow_deity = {name: 'deity', selection_pane: true, upgrade_categories: ['deity'], setup_function: build_ui_controls, redraw_function: redraw_ui_controls};
new Civvies('add_game_option', 'workflows', workflow_deity);