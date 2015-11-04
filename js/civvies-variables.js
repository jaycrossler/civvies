(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,

        functions_on_setup:[],
        functions_each_tick:[],

        arrays_to_map_to_objects: 'resources,buildings,populations,variables,upgrades,achievements'.split(','),
        arrays_to_map_to_arrays: 'land,workflows,events'.split(','),

        resources: [
            //Note: Grouping 1 is clickable by user to gather resources manually
            {name: 'food', grouping: 1, image: '../images/civclicker/food.png', chances: [{chance: "foodSpecialChance", resource: 'herbs'}], amount_from_click: 1, purchase_with_gold:5000},
            {name: 'wood', grouping: 1, image: '../images/civclicker/wood.png', chances: [{chance: "woodSpecialChance", resource: 'skins'}], amount_from_click: 1, purchase_with_gold:5000},
            {name: 'stone', grouping: 1, image: '../images/civclicker/stone.png', chances: [{chance: "stoneSpecialChance", resource: 'ore'}], amount_from_click: 1, purchase_with_gold:5000},

            {name: 'herbs', grouping: 2, image: '../images/civclicker/herbs.png', value:1.2, notes: "Found sometimes when gathering food or by farmers", purchase_with_gold:500},
            {name: 'skins', grouping: 2, image: '../images/civclicker/skins.png', value:1.3, notes: "Found sometimes when collecting wood or by woodcutters", purchase_with_gold:500},
            {name: 'ore', grouping: 2, image: '../images/civclicker/ore.png', value:1.3, notes: "Found sometimes when mining ore or by miners", purchase_with_gold:500},

            {name: 'leather', grouping: 2, image: '../images/civclicker/leather.png', value:1.5, notes: "Created from Skins by Tanners working in a Tannery", purchase_with_gold:250},
            {name: 'metal', grouping: 2, image: '../images/civclicker/metal.png', value:1.6, notes: "Created from Ore by Blacksmiths working in a Smithy", purchase_with_gold:250},

            {name: 'piety', grouping: 2, image: '../images/civclicker/piety.png', value:3, notes: "Created by Clerics working in a Temple", dont_capture:true},
            {name: 'corpses', grouping: 2, image: '../images/civclicker/piety.png', value:5, notes: "Created when people die from starvation or fighting", dont_capture:true, storageInitial:500},

            {name: 'healing', grouping: 1, image: '../images/civclicker/piety.png', value:100, notes: "Created by Clerics and Apothecaries", dont_capture:true}
        ],
        buildings: [
            {name: 'cave', type: 'home', costs: {wood: 2, food:1, stone:1}, population_supports: 1, initial: 1, land_size:0},
            {name: 'tent', type: 'home', costs: {skins: 2, wood: 2}, population_supports: 2},
            {name: 'hovel', type: 'home', costs: {food: 15, wood: 20, stone:5}, population_supports: 3},
            {name: 'hut', type: 'home', costs: {skins: 1, wood: 20}, population_supports: 4},
            {name: 'cottage', type: 'home', costs: {stone: 30, wood: 10}, population_supports: 6, upgrades: {harvesting: true}, land_size:2},
            {name: 'house', type: 'home', costs: {stone: 70, wood: 30}, population_supports: 10, upgrades: {masonry: true}, land_size:2},
            {name: 'mansion', type: 'home', costs: {stone: 200, wood: 200, leather: 20}, population_supports: 20, upgrades: {architecture: true}, land_size:3},

            {name: 'barn', type: 'storage', costs: {wood: 100}, supports: {food: 100, herbs: 300}, upgrades: {harvesting: true}, notes: "Increase the food you can store",land_size:3},
            {name: 'woodstock', type: 'storage', costs: {wood: 100}, supports: {wood: 100, skins: 200, leather:100}, notes: "Increase the wood you can store", land_size:3},
            {name: 'stonestock', type: 'storage', costs: {wood: 100}, supports: {stone: 100, ore: 300, metal:100}, upgrades: {prospecting: true}, notes: "Increase the stone you can store", land_size:3},

            {name: 'tannery', type: 'business', costs: {wood: 30, stone: 70, skins: 2}, supports: {tanners: 2}, upgrades: {skinning: true}, land_size:2},
            {name: 'smithy', type: 'business', costs: {wood: 30, stone: 70, ore: 2}, supports: {blacksmiths: 2}, upgrades: {prospecting: true}, land_size:2},
            {name: 'apothecary', type: 'business', costs: {wood: 30, stone: 70, herbs: 2}, supports: {apothecaries: 2}, upgrades: {harvesting: true}, land_size:2},
            {name: 'temple', type: 'business', costs: {wood: 30, stone: 120, herbs: 10}, supports: {clerics: 1, piety:2000, gold:1}, upgrades:{masonry:true}, land_size:2},

            {name: 'mill', type: 'upgrade', costs: {wood: 100, stone: 100}, options: {food_efficiency: .1}, upgrades: {wheel: true}, notes: "Improves Farming Efficiency"},
            {name: 'graveyard', type: 'upgrade', costs: {wood: 50, stone: 200, herbs: 50}, supports: {grave_spot: 100, corpses:10}, notes: "Increases Grave Plots", upgrades:{writing:true}}
        ],
        populations: [
            {name: 'unemployed', title: 'Unemployed Worker', type: 'basic', notes: "Unassigned Workers that eat up food", unassignable: true, cull_order: 3, doesnt_consume_food:true},

            {name: 'farmers', type: 'basic', produces: {food: "farmers"}, doesnt_require_building: true, cull_order: 10},
            {name: 'woodcutters', type: 'basic', produces: {wood: "woodcutters"}, doesnt_require_building: true, cull_order: 9},
            {name: 'miners', type: 'basic', produces: {stone: "miners"}, doesnt_require_building: true, cull_order: 8},

            {name: 'tanners', type: 'medieval', consumes: {skins: 1}, produces: {leather: "tanners"}},
            {name: 'blacksmiths', type: 'medieval', consumes: {ore: 1}, produces: {metal: "blacksmiths"}},
            {name: 'apothecaries', type: 'medieval', consumes: {herbs: 1}, produces: {healing: "apothecaries"}},
            {name: 'clerics', type: 'medieval', consumes: {food: 2, herbs: 1}, supports: {healing: "clerics", burying: .2}, produces: {piety: "clerics"}, cull_order: 6},
            {name: 'labourers', type: 'medieval', consumes: {herbs: 10, leather: 10, metal: 10, piety: 10}, produces: {wonder: 1}, cull_order: 2}
        ],
        variables: [
            {name: "storageInitial", initial: 120},
            {name: "farmers", initial: 1.2},
            {name: "woodcutters", initial: 0.5},
            {name: "miners", initial: 0.2},
            {name: "tanners", initial: 0.5},
            {name: "blacksmiths", initial: 0.5},
            {name: "apothecaries", initial: 0.2},
            {name: "clerics", initial: 0.05},
            {name: "foodSpecialChance", initial: 0.02},
            {name: "woodSpecialChance", initial: 0.02},
            {name: "stoneSpecialChance", initial: 0.01},
            {name: "foodCostInitial", initial: 20},
            {name: "gravesFilled", initial: 0},
            {name: "diseaseCurrent", initial: 0.0003},
            {name: "diseaseSteady", initial: 0.0003}
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
            {name: "nationalism", type: 'civil', costs: {piety: 50000}, upgrades:{serfs:true}}
        ],
        achievements: [
            {name: "hamlet", category:"basic", order:1},
            {name: "village", category:"basic", order:2},
            {name: "small town", title: "Small Town", category:"basic", order:3},
            {name: "large town", title: "Large Town", category:"basic", order:4},
            {name: "small city", title: "Small City", category:"basic", order:5},
            {name: "large city", title: "Large City", category:"basic", order:6},
            {name: "metropolis", category:"basic", order:7},
            {name: "small nation", title: "Small Nation", category:"basic", order:8},
            {name: "nation", category:"basic", order:9},
            {name: "large nation", title: "Large Nation", category:"basic", order:10},
            {name: "empire", category:"basic", order:11},

            {name: "engineer", category:"city"},
            {name: "hated", category:"city"}, //TODO
            {name: "loved", category:"city"}, //TODO
            {name: "ghostTown", title: "Ghost Town", category:"city"}
        ],
        land: [
            {name:'homeland', size:300}
        ],
        land_names: [
            {name: 'thorp', population_min: 0},
            {name: 'hamlet', population_min: 20},
            {name: 'village', population_min: 60},
            {name: 'small town', population_min: 200},
            {name: 'large town', population_min: 2000},
            {name: 'small city', population_min: 5000},
            {name: 'large city', population_min: 10000},
            {name: 'metropolis', population_min: 20000},
            {name: 'small nation', population_min: 50000},
            {name: 'nation', population_min: 100000},
            {name: 'large nation', population_min: 200000},
            {name: 'empire', population_min: 500000}
            //TODO: How to have necropolis in plugin: {name: 'necropolis', population_min: '1000', zombie_multiplier:2}. Pass in a logic test function
        ],
        workflows: [],
        events: []
    };

    CivviesClass.initializeOptions('game_options', _game_options);

})(Civvies);