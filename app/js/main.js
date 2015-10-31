import $ from 'jquery';
import Logger from './classes/Logger.js'
import MapObject from './classes/MapObject.js'
import MapCanvas from './classes/MapCanvas.js'
import Point from './classes/Point.js'

window.logger = new Logger(true);
logger.log('Hello, world!', 2);

var loadMapList = function(list) {
  return new Promise(function(resolve, reject) {
    var data = Array(list.length);
    var data_ctr = 0;
    for(var i = 0; i < list.length; i++)
    {
      (function(i) {
        $.get(list[i])
          .then(function(res) {
            data[i] = res;
            data_ctr++;
            if(data_ctr == list.length)
              resolve(data);
          }, function(res) {
            reject(res);
          });
      })(i);
    }
  });
};

var mapList = [
  '/assets/maps/222.mif',
  '/assets/maps/test.mif',
  '/assets/maps/Enskaya_oblast.mif'
];

loadMapList(mapList)
  .then(function(data) {
    console.log(data);
  });

$.get('/assets/maps/222.mif', function(raw_data) {
  var canvas = new MapCanvas($('#map_canvas')[0]);
  var map = new MapObject(raw_data, canvas);
  map.drawAll();
  $('#zoom_in').on('click', function(){
    canvas.clear();
    map.zoomIn();
  });
  $('#zoom_out').on('click', function(){
    canvas.clear();
    map.zoomOut();
  });
  $('#map_canvas').on('mousewheel', function(event){
    canvas.clear();
    if(event.originalEvent.wheelDelta > 0)
      map.zoomIn(Math.abs(1 + event.originalEvent.wheelDelta / 1000));
    else
      map.zoomOut(Math.abs(1 - event.originalEvent.wheelDelta / 1000));
    event.stopPropagation();
  });
  $('#map_canvas').on('mousedown', function(event){
    map.lastPos = new Point(event.pageX, event.pageY);
    map.moveLength = 0;
    map.mousedown = true;
  });
  $('#map_canvas').on('mouseup', function(){
    map.mousedown = false;
    var curPos = new Point(event.pageX, event.pageY);
    if(map.moveLength < 3)
    {
      canvas.clear();
      map.clickObject(new Point(event.pageX, event.pageY));
    }
  });
  $('#map_canvas').on('mousemove', function(event){
    if(map.mousedown)
    {
      canvas.clear();
      var curPos = new Point(event.pageX, event.pageY);
      var delta = Point.sub(curPos, map.lastPos);
      map.moveLength += delta.length;
      map.move(delta);
      map.lastPos = curPos;
    }
  });
});