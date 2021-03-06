import { Observable } from '../observable'

/* Message sending between components, through the DOM */

export default function Messages(el) { this.el = el }

Messages.prototype.listen = function(messageType) {
  return this.storeMsg.listen(messageType)
}

Messages.prototype.send = function(msg) {
  this.storeMsg.send(msg)
}

Messages.prototype.sendToParent = function(msg) {
  _sendToElement(this.el.parentElement, msg)
}

Messages.prototype.listenAt = function(selectorOrEl) {
  const el = selectorOrEl instanceof Element
    ? selectorOrEl
    : document.querySelector(selectorOrEl)

  if (!el) return

  const debugName =
    el.tagName.toLowerCase() + 
    (el.id ? '#' + el.id : '') +
    (el.className ? '.' + el.className: '')

  return Observable(add => {
    el.__subs__ = el.__subs__ || []
    const subs = el.__subs__
    subs.push(add)

    return () => {
      subs.splice(subs.indexOf(add), 1)
      if (subs.length === 0) el.__subs__ = undefined
    }
  }).named(`listenAt(${debugName})`)
}

/** Sends a Message to a DOM Element that will be received by the nearest component */
export function _sendToElement(el, msg) {
  let handled = false

  while (el && !handled) {

    // Classic component's listen
    if (el.__comp__) {
      handled = true
      el.__comp__.messages.send(msg)
    }

    // listenAt
    if (el.__subs__) {
      handled = true
      el.__subs__.forEach(add => add(msg))
    }

    el = el.parentElement
  }
}