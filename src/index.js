"use strict"

const debug = require('debug')
const log = debug('libp2p:websocket-star')
const multiaddr = require('multiaddr')
const mafmt = require('mafmt')
const io = require('socket.io-client')
const sp = require("./socket-pull")
const uuid = require("uuid")
const EE = require('events').EventEmitter
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Connection = require('interface-connection').Connection
const once = require('once')
const setImmediate = require('async/setImmediate')
const utils = require('./utils')
const cleanUrlSIO = utils.cleanUrlSIO

const noop = once(() => {})

const sioOptions = {
  transports: ['websocket'],
  'force new connection': true
}

class WebsocketStar {
  constructor(options) {
    options = options || {}

    this.maSelf = undefined

    this.sioOptions = {
      transports: ['websocket'],
      'force new connection': true
    }

    this.discovery = new EE()
    this.discovery.start = (callback) => {
      setImmediate(callback)
    }
    this.discovery.stop = (callback) => {
      setImmediate(callback)
    }

    this.listenersRefs = {}
    this._peerDiscovered = this._peerDiscovered.bind(this)
  }

  dial(ma, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    const _ma = multiaddr(ma)

    const conn = new Connection(null)

    const dialId = uuid()

    callback = callback ? once(callback) : noop

    let io = this.firstListen

    if (!io) return callback(new Error("No signaling connection available for dialing"))

    const sink = io.createSink(dialId + ".dialer")

    log("dialing %s (id %s)", ma, dialId)

    //"multiaddr", "multiaddr", "string", "function" - dialFrom, dialTo, dialId, cb
    io.emit("ss-dial", this.maSelf.toString(), ma.toString(), dialId, err => {
      if (err) return callback(new Error(err))
      log("dialing %s (id %s) successfully completed", ma, dialId)
      const source = io.createSource(dialId + ".listener")
      conn.setInnerConn({
        sink,
        source
      }, {
        getObservedAddrs: cb => cb(null, [_ma])
      })
      callback(null, conn)
    })

    return conn
  }

  createListener(options, handler) {
    if (typeof options === 'function') {
      handler = options
      options = {}
    }

    const listener = new EE()

    listener.listen = (ma, callback) => {
      callback = callback ? once(callback) : noop

      let key = ""

      while (key.length < 4096)
        key += Math.random().toString().replace(".", "").replace(/0/g, "")

      const hash = utils.b58encode(utils.sha5(utils.sha5(key))) //b58encode: ugly hack because we use the ipfs proto for the challenge
      const crypto_ma = multiaddr(ma.toString()).encapsulate("ipfs/" + hash)
      this.maSelf = crypto_ma
      this.maSelfReal = ma

      const sioUrl = cleanUrlSIO(ma)

      log('Dialing to Signalling Server on: ' + sioUrl)

      listener.io = io.connect(sioUrl, sioOptions)
      this.firstListen = listener.io

      const proto = new utils.Protocol(log)
      proto.addRequest("ws-peer", ["multiaddr", "multiaddr"], this._peerDiscovered.bind(this))
      proto.addRequest("ss-incomming", ["string", "multiaddr", "multiaddr", "function"], incommingDial)

      listener.io.once('connect_error', callback)
      listener.io.once('error', (err) => {
        listener.emit('error', err)
        listener.emit('close')
      })

      sp(listener.io)

      listener.io.once('connect', () => {
        listener.io.on('connect', () =>
          listener.io.emit('ss-join', ma.toString(), err => err ? listener.emit("error", new Error(err)) : listener.emit("reconnected")))
        listener.io.emit('ss-join', crypto_ma.toString(), key, err => {
          if (err) {
            listener.emit("error", new Error(err))
            callback(new Error(err))
          } else {
            listener.emit('listening')
            callback()
          }
        })
      })

      function incommingDial(dialId, dialFrom, dialFromClean, cb) {
        log("recieved dial from", dialFrom, dialFromClean, dialId)
        const ma = multiaddr(dialFromClean)
        const source = listener.io.createSource(dialId + ".dialer")
        const sink = listener.io.createSink(dialId + ".listener")

        cb(null)
        const conn = new Connection({
          sink,
          source
        }, {
          getObservedAddrs: cb => cb(null, [ma])
        })
        listener.emit("connection", conn)
        handler(conn)
      }
    }

    listener.close = (callback) => {
      callback = callback ? once(callback) : noop

      listener.io.disconnect() //disconnecting unregisters all addresses
      listener.emit('close')
      callback()

    }

    listener.getAddrs = (callback) => {
      setImmediate(() => callback(null, [this.maSelf]))
    }

    this.listenersRefs[multiaddr.toString()] = listener
    return listener
  }

  filter(multiaddrs) {
    if (!Array.isArray(multiaddrs)) {
      multiaddrs = [multiaddrs]
    }
    return multiaddrs.filter((ma) => mafmt.WebRTCStar.matches(ma))
  }

  _peerDiscovered(cmaStr, maStr) {
    log('Peer Discovered:', maStr)
    const split = maStr.split('/ipfs/')
    const peerIdStr = split[split.length - 1]
    const peerId = PeerId.createFromB58String(peerIdStr)
    const peerInfo = new PeerInfo(peerId)
    peerInfo.multiaddrs.add(multiaddr(cmaStr))
    this.discovery.emit('peer', peerInfo)
  }
}
module.exports = WebsocketStar
module.exports.Server = require("./sig-server")
