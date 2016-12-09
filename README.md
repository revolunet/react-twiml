# 🕹📞📟 react-twiml [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Render [Twilio Markup Language](https://www.twilio.com/docs/api/twiml) instructions from [React](https://facebook.github.io/react/).

Useful for SMS and Voice automation via [Twilio webhooks](https://www.twilio.com/docs/api/chat/webhooks).

👉  You can play with the [Giphy game example](./examples/GiphyGame.js) by sending an SMS to `+33644640807`

## Ideas

With [Twilio](http://twilio.com), you can automate voice calls and SMS answers via webhooks and [TwiML](https://www.twilio.com/docs/api/twiml).

Also, Twilio can leverage [HTTP sessions](https://support.twilio.com/hc/en-us/articles/223136287-How-do-Twilio-cookies-work-) to save the "application" state.

Experiment : use React to modelize the "UI" (Voice and SMS interactions) and use HTTP sessions to keep the state and rehydrate components when needed (webhooks are stateless).

This allows to create simple to more complex scenarios using your favorite paradigm.

## Usage

```jsx
import { render, Response, Play, Say } from 'react-twiml'

const SimpleVoice = ({ code }) => (
  <Response>
    <Play loop="3">https://api.twilio.com/cowbell.mp3</Play>
    <Say voice="woman" language="en">Your top secret code is : { props.code }</Say>
  </Response>
)

app.post('/webhook', (req, res) => render(SimpleVoice, {
  code: 42
})
```

See also [./examples](./examples)

The [Giphy game example](./examples/GiphyGame.js) shows how to handle a multi-step scenario

### Async

When rendering on the server, we cant rely on `setState` because we need a single, full render of the final state.

Thus, we need to delay the component render (see the [Giphy game example](./examples/GiphyGame)).
