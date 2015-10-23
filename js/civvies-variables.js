(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,

        resources: [
            //Note: Grouping 1 is clickable by user to gather resources manually
            {name: 'food', grouping: 1, image: '../images/civclicker/food.png', chances: [{chance: "foodSpecialChance", resource: 'herbs'}], amount_from_click: 1},
            {name: 'wood', grouping: 1, image: '../images/civclicker/wood.png', chances: [{chance: "woodSpecialChance", resource: 'skins'}], amount_from_click: 1},
            {name: 'stone', grouping: 1, image: '../images/civclicker/stone.png', chances: [{chance: "stoneSpecialChance", resource: 'ore'}], amount_from_click: 1},

            {name: 'herbs', grouping: 2, image: '../images/civclicker/herbs.png', notes: "Found sometimes when gathering food or by farmers"},
            {name: 'skins', grouping: 2, image: '../images/civclicker/skins.png', notes: "Found sometimes when collecting wood or by woodcutters"},
            {name: 'ore', grouping: 2, image: '../images/civclicker/ore.png', notes: "Found sometimes when mining ore or by miners"},

            {name: 'leather', grouping: 2, image: '../images/civclicker/leather.png', notes: "Created by Tanners working in a Tannery"},
            {name: 'metal', grouping: 2, image: '../images/civclicker/metal.png', notes: "Created by Blacksmiths working in a Smithy"},

            {name: 'gold', grouping: 2, image: '../images/civclicker/gold.png', notes: "Created from trading goods with Traders"},
            {name: 'piety', grouping: 2, image: '../images/civclicker/piety.png', notes: "Created by Clerics working in a Temple"},
            {name: 'corpses', grouping: 2, image: '../images/civclicker/piety.png', notes: "Created when towns people die from starvation or fighting"},

            //TODO: Haven't applied these yet
            {name: 'healing', grouping: 3, image: '../images/civclicker/piety.png', notes: "Created by Clerics and Apothecaries"},
            {name: 'wonder', grouping: 3, image: '../images/civclicker/piety.png', notes: "Created by Labourers working on a Wonder"}
        ],
        buildings: [
            {name: 'cave', type: 'home', costs: {wood: 2, food:1, stone:1}, population_supports: 1, initial: 1},
            {name: 'tent', type: 'home', costs: {skins: 2, wood: 2}, population_supports: 2},
            {name: 'hovel', type: 'home', costs: {food: 15, wood: 20, stone:5}, population_supports: 3},
            {name: 'hut', type: 'home', costs: {skins: 1, wood: 20}, population_supports: 4},
            {name: 'cottage', type: 'home', costs: {stone: 30, wood: 10}, population_supports: 6, upgrades: {harvesting: true}},
            {name: 'house', type: 'home', costs: {stone: 70, wood: 30}, population_supports: 10, upgrades: {masonry: true}},
            {name: 'mansion', type: 'home', costs: {stone: 200, wood: 200, leather: 20}, population_supports: 20, upgrades: {architecture: true}},

            {name: 'barn', type: 'storage', costs: {wood: 100}, supports: {food: 100, herbs: 1000}, upgrades: {harvesting: true}, notes: "Increase the food you can store"},
            {name: 'woodstock', type: 'storage', costs: {wood: 100}, supports: {wood: 100, skins: 1000, leather:100}, notes: "Increase the wood you can store"},
            {name: 'stonestock', type: 'storage', costs: {wood: 100}, supports: {stone: 100, ore: 1000, metal:100}, upgrades: {prospecting: true}, notes: "Increase the stone you can store"},

            {name: 'tannery', type: 'business', costs: {wood: 30, stone: 70, skins: 2}, supports: {tanners: 2}, upgrades: {skinning: true}},
            {name: 'smithy', type: 'business', costs: {wood: 30, stone: 70, ore: 2}, supports: {blacksmiths: 2}, upgrades: {prospecting: true}},
            {name: 'apothecary', type: 'business', costs: {wood: 30, stone: 70, herbs: 2}, supports: {apothecaries: 2}, upgrades: {harvesting: true}},
            {name: 'temple', type: 'business', costs: {wood: 30, stone: 120, herbs: 10}, supports: {clerics: 1, piety:2000, gold:5}, upgrades:{masonry:true}},
            {name: 'barracks', type: 'business', costs: {food: 20, wood: 60, stone: 120}, supports: {soldiers: 5, gold:2}, upgrades: {weaponry: true, masonry:true}},
            {name: 'stable', type: 'business', costs: {food: 60, wood: 60, stone: 120, leather: 10}, supports: {cavalry: 5}, upgrades: {horseback: true}},

            {name: 'mill', type: 'upgrade', costs: {wood: 100, stone: 100}, options: {food_efficiency: .1}, upgrades: {wheel: true}, notes: "Improves Farming Efficiency"},
            {name: 'graveyard', type: 'upgrade', costs: {wood: 50, stone: 200, herbs: 50}, options: {grave_spot: 100}, notes: "Increases Grave Plots", upgrades:{writing:true}}, //TODO: Should graves be a resource?
            {name: 'fortification', type: 'upgrade', costs: {stone: 100}, options: {defense_improvement: 5}, supports: {gold:10}, notes: "Improves Defenses", upgrades:{codeoflaws:true, palisade:true}},

            {name: 'battleAltar', title: "Battle Altar", type: 'altar', costs: {devotion: 1, stone: 200, metal: 50, piety: 200}, upgrades:{deity:true}},
            {name: 'fieldsAltar', title: "Fields Altar", type: 'altar', costs: {devotion: 1, food: 500, wood: 500, stone: 200, piety: 200}, upgrades:{deity:true}},
            {name: 'underworldAltar', title: "Underworld Altar", type: 'altar', costs: {devotion: 1, stone: 200, piety: 200, corpses: 1}, upgrades:{deity:true}},
            {name: 'catAltar', title: "Cat Altar", type: 'altar', costs: {devotion: 1, herbs: 100, stone: 200, piety: 200}, upgrades:{deity:true}}
        ],
        populations: [
            {name: 'unemployed', title: 'Unemployed Worker', type: 'basic', notes: "Unassigned Workers that eat up food", unassignable: true, cull_order: 2},
            {name: 'sick', type: 'basic', notes: "Sick workers that need medical help", unassignable: true, cull_order: 1},

            {name: 'farmers', type: 'basic', produces: {food: "farmers"}, doesnt_require_office: true, cull_order: 10},
            {name: 'woodcutters', type: 'basic', produces: {wood: "woodcutters"}, doesnt_require_office: true, cull_order: 9},
            {name: 'miners', type: 'basic', produces: {stone: "miners"}, doesnt_require_office: true},

            {name: 'tanners', type: 'medieval', consumes: {skins: 1}, produces: {leather: "tanners"}},
            {name: 'blacksmiths', type: 'medieval', consumes: {ore: 1}, produces: {metal: "blacksmiths"}},
            {name: 'apothecaries', type: 'medieval', consumes: {herbs: 1}, supports: {healing: "apothecaries"}},
            {name: 'clerics', type: 'medieval', consumes: {food: 2, herbs: 1}, supports: {healing: .1, burying: 5}, produces: {piety: "clerics"}, cull_order: 6},
            {name: 'labourers', type: 'medieval', consumes: {herbs: 10, leather: 10, metal: 10, piety: 10}, produces: {wonder: 1}, cull_order: 2},

            {name: 'cats', type: 'mystical', cull_order: 11},  //TODO: What makes cats?
            {name: 'zombies', type: 'mystical', costs: {corpses: 1}, doesnt_consume_food: true},

            {name: 'soldiers', type: 'warfare', consumes: {food: 2}, supports: {battle: "soldiers"}, upgrades: {weaponry: true}, cull_order: 8},
            {name: 'cavalry', type: 'warfare', consumes: {food: 1, herbs: 1}, supports: {battle: "cavalry"}, upgrades: {horseback: true}, cull_order: 7},
            {name: 'siege', type: 'warfare', costs: {metal: 10, wood: 100}, supports: {battle: .1}, upgrades: {construction: true, mathematics:true}, doesnt_require_office: true, doesnt_consume_food: true}
        ],
        variables: [
            {name: "storageInitial", value: 120},
            {name: "happiness", value: 1},
            {name: "farmers", value: 1.2},
            {name: "pestBonus", value: 0},
            {name: "woodcutters", value: 0.5},
            {name: "miners", value: 0.2},
            {name: "tanners", value: 0.5},
            {name: "blacksmiths", value: 0.5},
            {name: "apothecaries", value: 0.1},
            {name: "clerics", value: 0.05},
            {name: "soldiers", value: 0.05},
            {name: "cavalry", value: 0.08},
            {name: "foodSpecialChance", value: 0.02},
            {name: "woodSpecialChance", value: 0.02},
            {name: "stoneSpecialChance", value: 0.01},
            {name: "foodCostInitial", value: 20}
        ],
        upgrades: [
            {name: "skinning", type: 'stone age', costs: {skins: 10}},
            {name: "harvesting", type: 'stone age', costs: {herbs: 10}},
            {name: "prospecting", type: 'stone age', costs: {ore: 10}},

            {name: "butchering", type: 'farming', costs: {leather: 40}, upgrades:{skinning:true}},
            {name: "gardening", type: 'farming', costs: {herbs: 40}, upgrades:{harvesting:true}},
            {name: "extraction", type: 'farming', title: "Metal Extraction", costs: {metal: 40}, upgrades:{prospecting:true}},

            {name: "domestication", type: 'basic farming', costs: {leather: 20}, variable_increase: {farmers: 0.1}, upgrades:{butchering:true}},
            {name: "ploughshares", type: 'basic farming', costs: {metal: 20}, variable_increase: {farmers: 0.1}, upgrades:{gardening:true}},
            {name: "irrigation", type: 'basic farming', costs: {wood: 500, stone: 200}, variable_increase: {farmers: 0.1}, upgrades:{ploughshares:true}},

            {name: "flensing", type: 'efficiency farming', title: "Flaying", costs: {metal: 1000}, variable_increase: {foodSpecialChance: 0.001}, upgrades:{domestication:true}},
            {name: "macerating", type: 'efficiency farming', title: "Ore Refining", costs: {leather: 500, stone: 500}, variable_increase: {stoneSpecialChance: 0.001}, upgrades:{extraction:true}},

            {name: "croprotation", type: 'improved farming', title: "Crop Rotation", costs: {herbs: 5000, piety: 1000}, variable_increase: {farmers: 0.1}},
            {name: "selectivebreeding", type: 'improved farming', title: "Breeding", costs: {skins: 7000, piety: 2000}, variable_increase: {farmers: 0.1}, upgrades:{croprotation:true}},
            {name: "fertilizers", type: 'improved farming', costs: {ore: 9000, piety: 3000}, variable_increase: {farmers: 0.1}, upgrades:{selectivebreeding:true}},

            {name: "masonry", type: 'construction', costs: {wood: 100, stone: 100}, upgrades:{prospecting:true}},
            {name: "construction", type: 'construction', costs: {wood: 1000, stone: 1000}, notes: "Allows Siege Engines", upgrades:{masonry:true}},
            {name: "architecture", type: 'construction', costs: {wood: 10000, stone: 10000}, upgrades:{construction:true}},

            {name: "tenements", type: 'housing', costs: {food: 200, wood: 500, stone: 500}, upgrades:{masonry:true}},
            {name: "slums", type: 'housing', costs: {food: 500, wood: 1000, stone: 1000}, upgrades:{tenements:true}},

            {name: "granaries", type: 'city efficiency', costs: {wood: 1000, stone: 1000}, upgrades:{construction:true}},
            {name: "palisade", type: 'city efficiency', costs: {wood: 2000, stone: 1000}, upgrades:{architecture:true}},

            {name: "weaponry", type: 'weaponry', costs: {wood: 500, metal: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
            {name: "shields", type: 'weaponry', costs: {wood: 500, leather: 500}, variable_increase: {soldier: 0.01, cavalry: 0.01}},
            {name: "horseback", type: 'weaponry', costs: {wood: 500, food: 500}},
            {name: "wheel", type: 'weaponry', costs: {wood: 500, stone: 500}, upgrades:{masonry:true, domestication:true}},
            {name: "standard", type: 'weaponry', title: "Battle Standard", costs: {leather: 1000, metal: 1000}, upgrades:{writing:true, weaponry:true, shields:true}},

            {name: "writing", type: 'writing', costs: {skins: 500}},
            {name: "administration", type: 'writing', costs: {skins: 1000, stone: 1000}, upgrades:{writing:true}},
            {name: "codeoflaws", type: 'writing', title: "Code of Laws", costs: {skins: 1000, stone: 1000}, upgrades:{administration:true}},
            {name: "mathematics", type: 'writing', costs: {herbs: 1000, piety: 1000}, upgrades:{codeoflaws:true}},
            {name: "aesthetics", type: 'writing', costs: {piety: 5000}, upgrades:{codeoflaws:true, responsibility:true}},

            {name: "responsibility", type: 'civil', costs: {skins: 30}},
            {name: "civilservice", type: 'civil', title: "Civil Service", costs: {piety: 5000}, upgrades:{responsibility:true}},
            {name: "feudalism", type: 'civil', costs: {piety: 10000}, upgrades:{civilservice:true}},
            {name: "guilds", type: 'civil', costs: {piety: 10000}, upgrades:{feudalism:true}},
            {name: "serfs", type: 'civil', costs: {piety: 20000}, upgrades:{guilds:true}},
            {name: "nationalism", type: 'civil', costs: {piety: 50000}, upgrades:{serfs:true}},

            {name: "trade", type: 'commerce', costs: {gold: 1}, upgrades:{writing:true}},
            {name: "currency", type: 'commerce', costs: {gold: 10, ore: 1000}, upgrades:{writing:true, trade:true}},
            {name: "commerce", type: 'commerce', costs: {gold: 100, piety: 10000}, upgrades:{currency:true, civilservice:true}},

            {name: "deity", type: 'deity', costs: {piety: 1000}, special: "choose deity", upgrades:{responsibility:true, writing: true}},
//           	{name:"deityType"}, //TODO: How to handle 4 deities?

            {name: "lure", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "companion", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "comfort", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
            {name: "blessing", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "waste", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "stay", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
            {name: "riddle", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "throne", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "lament", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}},
            {name: "book", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "feast", type: 'deity', costs: {piety: 1000}, upgrades:{deity:true}},
            {name: "secrets", type: 'deity', costs: {piety: 5000}, upgrades:{deity:true}}
        ],
        achievements: [
            {name: "hamlet"},
            {name: "village"},
            {name: "smallTown", title: "Small Town"},
            {name: "largeTown", title: "Large Town"},
            {name: "smallCity", title: "Small City"},
            {name: "largeCity", title: "Large City"},
            {name: "metropolis"},
            {name: "smallNation", title: "Small Nation"},
            {name: "nation"},
            {name: "largeNation", title: "Large Nation"},
            {name: "empire"},
            {name: "raider"},
            {name: "engineer"},
            {name: "domination"},
            {name: "hated"},
            {name: "loved"},
            {name: "cat", title: "Cat!"},
            {name: "glaring"},
            {name: "clowder"},
            {name: "battle"},
            {name: "cats"},
            {name: "fields"},
            {name: "underworld"},
            {name: "fullHouse", title: "Full House"},
            {name: "plague", title: "Plagued"},
            {name: "ghostTown", title: "Ghost Town"},
            {name: "wonder"},
            {name: "seven"},
            {name: "merchant"},
            {name: "rushed"},
            {name: "neverclick", title: "Never Click"}
        ]
    };

    CivviesClass.initializeOptions('game_options', _game_options);

})(Civvies);