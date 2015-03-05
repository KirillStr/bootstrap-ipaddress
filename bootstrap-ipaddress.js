/**
 * IP Address Widget for Bootstrap 3
//! version : 0.0.0
 */
; (function (factory) {
    if (typeof window.define === 'function' && window.define.amd) {
        // AMD is used - Register as an anonymous module.
        window.define(['jquery'], factory);
    } else {
        // AMD is not used - Attempt to fetch dependencies from scope.
        if (!jQuery) {
            throw 'bootstrap-ipaddress requires jQuery to be loaded first';
        } else {
            factory(jQuery);
        }
    }
}

(function ($) {

    var dpgId = 0,

// ReSharper disable once InconsistentNaming
    IPAddress = function (element, options) {
        var defaults = {
            icons: {
                up: 'glyphicon glyphicon-chevron-up',
                down: 'glyphicon glyphicon-chevron-down'
            },
            direction: 'auto'
        },

        picker = this,

        init = function () {
            picker.options = $.extend({}, defaults, options);
            picker.element = $(element);
            picker.id = dpgId++;
            picker.data = parseIpAddress();
            picker.isInput = picker.element.is('input');
            picker.component = false;

            /* Monitor Manual Change */
            if (picker.isInput)
                picker.element.keyup(changeInput);
            else
                picker.element.find('input').keyup(changeInput);

            picker.widget = getTemplate().appendTo('body');

            fillValues();
            updata();
            attachEvents();
        },

        changeInput = function () {
            var obj = $(this);
            setTimeout(function () {
                picker.data = parseIpAddress(obj.val());
                fillValue();
            }, 200);
        },

        parseIpAddress = function (data) {
            var defValue = [0, 0, 0, 0];

            if (data === null || (typeof data) === 'undefined')
                return defValue;

            var address = ($.isArray(data)) ? data : data.split('.');

            if (address.length < 4)
                return defValue;

            for (var i = 0; i < 4; ++i) {
                if (address[i] < 0)
                    address[i] = 0;
                else if (address[i] > 255)
                    address[i] = 255;
                else {
                    address[i] = parseInt(address[i], 10);

                    if (isNaN(address[i]))
                        address[i] = 0;
                }
            }

            address.length = 4;
            return address;
        },

        place = function () {
            var position = 'absolute',
            offset = picker.component ? picker.component.offset() : picker.element.offset(), $window = $(window);
            picker.width = picker.component ? picker.component.outerWidth() : picker.element.outerWidth();
            offset.top = offset.top + picker.element.outerHeight();

            var placePosition;
            if (picker.options.direction === 'up') {
                placePosition = 'top';
            } else if (picker.options.direction === 'bottom') {
                placePosition = 'bottom';
            } else if (picker.options.direction === 'auto') {
                if (offset.top + picker.widget.height() > $window.height() + $window.scrollTop() && picker.widget.height() + picker.element.outerHeight() < offset.top) {
                    placePosition = 'top';
                } else {
                    placePosition = 'bottom';
                }
            };
            if (placePosition === 'top') {
                offset.top -= picker.widget.height() + picker.element.outerHeight() + 15;
                picker.widget.addClass('top').removeClass('bottom');
            } else {
                offset.top += 1;
                picker.widget.addClass('bottom').removeClass('top');
            }

            if (picker.options.width !== undefined) {
                picker.widget.width(picker.options.width);
            }

            if (picker.options.orientation === 'left') {
                picker.widget.addClass('left-oriented');
                offset.left = offset.left - picker.widget.width() + 20;
            }

            if (isInFixed()) {
                position = 'fixed';
                offset.top -= $window.scrollTop();
                offset.left -= $window.scrollLeft();
            }

            if ($window.width() < offset.left + picker.widget.outerWidth()) {
                offset.right = $window.width() - offset.left - picker.width;
                offset.left = 'auto';
                picker.widget.addClass('pull-right');
            } else {
                offset.right = 'auto';
                picker.widget.removeClass('pull-right');
            }

            picker.widget.css({
                position: position,
                top: offset.top,
                left: offset.left,
                right: offset.right
            });
        },

        updata = function (newData) {
            var dataStr = newData;
            if (!dataStr) {
                if (picker.isInput) {
                    dataStr = picker.element.val();
                } else {
                    dataStr = picker.element.find('input').val();
                }
                picker.data = parseIpAddress(dataStr);
            }
            fillValue();
        },

		actions = {
		    incAddress: function (e, idx) {
		        checkData("inc", idx, 1);
		    },

		    decAddress: function (e, idx) {
		        checkData("dec", idx, 1);
		    },

		    showPicker: function () {
		        picker.widget.find('div:not(.ipaddress-picker)').hide();
		        picker.widget.find('.ipaddress-picker').show();
		    },

		    showValues: function (e, idx) {
		        picker.widget.find('.ipaddress-picker').hide();
		        var widget = picker.widget.find('.ipaddress-values');
		        widget.data('idx', idx);
		        widget.show();
		    },

		    selectValue: function (e, idx) {
		        picker.data[idx - 1] = parseInt($(e.target).text(), 10);
		        actions.showPicker.call(picker);
		    }
		},

	    doAction = function (e) {
	        var target = $(e.currentTarget);
	        var idx = target.data('idx');
	        var action = target.data('action');
	        var rv = actions[action].apply(picker, [e, idx]);//arguments);
	        stopEvent(e);
	        set();
	        fillValue();
	        return rv;
	    },

        stopEvent = function (e) {
            e.stopPropagation();
            e.preventDefault();
        },

        change = function (e) {
            var input = $(e.target), newData = input.val();

            updata();
            picker.setValue(parseIpAddress(newData));
            set();
            fillValue();
        },

        attachEvents = function () {
            picker.widget.on('click', '[data-action]', $.proxy(doAction, this));
            picker.widget.on('mousedown', $.proxy(stopEvent, this));
            picker.element.on({ 'change': $.proxy(change, this) }, 'input');

            if (picker.component) {
                picker.component.on('click', $.proxy(picker.show, this));
            } else {
                picker.element.on('click', $.proxy(picker.show, this));
            }
        },

        attachGlobalEvents = function () {
            $(window).on(
                'resize.ipaddress' + picker.id, $.proxy(place, this));
            $(document).on(
                'mousedown.ipaddress' + picker.id, $.proxy(picker.hide, this));
        },

        detachEvents = function () {
            picker.widget.off('click', '[data-action]');
            picker.widget.off('mousedown', picker.stopEvent);
            if (picker.isInput) {
                picker.element.off({
                    'focus': picker.show,
                    'change': picker.change
                });
            } else {
                picker.element.off({
                    'change': picker.change
                }, 'input');
                if (picker.component) {
                    picker.component.off('click', picker.show);
                } else {
                    picker.element.off('click', picker.show);
                }
            }
        },

        detachGlobalEvents = function () {
            $(window).off('resize.ipaddress' + picker.id);
            $(document).off('mousedown.ipaddress' + picker.id);
        },

        isInFixed = function () {
            if (picker.element) {
                var parents = picker.element.parents(), inFixed = false, i;
                for (i = 0; i < parents.length; i++) {
                    if ($(parents[i]).css('position') == 'fixed') {
                        inFixed = true;
                        break;
                    }
                }
                ;
                return inFixed;
            } else {
                return false;
            }
        },

        set = function () {
            var formatted = picker.data.join('.');
            var input = picker.element.find('input');
            input.val(formatted);
            picker.element.val(formatted).change();
        },

		checkData = function (direction, unit, amount) {
		    var idx = unit - 1;
		    if (!(idx >= 0 && idx <= 3)) return;

		    if (direction == "inc" && picker.data[idx] < 255) {
		        picker.data[idx] += amount;
		    }

		    if (direction == "dec" && picker.data[idx] > 0) {
		        picker.data[idx] -= amount;
		    }
		},

        getTemplate = function () {
            var addressTemplate = function (i) {
                return $('<span>').addClass('btn').attr('data-action', 'showValues').attr('data-idx', i).attr('data-component', 'address' + i);
            };
            var addressTemplateUp = function (i) {
                return $('<a>').addClass('btn').attr('href', '#').attr('data-action', 'incAddress').attr('data-idx', i)
                    .append($('<span>').addClass(picker.options.icons.up));
            };
            var addressTemplateDown = function (i) {
                return $('<a>').addClass('btn').attr('href', '#').attr('data-action', 'decAddress').attr('data-idx', i)
                    .append($('<span>').addClass(picker.options.icons.down));
            };

            var template = [
                $('<div>').addClass('ipaddress-picker')
                .append($('<table>').addClass('table-condensed').append([
                    $('<tr>').append([
                        $('<td>').append(addressTemplateUp(1)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateUp(2)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateUp(3)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateUp(4))
                    ]),
                    $('<tr>').append([
                        $('<td>').append(addressTemplate(1)),
                        $('<td>').addClass('separator').html('.'),
                        $('<td>').append(addressTemplate(2)),
                        $('<td>').addClass('separator').html('.'),
                        $('<td>').append(addressTemplate(3)),
                        $('<td>').addClass('separator').html('.'),
                        $('<td>').append(addressTemplate(4))
                    ]),
                    $('<tr>').append([
                        $('<td>').append(addressTemplateDown(1)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateDown(2)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateDown(3)),
                        $('<td>').addClass('separator'),
                        $('<td>').append(addressTemplateDown(4))
                    ])
                ])),
                $('<div>').addClass('ipaddress-values').attr('data-action', 'selectValue').append($('<table>').addClass('table-condensed'))
            ];

            return $('<div>').addClass('bootstrap-ipaddress-widget dropdown-menu')
                .append(template);
        },

        fillValues = function () {
            var ipval = [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 255];
            var table = picker.widget.find('.ipaddress-values table');
            var html = [];
            var row = $('<tr>');

            table.parent().hide();
            for (var i = 0; i < ipval.length; ++i) {
                if (i % 4 === 0) {
                    row = $('<tr>');
                    html.push(row);
                }
                row.append(
                    $('<td>').addClass('second').append(
                        $('<span>').addClass('btn').html(ipval[i].toString())));
            }

            table.empty().append(html);
        },

        fillValue = function () {
            var timeComponents = picker.widget.find('span[data-component]');

            if (!picker.data)
                picker.data = parseIpAddress();

            for (var i = 0; i < 4; ++i)
                timeComponents.filter(
                    '[data-component=address' + (i + 1) + ']').text(picker.data[i]);
        };

        picker.destroy = function () {
            detachEvents();
            detachGlobalEvents();
            picker.widget.remove();
            picker.element.removeData('IPAddress');
            if (picker.component)
                picker.component.removeData('IPAddress');
        };

        picker.show = function (e) {
            picker.widget.show();
            picker.height = picker.component ? picker.component.outerHeight() : picker.element.outerHeight();
            place();
            attachGlobalEvents();
            if (e) {
                stopEvent(e);
            }
        },

        picker.disable = function () {
            var input = picker.element.find('input');
            if (input.prop('disabled')) return;

            input.prop('disabled', true);
            detachEvents();
        },

        picker.enable = function () {
            var input = picker.element.find('input');
            if (!input.prop('disabled')) return;

            input.prop('disabled', false);
            attachEvents();
        },

        picker.hide = function (event) {
            if (event && $(event.target).is(picker.element.attr("id")))
                return;

            picker.widget.hide();
            detachGlobalEvents();
        },

        picker.setValue = function (newData) {
            picker.data = parseIpAddress(newData);
            set();
            fillValue();
        };

        init();
    };

    $.fn.ipaddress = function (options) {
        return this.each(function () {
            var $this = $(this), data = $this.data('IPAddress');
            if (!data) $this.data('IPAddress', new IPAddress(this, options));
        });
    };
}));
