# react-twilio

Render [Twilio Markup Language](https://www.twilio.com/docs/api/twiml) instructions from [React](https://facebook.github.io/react/)

Can be used with [Twilio webhooks](https://www.twilio.com/docs/api/ip-messaging/webhooks) for SMS and Voice automation.

## Ideas

With Twilio API, you can automate voice calls and SMS via webhooks.

We can use an express.js server to handle these requests and render

HTTP sessions are used to save the state

## Usage

```js

import { render } from 'react-twilio'

const SimpleVoice = ({ code }) => (
  <Response>
    <Play loop="3">https://api.twilio.com/cowbell.mp3</Play>
    <Say voice="woman" language="en">Your top secret code is : { props.code}</Say>
  </Response>
)

app.post('/webhook', render(SimpleVoice, {
  code: 42
}))

```

### Async

When rendering on the server, we cant rely on react state;


