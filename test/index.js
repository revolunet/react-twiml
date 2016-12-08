import request from 'supertest'
import http from 'http'

import app from '../examples/server'

/* run tests on a given express app instance */

const makePost = ({ app, url, formData, cookie }) => {
  return request(app)
            .post(url)
            .set('Cookie', cookie || '')
            .type('form')
            .send(formData)

}

// create a sequence by preserving first cookie
const makeSequence = ({ app, url, sequence }) => {
  let cookie = '';
  sequence.forEach((seq, i) => {
    setTimeout(() => {
      makePost({
        app,
        url,
        formData: {
          Body: seq.text
        },
        cookie
      }).expect(res => {
        if (!cookie) {
          cookie = res.headers['set-cookie'].pop().split(';')[0];
        }
        const txt = res.text.replace(/ is="true"/g, "")
        if (!txt.match(seq.expected)) {
          console.error(`❌  invalid response : ${txt}\n❌ expected: ${seq.expected}`);
        } else {
          console.log(`✅  ${seq.name}`)
        }
      }).end((err, res) => {
        if (err) console.log(err)
      })
    }, 1000 * i)
  })
}

const runTests = (app) => {
  makeSequence({
    url: '/game1',
    app,
    sequence: [{
      name: 'intro',
      expected: /<Response><Message>Welcome to the game ! Guess that image keyword : [^\s]+.gif<\/Message><\/Response>/,
      text: 'hello'
    },{
      name: 'first try',
      expected: /<Response><Message>Try again \(1 \/ 3\) \! ¯\\_\(ツ\)_\/¯ <\/Message><\/Response>/,
      text: 'what'
    },{
      name: 'second try',
      expected: /<Response><Message>Try again \(2 \/ 3\) \! ¯\\_\(ツ\)_\/¯ <\/Message><\/Response>/,
      text: 'else'
    },{
      name: '3rd try',
      expected: /<Response><Message>Try again \(3 \/ 3\) \! ¯\\_\(ツ\)_\/¯ <\/Message><\/Response>/,
      text: 'xxx'
    },{
      name: 'end (lost)',
      expected: /<Response><Message>LOST ! 3 tries<\/Message><\/Response>/,
      text: 'xxx'
    }]
  })
}

runTests(app)
