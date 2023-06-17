'use strict'

import autocannon from 'autocannon'
import { writeFile as _writeFile, readFileSync, mkdir as _mkdir, access as _access, read } from 'fs'
import compare from 'autocannon-compare'
import { join } from 'path'
import { promisify } from 'util'
const writeFile = promisify(_writeFile)
const mkdir = promisify(_mkdir)
const access = promisify(_access)

const resultsDirectory = join(process.cwd(), 'results')

const run = (opts = {}) => new Promise((resolve, reject) => {
  opts.url = 'http://127.0.0.1:3000'
  autocannon(opts, (err, result) => {
    if (err) {
      reject(err)
    } else {
      resolve(result)
    }
  })
})

const writeResult = async (handler, result) => {
  try {
    await access(resultsDirectory)
  } catch (e) {
    await mkdir(resultsDirectory)
  }

  result.server = handler

  const dest = join(resultsDirectory, `${handler}.json`)
  return writeFile(dest, JSON.stringify(result))
}

export async function fire (opts, handler, save) {
  const result = await run(opts)
  return save ? writeResult(handler, result) : null
}

const readJSON = (fp) => {
  const content = readFileSync(fp)
  return JSON.parse(content)
}
    
const _compare = (a, b) => {
  const resA = readJSON(`${resultsDirectory}/${a}.json`)
  const resB = readJSON(`${resultsDirectory}/${b}.json`)
  const comp = compare(resA, resB)
  if (comp.equal) {
    return true
  } else if (comp.aWins) {
    return {
      diff: comp.requests.difference,
      fastest: a,
      slowest: b,
      fastestAverage: resA.requests.average,
      slowestAverage: resB.requests.average
    }
  }
  return {
    diff: compare(resB, resA).requests.difference,
    fastest: b,
    slowest: a,
    fastestAverage: resB.requests.average,
    slowestAverage: resA.requests.average
  }
}
export { _compare as compare }
