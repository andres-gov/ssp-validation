import { c as MODE_SSR, E as EventType, b as ENVIRONMENT, n as process } from './common/utils-56260fd8.js';
import { r as react } from './common/index-c5947f9c.js';
import './common/_commonjsHelpers-4f56b6ba.js';

const IS_PRODUCTION = ENVIRONMENT === 'production';
const IS_TEST = ENVIRONMENT === 'test';
const isNode = !IS_TEST &&
    typeof process !== 'undefined' &&
    process.title &&
    process.title.includes('node');
function getFiberType(component) {
    if (component.type) {
        // React.memo
        return getFiberType(component.type);
    }
    // React.forwardRef
    return component.render || component;
}
// Inspired from https://github.com/facebook/react/blob/master/packages/react-devtools-shared/src/backend/renderer.js
function getDisplayName(component) {
    const type = getFiberType(component);
    return type.displayName || type.name || 'Anonymous';
}
function throwMissingContextError() {
    throw new Error('The Overmind hook could not find an Overmind instance on the context of React. Please make sure you use the Provider component at the top of your application and expose the Overmind instance there. Please read more in the React guide on the website');
}
const context = react.createContext({});
let nextComponentId = 0;
const Provider = context.Provider;
function useForceRerender() {
    const [flushId, forceRerender] = react.useState(-1);
    return {
        flushId,
        forceRerender,
    };
}
let currentComponentInstanceId = 0;
const { ReactCurrentOwner, } = react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
const useCurrentComponent = () => {
    return ReactCurrentOwner &&
        ReactCurrentOwner.current &&
        ReactCurrentOwner.current.elementType
        ? ReactCurrentOwner.current.elementType
        : {};
};
const useState = (cb) => {
    const overmind = react.useContext(context);
    if (!overmind.mode) {
        throwMissingContextError();
    }
    if (isNode || overmind.mode.mode === MODE_SSR) {
        return overmind.state;
    }
    const mountedRef = react.useRef(false);
    const { flushId, forceRerender } = useForceRerender();
    const tree = react.useMemo(() => overmind.proxyStateTreeInstance.getTrackStateTree(), [flushId]);
    const state = cb ? cb(tree.state) : tree.state;
    if (IS_PRODUCTION) {
        react.useLayoutEffect(() => {
            mountedRef.current = true;
            tree.stopTracking();
            return () => {
                tree.dispose();
            };
        }, [tree]);
        tree.track((_, __, flushId) => {
            if (!mountedRef.current) {
                // This one is not dealt with by the useLayoutEffect
                tree.dispose();
                return;
            }
            forceRerender(flushId);
        });
    }
    else {
        const component = useCurrentComponent();
        const name = getDisplayName(component);
        component.__componentId =
            typeof component.__componentId === 'undefined'
                ? nextComponentId++
                : component.__componentId;
        const { current: componentInstanceId } = react.useRef(currentComponentInstanceId++);
        react.useLayoutEffect(() => {
            mountedRef.current = true;
            overmind.eventHub.emitAsync(EventType.COMPONENT_ADD, {
                componentId: component.__componentId,
                componentInstanceId,
                name,
                paths: Array.from(tree.pathDependencies),
            });
            return () => {
                overmind.eventHub.emitAsync(EventType.COMPONENT_REMOVE, {
                    componentId: component.__componentId,
                    componentInstanceId,
                    name,
                });
            };
        }, []);
        react.useLayoutEffect(() => {
            tree.stopTracking();
            overmind.eventHub.emitAsync(EventType.COMPONENT_UPDATE, {
                componentId: component.__componentId,
                componentInstanceId,
                name,
                flushId,
                paths: Array.from(tree.pathDependencies),
            });
            return () => {
                tree.dispose();
            };
        }, [tree]);
        tree.track((_, __, flushId) => {
            if (!mountedRef.current) {
                // This one is not dealt with by the useLayoutEffect
                tree.dispose();
                return;
            }
            forceRerender(flushId);
        });
    }
    return state;
};
const useActions = () => {
    const overmind = react.useContext(context);
    if (!overmind.mode) {
        throwMissingContextError();
    }
    return overmind.actions;
};
const useEffects = () => {
    const overmind = react.useContext(context);
    if (!overmind.mode) {
        throwMissingContextError();
    }
    return overmind.effects;
};
const useReaction = () => {
    const overmind = react.useContext(context);
    if (!overmind.mode) {
        throwMissingContextError();
    }
    return overmind.reaction;
};
const createStateHook = () => useState;
const createActionsHook = () => {
    return useActions;
};
const createEffectsHook = () => {
    return useEffects;
};
const createReactionHook = () => {
    return useReaction;
};

export { Provider, createActionsHook, createEffectsHook, createReactionHook, createStateHook };
