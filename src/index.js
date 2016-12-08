var React = require('react');
var http = require('http');
var express = require('express');
var session = require('express-session');
var giphy = require('giphy-api')();
var bodyParser = require('body-parser')
import { renderToStaticMarkup } from 'react-dom/server'

var app = express();
app.use(session({ secret: 'moefhzieyfgI764765dalkjfal)àihazafzAZAEFEZF' }));

app.use(bodyParser.urlencoded({ extended: false } ));

app.post('/sms', function(req, res) {
  var query = req.body.Body;
  giphy.search(query).then(function(giphyRes) {
    res.writeHead(200, {'Content-Type': 'text/xml'});
    const msg = `Check data : ${giphyRes.data[0].images.fixed_height.url}`
    res.end(getResponse(SMS, { message: msg }));
  }).catch(e => {
    console.log('error', e);
    res.writeHead(500, {'Content-Type': 'text'});
    res.end("error");
  })
});

app.post('/voice', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(getResponse(Voice1));
});

app.post('/voicegame1', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(getResponse(connectSession(req)(makeGame(VoiceGame1)), {
    text: req.body.Digits
  }));
});

app.post('/smsgame1', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(getResponse(connectSession(req)(makeGame(MessageGame1)), {
    text: req.body.Body
  }));
});


const Response = props => <response { ...props }/>
const Say      = props => <say { ...props } />
const Play     = props => <play { ...props } />
const Message  = props => <message { ...props } />
const Gather   = props => <gather { ...props } />

const GAME_STEPS = {
  step1: {
    question: "Réponse à la question 1",
    answer: "123",
    next: "step2"
  },
  step2: {
    question: "Réponse à la question 2",
    answer: "456",
    next: "step3"
  },
  step3: {
    question: "Réponse à la question 3",
    answer: "789"
  }
}

const GAME_WIN_MESSAGE = "clap, clap !! 😊"

// some game logic
// based on props.text
// this text can be from a text message or a digits callback
// backup to given session object too
const makeGame = (Component) => {
  class GameHOC extends React.Component {
    componentWillMount() {
      let step = GAME_STEPS[this.props.step]
      let finished = false
      if (this.props.text === step.answer) {
        let nextStep = (GAME_STEPS.length > this.props.step + 1) && GAME_STEPS[this.props.step + 1];
        if (step.next) {
          step = GAME_STEPS[step.next]
          // backup in session
          this.props.saveSession({ step: step.next })
        } else {
          finished = true
          // backup in session
          this.props.saveSession({})
        }
      }
      this.setState({
        finished,
        step
      })
    }
    render() {
      return (
        <Response>
          <Component { ...this.state } />
        </Response>
      )
    }
  }
  GameHOC.defaultProps = {
    step: 'step1'
  }
  return GameHOC
}


const VoiceGame1 = props => {
  if (props.finished) {
    return (
      <Say>{ GAME_WIN_MESSAGE }</Say>
    )
  }
  return (
    <Gather numDigits="3">
      <Say language="fr">{ props.step.question }</Say>
    </Gather>
  )
}

const MessageGame1 = props => {
  if (props.finished) {
    return (
      <Message>{ GAME_WIN_MESSAGE }</Message>
    )
  }
  return (
    <Message>{ props.step.question }</Message>
  )
}



/* ------------------------------------------------------ */


import { Resolver, resolve } from 'react-resolver';

app.post('/smsgame2', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  getTwilioXML(GiphyGame, {
    text: req.body.Body
  }, req, getGiphyData(req.session.twilio)).then(xml => res.end(xml))
});



const GIPHY_WORDS = ["happy", "crazy", "hot", "fun", "silly"]
const getRandomWord = () => GIPHY_WORDS[Math.floor(Math.random() * GIPHY_WORDS.length)];

const GiphyGame = ({ text, session, save }) => {
  const incrementTries = () => {
    const giphyData = Object.assign({}, session, { tries: (session.tries + 1) })
    save(giphyData)
  }
  if (session.tries === -1) {
    incrementTries()
    return (
      <Response>
        <Message>Welcome to the game !</Message>
        <Message>Guess that image keyword : { session.url }</Message>
      </Response>
    )
  } else if (session.tries >= 5) {
    save()
    return (
      <Response>
        <Message>PERDU ! 5 tentatives</Message>
      </Response>
    )
  } else if (text === session.word) {
    save()
    return (
      <Response>
        <Message>{ session.tries } essais - BRAVO ! づ｡◕‿‿◕｡)づ</Message>
      </Response>
    )
  } else {
    incrementTries();
    return (
      <Response>
        <Message>Try again ({ session.tries + 1 } / 5) ! ¯\_(ツ)_/¯ </Message>
      </Response>
    )
  }
}

// fetch giphy data if needed
const getGiphyData = (current) => {
  return new Promise((resolve, reject) => {
    if (current) {
      return resolve(current)
    } else {
      let word = getRandomWord()
      return resolve(giphy.search(word).then(res => ({
        word,
        url: res.data[0].images.fixed_height.url,
        tries: -1
      })))
    }
  })
}

// hack: upper case tag names from React output
const xmlize = html => '<?xml version="1.0" encoding="UTF-8"?>' + html.replace(/(<\/?[a-z])/g, function(v) { return v.toUpperCase(); });

// convert rendered HTML to XML
const getRenderedXML = (Component, props) => xmlize(renderToStaticMarkup(<Component { ...props }/>))

// resolve async stuff if any, then render the final component
// will add props.session from the eventual promise
// and a save method
const getTwilioXML = (Component, props, req, promise) => {
  const save = data => {
    req.session.twilio = data
  }
  return promise.then(promiseProps => {
    save(promiseProps)
    const newProps = Object.assign({}, props, {
      session: promiseProps,
      save
    })
    return getRenderedXML(Component, newProps)
  })
}

const getResponse = (Component, props={}) => xmlize(renderToStaticMarkup(<Component { ...props }/>))

import request from 'supertest'

const makePost = ({ url, formData, cookie }) => {
  return request(app)
            .post(url)
            .set('Cookie', cookie || '')
            .type('form')
            .send(formData)

}

// create a sequence by preserving first cookie
const makeSequence = ({ url, sequence }) => {
  let cookie = '';
  sequence.forEach((seq, i) => {
    setTimeout(() => {
      makePost({
        url,
        formData: {
          Body: seq.text
        },
        cookie
      }).expect(res => {
        if (!cookie) {
          cookie = res.headers['set-cookie'].pop().split(';')[0];
        }
        if (!res.text.match(seq.expected)) {
          console.error(`❌ invalid response : ${res.text}\n❌ expected: ${seq.expected}`);
        } else {
          console.log(`✅ ${seq.name}`)
        }
      }).end((err, res) => {})
    }, 1000 * i)
  })
}

/*
makeSequence({
  url: '/smsgame2',
  sequence: [{
    name: 'intro',
    expected: /<Response><Message>Welcome to the game \!<\/Message><Message>Guess that image keyword : [^\s]+.gif<\/Message><\/Response>/,
    text: 'hello'
  },{
    name: 'first try',
    expected: /<Response><Message>Try again \(1 \/ 5\) \! ¯\\_\(ツ\)_\/¯ <\/Message><\/Response>/,
    text: 'what'
  },{
    name: 'second try',
    expected: /<Response><Message>Try again \(2 \/ 5\) \! ¯\\_\(ツ\)_\/¯ <\/Message><\/Response>/,
    text: 'else'
  },{
    name: '3rd try',
    expected: /<Response><Message>2 essais - BRAVO \! づ｡◕‿‿◕｡\)づ<\/Message><\/Response>/,
    text: 'fun'
  }]
})
*/

http.createServer(app).listen(process.env.PORT || 1337, function () {
  console.log("Express server listening on http://127.0.0.1:1337");
});