const ENVIRONMENT = (() => {
    let env;
    try {
        env = "production";
    }
    catch (_a) {
        env = 'development';
    }
    return env;
})();
const IS_PROXY = Symbol('IS_PROXY');
const PATH = Symbol('PATH');
const VALUE = Symbol('VALUE');
const PROXY_TREE = Symbol('PROXY_TREE');
const isPlainObject = (value) => {
    return (String(value) === '[object Object]' && value.constructor.name === 'Object');
};
const arrayMutations = new Set([
    'push',
    'shift',
    'pop',
    'unshift',
    'splice',
    'reverse',
    'sort',
    'copyWithin',
]);
const getValue = (proxyOrValue) => proxyOrValue && proxyOrValue[IS_PROXY] ? proxyOrValue[VALUE] : proxyOrValue;
const isClass = (value) => typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor.name !== 'Object' &&
    Object.isExtensible(value);
const shouldProxy = (value) => {
    return (value !== undefined &&
        (!isClass(value) ||
            (isClass(value) &&
                !(value instanceof Date) &&
                !(value instanceof Map) &&
                !(value instanceof Set))));
};
class Proxifier {
    constructor(tree) {
        this.tree = tree;
        this.CACHED_PROXY = Symbol('CACHED_PROXY');
        this.delimiter = tree.master.options.delimiter;
        this.ssr = Boolean(tree.master.options.ssr);
    }
    concat(path, prop) {
        return path ? path + this.delimiter + prop : prop;
    }
    ensureMutationTrackingIsEnabled(path) {
        if (ENVIRONMENT === 'production')
            return;
        if (this.tree.master.options.devmode && !this.tree.canMutate()) {
            throw new Error(`proxy-state-tree - You are mutating the path "${path}", but it is not allowed. The following could have happened:
        
        - The mutation is explicitly being blocket
        - You are passing state to a 3rd party tool trying to manipulate the state
        - You are running asynchronous code and forgot to "await" its execution
        `);
        }
    }
    isDefaultProxifier() {
        return this.tree.proxifier === this.tree.master.proxifier;
    }
    ensureValueDosntExistInStateTreeElsewhere(value) {
        if (ENVIRONMENT === 'production')
            return;
        if (value && value[IS_PROXY] === true) {
            throw new Error(`proxy-state-tree - You are trying to insert a value that already exists in the state tree on path "${value[PATH]}"`);
        }
        return value;
    }
    trackPath(path) {
        if (!this.tree.canTrack()) {
            return;
        }
        if (this.isDefaultProxifier()) {
            const trackStateTree = this.tree.master.currentTree;
            if (!trackStateTree) {
                return;
            }
            trackStateTree.addTrackingPath(path);
        }
        else {
            this.tree.addTrackingPath(path);
        }
    }
    // With tracking trees we want to ensure that we are always
    // on the currently tracked tree. This ensures when we access
    // a tracking proxy that is not part of the current tracking tree (pass as prop)
    // we move the ownership to the current tracker
    getTrackingTree() {
        if (this.tree.master.currentTree && this.isDefaultProxifier()) {
            return this.tree.master.currentTree;
        }
        if (!this.tree.canTrack()) {
            return null;
        }
        if (this.tree.canTrack()) {
            return this.tree;
        }
        return null;
    }
    getMutationTree() {
        return this.tree.master.mutationTree || this.tree;
    }
    isProxyCached(value, path) {
        return (value[this.CACHED_PROXY] &&
            String(value[this.CACHED_PROXY][PATH]) === String(path));
    }
    createArrayProxy(value, path) {
        if (!this.ssr && this.isProxyCached(value, path)) {
            return value[this.CACHED_PROXY];
        }
        const proxifier = this;
        const proxy = new Proxy(value, {
            get(target, prop) {
                if (prop === IS_PROXY)
                    return true;
                if (prop === PATH)
                    return path;
                if (prop === VALUE)
                    return value;
                if (prop === 'indexOf') {
                    return (searchTerm, offset) => value.indexOf(getValue(searchTerm), getValue(offset));
                }
                if (prop === 'length' ||
                    (typeof target[prop] === 'function' &&
                        !arrayMutations.has(String(prop))) ||
                    typeof prop === 'symbol') {
                    return target[prop];
                }
                const trackingTree = proxifier.getTrackingTree();
                const nestedPath = proxifier.concat(path, prop);
                const currentTree = trackingTree || proxifier.tree;
                trackingTree && trackingTree.proxifier.trackPath(nestedPath);
                currentTree.trackPathListeners.forEach((cb) => cb(nestedPath));
                const method = String(prop);
                if (arrayMutations.has(method)) {
                    return (...args) => {
                        const mutationTree = proxifier.getMutationTree();
                        let result;
                        if (ENVIRONMENT === 'production') {
                            result = target[prop](...args);
                        }
                        else {
                            result = target[prop](...args.map((arg) => 
                            /* @__PURE__ */ proxifier.ensureValueDosntExistInStateTreeElsewhere(arg)));
                        }
                        mutationTree.addMutation({
                            method,
                            path: path,
                            delimiter: proxifier.delimiter,
                            args: args,
                            hasChangedValue: true,
                        });
                        return result;
                    };
                }
                if (shouldProxy(target[prop])) {
                    return proxifier.proxify(target[prop], nestedPath);
                }
                return target[prop];
            },
            set(target, prop, value) {
                const nestedPath = proxifier.concat(path, prop);
                const mutationTree = proxifier.getMutationTree();
                const result = Reflect.set(target, prop, value);
                mutationTree.addMutation({
                    method: 'set',
                    path: nestedPath,
                    args: [value],
                    delimiter: proxifier.delimiter,
                    hasChangedValue: true,
                });
                return result;
            },
        });
        if (!this.ssr) {
            Object.defineProperty(value, this.CACHED_PROXY, {
                value: proxy,
                configurable: true,
            });
        }
        return proxy;
    }
    createObjectProxy(object, path) {
        if (!this.ssr && this.isProxyCached(object, path)) {
            return object[this.CACHED_PROXY];
        }
        const proxifier = this;
        const proxy = new Proxy(object, {
            get(target, prop) {
                if (prop === IS_PROXY)
                    return true;
                if (prop === PATH)
                    return path;
                if (prop === VALUE)
                    return object;
                if (prop === PROXY_TREE)
                    return proxifier.tree;
                if (typeof prop === 'symbol' || prop in Object.prototype)
                    return target[prop];
                const descriptor = Object.getOwnPropertyDescriptor(target, prop) ||
                    (Object.getPrototypeOf(target) &&
                        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop));
                if (descriptor && 'get' in descriptor) {
                    const value = descriptor.get.call(proxy);
                    if (proxifier.tree.master.options.devmode &&
                        proxifier.tree.master.options.onGetter) {
                        proxifier.tree.master.options.onGetter(proxifier.concat(path, prop), value);
                    }
                    return value;
                }
                const trackingTree = proxifier.getTrackingTree();
                const targetValue = target[prop];
                const nestedPath = proxifier.concat(path, prop);
                const currentTree = trackingTree || proxifier.tree;
                if (typeof targetValue === 'function') {
                    if (proxifier.tree.master.options.onGetFunction) {
                        return proxifier.tree.master.options.onGetFunction(trackingTree || proxifier.tree, nestedPath, target, prop);
                    }
                    return isClass(target)
                        ? targetValue
                        : targetValue.call(target, proxifier.tree, nestedPath);
                }
                else {
                    currentTree.trackPathListeners.forEach((cb) => cb(nestedPath));
                    trackingTree && trackingTree.proxifier.trackPath(nestedPath);
                }
                if (shouldProxy(targetValue)) {
                    return proxifier.proxify(targetValue, nestedPath);
                }
                return targetValue;
            },
            set(target, prop, value) {
                const nestedPath = proxifier.concat(path, prop);
                let objectChangePath;
                if (!(prop in target)) {
                    objectChangePath = path;
                }
                const mutationTree = proxifier.getMutationTree();
                const existingValue = target[prop];
                if (typeof value === 'function' &&
                    proxifier.tree.master.options.onSetFunction) {
                    value = proxifier.tree.master.options.onSetFunction(proxifier.getTrackingTree() || proxifier.tree, nestedPath, target, prop, value);
                }
                const hasChangedValue = existingValue !== value;
                const result = Reflect.set(target, prop, value);
                mutationTree.addMutation({
                    method: 'set',
                    path: nestedPath,
                    args: [value],
                    delimiter: proxifier.delimiter,
                    hasChangedValue,
                }, objectChangePath);
                return result;
            },
            deleteProperty(target, prop) {
                const nestedPath = proxifier.concat(path, prop);
                let objectChangePath;
                if (prop in target) {
                    objectChangePath = path;
                }
                const mutationTree = proxifier.getMutationTree();
                delete target[prop];
                mutationTree.addMutation({
                    method: 'unset',
                    path: nestedPath,
                    args: [],
                    delimiter: proxifier.delimiter,
                    hasChangedValue: true,
                }, objectChangePath);
                return true;
            },
        });
        if (!this.ssr) {
            Object.defineProperty(object, this.CACHED_PROXY, {
                value: proxy,
                configurable: true,
            });
        }
        return proxy;
    }
    proxify(value, path) {
        if (value) {
            const isUnmatchingProxy = value[IS_PROXY] &&
                (String(value[PATH]) !== String(path) ||
                    value[VALUE][this.CACHED_PROXY] !== value);
            if (isUnmatchingProxy) {
                return this.proxify(value[VALUE], path);
            }
            else if (value[IS_PROXY]) {
                return value;
            }
            else if (Array.isArray(value)) {
                return this.createArrayProxy(value, path);
            }
            else if (isPlainObject(value) || isClass(value)) {
                return this.createObjectProxy(value, path);
            }
        }
        return value;
    }
}

var EventType;
(function (EventType) {
    EventType["ACTION_START"] = "action:start";
    EventType["ACTION_END"] = "action:end";
    EventType["OPERATOR_START"] = "operator:start";
    EventType["OPERATOR_END"] = "operator:end";
    EventType["OPERATOR_ASYNC"] = "operator:async";
    EventType["MUTATIONS"] = "mutations";
    EventType["EFFECT"] = "effect";
    EventType["DERIVED"] = "derived";
    EventType["DERIVED_DIRTY"] = "derived:dirty";
    EventType["COMPONENT_ADD"] = "component:add";
    EventType["COMPONENT_UPDATE"] = "component:update";
    EventType["COMPONENT_REMOVE"] = "component:remove";
    EventType["GETTER"] = "getter";
})(EventType || (EventType = {}));

/* SNOWPACK PROCESS POLYFILL (based on https://github.com/calvinmetcalf/node-process-es6) */
function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== 'undefined') {
    globalContext = window;
} else if (typeof self !== 'undefined') {
    globalContext = self;
} else {
    globalContext = {};
}
if (typeof globalContext.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
var title = 'browser';
var platform = 'browser';
var browser = true;
var argv = [];
var version = ''; // empty string to avoid regexp issues
var versions = {};
var release = {};
var config = {};

function noop() {}

var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;

function binding(name) {
    throw new Error('process.binding is not supported');
}

function cwd () { return '/' }
function chdir (dir) {
    throw new Error('process.chdir is not supported');
}function umask() { return 0; }

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = globalContext.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

// generate timestamp or delta
// see http://nodejs.org/api/process.html#process_process_hrtime
function hrtime(previousTimestamp){
  var clocktime = performanceNow.call(performance)*1e-3;
  var seconds = Math.floor(clocktime);
  var nanoseconds = Math.floor((clocktime%1)*1e9);
  if (previousTimestamp) {
    seconds = seconds - previousTimestamp[0];
    nanoseconds = nanoseconds - previousTimestamp[1];
    if (nanoseconds<0) {
      seconds--;
      nanoseconds += 1e9;
    }
  }
  return [seconds,nanoseconds]
}

var startTime = new Date();
function uptime() {
  var currentTime = new Date();
  var dif = currentTime - startTime;
  return dif / 1000;
}

var process = {
  nextTick: nextTick,
  title: title,
  browser: browser,
  env: {"NODE_ENV":"production"},
  argv: argv,
  version: version,
  versions: versions,
  on: on,
  addListener: addListener,
  once: once,
  off: off,
  removeListener: removeListener,
  removeAllListeners: removeAllListeners,
  emit: emit,
  binding: binding,
  cwd: cwd,
  chdir: chdir,
  umask: umask,
  hrtime: hrtime,
  platform: platform,
  release: release,
  config: config,
  uptime: uptime
};

var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.events = new Map();
    }
    EventEmitter.prototype.emit = function (event, msg) {
        var listeners = this.events.get(event) || [];
        for (var i = listeners.length - 1; i >= 0; i--) {
            var listener = listeners[i];
            listener.cb(msg);
            if (listener.once) {
                listeners.splice(i, 1);
            }
        }
    };
    EventEmitter.prototype.emitAsync = function (event, msg) {
        var listeners = this.events.get(event) || [];
        setTimeout(function () {
            for (var i = listeners.length - 1; i >= 0; i--) {
                var listener = listeners[i];
                listener.cb(msg);
                if (listener.once) {
                    listeners.splice(i, 1);
                }
            }
        });
    };
    EventEmitter.prototype.on = function (event, cb) {
        this.addListener(event, cb, false);
    };
    EventEmitter.prototype.once = function (event, cb) {
        this.addListener(event, cb, true);
    };
    EventEmitter.prototype.addListener = function (event, cb, once) {
        var listeners = this.events.get(event) || [];
        listeners.push({
            once: once,
            cb: cb,
        });
        this.events.set(event, listeners);
    };
    return EventEmitter;
}());

var toString = Object.prototype.toString;

var isPlainObj = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};

var _a, _b;
const INITIAL_STATE = Symbol('INITIAL_STATE');
const TRANSITIONS = Symbol('TRANSITIONS');
const STATE = Symbol('STATE');
const IS_DISPOSED = Symbol('IS_DISPOSED');
const CURRENT_KEYS = Symbol('CURRENT_KEYS');
const BASE_STATE = Symbol('BASE_STATE');
const TRANSITION_LISTENERS = Symbol('TRANSITION_LISTENERS');
// We have to export here to avoid a circular dependency issue with "utils"
function deepCopy(obj) {
    if (obj instanceof StateMachine) {
        return obj.clone();
    }
    else if (isPlainObj(obj)) {
        return Object.keys(obj).reduce((aggr, key) => {
            if (key === '__esModule') {
                return aggr;
            }
            const originalDescriptor = Object.getOwnPropertyDescriptor(obj, key);
            const isAGetter = originalDescriptor && 'get' in originalDescriptor;
            const value = obj[key];
            if (isAGetter) {
                Object.defineProperty(aggr, key, originalDescriptor);
            }
            else {
                aggr[key] = deepCopy(value);
            }
            return aggr;
        }, {});
    }
    else if (Array.isArray(obj)) {
        return obj.map((item) => deepCopy(item));
    }
    return obj;
}
class StateMachine {
    constructor(transitions, state, baseState) {
        this[_a] = [];
        this[_b] = false;
        this[STATE] = state;
        this[BASE_STATE] = baseState;
        this[INITIAL_STATE] = state.current;
        this[BASE_STATE] = baseState;
        this[TRANSITIONS] = transitions;
        this[CURRENT_KEYS] = Object.keys(state);
        Object.assign(this, state, baseState);
    }
    clone() {
        return new StateMachine(this[TRANSITIONS], deepCopy(this[STATE]), deepCopy(this[BASE_STATE]));
    }
    dispose() {
        this[VALUE][TRANSITION_LISTENERS] = [];
        Object.keys(this[VALUE]).forEach((key) => {
            if (this[VALUE][key] instanceof StateMachine) {
                this[key].dispose();
            }
        });
        this[VALUE][IS_DISPOSED] = true;
    }
    send(type, data) {
        if (this[VALUE][IS_DISPOSED]) {
            return this;
        }
        const tree = this[PROXY_TREE].master.mutationTree || this[PROXY_TREE];
        tree.enableMutations();
        let result;
        if (typeof this[VALUE][TRANSITIONS] === 'function') {
            const transition = this[VALUE][TRANSITIONS];
            result = transition({ type, data }, this);
        }
        else if (this[VALUE][TRANSITIONS][this[VALUE].current][type]) {
            const transition = this[VALUE][TRANSITIONS][this[VALUE].current][type];
            result = transition(data, this);
        }
        if (result) {
            this[VALUE][CURRENT_KEYS].forEach((key) => {
                if (key !== 'current') {
                    delete this[key];
                }
            });
            this[VALUE][CURRENT_KEYS] = Object.keys(result);
            Object.assign(this, result);
            this[VALUE][TRANSITION_LISTENERS].forEach((listener) => listener(this));
        }
        tree.blockMutations();
        return this;
    }
    matches(state) {
        if (this.current === state) {
            return this;
        }
    }
    onTransition(listener) {
        this[VALUE][TRANSITION_LISTENERS].push(listener);
    }
}
_a = TRANSITION_LISTENERS, _b = IS_DISPOSED;
function statemachine(transitions) {
    return {
        create(state, baseState) {
            return new StateMachine(transitions, state, baseState);
        },
    };
}

const createOnInitialize = () => {
    return ({ actions }, instance) => {
        const initializers = getActionsByName('onInitializeOvermind', actions);
        return Promise.all(initializers.map((initialize) => initialize(instance)));
    };
};
const ENVIRONMENT$1 = (() => {
    let env;
    try {
        env = "production";
    }
    catch (_a) {
        console.warn('Overmind was unable to determine the NODE_ENV, which means it will run in DEVELOPMENT mode. If this is a production app, please configure your build tool to define NODE_ENV');
        env = 'development';
    }
    return env;
})();
const IS_TEST = ENVIRONMENT$1 === 'test';
const IS_OPERATOR = Symbol('operator');
const ORIGINAL_ACTIONS = Symbol('origina_actions');
const EXECUTION = Symbol('execution');
const MODE_DEFAULT = Symbol('MODE_DEFAULT');
const MODE_TEST = Symbol('MODE_TEST');
const MODE_SSR = Symbol('MODE_SSR');
class MockedEventEmitter {
    emit() { }
    emitAsync() { }
    on() { }
    once() { }
    addListener() { }
}
function isPromise(maybePromise) {
    return (maybePromise instanceof Promise ||
        (maybePromise &&
            typeof maybePromise.then === 'function' &&
            typeof maybePromise.catch === 'function'));
}
function processState(state) {
    return Object.keys(state).reduce((aggr, key) => {
        if (key === '__esModule') {
            return aggr;
        }
        const originalDescriptor = Object.getOwnPropertyDescriptor(state, key);
        if (originalDescriptor && 'get' in originalDescriptor) {
            Object.defineProperty(aggr, key, originalDescriptor);
            return aggr;
        }
        const value = state[key];
        if (isPlainObj(value)) {
            aggr[key] = processState(value);
        }
        else {
            Object.defineProperty(aggr, key, originalDescriptor);
        }
        return aggr;
    }, isPlainObj(state) ? {} : state);
}
const getChangeMutationsDelimiter = '.';
function getChangeMutations(stateA, stateB, path = [], mutations = []) {
    const stateAKeys = Object.keys(stateA);
    const stateBKeys = Object.keys(stateB);
    stateAKeys.forEach((key) => {
        if (!stateBKeys.includes(key)) {
            mutations.push({
                delimiter: getChangeMutationsDelimiter,
                args: [],
                path: path.concat(key).join('.'),
                hasChangedValue: false,
                method: 'unset',
            });
        }
    });
    stateBKeys.forEach((key) => {
        if (isPlainObj(stateA[key]) && isPlainObj(stateB[key])) {
            getChangeMutations(stateA[key], stateB[key], path.concat(key), mutations);
        }
        else if (stateA[key] !== stateB[key]) {
            mutations.push({
                delimiter: getChangeMutationsDelimiter,
                args: [stateB[key]],
                path: path.concat(key).join('.'),
                hasChangedValue: false,
                method: 'set',
            });
        }
    });
    return mutations;
}
function getActionsByName(name, actions = {}, currentPath = []) {
    return Object.keys(actions).reduce((aggr, key) => {
        if (typeof actions[key] === 'function' && key === name) {
            return aggr.concat(actions[key]);
        }
        return aggr.concat(getActionsByName(name, actions[key], currentPath.concat(key)));
    }, []);
}
function getActionPaths(actions = {}, currentPath = []) {
    return Object.keys(actions).reduce((aggr, key) => {
        if (typeof actions[key] === 'function') {
            return aggr.concat(currentPath.concat(key).join('.'));
        }
        return aggr.concat(getActionPaths(actions[key], currentPath.concat(key)));
    }, []);
}
function createActionsProxy(actions, cb) {
    return new Proxy(actions, {
        get(target, prop) {
            if (prop === ORIGINAL_ACTIONS) {
                return actions;
            }
            if (typeof target[prop] === 'function') {
                return cb(target[prop]);
            }
            if (!target[prop]) {
                return undefined;
            }
            return createActionsProxy(target[prop], cb);
        },
    });
}

export { EventType as E, IS_PROXY as I, MODE_DEFAULT as M, Proxifier as P, VALUE as V, PATH as a, ENVIRONMENT$1 as b, MODE_SSR as c, MockedEventEmitter as d, EventEmitter as e, MODE_TEST as f, IS_TEST as g, createOnInitialize as h, EXECUTION as i, createActionsProxy as j, isPlainObj as k, getActionPaths as l, getChangeMutations as m, process as n, IS_OPERATOR as o, processState as p, isPromise as q, deepCopy as r, statemachine as s };
