'use strict'

/* Example output:

JS: Map(2) { 1 => 2, 3 => [ 4, 5 ] }
CBOR: d9011784010203820405
Diagnostic: 279([1, 2, 3, [4, 5]])

Commented:
  d9                --  next 2 bytes
    0117            -- Tag #279
      84            -- Array, 4 items
        01          -- [0], 1
        02          -- [1], 2
        03          -- [2], 3
        82          -- [3], Array, 2 items
          04        -- [0], 4
          05        -- [1], 5
0xd9011784010203820405

JS, decoded: Map(2) { 1 => 2, 3 => [ 4, 5 ] }
*/

const cbor = require('cbor')
const TAG = 279

function encodeMap(gen, obj) {
  const t = new cbor.Tagged(TAG, [...obj.entries()].flat(1))
  return gen.pushAny(t)
}

function decodeMap(v) {
  if (!Array.isArray(v)) {
    throw new TypeError(`Invalid tag ${TAG} Map, not array`)
  }
  const len = v.length
  if ((len % 2) !== 0) {
    throw new TypeError(`Invalid tag ${TAG} Map, ${len} keys`)
  }
  const m = new Map()
  for (let i = 0; i < len; i += 2) {
    m.set(v[i], v[i + 1])
  }
  return m
}

async function main() {
  const o = new Map([[1,2],[3,[4,5]]])
  console.log('JS: %O', o)

  const buf = cbor.encodeOne(o, {
    genTypes: {
      Map: encodeMap
    }
  })
  console.log(`CBOR: ${buf.toString('hex')}`)
  console.log(`Diagnostic: ${await cbor.diagnose(buf)}`)
  console.log(`Commented:\n${await cbor.comment(buf)}`)

  const p = await cbor.decodeFirst(buf, {
    tags: {
      [TAG]: decodeMap
    }
  })
  console.log('JS, decoded: %O', p)
}

main().catch(console.error)
