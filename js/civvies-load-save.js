(function (Civvies) {

    var _c = new Civvies('get_private_functions');

    _c.autosave_if_time = function (game) {
        if (game.game_options.autosave) {
            game.data.autosave_counter = game.data.autosave_counter || 0;
            game.data.autosave_counter += 1;
            if (game.data.autosave_counter >= game.game_options.autosave_every) {
                _c.save(game, 'auto');
                game.data.autosave_counter = 0;
            }
        }
    };
    _c.load = function (game, loadType) {

    };
    _c.save = function (game, saveType) {
        console.log("Autosave");

    };
    _c.toggleAutosave = function (game, saveType) {

    };
    _c.deleteSave = function (game, saveType) {

    };
    _c.renameCiv = function (saveType) {

    };
    _c.renameRuler = function (saveType) {

    };
    _c.renameDeity = function (saveType) {

    };
    _c.reset = function (saveType) {

    };


})(Civvies);