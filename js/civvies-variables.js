(function (CivviesClass) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        autosave_every: 60,
        autosave: true,

        functions_on_setup:[],
        functions_each_tick:[],

        arrays_to_map_to_objects: 'resources,buildings,populations,variables,upgrades,achievements'.split(','),
        arrays_to_map_to_arrays: 'land,workflows'.split(','),

        resources: [
            //Note: Grouping 1 is clickable by user to gather resources manually
            {name: 'food', grouping: 1, image: '../images/civclicker/food.png', chances: [{chance: "foodSpecialChance", resource: 'herbs'}], amount_from_click: 1},
            {name: 'wood', grouping: 1, image: '../images/civclicker/wood.png', chances: [{chance: "woodSpecialChance", resource: 'skins'}], amount_from_click: 1},
            {name: 'stone', grouping: 1, image: '../images/civclicker/stone.png', chances: [{chance: "stoneSpecialChance", resource: 'ore'}], amount_from_click: 1},

            {name: 'herbs', grouping: 2, image: '../images/civclicker/herbs.png', notes: "Found sometimes when gathering food or by farmers"},
            {name: 'skins', grouping: 2, image: '../images/civclicker/skins.png', notes: "Found sometimes when collecting wood or by woodcutters"},
            {name: 'ore', grouping: 2, image: '../images/civclicker/ore.png', notes: "Found sometimes when mining ore or by miners"},

            {name: 'leather', grouping: 2, image: '../images/civclicker/leather.png', notes: "Created from Skins by Tanners working in a Tannery"},
            {name: 'metal', grouping: 2, image: '../images/civclicker/metal.png', notes: "Created from Ore by Blacksmiths working in a Smithy"},

            {name: 'piety', grouping: 2, image: '../images/civclicker/piety.png', notes: "Created by Clerics working in a Temple"},
            {name: 'corpses', grouping: 2, image: '../images/civclicker/piety.png', notes: "Created when towns people die from starvation or fighting"},

            {name: 'healing', grouping: 3, image: '../images/civclicker/piety.png', notes: "Created by Clerics and Apothecaries"}
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
            {name: 'temple', type: 'business', costs: {wood: 30, stone: 120, herbs: 10}, supports: {clerics: 1, piety:2000, gold:5}, upgrades:{masonry:true}, land_size:2},

            {name: 'mill', type: 'upgrade', costs: {wood: 100, stone: 100}, options: {food_efficiency: .1}, upgrades: {wheel: true}, notes: "Improves Farming Efficiency"},
            {name: 'graveyard', type: 'upgrade', costs: {wood: 50, stone: 200, herbs: 50}, options: {grave_spot: 100}, notes: "Increases Grave Plots", upgrades:{writing:true}} //TODO: Should graves be a resource?
        ],
        populations: [
            {name: 'unemployed', title: 'Unemployed Worker', type: 'basic', notes: "Unassigned Workers that eat up food", unassignable: true, cull_order: 2, doesnt_consume_food:true},
            {name: 'sick', type: 'basic', notes: "Sick workers that need medical help", unassignable: true, cull_order: 1},

            {name: 'farmers', type: 'basic', produces: {food: "farmers"}, doesnt_require_building: true, cull_order: 10},
            {name: 'woodcutters', type: 'basic', produces: {wood: "woodcutters"}, doesnt_require_building: true, cull_order: 9},
            {name: 'miners', type: 'basic', produces: {stone: "miners"}, doesnt_require_building: true},

            {name: 'tanners', type: 'medieval', consumes: {skins: 1}, produces: {leather: "tanners"}},
            {name: 'blacksmiths', type: 'medieval', consumes: {ore: 1}, produces: {metal: "blacksmiths"}},
            {name: 'apothecaries', type: 'medieval', consumes: {herbs: 1}, supports: {healing: "apothecaries"}},
            {name: 'clerics', type: 'medieval', consumes: {food: 2, herbs: 1}, supports: {healing: .1, burying: 5}, produces: {piety: "clerics"}, cull_order: 6},
            {name: 'labourers', type: 'medieval', consumes: {herbs: 10, leather: 10, metal: 10, piety: 10}, produces: {wonder: 1}, cull_order: 2}
        ],
        variables: [
            {name: "storageInitial", initial: 120},
            {name: "happiness", initial: 1},
            {name: "farmers", initial: 1.2},
            {name: "pestBonus", initial: 0},
            {name: "woodcutters", initial: 0.5},
            {name: "miners", initial: 0.2},
            {name: "tanners", initial: 0.5},
            {name: "blacksmiths", initial: 0.5},
            {name: "apothecaries", initial: 0.1},
            {name: "clerics", initial: 0.05},
            {name: "foodSpecialChance", initial: 0.02},
            {name: "woodSpecialChance", initial: 0.02},
            {name: "stoneSpecialChance", initial: 0.01},
            {name: "foodCostInitial", initial: 20}
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
            {name: "hamlet"},
            {name: "village"},
            {name: "small town", title: "Small Town"},
            {name: "large town", title: "Large Town"},
            {name: "small city", title: "Small City"},
            {name: "large city", title: "Large City"},
            {name: "metropolis"},
            {name: "small nation", title: "Small Nation"},
            {name: "nation"},
            {name: "large nation", title: "Large Nation"},

            {name: "empire"},
            {name: "raider"},
            {name: "engineer"},
            {name: "domination"},
            {name: "hated"},
            {name: "loved"},
            {name: "cat", title: "Cat!"},
            {name: "glaring"},
            {name: "clowder"},
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
        ],
        land: [
            {name:'homeland', size:1000}
        ],
        enemies: [
            {name: 'wolves', humans:false, technology:'none', warfare:'medium', strength:'low', size_min:4, size_max:40, siege_weapons:false, scouts:false},
            {name: 'lions', humans:false, technology:'none', warfare:'medium', strength:'medium', size_min:4, size_max:40, siege_weapons:false, scouts:false},
            {name: 'rampaging elephants', humans:false, technology:'none', warfare:'low', strength:'high', size_min:10, size_max:60, siege_weapons:false, scouts:false},
            {name: 'locusts', humans:false, technology:'none', warfare:'none', strength:'low', size_min:10000, size_max:100000, siege_weapons:false, scouts:false},
            {name: 'fire ants', humans:false, technology:'none', warfare:'low', strength:'tiny', size_min:10000, size_max:100000, siege_weapons:false, scouts:false},
            {name: 'pillaging dragon', humans:false, basic:false, magic:true, technology:'medium', warfare:'great', strength:'great', weapon:'fireball', armor:'impenetrable scales', damage_bonus:'great', defense_bonus:'great', size_min:1, size_max:1, siege_weapons:false, scouts:false},
            {name: 'zombie swarm', humans:false, basic:false, undead:true, technology:'none', warfare:'none', strength:'great', size_min:10, size_max:4000, siege_weapons:false, scouts:false, no_tribute:true},
            {name: 'dragon riders', humans:false, basic:false, magic:true, technology:'medium', warfare:'high', strength:'great', weapon:'fireball', armor:'impenetrable scales', damage_bonus:'high', defense_bonus:'high', size_min:2, size_max:8, siege_weapons:false, scouts:false},

            {name: 'barbarians', humans:true, technology:'low', mounted:.3, warfare:'medium', strength:'medium', size_min:20, size_max:200, siege_weapons:false, scouts:true},
            {name: 'raiders', humans:true, technology:'low', mounted:.5, warfare:'medium', strength:'high', size_min:30, size_max:600, siege_weapons:false, scouts:true},
            {name: 'horse warriors', humans:true, technology:'medium', mounted:.9, warfare:'high', strength:'medium', size_min:100, size_max:2000, siege_weapons:true, scouts:true},
            {name: 'refugees', humans:true, basic:false, technology:'low', mounted:.1, warfare:'none', strength:'low', size_min:100, size_max:2000, siege_weapons:false, scouts:false, can_welcome:true},
            {name: 'heroic knights', humans:true, technology:'medium', mounted:.9, warfare:'high', strength:'great', size_min:10, size_max:100, siege_weapons:true, scouts:true},
            {name: 'army', humans:true, technology:'medium', mounted:.1, warfare:'high', strength:'medium', size_min:100, size_max:2000, siege_weapons:true, scouts:true},
            {name: 'inquisition army', humans:true, technology:'medium', mounted:.2, warfare:'high', strength:'low', size_min:200, size_max:4000, siege_weapons:true, scouts:true},
            {name: 'crusaders', humans:true, technology:'medium', mounted:.3, warfare:'high', strength:'medium', size_min:300, size_max:4000, siege_weapons:true, scouts:true, no_tribute:true}
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
        workflows: []
    };

    CivviesClass.initializeOptions('game_options', _game_options);

})(Civvies);