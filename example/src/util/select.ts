import update from 'immupdate'
import { Component, h, Message, ConnectParams, Vnode } from 'dompteuse'

import { TweenLite } from './gsap'
import { merge } from './obj'


export default function<T>(props?: Props<T>) {
  return Component<Props<T>, State>({ key: 'select', props, defaultProps, initState, connect, render })
}


interface Props<T> {
  items: Array<T>
  selectedItem: T
  onChange: Message<T>
  itemRenderer?: (item: T) => string
  loading: boolean
}

const defaultProps: any = {
  items: [],
  itemRenderer: (item: any) => item.toString()
}

interface State {
  opened: boolean
}

function initState() {
  return { opened: false }
}


const Open = Message('Open')
const Close = Message('Close')
const ItemSelected = Message<any>('ItemSelected')


function connect({ on, props, msg }: ConnectParams<Props<any>, State>) {
  on(Open, state => merge(state, { opened: true }))
  on(Close, state => merge(state, { opened: false }))
  on(ItemSelected, (state, item) => msg.sendToParent(props().onChange(item)))
}


function render(props: Props<any>, state: State) {
  const { items, selectedItem, loading, itemRenderer } = props
  const { opened } = state

  const text = (!loading && items.indexOf(selectedItem) > -1) ? selectedItem : ''
  const dropdownEl = getDropdownEl(props, opened)

  return (
    h('div.select', [
      h('input', {
        events: { onClick: Open, onBlur: Close },
        props: { value: text },
        attrs: { readonly: true, placeholder: 'click me' }
      }),
      dropdownEl
    ])
  )
}

function getDropdownEl(props: Props<any>, opened: boolean) {
  const { items, itemRenderer, loading } = props

  const itemEls = opened && !loading
    ? items.map(itemRenderer).map(renderItem)
    : undefined

  const loaderEl = opened && loading
    ? [ h('li', 'Loading...') ]
    : undefined

  const dropdownEls = itemEls || loaderEl

  return dropdownEls
    ? h('ul.dropdown', { hook: animationHook }, dropdownEls)
    : ''
}

function renderItem(item: any) {
  return h('li', { events: { onMouseDown: ItemSelected.with(item) } }, item)
}

const animationHook = {
  insert: (vnode: Vnode) => {
    TweenLite.from(vnode.elm, 0.14, { opacity: 0, y: -10 })
  },

  remove: (vnode: Vnode, cb: Function) => {
    TweenLite.to(vnode.elm, 0.14, { opacity: 0, y: -10 }).eventCallback('onComplete', cb)
  }
}
