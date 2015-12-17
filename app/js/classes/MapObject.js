import $ from 'jquery';
import MIFParser from './MIFParser.js'
import CoordSys from './CoordSys.js'
import MapCanvas from './MapCanvas.js'
import Point from './Point.js'
import Line from './Line.js'

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
    var eps = 1e-4;
    var max_dist = 4 * this.coordsys.getScale();
    var map_point = this.coordsys.clientToMap(point);
    var obj = -1;
    for(var i = this.data.length - 1; i >= 0 && obj == -1; i--) {
      switch(this.data[i].type) {
        case 'point':
          var dist = Point.dist(this.data[i], map_point);
          if(dist < max_dist)
          {
            logger.log('Clicked point: ', i);
            obj = i;
            break;
          }
          break;
        case 'line':
          var dist = Line.dist(new Line(this.data[i], true), map_point);
          if(dist < max_dist)
          {
            logger.log('Clicked line: ', i);
            obj = i;
            break;
          }
          break;
        case 'pline':
          for(var j = 0; j < this.data[i].sections.length && obj == -1; j++)
          {
            for(var k = 0; k < this.data[i].sections[j].length && obj == -1; k++)
            {
              var nk = (k + 1) % this.data[i].sections[j].length;
              var dist = Line.dist(new Line(this.data[i].sections[j][k], this.data[i].sections[j][nk], true), map_point);
              if(dist < max_dist)
              {
                logger.log('Clicked pline: ', i);
                obj = i;
                break;
              }
            }
          }
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
              var v2 = Point.sub(map_point, start);
              var cp1 = Point.crossp(v1, v2);
              if(Math.abs(cp1) < eps) {
                obj == i;
                break;
              }
              if(cp1 > eps) {
                if(Math.abs(map_point.y - start.y) < eps || 
                    (Math.abs(map_point.y - end.y) > eps && (end.y > map_point.y) != (start.y > map_point.y)))
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
        case 'multimap_point':
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
    //this.drawAll();
    return obj;
  }

  removeHighlight()
  {
    for(var i = 0; i < this.data.length; i++) {
      this.data[i].highlight = 0;
    }
  }
  
  findLinesIntersetingPolygon(index)
  {
    var res = [];
    var polygon = this.data[index];
    for(var i = 0; i < this.data.length; i++) {
      if(i != index) {
        if(this.data[i].type == 'line') {
          var curLine = new Line(this.data[i], true);
          var was = false;
          for(var j = 0; j < polygon.polygons.length && !was; j++) {
            for(var k = 0; k < polygon.polygons[j].length && !was; k++) {
              var nk = (k + 1) % polygon.polygons[j].length;
              console.log(Line.intersect(new Line(polygon.polygons[j][k], polygon.polygons[j][nk], true), curLine));
              if(Line.intersect(new Line(polygon.polygons[j][k], polygon.polygons[j][nk], true), curLine) != false)
              {
                was = true;
              }
            }
          }
          if(was)
            res.push(i);
        }
      }
    }
    return res;
  }
  
  findIntersections()
  {
    for(var i = 0; i < this.data.length; i++)
    {
      if(this.data[i].highlight != false && this.data[i].type == 'region')
      {
        var lines = this.findLinesIntersetingPolygon(i);
        for(var j = 0; j < lines.length; j++)
          this.data[lines[j]].highlight = 1;
      }
    }
  }
}