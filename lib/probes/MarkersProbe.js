var Q = require('q'),
util = require('util'),
events = require('events'),
helpers = require('../helpers'),
wd = require('wd'),
debug = require('debug')('bp:probes:MarkersProbe');

function MarkersProbe(id) {
    if (id) {
        this.id = id;
    }
    debug('Initialize');
    events.EventEmitter.call(this);
}

util.inherits(MarkersProbe, events.EventEmitter);

MarkersProbe.prototype.id = 'MarkersProbe';

MarkersProbe.prototype.teardown = function(browser) {
    debug('teardown');

	var code = function() {
		var requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, 1000 / 60);
				};
		})().bind(window);

		requestAnimationFrame(function() {
			var result = {};
			var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;
			if (typeof performance !== 'undefined') {
                var allMarkers = performance.getEntriesByType('measure');
                allMarkers.forEach(function(marker) {
                    // TODO: Add support for browsers do not generate numeric value (i.e. FireFox)
                    if (typeof marker.duration === 'number') {
                        var names = marker.name.split(',');
                        for (name of names) {
                            name = name.trim();
                            var duration = marker.duration;
                            if (name.indexOf('-') === 0) {
                                name = name.slice(1);
                                duration = -1 * duration;
                            }
                            if (result[name] !== undefined) {
                                result[name] += duration
                            } else {
                                result[name] = duration
                            }                                
                        }
                    }
                })
            }
			window.__perfMarkers = result;
		});
	};

	var me = this;
	return browser.execute(helpers.fnCall(code)).then(function() {
		return browser.waitFor({
			asserter: wd.asserters.jsCondition('(typeof window.__perfMarkers !== "undefined")', false),
			timeout: 1000 * 60 * 10,
			pollFreq: 1000
		});
	}).then(function(res) {
		return browser.eval('window.__perfMarkers');
	}).then(function(res) {
		me.emit('data', res);
	});
};

module.exports = MarkersProbe;