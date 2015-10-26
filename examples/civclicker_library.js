var options = {
    rand_seed: Helpers.randInt(100000)
};

var wf1 = {name: 'deity', selection_pane: true, upgrade_categories: ['deity'], setup_function: function () {}, redraw_function: function () {}};
var wf2 = {name: 'conquest', selection_pane: true, upgrade_categories: ['weaponry'], setup_function: function () {
    return $("<hr>");
}, redraw_function: function () {}};
var wf3 = {name: 'trade', selection_pane: true, upgrade_categories: ['commerce'], setup_function: function () {}, redraw_function: function () {}};

new Civvies('add_game_option','workflows',wf1);
new Civvies('add_game_option','workflows',wf2);
new Civvies('add_game_option','workflows',wf3);

var game = new Civvies(options);
game.log(true);

//For testing
$(function () {
    $('h1').on('click', function () {
        game._private_functions.test(game);
    });
    $('#appellation').on('click', function () {
        game._private_functions.test2(game);
    });
});

var size = 1;
var worksafe, usingWords, elems;
var body = document.getElementsByTagName('body')[0];


function renameCiv() {
    //Prompts player, uses result as new civName
    var n = prompt('Please name your civilisation', game.data.civ_name);
    if (n != null) {
        game.data.civ_name = n;
        document.getElementById('civName').innerHTML = game.data.civ_name;
    }
}
function renameRuler() {
    //Prompts player, uses result as rulerName
    var n = prompt('What is your name?', game.data.ruler_name);
    if (n != null) {
        game.data.ruler_name = n;
        document.getElementById('rulerName').innerHTML = game.data.ruler_name;
    }
}
function renameDeity() {
    //Prompts player, uses result as deity.name - called when first getting a deity
    var n = prompt('Who do your people worship?', game.data.deity_name);
    if (n != null) {
        game.data.deity_name = n;
        updateDeity();
    }
}

function text(scale) {
    if (scale > 0) {
        size += 0.1 * scale;
        document.getElementById('smallerText').disabled = false;
    } else {
        if (size > 0.7) {
            size += 0.1 * scale;
            if (size <= 0.7) document.getElementById('smallerText').disabled = true;
        }
    }
    body.style.fontSize = size + "em";
}

function toggleWorksafe() {
    if (body.style.backgroundImage == 'none') {
        worksafe = false;
        body.style.backgroundImage = 'url("../images/civclicker/constable.jpg")';
        elems = document.getElementsByClassName('icon');
        if (!usingWords) {
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.visibility = 'visible';
            }
        }
    } else {
        worksafe = true;
        body.style.backgroundImage = 'none';
        elems = document.getElementsByClassName('icon');
        if (!usingWords) {
            for (var i = 0; i < elems.length; i++) {
                elems[i].style.visibility = 'hidden';
            }
        }
    }
}

