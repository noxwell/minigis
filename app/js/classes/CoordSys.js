import Point from './Point.js'

export default class CoordSys {
  constructor(canvas, coordsys, data)
  {
    this.coordsys = coordsys;
    if(!this.coordsys.hasOwnProperty('bounds'))
      this.coordsys.bounds = this.getBounds(data);
    this.map_width = this.coordsys.bounds.maxx - this.coordsys.bounds.minx;
    this.map_height = this.coordsys.bounds.maxy - this.coordsys.bounds.miny;
    this.canvas = canvas;
    this.max_scale = Math.max(this.map_width / this.canvas.width, 
                            this.map_height / this.canvas.height);
    this.setDisplayRect(1, 
      new Point((this.coordsys.bounds.maxx + this.coordsys.bounds.minx) / 2, 
                 (this.coordsys.bounds.maxy + this.coordsys.bounds.miny) / 2));
  }
  
  getBounds(data)
  {
    var bounds = {
      minx: 1e7,
      miny: 1e7,
      maxx: -1e7,
      maxy: -1e7        
    };
    var min = Math.min;
    var max = Math.max;
    for(var i = 0; i < data.length; i++)
    {
      if(data[i].type == 'point')
      {
        bounds.minx = min(bounds.minx, data[i].x);
        bounds.miny = min(bounds.miny, data[i].y);
        bounds.maxx = max(bounds.maxx, data[i].x);
        bounds.maxy = max(bounds.maxy, data[i].y);
      }
      else if(data[i].type == 'line' || data[i].type == 'text' || 
          data[i].type == 'arc' || data[i].type == 'rect' ||
          data[i].type == 'roundrect' || data[i].type == 'ellipse')
      {
        bounds.minx = min(bounds.minx, min(data[i].x1, data[i].x2));
        bounds.miny = min(bounds.miny, min(data[i].y1, data[i].y2));
        bounds.maxx = max(bounds.maxx, max(data[i].x1, data[i].x2));
        bounds.maxy = max(bounds.maxy, max(data[i].y1, data[i].y2));
      }
      else if(data[i].type == 'pline')
      {
        for(var j = 0; j < data[i].sections.length; j++)
        {
          for(var k = 0; k < data[i].sections[j].length; k++)
          {
            bounds.minx = min(bounds.minx, data[i].sections[j][k].x);
            bounds.miny = min(bounds.miny, data[i].sections[j][k].y);
            bounds.maxx = max(bounds.maxx, data[i].sections[j][k].x);
            bounds.maxy = max(bounds.maxy, data[i].sections[j][k].y);
          }
        }
      }
      else if(data[i].type == 'region')
      {
        for(var j = 0; j < data[i].polygons.length; j++)
        {
          for(var k = 0; k < data[i].polygons[j].length; k++)
          {
            bounds.minx = min(bounds.minx, data[i].polygons[j][k].x);
            bounds.miny = min(bounds.miny, data[i].polygons[j][k].y);
            bounds.maxx = max(bounds.maxx, data[i].polygons[j][k].x);
            bounds.maxy = max(bounds.maxy, data[i].polygons[j][k].y);
          }
        }
      }
      else if(data[i].type == 'multipoint')
      {
        for(var j = 0; j < data[i].points.length; j++)
        {
          bounds.minx = min(bounds.minx, data[i].points[j].x);
          bounds.miny = min(bounds.miny, data[i].points[j].y);
          bounds.maxx = max(bounds.maxx, data[i].points[j].x);
          bounds.maxy = max(bounds.maxy, data[i].points[j].y);
        }
      }
      else if(data[i].type == 'collection')
      {
        var cbounds = this.getBounds(data[i].data);
        bounds.minx = min(bounds.minx, cbounds.minx);
        bounds.miny = min(bounds.miny, cbounds.miny);
        bounds.maxx = max(bounds.maxx, cbounds.maxx);
        bounds.maxy = max(bounds.maxy, cbounds.maxy);
      }
    }
    return bounds;
  }
  
  getCenter()
  {
    return Point.div(Point.add(this.displayRect[1], this.displayRect[0]), 2);
  }
  
  getScale()
  {
    return (this.displayRect[1].x - this.displayRect[0].x) / this.canvas.width;
  }
  
  setDisplayRect(zoom, center)
  {
    var scale = this.max_scale / zoom;
    var diag_vector = Point.mul(new Point(this.canvas.width / 2, this.canvas.height / 2), scale);
    this.displayRect = [
      Point.sub(center, diag_vector),
      Point.add(center, diag_vector)
    ];
  }
  
  setZoom(zoom)
  {
    this.setDisplayRect(zoom, this.getCenter());
  }
  
  moveMap(delta)
  {
    var map_delta = new Point(delta.x, -delta.y);
    map_delta = Point.mul(map_delta, this.getScale());
    this.displayRect[0] = Point.sub(this.displayRect[0], map_delta);
    this.displayRect[1] = Point.sub(this.displayRect[1], map_delta);
  }
  
  mapToCanvas(point)
  {
    var v1 = Point.sub(point, this.displayRect[0]);
    var scale = this.getScale();
    v1 = Point.div(v1, scale);
    v1.y = this.canvas.height - v1.y;
    return v1;
  }
  
  canvasToMap(point)
  {
    var map_point = new Point(point.x, this.canvas.height - point.y);
    map_point = Point.mul(map_point, this.getScale());
    return Point.add(map_point, this.displayRect[0]);
  }
  
  clientToCanvas(point)
  {
    return Point.sub(point, this.canvas.bounds[0]);
  }
  
  canvasToClient(point)
  {
    return Point.add(point, this.canvas.bounds[0]);
  }
  
  mapToClient(point)
  {
    return this.canvasToClient(this.mapToCanvas(point));
  }
  
  clientToMap(point)
  {
    return this.canvasToMap(this.clientToCanvas(point));
  }
}