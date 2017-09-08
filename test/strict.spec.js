/* eslint-env mocha */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const each = require('async/each')
const map = require('async/map')
const pull = require('pull-stream')

const WebSocketStar = require('../src')

describe('strict', () => {
  let id1
  let ma1
  let l1
  let w1

  let id2
  let ma2
  let l2
  let w2

  before((done) => {
    map([{
      id: 'QmS8BL7M8jrXYhHo2ofEVeiq5aDKTr29ksmpcqWxjZGvpX',
      privKey: 'CAASqAkwggSkAgEAAoIBAQCvOmZWflGVczEuoCLPhMAfiGVNyEiE0QvzHAcKpAgNoZwu5MQ+t8RPKhgWAaWnxuWNEIK2E5doJxeQo2N2HuZpRLgJYQfBa9KZnW50nGXbPcUOomyStGjgc321uAKFsBcPdGwvvRO8up2qISFW6fqkI0hR6uC7kBmLXN0Trq/D2cLVXatupR9OLijwRK1iDlYBcCvJs/zk3sEVg11V5BO5BNLdnsEziU2cTu2jGta4KZPIDxow9z8hhjt0Oc2rP25Orqlz5Olhe7EeQRhtBoid3Xhz5zgTB63sc7jPGEhw/+nFksM70Xv0aplWZPalYA/0Lj+ZeqM5Br2zR56hALQDAgMBAAECggEABVIapWm0hHs49Rd7tx1q0ApOOSxpt065tCoXtKUCcZeErI/ZvaXK2jSHArQOGagadEwaC/lQUaNOPeAYNw/9IxkpFW/S0na5sFxtbDELjrqzbxxTe6jqvlYDbS8nNHQCXz/DwTdWkBaCjxXuczsrlyxTF9mv9UIM5IRvWhel0qaPNFcKILEH0hNcogInBNAty9tmJFQ3PS4zbDWXfuOn2g2lHF+QGkOsOAc66gLFlaDxAbdG5l9FYexgNWf5X1tedCWeY8SBaH3UXZW8bgB0FMWGMBgAo9y/9OG55H9GTSkHR8M+9JEYuhlvClckbCda7x7dervYqEiDUOLKFUWg4QKBgQDj4uQzuygYJJoGZ+/TO8DWWop61Yv2+z5uZ63lgLlLl3Vruklblx7tr0PdmhO/484nGJHuFzPIY5YVE0MdDFiQIvAd9VAXSc+UI97riy9nyi29ke+hmtSJ7P1ibTJnkYwOYZKElWw28BodVKjf9fliyuNyN0NHcbRplA5T0nSbyQKBgQDE2HUIloX3lTrD7qFkMC7NmuiFgeAJ2X1BIXt0rvDMBx/ZHRJw9C3ZqTDDNErOvOBcInWhucYReYfuk15GtGsjL5gj4xCudWwyJp+qNuN3odLa1dml7JJcIjybDJYEUou6Wy9+OUypNGgCFQH47jUjMc74Zu8jrGnLEM1dUtRfawKBgQC6esec4XE82G7GATWKWGJDxlF9lNP1JsF+3Q67OGvoxKcMoaM39OEVRQ+2/kddBlCDQ6Le/1ObjoqY8mtAEQND56MwELcaZ4caxYO8oegH+bUWZJ6AUs/LkggDDDJr9/lxJz0bi57DEhV8nPOYWZNa2YXnx/shMpWcs9BJnXVYqQKBgQCxxRIciWO/LkP+Apo6UtFR2Z44RAxCmOnnUgeeXwcUGzMF7p1i6QInWgaxo54TirvMOUqmnZFk4q6CJRC1JebDxg3OCxhblav6tqrnG97dgYVdIFgI4tdi4YB+PiWVDb8ms4b2pWS4Qp3Tk4lOeEIA4NCbwMojG2gHfcsZht5ItQKBgCTAamelN5EBxCHXCsXZ0Y2id5WBGmtG9TUyB/HdpTaVdgqBe+mSzYfotkXhotFTysdr17mrGo8IgDZx3w4EJBeiIpzQltCGcdiQQOw61NhMNEF8wDj9+icFpaNICar7syG1JJqfLpclldjltlAynfDNLTTYQdMHry0Ra86odruz',
      pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCvOmZWflGVczEuoCLPhMAfiGVNyEiE0QvzHAcKpAgNoZwu5MQ+t8RPKhgWAaWnxuWNEIK2E5doJxeQo2N2HuZpRLgJYQfBa9KZnW50nGXbPcUOomyStGjgc321uAKFsBcPdGwvvRO8up2qISFW6fqkI0hR6uC7kBmLXN0Trq/D2cLVXatupR9OLijwRK1iDlYBcCvJs/zk3sEVg11V5BO5BNLdnsEziU2cTu2jGta4KZPIDxow9z8hhjt0Oc2rP25Orqlz5Olhe7EeQRhtBoid3Xhz5zgTB63sc7jPGEhw/+nFksM70Xv0aplWZPalYA/0Lj+ZeqM5Br2zR56hALQDAgMBAAE='
    },
    {
      id: 'QmeJGHUQ4hsMvPzAoXCdkT1Z9NBgjT7BenVPENUgpufENP',
      privKey: 'CAASqAkwggSkAgEAAoIBAQCpTpSE6G13invylM9p+weRFxvi3CsQHNi1uvrUxgfsjpZX4mtS23GOmH5iSyA3wwXwICHu2erwp3KMsPRT7z8nzdBJO7clAZZEZGlfhQe1qXXFST5RNCVwVCUAaxYvlJzWaxUGv0i7qc95SwhJiNWfYf9qX4+oIgQrYcVbEydT43kABdIxO/lY9iMSmN0fSV02zQ/7DgJd8Ni/2wA6mc9YLw1UffLzHYzvGqHp1la1KrrB4K57Pn8dvDWD4qa7wg/LxYY/SX8RudBlRh3uvJfsMcX5t4dLI5w7shSrXDYbhzsHaPWCjY0MMley4TJrlzRZv/4lr+GhZIp3HmxDYtGdAgMBAAECggEBAKDCMFuSpn5fTBmmGtuytBicLKpYC7uc6FiGVi06a8O+EBsarnVaUJTpTvfeBZVs5HKA0DePS3l+RVI5o4UfIoSU9DTVMq08uIXwIe3EzvE7GsxdI4LPVM032HpxM/uxzMn7m1dwwYsPTiUJjbDk8JIJ5xAF9M3cnsDicRZtNWZ8hlp7TuBb3nEX8r28mVLmkIVYJq6KZLOO3u+07OKIvKwdNr3YA4UkzpRG0LOQLdE8/mtbPC+NhiorEntW5iyNiF0yL0UgSN/p7GtaoOLr/9sDU1C5cb5g9MwbXs6ljQjO6/ZfUdZ+AZQrXsd8OG+9UvcIYsgfFhzhz3nVSqOj0wECgYEA4qQZywKtqZ3IcWLrE3jSFl2GUtk4jRpfLLdrTBGkobtYc1zqTdfbNoBAbCorJcone6iwc4Cp3S4qUEmnckJpVahKR3vTpD6tRixix71VzljWmhH57gsF6Tc9B/ztgxMTFzfzR0M1QHuBeAXHiOCUcIjj5pDYMcRCrLkuqkl2Q9ECgYEAvz0o298+uHeaFoC71AT0W7b/G355eWtPpE3+qu48x6I6XC4dotjoo6Nn571DOAVhJMSZiCCzgz9TPwhELvrnIVZE+P6aiuYPZt7MJlVrUVannV3Sr0CZPCd1JxnNx/zefUY01AWm9OWuJXxQPvGWfgawUA4UbpFrmjFvc4uDYA0CgYAv2Cqlw6P7mZZ18Ubk7m2TUR0JIlgg2X9cBkB9Z4AUsGMEv4mq8zWQtNRkwSYorRtWrI7LY074pUVDe7kAkup/ra44lvhfxOd5V+dmeR7DF9f94Gudh/Awgnu80vUk5YLzNNmDorl8KlZziuzLhXVwqEVMKCmrn93fbpxeUHHJ8QKBgGatPKnIlBFQzd91IOO2AUjY2OF3J1tknW8XHTvDC8kXtgPWEr1jfoyVaG1I9bU3Vi/6ioBHJnq6XkTCeHFM7xm8Cu4xLOKUoQJXbv7J8APM5dOdE0hbA6sDeGgU96J/hyl1r1mC62AjjTu9IgyZg3aIutNQq/GtjDtOfYtpBZFlAoGBALFW1cEOY5myLtuiclt+GzEIyqBznf9o1Y1LGVTXCYtyZ9Zb5XW0hasJ77qV6kjkZwoDaBVrFm8pulWVYbrIkSkPHc1I5xfinq36Z2OHIlEGJijk/sqBwkCvUEffpAjpi31qlTVsesPNt7sS6FUpbSHYVmzHsg+RD7kvPIDaFPEo',
      pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCpTpSE6G13invylM9p+weRFxvi3CsQHNi1uvrUxgfsjpZX4mtS23GOmH5iSyA3wwXwICHu2erwp3KMsPRT7z8nzdBJO7clAZZEZGlfhQe1qXXFST5RNCVwVCUAaxYvlJzWaxUGv0i7qc95SwhJiNWfYf9qX4+oIgQrYcVbEydT43kABdIxO/lY9iMSmN0fSV02zQ/7DgJd8Ni/2wA6mc9YLw1UffLzHYzvGqHp1la1KrrB4K57Pn8dvDWD4qa7wg/LxYY/SX8RudBlRh3uvJfsMcX5t4dLI5w7shSrXDYbhzsHaPWCjY0MMley4TJrlzRZv/4lr+GhZIp3HmxDYtGdAgMBAAE='
    }
    ], PeerId.createFromJSON, (err, keys) => {
      expect(err).to.not.exist()

      id1 = keys.shift()
      id2 = keys.shift()
      ma1 = multiaddr('/ip4/127.0.0.1/tcp/14444/ws/p2p-websocket-star/ipfs/QmS8BL7M8jrXYhHo2ofEVeiq5aDKTr29ksmpcqWxjZGvpX')
      ma2 = multiaddr('/ip4/127.0.0.1/tcp/14444/ws/p2p-websocket-star/ipfs/QmeJGHUQ4hsMvPzAoXCdkT1Z9NBgjT7BenVPENUgpufENP')
      done()
    })
  })

  it('listen on the server', (done) => {
    w1 = new WebSocketStar({ id: id1 })
    w2 = new WebSocketStar({ id: id2 })

    l1 = w1.createListener(conn => pull(conn, conn))
    l2 = w2.createListener(conn => pull(conn, conn))

    each([
      [l1, ma1],
      [l2, ma2]
    ], (i, n) => i[0].listen(i[1], n), done)
  })

  it('dial peer 1 to peer 2', (done) => {
    w1.dial(ma2, (err, conn) => {
      expect(err).to.not.exist()
      const buf = Buffer.from('hello')

      pull(
        pull.values([buf]),
        conn,
        pull.collect((err, res) => {
          expect(err).to.not.exist()
          expect(res).to.eql([buf])
          done()
        })
      )
    })
  })
})
