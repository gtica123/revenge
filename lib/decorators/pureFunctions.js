'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = pureFunctionsInner;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _tcomb = require('tcomb');

var _tcomb2 = _interopRequireDefault(_tcomb);

var _isReactComponent = require('../isReactComponent');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _pure = require('./pure');

var _pure2 = _interopRequireDefault(_pure);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lodashPartial = require('lodash.partial');

var _lodashPartial2 = _interopRequireDefault(_lodashPartial);

var _lodashFind = require('lodash.find');

var _lodashFind2 = _interopRequireDefault(_lodashFind);

var log = _debug2['default']('revenge:@pureFunctions');

// a list in the form `[t.Func \[, ...t.Any\]]`
var PureFunction = _tcomb2['default'].subtype(_tcomb2['default'].list(_tcomb2['default'].Any), function (_ref) {
  var fn = _ref[0];
  return _tcomb2['default'].Func.is(fn);
}, 'PureFunction');

// used to tag PureFunction props
var PFWrapper = _tcomb2['default'].struct({
  pf: PureFunction
}, 'PFWrapper');

// returns a PureFunction tagged prop
var pureFunctionProp = function pureFunctionProp() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return PFWrapper({
    pf: [].concat(args)
  });
};

exports.pureFunctionProp = pureFunctionProp;
// TODO(gio): consider specifying and typing `pfProps`
// export default function pureFunctions(/* pfProps */) {
// return function pureFunctionsInner(Component) {
function pureFunctionsInner(Component) {

  if (process.env.NODE_ENV !== 'production') {
    _tcomb2['default'].assert(_isReactComponent2['default'](Component), '@pureFunctions decorator can only be applied to React.Component(s)');
    _tcomb2['default'].assert(!!Component.prototype.shouldComponentUpdate, 'shouldComponentUpdate method not found on ' + Component.name + ' prototype. Did you forget @pure?');
  }

  var PureFunctionsWrapper = (function (_React$Component) {
    _inherits(PureFunctionsWrapper, _React$Component);

    function PureFunctionsWrapper() {
      var _this = this;

      _classCallCheck(this, _PureFunctionsWrapper);

      _React$Component.apply(this, arguments);

      this.fromCacheOrAdd = function (_ref2, propName) {
        var fn = _ref2[0];

        var args = _ref2.slice(1);

        // pf cache is per component instance
        if (!_this._pureFunctionsCache) {
          // TODO(gio):
          // should be something smarter than an array,
          // at least when dealing with primitive arguments..
          _this._pureFunctionsCache = [];
        }

        var found = _lodashFind2['default'](_this._pureFunctionsCache, function (_ref3) {
          var fname = _ref3.name;
          var fargs = _ref3.args;
          var ffn = _ref3.fn;

          // same fn :
          return (fn === ffn
          // or same name or .toString() :
           || fn.name && fname === fn.name || fname === fn.toString()) &&
          // and same args length :
          args.length === fargs.length
          // and same args values :
           && args.filter(function (a, i) {
            return a === fargs[i];
          }).length === args.length;
        });

        if (found) {
          // return old, bound ref
          log('reusing fn ref for ' + propName + ' =', found.fn, 'in', Component.name);
          return found.bound;
        }

        // add new bound ref to cache
        _this._pureFunctionsCache.push({
          bound: _lodashPartial2['default'].apply(undefined, [fn].concat(args)),
          args: args,
          fn: fn,
          name: fn.name || fn.toString()
        });

        // return freshly bound ref
        return _this._pureFunctionsCache[_this._pureFunctionsCache.length - 1].bound;
      };
    }

    PureFunctionsWrapper.prototype.getProps = function getProps() {
      var _this2 = this;

      var allKeys = Object.keys(this.props);
      var pfKeys = allKeys.filter(function (k) {
        return PFWrapper.is(_this2.props[k]);
      });
      var otherKeys = allKeys.filter(function (k) {
        return !PFWrapper.is(_this2.props[k]);
      });
      return _extends({}, otherKeys.reduce(function (ac, k) {
        var _extends2;

        return _extends({}, ac, (_extends2 = {}, _extends2[k] = _this2.props[k], _extends2));
      }, {}), pfKeys.reduce(function (ac, k) {
        var _extends3;

        return _extends({}, ac, (_extends3 = {}, _extends3[k] = _this2.fromCacheOrAdd(_this2.props[k].pf, k), _extends3));
      }, {}));
    };

    PureFunctionsWrapper.prototype.render = function render() {
      return _react2['default'].createElement(Component, this.getProps());
    };

    var _PureFunctionsWrapper = PureFunctionsWrapper;
    PureFunctionsWrapper = _pure2['default'](PureFunctionsWrapper) || PureFunctionsWrapper;
    return PureFunctionsWrapper;
  })(_react2['default'].Component);

  return PureFunctionsWrapper;
}

// };
// }