const React = require('react')
const RN = require('react-native')
const styleProps = require('./styleProps')
const styleValues = require('./styleValues')
const defaultTheme = require('./theme')

module.exports = {
  create, Comp, fustyle, set
}

let theme = defaultTheme

export function set(customTheme){
  console.log('Actheme', 'set')
  customTheme = customTheme || { color: {} } 
  const color = { ...defaultTheme.color, ...customTheme.color }
  theme = { ...defaultTheme, ...customTheme, color }
}

export function create(comps, compType){
  // Creates StyleSheet
  const { styles, dynamics, extras } = getStyles(comps)
  // Creates Elements
  return Object.keys(comps).reduce((obj, key) => {
    const { type, comp, dys, animated, ...compProps } = getProps(comps[key], 'comp')
    // Sets Node
    const Node = type 
      ? animated ? RN['Animated'][type] : RN[type] 
      : comp
    // Stores Element to object with styling
    obj[key] = compProps.style || dys
      ? props => {
          let style = styles[key]
          const extraProps = {}
          // Sets dynamic styling and properties
          if(dys){
            const activeProps = Object.keys(props).filter(prop => !!props[prop])
            style = [style, RN.StyleSheet.flatten(activeProps.slice().map(prop => dynamics[key][prop]))]
            extras[key] && activeProps.reduce((obj, prop) => Object.assign(obj, extras[key][prop]), extraProps)
          } 
          // Sets fustyle and style
          if(props.fustyle || props.style)
            style = [style, props.fustyle && fustyle(props.fustyle), props.style]
          // Sets extra props and returns node
          if(Object.keys(extraProps).length)
            return <Node {...props} style={style} {...extraProps} />

          return <Node {...props} style={style} />
        } 
      : comp
    return obj
  }, {})
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
            const [stl, props] = value
            extras[key] = Object.assign((extras[key] || {}), {[prop]: props})
            return Object.assign(dy, { [prop]: fustyle(stl) })
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
      const compType = item.includes('ff') || item.includes('fs') ? 'Text' : 'View'
      return item.includes(':') ? { style: item, type: compType } : { type: item }
    case 'object':
      if(!Array.isArray(item)) return { dys: item, type: 'View' }
      
      let isDys
      const [ comp, style, dys ] = item
      isDys = typeof style === 'object'
      switch(typeof comp){
        case 'string':
          const animated = comp.includes('Animated')
          return { type: comp.replace('Animated', ''), animated, style: !isDys && style, dys: isDys && style || dys }
        case 'function':
          return { comp, style: !isDys && style, dys: isDys && style || dys }
      } 
    default:
      console.log('Actheme', 'incorrect item', item)
      return { type: 'View' }
  }
}

export function Comp(){ 
  const isComponent = typeof arguments[0] === 'object' && !Array.isArray(arguments[0])
  const args = Array.isArray(arguments[0]) ? arguments[0] : arguments

  const props = isComponent ? args[0] : {
    comp: args[1] && args[0] || 'View',
    fustyle: args[1] || args[0],
    style: args[2]
  }

  let Node = RN[props.comp]
  if(props.animated) Node = RN['Animated'][props.comp]

  const style = props.fustyle ? fustyle(props.fustyle, props.style || {}) : props.style
  
  return isComponent
    ? <Node style={style} {...props} />
    : props => <Node style={style} {...props} />
}

export function fustyle(obj, style = {}){

  let classes

  switch(typeof obj){
    case 'string':
      classes = obj.split(' '); break;
    
    case 'object':
      classes = Object.entries(obj).reduce((arr, [ key, show ]) => (
        show && key.length ? arr.concat(key.split(' ')) : arr
      ), []); break;

    default:
      // console.log('Actheme', 'incorrect fustyle type', typeof obj)
      return {}
  }

  const styles = classes.reduce((obj, item) => {
    let [props, value] = item.split(':')

    props.split(',').map( prop => {
      prop = styleProps[prop] || prop
      value = styleValues[value] || value
      obj[prop] = isNaN(value) ? themeValue(prop, value) : parseFloat(value)
      return prop
    })

    return obj
  }, style)

  return styles
}

// finds theme value
function themeValue(prop, value){
  const lowerProp = prop.toLowerCase()
  const themeKey = lowerProp.includes('padding') || lowerProp.includes('margin') 
    ? 'space' : lowerProp.includes('color') ? 'color' : prop
  const themeValues = theme[prop] || theme[themeKey]
  return themeValues && themeValues[value] || value
}