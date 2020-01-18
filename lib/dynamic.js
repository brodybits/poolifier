'use strict'
const FixedThreadPool = require('./fixed')

/**
 * A thread pool with a min/max number of threads , is possible to execute tasks in sync or async mode as you prefer. <br>
 * This thread pool will create new workers when the other ones are busy, until the max number of threads,
 * when the max number of threads is reached, an exception will be thrown.
 * This pool will select the worker thread in a round robin fashion. <br>
 * @author Alessandro Pio Ardizio
 * @since 0.0.1
 */
class DynamicThreadPool extends FixedThreadPool {
  /**
    *
    * @param {Number} min  Min number of threads that will be always active
    * @param {Number} max  Max number of threads that will be active
    * @param {Object} an object with possible options for example maxConcurrency
  */
  constructor (min, max, filename, opts) {
    super(min, filename, opts)
    this.max = max
  }

  _chooseWorker () {
    let worker
    for (const entry of this.tasks) {
      if (entry[1] === 0) {
        worker = entry[0]
        break
      }
    }

    if (worker) {
      // a worker is free, use it
      return worker
    } else {
      if (this.workers.length === this.max) {
        throw new Error('Max number of threads reached !!!')
      }
      // console.log('new thread is coming')
      // all workers are busy create a new worker
      const worker = this._newWorker()
      worker.port2.on('message', (message) => {
        if (message.kill) {
          worker.postMessage({ kill: 1 })
          worker.terminate()
        }
      })
      return worker
    }
  }
}

module.exports = DynamicThreadPool