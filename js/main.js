var el = document.getElementById('c');
var grid = document.getElementById('grid');
var ctx = el.getContext('2d');
var isDrawing;

var gridWidth = 1;
var gridHeight = 1;
var pixelMatrixWidth = 16;
var pixelMatrixHeight = 16;
var pencilWidth = 1.0; //changes in ready
var cellWidth = 1;
var cellHeight = 1;
var pixelMatrix = new Array(pixelMatrixWidth);

// need this for now since we are using static memory area
var numberOfAnimationFrames = 10;

// Loading images onto canvas
var image1 = null;


for(var x=0; x< pixelMatrixWidth; x++){
    pixelMatrix[x] = new Array(pixelMatrixHeight);
    for(var y=0; y<pixelMatrixHeight; y++){
        pixelMatrix[x][y] = new Array(3);
    }
}
var startX = 0;
var startY = 0;


$(document).ready(function () {
    gridWidth = el.width;
    gridHeight = el.height;
    cellWidth = Math.floor(gridWidth / pixelMatrixWidth);
    cellHeight = Math.floor(gridHeight / pixelMatrixHeight);

    //resize canvas and grid to be a multiple of cellWidth/height
    el.width = cellWidth * pixelMatrixWidth;
    el.height = cellHeight * pixelMatrixHeight;
    var grid = document.getElementById('grid');
    grid.width = el.width;
    grid.height = el.height;
    grid.style.top = ((-1 * grid.height)-2)+'px';

    pencilWidth = (cellWidth < cellHeight ? cellWidth : cellHeight);

    console.log("Cells are " + cellWidth + " x " + cellHeight + "px");
    console.log("Pencil width is " + pencilWidth);
    var gctx = grid.getContext('2d');
    gctx.beginPath();
    gctx.lineWidth = 1.0;
    gctx.strokeStyle = '#FFF';
    for (var x = cellWidth; x < gridWidth; x += cellWidth) {
        gctx.moveTo(x + 0.5, 0);
        gctx.lineTo(x + 0.5, gridHeight);
    }

    for (var y = cellHeight; y < gridHeight; y += cellHeight) {
        gctx.moveTo(0, y+0.5);
        gctx.lineTo(gridWidth, y+0.5);
    }
    gctx.stroke();
    console.log("Done drawing grid");

});

grid.onmousedown = function (e) {
    ctx.strokeStyle = getRgbColorStyle();
    ctx.lineWidth = pencilWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    ctx.moveTo(startX, startY);
};
grid.onmousemove = function (e) {
    if (isDrawing) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
    }
};

// just handling clicks for now
grid.onmouseup = function (e) {
    isDrawing = false;
    var diff = Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
    if (startY == 0 || startX == 0 || diff == 0) {
        colorCellAtCanvasLocationCurrentColor(e.clientX, e.clientY);
    }
};

colorCellAtCanvasLocationCurrentColor = function (x, y) {
    // get cell rect
    var x2 = Math.floor(x / cellWidth);
    var y2 = Math.floor(y / cellHeight);
    ctx.beginPath();
    ctx.rect(x2 * cellWidth, y2 * cellHeight, cellWidth, cellHeight);
    ctx.fillStyle = getRgbColorStyle();
    ctx.fill();
}

colorCellAtCanvasLocationWithColor = function (x, y, r, g, b) {
    // get cell rect
    var x2 = Math.floor(x / cellWidth);
    var y2 = Math.floor(y / cellHeight);
    ctx.beginPath();
    ctx.rect(x2 * cellWidth, y2 * cellHeight, cellWidth, cellHeight);
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    console.log("coloring cell at: " + x + ", " + y + " color: " + ctx.fillStyle);

    ctx.fill();
}

getRgbColorStyle = function () {
    var r = document.getElementById('rIn').value;
    var g = document.getElementById('gIn').value;
    var b = document.getElementById('bIn').value;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}


$('#reset').on('click', function () {
    console.log("Resetting");
    ctx.clearRect(0, 0, gridWidth, gridHeight);
});

$('#pixelate').on('click', function () {
    pixelate();
});

$('#addImage').on('click', function () {
    addImage();
});


pixelate = function () {
    console.log("pixelating...");
    // TODO: better performance if we only update the area that is affected, but figuring that out may take as much power

    var imgd = ctx.getImageData(0, 0, gridWidth, gridHeight);
    //get the average rgb colors
    //draw rect to fill in cell with those colors
    //pixelMatrixHeight
    for (var y1 = 0; y1 < pixelMatrixHeight; y1++) {
        //pixelMatrixWidth
        for (var x1 = 0; x1 < pixelMatrixWidth; x1++) {
            var cellR = 0;
            var cellG = 0;
            var cellB = 0;
            var count = 0;
            var emptyValues = 0;
            for (var y2 = 0; y2 < cellHeight; y2++) {
                for (var x2 = 0; x2 < cellWidth; x2++) {
                    var pos = (y1 * imgd.width * 4 * cellHeight) + (x1 * 4 * cellWidth) + (y2 * imgd.width * 4) + (x2 * 4);
                    //console.log(pos);
                    if (imgd.data[pos] + imgd.data[pos + 1] + imgd.data[pos + 2] > 0) {
                        count++;
                        cellR = cellR + imgd.data[pos];
                        cellG = cellG + imgd.data[pos + 1];
                        cellB = cellB + imgd.data[pos + 2];
                    } else {
                        emptyValues++;
                    }

                }
            }
            emptyValues = emptyValues * 0.8; // seems to be a good value with the limited testing I have done
            if (count > emptyValues) {
                count = count + emptyValues;
                cellR = Math.floor(cellR / count);
                cellG = Math.floor(cellG / count);
                cellB = Math.floor(cellB / count);

                console.log("cell (" + x1 + "," + y1 + ") = " + "(" + cellR + "," + cellG + "," + cellB + ")" + count + "/" + emptyValues);

                colorCellAtCanvasLocationWithColor(x1 * cellWidth, y1 * cellWidth, cellR, cellG, cellB);
            } else {
                colorCellAtCanvasLocationWithColor(x1 * cellWidth, y1 * cellWidth, 0, 0, 0);

            }
        }
    }

}
$('.palette li').on('click', function (e) {
    var style = e.target.style.backgroundColor;
    style = style.substring(style.indexOf('(') + 1, style.length - 1);
    document.getElementById('rIn').value = style.substring(0, style.indexOf(','));
    style = style.substring(style.indexOf(',') + 1);
    document.getElementById('gIn').value = style.substring(0, style.indexOf(','));
    document.getElementById('bIn').value = style.substring(style.indexOf(',') + 1).trim();
})

$('#fillMatrix').on('click', function () {
    var imgd = ctx.getImageData(0, 0, gridWidth, gridHeight);
    var pix = imgd.data;
    for (var x = 0; x < pixelMatrixWidth; x++) {
        for (var y = 0; y < pixelMatrixHeight; y++) {
            var pos = (y * imgd.width * 4 * cellHeight) + (x * 4 * cellWidth);
            pixelMatrix[x][y][0] = pix[pos];
            pixelMatrix[x][y][1] = pix[pos+1];
            pixelMatrix[x][y][2] = pix[pos+2];

        }
    }
    exportMatrix();
});
// = { brightness, delay, {px1...px150},

exportMatrix = function(){
    var structString = 'PROGMEM = {';
    //Iterate to duplicate frames for now, later frames will differ, and hopefully so will numberOfFrames
    for(var f = 0; f<numberOfAnimationFrames; f++){
        structString += '50, 500, {'
    for (var x = 0; x < pixelMatrixWidth; x++) {
        for (var y = 0; y < pixelMatrixHeight; y++) {
            var z = y;
            if(x%2==0)
                z = pixelMatrixHeight-1-y;
            structString += pixelMatrix[x][z] + ', ';
        }
    }
        structString = structString.substring(0,structString.length-2);
        structString += '},';

    }
    structString = structString.substring(0,structString.length-1);

    structString += '}';
    console.log(structString);
}


addImage = function() {
    var image = new Image();
    image.src = "img/2000px-Flag_of_Colorado-square.png";
    image.addEventListener('load', function(){     ctx.drawImage(image, 0, 0, 600, 600);
    });
}






