import async from 'async';

class Queue {

  constructor() {
    this.queue = [];
    this.listeners = [];
    this.pushListener = null;
  }

  clear() {
    this.queue = [];
    this.listeners = [];
  }

  push(msg) {
    if (this.pushListener) {
      this.pushListener(msg);
    }

    if (this.listeners.length > 0) {
      this.listeners.shift()(msg);
    } else {
      this.queue.push(msg);
    }
  }

  pop(timeoutMillis) {
    if (this.queue.length > 0) {
      return Promise.resolve(this.queue.shift());
    }
    return new Promise((resolve, reject) => {
      const timeoutRequest = async.timeout((timeoutCallback) => {
        this.listeners.push((msg) => {
          timeoutCallback(null, msg);
        });
      }, timeoutMillis);

      timeoutRequest((err, msg) => {
        if (err) {
          reject(err);
        } else {
          resolve(msg);
        }
      });
    });
  }

  registerPushListener(callback) {
    this.pushListener = callback;
  }
}

export default Queue;
