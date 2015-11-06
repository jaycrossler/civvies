var Civvies = (function ($, _, Helpers, maths) {
    //Uses jquery and Underscore

    //TODO: Allow all plugins to be turned on and off dynamically
    //TODO: Move all Rand functions to Helpers and pass in a custom random() function
    //-----------------------------
    //Private Global variables
    var version = '0.0.3',
        summary = 'HTML game engine to simulate civilization or city building.',
        author = 'Jay Crossler - http://github.com/jaycrossler',
        file_name = 'civvies.js';

    var _data = {};
    var _game_options = {};

    //-----------------------------
    //Initialization
    function CivviesClass(option1, option2, option3) {
        this.version = file_name + ' (version ' + version + ') - ' + summary + ' by ' + author;
        this.timing_log = [];
        this.game_options = null;
        this.times_game_drawn = 0;
        this.initialization_seed = null;

        return this.api(option1, option2, option3);
    }

    CivviesClass.prototype.api = function (option1, option2, option3) {
        if (option1 == 'get_private_functions') {
            return this._private_functions;
        } else if (option1 == 'add_game_option') {
            _game_options[option2] = _game_options[option2] || [];
            if (_.isArray(option3)) {
                _game_options[option2] = _game_options[option2].concat(option3);
            } else {
                _game_options[option2].push(option3);
            }
        } else if (option1 == 'set_game_option') {
            _game_options[option2] = option3;
        } else if (option1 == 'get_game_options') {
            return _game_options;
        } else if (option1 == 'get_game_option_category') {
            return _game_options[option2];
        } else if (option1 == '') {
            //Class initialized
        } else {
            this.drawOrRedraw(option1, option2, option3);
        }
    };

    CivviesClass.prototype.data = _data;

    CivviesClass.prototype.initializeOptions = function (option_type, options) {
        if (option_type == 'game_options') {
            _game_options = options;
        }
    };

    CivviesClass.prototype.drawOrRedraw = function (game_options) {
        //Begin timing loop
        var timing_start = window.performance.now();
        var game = this;

        //Set up initialization data if not previously set
        if (game.game_options === null) {
            game.initialization_seed = null;
        }
        game.initialization_options = game_options || game.initialization_options || {};
        game.game_options = $.extend({}, game.game_options || _game_options, game_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        game_options = game_options || {};
        var rand_seed = game_options.rand_seed || game.initialization_seed || Math.floor(Math.random() * 100000);
        game.initialization_seed = rand_seed;
        game.initialization_options.rand_seed = rand_seed;
        game.randomSetSeed(rand_seed);

        if (!game.data.gui_drawn && game._private_functions.buildInitialDisplay) {
            var game_was_loaded = game._private_functions.load(game, 'localStorage');
            game._private_functions.buildInitialData(game);
            if (!game_was_loaded) {
                game._private_functions.buildInitialDisplay(game);
            }
            game.data.gui_drawn = true;
        }

        //Run all functions added by plugins
        _.each(game.game_options.functions_on_setup, function (func) {
            func(game);
        });

        //Begin Game Simulation
        game.start(game.game_options);

        //Log timing information
        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        game.timing_log.push({name: "Game UI built", elapsed: time_elapsed, times_redrawn: game.times_game_drawn});
    };

    //-----------------------------
    //Supporting functions
    CivviesClass.prototype.log = function (showToConsole, showHTML) {
        var log = "Civvies: [seed:" + this.game_options.rand_seed + " #" + this.times_game_drawn + "]";
        _.each(this.timing_log, function (log_item) {
            if (log_item.name == 'exception') {
                if (log_item.ex && log_item.ex.name) {
                    log += "\n -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                } else if (log_item.msg) {
                    log += "\n -- EXCEPTION: " + log_item.msg;
                } else {
                    log += "\n -- EXCEPTION";
                }
            } else if (log_item.elapsed) {
                log += "\n - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
            } else {
                log += "\n - " + log_item.name;
            }
        });

        if (showToConsole) console.log(log);
        if (showHTML) log = log.replace(/\n/g, '<br/>');
        return log;
    };
    CivviesClass.prototype.logMessage = function (msg, showToConsole) {
        if (_.isString(msg)) msg = {name: msg};

        this.timing_log.push(msg);
        if (showToConsole) {
            console.log(JSON.stringify(msg));
        }
        if (this._private_functions.log_display) {
            this._private_functions.log_display(this);
        }
    };
    CivviesClass.prototype.lastTimeDrawn = function () {
        var time_drawn = 0;
        var last = _.last(this.timing_log);
        if (last) time_drawn = last.elapsed;

        return time_drawn;
    };

    CivviesClass.prototype.getSeed = function (showAsString) {
        var result = this.initialization_options || {};
        return showAsString ? JSON.stringify(result) : result;
    };

    CivviesClass.prototype.start = function (game_options) {
        if (this._private_functions.start_game_loop) {
            this._private_functions.start_game_loop(this, game_options);
        } else {
            throw "Game loop not found";
        }
    };
    CivviesClass.prototype.stop = function () {
        if (this._private_functions.stop_game_loop) {
            this._private_functions.stop_game_loop(this);
        }
    };

    //----------------------
    //Random numbers
    CivviesClass.prototype.randomSetSeed = function (seed) {
        this.game_options = this.game_options || {};
        this.game_options.rand_seed = seed || Math.random();
    };

    function random(game_options) {
        game_options = game_options || {};
        game_options.rand_seed = game_options.rand_seed || Math.random();
        var x = Math.sin(game_options.rand_seed++) * 300000;
        return x - Math.floor(x);
    }

    function randInt(max, game_options) {
        max = max || 100;
        return parseInt(random(game_options) * max + 1);
    }

    function randOption(options, game_options, dontUseVal) {
        var len = options.length;
        var numChosen = randInt(len, game_options) - 1;
        var result = options[numChosen];
        if (dontUseVal) {
            if (result == dontUseVal) {
                numChosen = (numChosen + 1) % len;
                result = options[numChosen];
            }
        }
        return result;
    }

    function randHistogram(center, tries, game_options, min, max) {
        //NOTE: This breaks down when 'center' is below 5% or above 95% (depending on how many tries are used), for that use randAverage
        var closest = 1;
        min = min || 0;
        max = max || 1;
        var multiplier = max - min;
        var modified_center = (center - min) / multiplier;

        for (var i = 0; i < tries; i++) {
            var roll = random(game_options);
            if (Math.abs(roll - modified_center) < Math.abs(closest - modified_center)) {
                closest = roll;
            }
        }
        return (closest * multiplier) + min;
    }
    function randAverage(rolls, chance, stddev, game_options) {
        stddev = stddev || 5;
        var expected = chance * rolls;
        var expected_modifier = randHistogram(.5, stddev, game_options);

        return expected * expected_modifier * 2;
    }
    function randRange (minVal, maxVal, game_options, floatVal) {
        //optional Floatval specifies number of decimal points
        var randVal = minVal + (random(game_options) * (maxVal - minVal + 1));
        return (floatVal !== undefined) ? Math.round(randVal - .5) : randVal.toFixed(floatVal);
    }

    function randManyRolls(rolls, chance, game_options) {
        var successes = 0;
        if (rolls < 100) {
            for (var i = 0; i < rolls; i++) {
                if (random(game_options) < chance) successes++;
            }
        } else {
            //Note, using two different randomization options for large numbers, both have different accuracies/stddevs
            if (chance < .07 || chance > .93) {
                successes = randAverage(rolls, chance, 3, game_options);
            } else {
                successes = randHistogram(rolls * chance, Math.pow(rolls, 1 / 2), game_options, 0, rolls);
            }
        }

        return Math.round(successes);
    }

    CivviesClass.prototype._private_functions = {
        random: random,
        randInt: randInt,
        randOption: randOption,
        randRange: randRange,
        randManyRolls: randManyRolls,
        randHistogram: randHistogram
    };

    return CivviesClass;
})($, _, Helpers, maths);

Civvies.initializeOptions = function (option_type, options) {
    var civ_pointer = new Civvies('');
    civ_pointer.initializeOptions(option_type, options);
};


//TODO: Move to a jasmine test
function test_hist() {
    var totals = [];
    var times = 10000, rolls = 1000;
    _.each([.999,.995,.99,.9,.8,.7,.6,.5,.4,.3,.2,.1,.075,.05,.025,.01,.005,.001,.0005,.0001],function(chance){
        var expected = rolls*chance;
        var roll_results = [];
        for (var i=0; i< times; i++) {
            roll_results.push(game._private_functions.randManyRolls(rolls,chance, game.game_options));
        }

        var avg = 0;
        for (var i=0; i< times; i++) {
            avg += roll_results[i];
        }
        avg /= times;
        var diff_h = avg - expected;
        var first_h = roll_results[0];

//        //------------
//        roll_results = [];
//        for (var i=0; i< times; i++) {
//            roll_results.push(game._private_functions.randManyRolls(rolls,chance, game.game_options, true));
//        }
//        avg = 0;
//        for (var i=0; i< times; i++) {
//            avg += roll_results[i];
//        }
//        avg /= times;
//        var diff_a = avg - expected;
//        var first_a = roll_results[0];
//

        //------------
//        totals.push({chance:chance, expected: expected, first_hist: first_h, difference_using_hist:diff_h, first_avg: first_a, difference_using_avg:diff_a});
        totals.push({chance:chance, expected: expected, first_hist: first_h, difference_using_hist:diff_h});
    });
    console.table(totals);
}