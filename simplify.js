/*
 Copyright (c) 2012, Vladimir Agafonkin
 Simplify.js is a high-performance polyline simplification library
 mourner.github.com/simplify-js
*/

(function (global, undefined) {

	


	// to suit your point format, run search/replace for '.x' and '.y'
	// to switch to 3D, uncomment the lines in the next 2 functions
	// (configurability would draw significant performance overhead)
var returnASM=function(){
	return function(stdlib, foreign, heap){
		"use asm";
        var f64 = new stdlib.Float64Array(heap);
        var i32 = new stdlib.Uint32Array(heap);
		
		function getSquareDistance(p1x,p1y, p2x,p2y,sqTolerance) { // square distance between 2 points
			//all doubles;
			p1x = +p1x;
			p1y = +p1y;
			p2x = +p2x;
			p2y = +p2y;
            sqTolerance = +sqTolerance;
			var dx = 0.0,
				dy = 0.0;
			dx = p1x - p2x;
			dy = p1y - p2y;

			return ((dx * dx + dy * dy)>sqTolerance)|0;
		}

		function getSquareSegmentDistance(px, py, x, y, p2x, p2y) { // square distance from a point to a segment
			px = +px;
            py = +py;
            x = +x;
			y = +y;
			p2x = +p2x;
			p2y = +p2y;
			var dx = 0.0,
				dy = 0.0,
				t = 0.0;
			dx = p2x - x;
			dy = p2y - y;


			if ((dx*1.0+1.0*dy) != 0.0) {

				t = ((px - x) * dx +
					 (py - y) * dy) /
						(dx * dx +
						 dy * dy);

				if (t > 1.0) {
					x = p2x;
					y = p2y;

				} else if (t > 0.0) {
					x = (dx * t)+x;
					y = (dy * t)+y;
				}
			}

			dx = px - x;
			dy = py - y;

			return +(dx * dx + dy * dy);
		
		}

		// the rest of the code doesn't care for the point format


		function simplifyRadialDistance(sqTolerance,len) { // distance-based simplification
			sqTolerance = +sqTolerance;
            len = len|0;
			var i = 2,
				j = 0,
				pointx = 0.0,
				pointy = 0.0,
				prevPointx = 0.0,
				prevPointy = 0.0;
				prevPointx = +f64[(i-2)>>3];
				prevPointy = +f64[(i-1)>>3];
			while((i|0) < (len|0)) {
				pointx = +f64[i>>3];
                i = (i + 1)|0;
				pointy = +f64[i>>3];
                i = (i + 1)|0;
				if (getSquareDistance(pointx,pointy, prevPointx,prevPointy,sqTolerance)) {
					f64[j>>3]=pointx;
					f64[(j+1)>>3]=pointy;
					prevPointx = pointx;
					prevPointy = pointy;
					j = (j + 2)|0;
				}
			}
			f64[j>>3]=pointx;
			f64[(j+1)>>3]=pointy;

			return (j+2)|0;
		}


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

		function simplifyDouglasPeucker(sqTolerance,nlen,hq) {
			sqTolerance = +sqTolerance;
			nlen = nlen|0;
            hq=+hq;
            var len = 0,
             first = 0,
			last  = 0,
			i =0,
			slen = 0,
			outlen=0,
			maxSqDist =0.0,
			sqDist=0.0,
			index=0,
            mShift = 0,
            fShift = 0,
            lShift = 0;
            mShift = (nlen<<4)|0;
            fShift = (mShift+(nlen<<3))|0;
            lShift = (mShift+(nlen<<2))|0;
            len = nlen;
            if(hq==0.0){
                len = simplifyRadialDistance(sqTolerance,nlen);
            }
			last = (len - 2)|0;

			i32[(mShift+first)>>2] = i32[(mShift+last)>>2] = 1;

			while (last) {
				maxSqDist = 0.0;

				for (i = (first + 2)|0; (i|0) < (last|0); i=(i+2)|0) {
					sqDist = +getSquareSegmentDistance( +f64[i>>3], +f64[(i+1)>>3], +f64[first>>3], +f64[(first+1)>>3], +f64[last>>3], +f64[(last+1)>>3]);
					if (sqDist > maxSqDist) {
						index = i;
						maxSqDist = sqDist;
					}
				}

				if (maxSqDist > sqTolerance) {
					i32[(mShift+index)>>2] = 1;
					i32[(fShift+slen)>>2] = first;
					i32[(lShift+slen)>>2] = index;
					slen = (slen + 1)|0;
					i32[(fShift+slen)>>2] = index;
					i32[(lShift+slen)>>2] = last;
					slen = (slen + 1|0);
                    
			}

		
			
                      slen=(slen-1)|0;
				    first=i32[(fShift+slen)>>2]|0;
				     last = i32[(lShift+slen)>>2]|0;
				
			}

			for (i = 0; (i|0) < (len|0); i=(i+2)|0) {
				if ((i32[(mShift+i)>>2]|0) != 0) {
					f64[(len+outlen)>>3] = +f64[i>>3];
					outlen = (outlen + 1)|0;
					f64[(len+outlen)>>3] = +f64[(i+1)>>3];
					outlen = (outlen + 1)|0;
				}
			}

			return outlen|0;
		}
		
		return {simplifyRadialDistance:simplifyRadialDistance, simplifyDouglasPeucker:simplifyDouglasPeucker};
};
};
	var root = (typeof exports !== undefined + '')
			 ? exports
			 : global;
	root.simplify = function (points, tolerance, highestQuality) {
		var array = (new Float64Array(new ArrayBuffer(8388608)));
		array.set(points);
		var buffer = array.buffer;
		var asm = returnASM()(window,{},buffer);
		var sqTolerance = (tolerance !== undefined)
						? tolerance * tolerance
						: 1;
		var len=points.length;
		var outlen = asm.simplifyDouglasPeucker(sqTolerance,len,highestQuality);
        var oot = new Float64Array(buffer,len,outlen);
		return oot;
};


}(this));