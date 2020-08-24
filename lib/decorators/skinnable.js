'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = skinnable;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tcomb = require('tcomb');

var _tcomb2 = _interopRequireDefault(_tcomb);

var _lodashOmit = require('lodash.omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

var _isReactComponent = require('../isReactComponent');

var _isReactComponent2 = _interopRequireDefault(_isReactComponent);

var _pure = require('./pure');

var defaultGetLocals = function defaultGetLocals(props) {
  return props;
};

function skinnable(template) {

  return function (Component) {

    if (process.env.NODE_ENV !== 'production') {
      var _name = Component.name;
      _tcomb2['default'].assert(_tcomb2['default'].maybe(_tcomb2['default'].Func).is(template), '@skinnable decorator can only be configured with a function');
      _tcomb2['default'].assert(_isReactComponent2['default'](Component), '@skinnable decorator can only be applied to React.Component(s). Maybe did you type @skinnable instead of @skinnable()?');
      _tcomb2['default'].assert(!_tcomb2['default'].Func.is(Component.prototype.render), '@skinnable decorator can only be applied to components not implementing the render() method. Please remove the render method of component ' + _name);
      _tcomb2['default'].assert(_tcomb2['default'].maybe(_tcomb2['default'].Func).is(Component.prototype.getLocals), '@skinnable decorator requires getLocals() to be a function, check the component ' + _name);
      if (template) {
        _tcomb2['default'].assert(!_tcomb2['default'].Func.is(Component.prototype.template), '@skinnable decorator can only be applied to components not implementing the template(locals) method. Please remove the template method of component ' + _name);
      } else {
        _tcomb2['default'].assert(_tcomb2['default'].Func.is(Component.prototype.template), '@skinnable decorator requires a template(locals) method, add it to component ' + _name);
      }
    }

    if (template) {
      Component.prototype.template = template;
    }

    if (!Component.prototype.getLocals) {
      Component.prototype.getLocals = defaultGetLocals;
    }

    var originalCWU = Component.prototype.componentWillUpdate;

    Component.prototype.componentWillUpdate = function (nextProps, nextState) {
      this._refreshLocals = !_pure.shallowEqual(_lodashOmit2['default'](nextProps, 'children'), _lodashOmit2['default'](this.props, 'children')) || !_pure.shallowEqual(nextState, this.state);
      originalCWU && originalCWU.call(this, nextProps, nextState);
    };

    Component.prototype.render = function () {
      if (this._refreshLocals || !this._locals) {
        this._locals = this.getLocals(this.props);
      }
      return this.template(_extends({}, this._locals, { children: this.props.children }));
    };
  };
}

module.exports = exports['default'];