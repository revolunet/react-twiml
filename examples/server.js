import React from 'react'
import http from 'http'
import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'

import {
  render,
  Response,
  Play,
  Say,
  Message
} from '../src'

import { GiphyGame, getGiphyData } from './GiphyGame'

export const app = express();

// session is used to store state
app.use(session({ secret: 'moefhzieyfgI764765dalkjfal)àihazafzAZAEFEZF' }));

app.use(bodyParser.urlencoded({ extended: false } ));


/* Simple voice webhook */

const SimpleVoice = ({ code }) => (
  <Response>
    <Play loop="3">https://api.twilio.com/cowbell.mp3</Play>
    <Say voice="woman" language="en">Your top secret code is : { code}</Say>
  </Response>
)

const renderVoice = (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(render(SimpleVoice, {
    code: 42
  }, req))
}

app.get('/voice', renderVoice);
app.post('/voice', renderVoice);

/* Simple SMS webhook */

const SimpleSMS = ({ code }) => (
  <Response>
    <Message>Your code is : { code }</Message>
  </Response>
)

const renderSMS = (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(render(SimpleSMS, {
    code: 42
  }, req))
}

app.get('/sms', renderSMS);
app.post('/sms', renderSMS);

/* A basic game using sessions */

const renderGiphyGame = (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  render(GiphyGame, {
    text: req.body.Body
  }, req, getGiphyData(req.session.state)).then(xml => res.end(xml))
}

app.get('/game1', renderGiphyGame);
app.post('/game1', renderGiphyGame);

export default app
module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 1337
  http.createServer(app).listen(PORT, '0.0.0.0', function () {
    console.log(`Express server listening on ${PORT}`);
  });
}

