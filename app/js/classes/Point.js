export default class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  static add(a, b) {
    return new Point(a.x + b.x, a.y + b.y);
  }
  
  static sub(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
  }
  
  static mul(a, b) {
    return new Point(a.x * b, a.y * b);
  }
  
  static div(a, b) {
    return new Point(a.x / b, a.y / b);
  }
  
  static dist(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }
  
  static dotp(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  
  static crossp(a, b) {
    return a.x * b.y - a.y * b.x;
  }
};