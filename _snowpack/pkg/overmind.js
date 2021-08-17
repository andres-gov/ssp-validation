import { P as Proxifier, I as IS_PROXY, V as VALUE, a as PATH, E as EventType, M as MODE_DEFAULT, b as ENVIRONMENT, c as MODE_SSR, d as MockedEventEmitter, e as EventEmitter, f as MODE_TEST, g as IS_TEST, h as createOnInitialize, i as EXECUTION, j as createActionsProxy, p as processState, k as isPlainObj, l as getActionPaths, m as getChangeMutations, n as process, o as IS_OPERATOR, q as isPromise, r as deepCopy } from './common/utils-56260fd8.js';
export { s as statemachine } from './common/utils-56260fd8.js';

class MutationTree {
    constructor(master, proxifier) {
        this.mutationCallbacks = [];
        this.mutations = [];
        this.objectChanges = new Set();
        this.isTracking = false;
        this.isBlocking = false;
        this.trackPathListeners = [];
        this.isTracking = true;
        this.master = master;
        this.proxifier = proxifier || new Proxifier(this);
        this.state = this.proxifier.proxify(master.sourceState, '');
    }
    trackPaths() {
        const paths = new Set();
        const listener = (path) => {
            paths.add(path);
        };
        this.trackPathListeners.push(listener);
        return () => {
            this.trackPathListeners.splice(this.trackPathListeners.indexOf(listener), 1);
            return paths;
        };
    }
    getMutations() {
        const mutations = this.mutations.slice();
        this.mutations.length = 0;
        return mutations;
    }
    getObjectChanges() {
        const objectChanges = new Set([...this.objectChanges]);
        this.objectChanges.clear();
        return objectChanges;
    }
    addMutation(mutation, objectChangePath) {
        const currentFlushId = this.master.currentFlushId;
        this.mutations.push(mutation);
        if (objectChangePath) {
            this.objectChanges.add(objectChangePath);
        }
        for (const cb of this.master.mutationCallbacks) {
            cb(mutation, new Set(objectChangePath ? [mutation.path, objectChangePath] : [mutation.path]), currentFlushId);
        }
        for (const callback of this.mutationCallbacks) {
            callback(mutation, new Set(objectChangePath ? [mutation.path, objectChangePath] : [mutation.path]), currentFlushId);
        }
    }
    flush(isAsync = false) {
        return this.master.flush(this, isAsync);
    }
    onMutation(callback) {
        this.mutationCallbacks.push(callback);
    }
    canMutate() {
        return this.isTracking && !this.isBlocking;
    }
    canTrack() {
        return false;
    }
    blockMutations() {
        this.isBlocking = true;
    }
    enableMutations() {
        this.isBlocking = false;
    }
    dispose() {
        this.isTracking = false;
        this.mutationCallbacks.length = 0;
        this.proxifier = this.master.proxifier;
        return this;
    }
}

class TrackStateTree {
    constructor(master) {
        this.pathDependencies = new Set();
        this.shouldTrack = false;
        this.trackPathListeners = [];
        this.master = master;
        this.proxifier = master.proxifier;
        this.state = master.state;
    }
    trackPaths() {
        const paths = new Set();
        const listener = (path) => {
            paths.add(path);
        };
        this.trackPathListeners.push(listener);
        return () => {
            this.trackPathListeners.splice(this.trackPathListeners.indexOf(listener), 1);
            return paths;
        };
    }
    canMutate() {
        return false;
    }
    canTrack() {
        return true;
    }
    addTrackingPath(path) {
        if (!this.shouldTrack) {
            return;
        }
        this.pathDependencies.add(path);
        if (this.callback) {
            this.master.addPathDependency(path, this.callback);
        }
    }
    track(cb) {
        this.master.changeTrackStateTree(this);
        this.shouldTrack = true;
        this.clearTracking();
        if (cb) {
            this.callback = (...args) => {
                if (!this.callback) {
                    return;
                }
                // eslint-disable-next-line
                cb(...args);
            };
        }
        return this;
    }
    clearTracking() {
        if (this.callback) {
            for (const path of this.pathDependencies) {
                this.master.removePathDependency(path, this.callback);
            }
        }
        this.pathDependencies.clear();
    }
    stopTracking() {
        this.shouldTrack = false;
    }
    trackScope(scope, cb) {
        const previousPreviousTree = this.master.previousTree;
        const previousCurrentTree = this.master.currentTree;
        this.master.currentTree = this;
        this.track(cb);
        const result = scope(this);
        this.master.currentTree = previousCurrentTree;
        this.master.previousTree = previousPreviousTree;
        this.stopTracking();
        return result;
    }
    dispose() {
        if (!this.callback) {
            this.pathDependencies.clear();
            return this;
        }
        this.clearTracking();
        this.callback = null;
        this.proxifier = this.master.proxifier;
        if (this.master.currentTree === this) {
            this.master.currentTree = null;
        }
        return this;
    }
}

class ProxyStateTree {
    constructor(state, options = {}) {
        this.cache = {
            mutationTree: [],
            trackStateTree: [],
        };
        this.flushCallbacks = [];
        this.mutationCallbacks = [];
        this.currentFlushId = 0;
        this.pathDependencies = {};
        if (typeof options.devmode === 'undefined') {
            options.devmode = true;
        }
        if (!options.delimiter) {
            options.delimiter = '.';
        }
        this.master = this;
        this.sourceState = state;
        this.options = options;
        this.createTrackStateProxifier();
    }
    /*
      We create a base proxifier for tracking state. That means there is one
      proxifier for all track state trees. This works because the actual tracking
      refers to the current tree on "master"
    */
    createTrackStateProxifier() {
        const trackStateTree = new TrackStateTree(this);
        this.proxifier = trackStateTree.proxifier = new Proxifier(trackStateTree);
        this.state = trackStateTree.state = this.proxifier.proxify(this.sourceState, '');
    }
    getMutationTree() {
        if (!this.options.devmode) {
            return (this.mutationTree =
                this.mutationTree || new MutationTree(this, this.proxifier));
        }
        const tree = this.cache.mutationTree.pop() || new MutationTree(this);
        return tree;
    }
    getTrackStateTree() {
        return this.cache.trackStateTree.pop() || new TrackStateTree(this);
    }
    getTrackStateTreeWithProxifier() {
        const tree = this.getTrackStateTree();
        if (this.options.ssr) {
            tree.state = this.sourceState;
        }
        else {
            tree.proxifier = new Proxifier(tree);
            tree.state = tree.proxifier.proxify(this.sourceState, '');
        }
        return tree;
    }
    changeTrackStateTree(tree) {
        this.previousTree = this.currentTree;
        this.currentTree = tree;
    }
    disposeTree(tree) {
        if (tree instanceof MutationTree) {
            this.cache.mutationTree.push(tree.dispose());
        }
        else if (tree instanceof TrackStateTree) {
            this.cache.trackStateTree.push(tree.dispose());
        }
    }
    onMutation(callback) {
        this.mutationCallbacks.push(callback);
        return () => {
            this.mutationCallbacks.splice(this.mutationCallbacks.indexOf(callback), 1);
        };
    }
    forceFlush() {
        const emptyMutations = [];
        const emptyPaths = [];
        for (const key in this.pathDependencies) {
            const callbacks = this.pathDependencies[key];
            callbacks.forEach((callback) => {
                callback(emptyMutations, emptyPaths, this.currentFlushId++, false);
            });
        }
    }
    flush(trees, isAsync = false) {
        let changes;
        if (Array.isArray(trees)) {
            changes = trees.reduce((aggr, tree) => ({
                mutations: aggr.mutations.concat(tree.getMutations()),
                objectChanges: new Set([
                    ...aggr.objectChanges,
                    ...tree.getObjectChanges(),
                ]),
            }), {
                mutations: [],
                objectChanges: new Set(),
            });
        }
        else {
            changes = {
                mutations: trees.getMutations(),
                objectChanges: trees.getObjectChanges(),
            };
        }
        if (!changes.mutations.length && !changes.objectChanges.size) {
            return {
                mutations: [],
                flushId: null,
            };
        }
        const paths = new Set();
        const pathCallbacksToCall = new Set();
        const flushId = this.currentFlushId++;
        for (const objectChange of changes.objectChanges) {
            if (this.pathDependencies[objectChange]) {
                paths.add(objectChange);
            }
        }
        for (const mutation of changes.mutations) {
            if (mutation.hasChangedValue) {
                paths.add(mutation.path);
            }
        }
        // Sort so that parent paths are called first
        const sortedPaths = Array.from(paths).sort();
        for (const path of sortedPaths) {
            if (this.pathDependencies[path]) {
                for (const callback of this.pathDependencies[path]) {
                    pathCallbacksToCall.add(callback);
                }
            }
        }
        for (const callback of pathCallbacksToCall) {
            callback(changes.mutations, sortedPaths, flushId, isAsync);
        }
        // We have to ensure that we iterate all callbacks. One flush might
        // lead to a change of the array (disposing), which means something
        // might be skipped. But we still want to allow removal of callbacks,
        // we just do not want to skip any, which is why we still check if it
        // exists in the original array
        const flushCallbacks = this.flushCallbacks.slice();
        for (const callback of flushCallbacks) {
            if (this.flushCallbacks.includes(callback)) {
                callback(changes.mutations, sortedPaths, flushId, isAsync);
            }
        }
        paths.clear();
        pathCallbacksToCall.clear();
        return {
            mutations: changes.mutations,
            flushId,
        };
    }
    onFlush(callback) {
        this.flushCallbacks.push(callback);
        return () => this.flushCallbacks.splice(this.flushCallbacks.indexOf(callback), 1);
    }
    rescope(value, tree) {
        return value && value[IS_PROXY]
            ? tree.proxifier.proxify(value[VALUE], value[PATH])
            : value;
    }
    addPathDependency(path, callback) {
        if (!this.pathDependencies[path]) {
            this.pathDependencies[path] = new Set();
        }
        this.pathDependencies[path].add(callback);
    }
    removePathDependency(path, callback) {
        this.pathDependencies[path].delete(callback);
        if (!this.pathDependencies[path].size) {
            delete this.pathDependencies[path];
        }
    }
    toJSON() {
        return this.sourceState;
    }
}

const IS_DERIVED = Symbol('IS_DERIVED');
const IS_DERIVED_CONSTRUCTOR = Symbol('IS_DERIVED_CONSTRUCTOR');
class Derived {
    constructor(cb) {
        this.cb = cb;
        this.isDirty = true;
        this.updateCount = 0;
        const boundEvaluate = this.evaluate.bind(this);
        boundEvaluate[IS_DERIVED] = true;
        return boundEvaluate;
    }
    runScope(tree, path) {
        const parent = path
            .slice(0, path.length - 1)
            .reduce((curr, key) => curr[key], tree.state);
        return this.cb(parent, tree.state);
    }
    evaluate(eventHub, tree, proxyStateTree, path) {
        if (!this.disposeOnMutation) {
            this.disposeOnMutation = proxyStateTree.onMutation((_, paths, flushId) => {
                if (typeof path.reduce((aggr, key) => aggr && aggr[key], proxyStateTree.sourceState) !== 'function') {
                    this.disposeOnMutation();
                    return;
                }
                if (this.isDirty) {
                    return;
                }
                for (const mutationPath of paths) {
                    if (this.paths.has(mutationPath)) {
                        this.isDirty = true;
                        eventHub.emitAsync(EventType.DERIVED_DIRTY, {
                            derivedPath: path,
                            path: mutationPath,
                            flushId,
                        });
                        return;
                    }
                }
            });
        }
        // During development we need to move the ownership of whatever state is returned from
        // the derived to track it correctly. In production we only have one proxifier, so no worries
        if (this.isDirty || this.previousProxifier !== tree.proxifier) {
            const getPaths = tree.trackPaths();
            this.value = this.runScope(tree, path);
            this.isDirty = false;
            this.paths = getPaths();
        }
        if (tree instanceof TrackStateTree) {
            // If we access a cached value we have to make sure that we move
            // the tracked paths into the tree looking at it, where
            // addTrackingPath is for initial tree and "trackPathListeners"
            // is for nested derived
            for (const path of this.paths) {
                tree.addTrackingPath(path);
                tree.trackPathListeners.forEach((cb) => cb(path));
            }
        }
        this.previousProxifier = tree.proxifier;
        // This value might be a proxy, we need to rescope
        // it to the current tree looking
        if (this.value && this.value[IS_PROXY]) {
            return proxyStateTree.rescope(this.value, tree);
        }
        return this.value;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function rehydrateState(target, source, classes = {}) {
    if (!target || !source) {
        throw new Error(`You have to pass a "target" and "source" object to rehydrate`);
    }
    Object.keys(source).forEach((key) => {
        const value = source[key];
        const classInstance = classes[key];
        if (typeof classInstance === 'function' && Array.isArray(target[key])) {
            target[key] = source[key].map((value) => classInstance(value));
        }
        else if (typeof classInstance === 'function' &&
            typeof target[key] === 'object' &&
            target[key] !== null &&
            target[key].constructor.name === 'Object') {
            target[key] = Object.keys(source[key]).reduce((aggr, subKey) => {
                aggr[subKey] = classInstance(source[key][subKey]);
                return aggr;
            }, {});
        }
        else if (typeof classInstance === 'function') {
            target[key] = classInstance(source[key]);
        }
        else if (typeof value === 'object' &&
            !Array.isArray(value) &&
            value !== null) {
            if (!target[key])
                target[key] = {};
            rehydrateState(target[key], source[key], classes[key]);
        }
        else {
            target[key] = source[key];
        }
    });
}
const SERIALIZE = Symbol('SERIALIZE');
const rehydrate = (state, source, classes = {}) => {
    if (Array.isArray(source)) {
        const mutations = source;
        mutations.forEach((mutation) => {
            const pathArray = mutation.path.split(mutation.delimiter);
            const key = pathArray.pop();
            const target = pathArray.reduce((aggr, key) => aggr[key], state);
            const classInstance = pathArray.reduce((aggr, key) => aggr && aggr[key], classes);
            if (mutation.method === 'set') {
                if (typeof classInstance === 'function' &&
                    Array.isArray(mutation.args[0])) {
                    target[key] = mutation.args[0].map((arg) => classInstance(arg));
                }
                else if (typeof classInstance === 'function') {
                    target[key] = classInstance(mutation.args[0]);
                }
                else {
                    target[key] = mutation.args[0];
                }
            }
            else if (mutation.method === 'unset') {
                delete target[key];
            }
            else {
                target[key][mutation.method].apply(target[key], typeof classInstance === 'function'
                    ? mutation.args.map((arg) => {
                        return typeof arg === 'object' && arg !== null
                            ? classInstance(arg)
                            : arg;
                    })
                    : mutation.args);
            }
        });
    }
    else {
        rehydrateState(state, source, classes);
    }
};

class Devtools {
    constructor(name) {
        this.safeClassNames = new Set();
        this.unsafeClassNames = new Set();
        this.circularReferenceCache = [];
        this.buffer = [];
        this.serializer = Promise.resolve();
        this.isConnected = false;
        this.doReconnect = false;
        this.hasWarnedReconnect = false;
        this.reconnectInterval = 10000;
        this.connect = (host, onMessage) => {
            host = host || 'localhost:3031';
            this.ws = new WebSocket(`ws://${host}?name=${this.name}`);
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.appName !== this.name) {
                    return;
                }
                onMessage(data);
            };
            this.ws.onopen = () => {
                this.isConnected = true;
                this.flushBuffer();
            };
            this.ws.onerror = () => {
                console.error(`OVERMIND DEVTOOLS: Not able to connect. You are trying to connect to "${host}", but there was no devtool there. Try the following:
        
          - Make sure you are running the latest version of the devtools, using "npx overmind-devtools@latest" or install latest extension for VSCode
          - Close the current tab and open a new one
          - Make sure the correct port is configured in the devtools
        `);
            };
            this.ws.onclose = () => {
                this.isConnected = false;
                if (this.doReconnect && !this.hasWarnedReconnect) {
                    console.warn('Debugger application is not running on selected port... will reconnect automatically behind the scenes');
                    this.hasWarnedReconnect = true;
                }
                if (this.doReconnect) {
                    this.reconnect(host, onMessage);
                }
            };
        };
        this.sendMessage = (payload) => {
            if (!this.isConnected) {
                this.buffer.push(payload);
                return;
            }
            this.ws.send(`{"appName":"${this.name}","message":${payload}}`);
        };
        this.flushBuffer = () => __awaiter(this, void 0, void 0, function* () {
            this.buffer.forEach((payload) => {
                this.sendMessage(payload);
            });
            this.buffer.length = 0;
        });
        this.name =
            typeof location !== 'undefined' &&
                location.search.includes('OVERMIND_DEVTOOL')
                ? name + ' (Overmind Devtool)'
                : name;
    }
    reconnect(host, onMessage) {
        setTimeout(() => this.connect(host, onMessage), this.reconnectInterval);
    }
    send(message) {
        const safeClassNames = this.safeClassNames;
        const unsafeClassNames = this.unsafeClassNames;
        const circularReferenceCache = this.circularReferenceCache;
        this.sendMessage(JSON.stringify(message, function (_, value) {
            if (typeof value === 'function') {
                return '[Function]';
            }
            if (this.__CLASS__) {
                return value;
            }
            if (value && value[SERIALIZE]) {
                return {
                    __CLASS__: true,
                    name: value.constructor.name,
                    value,
                };
            }
            if (typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value) &&
                value.constructor &&
                value.constructor.name !== 'Object') {
                if (circularReferenceCache.includes(value)) {
                    return `[CIRCULAR REFERENCE: ${value.constructor.name}]`;
                }
                circularReferenceCache.push(value);
                if (!safeClassNames.has(value.constructor.name) &&
                    !unsafeClassNames.has(value.constructor.name)) {
                    try {
                        JSON.stringify(value);
                        safeClassNames.add(value.constructor.name);
                    }
                    catch (_a) {
                        unsafeClassNames.add(value.constructor.name);
                    }
                }
                if (safeClassNames.has(value.constructor.name)) {
                    return {
                        __CLASS__: true,
                        name: value.constructor.name,
                        value,
                    };
                }
                else {
                    return `[${value.constructor.name || 'NOT SERIALIZABLE'}]`;
                }
            }
            return value;
        }));
        circularReferenceCache.length = 0;
    }
}

function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
let hasWarnedConstructor = false;
let currentEffectId = 0;
const ORIGIN_TARGET = Symbol('ORIGIN_TARGET');
function proxifyEffects(effects, cb, path = '') {
    if (!isObject(effects) && !(typeof effects === 'function')) {
        return effects;
    }
    return new Proxy(effects, {
        apply(target, thisArg, agumentsList) {
            const effectId = currentEffectId++;
            const name = path.split('.');
            const method = name.pop();
            // eslint-disable-next-line
            return cb({
                func: target.bind(thisArg ? thisArg[ORIGIN_TARGET] : undefined),
                effectId,
                name: name.join('.'),
                method,
                args: agumentsList,
            });
        },
        construct(Target, args) {
            if (!hasWarnedConstructor) {
                console.warn(`EFFECTS - It is highly recommended to create a custom effect, exposing a method that deals with the instantiation of "${path}". It improves readability and debugability of your app`);
                hasWarnedConstructor = true;
            }
            return new Target(...args);
        },
        get(target, prop) {
            if (prop === ORIGIN_TARGET) {
                return target;
            }
            return proxifyEffects(target[prop], cb, path ? path + '.' + prop.toString() : prop.toString());
        },
    });
}

const hotReloadingCache = {};
class Overmind {
    constructor(configuration, options = {}, mode = {
        mode: MODE_DEFAULT,
    }) {
        this.actionReferences = {};
        this.nextExecutionId = 0;
        this.reydrateMutationsForHotReloading = [];
        this.isStrict = false;
        this.reaction = (stateCallback, updateCallback, options = {}) => {
            let disposer;
            if (options.nested) {
                const value = stateCallback(this.state);
                if (!value || !value[IS_PROXY]) {
                    throw new Error('You have to return an object or array from the Overmind state when using a "nested" reaction');
                }
                const path = value[PATH];
                disposer = this.addFlushListener((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.path.startsWith(path)) {
                            updateCallback(path
                                ? path
                                    .split(this.delimiter)
                                    .reduce((aggr, key) => aggr[key], this.state)
                                : this.state);
                        }
                    });
                });
            }
            else {
                const tree = this.proxyStateTreeInstance.getTrackStateTree();
                let returnValue;
                const updateReaction = () => {
                    tree.trackScope(() => (returnValue = stateCallback(tree.state)), () => {
                        updateReaction();
                        updateCallback(returnValue);
                    });
                };
                updateReaction();
                disposer = () => {
                    tree.dispose();
                };
            }
            if (options.immediate) {
                updateCallback(stateCallback(this.state));
            }
            return disposer;
        };
        this.addMutationListener = (cb) => {
            return this.proxyStateTreeInstance.onMutation(cb);
        };
        this.addFlushListener = (cb) => {
            return this.proxyStateTreeInstance.onFlush(cb);
        };
        const name = options.name || 'OvermindApp';
        const devEnv = options.devEnv || 'development';
        const isNode = typeof process !== 'undefined' &&
            process.title &&
            process.title.includes('node');
        this.delimiter = options.delimiter || '.';
        this.isStrict = Boolean(options.strict);
        if (ENVIRONMENT === devEnv &&
            mode.mode === MODE_DEFAULT &&
            options.hotReloading !== false &&
            !isNode) {
            if (hotReloadingCache[name]) {
                return hotReloadingCache[name].reconfigure(configuration);
            }
            else {
                hotReloadingCache[name] = this;
            }
        }
        /*
          Set up an eventHub to trigger information from derived, computed and reactions
        */
        const eventHub = mode.mode === MODE_SSR
            ? new MockedEventEmitter()
            : new EventEmitter();
        /*
          Create the proxy state tree instance with the state and a wrapper to expose
          the eventHub
        */
        const proxyStateTreeInstance = this.createProxyStateTree(configuration, eventHub, mode.mode === MODE_TEST || ENVIRONMENT === devEnv, mode.mode === MODE_SSR);
        this.originalConfiguration = configuration;
        this.state = proxyStateTreeInstance.state;
        this.effects = configuration.effects || {};
        this.proxyStateTreeInstance = proxyStateTreeInstance;
        this.eventHub = eventHub;
        this.mode = mode;
        /*
          Expose the created actions
        */
        this.actions = this.getActions(configuration.actions);
        if (mode.mode === MODE_SSR) {
            return;
        }
        if (ENVIRONMENT === devEnv &&
            mode.mode === MODE_DEFAULT &&
            typeof window !== 'undefined') {
            let warning = 'OVERMIND: You are running in DEVELOPMENT mode.';
            if (options.logProxies !== true) {
                const originalConsoleLog = console.log;
                console.log = (...args) => originalConsoleLog.apply(console, args.map((arg) => arg && arg[IS_PROXY]
                    ? arg[VALUE]
                    : arg));
                warning +=
                    '\n\n - To improve debugging experience "console.log" will NOT log proxies from Overmind, but the actual value. Please see docs to turn off this behaviour';
            }
            if (options.devtools ||
                (typeof location !== 'undefined' &&
                    location.hostname === 'localhost' &&
                    options.devtools !== false)) {
                const host = options.devtools === true ? 'localhost:3031' : options.devtools;
                const name = options.name
                    ? options.name
                    : typeof document === 'undefined'
                        ? 'NoName'
                        : document.title || 'NoName';
                this.initializeDevtools(host, name, eventHub, proxyStateTreeInstance.sourceState, configuration.actions);
            }
            else if (options.devtools !== false) {
                warning +=
                    '\n\n - You are not running on localhost. You will have to manually define the devtools option to connect';
            }
            if (!IS_TEST) {
                console.warn(warning);
            }
        }
        if (ENVIRONMENT === 'production' &&
            mode.mode === MODE_DEFAULT) {
            eventHub.on(EventType.OPERATOR_ASYNC, (execution) => {
                if (!execution.parentExecution ||
                    !execution.parentExecution.isRunning) {
                    proxyStateTreeInstance.getMutationTree().flush(true);
                }
            });
            eventHub.on(EventType.ACTION_END, (execution) => {
                if (!execution.parentExecution || !execution.parentExecution.isRunning)
                    proxyStateTreeInstance.getMutationTree().flush();
            });
            let nextTick;
            const flushTree = () => {
                proxyStateTreeInstance.getMutationTree().flush(true);
            };
            this.proxyStateTreeInstance.onMutation(() => {
                nextTick && clearTimeout(nextTick);
                nextTick = setTimeout(flushTree, 0);
            });
        }
        else if (mode.mode === MODE_DEFAULT ||
            mode.mode === MODE_TEST) {
            if (ENVIRONMENT === 'test' ||
                (this.devtools && options.hotReloading !== false)) {
                eventHub.on(EventType.MUTATIONS, (execution) => {
                    this.reydrateMutationsForHotReloading = this.reydrateMutationsForHotReloading.concat(execution.mutations);
                });
            }
            eventHub.on(EventType.OPERATOR_ASYNC, (execution) => {
                if (!execution.parentExecution ||
                    !execution.parentExecution.isRunning) {
                    const flushData = execution.flush(true);
                    if (this.devtools && flushData.mutations.length) {
                        this.devtools.send({
                            type: 'flush',
                            data: Object.assign(Object.assign({}, execution), flushData),
                        });
                    }
                }
            });
            eventHub.on(EventType.ACTION_END, (execution) => {
                if (!execution.parentExecution ||
                    !execution.parentExecution.isRunning) {
                    const flushData = execution.flush();
                    if (this.devtools && flushData.mutations.length) {
                        this.devtools.send({
                            type: 'flush',
                            data: Object.assign(Object.assign({}, execution), flushData),
                        });
                    }
                }
            });
        }
        if (mode.mode === MODE_DEFAULT) {
            const onInitialize = this.createAction('onInitialize', createOnInitialize());
            this.initialized = Promise.resolve(onInitialize(this));
        }
        else {
            this.initialized = Promise.resolve(null);
        }
    }
    createProxyStateTree(configuration, eventHub, devmode, ssr) {
        const proxyStateTreeInstance = new ProxyStateTree(this.getState(configuration), {
            devmode: devmode && !ssr,
            ssr,
            delimiter: this.delimiter,
            onSetFunction: (tree, path, target, prop, func) => {
                if (func[IS_DERIVED_CONSTRUCTOR]) {
                    return new Derived(func);
                }
                return func;
            },
            onGetFunction: (tree, path, target, prop) => {
                const func = target[prop];
                if (func[IS_DERIVED]) {
                    return func(eventHub, tree, proxyStateTreeInstance, path.split(this.delimiter));
                }
                if (func[IS_DERIVED_CONSTRUCTOR]) {
                    const derived = new Derived(func);
                    target[prop] = derived;
                    return derived(eventHub, tree, proxyStateTreeInstance, path.split(this.delimiter));
                }
                return func;
            },
            onGetter: devmode
                ? (path, value) => {
                    this.eventHub.emitAsync(EventType.GETTER, {
                        path,
                        value,
                    });
                }
                : undefined,
        });
        return proxyStateTreeInstance;
    }
    createExecution(name, action, parentExecution) {
        const namespacePath = name.split('.');
        namespacePath.pop();
        if (ENVIRONMENT === 'production') {
            return {
                [EXECUTION]: true,
                parentExecution,
                namespacePath,
                actionName: name,
                getMutationTree: () => {
                    return this.proxyStateTreeInstance.getMutationTree();
                },
                getTrackStateTree: () => {
                    return this.proxyStateTreeInstance.getTrackStateTree();
                },
                emit: this.eventHub.emit.bind(this.eventHub),
            };
        }
        const mutationTrees = [];
        const execution = {
            [EXECUTION]: true,
            namespacePath,
            actionId: name,
            executionId: this.nextExecutionId++,
            actionName: name,
            operatorId: 0,
            isRunning: true,
            parentExecution,
            path: [],
            emit: this.eventHub.emit.bind(this.eventHub),
            send: this.devtools ? this.devtools.send.bind(this.devtools) : () => { },
            trackEffects: this.trackEffects.bind(this, this.effects),
            getNextOperatorId: (() => {
                let currentOperatorId = 0;
                return () => ++currentOperatorId;
            })(),
            flush: parentExecution
                ? parentExecution.flush
                : (isAsync) => {
                    return this.proxyStateTreeInstance.flush(mutationTrees, isAsync);
                },
            getMutationTree: parentExecution
                ? parentExecution.getMutationTree
                : () => {
                    const mutationTree = this.proxyStateTreeInstance.getMutationTree();
                    mutationTrees.push(mutationTree);
                    return mutationTree;
                },
            getTrackStateTree: () => {
                return this.proxyStateTreeInstance.getTrackStateTree();
            },
            onFlush: (cb) => {
                return this.proxyStateTreeInstance.onFlush(cb);
            },
            scopeValue: (value, tree) => {
                return this.scopeValue(value, tree);
            },
        };
        return execution;
    }
    createContext(execution, tree) {
        return {
            state: tree.state,
            actions: createActionsProxy(this.actions, (action) => {
                return (value) => action(value, execution.isRunning ? execution : null);
            }),
            execution,
            proxyStateTree: this.proxyStateTreeInstance,
            effects: this.trackEffects(this.effects, execution),
            addNamespace: this.addNamespace.bind(this),
            reaction: this.reaction.bind(this),
            addMutationListener: this.addMutationListener.bind(this),
            addFlushListener: this.addFlushListener.bind(this),
        };
    }
    addNamespace(configuration, path, existingState) {
        const state = existingState || this.state;
        const namespaceKey = path.pop();
        if (configuration.state) {
            const stateTarget = path.reduce((aggr, key) => aggr[key], state);
            stateTarget[namespaceKey] = processState(configuration.state);
        }
        if (configuration.actions) {
            const actionsTarget = path.reduce((aggr, key) => aggr[key], this.actions);
            actionsTarget[namespaceKey] = this.getActions(configuration.actions);
        }
        if (configuration.effects) {
            const effectsTarget = path.reduce((aggr, key) => aggr[key], this.effects);
            effectsTarget[namespaceKey] = configuration.effects;
        }
    }
    scopeValue(value, tree) {
        if (!value) {
            return value;
        }
        if (value[IS_PROXY]) {
            return this.proxyStateTreeInstance.rescope(value, tree);
        }
        else if (isPlainObj(value)) {
            return Object.assign({}, ...Object.keys(value).map((key) => ({
                [key]: this.proxyStateTreeInstance.rescope(value[key], tree),
            })));
        }
        else {
            return value;
        }
    }
    addExecutionMutation(mutation) {
        this.mutations.push(mutation);
    }
    createAction(name, originalAction) {
        this.actionReferences[name] = originalAction;
        const actionFunc = (value, boundExecution) => {
            const action = this.actionReferences[name];
            // Developer might unintentionally pass more arguments, so have to ensure
            // that it is an actual execution
            boundExecution =
                boundExecution && boundExecution[EXECUTION]
                    ? boundExecution
                    : undefined;
            if (ENVIRONMENT === 'production' ||
                action[IS_OPERATOR] ||
                this.mode.mode === MODE_SSR) {
                const execution = this.createExecution(name, action, boundExecution);
                this.eventHub.emit(EventType.ACTION_START, Object.assign(Object.assign({}, execution), { value }));
                if (action[IS_OPERATOR]) {
                    return new Promise((resolve, reject) => {
                        action(null, Object.assign(Object.assign({}, this.createContext(execution, this.proxyStateTreeInstance)), { value }), (err, finalContext) => {
                            execution.isRunning = false;
                            finalContext &&
                                this.eventHub.emit(EventType.ACTION_END, Object.assign(Object.assign({}, finalContext.execution), { operatorId: finalContext.execution.operatorId - 1 }));
                            if (err)
                                reject(err);
                            else {
                                resolve(finalContext.value);
                            }
                        });
                    });
                }
                else {
                    const mutationTree = execution.getMutationTree();
                    if (this.isStrict) {
                        mutationTree.blockMutations();
                    }
                    const returnValue = action(this.createContext(execution, mutationTree), value);
                    this.eventHub.emit(EventType.ACTION_END, execution);
                    return returnValue;
                }
            }
            else {
                const execution = Object.assign(Object.assign({}, this.createExecution(name, action, boundExecution)), { operatorId: 0, type: 'action' });
                this.eventHub.emit(EventType.ACTION_START, Object.assign(Object.assign({}, execution), { value }));
                this.eventHub.emit(EventType.OPERATOR_START, execution);
                const mutationTree = execution.getMutationTree();
                if (this.isStrict) {
                    mutationTree.blockMutations();
                }
                mutationTree.onMutation((mutation) => {
                    this.eventHub.emit(EventType.MUTATIONS, Object.assign(Object.assign({}, execution), { mutations: [mutation] }));
                });
                const scopedValue = this.scopeValue(value, mutationTree);
                const context = this.createContext(execution, mutationTree);
                try {
                    let pendingFlush;
                    mutationTree.onMutation((mutation) => {
                        if (pendingFlush) {
                            clearTimeout(pendingFlush);
                        }
                        if (this.mode.mode === MODE_TEST) {
                            this.addExecutionMutation(mutation);
                        }
                        else if (this.mode.mode === MODE_DEFAULT) {
                            pendingFlush = setTimeout(() => {
                                pendingFlush = null;
                                const flushData = execution.flush(true);
                                if (this.devtools && flushData.mutations.length) {
                                    this.devtools.send({
                                        type: 'flush',
                                        data: Object.assign(Object.assign(Object.assign({}, execution), flushData), { mutations: flushData.mutations }),
                                    });
                                }
                            });
                        }
                    });
                    let result = action(context, scopedValue);
                    if (isPromise(result)) {
                        this.eventHub.emit(EventType.OPERATOR_ASYNC, execution);
                        result = result
                            .then((promiseResult) => {
                            execution.isRunning = false;
                            if (!boundExecution) {
                                mutationTree.dispose();
                            }
                            this.eventHub.emit(EventType.OPERATOR_END, Object.assign(Object.assign({}, execution), { isAsync: true, result: undefined }));
                            this.eventHub.emit(EventType.ACTION_END, execution);
                            return promiseResult;
                        })
                            .catch((error) => {
                            execution.isRunning = false;
                            if (!boundExecution) {
                                mutationTree.dispose();
                            }
                            this.eventHub.emit(EventType.OPERATOR_END, Object.assign(Object.assign({}, execution), { isAsync: true, result: undefined, error: error.message }));
                            this.eventHub.emit(EventType.ACTION_END, execution);
                            throw error;
                        });
                    }
                    else {
                        execution.isRunning = false;
                        if (!boundExecution) {
                            mutationTree.dispose();
                        }
                        this.eventHub.emit(EventType.OPERATOR_END, Object.assign(Object.assign({}, execution), { isAsync: false, result: undefined }));
                        this.eventHub.emit(EventType.ACTION_END, execution);
                    }
                    return result;
                }
                catch (err) {
                    this.eventHub.emit(EventType.OPERATOR_END, Object.assign(Object.assign({}, execution), { isAsync: false, result: undefined, error: err.message }));
                    this.eventHub.emit(EventType.ACTION_END, execution);
                    throw err;
                }
            }
        };
        return actionFunc;
    }
    trackEffects(effects = {}, execution) {
        if (ENVIRONMENT === 'production') {
            return effects;
        }
        return proxifyEffects(this.effects, (effect) => {
            let result;
            try {
                if (this.mode.mode === MODE_TEST) {
                    const mode = this.mode;
                    result = mode.options.effectsCallback(effect);
                }
                else {
                    this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, isPending: true, error: false }));
                    result = effect.func.apply(this, effect.args);
                }
            }
            catch (error) {
                this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, isPending: false, error: error.message }));
                throw error;
            }
            if (isPromise(result)) {
                this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, isPending: true, error: false }));
                return result
                    .then((promisedResult) => {
                    this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, result: promisedResult, isPending: false, error: false }));
                    return promisedResult;
                })
                    .catch((error) => {
                    this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, isPending: false, error: error && error.message }));
                    throw error;
                });
            }
            this.eventHub.emit(EventType.EFFECT, Object.assign(Object.assign(Object.assign({}, execution), effect), { args: effect.args, result: result, isPending: false, error: false }));
            return result;
        });
    }
    initializeDevtools(host, name, eventHub, initialState, actions) {
        if (ENVIRONMENT === 'production')
            return;
        const devtools = new Devtools(name);
        devtools.connect(host, (message) => {
            switch (message.type) {
                case 'refresh': {
                    location.reload();
                    break;
                }
                case 'executeAction': {
                    const action = message.data.name
                        .split('.')
                        .reduce((aggr, key) => aggr[key], this.actions);
                    message.data.payload
                        ? action(JSON.parse(message.data.payload))
                        : action();
                    break;
                }
                case 'mutation': {
                    const tree = this.proxyStateTreeInstance.getMutationTree();
                    const path = message.data.path.slice();
                    const value = JSON.parse(`{ "value": ${message.data.value} }`).value;
                    const key = path.pop();
                    const state = path.reduce((aggr, key) => aggr[key], tree.state);
                    state[key] = value;
                    tree.flush(true);
                    tree.dispose();
                    this.devtools.send({
                        type: 'state',
                        data: {
                            path: message.data.path,
                            value,
                        },
                    });
                    break;
                }
            }
        });
        for (const type in EventType) {
            eventHub.on(EventType[type], ((eventType) => (data) => {
                devtools.send({
                    type: EventType[type],
                    data,
                });
                if (eventType === EventType.MUTATIONS) {
                    // We want to trigger property access when setting objects and arrays, as any derived set would
                    // then trigger and update the devtools
                    data.mutations.forEach((mutation) => {
                        const value = mutation.path
                            .split(this.delimiter)
                            .reduce((aggr, key) => aggr[key], this.proxyStateTreeInstance.state);
                        if (isPlainObj(value)) {
                            Object.keys(value).forEach((key) => value[key]);
                        }
                        else if (Array.isArray(value)) {
                            value.forEach((item) => {
                                if (isPlainObj(item)) {
                                    Object.keys(item).forEach((key) => item[key]);
                                }
                            });
                        }
                    });
                }
                // Access the derived which will trigger calculation and devtools
                if (eventType === EventType.DERIVED_DIRTY) {
                    data.derivedPath.reduce((aggr, key) => aggr[key], this.proxyStateTreeInstance.state);
                }
            })(EventType[type]));
        }
        devtools.send({
            type: 'init',
            data: {
                state: this.proxyStateTreeInstance.state,
                actions: getActionPaths(actions),
                delimiter: this.delimiter,
            },
        });
        this.devtools = devtools;
    }
    getState(configuration) {
        let state = {};
        if (configuration.state) {
            state = processState(configuration.state);
        }
        return state;
    }
    getActions(actions = {}, path = []) {
        return Object.keys(actions).reduce((aggr, name) => {
            if (typeof actions[name] === 'function') {
                const action = this.createAction(path.concat(name).join('.'), actions[name]);
                action.displayName = path.concat(name).join('.');
                return Object.assign(aggr, {
                    [name]: action,
                });
            }
            return Object.assign(aggr, {
                [name]: this.getActions(actions[name], path.concat(name)),
            });
        }, {});
    }
    /*
      Related to hot reloading we update the existing action references and add any new
      actions.
    */
    updateActions(actions = {}, path = []) {
        Object.keys(actions).forEach((name) => {
            if (typeof actions[name] === 'function') {
                const actionName = path.concat(name).join('.');
                if (this.actionReferences[actionName]) {
                    this.actionReferences[actionName] = actions[name];
                }
                else {
                    const target = path.reduce((aggr, key) => {
                        if (!aggr[key]) {
                            aggr[key] = {};
                        }
                        return aggr[key];
                    }, this.actions);
                    target[name] = this.createAction(actionName, actions[name]);
                    target[name].displayName = path.concat(name).join('.');
                }
            }
            else {
                this.updateActions(actions[name], path.concat(name));
            }
        }, {});
    }
    getTrackStateTree() {
        return this.proxyStateTreeInstance.getTrackStateTree();
    }
    getMutationTree() {
        return this.proxyStateTreeInstance.getMutationTree();
    }
    reconfigure(configuration) {
        const changeMutations = getChangeMutations(this.originalConfiguration.state, configuration.state || {});
        this.updateActions(configuration.actions);
        this.effects = configuration.effects || {};
        const mutationTree = this.proxyStateTreeInstance.getMutationTree();
        // We change the state to match the new structure
        rehydrate(mutationTree.state, changeMutations);
        // We run any mutations ran during the session, it might fail though
        // as the state structure might have changed, but no worries we just
        // ignore that
        this.reydrateMutationsForHotReloading.forEach((mutation) => {
            try {
                rehydrate(mutationTree.state, [mutation]);
            }
            catch (error) {
                // No worries, structure changed and we do not want to mutate anyways
            }
        });
        mutationTree.flush();
        mutationTree.dispose();
        if (this.devtools) {
            this.devtools.send({
                type: 're_init',
                data: {
                    state: this.state,
                    actions: getActionPaths(configuration.actions),
                },
            });
        }
        return this;
    }
}

function createOvermindMock(...args) {
    const setState = typeof args[1] === 'function' ? args[1] : args[2];
    const mockedEffects = typeof args[1] === 'function' ? undefined : args[1];
    const state = deepCopy(args[0].state);
    if (setState) {
        setState(state);
    }
    const mock = new Overmind(Object.assign({}, args[0], {
        state,
    }), {
        devtools: false,
    }, {
        mode: MODE_TEST,
        options: {
            effectsCallback: (effect) => {
                const mockedEffect = (effect.name
                    ? effect.name.split('.')
                    : []).reduce((aggr, key) => (aggr ? aggr[key] : aggr), mockedEffects);
                if (!mockedEffect || (mockedEffect && !mockedEffect[effect.method])) {
                    throw new Error(`The effect "${effect.name}" with method ${effect.method} has not been mocked`);
                }
                return mockedEffect[effect.method](...effect.args);
            },
        },
    });
    const action = mock.createAction('onInitialize', createOnInitialize());
    mock.onInitialize = () => action(mock);
    mock.mutations = [];
    return mock;
}

const derived = (cb) => {
    cb[IS_DERIVED_CONSTRUCTOR] = true;
    return cb;
};
function createOvermind(config, options) {
    return new Overmind(config, options, { mode: MODE_DEFAULT });
}

export { createOvermind, createOvermindMock, derived };
