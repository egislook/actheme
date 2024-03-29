const React = require('react')
const RN = (() => { try { return require('react-native') } catch(error) { try { return eval('require("react-native-web")') } catch (err){ return eval('require("rnwc")') } } })()
const styleProps = require('../styleProps')
const styleValues = require('../styleValues')
const defaultTheme = require('../theme')
let theme = defaultTheme, Comps = {}, ready, created, screen, subscriptions = [], classes = {}

module.exports = {
  create, Comp, fustyle, set,
  themeValue,
  devicePrefix,
  value: themeValue,
  device: devicePrefix,
  style: fustyle,
  dims,
  state,
  media: useMedia,
  useMedia,
  mediaRules
}

export function set(customTheme, comps = {}){
  if(ready) return
  console.log('Actheme', 'set')
  customTheme = customTheme || { color: {} }
  Comps = comps
  const color = { ...defaultTheme.color, ...customTheme.color }
  theme = { ...defaultTheme, ...customTheme, color }
  if(theme.alphas) theme.color = setAlphedColors(theme)
  if(theme.scale) theme.size = setScaledSizes(theme)
  theme.value = themeValue
  theme.device = devicePrefix
  ready = true
  return theme
}

// Medias
function useMedia(){
  const [media, setMedia] = React.useState(screen)
  const mediaKeys = Object.keys(theme.medias)

  React.useEffect(() => {
    const componentId = Date.now() + Math.random()
    subscriptions.push({ componentId, setMedia })
    !screen && !!subscriptions.length && onLayout() && mediaListiner(true)
    return () => { subscriptions = subscriptions.filter(sub => sub.componentId !== componentId) }
  }, [])

  return mediaKeys.reduce((obj, key, index) => (theme.medias[key] <= theme.medias[screen] ? {...obj, [key]: true } : obj), {})
}

export function dims(key){
  const dimensions = RN.Dimensions.get('window')
  if(!key) return dimensions
  if(['height', 'width', 'scale'].includes(key)) return dimensions[key]
  if(['oriantation', 'portrait', 'landscape'].includes(key)){
    const oriantation = dimensions.width > dimensions.height ? 'landscape' : 'portrait'
    if(['portrait', 'landscape'].includes(key)) return key === oriantation
    return oriantation
  }
  const index = Object.values(theme.medias).findIndex((item, i) => dimensions.width < item) - 1
  return !~index ? 'basic' : index < -1 ? Object.keys(theme.medias).pop() : Object.keys(theme.medias)[index]
}

function onLayout(){
  const media = dims('media')
  if(media === screen) return
  screen = media
  subscriptions.length && subscriptions.forEach(({ setMedia }) => setMedia(media))
  console.log('Actheme media', media, dims('oriantation'))
  return media
}

export function mediaListiner(listen){
  return !listen ? RN.Dimensions.removeEventListener('change', onLayout) : (
    RN.Dimensions.removeEventListener('change', onLayout),
    RN.Dimensions.addEventListener('change', onLayout)
  )
}

export function setAlphedColors(theme){
  return Object.keys(theme.color).reduce((obj, name) => {
    const color = theme.color[name]
    obj[name] = color || ''
    if (color.includes('rgba') && color.includes('1)'))
      Object.keys(theme.alphas).forEach(key => {
        obj[name + key] = color.replace('1)', theme.alphas[key] + ')')
      })
    return obj
  }, {})
}

export function setScaledSizes(theme){
  return [...Array(200)].map((n, i) => i + 1)
    .reduce((obj, n) => Object.assign(obj, {
      ['s' + n]: n * theme.scale,
      ['s' + (n + 0.25)]: (n + 0.25) * theme.scale,
      ['s' + (n + 0.5)]: (n + 0.5) * theme.scale,
      ['s' + (n + 0.75)]: (n + 0.75) * theme.scale,
    }), {
      ['s0.25']: theme.scale * 0.25,
      ['s0.5']: theme.scale * 0.5,
      ['s0.5']: theme.scale * 0.75
    })
}

export function create(comps, compType){
  if(!created){
    created = true
    console.log('Actheme create', 'ready', ready)
  }
  // Creates StyleSheet
  const { styles, dynamics, extras } = getStyles(comps)
  // console.log({ styles, dynamics, extras })
  // Creates Elements
  return Object.keys(comps).reduce((obj, key) => {
    const { type, comp, dys, animated, refered, extra, custom, ...compProps } = getProps(comps[key], 'comp')
    // Sets Node
    // console.log({ type, comp, dys, animated, refered, extra, compProps })
    const Node = type
      ? animated ? RN['Animated'][type] : Comp(type)
      : comp

    if(!Object.keys(compProps).length && !dys){
      obj[key] = type ? Node : comp
      return obj
    }

    const mediaKeys = dys && Object.keys(dys).filter(key => (Object.keys(theme.medias).reduce((arr, media) => arr.concat([media, media + 'x']), [])).includes(key)) || []

    // Stores Element to the object with styling
    obj[key] = refered
      ? React.forwardRef((props, ref) => <Node ref={ref} {...props} {...getStyledProps(props, styles, extra, key, dys, dynamics, extras, custom)} />)
      : !mediaKeys.length
        ? props => <Node {...props} {...getStyledProps(props, styles, extra, key, dys, dynamics, extras, custom)} />
        : props => {
          const mediaList = useMedia()
          const rest = getStyledProps(props, styles, { ...extra, ...mediaList }, key, dys, dynamics, extras, custom)
          const mediaData = getMediaData(mediaKeys, dys)
          return <Node {...props} {...rest} dataSet={{ ...mediaData, ...(props.dataSet || {}) }} />
        }

    return obj
  }, {})
}

// Returns media mediaData and sets rule to classes global object
function getMediaData(mediaKeys, dys){
  return devicePrefix('web') && mediaKeys.reduce((obj, key) => {
    if(Array.isArray(dys[key])) return
    const rules = fustyle(dys[key], 'px')
    const name = dys[key].replace(/\W/g, '')
    if(!classes[key]) classes[key] = {}
    if(!classes[key][name]) classes[key][name] = Object.keys(rules).map(prop => `${getCssProp(prop)}: ${rules[prop]};`).join(' ')
    return { ...obj, ['media-' + key]: name}
  }, {})
}

function getCssProp(prop){
  return prop.split('').reduce((str, letter) => str + ((/[A-Z]/).test(letter) ? ('-' + letter.toLowerCase()) : letter), '')
}

function mediaRules(){
  return Object.keys(classes).map(media => {
    const rule = media.charAt(2) === 'x' ? `max-width: ${theme.medias[media.slice(0, -1)] - 1}px` : `min-width: ${theme.medias[media]}px`
    return [
      `@media only screen and (${rule}) {\n`,
        Object.keys(classes[media]).reduce((str, name) => str + `\n[data-media-${media}*="${name.replace('.', '\\.')}"] { ${classes[media][name]} }`, ''),
      `\n}`
    ].join('')
  }).join('\n')
}

// Returns modified styles and props
function getStyledProps(props, styles, extra, key, dys, dynamics, extras, custom){
  let style = styles[key]
  const exProps = { ...(extra || {}) }
  // Sets dynamic styling and properties
  if(dys){
    const activeProps = Object.keys({ ...exProps, ...props }).filter(prop => !['children'].includes(prop) && !prop.includes('style') && ((Boolean(props[prop]) || Boolean(exProps[prop]))) )
    style = [style, activeProps.slice().map(prop => dynamics[key][prop])] //RN.StyleSheet.flatten()
    extras[key] && activeProps.reduce((obj, prop) => Object.assign(obj, extras[key][prop]), exProps)
  }

  // Sets fustyle and style
  if(props.fustyle || props.actstyle || props.style || exProps.style){
    style = [style, (props.fustyle || props.actstyle) && fustyle(props.fustyle || props.actstyle), exProps.style, props.style] //RN.StyleSheet.flatten()
  }

  return { ...exProps, style: custom ? RN.StyleSheet.flatten(style) : style }
}

// Creates Stylesheets for static and dynamic styles
function getStyles(rules){
  const dynamics = {}
  const extras = {}

  const styles = RN.StyleSheet.create(Object.keys(rules).reduce((obj, key) => {
    const { style, dys } = getProps(rules[key])
    if(dys) {
      dynamics[key] = RN.StyleSheet.create(Object.keys(dys).reduce((dy, prop) => {
        const value = dys[prop]
        switch(typeof value){
          case 'string':
            return Object.assign(dy, { [prop]: fustyle(value) })
          case 'object':
            let [stl, props] = value
            if(!props){ props = stl; stl = null }
            extras[key] = Object.assign((extras[key] || {}), {[prop]: props})
            return stl ? Object.assign(dy, { [prop]: fustyle(stl) }) : dy
        }
      }, {}))
    }
    return style ? Object.assign(obj, { [key]: fustyle(style) }) : obj
  }, {}))

  return {
    styles,
    dynamics: !!Object.keys(dynamics).length && dynamics,
    extras: !!Object.keys(extras).length && extras
  }
}

// Extracts props from passed themed item arguments
function getProps(item){
  switch(typeof item){
    case 'function':
      return { comp: item }
    case 'string':
      if(!item.includes(':')) return { type: item }
      const compType = (item.includes('ff') || item.includes('fs') || item.includes('fb')) ? 'Text' : 'View'
      return { style: item, type: compType }
    case 'object':
      if(!Array.isArray(item)) return item.$$typeof ? { comp: item } : { dys: item, type: 'View' }

      let isDys
      let extra
      let [ comp, style, dys ] = item
      isDys = typeof style === 'object' && !Array.isArray(style)

      if(Array.isArray(style)){
        extra = style[1] || style[0]
        style = style[1] ? style[0] : null
      }

      switch(typeof comp){
        case 'string':
          const animated = comp.includes('Animated')
          const refered = comp.includes('Ref')
          const type = comp.replace('Animated', '').replace('Ref', '')
          return { type, animated, refered, style: !isDys && style, dys: isDys && style || dys, extra, custom: Comps && Comps[comp] }
        case 'function':
          return { comp, style: !isDys && style, dys: isDys && style || dys, extra, custom: true }
      }
    default:
      console.log('Actheme', 'incorrect item', item)
      return { type: 'View' }
  }
}

export function Comp(name, alt = 'View'){
  return Comps && Comps[name] || RN[name] || RN[alt]

  // const isComponent = typeof arguments[0] === 'object' && !Array.isArray(arguments[0])
  // const args = Array.isArray(arguments[0]) ? arguments[0] : arguments
  //
  // const props = isComponent ? args[0] : {
  //   comp: args[1] && args[0] || 'View',
  //   fustyle: args[1] || args[0],
  //   style: args[2]
  // }
  //
  // let Node = RN[props.comp]
  // if(props.animated) Node = RN['Animated'][props.comp]
  //
  // const style = props.fustyle ? fustyle(props.fustyle, props.style || {}) : props.style
  //
  // return isComponent
  //   ? <Node style={style} {...props} />
  //   : props => <Node style={style} {...props} />
}

export function fustyle(obj, units){
  if(obj === '' || !obj) return {}
  let classes

  switch(typeof obj){
    case 'string':
      classes = obj.split(' '); break;

    case 'object':
      classes = Object.entries(obj).reduce((arr, [ key, show ]) => (
        show && key.length ? arr.concat(key.split(' ')) : arr
      ), []); break;

    default:
      console.log('Actheme', 'incorrect fustyle type', typeof obj)
      return {}
  }

  const styles = classes.reduce((obj, item) => {
    let [props, value] = item.split(':')
    let prefix

    if(!!props.includes('@')){
      const prefixProps = props.split('@')
      prefix = prefixProps.shift()
      if(!devicePrefix(prefix)) return obj
      props = prefixProps.shift()
    }

    props && props.split(',').map(prop => {
      prop = styleProps[prop] || prop
      value = styleValues[value] || value
      if(typeof value === 'string' && value.includes('_')){ value = value.replace(/\_/g, ' ') }

      obj[prop] = isNaN(value) && prop !== 'fb' ? themeValue(value, prop) : parseFloat(value)
      if(units && (/^[0-9]+$/).test(obj[prop])) obj[prop] = obj[prop] + units
      return prop
    })

    return obj
  }, {})
  return styles
}

// finds theme value
export function themeValue(value, prop, scale = 4){
  if(/^-?s\d*\.?\d{1,2}$/.test(value)){
    const size = theme.size && (value && value.includes('-') ? theme.size[value.replace('-', '')] * -1 : theme.size[value])
    return !size ? Number(value.replace('s', '')) * (scale || theme.scale) : size
  }

  const lowerProp = prop.toLowerCase() || ''
  const themeKey = lowerProp.includes('color') ? 'color' : prop
  const themeValues = theme[prop] || theme[themeKey]
  return themeValues && themeValues[value] || value
}

// Device prefix
export function devicePrefix(value){
  const { height, width } = RN.Dimensions.get('window')
  const { OS, isPad, isTVOS } = RN.Platform

  const device = getDevicePrefix()
  const first = value && value.charAt(0)
  return first ? (first === device || (first === 'i' && device === 'x')) : device

  function getDevicePrefix(){
    if(OS === 'ios' && !isPad && !isTVOS && (height === 812 || width === 812 || (height === 896 || width === 896))) return 'x'
    // if(DeviceInfo.hasNotch()) return 'n'
    if(OS === 'web') return 'w'
    if(OS === 'ios') return 'i'
    if(OS === 'android') return 'a'
    return
  }
}

export function state (initial = {}) {
	const store = initial
	return [store, useState]

	function useState(value, name) {
		const state = React.useState(value)
		if(!name) return state
		const title = name.charAt(0).toUpperCase() + name.slice(1)
		store['get' + title] = () => state[0]
		store['set' + title] = state[1]
		return state
	}
}
