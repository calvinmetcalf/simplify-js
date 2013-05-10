/*
 Copyright (c) 2012, Vladimir Agafonkin
 Simplify.js is a high-performance polyline simplification library
 mourner.github.com/simplify-js
*/

(function (global, undefined) {

	


	// to suit your point format, run search/replace for '.x' and '.y'
	// to switch to 3D, uncomment the lines in the next 2 functions
	// (configurability would draw significant performance overhead)
window.stuff=[];
	function asmModule (stdlib, foreign, heap){
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

		function getSquareSegmentDistance(px,py, x, y, p2x, p2y) { // square distance from a point to a segment
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

			return +(dx * dx +
				   dy * dy);
		
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
				prevPointx = +f64[0];
				prevPointy = +f64[1];
			while((i|0) < (len|0)) {
				pointx = f64[i];
                i = (i + 1)|0;
				pointy = f64[i];
                i = (i + 1)|0;
				if (getSquareDistance(pointx,pointy, prevPointx,prevPointy,sqTolerance)) {
					f64[j]=pointx;
					f64[j+1]=pointy;
					prevPointx = pointx;
					prevPointy = pointy;
					j = j + 2;
				}
			}
			f64[j]=pointx;
			f64[j+1]=pointy;

			return (j+2)|0;
		}


	// simplification using optimized Douglas-Peucker algorithm with recursion elimination

		function simplifyDouglasPeucker(sqTolerance,nlen,hq) {
			sqTolerance = +sqTolerance;
			nlen = nlen|0;
            hq=+hq;
            var len = 0;
            len = nlen;
            if(hq==0.0){
                len = simplifyRadialDistance(sqTolerance,nlen);
            }
			var first = 0,
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
            mShift = (heap.byteLength>>3);
            fShift = ((heap.byteLength>>1)+(heap.byteLength>>2))>>2;
            lShift = ((heap.byteLength>>1)+(heap.byteLength>>3))>>2;
			last = len -2;

			i32[mShift+first] = i32[mShift+last] = 1;

			while (last) {
				maxSqDist = 0.0;

				for (i = first + 2; i < last; i=i+2) {
					sqDist = getSquareSegmentDistance(f64[i],f64[i+1], f64[first],f64[first+1], f64[last],f64[last+1]);
	
					if (sqDist > maxSqDist) {
						index = i;
						maxSqDist = sqDist;
					}
				}

				if (maxSqDist > sqTolerance) {
					i32[mShift+index] = 1;

					i32[fShift+slen] = first;
					i32[lShift+slen] = index;
					slen = slen + 1;
					i32[fShift+slen] = index;
					i32[lShift+slen] = last;
					slen = slen + 1;
                    
			}

		
			
                      slen=slen-1;
				    first=i32[fShift+slen];
				     last = i32[lShift+slen]
				
			}

			for (i = 0; i < len; i=i+2) {
				if (i32[mShift+i]) {
					f64[nlen+outlen] = f64[i];
					outlen = outlen + 1;
					f64[nlen+outlen] = f64[i+1];
					outlen = outlen + 1;
				}
			}

			return outlen|0;
		}
		
		return {simplifyRadialDistance:simplifyRadialDistance, simplifyDouglasPeucker:simplifyDouglasPeucker};
}
	var root = (typeof exports !== undefined + '')
			 ? exports
			 : global;
	root.simplify = function (points, tolerance, highestQuality) {
        var zz = new Date();
		var array = (new Float64Array(points.length*4));
		array.set(points);
		var buffer = array.buffer;
		var asm = asmModule(window,{},buffer);
		var sqTolerance = (tolerance !== undefined)
						? tolerance * tolerance
						: 1;
		var len=points.length;
        zz=(new Date())-zz;
        var tt;
        tt= new Date();
		var outlen = asm.simplifyDouglasPeucker(sqTolerance,len,highestQuality);
        tt = (new Date())-tt;
        var tz = new Date();
        var oot = new Float64Array(buffer,buffer.byteLength>>2,outlen);
        var tz = (new Date())-tz;
        console.log([zz,tt,tz]);
		return oot;
};


}(this));