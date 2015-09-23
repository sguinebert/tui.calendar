/**
 * @fileoverview Guide element for Allday.Creation
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';
var util = global.ne.util;
var domutil = require('../../common/domutil');
var reqAnimFrame = require('../../common/reqAnimFrame');
var config = require('../../config');
var EVENT_TOP_MARGIN = config.monthweek.view.EVENT_TOP_MARGIN;
var TEXT_FOR_NEW_EVENT = config.monthweek.handler.guide.TEXT_FOR_NEW_EVENT;

/**
 * Class for Allday.Creation dragging effect.
 * @constructor
 * @param {AlldayCreation} alldayCreation - instance of AlldayCreation.
 */
function AlldayCreationGuide(alldayCreation) {
    /**
     * @type {AlldayCreation}
     */
    this.alldayCreation = alldayCreation;

    /**
     * @type {HTMLDIVElement}
     */
    this.eventContainer = null;

    /**
     * @type {HTMLDIVElement}
     */
    this.guideElement = document.createElement('div');

    this.initializeGuideElement();

    alldayCreation.on({
        'allday_creation_dragstart': this._onDragStart,
        'allday_creation_drag': this._onDrag,
        'allday_creation_dragend': this._clearGuideElement,
        'allday_creation_click': this._clearGuideElement
    }, this);
}

/**
 * Destroy method
 */
AlldayCreationGuide.prototype.destroy = function() {
    this._clearGuideElement();
    this.alldayCreation.off(this);
    this.alldayCreation = this.eventContainer =
        this.guideElement = null;
};

/**
 * initialize guide element's default style.
 */
AlldayCreationGuide.prototype.initializeGuideElement = function() {
    var guideElement = this.guideElement,
        alldayView = this.alldayCreation.alldayView,
        eventBlockHeight = alldayView.options.eventBlockHeight,
        spanElement;

    domutil.addClass(guideElement, 'schedule-view-allday-creation-guide-block');
    domutil.appendHTMLElement('div', guideElement, 'schedule-view-allday-creation-guide');
    spanElement = domutil.appendHTMLElement('span', guideElement);
    spanElement.innerHTML = TEXT_FOR_NEW_EVENT;

    guideElement.style.height = (eventBlockHeight - EVENT_TOP_MARGIN) + 'px';
};

/**
 * Refresh guide element.
 * @param {object} eventData - event data from Allday.Creation handler.
 */
AlldayCreationGuide.prototype._refreshGuideElement = function(eventData) {
    var guideElement = this.guideElement,
        baseWidthPercent = (100 / eventData.datesInRange),
        dragStartXIndex = eventData.dragStartXIndex,
        xIndex = eventData.xIndex,
        length = xIndex - dragStartXIndex,
        leftPercent,
        widthPercent;

    // when revert dragging.
    if (length < 0) {
        dragStartXIndex = xIndex;
        length = Math.abs(length);
    }

    leftPercent = baseWidthPercent * dragStartXIndex;
    widthPercent = baseWidthPercent * (length + 1);

    reqAnimFrame.requestAnimFrame(function() {
        guideElement.style.display = 'block';
        guideElement.style.left = leftPercent + '%';
        guideElement.style.width = widthPercent + '%';
    });
};

/**
 * Clear guide element.
 */
AlldayCreationGuide.prototype._clearGuideElement = function() {
    var guideElement = this.guideElement;

    domutil.remove(guideElement);

    guideElement.style.display = 'none';
    guideElement.style.left = '';
    guideElement.style.width = '';
};

/**
 * DragStart event handler.
 * @param {object} dragStartEventData - event data object of Allday.Creation.
 */
AlldayCreationGuide.prototype._onDragStart = function(dragStartEventData) {
    var alldayCreation = this.alldayCreation,
        alldayView = alldayCreation.alldayView,
        alldayContainerElement = alldayView.container,
        eventContainer = domutil.find('.schedule-view-monthweek-events', alldayContainerElement);

    eventContainer.appendChild(this.guideElement);
    this._refreshGuideElement(dragStartEventData);
};

/**
 * Drag event handler.
 * @param {object} dragEventData - event data object of Allday.Creation.
 */
AlldayCreationGuide.prototype._onDrag = function(dragEventData) {
    this._refreshGuideElement(dragEventData);
};

module.exports = AlldayCreationGuide;
