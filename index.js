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
  console.log('Themed', 'set')
  customTheme = customTheme || { color: {} } 
  const color = { ...defaultTheme.color, ...customTheme.color }
  theme = { ...defaultTheme, ...customTheme, color }
}

export function create(comps, compType){
  
  // Creates StyleSheet
  const styles = RN.StyleSheet.create(Object.keys(comps).reduce((obj, key) => {
    const { style } = getProps(comps[key])
    return style ? Object.assign(obj, { [key]: style }) : obj
  }, {}))

  // Creates Elements
  const elems = Object.keys(comps).reduce((obj, key) => {
    const { type, isComponent, comp } = getProps(comps[key], compType)
    const Node = comp || RN[type]
    obj[key] = !isComponent
      ? props => <Node 
        {...props} 
        style={props.style || props.fustyle 
          ? [styles[key], props.fustyle && fustyle(props.fustyle), props.style] 
          : styles[key]
        }/>
      : comps[key]
    return obj 
  }, {})
  return elems
}

// Extracts props from passed themed item arguments
function getProps(item, compType){
  const isComponent = typeof item === 'function'
  const isArray = Array.isArray(item)
  let style = isArray ? item[1] || item[0] : !isComponent && item
  style = style && fustyle(style)
  const defaultType = style && Object.keys(style).join(' ').includes('font') && 'Text' || 'View'
  const styled = isArray && item[1] && item[0] || compType || defaultType
  // if(propsprops.animated) Node = RN['Animated']['View']
  return { isComponent, style,
    type: typeof styled === 'string' && styled,
    comp: typeof styled !== 'string' && styled
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

  const classes = typeof obj === 'string'
    ? obj.split(' ')
    : Object.entries(obj).reduce((arr, [ key, show ]) => (
        show && key.length ? arr.concat(key.split(' ')) : arr
      ), []);

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