import $ from 'jquery';
import Logger from './classes/Logger.js'
import MapObject from './classes/MapObject.js'
import MapCanvas from './classes/MapCanvas.js'
import CoordSys from './classes/CoordSys.js'
import Point from './classes/Point.js'

$(document).ready(function() {
  window.logger = new Logger(!true);
  logger.log('Hello, world!', 2);
  $('#map_canvas')[0].setAttribute('width', $(document).width() * 0.7);
  $('#map_canvas')[0].setAttribute('height', $(document).height() * 0.7);

  var loadMapList = function(list) {
    return new Promise(function(resolve, reject) {
      var data = Array(list.length);
      var data_ctr = 0;
      if(list.length == 0)
        resolve(data);
      for(var i = 0; i < list.length; i++)
      {
        (function(i) {
          $.get(list[i])
            .then(function(res) {
              data[i] = {filename: list[i].substring(list[i].lastIndexOf('/') + 1), content: res};
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
      var disabledMaps = [];
      
      var enabled_select = $('#enabled_layers')[0];
      var disabled_select = $('#disabled_layers')[0];
      var redrawAll = function()
      {
        canvas.clear();
        for(let i = map.length - 1; i >= 0; i--)
        {
          map[i].drawAll();
        }
      }
      
      var mergeAll = function()
      {
        let bounds = {
          minx: 1e7,
          miny: 1e7,
          maxx: -1e7,
          maxy: -1e7        
        };
        for(let i = 0; i < map.length; i++)
        {
          bounds = CoordSys.mergeBounds(bounds, map[i].coordsys.coordsys.bounds);
        }
        for(let i = 0; i < map.length; i++)
        {
          map[i].coordsys.coordsys.bounds = {
            minx: bounds.minx,
            miny: bounds.miny,
            maxx: bounds.maxx,
            maxy: bounds.maxy       
          };
          map[i].coordsys.refreshRect();
        }
      }
      
      var refreshEnabled = function()
      {
        while(enabled_select.length)
        {
          enabled_select.remove(0);
        }
        for(var i = 0; i < map.length; i++)
        {
          var option = document.createElement("option");
          option.text = map[i].filename;
          enabled_select.add(option);
        }
      }
      
      var refreshDisabled = function()
      {
        while(disabled_select.length)
        {
          disabled_select.remove(0);
        }
        for(let i = 0; i < disabledMaps.length; i++)
        {
          let option = document.createElement("option");
          option.text = disabledMaps[i].filename;
          disabled_select.add(option);
        }
      }
      
      for(let i = 0; i < raw_data.length; i++)
      {
        map[i] = new MapObject(raw_data[i].filename, raw_data[i].content, canvas);
      }
      mergeAll();
      refreshEnabled();
      redrawAll();
      
      $('#zoom_in').on('click', function(){
        canvas.clear();
        for(let i = map.length - 1; i >= 0; i--)
          map[i].zoomIn();
      });
      $('#zoom_out').on('click', function(){
        canvas.clear();
        for(let i = map.length - 1; i >= 0; i--)
          map[i].zoomOut();
      });
      $('#map_canvas').on('mousewheel', function(event){
        canvas.clear();
        if(event.originalEvent.wheelDelta > 0)
          for(let i = map.length - 1; i >= 0; i--)
            map[i].zoomIn(Math.abs(1 + event.originalEvent.wheelDelta / 1000));
        else
          for(let i = map.length - 1; i >= 0; i--)
            map[i].zoomOut(Math.abs(1 - event.originalEvent.wheelDelta / 1000));
        event.stopPropagation();
        return false;
      });
      $('#map_canvas').on('mousedown', function(event){
        canvas.mousedown = true;
        canvas.moveLength = 0;
        canvas.lastPos = new Point(event.pageX, event.pageY);
        return false;
      });
      $('#map_canvas').on('mouseup', function(){
        let curPos = new Point(event.pageX, event.pageY);
        canvas.mousedown = false;
        if(canvas.moveLength < 3)
        {
          let clicked = -1;
          for(let i = 0; i < map.length; i++)
          {
            if(map[i].clickObject(curPos) != -1)
            {
              clicked = i;
              break;
            }
          }
          canvas.clear();
          for(let i = map.length - 1; i >= 0; i--)
          {
            if(i != clicked)
              map[i].removeHighlight();
            map[i].drawAll();
          }       
        }
        return false;
      });
      $('#map_canvas').on('mousemove', function(event){
        let curPos = new Point(event.pageX, event.pageY);
        if(canvas.mousedown)
        {
          canvas.clear();
          let delta = Point.sub(curPos, canvas.lastPos);
          canvas.moveLength += delta.length;
          for(let i = map.length - 1; i >= 0; i--)
            map[i].move(delta);
          canvas.lastPos = curPos;
        }
        return false;
      });
      $('#find_intersections').on('click', function(){
        for(let i = 0; i < map.length; i++)
        {
          map[i].findIntersections();
        }
        redrawAll();
      });
      $('#move_up').on('click', function(){
        let i = enabled_select.selectedIndex;
        
        if(i > 0)
        {
          [map[i], map[i - 1]] = [map[i - 1], map[i]];
          refreshEnabled();
          redrawAll();
        }
      });
      
      $('#move_down').on('click', function(){
        let i = enabled_select.selectedIndex;
        
        if(i != -1 && i < map.length - 1)
        {
          [map[i], map[i + 1]] = [map[i + 1], map[i]];
          refreshEnabled();
          redrawAll();
        }
      });
      
      $('#move_off').on('click', function(){
        let i = enabled_select.selectedIndex;
        
        let temp = map.splice(i, 1)
        disabledMaps.push(temp[0]);

        refreshEnabled();
        refreshDisabled();
        redrawAll();
      });
      
      $('#move_on').on('click', function(){
        let i = disabled_select.selectedIndex;
        
        let temp = disabledMaps.splice(i, 1)
        map.push(temp[0]);
        
        refreshEnabled();
        refreshDisabled();
        redrawAll();
      });
      $('#load_layer').on('change', function(e){
        let files = Array.from(e.target.files);
        for(let file of files)
        {
          let reader = new FileReader();
          let filename = file.name;
          reader.onload = function(e){
            map.push(new MapObject(filename, e.target.result, canvas));
            mergeAll();
            refreshEnabled();
            redrawAll();
          }
          reader.readAsText(file)
        }
      });
    });
});