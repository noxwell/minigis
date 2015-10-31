import $ from 'jquery';
import MIFParser from './MIFParser.js'
import CoordSys from './CoordSys.js'
import MapCanvas from './MapCanvas.js'
import Point from './Point.js'

export default class MapObject
{
  constructor(raw_data, canvas)
  {
    var map_data = MIFParser.parseToJSON(raw_data);
    this.header = map_data.header;
    this.data = map_data.data;
    this.canvas = canvas;
    this.coordsys = new CoordSys(
      this.canvas,
      this.header.coordsys,
      this.data
    );
    this.zoom = 1;
    logger.log("Object created: ", this);
  }
  drawAll()
  {
    for(var i = 0; i < this.data.length; i++)
      this.canvas.drawObject(this.data[i], this.coordsys);
  }
  zoomIn(speed)
  {
    if(typeof speed === 'undefined')
      speed = 1.3;
    this.zoom *= speed;
    this.coordsys.setZoom(this.zoom);
    this.drawAll();
  }
  zoomOut(speed)
  {
    if(typeof speed === 'undefined')
      speed = 1.3;
    this.zoom = Math.max(1, this.zoom / speed);
    this.coordsys.setZoom(this.zoom);
    this.drawAll();
  }
  move(delta)
  {
    this.coordsys.moveMap(delta);
    this.drawAll();
  }
  clickObject(point)
  {
    var eps = 1e-8;
    point = this.coordsys.clientToMap(point);
    var obj = -1;
    for(var i = this.data.length - 1; i >= 0 && obj == -1; i--) {
      switch(this.data[i].type) {
        case 'point':
          break;
        case 'line':
          break;
        case 'pline':
          break;
        case 'region':
          var vect = new Point(1, 0);
          for(var j = 0; j < this.data[i].polygons.length && obj == -1; j++) {
            var ctr = 0;
            for(var k = 0; k < this.data[i].polygons[j].length && obj == -1; k++) {
              var start = this.data[i].polygons[j][k];
              var end = this.data[i].polygons[j][(k + 1) % this.data[i].polygons[j].length];
              if(Math.abs(start.y - end.y) < eps)
                continue;
              if(start.y > end.y)
                end = [start, start = end][0];
              var v1 = Point.sub(end, start);
              var v2 = Point.sub(point, start);
              var cp1 = Point.crossp(v1, v2);
              if(Math.abs(cp1) < eps) {
                obj == i;
                break;
              }
              if(cp1 > eps) {
                if(Math.abs(point.y - start.y) < eps || 
                    (Math.abs(point.y - end.y) > eps && (end.y > point.y) != (start.y > point.y)))
                  ctr++;
              }
            }
            if(ctr % 2 == 1 && obj == -1) {
              logger.log('Clicked polygon: ', i, j);
              obj = i;
              break;
            }
          }
          
          break;
        case 'arc':
          break;
        case 'text':
          break;
        case 'rect':
          break;
        case 'roundrect':
          break;
        case 'ellipse':
          break;
        case 'multipoint':
          break;
        case 'collection':
          break;
      };
    }
    for(var i = 0; i < this.data.length; i++) {
      if(i == obj)
        this.data[i].highlight = !this.data[i].highlight;
      else
        this.data[i].highlight = 0;
    }
    this.drawAll();
    return obj;
  }
}