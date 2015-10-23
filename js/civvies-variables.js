(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,

        //TODO: These should move to variables
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

            {name: 'piety', grouping:2, image:'../images/civclicker/piety.png'},
            {name: 'corpses', grouping:2, image:'../images/civclicker/piety.png'},
            {name: 'wonder', grouping:3, image:'../images/civclicker/piety.png'}
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
            {name: 'unemployed', title:'Unemployed Worker', type:'basic', notes:"Unassigned Workers that eat up food", unassignable:true, cull_order:2},
            {name: 'sick', type:'basic', notes:"Sick workers that need medical help", unassignable:true, cull_order:1},
            {name: 'farmers', type:'basic', produces:{food:"farmers"}, doesnt_require_office:true, cull_order:10},
            {name: 'woodcutters', type:'basic', produces:{wood:1}, doesnt_require_office:true, cull_order:9},
            {name: 'miners', type:'basic', produces:{stone:1}, doesnt_require_office:true},

            {name: 'tanners', type:'medieval', consumes:{skins:1}, produces:{leather:1}},
            {name: 'blacksmiths', type:'medieval', consumes:{ore:1}, produces:{metal:1}},
            {name: 'apothecaries', type:'medieval', consumes:{herbs:1}, supports:{healing:1}},
            {name: 'clerics', type:'medieval', consumes:{food:2, herbs:1}, supports:{healing:.1, burying: 5}, produces:{piety:1}, cull_order:6},
            {name: 'labourers', type:'medieval', consumes:{herbs:10, leather:10, metal:10, piety:10}, produces:{wonder:1}, cull_order:2},

            {name: 'cats', type:'mystical', cull_order:11},  //TODO: What makes cats?
            {name: 'zombies', type:'mystical', costs:{corpses:1}, doesnt_consume_food:true},

            {name: 'soldiers', type:'warfare', consumes:{food:2}, supports:{battle:1.5}, cull_order:8},
            {name: 'cavalry', type:'warfare', consumes:{food:1, herbs:1}, supports:{battle:2}, cull_order:7},
            {name: 'siege', type:'warfare', costs:{metal:10, wood:100}, supports:{battle:5}, doesnt_require_office:true, doesnt_consume_food:true}
        ],
        variables: [
            {name: "happiness", value:1},
            {name: "farmers", value:1.2},
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
            {name: "stoneSpecialChance", value:0.01},
            {name: "foodCostInitial", value:20}
        ],
        upgrades: [
            //TODO: Have a grouping mechanism
            {name:"skinning", type:'stone age', costs:{skins:10}, unlocks:["butchering"]},
           	{name:"harvesting", type:'stone age', costs:{herbs:10}, unlocks:["gardening"]},
           	{name:"prospecting", type:'stone age', costs:{ore:10}, unlocks:["extraction"]},

            {name:"domestication", type:'basic farming', costs:{leather:20}, variable_increase:{farmers:0.1}},
           	{name:"ploughshares", type:'basic farming', costs:{metal:20}, variable_increase:{farmers:0.1}},
           	{name:"irrigation", type:'basic farming', costs:{wood:500, stone:200}, variable_increase:{farmers:0.1}},

           	{name:"butchering", type:'special farming', costs:{leather:40}},
           	{name:"gardening", type:'special farming', costs:{herbs:40}},
           	{name:"extraction", type:'special farming', title: "Metal Extraction", costs:{metal:40}},

            {name:"flensing", type:'efficiency farming', title: "Flaying", costs:{metal:1000}, variable_increase:{foodSpecialChance:0.001}},
           	{name:"macerating", type:'efficiency farming', title: "Ore Refining", costs:{leather:500, stone:500}, variable_increase:{stoneSpecialChance:0.001}},

           	{name:"croprotation", type:'improved farming', title: "Crop Rotation", costs:{herbs:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"selectivebreeding", type:'improved farming', title: "Breeding", costs:{skins:5000, piety:1000}, variable_increase:{farmers:0.1}},
           	{name:"fertilizers", type:'improved farming', costs:{ore:5000, piety:1000}, variable_increase:{farmers:0.1}},

           	{name:"masonry", type:'construction', costs:{wood:100, stone:100}},
           	{name:"construction", type:'construction', costs:{wood:1000, stone:1000}},
           	{name:"architecture", type:'construction', costs:{wood:10000, stone:10000}},

            {name:"tenements", type:'housing', costs:{food:200, wood:500, stone:500}},
            {name:"slums", type:'housing', costs:{food:500, wood:1000, stone:1000}},

            {name:"granaries", type:'city efficiency', costs:{wood:1000, stone:1000}},
           	{name:"palisade", type:'city efficiency', costs:{wood:2000, stone:1000}},

            {name:"weaponry", type:'weaponry', costs:{wood:500, metal:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
           	{name:"shields", type:'weaponry', costs:{wood:500, leather:500}, variable_increase:{soldier:0.01, cavalry:0.01}},
            {name:"horseback", type:'weaponry', costs:{wood:500, food:500}},
           	{name:"wheel", type:'weaponry', costs:{wood:500, stone:500}},

           	{name:"writing", type:'writing', costs:{skins:500}},
           	{name:"administration", type:'writing', costs:{skins:1000, stone:1000}},
           	{name:"codeoflaws", type:'writing', title: "Code of Laws", costs:{skins:1000, stone:1000}},
           	{name:"mathematics", type:'writing', costs:{herbs:1000, piety:1000}},
           	{name:"aesthetics", type:'writing', costs:{piety:5000}},
            {name:"standard", type:'writing', title:"Battle Standard", costs:{leather:1000, metal:1000}},

            {name:"civilservice", type:'civil', title: "Civil Service", costs:{piety:5000}},
           	{name:"feudalism", type:'civil', costs:{piety:10000}},
           	{name:"guilds", type:'civil', costs:{piety:10000}},
           	{name:"serfs", type:'civil', costs:{piety:20000}},
           	{name:"nationalism", type:'civil', costs:{piety:50000}},

            {name:"trade", type:'commerce', costs:{gold:1}},
           	{name:"currency", type:'commerce', costs:{gold:10, ore:1000}},
           	{name:"commerce", type:'commerce', costs:{gold:100, piety:10000}},

           	{name:"deity", type:'deity', costs:{piety:1000}, special:"choose deity"},
//           	{name:"deityType"}, //TODO: How to handle 4 deities?

           	{name:"lure", type:'deity', costs:{piety:1000}},
           	{name:"companion", type:'deity', costs:{piety:1000}},
           	{name:"comfort", type:'deity', costs:{piety:5000}},
           	{name:"blessing", type:'deity', costs:{piety:1000}},
           	{name:"waste", type:'deity', costs:{piety:1000}},
           	{name:"stay", type:'deity', costs:{piety:5000}},
           	{name:"riddle", type:'deity', costs:{piety:1000}},
           	{name:"throne", type:'deity', costs:{piety:1000}},
           	{name:"lament", type:'deity', costs:{piety:5000}},
           	{name:"book", type:'deity', costs:{piety:1000}},
           	{name:"feast", type:'deity', costs:{piety:1000}},
           	{name:"secrets", type:'deity', costs:{piety:5000}}

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