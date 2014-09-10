
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());//http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/





function TmPieChart(settings) {
	"use strict";	
	var default_settings = {
		centerX : 100,
		centerY : 100,
		size    : 100,
		width   : 26,
		borderWidth : 6,
		innerBorderWidth : 6,
		fill : 'red',
		strokeStyle : '#2b8e00',
		radialOffset : 0.007 * Math.PI,
		context : null,
		duration: 500, //milliseconds
		easeEffect : function(percent,custom) {
			return percent;//this is linear
			//for different ease effects @see http://greweb.me/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
		},
		drawCB : function(percentage) {//for outputting current percentage
		}
	};

    settings = settings || {};
    for (var opt in default_settings) {
        if (default_settings.hasOwnProperty(opt) && !settings.hasOwnProperty(opt)) {
            settings[opt] = default_settings[opt];
		}
	}
	this.settings = settings;
	
	if(this.settings.context === null) {
		throw "ERROR: No canvas-context defined!";
	}
}

TmPieChart.prototype = {
	draw : function(percent) {
	
		if (this.settings.drawCB && typeof(this.settings.drawCB) === "function") {
			var myCustomObject = -1;
			this.settings.drawCB(percent);
		}
		
		var context = this.settings.context;
		var size = this.settings.size - this.settings.width/2;
		var centerX = this.settings.centerX;
		var centerY = this.settings.centerY;
		
		var radialOffset = this.settings.radialOffset;
		
		if(percent>99) {
			radialOffset = 0;
		}
		if(percent===0) {
			return;
		}
		if(percent<1) {
			radialOffset = 0;
		}
		if(percent<2) {
			radialOffset = 0.015;
		}
		
		var piePercentage = ((percent/100 * 2) - 0.5) * Math.PI;
		
		//arc1 - main arc
		context.beginPath();
		context.arc(centerX, centerY, size, -0.5 * Math.PI, piePercentage, false);
		context.strokeStyle = this.settings.strokeStyle;
		context.lineWidth=this.settings.width;
		context.stroke();
		
		if(percent>1) {
			//arc2 inside arc1 (light-gray)
			context.beginPath();
			context.arc(centerX, centerY, size, -0.5 * Math.PI + radialOffset, piePercentage - radialOffset, false);
			context.strokeStyle = '#0a0a0a';
			context.lineWidth=this.settings.width-this.settings.borderWidth;
			context.stroke();
			
			//arc3 inside arc2 (black)
			context.beginPath();
			context.arc(centerX, centerY, size, -0.5 * Math.PI + radialOffset*2, piePercentage - radialOffset*2, false);
			context.strokeStyle = "black";
			context.lineWidth=this.settings.width-this.settings.borderWidth-this.settings.innerBorderWidth;
			context.stroke();

			//fill arc with same size as arc2
			context.globalCompositeOperation = "lighter";//set blend mode to lighten
			context.beginPath();
			context.arc(centerX, centerY, size, -0.5 * Math.PI + radialOffset, piePercentage - radialOffset, false);
			context.strokeStyle = this.settings.fill;
			context.lineWidth=this.settings.width-this.settings.borderWidth;
			context.stroke();
			context.globalCompositeOperation = "source-over";//set blend mode to default
		}
	},
	
	/**
	 * @param percentEnd
	 * @param (optional) percentCurrent
	 * @param (optional) settings
	 */
	drawAnimated : function(percentEnd, percentCurrent, settings) {
		if(typeof settings !== 'undefined') {
			this.settings = settings;
		}
		if(typeof percentCurrent === 'undefined') {
			var percentCurrent = 0;
		}
		
		var context = this.settings.context;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		//round to avoid infinity loops
		percentCurrent = Math.round(percentCurrent * 10000) / 10000;
		
		if (percentCurrent > percentEnd) {
			percentCurrent = percentEnd;
		}
		this.draw(percentCurrent);
		
		if (percentCurrent < percentEnd) {
			var mySettings = this.settings;
			window.requestAnimationFrame(function(time) {
				var percentNext = mySettings.easeEffect(time / mySettings.duration) * percentEnd;
				TmPieChart.prototype.drawAnimated(percentEnd, percentNext, mySettings);
			});
		}
	}
}

/**
 * simple Cloning function
 */
TmPieChart.clone = function(obj) {
	var target = {};
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			target[i] = obj[i];
		}
	}
	return target;
};