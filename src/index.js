var React = require('react');
import { renderToStaticMarkup } from 'react-dom/server'


// convert instance rendered HTML to XML
export const pureRender = instance => xmlize(renderToStaticMarkup(instance))

// hack #1 : upper case tag names from React output
const xmlize = html => ('<?xml version="1.0" encoding="UTF-8"?>' + html.replace(/(<\/?[a-z])/g, function(v) { return v.toUpperCase(); }))

// hack #2 : is attribue enable non-standards attributes
// https://github.com/facebook/react/issues/140#issuecomment-114290163
export const Response = props => <response is { ...props }/>
export const Say      = props => <say is { ...props } />
export const Play     = props => <play is { ...props } />
export const Message  = props => <message is { ...props } />
export const Gather   = props => <gather is { ...props } />

// resolve async stuff if any, then render the final component
// will add props.state from the eventual promise
// and a save method
export const render = (Component, props, req, promise) => {
  // save in express cache
  const save = data => req.session.state = data
  let newProps = Object.assign({}, props, { save })
  if (!promise) {
    return pureRender(<Component { ...newProps }/>)
  }
  return promise.then(promiseProps => {
    newProps = Object.assign({}, newProps, {
      state: promiseProps
    })
    return pureRender(<Component { ...newProps }/>)
  }).catch(e => console.log(e))
}
