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
  //'/assets/maps/222.mif',
  //'/assets/maps/Enskaya_oblast.mif',
  '/assets/maps/test.mif'
];

loadMapList(mapList)
  .then(function(raw_data) {
    var canvas = new MapCanvas($('#map_canvas')[0]);
    var map = [];
    var redrawAll = function()
    {
      canvas.clear();
      for(var i = map.length - 1; i >= 0; i--)
        map[i].drawAll();
    }

    for(var i = raw_data.length - 1; i >= 0; i--)
    {
      map[i] = new MapObject(raw_data[i], canvas);
      map[i].drawAll();
    }
    $('#zoom_in').on('click', function(){
      canvas.clear();
      for(var i = map.length - 1; i >= 0; i--)
        map[i].zoomIn();
    });
    $('#zoom_out').on('click', function(){
      canvas.clear();
      for(var i = map.length - 1; i >= 0; i--)
        map[i].zoomOut();
    });
    $('#map_canvas').on('mousewheel', function(event){
      canvas.clear();
      if(event.originalEvent.wheelDelta > 0)
        for(var i = map.length - 1; i >= 0; i--)
          map[i].zoomIn(Math.abs(1 + event.originalEvent.wheelDelta / 1000));
      else
        for(var i = map.length - 1; i >= 0; i--)
          map[i].zoomOut(Math.abs(1 - event.originalEvent.wheelDelta / 1000));
      event.stopPropagation();
    });
    $('#map_canvas').on('mousedown', function(event){
      canvas.mousedown = true;
      canvas.moveLength = 0;
      canvas.lastPos = new Point(event.pageX, event.pageY);
    });
    $('#map_canvas').on('mouseup', function(){
      var curPos = new Point(event.pageX, event.pageY);
      canvas.mousedown = false;
      if(canvas.moveLength < 3)
      {
        var clicked = -1;
        for(var i = 0; i < map.length; i++)
        {
          if(map[i].clickObject(curPos) != -1)
          {
            clicked = i;
            break;
          }
        }
        canvas.clear();
        for(var i = map.length - 1; i >= 0; i--)
        {
          if(i != clicked)
            map[i].removeHighlight();
          map[i].drawAll();
        }       
      }
    });
    $('#map_canvas').on('mousemove', function(event){
      var curPos = new Point(event.pageX, event.pageY);
      if(canvas.mousedown)
      {
        canvas.clear();
        var delta = Point.sub(curPos, canvas.lastPos);
        canvas.moveLength += delta.length;
        for(var i = map.length - 1; i >= 0; i--)
          map[i].move(delta);
        canvas.lastPos = curPos;
      }
    });
    $('#find_intersections').on('click', function(){
      for(var i = 0; i < map.length; i++)
      {
        map[i].findIntersections();
      }
      redrawAll();
    });
  });