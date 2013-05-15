/*
 Copyright (c) 2012, Vladimir Agafonkin
 Simplify.js is a high-performance polyline simplification library.
 http://mourner.github.com/simplify-js/
*/

(function (global, undefined) {

	"use strict";


	// run search/replace for '.x' and '[1]' to suit your point format
	// (its configurability would draw significant performance overhead)
var obj={
	getSquareDistance:function(p1,p2) { // square distance between 2 points
		var np1 = this.points[p1],np2 =this.points[p2];
		var dx = np1[0] - np2[0],
			dy = np1[1] - np2[1];

		return (dx * dx + dy * dy)>this.sqTolerance;
	},

	getSquareSegmentDistance : function(p, p1, p2) { // square distance from a point to a segment
	var np = this.points[p],np1 = this.points[p1],np2 = this.points[p2];
		var x = np1[0],
			y = np1[1],

			dx = np2[0] - x,
			dy = np2[1] - y,

			t;

		if (dx !== 0 || dy !== 0) {

			t = ((np[0] - x) * dx +
				 (np[1] - y) * dy) /
				(dx * dx + dy * dy);

			if (t > 1) {
				x = np2[0];
				y = np2[1];

			} else if (t > 0) {
				x += dx * t;
				y += dy * t;
			}
		}

		dx = np[0] - x;
		dy = np[1] - y;

		return dx * dx + dy * dy;
	},




	// the rest of the code doesn't care for the point format


	// simplification based on distance between points

	simplifyRadialDistance:function() {

		var i,
			len = this.points.length,
			prevPoint = 0,
			newPoints = [this.points[0]];

		for (i = 1; i < len; i++) {

			if (this.getSquareDistance(i, prevPoint)) {
				newPoints.push(this.points[i]);
				prevPoint = i;
			}
		}

		if (prevPoint !== i && this.points[i]) {
			newPoints.push(this.points[i]);
		}

		this.points = newPoints ;
	},


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

	simplifyDouglasPeucker:function(data, cb) {

		this.points = data.points;
		this.sqTolerance=data.sqTolerance;
		if(!data.highestQuality){
			this.simplifyRadialDistance();
		}
			var len = this.points.length,
			markers = new Uint8Array(len),
			first = 0,
			last = len - 1,
			i,
			maxSqDist,
			sqDist,
			index,
			firstStack = [],
			lastStack = [],
			newPoints = [];

		markers[first] = markers[last] = 1;

		while (last) {

			maxSqDist = 0;

			for (i = first + 1; i < last; i++) {
				sqDist = this.getSquareSegmentDistance(i, first, last);

				if (sqDist > maxSqDist) {
					index = i;
					maxSqDist = sqDist;
				}
			}

			if (maxSqDist > this.sqTolerance) {
				markers[index] = 1;

				firstStack.push(first);
				lastStack.push(index);

				firstStack.push(index);
				lastStack.push(last);
			}

			first = firstStack.pop();
			last = lastStack.pop();
		}

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(this.points[i]);
			}
		}

	cb(newPoints);
	}}


	var root = (typeof exports !== undefined + '' ? exports : global);

	root.simplify = function (points, tolerance, highestQuality, cb) {

		var sqTolerance = (tolerance !== undefined ? tolerance * tolerance : 1);

			obj.simplifyDouglasPeucker({points:points,sqTolerance: sqTolerance,highestQuality:highestQuality}, cb);
		

	};

}(this));