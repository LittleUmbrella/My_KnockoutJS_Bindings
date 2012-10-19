


ko.bindingHandlers['eventJq'] =
{
    'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
        if (typeof jQuery == "undefined") {
            throw new Error("jQuery undefined, should use normal 'event' binding");
        }

        var eventsToHandle = valueAccessor() || {};
        for (var eventNameOutsideClosure in eventsToHandle) {
            (function () {
                var eventName = eventNameOutsideClosure; // Separate variable to be captured by event handler closure   

                if (typeof (eventName) == "string") {
                    var eventobj = valueAccessor()[eventName];
                    $(element).bind(eventName, eventobj.data.apply(viewModel, arguments), function (event) {
                        var handlerReturnValue;
                        var handlerFunction = eventobj.func;
                        if (!handlerFunction)
                            return;
                        var allBindings = allBindingsAccessor();
                        //try {
                        handlerReturnValue = handlerFunction.apply(viewModel, arguments);
                        //}
                        //finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.                                
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                        //}
                        var bubble = allBindings[eventName + 'Bubble'] !== false;
                        if (!bubble) {
                            event.cancelBubble = true;
                            if (event.stopPropagation)
                                event.stopPropagation();
                        }
                    });
                }

            })();

        }

    } //parseJson
};


ko.bindingHandlers['fadeDelete'] = {
    init: function (element, valueAccessor, allBindingAccessors) {

        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            var $element = $(element);
            $element.stop(true, true);
            $element.fadeOut('slow');
        }
    }
    , 'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            var $element = $(element);
            $element.stop(true, true);
            $element.fadeOut('slow', function () { 
                $element.remove(); 
            });
        }
    }
};

//http://siderite.blogspot.com/2009/07/jquery-firexof-error-could-not-convert.html
/** Binding to make content appear with 'fade' effect */
ko.bindingHandlers['fadeIn'] = {
    init: function (element, valueAccessor, allBindingAccessors) {

        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeIn('slow');
        }
    }
    , 'update': function (element, valueAccessor) {
        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeIn('slow');
        }
    }
};

/** Binding to make content disappear with 'fade' effect */
ko.bindingHandlers['fadeOut'] = {
    init: function (element, valueAccessor, allBindingAccessors) {

        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeOut('slow');
        }
    }
    ,
    'update': function (element, valueAccessor) {
        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeOut('slow');
        }
    }
};

ko.bindingHandlers['fadeToggle'] = {
    init: function (element, valueAccessor, allBindingAccessors) {

        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeOut('slow');
        }
        else if (value === false) {
            $element.stop(true, true);
            $element.fadeIn('slow');
        }
    }
    ,
    'update': function (element, valueAccessor) {
        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value === true) {
            $element.stop(true, true);
            $element.fadeOut('slow');
        }
        else if (value === false) {
            $element.stop(true, true);
            $element.fadeIn('slow');
        }
    }
};

ko.bindingHandlers['toggleSlide'] = {
    'update': function (element, valueAccessor) {
        var $element = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value != null)
            $element.slideToggle();
    }
};


ko.bindingHandlers['jqCss'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).css(value);
    }
};

//use for currency, date, etc. formatting
ko.bindingHandlers['format'] = {
    'update': function (element, valueAccessor) {

        var value = ko.utils.unwrapObservable(valueAccessor());
        if ('undefined' == typeof value.value)
            return value;

        return ko.bindingHandlers['format']['format'](element, ko.utils.unwrapObservable(value.value), value.format, value.settings);
    },
    format: function (element, value, format, settings) {
        var handler, formattedValue = value;
        var $element = $(element);

        if ($element.is('input, select, textarea')) {
            handler = ko.bindingHandlers['value'];
        }
        else {
            handler = ko.bindingHandlers['text'];
        }

        try{
            switch (format.substring(0, 1)) {
                case 'c':

                    formattedValue = $.fn.asCurrency(value);
                    break;
                case 'd':
                	if ('date' == typeof value)
                        formattedValue = $.datepicker.formatDate(format, value);
                    else {
                        //
                        var parsedValue = Date.parse(value);
                        formattedValue = $.datepicker.formatDate(format, new Date(parsedValue));
                    }
                    break;
                default:
                    throw new Error('No formatting available for ' + format.substring(0, 1));
            }
        }
        catch (e) {
            //todo: add a console write
            formattedValue = value;
        }

        return handler.update(element, function () { return formattedValue; });

    }
};

/**
* Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
* © 2011 Colin Snover <http://zetafleet.com>
* Released under MIT license.
*/
(function (Date, undefined) {
    var origParse = Date.parse, numericKeys = [1, 4, 5, 6, 7, 10, 11];
    Date.parse = function (date) {
        var timestamp, struct, minutesOffset = 0;

        // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
        // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
        // implementations could be faster
        //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
        if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = struct[10] * 60 + struct[11];

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }
        else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };
} (Date));

//consider alternative: http://jsfiddle.net/eZRQb/
ko.bindingHandlers.className = {
    init: function (element, valueAccessor) {
        ko.bindingHandlers.className.setClassName(element, valueAccessor);
    },
    update: function (element, valueAccessor) {
        ko.bindingHandlers.className.setClassName(element, valueAccessor);
    },
    setClassName: function (element, valueAccessor) {
        var className = ko.utils.unwrapObservable(valueAccessor());
        var wrap = $(element);
        wrap.removeClass();
        wrap.addClass(className);
    }
};

//for qtip binding
ko.bindingHandlers['qtip'] = {
    'update': function (element, valueAccessor) {
        var qtipArg, cssNames, value = ko.utils.unwrapObservable(valueAccessor());
        

        if ('undefined' != typeof value.selector)
            value = $(value.selector);
        
        qtipArg = {
                content: {
                    text: value //'me' 
                }
            };

        if ('undefined' != typeof value.cssNames)
        	qtipArg.style = { classes: value.cssNames};
        
        $(element).qtip(qtipArg);


    }
};


ko.bindingHandlers['scale'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var $this = $(element);
        $this.stop(true, true);

        if ('undefined' != typeof value.speed) {
            $this.animate({ scale: value.percent }, value.speed);
        }
        else {
            $this.animate({ scale: value }, 0);
        }


    }
};

//for BlockUI jQuery plugin http://www.malsup.com/jquery/block/
ko.bindingHandlers['busy'] = {
    'update': function (element, valueAccessor) {

        var value = ko.utils.unwrapObservable(valueAccessor());
        var $this = $(element), options;

        if ('undefined' != typeof value.options) {
            options = value.options;
            value = value.busy;
        }

        //todo: copy all scale, border-radius and rotation settings
        //for now, just go with defaults
        var transformMimicryOps = {
        }

        var options = $.extend(transformMimicryOps, options);

        if (value == true) {
            $this.block(options);
        }
        else {
            $this.unblock();
        }


    }
};
