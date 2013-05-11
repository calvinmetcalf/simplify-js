(function () {

	function get(id) {
		return document.getElementById(id);
	}

	var canvas = get('canvas'),
		pointNumBefore = get('point-num-before'),
		toleranceVal = get('tolerance-val'),
		pointNumAfter = get('point-num-after'),
		pointNumTimes = get('point-num-times'),
		durationEl = get('duration'),
		qualityEl = get('quality');

	var tolerance = 0.8,
		highQuality = false;

	var ctx = canvas.getContext('2d');
	ctx.translate(-200, -100);

	ctx.strokeStyle = '#f53';
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	var pointsLen = points.length;

	pointNumBefore.innerHTML = pointsLen/2;

	function update() {

		ctx.clearRect(200, 100, 800, 400);

		var newPoints,
			start = +new Date();

		newPoints = simplify(points, tolerance, highQuality);

		durationEl.innerHTML = +new Date() - start;

		var i, len, p,
		    newLen = newPoints.length;

		pointNumAfter.innerHTML = newLen/2;
		pointNumTimes.innerHTML = Math.round(pointsLen / newLen);
		toleranceVal.innerHTML = tolerance;

		ctx.beginPath();

		for (i = 0, len = newPoints.length; i < len; i=i+2) {
			ctx.lineTo(newPoints[i], newPoints[i+1]);
		}

		ctx.stroke();
	}

	function onSliderChange(e) {
		tolerance = parseFloat(e.value);
		update();
	}

	fdSlider.createSlider({
		inp: get('tolerance'),
		step: '0.01',
		min: 0.10,
		max: 5,
		hideInput: true,
		callbacks: {
			change: [onSliderChange],
			create: [onSliderChange]
		}
	});

	qualityEl.onchange = function () {
		highQuality = qualityEl.checked;
		update();
	};

}());