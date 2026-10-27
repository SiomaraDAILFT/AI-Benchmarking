/**
 * Computes a run's summary off the server's main thread (summariseOffThread in protocol.mjs),
 * so that the interval bisection does not hold up the page's polls.
 */
import { parentPort, workerData } from 'node:worker_threads'
import { summarise } from './protocol.mjs'

const { config, raw, options } = workerData
parentPort.postMessage(summarise(config, raw, options))
