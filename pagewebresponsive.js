'use strict';
var data;
var currentframe = 0;
var timerofvideo;
var video;
var minsActionClick;
var maxsActionClick;
var minsActionDraw;
var maxsActionDraw;

//Load page
$(document).ready(function () {
    //If we work on server
    //getJsonDataFromFile_ServerSide();
    //if we work local
    getJsonDatafromFile_ClientSide();
});

function getJsonDataFromFile_ServerSide() {
    $.ajax({
        url: "jsondata/test.json",
        datatype: "json",
        success: function (result) {
            data = JSON.parse(result);
            buildWebPage();
        }
    });
}

function getJsonDatafromFile_ClientSide() {
    data =
        {
            "name": "test",
            "framerate": 25,
            "width": 320,
            "height": 176,
            "samples": [
                {
                    "action": "clic",
                    "framenumber": 10,
                    "coordinates": [
                        {
                            "x": 10,
                            "y": 10
                        },
                        {
                            "x": 310,
                            "y": 166
                        },
                        {
                            "x": 10,
                            "y": 166
                        },
                        {
                            "x": 310,
                            "y": 10
                        }
                    ]
                },
                {
                    "action": "draw",
                    "framenumber": 170,
                    "coordinates": [
                        {
                            "x": 10,
                            "y": 10
                        },
                        {
                            "x": 310,
                            "y": 10
                        },
                        {
                            "x": 310,
                            "y": 166
                        },
                        {
                            "x": 10,
                            "y": 166
                        }
                    ]
                }
            ]
        };
    buildWebPage();
}

function buildWebPage() {
    minsActionClick = GetMinXMinY(0);
    maxsActionClick = GetMaxXMaxY(0);
    minsActionDraw = GetMinXMinY(1);
    maxsActionDraw = GetMaxXMaxY(1);
    var container = createContainerVideo();
    createVideoElement(container);
    var timeofoneframe = (1 / data.framerate) * 1000;
    timerofvideo = setInterval(function () { setCurrentframe(container); }, timeofoneframe);
}

//Add container video
function createContainerVideo() {
    var container = document.createElement('div');
    container.style.width = data.width + 'px';
    container.style.height = data.height + 'px';
    container.classList.add('position-relative');
    container.classList.add('border');
    document.body.appendChild(container);
    return container;
}
//Add video
function createVideoElement(container) {
    var videoElement = document.createElement('video');
    videoElement.setAttribute('width', data.width);
    videoElement.setAttribute('height', data.height);
    videoElement.setAttribute('preload', 'meta');
    videoElement.setAttribute('autoplay', 'true');
    videoElement.classList.add('position-absolute');
    //If you want add controls to element video
    videoElement.setAttribute('controls', 'true');
    var source = document.createElement('source');
    source.setAttribute('src', 'test.mp4');
    //source.setAttribute('type', 'video/mp4');
    videoElement.appendChild(source);
    container.appendChild(videoElement);
    //When sstop the video the clear the timer from page
    videoElement.addEventListener('ended', function() {
        clearInterval(timerofvideo);
    });
    video = videoElement;
}
//Create zone of action click
function createzoneofactionclick(container) {
    video.pause();
    var canvaszone1 = document.createElement('canvas');
    canvaszone1.setAttribute('top', '0');
    canvaszone1.setAttribute('left', '0');
    canvaszone1.setAttribute('width', data.width);
    canvaszone1.setAttribute('height', data.height);
    //canvaszone1.classList.add('border');
    canvaszone1.classList.add('position-absolute');
    var ctx = canvaszone1.getContext('2d');
    ctx.beginPath();
    ctx.rect(minsActionClick.minX, minsActionClick.minY, maxsActionClick.maxX, maxsActionClick.maxY);
    ctx.strokeStyle = "black"; //Set transparent for hide the rect
    ctx.stroke();
    container.appendChild(canvaszone1);
    canvaszone1.addEventListener('click', function (event) {
        if (event.offsetX >= minsActionClick.minX
            && event.offsetX <= maxsActionClick.maxX
            && event.offsetY >= minsActionClick.minY
            && event.offsetY <= maxsActionClick.maxY) {
            container.removeChild(canvaszone1);
            video.play();
        }
    });
}
//Create zone if action draw
function createzoneofactiondraw(container) {
    //video.pause();
    var canvaszone2 = document.createElement('canvas');
    canvaszone2.setAttribute('top', '0');
    canvaszone2.setAttribute('left', '0');
    canvaszone2.setAttribute('width', data.width);
    canvaszone2.setAttribute('height', data.height);
    //canvaszone2.classList.add('border');
    canvaszone2.classList.add('position-absolute');
    var ctx = canvaszone2.getContext('2d');
    ctx.beginPath();
    ctx.rect(minsActionDraw.minX, minsActionDraw.minY, maxsActionDraw.maxX, maxsActionDraw.maxY);
    ctx.strokeStyle = "black"; //Set transparent for hide the rect
    ctx.stroke();
    container.appendChild(canvaszone2);
}

//Utilities functions
function setCurrentframe(container) {
    if (video.paused) {
        return;
    }
    currentframe++;
    if (currentframe == data.samples[0].framenumber) {
        createzoneofactionclick(container);
        return;
    }
    if (currentframe == data.samples[1].framenumber) {
        createzoneofactiondraw(container);
    }
}

function GetMinXMinY(actionNo) {
    var mins = {
        minX: 0,
        minY:0
    }
    var coordinates = data.samples[actionNo].coordinates;
    mins.minX = coordinates[0].x;
    mins.minY = coordinates[0].y;
    for (var i = 1; i < coordinates.length; i++) {
        if (mins.minX > coordinates[i].x) {
            mins.minX = coordinates[i].x;
        }
        if (mins.minY > coordinates[i].y) {
            mins.minY = coordinates[i].y;
        }
    }
    return mins;
}

function GetMaxXMaxY(actionNo) {
    var maxs = {
        maxX: 0,
        maxY: 0
    }
    var coordinates = data.samples[actionNo].coordinates;
    maxs.maxX = coordinates[0].x;
    maxs.maxY = coordinates[0].y;
    for (var i = 1; i < coordinates.length; i++) {
        if (maxs.maxX < coordinates[i].x) {
            maxs.maxX = coordinates[i].x;
        }
        if (maxs.maxY < coordinates[i].y) {
            maxs.maxY = coordinates[i].y;
        }
    }
    return maxs;
}