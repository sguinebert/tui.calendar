/**
 * @fileoverview View of days UI.
 * @author NHN Ent. FE Development Team <e0242@nhnent.com>
 */
'use strict';

var util = global.ne.util;
var domutil = require('../common/domutil');
var datetime = require('../datetime');
var View = require('./view');

/**********
 * Sub views
 **********/
var TimeGrid = require('./timeGrid');

/**
 * @constructor
 * @param {Base.Week} controller The controller mixin part.
 * @param {object} options View options
 * @param {Date} [options.renderStartDate] Start date of render. if not supplied then use -3d from today.
 * @param {Date} [options.renderEndDate] End date of render. if not supplied then use +3d from today.
 * @param {HTMLElement} container The element to use container for this view.
 * @extends {View}
 */
function Week(controller, options, container) {
    var range;

    View.call(this, null, container);

    range = this._getRenderDateRange(new Date());

    /**
     * @type {object} Options for view.
     */
    this.options = util.extend({
        renderStartDate: range.start,
        renderEndDate: range.end
    }, options);

    /**
     * Week controller mixin.
     * @type {Base.Week}
     */
    this.controller = controller;

    domutil.addClass(container, 'view-days-container');
    domutil.disableTextSelection(container);

    //TODO: add childs need to in service code (or factory)
    this.addChild(new TimeGrid(
        null,
        domutil.appendHTMLElement(
            'div',
            container
        )
    ));
}

util.inherit(Week, View);

/**********
 * Prototype props
 **********/

/**
 * Calculate default render date range from supplied date.
 * @param {Date} baseDate base date.
 * @returns {object} date range.
 */
Week.prototype._getRenderDateRange = function(baseDate) {
    var base = datetime.start(baseDate),
        start = new Date(+base),
        end = new Date(+base);

    start.setDate(start.getDate() - 3);
    end.setDate(end.getDate() + 3);

    return {
        start: start,
        end: end
    };
};

module.exports = Week;
