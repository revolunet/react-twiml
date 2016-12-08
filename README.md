# react-twiml [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Render [Twilio Markup Language](https://www.twilio.com/docs/api/twiml) instructions from [React](https://facebook.github.io/react/)

Useful for SMS and Voice automation via [Twilio webhooks](https://www.twilio.com/docs/api/ip-messaging/webhooks)

## Ideas

With Twilio API, you can automate voice calls and SMS via webhooks.

We can use an express.js server to handle these requests and render react components;

We can leverage [HTTP sessions](https://support.twilio.com/hc/en-us/articles/223136287-How-do-Twilio-cookies-work-) to save the "application" state

## Usage

```jsx
import { render, Response, Play, Say } from 'react-twiml'

const SimpleVoice = ({ code }) => (
  <Response>
    <Play loop="3">https://api.twilio.com/cowbell.mp3</Play>
    <Say voice="woman" language="en">Your top secret code is : { props.code }</Say>
  </Response>
)

app.post('/webhook', render(SimpleVoice, {
  code: 42
}))

```

See also [./examples](./examples)

### Async

When rendering on the server, we cant rely on `setState`;

Here, we use a promise to delay the component render. (see the [GiphyGame example](./examples/GiphyGame))


