(function (Civvies) {

    var $pointers = {};

    function show_basic_resources (game){
        $('<h3>')
            .text('Resources')
            .appendTo($pointers.basic_resources);
        var $table = $('<table>')
            .appendTo($pointers.basic_resources);

        _.each(game.game_options.resources, function(resource){
            if (resource.grouping == 1) {
                var name = _.str.titleize(resource.name);
                var $tr = $('<tr>')
                    .appendTo($table);
                var $td1 = $('<td>')
                    .appendTo($tr);
                $('<button>')
                    .text('Gather ' + name)
                    .on('click', function(){
                        _c.increment_from_click(game,resource);
                    })
                    .appendTo($td1);
                $('<td>')
                    .text(name + ":")
                    .appendTo($tr);
                resource.$holder = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-'+resource.name)
                    .text(0)
                    .appendTo($tr);
                var $td4 = $('<td>')
                    .addClass('icon')
                    .appendTo($tr);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($td4);
                resource.$max = $('<td>')
                    .addClass('number')
                    .attr('id', 'resource-max-'+resource.name)
                    .text("(Max: "+game.game_options.storage_initial+")")
                    .appendTo($tr);
                resource.$rate = $('<td>')
                    .addClass('number net')
                    .attr('id', 'resource-rate-'+resource.name)
                    .text("0/s")
                    .appendTo($tr);
            }
        });
    }
    function show_secondary_resources (game){
        $('<h3>')
            .text('Special Resources')
            .appendTo($pointers.secondary_resources);

        _.each(game.game_options.resources, function(resource){
            if (resource.grouping == 2) {
                var name = _.str.titleize(resource.name);

                var $div = $('<div>')
                    .addClass('icon resource-holder')
                    .appendTo($pointers.secondary_resources);
                $('<span>')
                    .text(name+":" )
                    .appendTo($div);
                resource.$holder = $('<span>')
                    .attr('id', 'resource-'+resource.name)
                    .text(0)
                    .appendTo($div);
                $('<img>')
                    .attr('src', resource.image)
                    .addClass('icon icon-lg')
                    .appendTo($div);
            }
        });
    }
    function show_buildings (game) {
        $('<h3>')
            .text('Buildings')
            .appendTo($pointers.building_list);
        var $table = $('<table>')
            .appendTo($pointers.building_list);

        _.each(game.game_options.buildings, function(building){
            var name = _.str.titleize(building.title || building.name);
            var $tr = $('<tr>')
                .appendTo($table);
            var $td1 = $('<td>')
                .appendTo($tr);
            $('<button>')
                .text('Build ' + name)
                .on('click', function(){
                    _c.create_building(game, building, 1);
                })
                .appendTo($td1);

            $('<td>')
                .addClass('buildingnames')
                .text(Helpers.pluralize(name)+": ")
                .appendTo($tr);
            building.$holder = $('<td>')
                .addClass('number')
                .attr('id', 'building-'+building.name)
                .text(0)
                .appendTo($tr);
            $('<td>')
                .addClass('cost')
                .text(_c.cost_benefits_text(building))
                .appendTo($tr);


        });

    }
//
//        <p id="customBuildIncrement">
//            Increment: <input id="buildCustom" type="number" min="1" step="1" value="1">
//        </p>
//        <table id="buildings">
//            <tr id="tentRow">
//                <td><button onmousedown="createBuilding(tent,1)">Build Tent</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(tent,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(tent,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(tent,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(tent)">+Custom</button></td>
//                <td class="buildingnames">Tents: </td>
//                <td class="number"><span id="tents">0</span></td>
//                <td><span class="cost">2 skins, 2 wood</span><span class="note">: +1 max pop.</span></td>
//            </tr>
//            <tr id="whutRow">
//                <td><button onmousedown="createBuilding(whut,1)">Build Wooden Hut</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(whut,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(whut,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(whut,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(whut)">+Custom</button></td>
//                <td class="buildingnames">Huts: </td>
//                <td class="number"><span id="whuts">0</span></td>
//                <td><span class="cost">1 skin, 20 wood</span><span class="note">: +3 max pop.</span></td>
//            </tr>
//            <tr id="cottageRow">
//                <td><button onmousedown="createBuilding(cottage,1)">Build Cottage</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(cottage,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(cottage,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(cottage,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(cottage)">+Custom</button></td>
//                <td class="buildingnames">Cottages: </td>
//                <td class="number"><span id="cottages">0</span></td>
//                <td><span class="cost">10 wood, 30 stone</span><span class="note">: +6 max pop.</span></td>
//            </tr>
//            <tr id="houseRow">
//                <td><button onmousedown="createBuilding(house,1)">Build House</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(house,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(house,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(house,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(house)">+Custom</button></td>
//                <td class="buildingnames">Houses: </td>
//                <td class="number"><span id="houses">0</span></td>
//                <td><span class="cost">30 wood, 70 stone</span><span class="note">: +10 max pop.</span></td>
//            </tr>
//            <tr id="mansionRow">
//                <td><button onmousedown="createBuilding(mansion,1)">Build Mansion</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(mansion,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(mansion,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(mansion,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(mansion)">+Custom</button></td>
//                <td class="buildingnames">Mansions: </td>
//                <td class="number"><span id="mansions">0</span></td>
//                <td><span class="cost">200 wood, 200 stone, 20 leather</span><span class="note">: +50 max pop.</span></td>
//            </tr>
//            <tr>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//            </tr>
//            <tr id="barnRow">
//                <td><button onmousedown="createBuilding(barn,1)">Build Barn</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(barn,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(barn,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(barn,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(barn)">+Custom</button></td>
//                <td class="buildingnames">Barns: </td>
//                <td class="number"><span id="barns">0</span></td>
//                <td><span class="cost">100 wood</span><span class="note">: store +200 food</span></td>
//            </tr>
//            <tr id="woodstockRow">
//                <td><button onmousedown="createBuilding(woodstock,1)">Build Wood Stockpile</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(woodstock,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(woodstock,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(woodstock,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(woodstock)">+Custom</button></td>
//                <td class="buildingnames">Wood Stockpiles: </td>
//                <td class="number"><span id="woodstock">0</span></td>
//                <td><span class="cost">100 wood</span><span class="note">: store +200 wood</span></td>
//            </tr>
//            <tr id="stonestockRow">
//                <td><button onmousedown="createBuilding(stonestock,1)">Build Stone Stockpile</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(stonestock,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(stonestock,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(stonestock,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(stonestock)">+Custom</button></td>
//                <td class="buildingnames">Stone Stockpiles: </td>
//                <td class="number"><span id="stonestock">0</span></td>
//                <td><span class="cost">100 wood</span><span class="note">: store +200 stone</span></td>
//            </tr>
//            <tr>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//            </tr>
//            <tr id="tanneryRow">
//                <td><button onmousedown="createBuilding(tannery,1)">Build Tannery</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(tannery,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(tannery,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(tannery,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(tannery)">+Custom</button></td>
//                <td class="buildingnames">Tanneries: </td>
//                <td class="number"><span id="tanneries">0</span></td>
//                <td><span class="cost">30 wood, 70 stone, 2 skins</span><span class="note">: allows 1 tanner</span></td>
//            </tr>
//            <tr id="smithyRow">
//                <td><button onmousedown="createBuilding(smithy,1)">Build Smithy</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(smithy,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(smithy,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(smithy,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(smithy)">+Custom</button></td>
//                <td class="buildingnames">Smithies: </td>
//                <td class="number"><span id="smithies">0</span></td>
//                <td><span class="cost">30 wood, 70 stone, 2 ore</span><span class="note">: allows 1 blacksmith</span></td>
//            </tr>
//            <tr id="apothecaryRow">
//                <td><button onmousedown="createBuilding(apothecary,1)">Build Apothecary</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(apothecary,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(apothecary,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(apothecary,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(apothecary)">+Custom</button></td>
//                <td class="buildingnames">Apothecaries: </td>
//                <td class="number"><span id="apothecaria">0</span></td>
//                <td><span class="cost">30 wood, 70 stone, 2 herbs</span><span class="note">: allows 1 apothecary</span></td>
//            </tr>
//            <tr id="templeRow">
//                <td><button onmousedown="createBuilding(temple,1)">Build Temple</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(temple,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(temple,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(temple,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(temple)">+Custom</button></td>
//                <td class="buildingnames">Temples: </td>
//                <td class="number"><span id="temples">0</span></td>
//                <td><span class="cost">30 wood, 120 stone, 10 herbs</span><span class="note">: allows 1 cleric</span></td>
//            </tr>
//            <tr id="barracksRow">
//                <td><button onmousedown="createBuilding(barracks,1)">Build Barracks</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(barracks,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(barracks,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(barracks,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(barracks)">+Custom</button></td>
//                <td class="buildingnames">Barracks: </td>
//                <td class="number"><span id="barracks">0</span></td>
//                <td><span class="cost">20 food, 60 wood, 120 stone, 10 metal</span><span class="note">: allows 10 soldiers</span></td>
//            </tr>
//            <tr id="stableRow">
//                <td><button onmousedown="createBuilding(stable,1)">Build Stable</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(stable,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(stable,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(stable,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(stable)">+Custom</button></td>
//                <td class="buildingnames">Stable: </td>
//                <td class="number"><span id="stables">0</span></td>
//                <td><span class="cost">60 food, 60 wood, 120 stone, 10 leather</span><span class="note">: allows 10 cavalry</span></td>
//            </tr>
//            <tr>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//                <td>&nbsp;</td>
//            </tr>
//            <tr id="graveyardRow">
//                <td><button onmousedown="createBuilding(graveyard,1)">Build Graveyard</button></td>
//                <td class="buildingten"><button class="x10" onmousedown="createBuilding(graveyard,10)">x10</button></td>
//                <td class="buildinghundred"><button class="x100" onmousedown="createBuilding(graveyard,100)">x100</button></td>
//                <td class="buildingthousand"><button class="x1000" onmousedown="createBuilding(graveyard,1000)">x1k</button></td>
//                <td class="buildCustom"><button onmousedown="buildCustom(graveyard)">+Custom</button></td>
//                <td class="buildingnames">Graveyards: </td>
//                <td class="number"><span id="graveyards">0</span></td>
//                <td><span class="cost">100 wood; 200 stone, 50 herbs</span><span class="note">: contains 100 graves</span></td>
//            </tr>
//            <tr id="millRow">
//                <td><button onmousedown="createBuilding(mill,1)">Build Mill</button></td>
//                <td class="buildingten"></td>
//                <td class="buildinghundred"></td>
//                <td class="buildingthousand"></td>
//                <td class="buildCustom"></td>
//                <td class="buildingnames">Mills: </td>
//                <td class="number"><span id="mills">0</span></td>
//                <td><span class="cost"><span id="millCostW">100</span> wood, <span id="millCostS">100</span> stone</span><span class="note">: improves farmers</span></td>
//            </tr>
//            <tr id="fortificationRow">
//                <td><button onmousedown="createBuilding(fortification,1)">Build Fortification</button></td>
//                <td class="buildingten"></td>
//                <td class="buildinghundred"></td>
//                <td class="buildingthousand"></td>
//                <td class="buildCustom"></td>
//                <td class="buildingnames">Fortifications: </td>
//                <td class="number"><span id="fortifications">0</span></td>
//                <td><span class="cost"><span id="fortCost">100</span> stone</span><span class="note">: helps protect against attack</span></td>
//            </tr>
//        </table>



    var _c = new Civvies('get_private_functions');
    _c.buildInitialDisplay = function (game) {
        $pointers.basic_resources = $('#basic_resources');
        show_basic_resources(game);

        $pointers.secondary_resources = $('#secondary_resources');
        show_secondary_resources(game);

        $pointers.building_list = $('#buildingsPane');
        show_buildings(game);

    };

    _c.updateResources = function(game) {
        _.each(game.game_options.resources, function(resource) {
            if (resource.$holder) {
                var res_data = game.data.resources[resource.name];
                res_data = Helpers.abbreviateNumber(res_data);
                resource.$holder.text(res_data)
            }

            if (resource.$max) {
                var res_max = _c.getResourceMax(game, resource);
                res_max = Helpers.abbreviateNumber(res_max);
                resource.$max.text("(Max: "+res_max+")")
            }

            if (resource.$rate) {
                var res_rate = _c.getResourceRate(game, resource);
                resource.$rate.text(res_rate)
            }


        });
    };


    _c.updateBuildingTotals = function () {

    };
    _c.updatePopulation = function () {

    };
    _c.updateSpawnButtons = function () {

    };
    _c.updateJobs = function () {

    };
    _c.updateJobButtons = function () {

    };
    _c.updateUpgrades = function () {

    };
    _c.updateDeity = function () {

    };
    _c.updateOldDeities = function () {

    };
    _c.updateMobs = function () {

    };
    _c.updateDevotion = function () {

    };
    _c.updateRequirements = function () {

    };
    _c.updateAchievements = function () {

    };
    _c.updateParty = function () {

    };
    _c.updatePartyButtons = function () {

    };
    _c.updateTargets = function () {

    };
    _c.updateHappiness = function () {

    };
    _c.updateWonder = function () {

    };
    _c.updateWonderList = function () {

    };
    _c.updateBuildingButtons = function () {

    };
    _c.updateReset = function () {

    };
    _c.paneSelect = function () {

    };
    _c.toggleCustomIncrements = function () {

    };
    _c.toggleNotes = function () {

    };
    _c.impExp = function () {

    };
    _c.tips = function () {

    };
    _c.versionAlert = function () {

    };
    _c.text = function () {

    };
    _c.textShadow = function () {

    };
    _c.iconToggle = function () {

    };
    _c.prettify = function () {

    };
    _c.toggleDelimiters = function () {

    };
    _c.toggleWorksafe = function () {

    };
    _c.gameLog = function () {

    };


})(Civvies);