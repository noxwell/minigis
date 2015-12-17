import Point from './Point.js'

export default class Line {
  constructor(p1, p2, segment) {
    if(p1.hasOwnProperty('x1'))
    {
      this.p1 = new Point(p1.x1, p1.y1);
      this.p2 = new Point(p1.x2, p1.y2);
      if(typeof p2 !== 'undefined')
        this.segment = p2;
      else
        this.segment = false;
    }
    else
    {
      this.p1 = p1;
      this.p2 = p2;
      if(typeof segment !== 'undefined')
        this.segment = segment;
      else
        this.segment = false;
    }
    this.A = this.p2.y - this.p1.y;
    this.B = this.p1.x - this.p2.x;
    this.C = Point.crossp(this.p1, this.p2);
  }
  
  get length() {
    return Point.sub(new Point(x1, y1), new Point(x2, y2)).length();
  }
  
  static dist(line, point)
  {
    if(line instanceof Point && point instanceof Line)
      [line, point] = [point, line];
    var eps = 1e-4;
    var orth = new Line(point, Point.add(point, new Point(line.A, line.B)), false);
    var segment = line.segment;
    line.segment = false;
    var inter = Line.intersect(line, orth);
    line.segment = segment;
    if(inter != false
        && (line.segment == false || Math.abs(Point.dist(line.p1, inter) + Point.dist(line.p2, inter) - Point.dist(line.p1, line.p2)) < eps)) {
          return Point.dist(point, inter);
        }
    else 
      return Math.min(Point.dist(line.p1, point), Point.dist(line.p2, point));
  }
  
  static intersect(l1, l2)
  {
    var eps = 1e-4;
    var cross_l1_p1 = Point.crossp(Point.sub(l2.p1, l1.p1), Point.sub(l1.p2, l1.p1));
    var cross_l1_p2 = Point.crossp(Point.sub(l2.p2, l1.p1), Point.sub(l1.p2, l1.p1));
    var cross_l2_p1 = Point.crossp(Point.sub(l1.p1, l2.p1), Point.sub(l2.p2, l2.p1));
    var cross_l2_p2 = Point.crossp(Point.sub(l1.p2, l2.p1), Point.sub(l2.p2, l2.p1));
    if((!l1.segment && !l2.segment)
        || Math.abs(cross_l1_p1) < eps || Math.abs(cross_l1_p2) < eps  
        || Math.abs(cross_l2_p1) < eps || Math.abs(cross_l2_p2) < eps
        || (((cross_l1_p1 < 0) != (cross_l1_p2 < 0)) && ((cross_l2_p1 < 0) != (cross_l2_p2 < 0)))) {
          var d = (l1.A * l2.B - l1.B * l2.A);
          if(Math.abs(d) < eps)
            return false;
          return new Point(
            (l1.C * l2.B - l1.B * l2.C) / d,
            (l1.A * l2.C - l1.C * l2.A) / d
          );
        }
    else
      return false;
  }
};