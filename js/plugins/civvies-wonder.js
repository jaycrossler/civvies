(function (Civvies) {

//    var _c = new Civvies('get_private_functions');


//--Add special resource
    var resource = {name: 'wonder', grouping: 3, image: '../images/civclicker/piety.png', notes: "Created by Labourers working on a Wonder", value:10, dont_capture: true};
    new Civvies('add_game_option', 'resources', resource);

    var person = {name: 'labourers', type: 'medieval', consumes: {herbs: 10, leather: 10, metal: 10, piety: 10}, produces: {wonder: 1}, cull_order: 2}
    new Civvies('add_game_option', 'populations', person);


    new Civvies('add_game_option', 'achievements', {name: "seven", category: "wonder"});
    new Civvies('add_game_option', 'achievements', {name: "wonder", category: "wonder"});
    new Civvies('add_game_option', 'achievements', {name: "rushed", category: "wonder"});
    new Civvies('add_game_option', 'achievements', {name: "neverclick", title: "Never Click", category: "wonder"});

//--Build a workflow that will show on a custom pane-------------
    var workflow_conquest = {name: 'wonder', selection_pane: false};
    new Civvies('add_game_option', 'workflows', workflow_conquest);

})(Civvies);