//--Add special resource
var resource = {name: 'wonder', grouping: 3, image: '../images/civclicker/piety.png', notes: "Created by Labourers working on a Wonder"};
new Civvies('add_game_option', 'resources', resource);

//--Build a workflow that will show on a custom pane-------------
var workflow_conquest = {name: 'wonder', selection_pane: false};
new Civvies('add_game_option', 'workflows', workflow_conquest);