var enemies = [
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
];

new Civvies('add_game_option', 'arrays_to_map_to_arrays', 'enemies');
new Civvies('add_game_option', 'enemies', enemies);