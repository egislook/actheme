const React = require('react')
const RN = require('react-native')
const styleProps = require('./styleProps')
const styleValues = require('./styleValues')
const defaultTheme = require('./theme')
import { moderateScale } from 'react-native-size-matters'

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
    const { type, comp, dys, animated, refered, extra, ...compProps } = getProps(comps[key], 'comp')
    // Sets Node
    const Node = type 
      ? animated ? RN['Animated'][type] : RN[type] 
      : comp

    if(!Object.keys(compProps).length && !dys){
      obj[key] = type ? Node : comp
      return obj
    }

    // Stores Element to object with styling
    obj[key] = !refered 
      ? props => {
          const [style, exProps] = getModifiedProps(props)
          return <Node {...props} {...exProps} style={style} />
        }
      : React.forwardRef((props, ref) => {
          const [style, exProps] = getModifiedProps(props)
          return <Node ref={ref} {...props} {...exProps} style={style} />
        })

    return obj
    
    // Returns modified styles and props
    function getModifiedProps(props){
      let style = styles[key]
      const exProps = extra || {}
      // Sets dynamic styling and properties
      if(dys){
        const activeProps = Object.keys({ ...exProps, ...props })
          .filter(prop => (Boolean(props[prop]) || Boolean(exProps[prop])) )
        style = RN.StyleSheet.flatten([style, RN.StyleSheet.flatten(activeProps.slice().map(prop => dynamics[key][prop]))])
        extras[key] && activeProps.reduce((obj, prop) => Object.assign(obj, extras[key][prop]), exProps)
      } 
      // Sets fustyle and style
      if(props.fustyle || props.style || exProps.style)
        style = [style, props.fustyle && fustyle(props.fustyle), exProps.style, props.style]

      return [style, exProps]
    }

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
            let [stl, props] = value
            if(!props){
              props = stl
              stl = null
            }
            console.log({ stl, props })
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
      const compType = item.includes('ff') || item.includes('fs') ? 'Text' : 'View'
      return { style: item, type: compType }
    case 'object':
      if(!Array.isArray(item)) return item.$$typeof ? { comp: item } : { dys: item, type: 'View' }
      
      let isDys
      let extra
      let [ comp, style, dys ] = item
      isDys = typeof style === 'object' && !Array.isArray(style)

      if(Array.isArray(style)){
        extra = style[1]
        style = style[0]
      }

      switch(typeof comp){
        case 'string':
          const animated = comp.includes('Animated')
          const refered = comp.includes('Ref')
          const type = comp.replace('Animated', '').replace('Ref', '')
          return { type, animated, refered, style: !isDys && style, dys: isDys && style || dys, extra }
        case 'function':
          return { comp, style: !isDys && style, dys: isDys && style || dys, extra }
      } 
    default:
      console.log('Actheme', 'incorrect item', item)
      return { type: 'View' }
  }
}

export function Comp(){ 
  const isComponent = typeof arguments[0] === 'object' && !Array.isArray(arguments[0])
  const args = Array.isArray(arguments[0]) ? arguments[0] : arguments

  console.log(args)

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

    props.split(',').map(prop => {
      prop = styleProps[prop] || prop
      value = styleValues[value] || value

      let [newValue, scale] = (!/\,.*\,/.test(value) && value.split(',')) || []
      scale = (scale && parseFloat(scale)) || theme.scale
      value = newValue || value

      if (/^s\d/.test(value)) {
        value = value.replace(/s/, '')
        obj[prop] = parseFloat(value)
      } else if (isNaN(value))
        obj[prop] = themeValue(prop, value)
      else
        obj[prop] = moderateScale(parseFloat(value), scale)
      return prop;
    });

    return obj;
  }, style);

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