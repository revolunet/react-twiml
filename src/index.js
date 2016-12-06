var React = require('react');
var http = require('http');
var express = require('express');
var session = require('express-session');
var giphy = require('giphy-api')();
var bodyParser = require('body-parser')
import ReactDOMServer from 'react-dom/server'

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
  res.end(getResponse(makeGame(VoiceGame1), {
    text: req.body.Body,
    session: req.session
  }));
});

app.post('/smsgame1', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(getResponse(makeGame(MessageGame1), {
    text: req.body.Body,
    session: req.session
  }));
});

http.createServer(app).listen(process.env.PORT || 1337, function () {
  console.log("Express server listening on port 1337");
});


const Say = ({ voice='woman', language='fr', children}) => <say voice={ voice } language={ language }>{ children }</say>
const Play = ({ loop=0, children }) => <play loop={ loop }>{ children }</play>
const Message = ({ children }) => <message>{ children }</message>

const Voice1 = () => (
  <response>
      <Say voice="woman" language="fr">Salut les amis</Say>
      <Play>https://api.twilio.com/cowbell.mp3</Play>
  </response>
)

const SMS = ({ message }) => (
  <response>
      <Message>{ message }</Message>
  </response>
)

const Gather = ({ action, numDigits, children }) => <gather action={ action } numDigits={ numDigits }>{ children }</gather>

const GAME_STEPS = {
  step1: {
    question: "What is the answer one ?",
    answer: 123,
    next: "step2"
  },
  step2: {
    question: "What is the answer two ?",
    answer: 456,
    next: "step3"
  },
  step3: {
    question: "What is the answer three ?",
    answer: 789
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
      let step = GAME_STEPS[this.props.session.step]
      let finished = false
      if (this.props.text === step.answer) {
        let nextStep = (GAME_STEPS.length > this.props.step + 1) && GAME_STEPS[this.props.step + 1];
        if (step.next) {
          step = GAME_STEPS[step.next]
          // backup in session
          this.props.session.step = step.next
        } else {
          finished = true
          // backup in session
          this.props.session.step = undefined
        }
      }
      this.setState({
        finished,
        step
      })
    }
    render() {
      return <Component { ...this.state } />
    }
  }
  GameHOC.defaultProps = {
    session: {
      step: 'step1'
    }
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
      <Say>{ props.step.question }</Say>
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

//const Game1 = makeGame(MessageGame1)



// hack: upper case tag names from React output
const xmlize = html => html.replace(/(<\/?[a-z])/g, function(v) { return v.toUpperCase(); });

const getResponse = (Component, props={}) => {
  const html = ReactDOMServer.renderToStaticMarkup(<Component { ...props }/>)
  const xml = xmlize(html)
  return `<?xml version="1.0" encoding="UTF-8"?>${xml}`
}
/*
console.log(getResponse(Game1, {
  text: 'hello',
  step: 'step1',
  onStep: () => {}
}))

console.log(getResponse(Game1, {
  text: 'xxx',
  step: 'step1',
  onStep: () => {}
}))

console.log(getResponse(Game1, {
  text: 'rrr',
  step: 'step1',
  onStep: () => {}
}))

console.log(getResponse(Game1, {
  text: 123,
  step: 'step1',
  onStep: () => {
    console.log('onStep')
  },
  onFinish: () => {
    console.log('onFinish')
  }
}))

console.log(getResponse(Game1, {
  text: 456,
  step: 'step2',
  onStep: () => {
    console.log('onStep')
  },
  onFinish: () => {
    console.log('onFinish')
  }
}))

console.log(getResponse(Game1, {
  text: 456,
  step: 'step3',
  onStep: () => {
    console.log('onStep')
  },
  onFinish: () => {
    console.log('onFinish')
  }
}))


console.log(getResponse(Game1, {
  text: 789,
  step: 'step3',
  onStep: () => {
    console.log('onStep')
  },
  onFinish: () => {
    console.log('onFinish')
  }
}))
*/

//console.log(React.renderToString(<App/>))