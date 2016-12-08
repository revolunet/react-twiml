var React = require('react');


app.post('/smsgame1', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(getXML(connectSession(req)(makeGame(MessageGame1)), {
    text: req.body.Body
  }));
});

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
          this.props.save({ step: step.next })
        } else {
          finished = true
          // backup in session
          this.props.save({})
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


const VoiceGame1 = makeGame(props => {
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
})

const MessageGame1 = makeGame(props => {
  if (props.finished) {
    return (
      <Message>{ GAME_WIN_MESSAGE }</Message>
    )
  }
  return (
    <Message>{ props.step.question }</Message>
  )
})


