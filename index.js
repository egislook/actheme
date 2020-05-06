"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.set = set;
exports.setAlphedColors = setAlphedColors;
exports.setScaledSizes = setScaledSizes;
exports.create = create;
exports.Comp = Comp;
exports.fustyle = fustyle;
exports.themeValue = themeValue;
exports.devicePrefix = devicePrefix;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require('react');

var styleProps = require('./styleProps');

var styleValues = require('./styleValues');

var defaultTheme = require('./theme');

module.exports = {
  create: create,
  Comp: Comp,
  fustyle: fustyle,
  set: set,
  themeValue: themeValue,
  devicePrefix: devicePrefix,
  value: themeValue,
  device: devicePrefix,
  style: fustyle
};

var RN = function () {
  try {
    return require('react-native');
  } catch (error) {
    return eval('require("react-native-web")');
  }
}();

var theme = defaultTheme;

function set(customTheme, reactNative) {
  // if(!!Object.keys(RN).length) return
  console.log('Actheme', 'set');
  customTheme = customTheme || {
    color: {}
  };

  var color = _objectSpread(_objectSpread({}, defaultTheme.color), customTheme.color);

  theme = _objectSpread(_objectSpread(_objectSpread({}, defaultTheme), customTheme), {}, {
    color: color
  });
  if (theme.alphas) theme.color = setAlphedColors(theme);
  if (theme.scale) theme.size = setScaledSizes(theme);
  theme.value = themeValue;
  theme.device = devicePrefix;
  return theme;
}

function setAlphedColors(theme) {
  return Object.keys(theme.color).reduce(function (obj, name) {
    var color = theme.color[name];
    obj[name] = color;
    if (color.includes('rgba') && color.includes('1)')) Object.keys(theme.alphas).forEach(function (key) {
      obj[name + key] = color.replace('1)', theme.alphas[key] + ')');
    });
    return obj;
  }, {});
}

function setScaledSizes(theme) {
  var _toConsumableArray$ma;

  return _toConsumableArray(Array(200)).map(function (n, i) {
    return i + 1;
  }).reduce(function (obj, n) {
    var _Object$assign;

    return Object.assign(obj, (_Object$assign = {}, _defineProperty(_Object$assign, 's' + n, n * theme.scale), _defineProperty(_Object$assign, 's' + (n + 0.25), (n + 0.25) * theme.scale), _defineProperty(_Object$assign, 's' + (n + 0.5), (n + 0.5) * theme.scale), _defineProperty(_Object$assign, 's' + (n + 0.75), (n + 0.75) * theme.scale), _Object$assign));
  }, (_toConsumableArray$ma = {}, _defineProperty(_toConsumableArray$ma, 's0.25', theme.scale * 0.25), _defineProperty(_toConsumableArray$ma, 's0.5', theme.scale * 0.5), _defineProperty(_toConsumableArray$ma, 's0.5', theme.scale * 0.75), _toConsumableArray$ma));
}

function create(comps, compType) {
  console.log('Actheme create'); // Creates StyleSheet

  var _getStyles = getStyles(comps),
      styles = _getStyles.styles,
      dynamics = _getStyles.dynamics,
      extras = _getStyles.extras; // Creates Elements


  return Object.keys(comps).reduce(function (obj, key) {
    var _getProps = getProps(comps[key], 'comp'),
        type = _getProps.type,
        comp = _getProps.comp,
        dys = _getProps.dys,
        animated = _getProps.animated,
        refered = _getProps.refered,
        extra = _getProps.extra,
        compProps = _objectWithoutProperties(_getProps, ["type", "comp", "dys", "animated", "refered", "extra"]); // Sets Node


    var Node = type ? animated ? RN['Animated'][type] : RN[type] : comp;

    if (!Object.keys(compProps).length && !dys) {
      obj[key] = type ? Node : comp;
      return obj;
    } // Stores Element to object with styling


    obj[key] = !refered ? function (props) {
      var _getModifiedProps = getModifiedProps(props),
          _getModifiedProps2 = _slicedToArray(_getModifiedProps, 2),
          style = _getModifiedProps2[0],
          exProps = _getModifiedProps2[1];

      return /*#__PURE__*/React.createElement(Node, _extends({}, props, exProps, {
        style: style
      }));
    } : React.forwardRef(function (props, ref) {
      var _getModifiedProps3 = getModifiedProps(props),
          _getModifiedProps4 = _slicedToArray(_getModifiedProps3, 2),
          style = _getModifiedProps4[0],
          exProps = _getModifiedProps4[1];

      return /*#__PURE__*/React.createElement(Node, _extends({
        ref: ref
      }, props, exProps, {
        style: style
      }));
    });
    return obj; // Returns modified styles and props

    function getModifiedProps(props) {
      var style = styles[key];
      var exProps = extra && _objectSpread({}, extra) || {}; // Sets dynamic styling and properties

      if (dys) {
        var activeProps = Object.keys(_objectSpread(_objectSpread({}, exProps), props)).filter(function (prop) {
          return Boolean(props[prop]) || Boolean(exProps[prop]);
        });
        style = RN.StyleSheet.flatten([style, RN.StyleSheet.flatten(activeProps.slice().map(function (prop) {
          return dynamics[key][prop];
        }))]);
        extras[key] && activeProps.reduce(function (obj, prop) {
          return Object.assign(obj, extras[key][prop]);
        }, exProps);
      } // Sets fustyle and style


      if (props.fustyle || props.style || exProps.style) style = [style, props.fustyle && fustyle(props.fustyle), exProps.style, props.style];
      return [style, exProps];
    }
  }, {});
} // Creates Stylesheets for static and dynamic styles


function getStyles(rules) {
  var dynamics = {};
  var extras = {};
  var styles = RN.StyleSheet.create(Object.keys(rules).reduce(function (obj, key) {
    var _getProps2 = getProps(rules[key]),
        style = _getProps2.style,
        dys = _getProps2.dys;

    if (dys) {
      dynamics[key] = RN.StyleSheet.create(Object.keys(dys).reduce(function (dy, prop) {
        var value = dys[prop];

        switch (_typeof(value)) {
          case 'string':
            return Object.assign(dy, _defineProperty({}, prop, fustyle(value)));

          case 'object':
            var _value = _slicedToArray(value, 2),
                stl = _value[0],
                props = _value[1];

            if (!props) {
              props = stl;
              stl = null;
            }

            extras[key] = Object.assign(extras[key] || {}, _defineProperty({}, prop, props));
            return stl ? Object.assign(dy, _defineProperty({}, prop, fustyle(stl))) : dy;
        }
      }, {}));
    }

    return style ? Object.assign(obj, _defineProperty({}, key, fustyle(style))) : obj;
  }, {}));
  return {
    styles: styles,
    dynamics: !!Object.keys(dynamics).length && dynamics,
    extras: !!Object.keys(extras).length && extras
  };
} // Extracts props from passed themed item arguments


function getProps(item) {
  switch (_typeof(item)) {
    case 'function':
      return {
        comp: item
      };

    case 'string':
      if (!item.includes(':')) return {
        type: item
      };
      var compType = item.includes('ff') || item.includes('fs') ? 'Text' : 'View';
      return {
        style: item,
        type: compType
      };

    case 'object':
      if (!Array.isArray(item)) return item.$$typeof ? {
        comp: item
      } : {
        dys: item,
        type: 'View'
      };
      var isDys;
      var extra;

      var _item = _slicedToArray(item, 3),
          comp = _item[0],
          style = _item[1],
          dys = _item[2];

      isDys = _typeof(style) === 'object' && !Array.isArray(style);

      if (Array.isArray(style)) {
        extra = style[1] || style[0];
        style = style[1] ? style[0] : null;
      }

      switch (_typeof(comp)) {
        case 'string':
          var animated = comp.includes('Animated');
          var refered = comp.includes('Ref');
          var type = comp.replace('Animated', '').replace('Ref', '');
          return {
            type: type,
            animated: animated,
            refered: refered,
            style: !isDys && style,
            dys: isDys && style || dys,
            extra: extra
          };

        case 'function':
          return {
            comp: comp,
            style: !isDys && style,
            dys: isDys && style || dys,
            extra: extra
          };
      }

    default:
      console.log('Actheme', 'incorrect item', item);
      return {
        type: 'View'
      };
  }
}

function Comp() {
  var isComponent = _typeof(arguments[0]) === 'object' && !Array.isArray(arguments[0]);
  var args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
  var props = isComponent ? args[0] : {
    comp: args[1] && args[0] || 'View',
    fustyle: args[1] || args[0],
    style: args[2]
  };
  var Node = RN[props.comp];
  if (props.animated) Node = RN['Animated'][props.comp];
  var style = props.fustyle ? fustyle(props.fustyle, props.style || {}) : props.style;
  return isComponent ? /*#__PURE__*/React.createElement(Node, _extends({
    style: style
  }, props)) : function (props) {
    return /*#__PURE__*/React.createElement(Node, _extends({
      style: style
    }, props));
  };
}

function fustyle(obj) {
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var classes;

  switch (_typeof(obj)) {
    case 'string':
      classes = obj.split(' ');
      break;

    case 'object':
      classes = Object.entries(obj).reduce(function (arr, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            show = _ref2[1];

        return show && key.length ? arr.concat(key.split(' ')) : arr;
      }, []);
      break;

    default:
      console.log('Actheme', 'incorrect fustyle type', _typeof(obj));
      return {};
  }

  var styles = classes.reduce(function (obj, item) {
    var _item$split = item.split(':'),
        _item$split2 = _slicedToArray(_item$split, 2),
        props = _item$split2[0],
        value = _item$split2[1];

    var prefix;

    if (!!props.includes('@')) {
      var prefixProps = props.split('@');
      prefix = prefixProps.shift();
      if (devicePrefix() !== prefix) return obj;
      props = prefixProps.shift();
    }

    props.split(',').map(function (prop) {
      prop = styleProps[prop] || prop;
      value = styleValues[value] || value;
      obj[prop] = isNaN(value) ? themeValue(value, prop) : parseFloat(value); // : theme.moderateScale ? moderateScale(parseFloat(value), theme.moderateScale)

      return prop;
    });
    return obj;
  }, style);
  return styles;
} // finds theme value


function themeValue(value, prop) {
  var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

  if (/^-?s\d*\.?\d{1,2}$/.test(value)) {
    var size = theme.size && (value.includes('-') ? theme.size[value.replace('-', '')] * -1 : theme.size[value]);
    return !size ? Number(value.replace('s', '')) * (scale || theme.scale) : size;
  }

  var lowerProp = prop.toLowerCase();
  var themeKey = lowerProp.includes('color') ? 'color' : prop;
  var themeValues = theme[prop] || theme[themeKey];
  return themeValues && themeValues[value] || value;
} // Device prefix


function devicePrefix(value) {
  var dimen = RN.Dimensions.get('window');
  return value ? value.charAt(0) === getPrefix() : getPrefix();

  function getPrefix() {
    if (RN.Platform.OS === 'ios' && !RN.Platform.isPad && !RN.Platform.isTVOS && (dimen.height === 812 || dimen.width === 812 || dimen.height === 896 || dimen.width === 896)) return 'x'; // if(DeviceInfo.hasNotch()) return 'n'

    if (RN.Platform.OS === 'web') return 'w';
    if (RN.Platform.OS === 'ios') return 'i';
    if (RN.Platform.OS === 'android') return 'a';
    return;
  }
}