import { c as createCommonjsModule, a as commonjsGlobal } from '../common/_commonjsHelpers-4f56b6ba.js';
import { _ as _function } from '../common/function-504814a9.js';

var Apply = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequenceS = exports.sequenceT = exports.getApplySemigroup = exports.apS = exports.apSecond = exports.apFirst = exports.ap = void 0;

function ap(F, G) {
    return function (fa) { return function (fab) {
        return F.ap(F.map(fab, function (gab) { return function (ga) { return G.ap(gab, ga); }; }), fa);
    }; };
}
exports.ap = ap;
function apFirst(A) {
    return function (second) { return function (first) {
        return A.ap(A.map(first, function (a) { return function () { return a; }; }), second);
    }; };
}
exports.apFirst = apFirst;
function apSecond(A) {
    return function (second) { return function (first) {
        return A.ap(A.map(first, function () { return function (b) { return b; }; }), second);
    }; };
}
exports.apSecond = apSecond;
function apS(F) {
    return function (name, fb) { return function (fa) {
        return F.ap(F.map(fa, function (a) { return function (b) {
            var _a;
            return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
        }; }), fb);
    }; };
}
exports.apS = apS;
function getApplySemigroup(F) {
    return function (S) { return ({
        concat: function (first, second) {
            return F.ap(F.map(first, function (x) { return function (y) { return S.concat(x, y); }; }), second);
        }
    }); };
}
exports.getApplySemigroup = getApplySemigroup;
function curried(f, n, acc) {
    return function (x) {
        var combined = Array(acc.length + 1);
        for (var i = 0; i < acc.length; i++) {
            combined[i] = acc[i];
        }
        combined[acc.length] = x;
        return n === 0 ? f.apply(null, combined) : curried(f, n - 1, combined);
    };
}
var tupleConstructors = {
    1: function (a) { return [a]; },
    2: function (a) { return function (b) { return [a, b]; }; },
    3: function (a) { return function (b) { return function (c) { return [a, b, c]; }; }; },
    4: function (a) { return function (b) { return function (c) { return function (d) { return [a, b, c, d]; }; }; }; },
    5: function (a) { return function (b) { return function (c) { return function (d) { return function (e) { return [a, b, c, d, e]; }; }; }; }; }
};
function getTupleConstructor(len) {
    if (!tupleConstructors.hasOwnProperty(len)) {
        tupleConstructors[len] = curried(_function.tuple, len - 1, []);
    }
    return tupleConstructors[len];
}
function sequenceT(F) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var len = args.length;
        var f = getTupleConstructor(len);
        var fas = F.map(args[0], f);
        for (var i = 1; i < len; i++) {
            fas = F.ap(fas, args[i]);
        }
        return fas;
    };
}
exports.sequenceT = sequenceT;
function getRecordConstructor(keys) {
    var len = keys.length;
    switch (len) {
        case 1:
            return function (a) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a);
            };
        case 2:
            return function (a) { return function (b) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a);
            }; };
        case 3:
            return function (a) { return function (b) { return function (c) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a);
            }; }; };
        case 4:
            return function (a) { return function (b) { return function (c) { return function (d) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a);
            }; }; }; };
        case 5:
            return function (a) { return function (b) { return function (c) { return function (d) { return function (e) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a[keys[4]] = e,
                    _a);
            }; }; }; }; };
        default:
            return curried(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var r = {};
                for (var i = 0; i < len; i++) {
                    r[keys[i]] = args[i];
                }
                return r;
            }, len - 1, []);
    }
}
function sequenceS(F) {
    return function (r) {
        var keys = Object.keys(r);
        var len = keys.length;
        var f = getRecordConstructor(keys);
        var fr = F.map(r[keys[0]], f);
        for (var i = 1; i < len; i++) {
            fr = F.ap(fr, r[keys[i]]);
        }
        return fr;
    };
}
exports.sequenceS = sequenceS;
});

var Functor = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctorComposition = exports.bindTo = exports.flap = exports.map = void 0;
/**
 * A `Functor` is a type constructor which supports a mapping operation `map`.
 *
 * `map` can be used to turn functions `a -> b` into functions `f a -> f b` whose argument and return types use the type
 * constructor `f` to represent some computational context.
 *
 * Instances must satisfy the following laws:
 *
 * 1. Identity: `F.map(fa, a => a) <-> fa`
 * 2. Composition: `F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)`
 *
 * @since 2.0.0
 */

function map(F, G) {
    return function (f) { return function (fa) { return F.map(fa, function (ga) { return G.map(ga, f); }); }; };
}
exports.map = map;
function flap(F) {
    return function (a) { return function (fab) { return F.map(fab, function (f) { return f(a); }); }; };
}
exports.flap = flap;
function bindTo(F) {
    return function (name) { return function (fa) { return F.map(fa, function (a) {
        var _a;
        return (_a = {}, _a[name] = a, _a);
    }); }; };
}
exports.bindTo = bindTo;
/** @deprecated */
function getFunctorComposition(F, G) {
    var _map = map(F, G);
    return {
        map: function (fga, f) { return _function.pipe(fga, _map(f)); }
    };
}
exports.getFunctorComposition = getFunctorComposition;
});

var Applicative = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicativeComposition = exports.getApplicativeMonoid = void 0;
/**
 * The `Applicative` type class extends the `Apply` type class with a `of` function, which can be used to create values
 * of type `f a` from values of type `a`.
 *
 * Where `Apply` provides the ability to lift functions of two or more arguments to functions whose arguments are
 * wrapped using `f`, and `Functor` provides the ability to lift functions of one argument, `pure` can be seen as the
 * function which lifts functions of _zero_ arguments. That is, `Applicative` functors support a lifting operation for
 * any number of function arguments.
 *
 * Instances must satisfy the following laws in addition to the `Apply` laws:
 *
 * 1. Identity: `A.ap(A.of(a => a), fa) <-> fa`
 * 2. Homomorphism: `A.ap(A.of(ab), A.of(a)) <-> A.of(ab(a))`
 * 3. Interchange: `A.ap(fab, A.of(a)) <-> A.ap(A.of(ab => ab(a)), fab)`
 *
 * Note. `Functor`'s `map` can be derived: `A.map(x, f) = A.ap(A.of(f), x)`
 *
 * @since 2.0.0
 */



function getApplicativeMonoid(F) {
    var f = Apply.getApplySemigroup(F);
    return function (M) { return ({
        concat: f(M).concat,
        empty: F.of(M.empty)
    }); };
}
exports.getApplicativeMonoid = getApplicativeMonoid;
/** @deprecated */
function getApplicativeComposition(F, G) {
    var map = Functor.getFunctorComposition(F, G).map;
    var _ap = Apply.ap(F, G);
    return {
        map: map,
        of: function (a) { return F.of(G.of(a)); },
        ap: function (fgab, fga) { return _function.pipe(fgab, _ap(fga)); }
    };
}
exports.getApplicativeComposition = getApplicativeComposition;
});

var Chain = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.bind = exports.chainFirst = void 0;
function chainFirst(M) {
    return function (f) { return function (first) { return M.chain(first, function (a) { return M.map(f(a), function () { return a; }); }); }; };
}
exports.chainFirst = chainFirst;
function bind(M) {
    return function (name, f) { return function (ma) { return M.chain(ma, function (a) { return M.map(f(a), function (b) {
        var _a;
        return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
    }); }); }; };
}
exports.bind = bind;
});

var ChainRec = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailRec = void 0;
/**
 * @since 2.0.0
 */
var tailRec = function (startWith, f) {
    var ab = f(startWith);
    while (ab._tag === 'Left') {
        ab = f(ab.left);
    }
    return ab.right;
};
exports.tailRec = tailRec;
});

var internal = createCommonjsModule(function (module, exports) {
var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromReadonlyNonEmptyArray = exports.has = exports.emptyRecord = exports.emptyReadonlyArray = exports.tail = exports.head = exports.isNonEmpty = exports.singleton = exports.right = exports.left = exports.isRight = exports.isLeft = exports.some = exports.none = exports.isSome = exports.isNone = void 0;
// -------------------------------------------------------------------------------------
// Option
// -------------------------------------------------------------------------------------
/** @internal */
var isNone = function (fa) { return fa._tag === 'None'; };
exports.isNone = isNone;
/** @internal */
var isSome = function (fa) { return fa._tag === 'Some'; };
exports.isSome = isSome;
/** @internal */
exports.none = { _tag: 'None' };
/** @internal */
var some = function (a) { return ({ _tag: 'Some', value: a }); };
exports.some = some;
// -------------------------------------------------------------------------------------
// Either
// -------------------------------------------------------------------------------------
/** @internal */
var isLeft = function (ma) { return ma._tag === 'Left'; };
exports.isLeft = isLeft;
/** @internal */
var isRight = function (ma) { return ma._tag === 'Right'; };
exports.isRight = isRight;
/** @internal */
var left = function (e) { return ({ _tag: 'Left', left: e }); };
exports.left = left;
/** @internal */
var right = function (a) { return ({ _tag: 'Right', right: a }); };
exports.right = right;
// -------------------------------------------------------------------------------------
// ReadonlyNonEmptyArray
// -------------------------------------------------------------------------------------
/** @internal */
var singleton = function (a) { return [a]; };
exports.singleton = singleton;
/** @internal */
var isNonEmpty = function (as) { return as.length > 0; };
exports.isNonEmpty = isNonEmpty;
/** @internal */
var head = function (as) { return as[0]; };
exports.head = head;
/** @internal */
var tail = function (as) { return as.slice(1); };
exports.tail = tail;
// -------------------------------------------------------------------------------------
// empty
// -------------------------------------------------------------------------------------
/** @internal */
exports.emptyReadonlyArray = [];
/** @internal */
exports.emptyRecord = {};
// -------------------------------------------------------------------------------------
// Record
// -------------------------------------------------------------------------------------
/** @internal */
exports.has = Object.prototype.hasOwnProperty;
// -------------------------------------------------------------------------------------
// NonEmptyArray
// -------------------------------------------------------------------------------------
/** @internal */
var fromReadonlyNonEmptyArray = function (as) { return __spreadArray([as[0]], as.slice(1)); };
exports.fromReadonlyNonEmptyArray = fromReadonlyNonEmptyArray;
});

var FromEither = createCommonjsModule(function (module, exports) {
/**
 * The `FromEither` type class represents those data types which support errors.
 *
 * @since 2.10.0
 */
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterOrElse = exports.chainEitherK = exports.fromEitherK = exports.chainOptionK = exports.fromOptionK = exports.fromPredicate = exports.fromOption = void 0;

var _ = __importStar(internal);
function fromOption(F) {
    return function (onNone) { return function (ma) { return F.fromEither(_.isNone(ma) ? _.left(onNone()) : _.right(ma.value)); }; };
}
exports.fromOption = fromOption;
function fromPredicate(F) {
    return function (predicate, onFalse) { return function (a) {
        return F.fromEither(predicate(a) ? _.right(a) : _.left(onFalse(a)));
    }; };
}
exports.fromPredicate = fromPredicate;
function fromOptionK(F) {
    var fromOptionF = fromOption(F);
    return function (onNone) {
        var from = fromOptionF(onNone);
        return function (f) { return _function.flow(f, from); };
    };
}
exports.fromOptionK = fromOptionK;
function chainOptionK(F, M) {
    var fromOptionKF = fromOptionK(F);
    return function (onNone) {
        var from = fromOptionKF(onNone);
        return function (f) { return function (ma) { return M.chain(ma, from(f)); }; };
    };
}
exports.chainOptionK = chainOptionK;
function fromEitherK(F) {
    return function (f) { return _function.flow(f, F.fromEither); };
}
exports.fromEitherK = fromEitherK;
function chainEitherK(F, M) {
    var fromEitherKF = fromEitherK(F);
    return function (f) { return function (ma) { return M.chain(ma, fromEitherKF(f)); }; };
}
exports.chainEitherK = chainEitherK;
function filterOrElse(F, M) {
    return function (predicate, onFalse) { return function (ma) {
        return M.chain(ma, function (a) { return F.fromEither(predicate(a) ? _.right(a) : _.left(onFalse(a))); });
    }; };
}
exports.filterOrElse = filterOrElse;
});

var Separated = createCommonjsModule(function (module, exports) {
/**
 * ```ts
 * interface Separated<E, A> {
 *    readonly left: E
 *    readonly right: A
 * }
 * ```
 *
 * Represents a result of separating a whole into two parts.
 *
 * @since 2.10.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.right = exports.left = exports.flap = exports.Functor = exports.Bifunctor = exports.URI = exports.bimap = exports.mapLeft = exports.map = exports.separated = void 0;


// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.10.0
 */
var separated = function (left, right) { return ({ left: left, right: right }); };
exports.separated = separated;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var _map = function (fa, f) { return _function.pipe(fa, exports.map(f)); };
var _mapLeft = function (fa, f) { return _function.pipe(fa, exports.mapLeft(f)); };
var _bimap = function (fa, g, f) { return _function.pipe(fa, exports.bimap(g, f)); };
// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.10.0
 */
var map = function (f) { return function (fa) {
    return exports.separated(exports.left(fa), f(exports.right(fa)));
}; };
exports.map = map;
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.10.0
 */
var mapLeft = function (f) { return function (fa) {
    return exports.separated(f(exports.left(fa)), exports.right(fa));
}; };
exports.mapLeft = mapLeft;
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.10.0
 */
var bimap = function (f, g) { return function (fa) {
    return exports.separated(f(exports.left(fa)), g(exports.right(fa)));
}; };
exports.bimap = bimap;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.10.0
 */
exports.URI = 'Separated';
/**
 * @category instances
 * @since 2.10.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    mapLeft: _mapLeft,
    bimap: _bimap
};
/**
 * @category instances
 * @since 2.10.0
 */
exports.Functor = {
    URI: exports.URI,
    map: _map
};
/**
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 2.10.0
 */
exports.flap = 
/*#_PURE_*/
Functor.flap(exports.Functor);
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * @since 2.10.0
 */
var left = function (s) { return s.left; };
exports.left = left;
/**
 * @since 2.10.0
 */
var right = function (s) { return s.right; };
exports.right = right;
});

var Witherable = createCommonjsModule(function (module, exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterE = exports.witherDefault = exports.wiltDefault = void 0;
var _ = __importStar(internal);
function wiltDefault(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.separate); };
    };
}
exports.wiltDefault = wiltDefault;
function witherDefault(T, C) {
    return function (F) {
        var traverseF = T.traverse(F);
        return function (wa, f) { return F.map(traverseF(wa, f), C.compact); };
    };
}
exports.witherDefault = witherDefault;
function filterE(W) {
    return function (F) {
        var witherF = W.wither(F);
        return function (predicate) { return function (ga) { return witherF(ga, function (a) { return F.map(predicate(a), function (b) { return (b ? _.some(a) : _.none); }); }); }; };
    };
}
exports.filterE = filterE;
});

var Either = createCommonjsModule(function (module, exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fold = exports.match = exports.foldW = exports.matchW = exports.isRight = exports.isLeft = exports.fromOption = exports.fromPredicate = exports.FromEither = exports.MonadThrow = exports.throwError = exports.ChainRec = exports.Extend = exports.extend = exports.Alt = exports.alt = exports.altW = exports.Bifunctor = exports.mapLeft = exports.bimap = exports.Traversable = exports.sequence = exports.traverse = exports.Foldable = exports.reduceRight = exports.foldMap = exports.reduce = exports.Monad = exports.Chain = exports.chain = exports.chainW = exports.Applicative = exports.Apply = exports.ap = exports.apW = exports.Pointed = exports.of = exports.Functor = exports.map = exports.getAltValidation = exports.getApplicativeValidation = exports.getWitherable = exports.getFilterable = exports.getCompactable = exports.getSemigroup = exports.getEq = exports.getShow = exports.URI = exports.right = exports.left = void 0;
exports.getValidation = exports.getValidationMonoid = exports.getValidationSemigroup = exports.getApplyMonoid = exports.getApplySemigroup = exports.either = exports.stringifyJSON = exports.parseJSON = exports.sequenceArray = exports.traverseArray = exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex = exports.traverseReadonlyNonEmptyArrayWithIndex = exports.ApT = exports.apSW = exports.apS = exports.bindW = exports.bind = exports.bindTo = exports.Do = exports.exists = exports.elem = exports.toError = exports.toUnion = exports.chainNullableK = exports.fromNullableK = exports.tryCatchK = exports.tryCatch = exports.fromNullable = exports.orElse = exports.orElseW = exports.swap = exports.filterOrElseW = exports.filterOrElse = exports.chainOptionK = exports.fromOptionK = exports.duplicate = exports.flatten = exports.flattenW = exports.chainFirstW = exports.chainFirst = exports.apSecond = exports.apFirst = exports.flap = exports.getOrElse = exports.getOrElseW = void 0;







var _ = __importStar(internal);


// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure.
 *
 * @category constructors
 * @since 2.0.0
 */
exports.left = _.left;
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure.
 *
 * @category constructors
 * @since 2.0.0
 */
exports.right = _.right;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var _map = function (fa, f) { return _function.pipe(fa, exports.map(f)); };
var _ap = function (fab, fa) { return _function.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var _chain = function (ma, f) { return _function.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var _reduce = function (fa, b, f) { return _function.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var _foldMap = function (M) { return function (fa, f) {
    var foldMapM = exports.foldMap(M);
    return _function.pipe(fa, foldMapM(f));
}; };
/* istanbul ignore next */
var _reduceRight = function (fa, b, f) { return _function.pipe(fa, exports.reduceRight(b, f)); };
var _traverse = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return _function.pipe(ta, traverseF(f)); };
};
var _bimap = function (fa, f, g) { return _function.pipe(fa, exports.bimap(f, g)); };
var _mapLeft = function (fa, f) { return _function.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var _alt = function (fa, that) { return _function.pipe(fa, exports.alt(that)); };
/* istanbul ignore next */
var _extend = function (wa, f) { return _function.pipe(wa, exports.extend(f)); };
var _chainRec = function (a, f) {
    return ChainRec.tailRec(f(a), function (e) {
        return exports.isLeft(e) ? exports.right(exports.left(e.left)) : exports.isLeft(e.right) ? exports.left(f(e.right.left)) : exports.right(exports.right(e.right.right));
    });
};
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Either';
/**
 * @category instances
 * @since 2.0.0
 */
var getShow = function (SE, SA) { return ({
    show: function (ma) { return (exports.isLeft(ma) ? "left(" + SE.show(ma.left) + ")" : "right(" + SA.show(ma.right) + ")"); }
}); };
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
var getEq = function (EL, EA) { return ({
    equals: function (x, y) {
        return x === y || (exports.isLeft(x) ? exports.isLeft(y) && EL.equals(x.left, y.left) : exports.isRight(y) && EA.equals(x.right, y.right));
    }
}); };
exports.getEq = getEq;
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @example
 * import { getSemigroup, left, right } from 'fp-ts/Either'
 * import { SemigroupSum } from 'fp-ts/number'
 *
 * const S = getSemigroup<string, number>(SemigroupSum)
 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
 * assert.deepStrictEqual(S.concat(left('a'), right(2)), right(2))
 * assert.deepStrictEqual(S.concat(right(1), left('b')), right(1))
 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
 *
 * @category instances
 * @since 2.0.0
 */
var getSemigroup = function (S) { return ({
    concat: function (x, y) { return (exports.isLeft(y) ? x : exports.isLeft(x) ? y : exports.right(S.concat(x.right, y.right))); }
}); };
exports.getSemigroup = getSemigroup;
/**
 * Builds a `Compactable` instance for `Either` given `Monoid` for the left side.
 *
 * @category instances
 * @since 2.10.0
 */
var getCompactable = function (M) {
    var empty = exports.left(M.empty);
    return {
        URI: exports.URI,
        _E: undefined,
        compact: function (ma) { return (exports.isLeft(ma) ? ma : ma.right._tag === 'None' ? empty : exports.right(ma.right.value)); },
        separate: function (ma) {
            return exports.isLeft(ma)
                ? Separated.separated(ma, ma)
                : exports.isLeft(ma.right)
                    ? Separated.separated(exports.right(ma.right.left), empty)
                    : Separated.separated(empty, exports.right(ma.right.right));
        }
    };
};
exports.getCompactable = getCompactable;
/**
 * Builds a `Filterable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.10.0
 */
var getFilterable = function (M) {
    var empty = exports.left(M.empty);
    var _a = exports.getCompactable(M), compact = _a.compact, separate = _a.separate;
    var filter = function (ma, predicate) {
        return exports.isLeft(ma) ? ma : predicate(ma.right) ? ma : empty;
    };
    var partition = function (ma, p) {
        return exports.isLeft(ma)
            ? Separated.separated(ma, ma)
            : p(ma.right)
                ? Separated.separated(empty, exports.right(ma.right))
                : Separated.separated(exports.right(ma.right), empty);
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: _map,
        compact: compact,
        separate: separate,
        filter: filter,
        filterMap: function (ma, f) {
            if (exports.isLeft(ma)) {
                return ma;
            }
            var ob = f(ma.right);
            return ob._tag === 'None' ? empty : exports.right(ob.value);
        },
        partition: partition,
        partitionMap: function (ma, f) {
            if (exports.isLeft(ma)) {
                return Separated.separated(ma, ma);
            }
            var e = f(ma.right);
            return exports.isLeft(e) ? Separated.separated(exports.right(e.left), empty) : Separated.separated(empty, exports.right(e.right));
        }
    };
};
exports.getFilterable = getFilterable;
/**
 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.0.0
 */
var getWitherable = function (M) {
    var F_ = exports.getFilterable(M);
    var C = exports.getCompactable(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: _map,
        compact: F_.compact,
        separate: F_.separate,
        filter: F_.filter,
        filterMap: F_.filterMap,
        partition: F_.partition,
        partitionMap: F_.partitionMap,
        traverse: _traverse,
        sequence: exports.sequence,
        reduce: _reduce,
        foldMap: _foldMap,
        reduceRight: _reduceRight,
        wither: Witherable.witherDefault(exports.Traversable, C),
        wilt: Witherable.wiltDefault(exports.Traversable, C)
    };
};
exports.getWitherable = getWitherable;
/**
 * @category instances
 * @since 2.7.0
 */
var getApplicativeValidation = function (SE) { return ({
    URI: exports.URI,
    _E: undefined,
    map: _map,
    ap: function (fab, fa) {
        return exports.isLeft(fab)
            ? exports.isLeft(fa)
                ? exports.left(SE.concat(fab.left, fa.left))
                : fab
            : exports.isLeft(fa)
                ? fa
                : exports.right(fab.right(fa.right));
    },
    of: exports.of
}); };
exports.getApplicativeValidation = getApplicativeValidation;
/**
 * @category instances
 * @since 2.7.0
 */
var getAltValidation = function (SE) { return ({
    URI: exports.URI,
    _E: undefined,
    map: _map,
    alt: function (me, that) {
        if (exports.isRight(me)) {
            return me;
        }
        var ea = that();
        return exports.isLeft(ea) ? exports.left(SE.concat(me.left, ea.left)) : ea;
    }
}); };
exports.getAltValidation = getAltValidation;
/**
 * @category instance operations
 * @since 2.0.0
 */
var map = function (f) { return function (fa) {
    return exports.isLeft(fa) ? fa : exports.right(f(fa.right));
}; };
exports.map = map;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: _map
};
/**
 * @category instance operations
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * @category instances
 * @since 2.10.0
 */
exports.Pointed = {
    URI: exports.URI,
    of: exports.of
};
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category instance operations
 * @since 2.8.0
 */
var apW = function (fa) { return function (fab) { return (exports.isLeft(fab) ? fab : exports.isLeft(fa) ? fa : exports.right(fab.right(fa.right))); }; };
exports.apW = apW;
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category instance operations
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * @category instances
 * @since 2.10.0
 */
exports.Apply = {
    URI: exports.URI,
    map: _map,
    ap: _ap
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of
};
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category instance operations
 * @since 2.6.0
 */
var chainW = function (f) { return function (ma) {
    return exports.isLeft(ma) ? ma : f(ma.right);
}; };
exports.chainW = chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category instance operations
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * @category instances
 * @since 2.10.0
 */
exports.Chain = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    chain: _chain
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of,
    chain: _chain
};
/**
 * Left-associative fold of a structure.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as E from 'fp-ts/Either'
 *
 * const startWith = 'prefix'
 * const concat = (a: string, b: string) => `${a}:${b}`
 *
 * assert.deepStrictEqual(
 *   pipe(E.right('a'), E.reduce(startWith, concat)),
 *   'prefix:a'
 * )
 *
 * assert.deepStrictEqual(
 *   pipe(E.left('e'), E.reduce(startWith, concat)),
 *   'prefix'
 * )
 *
 * @category instance operations
 * @since 2.0.0
 */
var reduce = function (b, f) { return function (fa) {
    return exports.isLeft(fa) ? b : f(b, fa.right);
}; };
exports.reduce = reduce;
/**
 * Map each element of the structure to a monoid, and combine the results.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as E from 'fp-ts/Either'
 * import * as S from 'fp-ts/string'
 *
 * const yell = (a: string) => `${a}!`
 *
 * assert.deepStrictEqual(
 *   pipe(E.right('a'), E.foldMap(S.Monoid)(yell)),
 *   'a!'
 * )
 *
 * assert.deepStrictEqual(
 *   pipe(E.left('e'), E.foldMap(S.Monoid)(yell)),
 *   S.Monoid.empty
 * )
 *
 * @category instance operations
 * @since 2.0.0
 */
var foldMap = function (M) { return function (f) { return function (fa) {
    return exports.isLeft(fa) ? M.empty : f(fa.right);
}; }; };
exports.foldMap = foldMap;
/**
 * Right-associative fold of a structure.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as E from 'fp-ts/Either'
 *
 * const startWith = 'postfix'
 * const concat = (a: string, b: string) => `${a}:${b}`
 *
 * assert.deepStrictEqual(
 *   pipe(E.right('a'), E.reduceRight(startWith, concat)),
 *   'a:postfix'
 * )
 *
 * assert.deepStrictEqual(
 *   pipe(E.left('e'), E.reduceRight(startWith, concat)),
 *   'postfix'
 * )
 *
 * @category instance operations
 * @since 2.0.0
 */
var reduceRight = function (b, f) { return function (fa) {
    return exports.isLeft(fa) ? b : f(fa.right, b);
}; };
exports.reduceRight = reduceRight;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight
};
/**
 * Map each element of a structure to an action, evaluate these actions from left to right, and collect the results.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as RA from 'fp-ts/ReadonlyArray'
 * import * as E from 'fp-ts/Either'
 * import * as O from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(
 *   pipe(E.right(['a']), E.traverse(O.Applicative)(RA.head)),
 *   O.some(E.right('a'))
 *  )
 *
 * assert.deepStrictEqual(
 *   pipe(E.right([]), E.traverse(O.Applicative)(RA.head)),
 *   O.none
 * )
 *
 * @category instance operations
 * @since 2.6.3
 */
var traverse = function (F) { return function (f) { return function (ta) { return (exports.isLeft(ta) ? F.of(exports.left(ta.left)) : F.map(f(ta.right), exports.right)); }; }; };
exports.traverse = traverse;
/**
 * Evaluate each monadic action in the structure from left to right, and collect the results.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import * as E from 'fp-ts/Either'
 * import * as O from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(
 *   pipe(E.right(O.some('a')), E.sequence(O.Applicative)),
 *   O.some(E.right('a'))
 *  )
 *
 * assert.deepStrictEqual(
 *   pipe(E.right(O.none), E.sequence(O.Applicative)),
 *   O.none
 * )
 *
 * @category instance operations
 * @since 2.6.3
 */
var sequence = function (F) { return function (ma) {
    return exports.isLeft(ma) ? F.of(exports.left(ma.left)) : F.map(ma.right, exports.right);
}; };
exports.sequence = sequence;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: _map,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence
};
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category instance operations
 * @since 2.0.0
 */
var bimap = function (f, g) { return function (fa) { return (exports.isLeft(fa) ? exports.left(f(fa.left)) : exports.right(g(fa.right))); }; };
exports.bimap = bimap;
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category instance operations
 * @since 2.0.0
 */
var mapLeft = function (f) { return function (fa) {
    return exports.isLeft(fa) ? exports.left(f(fa.left)) : fa;
}; };
exports.mapLeft = mapLeft;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: _bimap,
    mapLeft: _mapLeft
};
/**
 * Less strict version of [`alt`](#alt).
 *
 * @category instance operations
 * @since 2.9.0
 */
var altW = function (that) { return function (fa) { return (exports.isLeft(fa) ? that() : fa); }; };
exports.altW = altW;
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category instance operations
 * @since 2.0.0
 */
exports.alt = exports.altW;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: _map,
    alt: _alt
};
/**
 * @category instance operations
 * @since 2.0.0
 */
var extend = function (f) { return function (wa) {
    return exports.isLeft(wa) ? wa : exports.right(f(wa));
}; };
exports.extend = extend;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: _map,
    extend: _extend
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    chain: _chain,
    chainRec: _chainRec
};
/**
 * @category instance operations
 * @since 2.6.3
 */
exports.throwError = exports.left;
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: _map,
    ap: _ap,
    of: exports.of,
    chain: _chain,
    throwError: exports.throwError
};
/**
 * @category instances
 * @since 2.10.0
 */
exports.FromEither = {
    URI: exports.URI,
    fromEither: _function.identity
};
/**
 * @example
 * import { fromPredicate, left, right } from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     1,
 *     fromPredicate(
 *       (n) => n > 0,
 *       () => 'error'
 *     )
 *   ),
 *   right(1)
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     -1,
 *     fromPredicate(
 *       (n) => n > 0,
 *       () => 'error'
 *     )
 *   ),
 *   left('error')
 * )
 *
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = 
/*#__PURE__*/
FromEither.fromPredicate(exports.FromEither);
// -------------------------------------------------------------------------------------
// natural transformations
// -------------------------------------------------------------------------------------
/**
 * @example
 * import * as E from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 * import * as O from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     O.some(1),
 *     E.fromOption(() => 'error')
 *   ),
 *   E.right(1)
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     O.none,
 *     E.fromOption(() => 'error')
 *   ),
 *   E.left('error')
 * )
 *
 * @category natural transformations
 * @since 2.0.0
 */
exports.fromOption = 
/*#__PURE__*/
FromEither.fromOption(exports.FromEither);
// -------------------------------------------------------------------------------------
// refinements
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise.
 *
 * @category refinements
 * @since 2.0.0
 */
exports.isLeft = _.isLeft;
/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise.
 *
 * @category refinements
 * @since 2.0.0
 */
exports.isRight = _.isRight;
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * Less strict version of [`match`](#match).
 *
 * @category destructors
 * @since 2.10.0
 */
var matchW = function (onLeft, onRight) { return function (ma) {
    return exports.isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);
}; };
exports.matchW = matchW;
/**
 * Alias of [`matchW`](#matchw).
 *
 * @category destructors
 * @since 2.10.0
 */
exports.foldW = exports.matchW;
/**
 * Takes two functions and an `Either` value, if the value is a `Left` the inner value is applied to the first function,
 * if the value is a `Right` the inner value is applied to the second function.
 *
 * @example
 * import { match, left, right } from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * function onLeft(errors: Array<string>): string {
 *   return `Errors: ${errors.join(', ')}`
 * }
 *
 * function onRight(value: number): string {
 *   return `Ok: ${value}`
 * }
 *
 * assert.strictEqual(
 *   pipe(
 *     right(1),
 *     match(onLeft, onRight)
 *   ),
 *   'Ok: 1'
 * )
 * assert.strictEqual(
 *   pipe(
 *     left(['error 1', 'error 2']),
 *     match(onLeft, onRight)
 *   ),
 *   'Errors: error 1, error 2'
 * )
 *
 * @category destructors
 * @since 2.10.0
 */
exports.match = exports.matchW;
/**
 * Alias of [`match`](#match).
 *
 * @category destructors
 * @since 2.0.0
 */
exports.fold = exports.match;
/**
 * Less strict version of [`getOrElse`](#getorelse).
 *
 * @category destructors
 * @since 2.6.0
 */
var getOrElseW = function (onLeft) { return function (ma) {
    return exports.isLeft(ma) ? onLeft(ma.left) : ma.right;
}; };
exports.getOrElseW = getOrElseW;
/**
 * Returns the wrapped value if it's a `Right` or a default value if is a `Left`.
 *
 * @example
 * import { getOrElse, left, right } from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     right(1),
 *     getOrElse(() => 0)
 *   ),
 *   1
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     left('error'),
 *     getOrElse(() => 0)
 *   ),
 *   0
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Derivable from `Functor`.
 *
 * @category combinators
 * @since 2.10.0
 */
exports.flap = 
/*#_PURE_*/
Functor.flap(exports.Functor);
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.apFirst = 
/*#__PURE__*/
Apply.apFirst(exports.Apply);
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * Derivable from `Apply`.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.apSecond = 
/*#__PURE__*/
Apply.apSecond(exports.Apply);
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * Derivable from `Chain`.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.chainFirst = 
/*#__PURE__*/
Chain.chainFirst(exports.Chain);
/**
 * Less strict version of [`chainFirst`](#chainfirst)
 *
 * Derivable from `Chain`.
 *
 * @category combinators
 * @since 2.8.0
 */
exports.chainFirstW = exports.chainFirst;
/**
 * Less strict version of [`flatten`](#flatten).
 *
 * @category combinators
 * @since 2.11.0
 */
exports.flattenW = 
/*#__PURE__*/
exports.chainW(_function.identity);
/**
 * The `flatten` function is the conventional monad join operator. It is used to remove one level of monadic structure, projecting its bound argument into the outer level.
 *
 * Derivable from `Chain`.
 *
 * @example
 * import * as E from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(E.flatten(E.right(E.right('a'))), E.right('a'))
 * assert.deepStrictEqual(E.flatten(E.right(E.left('e'))), E.left('e'))
 * assert.deepStrictEqual(E.flatten(E.left('e')), E.left('e'))
 *
 * @category combinators
 * @since 2.0.0
 */
exports.flatten = exports.flattenW;
/**
 * Derivable from `Extend`.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(_function.identity);
/**
 * @category combinators
 * @since 2.10.0
 */
exports.fromOptionK = 
/*#__PURE__*/
FromEither.fromOptionK(exports.FromEither);
/**
 * @category combinators
 * @since 2.11.0
 */
exports.chainOptionK = 
/*#__PURE__*/
FromEither.chainOptionK(exports.FromEither, exports.Chain);
/**
 * @example
 * import * as E from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     E.right(1),
 *     E.filterOrElse(
 *       (n) => n > 0,
 *       () => 'error'
 *     )
 *   ),
 *   E.right(1)
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     E.right(-1),
 *     E.filterOrElse(
 *       (n) => n > 0,
 *       () => 'error'
 *     )
 *   ),
 *   E.left('error')
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     E.left('a'),
 *     E.filterOrElse(
 *       (n) => n > 0,
 *       () => 'error'
 *     )
 *   ),
 *   E.left('a')
 * )
 *
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = 
/*#__PURE__*/
FromEither.filterOrElse(exports.FromEither, exports.Chain);
/**
 * Less strict version of [`filterOrElse`](#filterorelse).
 *
 * @category combinators
 * @since 2.9.0
 */
exports.filterOrElseW = exports.filterOrElse;
/**
 * Returns a `Right` if is a `Left` (and vice versa).
 *
 * @category combinators
 * @since 2.0.0
 */
var swap = function (ma) { return (exports.isLeft(ma) ? exports.right(ma.left) : exports.left(ma.right)); };
exports.swap = swap;
/**
 * Less strict version of [`orElse`](#orelse).
 *
 * @category combinators
 * @since 2.10.0
 */
var orElseW = function (onLeft) { return function (ma) {
    return exports.isLeft(ma) ? onLeft(ma.left) : ma;
}; };
exports.orElseW = orElseW;
/**
 * Useful for recovering from errors.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.orElse = exports.orElseW;
// -------------------------------------------------------------------------------------
// interop
// -------------------------------------------------------------------------------------
/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Right`, if the value is nully use
 * the provided default as a `Left`.
 *
 * @example
 * import { fromNullable, left, right } from 'fp-ts/Either'
 *
 * const parse = fromNullable('nully')
 *
 * assert.deepStrictEqual(parse(1), right(1))
 * assert.deepStrictEqual(parse(null), left('nully'))
 *
 * @category interop
 * @since 2.0.0
 */
var fromNullable = function (e) { return function (a) {
    return a == null ? exports.left(e) : exports.right(a);
}; };
exports.fromNullable = fromNullable;
/**
 * Constructs a new `Either` from a function that might throw.
 *
 * See also [`tryCatchK`](#trycatchk).
 *
 * @example
 * import * as E from 'fp-ts/Either'
 *
 * const unsafeHead = <A>(as: ReadonlyArray<A>): A => {
 *   if (as.length > 0) {
 *     return as[0]
 *   } else {
 *     throw new Error('empty array')
 *   }
 * }
 *
 * const head = <A>(as: ReadonlyArray<A>): E.Either<Error, A> =>
 *   E.tryCatch(() => unsafeHead(as), e => (e instanceof Error ? e : new Error('unknown error')))
 *
 * assert.deepStrictEqual(head([]), E.left(new Error('empty array')))
 * assert.deepStrictEqual(head([1, 2, 3]), E.right(1))
 *
 * @category interop
 * @since 2.0.0
 */
var tryCatch = function (f, onThrow) {
    try {
        return exports.right(f());
    }
    catch (e) {
        return exports.left(onThrow(e));
    }
};
exports.tryCatch = tryCatch;
/**
 * Converts a function that may throw to one returning a `Either`.
 *
 * @category interop
 * @since 2.10.0
 */
var tryCatchK = function (f, onThrow) { return function () {
    var a = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        a[_i] = arguments[_i];
    }
    return exports.tryCatch(function () { return f.apply(void 0, a); }, onThrow);
}; };
exports.tryCatchK = tryCatchK;
/**
 * @category interop
 * @since 2.9.0
 */
var fromNullableK = function (e) {
    var from = exports.fromNullable(e);
    return function (f) { return _function.flow(f, from); };
};
exports.fromNullableK = fromNullableK;
/**
 * @category interop
 * @since 2.9.0
 */
var chainNullableK = function (e) {
    var from = exports.fromNullableK(e);
    return function (f) { return exports.chain(from(f)); };
};
exports.chainNullableK = chainNullableK;
/**
 * @category interop
 * @since 2.10.0
 */
exports.toUnion = 
/*#__PURE__*/
exports.foldW(_function.identity, _function.identity);
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Default value for the `onError` argument of `tryCatch`
 *
 * @since 2.0.0
 */
function toError(e) {
    return e instanceof Error ? e : new Error(String(e));
}
exports.toError = toError;
/**
 * @since 2.0.0
 */
var elem = function (E) { return function (a, ma) {
    return exports.isLeft(ma) ? false : E.equals(a, ma.right);
}; };
exports.elem = elem;
/**
 * Returns `false` if `Left` or returns the result of the application of the given predicate to the `Right` value.
 *
 * @example
 * import { exists, left, right } from 'fp-ts/Either'
 *
 * const gt2 = exists((n: number) => n > 2)
 *
 * assert.strictEqual(gt2(left('a')), false)
 * assert.strictEqual(gt2(right(1)), false)
 * assert.strictEqual(gt2(right(3)), true)
 *
 * @since 2.0.0
 */
var exists = function (predicate) { return function (ma) {
    return exports.isLeft(ma) ? false : predicate(ma.right);
}; };
exports.exists = exists;
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.9.0
 */
exports.Do = 
/*#__PURE__*/
exports.of(_.emptyRecord);
/**
 * @since 2.8.0
 */
exports.bindTo = 
/*#__PURE__*/
Functor.bindTo(exports.Functor);
/**
 * @since 2.8.0
 */
exports.bind = 
/*#__PURE__*/
Chain.bind(exports.Chain);
/**
 * @since 2.8.0
 */
exports.bindW = exports.bind;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = 
/*#__PURE__*/
Apply.apS(exports.Apply);
/**
 * @since 2.8.0
 */
exports.apSW = exports.apS;
// -------------------------------------------------------------------------------------
// sequence T
// -------------------------------------------------------------------------------------
/**
 * @since 2.11.0
 */
exports.ApT = exports.of(_.emptyReadonlyArray);
// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------
/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Applicative)`.
 *
 * @since 2.11.0
 */
var traverseReadonlyNonEmptyArrayWithIndex = function (f) { return function (as) {
    var e = f(0, _.head(as));
    if (exports.isLeft(e)) {
        return e;
    }
    var out = [e.right];
    for (var i = 1; i < as.length; i++) {
        var e_1 = f(i, as[i]);
        if (exports.isLeft(e_1)) {
            return e_1;
        }
        out.push(e_1.right);
    }
    return exports.right(out);
}; };
exports.traverseReadonlyNonEmptyArrayWithIndex = traverseReadonlyNonEmptyArrayWithIndex;
/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @since 2.11.0
 */
var traverseReadonlyArrayWithIndex = function (f) {
    var g = exports.traverseReadonlyNonEmptyArrayWithIndex(f);
    return function (as) { return (_.isNonEmpty(as) ? g(as) : exports.ApT); };
};
exports.traverseReadonlyArrayWithIndex = traverseReadonlyArrayWithIndex;
/**
 * @since 2.9.0
 */
exports.traverseArrayWithIndex = exports.traverseReadonlyArrayWithIndex;
/**
 * @since 2.9.0
 */
var traverseArray = function (f) { return exports.traverseReadonlyArrayWithIndex(function (_, a) { return f(a); }); };
exports.traverseArray = traverseArray;
/**
 * @since 2.9.0
 */
exports.sequenceArray = 
/*#__PURE__*/
exports.traverseArray(_function.identity);
/**
 * Use [`parse`](./Json.ts.html#parse) instead.
 *
 * @category constructors
 * @since 2.0.0
 * @deprecated
 */
function parseJSON(s, onError) {
    return exports.tryCatch(function () { return JSON.parse(s); }, onError);
}
exports.parseJSON = parseJSON;
/**
 * Use [`stringify`](./Json.ts.html#stringify) instead.
 *
 * @category constructors
 * @since 2.0.0
 * @deprecated
 */
var stringifyJSON = function (u, onError) {
    return exports.tryCatch(function () {
        var s = JSON.stringify(u);
        if (typeof s !== 'string') {
            throw new Error('Converting unsupported structure to JSON');
        }
        return s;
    }, onError);
};
exports.stringifyJSON = stringifyJSON;
/**
 * Use small, specific instances instead.
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
exports.either = {
    URI: exports.URI,
    map: _map,
    of: exports.of,
    ap: _ap,
    chain: _chain,
    reduce: _reduce,
    foldMap: _foldMap,
    reduceRight: _reduceRight,
    traverse: _traverse,
    sequence: exports.sequence,
    bimap: _bimap,
    mapLeft: _mapLeft,
    alt: _alt,
    extend: _extend,
    chainRec: _chainRec,
    throwError: exports.throwError
};
/**
 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
 *
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
exports.getApplySemigroup = 
/*#__PURE__*/
Apply.getApplySemigroup(exports.Apply);
/**
 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
exports.getApplyMonoid = 
/*#__PURE__*/
Applicative.getApplicativeMonoid(exports.Applicative);
/**
 * Use [`getApplySemigroup`](./Apply.ts.html#getapplysemigroup) instead.
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
var getValidationSemigroup = function (SE, SA) {
    return Apply.getApplySemigroup(exports.getApplicativeValidation(SE))(SA);
};
exports.getValidationSemigroup = getValidationSemigroup;
/**
 * Use [`getApplicativeMonoid`](./Applicative.ts.html#getapplicativemonoid) instead.
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
var getValidationMonoid = function (SE, MA) {
    return Applicative.getApplicativeMonoid(exports.getApplicativeValidation(SE))(MA);
};
exports.getValidationMonoid = getValidationMonoid;
/**
 * Use [`getApplicativeValidation`](#getapplicativevalidation) and [`getAltValidation`](#getaltvalidation) instead.
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
function getValidation(SE) {
    var ap = exports.getApplicativeValidation(SE).ap;
    var alt = exports.getAltValidation(SE).alt;
    return {
        URI: exports.URI,
        _E: undefined,
        map: _map,
        of: exports.of,
        chain: _chain,
        bimap: _bimap,
        mapLeft: _mapLeft,
        reduce: _reduce,
        foldMap: _foldMap,
        reduceRight: _reduceRight,
        extend: _extend,
        traverse: _traverse,
        sequence: exports.sequence,
        chainRec: _chainRec,
        throwError: exports.throwError,
        ap: ap,
        alt: alt
    };
}
exports.getValidation = getValidation;
});

var fold = Either.fold;
export { fold };
