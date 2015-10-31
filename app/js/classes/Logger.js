export default class Logger
{
  constructor(enabled)
  {
    this.enabled = enabled;
  }
  log()
  {
    if(this.enabled)
    {
      console.log.apply(console, arguments);
    }
  }
}