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

function paneSelect(name) {
    //Called when user switches between the various panes on the left hand side of the interface
    if (name == 'buildings') {
        document.getElementById("buildingsPane").style.display = "block";
        document.getElementById("upgradesPane").style.display = "none";
        document.getElementById("deityPane").style.display = "none";
        document.getElementById("conquestPane").style.display = "none";
        document.getElementById("tradePane").style.display = "none";
        document.getElementById("statsPane").style.display = "none";

        document.getElementById("selectBuildings").className = "paneSelector selected";
        document.getElementById("selectUpgrades").className = "paneSelector";
        document.getElementById("selectDeity").className = "paneSelector";
        document.getElementById("selectConquest").className = "paneSelector";
        document.getElementById("selectTrade").className = "paneSelector";
        document.getElementById("selectStats").className = "paneSelector";
    }
    if (name == 'upgrades') {
        document.getElementById("buildingsPane").style.display = "none";
        document.getElementById("upgradesPane").style.display = "block";
        document.getElementById("deityPane").style.display = "none";
        document.getElementById("conquestPane").style.display = "none";
        document.getElementById("tradePane").style.display = "none";
        document.getElementById("statsPane").style.display = "none";

        document.getElementById("selectBuildings").className = "paneSelector";
        document.getElementById("selectUpgrades").className = "paneSelector selected";
        document.getElementById("selectDeity").className = "paneSelector";
        document.getElementById("selectConquest").className = "paneSelector";
        document.getElementById("selectTrade").className = "paneSelector";
        document.getElementById("selectStats").className = "paneSelector";
    }
    if (name == 'deity') {
        document.getElementById("buildingsPane").style.display = "none";
        document.getElementById("upgradesPane").style.display = "none";
        document.getElementById("deityPane").style.display = "block";
        document.getElementById("conquestPane").style.display = "none";
        document.getElementById("tradePane").style.display = "none";
        document.getElementById("statsPane").style.display = "none";

        document.getElementById("selectBuildings").className = "paneSelector";
        document.getElementById("selectUpgrades").className = "paneSelector";
        document.getElementById("selectDeity").className = "paneSelector selected";
        document.getElementById("selectConquest").className = "paneSelector";
        document.getElementById("selectTrade").className = "paneSelector";
        document.getElementById("selectStats").className = "paneSelector";
    }
    if (name == 'conquest') {
        document.getElementById("buildingsPane").style.display = "none";
        document.getElementById("upgradesPane").style.display = "none";
        document.getElementById("deityPane").style.display = "none";
        document.getElementById("conquestPane").style.display = "block";
        document.getElementById("tradePane").style.display = "none";
        document.getElementById("statsPane").style.display = "none";

        document.getElementById("selectBuildings").className = "paneSelector";
        document.getElementById("selectUpgrades").className = "paneSelector";
        document.getElementById("selectDeity").className = "paneSelector";
        document.getElementById("selectConquest").className = "paneSelector selected";
        document.getElementById("selectTrade").className = "paneSelector";
        document.getElementById("selectStats").className = "paneSelector";
    }
    if (name == 'trade') {
        document.getElementById("buildingsPane").style.display = "none";
        document.getElementById("upgradesPane").style.display = "none";
        document.getElementById("deityPane").style.display = "none";
        document.getElementById("conquestPane").style.display = "none";
        document.getElementById("tradePane").style.display = "block";
        document.getElementById("statsPane").style.display = "none";

        document.getElementById("selectBuildings").className = "paneSelector";
        document.getElementById("selectUpgrades").className = "paneSelector";
        document.getElementById("selectDeity").className = "paneSelector";
        document.getElementById("selectConquest").className = "paneSelector";
        document.getElementById("selectTrade").className = "paneSelector selected";
        document.getElementById("selectStats").className = "paneSelector";
    }
    if (name == 'stats') {
        document.getElementById("buildingsPane").style.display = "none";
        document.getElementById("upgradesPane").style.display = "none";
        document.getElementById("deityPane").style.display = "none";
        document.getElementById("conquestPane").style.display = "none";
        document.getElementById("tradePane").style.display = "none";
        document.getElementById("statsPane").style.display = "block";

        document.getElementById("selectBuildings").className = "paneSelector";
        document.getElementById("selectUpgrades").className = "paneSelector";
        document.getElementById("selectDeity").className = "paneSelector";
        document.getElementById("selectConquest").className = "paneSelector";
        document.getElementById("selectTrade").className = "paneSelector";
        document.getElementById("selectStats").className = "paneSelector selected";
    }
}