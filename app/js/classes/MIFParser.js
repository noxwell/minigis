import Point from './Point.js'

export default class MIFParser {
  static trimQuotes(line) {
    if(line[0] != '"' || line[line.length - 1] != '"')
      return line;
    else
      return line.substring(1, line.length - 1);
  }
  
  static trimBrackets(line) {
    if(line[0] != '(' || line[line.length - 1] != ')')
      return line;
    else
      return line.substring(1, line.length - 1);
  }
  
  static trimArray(arr)
  {
    var res = [];
    for(var i = 0; i < arr.length; i++)
    {
      arr[i] = arr[i].trim();
      if(arr[i].length != 0)
        res.push(arr[i]);
    }
    return res;
  }
  
  static parseCoordSys(line)
  {
    var projection_attrib = [
      'type', 'datum', 'unitname', 'origin_longtitude',
      'origin_latitude', 'standard_parallel_1', 'standard_parallel_2',
      'azimuth', 'scale_factor', 'false_easting', 'false_northing', 'range'
    ];
    var affine_attrib = [
      'unitname', 'a', 'b', 'c', 'd', 'e', 'f'
    ];
    var arr = this.trimArray(line.toLowerCase().split(' '));
    var obj = {}
    switch(arr[0])
    {
      case 'earth':
        obj.type = arr[0];
        var i = 1;
        if(arr[i] == 'projection')
        {
          var projarr = [];
          i++;
          for(; i < arr.length && arr[i] != 'affine' && arr[i] != 'bounds'; i++)
            projarr.push(arr[i]);
          obj.projection = {}
          for(var j = 0; j < projarr.length; j++)
          {
            projarr[j] = projarr[j].split(',')[0];
            obj.projection[projection_attrib[j]] = this.trimQuotes(projarr[j]);
          }
        }
        if(arr[i] == 'affine')
        {
          var affarr = arr.slice(i + 2, i + 2 + affine_attrib.length);
          i += 2 + affine_attrib.length;
          obj.affine = {}
          for(var j = 0; j < affarr.length; j++)
          {
            affarr[j] = affarr[j].split(',')[0];
            obj.affine[affine_attrib[j]] = this.trimQuotes(affarr[j]);
          }
        }
        if(arr[i] == 'bounds')
        {
          var bounds = arr.slice(i + 1, arr.length).join(' ');
          var delim = bounds.indexOf(')') + 1;
          var minb = this.parseList(bounds.substring(0, delim).trim());
          var maxb = this.parseList(bounds.substring(delim + 1, bounds.length).trim());
          obj.bounds = {
            minx: parseFloat(minb[0]),
            miny: parseFloat(minb[1]),
            maxx: parseFloat(maxb[0]),
            maxy: parseFloat(maxb[1])
          };
        }
        break;
      case 'nonearth':
        obj.type = arr[0];
        var i = 1;
        if(arr[i] == 'affine')
        {
          var affarr = arr.slice(i + 2, i + 2 + affine_attrib.length);
          i += 2 + affine_attrib.length;
          obj.affine = {}
          for(var j = 0; j < affarr.length; j++)
          {
            affarr[j] = affarr[j].split(',')[0];
            obj.affine[affine_attrib[j]] = this.trimQuotes(affarr[j]);
          }
        }
        
        if(arr[i] == 'units')
        {
          obj.unitname = this.trimQuotes(arr[i + 1]);
          i += 2;
        }
        
        if(arr[i] == 'bounds')
        {
          var bounds = arr.slice(i + 1, arr.length).join(' ');
          var delim = bounds.indexOf(')') + 1;
          var minb = this.parseList(bounds.substring(0, delim).trim());
          var maxb = this.parseList(bounds.substring(delim + 1, bounds.length).trim());
          obj.bounds = {
            minx: parseFloat(minb[0]),
            miny: parseFloat(minb[1]),
            maxx: parseFloat(maxb[0]),
            maxy: parseFloat(maxb[1])
          };
        }
        break;
      case 'layout':
        obj.type = arr[0];
        if(arr[1] == 'units')
        {
          obj.units = this.trimQuotes(arr[2]);
        }
        break;
      case 'table':
        obj.type = arr[0];
        obj.tablename = arr[1];
        break;
      case 'window':
        obj.type = arr[0];
        obj.qindow_id = arr[1];
        break;
    }
    return obj;
  }
  
  static parseLine(line) {
    var arr = this.trimArray(line.split(' '));
    return [
      arr[0].toLowerCase(),
      arr.slice(1, arr.length).join(' ')
    ];
  }
  
  static parseColumns(lines)
  {
    var columns = Array(lines.length);
    for(var i = 0; i < lines.length; i++)
    {
      var line = this.parseLine(lines[i]);
      columns[i] = {
        name: line[0],
        type: line[1]
      };
    }
    return columns;
  }
  
  static parseList(line)
  {
    if(line[0] != '(' && line[-1] != ')')
      return [];
    return this.trimArray(this.trimBrackets(line).split(','));
  }
  
  static parsePointList(lines)
  {
    var points = Array(lines.length);
    for(var i = 0; i < lines.length; i++)
    {
      var line = this.trimArray(lines[i].split(' '));
      points[i] = {
        x: parseFloat(line[0]),
        y: parseFloat(line[1])
      };
    }
    return points;
  }
  
  static parseColor(color)
  {
    return '#' + parseInt(color).toString(16);
  }
  
  static parseSymbol(attrib)
  {
    var list = this.parseList(attrib);
    return {
      shape: parseInt(list[0]),
      color: this.parseColor(list[1]),
      size: parseInt(list[2])
    };
  }
  
  static parsePen(attrib)
  {
    var list = this.parseList(attrib);
    if(list.length == 3)
    {
      return {
        width: parseInt(list[0]),
        pattern: parseInt(list[1]),
        color: this.parseColor(list[2])
      };
    }
    else if(list.length == 4)
    {
      return {
        filename: list[0],
        color: this.parseColor(list[1]),
        size: parseInt(list[2]),
        customstyle: parseInt(list[3])
      };
    }
    else if(list.length == 6)
    {
      return {
        shape: parseInt(list[0]),
        color: this.parseColor(list[1]),
        size: parseInt(list[2]),
        fontname: list[3],
        fontstyle: parseInt(list[4]),
        rotation: parseFloat(list[5])
      };
    }
    else
      return {};
  }
  
  static parseBrush(attrib)
  {
    var list = this.parseList(attrib);
    var obj = {
      pattern: parseInt(list[0]),
      forecolor: this.parseColor(list[1])
    };
    if(list.length == 3)
      obj.backcolor = this.parseColor(list[2]);
    else
      obj.backcolor = 'rgba(255, 255, 255, 0.0)';
    return obj;
  }
  
  static parseFont(attrib)
  {
    var list = this.parseList(attrib);
    var obj = {
      fontname: this.trimQuotes(list[0]),
      style: list[1],
      size: list[2],
      forecolor: this.parseColor(list[3])
    };
    if(list.length == 5)
      obj.backcolor = this.parseColor(list[4]);
    return obj;
  }
  
  static parseLabel(attrib)
  {
    var list = this.trimArray(attrib.split(' '));
    var obj = {
      line: list[1],
      x: parseFloat(list[2]),
      y: parseFloat(list[3])
    };
    return obj;
  }
  
  static parseData(lines)
  {
     this.defaultPen = {
      width: 1,
      pattern: 2,
      color: '#000000'
    };
    this.defaultBrush = {
      pattern: 1,
      forecolor: '#000000',
      backcolor: '#FFFFFF'
    };
    this.defaultFont = {
      fontname: 'Arial',
      style: 0,
      size: 0,
      forecolor: '#000000'
    };
    var data = [];
    for(var i = 0; i < lines.length; i++)
    {
      lines[i] = lines[i].trim();
      if(lines[i].length == 0)
        continue;
      
      var line = this.parseLine(lines[i]);
      var type = line[0];
      var attrib = line[1];
      logger.log('Type:', type);
      
      var obj = {};
      obj.type = type;
      switch(type) {
        case 'none':
          break;
        case 'point':
          var coords = this.trimArray(attrib.split(' '));
          obj.x = parseFloat(coords[0]);
          obj.y = parseFloat(coords[1]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'symbol')
            {
              obj.symbol = this.parseSymbol(next_line[1]);
              i++;
            }
          }
          break;
        case 'line':
          var coords = this.trimArray(attrib.split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          break;
        case 'pline':
          var numsections = 1;
          var multiple = false;
          var numpts = 0;
          attrib = this.parseLine(attrib);
          if(attrib[0] == 'multiple')
          {
            multiple = true;
            numsections = parseInt(attrib[1]);
          }
          else
            numpts = parseInt(attrib[0]);
          if(isNaN(numpts))
            numpts = 0;
          
          obj.sections = Array(numsections);
          for(var j = 0; j < numsections; j++)
          {
            if(multiple)
            {
              i++;
              numpts = parseInt(lines[i]);
            }
            obj.sections[j] = this.parsePointList(lines.slice(i + 1, i + numpts + 1));
            i += numpts;
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          
          obj.smooth = false;
          if(i + 1 < lines.length && lines[i + 1] == 'smooth')
          {
            obj.smooth = true;
            i++;
          }
          break;
        case 'region':
          var numpolygons = parseInt(attrib);
          if(isNaN(numpolygons))
            numpolygons = 0;
          
          obj.polygons = Array(numpolygons);
          for(var j = 0; j < numpolygons; j++)
          {
            i++;
            numpts = parseInt(lines[i]);
            obj.polygons[j] = this.parsePointList(lines.slice(i + 1, i + numpts + 1));
            i += numpts;
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'brush')
            {
              obj.brush = this.parseBrush(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          
          if(typeof obj.brush === 'undefined')
            obj.brush = this.defaultBrush;
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'center')
            {
              var coords = this.trimArray(next_line[1].split(' '));
              obj.center = {
                x: parseFloat(coords[0]),
                y: parseFloat(coords[1])
              };
              i++;
            }
          }
          break;
        case 'arc':
          var coords = this.trimArray(attrib.split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          i++;
          var angles = this.trimArray(lines[i].split(' '));
          obj.a = parseFloat(angles[0]);
          obj.b = parseFloat(angles[1]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          break;
        case 'text':
          obj.textstring = this.trimQuotes(attrib);
          if(obj.textstring.length == 0)
          {
            i++;
            obj.textstring = this.trimQuotes(lines[i]);
          }
          
          i++;
          var coords = this.trimArray(lines[i].split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'font')
            {
              obj.font = this.parseFont(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'spacing')
            {
              obj.spacing = next_line[1];
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'justify')
            {
              obj.justify = next_line[1];
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'angle')
            {
              obj.angle = parseFloat(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'label')
            {
              obj.label = this.parseLabel(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.font === 'undefined')
            obj.font = this.defaultFont;
          break;
        case 'rect':
          var coords = this.trimArray(attrib.split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'brush')
            {
              obj.brush = this.parseBrush(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          
          if(typeof obj.brush === 'undefined')
            obj.brush = this.defaultBrush;
          break;
        case 'roundrect':
          var coords = this.trimArray(attrib.split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          i++
          var rounding = parseFloat(lines[i]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'brush')
            {
              obj.brush = this.parseBrush(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          
          if(typeof obj.brush === 'undefined')
            obj.brush = this.defaultBrush;
          break;
        case 'ellipse':
          var coords = this.trimArray(attrib.split(' '));
          obj.x1 = parseFloat(coords[0]);
          obj.y1 = parseFloat(coords[1]);
          obj.x2 = parseFloat(coords[2]);
          obj.y2 = parseFloat(coords[3]);
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'pen')
            {
              obj.pen = this.parsePen(next_line[1]);
              i++;
            }
          }
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'brush')
            {
              obj.brush = this.parseBrush(next_line[1]);
              i++;
            }
          }
          
          if(typeof obj.pen === 'undefined')
            obj.pen = this.defaultPen;
          
          if(typeof obj.brush === 'undefined')
            obj.brush = this.defaultBrush;
          break;
        case 'multipoint':
          var num_points = parseInt(attrib);
          if(isNaN(num_points))
            num_points = 0;
          
          obj.points = this.parsePointList(lines.slice(i + 1, i + num_points + 1));
          i += num_points;
          
          if(i + 1 < lines.length)
          {
            var next_line = this.parseLine(lines[i + 1]);
            if(next_line[0] == 'symbol')
            {
              obj.symbol = this.parseSymbol(next_line[1]);
              i++;
            }
          }
          break;
        case 'collection':          
          var num_parts = parseInt(attrib);
          
          i++;
          var start = i;
          for(var j = 0; j < num_parts; j++)
          {
            var line = this.parseLine(lines[i]);
            if(line[0] == 'pline')
            {
              var numsections = 1;
              var multiple = false;
              var numpts = 0;
              var attrib = this.parseLine(line[1]);
              if(attrib[0] == 'multiple')
              {
                multiple = true;
                numsections = parseInt(attrib[1]);
              }
              else
                numpts = parseInt(attrib[0]);
              
              for(var k = 0; k < numsections; k++)
              {
                if(multiple)
                {
                  i++;
                  numpts = parseInt(lines[i]);
                }
                i += numpts;
              }
            }
            else if(line[0] == 'region')
            {
              var numpolygons = parseInt(line[1]);

              for(var k = 0; k < numpolygons; k++)
              {
                i++;
                numpts = parseInt(lines[i]);
                i += numpts;
              }
            }
            else if(line[0] == 'multipoint')
            {
              i += parseInt(line[1]);
            }
            else if(line[0] == 'pen' || line[0] == 'brush' || 
                    line[0] == 'symbol' || line[0] == 'center')
              j--; //ignore them
            i++;
          }
          obj.data = this.parseData(lines.slice(start, i + 1));
          break;
      }
      obj.highlight = false;
      data.push(obj);
    }
    return data;
  }
  
  static parseToJSON(raw_data) {
    var obj = {
      header: {},
      data: {}
    };
    var lines = this.trimArray(raw_data.split('\n'));
    var i = 0;
    
    logger.log('Parsing header...');
    for(; i < lines.length; i++) {
      var line = this.parseLine(lines[i]);
      var param = line[0];
      var attrib = line[1];
      logger.log('Parameter:', param);
        
      switch(param) {
        case 'version':
          obj.header.version = attrib;
          break;
        case 'charset':
          //TODO: not ignore this prarmeter
          obj.header.charset = this.trimQuotes(attrib);
          break;
        case 'delimiter':
          obj.header.delimiter = this.trimQuotes(attrib);
          break;
        case 'unique':
          obj.header.unique = attrib;
          break;
        case 'index':
          obj.header.index = attrib;
          break;
        case 'coordsys':
          var coordsys = attrib;
          var header;
          while((header = this.parseLine(lines[i + 1])[0]) != 'transform' &&
                  header != 'columns' && header != data)
          {
            line += ' ' + lines[i + 1];
            i++;
          }
          obj.header.coordsys = this.parseCoordSys(coordsys);
          break;
        case 'transform':
          if(!obj.header.hasOwnProperty(coordsys))
            obj.header.coordsys = {};
          obj.header.coordsys.transform = attrib;
          break;
        case 'columns':
          var col_size = parseInt(attrib);
          if(isNaN(col_size))
            col_size = 0;
          obj.header.columns = this.parseColumns(lines.slice(i + 1, i + 1 + col_size));
          i += col_size;
          break;
        case 'data':
          logger.log('Parsing data...');
          obj.data = this.parseData(lines.slice(i + 1, lines.length));
          i = lines.length; //finish parsing
          break;
      }
    }
    
    logger.log("MIF parsed:", obj);//JSON.stringify(obj));
    return obj;
  }
}