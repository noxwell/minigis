import $ from 'jquery'
import Point from './Point.js'

export default class MapCanvas {
  constructor(canvas)
  {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.bounds = canvas.getBoundingClientRect();
    this.bounds = [
      new Point(this.bounds.left, this.bounds.top),
      new Point(this.bounds.right, this.bounds.bottom)
    ];
  }
  
  clear()
  {
    this.context.clearRect(0, 0, this.width, this.height);
  }
  
  drawLine(line, coordsys)
  {
    var start = coordsys.mapToCanvas(new Point(line.x1, line.y1));
    var end = coordsys.mapToCanvas(new Point(line.x2, line.y2));
    this.context.beginPath();
    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  }
  
  drawPline(pline, coordsys)
  {
    for(var i = 0; i < pline.sections.length; i++)
    {
      this.context.beginPath();
      this.context.strokeStyle = pline.pen.color;
      this.context.lineWidth = pline.pen.width;
      
      var start = coordsys.mapToCanvas(new Point(pline.sections[i][0].x, pline.sections[i][0].y));
      this.context.moveTo(start.x, start.y);
      for(var j = 1; j < pline.sections[i].length; j++)
      {
        var pos = coordsys.mapToCanvas(new Point(pline.sections[i][j].x, pline.sections[i][j].y));
        this.context.lineTo(pos.x, pos.y);
      }
      this.context.stroke();
    }
  }
  drawRegion(region, coordsys)
  {
    for(var i = 0; i < region.polygons.length; i++)
    {
      this.context.strokeStyle = region.pen.color;
      if(region.highlight)
        this.context.fillStyle = '#FF0000';
      else
        this.context.fillStyle = region.brush.backcolor;
      this.context.lineWidth = region.pen.width;
      
      this.context.beginPath();
      var start = coordsys.mapToCanvas(new Point(region.polygons[i][0].x, region.polygons[i][0].y));
      this.context.moveTo(start.x, start.y);
      for(var j = 1; j < region.polygons[i].length; j++)
      {
        var pos = coordsys.mapToCanvas(new Point(region.polygons[i][j].x, region.polygons[i][j].y));
        this.context.lineTo(pos.x, pos.y);
      }
      this.context.lineTo(start.x, start.y);
      this.context.stroke();
      this.context.fill();
    }
  }
  drawText(text, coordsys)
  {
    var rect = [
      coordsys.mapToCanvas(new Point(text.x1, text.y1)),
      coordsys.mapToCanvas(new Point(text.x2, text.y2)),
    ];
    var height = rect[0].y - rect[1].y;
    this.context.font = height + "px Arial";
    this.context.fillStyle = '#000000';
    this.context.fillText(text.textstring, Math.min(rect[0].x, rect[1].x), Math.max(rect[0].y, rect[1].y));
  }
  
  drawObject(object, coordsys)
  {
    switch(object.type)
    {
      case 'point':
        break;
      case 'line':
        this.drawLine(object, coordsys);
        break;
      case 'pline':
        this.drawPline(object, coordsys);
        break;
      case 'region':
        this.drawRegion(object, coordsys);
        break;
      case 'arc':
        break;
      case 'text':
        this.drawText(object, coordsys);
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
}