var options = {
    rand_seed: Helpers.randInt(100000)
};

var game;
$(function () {

    console.log("Create a Civvies game");
    game = new Civvies(options);
    game.log(true); //Show basic log to console


//For testing
    $('h1').on('click', function () {
        game._private_functions.test(game);
    });
    $('#appellation').on('click', function () {
        game._private_functions.test2(game);
    });
});