(function (Civvies) {

//    var _c = new Civvies('get_private_functions');

//--Build some specialized upgrades-------------
    var jobs = [
        {name: 'cats', type: 'mystical', cull_order: 11, unassignable: true},  //Cats can only be captured from invading others
        {name: 'zombies', type: 'mystical', costs: {corpses: 1}, doesnt_consume_food: true, unassignable: true, dont_capture: true}
    ];
    new Civvies('add_game_option', 'populations', jobs);
    new Civvies('add_game_option', 'achievements', {name: "cat", title: "Cat!", category: "zombies"});
    new Civvies('add_game_option', 'achievements', {name: "glaring", category: "zombies"});
    new Civvies('add_game_option', 'achievements', {name: "clowder", category: "zombies"});

//--Build a workflow that doesn't show anywhere-------------
    var workflow_conquest = {name: 'zombies', selection_pane: false, upgrade_categories: []};
    new Civvies('add_game_option', 'workflows', workflow_conquest);

})(Civvies);