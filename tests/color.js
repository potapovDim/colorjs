define(['bunit', '../src/color', 'colorutils', 'assert'],
function(bunit, color, utils, assert) {
    var rgba = color.rgba;
    var hsva = color.hsva;
    var hsla = color.hsla;

    var nameToHexTests = function() {
        var pairs = {
            blue: '0000ff',
            green: '008000',
            red: 'ff0000',
            yellow: 'ffff00'
        };

        return utils.map(function(k, v) {
            return function() {
                assert(color.nameToHex(k)).equals(v);
            };
        }, pairs);
    };

    bunit('Name to hex', nameToHexTests());

    var initializers = function(opts) {
        var pairs = {
            colorName: 'red',
            hexWithHash: '#FF0000',
            hexWithoutHash: 'FF0000',
            namedParameter: opts.namedParameter
        };
        var testRed = function(param) {
            return function() {
                utils.context(opts.ob(param), opts.isRed);
            }
        };
        var ret = utils.map(function(k, v) {
            return testRed(v);
        }, pairs);

        ret.noParameters = function() {
            var c = opts.ob();
            var result = c.toArray();

            assert(result).equals([0, 0, 0, 1]);
        };

        return ret;
    };

    bunit('RGBA initializers', initializers({
        ob: rgba,
        namedParameter: {r: 1},
        isRed: function(c) {
            utils.each(function(k, v) {
                assert(c[k]()).equals(v);
            }, {r: 1, g: 0, b: 0, a: 1});
        }
    }));
    bunit('HSVA initializers', initializers({
        ob: hsva,
        namedParameter: {s: 1, v: 1},
        isRed: function(c) {
            utils.each(function(k, v) {
                assert(c[k]()).equals(v);
            }, {h: 0, s: 1, v: 1, a: 1});
        }
    }));
    bunit('HSLA initializers', initializers({
        ob: hsla,
        namedParameter: {s: 1, l: 0.5},
        isRed: function(c) {
            utils.each(function(k, v) {
                assert(c[k]()).equals(v);
            }, {h: 0, s: 1, l: 0.5, a: 1});
        }
    }));

    var getters = function(ob, channels) {
        var names = utils.map(function(k) {
            return 'get' + k.toUpperCase();
        }, channels);
        var methods = utils.map(function(k) {
            return function() {
                var params = {};
                params[k] = 0.5;

                var c = ob(params);

                assert(c[k]()).equals(0.5);
            };
        }, channels);

        return utils.toObject(utils.zip(names, methods));
    };

    var setters = function(ob, channels) {
        var names = utils.map(function(k) {
            return 'set' + k.toUpperCase();
        }, channels);
        var methods = utils.map(function(k) {
            return function() {
                var c = ob();

                c[k](0.5);
                assert(c[k]()).equals(0.5);

                c[k](0);
                assert(c[k]()).equals(0);

                c[k](-100);
                assert(c[k]()).equals(0);

                c[k](100);
                assert(c[k]()).equals(1);
            };
        }, channels);

        return utils.toObject(utils.zip(names, methods));
    };

    var spaces = [
        {name: 'RGBA', ob: rgba, channels: ['r', 'g', 'b', 'a']},
        {name: 'HSVA', ob: hsva, channels: ['h', 's', 'v', 'a']},
        {name: 'HSLA', ob: hsla, channels: ['h', 's', 'l', 'a']}
    ];

    utils.each(function(k) {
        bunit(k.name + ' getters', getters(k.ob, k.channels));
        bunit(k.name + ' setters', setters(k.ob, k.channels));
    }, spaces);

    bunit('toArray', {
        initial: function() {
            assert(hsva().toArray()).equals([0, 0, 0, 1]);
        },
        blue: function() {
            assert(rgba('blue').toArray()).equals([0, 0, 1, 1]);
        }
    });

    bunit('toHex', {
        initial: function() {
            assert(hsva().toHex()).equals('000000');
        },
        redRGBA: function() {
            assert(rgba('red').toHex()).equals('ff0000');
        },
        redHSVA: function() {
            assert(hsva('red').toHex()).equals('ff0000');
        }
    });

    bunit('hex to hsva', {
        gray: function() {
            assert(hsva('7f7f7f').toArray()[2]).between(0.49, 0.51);
        }
    });

    bunit('toCSS', {
        initial: function() {
            assert(hsva({h: 0.5, s: 0.5, v: 1.0}).toCSS()).equals('rgb(127,255,255)');
        },
        blue: function() {
            assert(rgba('blue').toCSS()).equals('rgb(0,0,255)');
        },
        blueWithAlpha: function() {
            assert(hsva('blue').a(0.5).toCSS()).equals('rgba(0,0,255,0.5)');
        }
    });

    bunit('chaining', {
        simpleChain: function() {
            assert(rgba().r(1).g(0.7).b(0.5).a(0.3).toArray()).equals([1, 0.7, 0.5, 0.3]);
        }
    });

    bunit('bounds', {
        lowerBound: function() {
            assert(rgba().r(-5).r()).equals(0);
        },
        upperBound: function() {
            assert(rgba().r(10).r()).equals(1);
        },
        initialBounds: function() {
            assert(rgba({r: -4, g: 10, b: -4, a: 10}).toArray()).equals([0, 1, 0, 1]);
        }
    });

    bunit('type conversions', {
        hsva_rgba: function() {
            assert(rgba(hsva('red')).toArray()).equals([1, 0, 0, 1]);
        },
        rgba_hsva: function() {
            assert(rgba(hsva(rgba('red'))).toArray()).equals([1, 0, 0, 1]);
        },
        rgba_hsla: function() {
            assert(rgba(hsla(rgba('red'))).toArray()).equals([1, 0, 0, 1]);
        },
        alpha: function() {
            assert(hsva(rgba({a: 0.5})).a()).equals(0.5);
        }
    });
});
