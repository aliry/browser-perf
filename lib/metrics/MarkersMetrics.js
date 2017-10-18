var Q = require('q'),
debug = require('debug')('bp:metrics:MarkersMetrics'),
BaseMetrics = require('./BaseMetrics');

function MarkersMetrics(probes) {
    BaseMetrics.apply(this, [{
        probes: probes
    }]);
}
require('util').inherits(MarkersMetrics, BaseMetrics);

MarkersMetrics.prototype.id = 'MarkersMetrics';
MarkersMetrics.prototype.probes = ['MarkersProbe'];

MarkersMetrics.prototype.onData = function(data) {
    debug('onData Method called');
    this.__data = data;
}

MarkersMetrics.prototype.onError = function() {
    debug('onError Method called');
}

MarkersMetrics.prototype.getResults = function() {
    debug('Get Results called');
	return this.__data;
}

module.exports = MarkersMetrics;