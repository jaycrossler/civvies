(function (Civvies) {
    var $mood, $moodHolder;
    var _c = new Civvies('get_private_functions');

    function calculate_mood(game) {
        var data = {text: 'Good', color: '#0000aa'};
        var population = _c.population(game);
        var reasons = [];

        var mood;
        var land_ratio = population.land_max / population.land_current;
        if (land_ratio < .5) {
            mood = 0;
            reasons.push("<span style='color:red'>Hyper overcrowding</span>");
        } else if (land_ratio < .7) {
            mood = .5;
            reasons.push("<span style='color:red'>Very Overcrowded</span>");
        } else if (land_ratio < .8) {
            mood = .7;
            reasons.push("<span style='color:red'>Highly Overcrowded</span>");
        } else if (land_ratio < .9) {
            mood = .8;
            reasons.push("<span style='color:red'>Overcrowded</span>");
        } else if (land_ratio < 1) {
            mood = .9;
            reasons.push("<span style='color:red'>Uncomfortably dense</span>");
        } else if (land_ratio < 1.1) {
            mood = 1.1;
            reasons.push("<span style='color:green'>Comfortable land</span>");
        } else if (land_ratio < 1.2) {
            mood = 1.2;
            reasons.push("<span style='color:green'>Land to grow on</span>");
        } else if (land_ratio < 1.3) {
            mood = 1.5;
            reasons.push("<span style='color:green'>Lots of space to grow</span>");
        } else {
            mood = 1.6;
            reasons.push("<span style='color:green'>Wide open land</span>");
        }

        var current_disease_rate = _c.variable(game, "diseaseCurrent");
        var disease_steady = _c.variable(game, "diseaseSteady");
        if (current_disease_rate > disease_steady * 10) {
            mood -= .5;
            reasons.push("<span style='color:red'>Disease is spreading</span>");
        } else if (current_disease_rate > disease_steady * 6) {
            mood -= .3;
            reasons.push("<span style='color:red'>Dirty conditions</span>");
        } else if (current_disease_rate > disease_steady * 3) {
            mood -= .2;
            reasons.push("<span style='color:red'>Unhealthy living areas</span>");
        } else if (current_disease_rate > disease_steady * 1.5) {
            mood -= .05;
            reasons.push("<span style='color:green'>Some illness</span>");
        } else {
            mood += .03;
            reasons.push("<span style='color:green'>Healthy population</span>");
        }

        //Handle corpses
        var current_corpses = game.data.resources.corpses || 0;
        if (current_corpses > 1000) {
            mood -= .5;
            reasons.push("<span style='color:red'>Rotting corpses everywhere</span>");
        } else if (current_corpses > 500) {
            mood -= .3;
            reasons.push("<span style='color:red'>Too many unburied bodies</span>");
        } else if (current_corpses > 100) {
            mood -= .2;
            reasons.push("<span style='color:red'>Stinking Corpses</span>");
        } else if (current_corpses > 20) {
            mood -= .05;
            reasons.push("<span style='color:green'>Corpses need to be buried</span>");
        } else {
            mood += .03;
        }

        //Gain mood for each of last 3 battles won (but lose it for losses or in progress)
        var battles_to_check = 4;
        var last_battle_results = _.last(game.data.battles, battles_to_check);
        var victories = 0;
        _.each(last_battle_results, function (battle) {
            victories += (battle.victor == battle.player_state);
        });
        if (victories <= -1) {
            reasons.push("<span style='color:red'>No confidence in armies</span>");
        } else if (victories <= 0) {
            reasons.push("<span style='color:red'>Low confidence in armies</span>");
        } else if (victories <= 1) {
            reasons.push("<span style='color:green'>Victorious military history</span>");
        } else if (victories < battles_to_check) {
            reasons.push("<span style='color:green'>Wonderful military history</span>");
        } else {
            reasons.push("<span style='color:green'>Heroic military</span>");
        }
        mood += (victories - (battles_to_check/2)) * .03;

        if (mood < .5) {
            data.text = 'Terrible';
        } else if (mood < .6) {
            data.text = 'Horrible';
        } else if (mood < .7) {
            data.text = 'Angry';
        } else if (mood < .8) {
            data.text = 'Bad';
        } else if (mood < .9) {
            data.text = 'Unhappy';
        } else if (mood < .95) {
            data.text = 'Sad';
        } else if (mood < 1.05) {
            data.text = 'Content';
        } else if (mood < 1.1) {
            data.text = 'Good';
        } else if (mood < 1.15) {
            data.text = 'Happy';
        } else if (mood < 1.2) {
            data.text = 'Very Happy';
        } else if (mood < 1.3) {
            data.text = 'Great';
        } else if (mood < 1.4) {
            data.text = 'Super';
        } else if (mood < 1.5) {
            data.text = 'Excellent';
        } else {
            data.text = 'Wonderful'
        }

        reasons.push("<hr/><i>Mood amount: " + Helpers.round(mood,2) + "</i>");
        if (mood < 1) {
            reasons.push("<span style='color:red'>Workers produce less and fewer special resources are found.</span>");
        } else {
            reasons.push("<span style='color:green'>Workers produce more and additional special resources are found.</span>");
        }

        data.color = Helpers.blendColors('red','blue', maths.clamp(mood / 1.5,0,1));
        data.textColor = Helpers.getColorWithBackground(data.color);
        data.reasons = reasons.join(".<br>");

        mood = maths.clamp(mood, 0.5, 1.5);
        _c.variable (game, "happiness", mood);

        return data;
    }

    function build_mood_controls(game) {
        var mood_current = calculate_mood(game);

        $moodHolder = $('<div>')
            .addClass('population_holder')
            .popover({content:mood_current.reasons, trigger:'hover', placement:'bottom', html:true})
            .insertAfter($('#populationContainer').find('h3').first());
        $('<span>')
            .text("Mood: ")
            .appendTo($moodHolder);
        $mood = $("<span>")
            .addClass('number')
            .text(mood_current.text)
            .appendTo($moodHolder);
        $moodHolder.css({backgroundColor: mood_current.color, color: mood_current.textColor});
    }

    function redraw_mood(game) {
        var mood_current = calculate_mood(game);
        $mood
            .text(mood_current.text);
        $moodHolder
            .css({backgroundColor: mood_current.color, color: mood_current.textColor})
            .data('bs.popover').options.content = mood_current.reasons;
    }


    _c.variable = function (game, var_name, set_to) {
        if (set_to === undefined) {
            var amount = game.data.variables[var_name];
            var mood = game.data.variables.happiness || 1;
            var mood_modifier = 1;

            if (var_name == "farmers" || var_name == "woodcutters" || var_name == "miners") {
                mood_modifier = 3;
            } else if (var_name == "foodSpecialChance" || var_name == "woodSpecialChance" || var_name == "stoneSpecialChance") {
                mood_modifier = 4;
            }
            //Multiple some variables based on the positive or negative mood
            if (mood_modifier > 1) {
                amount += amount * ((mood-1) / mood_modifier);
            }
            return amount;
        } else {
            game.data.variables[var_name] = set_to;
        }
    };

    new Civvies('add_game_option', 'variables', {name: "happiness", initial: 1});

    new Civvies('add_game_option', 'functions_on_setup', build_mood_controls);
    new Civvies('add_game_option', 'functions_each_tick', redraw_mood);

})(Civvies);