var options = {
    rand_seed: Helpers.randInt(100000)
};

var wf1 = {name: 'deity', selection_pane: true, upgrade_categories: ['deity'], setup_function: function () {}, redraw_function: function () {}};
var wf2 = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: function () {
    return $("<hr>");
}, redraw_function: function () {}};
var wf3 = {name: 'trade', selection_pane: true, upgrade_categories: ['commerce'], setup_function: function () {}, redraw_function: function () {}};

new Civvies('add_game_option', 'workflows', wf1);
new Civvies('add_game_option', 'workflows', wf2);
new Civvies('add_game_option', 'workflows', wf3);

var game = new Civvies(options);
game.log(true); //Show basic log to console

//For testing
$(function () {
    $('h1').on('click', function () {
        game._private_functions.test(game);
    });
    $('#appellation').on('click', function () {
        game._private_functions.test2(game);
    });
});