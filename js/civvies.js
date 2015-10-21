var Civvies = (function ($, _, Helpers, maths) {
    //Uses jquery and Underscore

    //-----------------------------
    //Private Global variables
    var version = '0.0.1',
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

        return this.initialize(option1, option2, option3);
    }
    CivviesClass.prototype.initialize = function(option1, option2, option3) {
        this.drawOrRedraw(option1, option2, option3);
    };

    CivviesClass.prototype.data = _data;

    CivviesClass.prototype.initializeOptions = function (option_type, options) {
        if (option_type == 'game_options') {
            _game_options = options;
        }
    };

    CivviesClass.prototype.drawOrRedraw = function (game_options) {
        var timing_start = window.performance.now();

        if (this.game_options === null) {
            this.initialization_seed = null;
        }

        this.initialization_options = game_options || this.initialization_options || {};

        this.game_options = $.extend({}, this.game_options || _game_options, game_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        game_options = game_options || {};
        var rand_seed = game_options.rand_seed || this.initialization_seed || Math.floor(Math.random() * 100000);
        this.initialization_seed = rand_seed;
        this.initialization_options.rand_seed = rand_seed;


        this.randomSetSeed(rand_seed);



        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        this.timing_log.push({name: "build-elapsed", elapsed: time_elapsed, times_redrawn: this.times_game_drawn});
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
    CivviesClass.prototype.logMessage = function (msg) {
        if (_.isString(msg)) msg = {name:msg};

        this.timing_log.push(msg);
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

    CivviesClass.prototype._private_functions = {
        random: random,
        randInt: randInt,
        randOption: randOption
    };

    return CivviesClass;
})($, _, Helpers, maths);

Civvies.initializeOptions = function (option_type, options) {
    var civ_pointer = new Civvies('');
    civ_pointer.initializeOptions(option_type, options);
};