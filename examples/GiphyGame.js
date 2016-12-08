import React from 'react'
import giphy from 'giphy-api'

import { Response, Message } from '../src'

const GIPHY_WORDS = ["happy", "crazy", "hot", "fun", "silly"]

const getRandomWord = () => GIPHY_WORDS[Math.floor(Math.random() * GIPHY_WORDS.length)];

const MAX_TRIES = 3

// fetch giphy data if needed
export const getGiphyData = (state) => {
  return new Promise((resolve, reject) => {
    if (state) {
      return resolve(state)
    }
    let word = getRandomWord()
    return resolve(giphy().search(word).then(res => ({
      word,
      url: res.data[0].images.fixed_height.url,
      tries: -1
    })))
  })
}

export const GiphyGame = ({ text, state, save }) => {
  const incrementTries = () => {
    const stateData = Object.assign({}, state, { tries: (state.tries + 1) })
    save(stateData)
  }
  if (state.tries === -1) {
    incrementTries()
    return (
      <Response>
        <Message>Welcome to the game ! Guess that image keyword : { state.url }</Message>
      </Response>
    )
  } else if (state.tries >= MAX_TRIES) {
    save()
    return (
      <Response>
        <Message>LOST ! { MAX_TRIES } tries</Message>
      </Response>
    )
  } else if (text && text.toLowerCase() === state.word.toLowerCase()) {
    save()
    return (
      <Response>
        <Message>Win in { state.tries + 1 } - BRAVO ! づ｡◕‿‿◕｡)づ</Message>
      </Response>
    )
  } else {
    incrementTries();
    return (
      <Response>
        <Message>Try again ({ state.tries + 1 } / { MAX_TRIES }) ! ¯\_(ツ)_/¯ </Message>
      </Response>
    )
  }
}

export default GiphyGame
