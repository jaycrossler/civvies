(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,
        storage_initial: 100,

        resources: [
            //Note: Grouping 1 is clickable by user to gather resources manually
            {name: 'food', grouping:1, image:'../images/civclicker/food.png', chances:[{chance:"foodSpecialChance", resource:'herbs'}], amount_from_click:1},
            {name: 'wood', grouping:1, image:'../images/civclicker/wood.png', chances:[{chance:"woodSpecialChance", resource:'skins'}], amount_from_click:1},
            {name: 'stone', grouping:1, image:'../images/civclicker/stone.png', chances:[{chance:"stoneSpecialChance", resource:'ore'}], amount_from_click:1},

            {name: 'herbs', grouping:2, image:'../images/civclicker/herbs.png'},
            {name: 'skins', grouping:2, image:'../images/civclicker/skins.png'},
            {name: 'ore', grouping:2, image:'../images/civclicker/ore.png'},

            {name: 'leather', grouping:2, image:'../images/civclicker/leather.png'},
            {name: 'metal', grouping:2, image:'../images/civclicker/metal.png'},
            {name: 'gold', grouping:2, image:'../images/civclicker/gold.png'},

            {name: 'piety', grouping:3},
            {name: 'corpses', grouping:3},
            {name: 'wonder', grouping:3}
        ],
        buildings: [ //TODO: Add upgrades required
            {name: 'tent', type:'home', costs:{skins: 2, wood: 2}, population_supports: 2, initial:1},
            {name: 'hut', type:'home', costs:{skins: 1, wood: 20}, population_supports: 4},
            {name: 'cottage', type:'home', costs:{stone: 30, wood: 10}, population_supports: 6},
            {name: 'house', type:'home', costs:{stone: 70, wood: 30}, population_supports: 10},
            {name: 'mansion', type:'home', costs:{stone: 200, wood: 200, leather:20}, population_supports: 20},

            {name: 'barn', type:'storage', costs:{wood: 100}, supports:{food:100}, notes:"Increase the food you can store"},
            {name: 'woodstock', type:'storage', costs:{wood: 100}, supports:{wood:100}, notes:"Increase the wood you can store"},
            {name: 'stonestock', type:'storage', costs:{wood: 100}, supports:{stone:100}, notes:"Increase the stone you can store"},

            {name: 'tannery', type:'business', costs:{wood: 30, stone:70, skins:2}, supports:{tanners:2}},
            {name: 'smithy', type:'business', costs:{wood: 30, stone:70, ore:2}, supports:{blacksmiths:2}},
            {name: 'apothecary', type:'business', costs:{wood: 30, stone:70, herbs:2}, supports:{apothecaries:2}},
            {name: 'temple', type:'business', costs:{wood: 30, stone:120, herbs:10}, supports:{clerics:1}},
            {name: 'barracks', type:'business', costs:{food: 20, wood: 60, stone:120}, supports:{soldiers:5}},
            {name: 'stable', type:'business', costs:{food: 60, wood: 60, stone:120, leather:10}, supports:{cavalry:5}},

            {name: 'mill', type:'upgrade', costs:{wood: 100, stone: 100}, options:{food_efficiency:.1}, notes:"Improves Farming Efficiency"},
            {name: 'graveyard', type:'upgrade', costs:{wood: 50, stone:200, herbs:50}, options:{grave_spot: 100}, notes:"Increases Grave Plots"}, //TODO: Should graves be a resource?
            {name: 'fortification', type:'upgrade', costs:{stone:100}, options:{defense_improvement:5}, notes:"Improves Defenses"},

//TODO: How to handle altars?
            {name: 'battleAltar', title: "Battle Altar", type:'altar', costs:{devotion: 1, stone:200, metal:50, piety:200}},
            {name: 'fieldsAltar', title: "Fields Altar", type:'altar', costs:{devotion: 1, food: 500, wood: 500, stone:200, piety:200}},
            {name: 'underworldAltar', title: "Underworld Altar", type:'altar', costs:{devotion: 1, stone:200, piety:200, corpses:1}},
            {name: 'catAltar', title: "Cat Altar", type:'altar', costs:{devotion: 1, herbs: 100, stone:200, piety:200}}
//TODO: How to handle Wonder? Laborers currently produce it
        ],
        populations: [
            {name: 'unemployed'},
            {name: 'farmers', produces:{food:1}},
            {name: 'woodcutters', produces:{wood:1}},
            {name: 'miners', produces:{stone:1}},

            {name: 'tanners', consumes:{skins:1}, produces:{leather:1}},
            {name: 'blacksmiths', consumes:{ore:1}, produces:{metal:1}},
            {name: 'apothecaries', consumes:{herbs:1}, supports:{healing:1}},
            {name: 'clerics', consumes:{food:2, herbs:1}, supports:{healing:.1, burying: 5}, produces:{piety:1}},
            {name: 'labourers', consumes:{herbs:10, leather:10, metal:10, piety:10}, produces:{wonder:1}},

            {name: 'soldiers', consumes:{food:2}, supports:{battle:1.5}},
            {name: 'cavalry', consumes:{food:1, herbs:1}, supports:{battle:2}},
            {name: 'siege', costs:{metal:10, wood:100}, supports:{battle:5}},
            {name: 'zombies', costs:{corpses:1}},
            {name: 'cats'}  //TODO: What makes cats?
        ],
        variables: [
            {name: "happiness", value:1},
            {name: "farmers", value:0.2},
            {name: "pestBonus", value:0},
            {name: "woodcutters", value:0.5},
            {name: "miners", value:0.2},
            {name: "tanners", value:0.5},
            {name: "blacksmiths", value:0.5},
            {name: "apothecaries", value:0.1},
            {name: "clerics", value:0.05},
            {name: "soldiers", value:0.05},
            {name: "cavalry", value:0.08},
            {name: "foodSpecialChance", value:0.02},
            {name: "woodSpecialChance", value:0.02},
            {name: "stoneSpecialChance", value:0.01}
        ],
        upgrades: [
            {name:"domestication", costs:{leather:20}, variable_increase:{farmers:0.1}},
           	{name:"ploughshares", costs:{metal:20}, variable_increase:{farmers:0.1}},
           	{name:"irrigation", costs:{wood:500, stone:200}, variable_increase:{farmers:0.1}},
           	{name:"skinning", costs:{skins:10}, unlocks:["butchering"], unlocked: true},
           	{name:"harvesting", costs:{herbs:10}, unlocks:["gardening"], unlocked: true},
           	{name:"prospecting", costs:{ore:10}, unlocks:["extraction"], unlocked: true},
           	{name:"butchering", costs:{leather:40}},
           	{name:"gardening", costs:{herbs:40}},
           	{name:"extraction", title: "Metal Extraction", costs:{metal:40}},
           	{name:"croprotation", title: "Crop Rotation", costs:{herbs:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"selectivebreeding", title: "Selective Breeding", costs:{skins:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"fertilizers", costs:{ore:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"masonry", costs:{wood:100, stone:100}},
           	{name:"construction", costs:{wood:1000, stone:1000}},
           	{name:"architecture", costs:{wood:10000, stone:10000}},
           	{name:"wheel", costs:{wood:500, stone:500}},
           	{name:"horseback", costs:{wood:500, food:500}},
           	{name:"tenements", costs:{food:200, wood:500, stone:500}},
           	{name:"slums", costs:{food:500, wood:1000, stone:1000}},
           	{name:"granaries", costs:{wood:1000, stone:1000}},
           	{name:"palisade", costs:{wood:2000, stone:1000}},
           	{name:"weaponry", costs:{wood:500, metal:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
           	{name:"shields", costs:{wood:500, leather:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
           	{name:"writing", costs:{skins:500}},
           	{name:"administration", costs:{skins:1000, stone:1000}},
           	{name:"codeoflaws", title: "Code of Laws", costs:{skins:1000, stone:1000}},
           	{name:"mathematics", costs:{herbs:1000, piety:1000}},
           	{name:"aesthetics", costs:{piety:5000}},
           	{name:"civilservice", title: "Civil Service", costs:{piety:5000}},
           	{name:"feudalism", costs:{piety:10000}},
           	{name:"guilds", costs:{piety:10000}},
           	{name:"serfs", costs:{piety:20000}},
           	{name:"nationalism", costs:{piety:50000}},
           	{name:"flensing", title: "Flaying", costs:{metal:1000}, variable_increase:{foodSpecialChance:0.001}},
           	{name:"macerating", title: "Ore Refining", costs:{leather:500, stone:500}, variable_increase:{stoneSpecialChance:0.001}},
            {name:"standard", title:"Battle Standard", costs:{leather:1000, metal:1000}},

           	{name:"deity", costs:{piety:1000}, special:"choose deity"},
           	{name:"deityType"}, //TODO: How to handle 4 deities?

           	{name:"lure", costs:{piety:1000}},
           	{name:"companion", costs:{piety:1000}},
           	{name:"comfort", costs:{piety:5000}},
           	{name:"blessing", costs:{piety:1000}},
           	{name:"waste", costs:{piety:1000}},
           	{name:"stay", costs:{piety:5000}},
           	{name:"riddle", costs:{piety:1000}},
           	{name:"throne", costs:{piety:1000}},
           	{name:"lament", costs:{piety:5000}},
           	{name:"book", costs:{piety:1000}},
           	{name:"feast", costs:{piety:1000}},
           	{name:"secrets", costs:{piety:5000}},

            {name:"trade", costs:{gold:1}},
           	{name:"currency", costs:{gold:10, ore:1000}},
           	{name:"commerce", costs:{gold:100, piety:10000}}
        ],
        achievements: [
            {name: "hamlet"},
            {name: "village"},
            {name: "smallTown"},
            {name: "largeTown"},
            {name: "smallCity"},
            {name: "largeCity"},
            {name: "metropolis"},
            {name: "smallNation"},
            {name: "nation"},
            {name: "largeNation"},
            {name: "empire"},
            {name: "raider"},
            {name: "engineer"},
            {name: "domination"},
            {name: "hated"},
            {name: "loved"},
            {name: "cat"},
            {name: "glaring"},
            {name: "clowder"},
            {name: "battle"},
            {name: "cats"},
            {name: "fields"},
            {name: "underworld"},
            {name: "fullHouse"},
            {name: "plague"},
            {name: "ghostTown"},
            {name: "wonder"},
            {name: "seven"},
            {name: "merchant"},
            {name: "rushed"},
            {name: "neverclick"}
        ]
    };


    CivviesClass.initializeOptions('game_options', _game_options);

})(Civvies);