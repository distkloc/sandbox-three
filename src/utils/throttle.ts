export default class Throttle {
    constructor(private func: () => void, private interval: number) {
    }
  
    private timeoutId: number;
  
    public execute(): void {
      if(this.timeoutId > 0) {
        window.clearTimeout(this.timeoutId);
      }
  
      this.timeoutId = window.setTimeout(this.func, this.interval);
    }
  }
