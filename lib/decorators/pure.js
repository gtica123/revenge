'use strict';

exports.__esModule = true;
exports.shallowEqual = shallowEqual;
exports['default'] = pure;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tcomb = require('tcomb');

var _tcomb2 = _interopRequireDefault(_tcomb);

var _isReactComponent = require('../isReactComponent');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var log = _debug2['default']('revenge:@pure');

// export for tests

function shallowEqual(objA, objB, section, component) {
  if (objA === objB) {
    return true;
  }

  var displayName = component && component.constructor.name;
  var rootNodeID = component && (component._reactInternalInstance || {})._rootNodeID;

  if (!objA || typeof objA !== 'object') {
    // the opposite should never happen here, since we are using this as
    // `shallowEqual(prevProps, nextProps)` or `shallowEqual(prevState, nextState)`
    if (process.env.NODE_ENV !== 'production' && section && component) {
      log('component ' + displayName + ' with rootNodeID ' + rootNodeID + ' will re-render since object has no previous value');
    }
    return false;
  }

  var key = undefined;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) && (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      if (process.env.NODE_ENV !== 'production' && section && component) {
        log('component ' + displayName + ' with rootNodeID ' + rootNodeID + ' will re-render since ' + section + ' key ' + key + ' is changed from ', objA[key], ' to ', objB[key]);
      }
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      if (process.env.NODE_ENV !== 'production' && section && component) {
        log('component ' + displayName + ' with rootNodeID ' + rootNodeID + ' will re-render since ' + section + ' key ' + key + ' with value ', objB[key], 'is new');
      }
      return false;
    }
  }
  return true;
}

function pure(Component) {

  if (process.env.NODE_ENV !== 'production') {
    _tcomb2['default'].assert(_isReactComponent2['default'](Component), '@pure decorator can only be applied to React.Component(s)');
  }

  var originalScu = Component.prototype.shouldComponentUpdate;

  Component.prototype.shouldComponentUpdate = function (nextProps, nextState) {
    var _this = this;

    var _scu = function _scu() {
      return !shallowEqual(_this.props, nextProps, 'props', _this) || !shallowEqual(_this.state, nextState, 'state', _this);
    };
    return originalScu ? originalScu(nextProps, nextState, _scu) : _scu();
  };
}