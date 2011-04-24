$(function() {
	var body = $("body")[0];
	
	function dragenter(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	function dragover(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	function drop(e) {
		e.stopPropagation();
		e.preventDefault();

		var files = e.dataTransfer.files
			, file = files[0]
			, reader;

		if (file.type.match(/image.*/)) {
			reader = new FileReader();
			reader.onload = function(e) {
				$("#img1 .imgsrc").attr("src", e.target.result);
				processPixelData();
			};
			reader.readAsDataURL(file);
		}
	}
	
	// Add drag & drop listeners for files
	body.addEventListener("dragenter", dragenter, false);
	body.addEventListener("dragover", dragover, false);
	body.addEventListener("drop", drop, false);

	// Compare 2 color arrays to see if they match
	function rgb_equal(p1, p2) {
		return p1.length == p2.length &&
				p1.length >= 3 &&
				p1[0] == p2[0] &&
				p1[1] == p2[1] &&
				p1[2] == p2[2];
	}

	// Determine if hex or rgba should be used and return color string
	function toColorString(color) {
		// Check for hex or rgba
		// Use hex if alpha is unused
		if (color.length < 4 || color[3] == 255) {
			// use hex
			var i, hex, r = "#";

			for (i = 0; i < 3; i++) {
				hex = color[i].toString(16);
				if (hex.length == 1) {
					hex = "0" + hex;
				}
				r += hex;
			}

			return r;
		} else {
			// use rgba
			return "rgba(" + color.join(", ") + ")";
		}
	}

	function processPixelData() {
		// Load canvas
		var canvas = document.getElementById("grad")
			, context = canvas.getContext("2d")
			, img = $("#img1 .imgsrc")[0]
			, data;

		canvas.width = img.width;
		canvas.height = img.height;

		context.drawImage(img, 0, 0);
		
		// Get each corner pixel as RGBA array
		data = {
			TL: Array.prototype.slice.call(context.getImageData(0, 0, 1, 1).data, 0)
			, TR: Array.prototype.slice.call(context.getImageData(canvas.width - 1, 0, 1, 1).data, 0)
			, BL: Array.prototype.slice.call(context.getImageData(0, canvas.height - 1, 1, 1).data, 0)
			, BR: Array.prototype.slice.call(context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data, 0)
		};

		if(data == null || !data.TR) {
			alert("Could not parse image for pixel data");
			return;
		}

		var color1 = data.TL
			, color2 = data.BR
			, orin = 0
			, css
			, colorString1
			, colorString2
			, normal = ["top", "left", "left top", "right top"]
			, webkit_start = ["left top", "left top", "left top", "right top"]
			, webkit_end = ["left bottom", "right top", "right bottom", "left bottom"];
		
		if(rgb_equal(data.TL, data.TR)) {
			// top to bottom
			orin = 0;
		} else if(rgb_equal(data.TL, data.BL)) {
			// left to right
			orin = 1;
		} else if(rgb_equal(data.TR, data.BL) && !rgb_equal(data.TL, data.BR)) {
			// top left to bottom right
			orin = 2;
		} else if(rgb_equal(data.TL, data.BR) && !rgb_equal(data.TR, data.BL)) {
			// top right to bottom left
			orin = 3;
			color1 = data.TR;
			color2 = data.BL;
		} else {
			alert("Unable to determine gradient type.");
			return;
		}

		// Convert color arrays to strings
		colorString1 = toColorString(color1);
		colorString2 = toColorString(color2);

		//generate the CSS
		css = "/* Gecko */\n";
		css += "background-image: -moz-linear-gradient(" + normal[orin] + ", " + colorString1 + " " + colorString2 +");\n";
		css += "/* Safari 4+, Chrome 1+ */\n";
		css += "background-image: -webkit-gradient(linear, " + webkit_start[orin] + ", " + webkit_end[orin]+ ", from(" + toColorString(color1) + "), to(" + toColorString(color2) + "));\n";
		css += "/* Safari 5.1+, Chrome 10+ */\n";
		css += "background-image: -webkit-linear-gradient(" + normal[orin] + ", " + toColorString(color1) + ", " + toColorString(color2) + ");\n";
		css += "/* Opera */\n";
		css += "background-image: -o-linear-gradient(" + normal[orin] + ", " + toColorString(color1) + ", " + toColorString(color2) + ");\n";

		$("#img1 pre.css").html(css);
		$("#img1 .cssgradient")[0].style.cssText = "height:" + img.height + "px;width:" + img.width + "px;" + css;
	}

	processPixelData();
});
