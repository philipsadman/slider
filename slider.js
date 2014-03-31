var Slider = (function() {

    function Slider(sliderEl, options) {
        this.options = options;
        this.element = sliderEl;
        this._events = {};
        this.converter = options.converter;

        this.roller = this.element.querySelector('.roller');
        this.activeSegment = this.element.querySelector('.active-segment');

        this.width = this.element.offsetWidth;
        this._rollerRadius = parseInt(this.roller.offsetWidth / 2);
        
        this.currentPosition = this.options.startPosition;
        this.stepToUpdate = this.width / (this.options.maxValue - this.options.minValue);

        this.topLeft = this.element.getBoundingClientRect().left;

        this.init();
    }

    Slider.prototype.init = function() {
        var resultElement = this.options.resultElement;

        this._addRollerListeners();
        this._addSliderListeners();

        this.on('changePosition', function(value) {
            resultElement.innerHTML = value;
        });

        this.updatePosition();

        return this;
    }

    Slider.prototype.on = function(eventType, handler) {
        this._events[eventType] = handler;

        return this;
    }
    Slider.prototype.emit = function(eventType, data) {
        if (this._events[eventType]) {
            this._events[eventType](data);
        }
        return this;
    }
    Slider.prototype.removeHandler = function(eventType) {
        if (this._events[eventType]) {
            this._events[eventType] = null;
        }
        return this;
    }

    Slider.prototype.updatePosition = function() {
        var slider = this;

        this.activeSegmentLength = this.currentPosition;
        this.rollerPosition = this.currentPosition;

        this.roller.style.left = this.currentPosition - this._rollerRadius;
        this.activeSegment.style.width = this.currentPosition;

        this.emit('changePosition', slider.converter());

        return this;
    }

    Slider.prototype._addRollerListeners = function() {
        var slider = this;

        this.roller.addEventListener('mousedown', function mousedownHandler(mouseDownEvent) {
            mouseDownEvent.preventDefault();

            slider.roller.classList.add('hover');

            document.onmousemove = function(mouseMoveEvent) {
                slider._rollerMoveHandler(mouseMoveEvent);
            }

            document.addEventListener('mouseup', function() {
                slider.roller.classList.remove('hover');
                document.onmousemove = null;
            }, false);
        }, false);
    }

    Slider.prototype._addSliderListeners = function() {
        var slider = this;

        this.element.addEventListener('click', function(clickEvent) {
            if (clickEvent.target !== slider.roller) {
                if (clickEvent.target === slider.activeSegment) {
                    slider.currentPosition -= slider.stepToUpdate;

                    if (slider.currentPosition < 0) {
                        slider.currentPosition = 0;
                    }
                }
                else {
                    slider.currentPosition += slider.stepToUpdate;

                    if (slider.currentPosition > slider.width) {
                        slider.currentPosition = slider.width;
                    }
                }
                slider.updatePosition();
            }
        }, false);

        this.element.addEventListener('mousedown', function(mousedownEvent) {
            if (mousedownEvent.target !== slider.roller) {
                var interval;

                if (mousedownEvent.target === slider.activeSegment) {
                    interval = setInterval(function() {
                        slider.currentPosition -= slider.stepToUpdate;

                        if (slider.currentPosition < 0) {
                            slider.currentPosition = 0;
                            clearInterval(interval);
                        }
                        slider.updatePosition();
                    }, 150);
                }
                else {
                    interval = setInterval(function() {
                        slider.currentPosition += slider.stepToUpdate;

                        if (slider.currentPosition > slider.width) {
                            slider.currentPosition = slider.width;
                            clearInterval(interval);
                        }
                        slider.updatePosition();
                    }, 150);
                }

                document.addEventListener('mouseup', function() {
                    clearInterval(interval);
                });
            }
        }, false);
    }

    Slider.prototype._rollerMoveHandler = function(e) {
        var positionToSet = parseInt(e.x - this.topLeft);

        if (positionToSet < 0) {
            positionToSet = 0;
        }
        else if (positionToSet > this.width) {
            positionToSet = this.width;
        }

        if ((positionToSet % this.stepToUpdate) < 2) {
            this.currentPosition = positionToSet;
            this.updatePosition();
        }
    }

    Slider.prototype.getValue = function() {
        return this.converter(this.currentPosition);
    }

    return Slider;
})();