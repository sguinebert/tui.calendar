/**
 * @fileoverview Core methods for dragging actions
 */
'use strict';

var util = require('tui-code-snippet');
var common = require('../../common/common');
var datetime = require('../../common/datetime');
var domevent = require('../../common/domevent');
var Point = require('../../common/point');
var TZDate = require('../../common/timezone').Date;

/**
 * @mixin Time.Core
 */
var timeCore = {
    /**
     * Get Y index ratio(hour) in time grids by supplied parameters.
     * @param {number} baseMil - base milliseconds number for supplied height.
     * @param {number} height - container element height.
     * @param {number} y - Y coordinate to calculate hour ratio.
     * @returns {number} hour index ratio value.
     */
    _calcGridYIndex: function(baseMil, height, y) {
        // get ratio from right expression > point.y : x = session.height : baseMil
        // and convert milliseconds value to hours. // [0.083334, 0.166667, 0.25, 0.33334, 0.416667, 0.5, 0.58334, 0.666667, 0.75, 0.83334, 0.916667, 1]); //[0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9, 1]);
        var result = datetime.millisecondsTo('hour', (y * baseMil) / height),
            floored = result | 0,
            nearest = common.nearest(result - floored, [0, 0.0166666675, 0.0333333351, 0.0500000045, 0.0666666701, 0.0833333358, 0.100000001, 0.116666667, 0.13333334, 0.150000006, 0.166666672, 0.183333337, 0.200000003, 0.216666669, 0.233333334, 0.25, 0.266666681, 0.283333361, 0.300000042, 0.316666722, 0.333333403, 0.350000083, 0.366666764, 0.383333445, 0.400000125, 0.416666806, 0.433333486, 0.450000167, 0.466666847, 0.483333528, 0.500000179, 0.51666683, 0.53333348, 0.550000131, 0.566666782, 0.583333433, 0.600000083, 0.616666734, 0.633333385, 0.650000036, 0.666666687, 0.683333337, 0.699999988, 0.716666639, 0.73333329, 0.74999994, 0.766666591, 0.783333242, 0.799999893, 0.816666543, 0.833333194, 0.849999845, 0.866666496, 0.883333147, 0.899999797, 0.916666448, 0.933333099, 0.94999975, 0.9666664, 0.983333051, 0.999999702]); 

            return floored + nearest;
    },

    /**
     * Get function to makes event data from Time and mouseEvent
     * @param {Time} timeView - Instance of time view.
     * @returns {function} - Function that return event data from mouse event.
     */
    _retriveScheduleData: function(timeView) {
        var self = this,
            container = timeView.container,
            options = timeView.options,
            viewHeight = timeView.getViewBound().height,
            viewTime = timeView.getDate(),
            hourLength = options.hourEnd - options.hourStart,
            baseMil = datetime.millisecondsFrom('hour', hourLength);

        /**
         * @param {MouseEvent} mouseEvent - mouse event object to get common event data.
         * @param {object} [extend] - object to extend event data before return.
         * @returns {object} - common event data for time
         */
        return function(mouseEvent, extend) {
            var mouseY = Point.n(domevent.getMousePosition(mouseEvent, container)).y,
                gridY = common.ratio(viewHeight, hourLength, mouseY),
                timeY = new TZDate(viewTime).addMinutes(datetime.minutesFromHours(gridY)),
                nearestGridY = self._calcGridYIndex(baseMil, viewHeight, mouseY),
                nearestGridTimeY = new TZDate(viewTime).addMinutes(
                    datetime.minutesFromHours(nearestGridY + options.hourStart)
                );

            return util.extend({
                target: domevent.getEventTarget(mouseEvent),
                relatedView: timeView,
                originEvent: mouseEvent,
                mouseY: mouseY,
                gridY: gridY,
                timeY: timeY,
                nearestGridY: nearestGridY,
                nearestGridTimeY: nearestGridTimeY,
                triggerEvent: mouseEvent.type
            }, extend);
        };
    },

    /**
     * Get function to makes event data from Time and mouseEvent
     * @param {Time} timeView - Instance of time view.
     * @param {TZDate} startDate - start date
     * @param {TZDate} endDate - end date
     * @param {number} hourStart Can limit of render hour start.
     * @returns {object} - common event data for time from mouse event.
     */
    _retriveScheduleDataFromDate: function(timeView, startDate, endDate, hourStart) {
        var viewTime = timeView.getDate();
        var gridY, timeY, nearestGridY, nearestGridTimeY, nearestGridEndY, nearestGridEndTimeY;

        gridY = startDate.getHours() - hourStart + getNearestHour(startDate.getMinutes());
        timeY = new TZDate(viewTime).addMinutes(datetime.minutesFromHours(gridY));
        nearestGridY = gridY;
        nearestGridTimeY = new TZDate(viewTime).addMinutes(datetime.minutesFromHours(nearestGridY));
        nearestGridEndY = endDate.getHours() - hourStart + getNearestHour(endDate.getMinutes());
        nearestGridEndTimeY = new TZDate(viewTime).addMinutes(datetime.minutesFromHours(nearestGridEndY));

        return {
            target: timeView,
            relatedView: timeView,
            gridY: gridY,
            timeY: timeY,
            nearestGridY: nearestGridY,
            nearestGridTimeY: nearestGridTimeY,
            nearestGridEndY: nearestGridEndY,
            nearestGridEndTimeY: nearestGridEndTimeY,
            triggerEvent: 'manual',
            hourStart: hourStart
        };
    },

    /**
     * Mixin method.
     * @param {(TimeCreation|TimeMove)} obj - Constructor functions
     */
    mixin: function(obj) {
        var proto = obj.prototype;
        util.forEach(timeCore, function(method, methodName) {
            if (methodName === 'mixin') {
                return;
            }

            proto[methodName] = method;
        });
    }
};

/**
 * Get the nearest hour
 * @param {number} minutes - minutes
 * @returns {number} hour
 */
function getNearestHour(minutes) {
    var nearestHour;
    if (minutes === 0) {
        nearestHour = 0;
    } else if (minutes > 30) {
        nearestHour = 1;
    } else if (minutes <= 30) {
        nearestHour = 0.5;
    }

    return nearestHour;
}

module.exports = timeCore;
