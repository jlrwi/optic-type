/*jslint
    fudge
*/

import {
//test     identity,
//test     apply_with,
    compose,
    constant,
    converge,
    apply,
    flip,
    pipe,
    second
} from "@jlrwi/combinators";
import {
//test     log,
//test     exponent,
//test     array_map,
//test     multiply,
//test     add,
//test     equals,
    type_check,
    method
} from "@jlrwi/esfunctions";
//test import {
//test     object_dictionary_type,
//test     array_type,
//test     slm
//test } from "@jlrwi/es-static-types";

//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_name = "Optic";

// F* is the type module of the contents
// U and V are applicatives (containers)

// Semigroupoid :: <outer> -> <inner> -> F* -> (x->Fy) -> U<V<x>> -> U<V<Fy>>
const adt_compose = converge(compose);

const composeN = function (...optics) {
    const last_index = optics.length - 1;

// If list of fs is empty, return the input unchanged
    if (optics.length === 0) {
        return id;
    }

    const composer = function (idx = 0) {
        if (idx >= last_index) {
            return optics[idx];
        }

        return adt_compose(optics[idx])(composer(idx + 1));
    };

    return composer(0);
};

// An optic with no traversal, F is ignored
// The function applies to the whole input value, not its contents
// Category id :: F* => (Ux->Fy) => Ux => Fy
const id = constant(apply);

// Traversals operate on values that satisfy Applicative/Semigroup/Traversable
// F* must be an Applicative type module
// Take the type module first, then the args for .traverse()
// U* -> F* -> (x->Fy) -> Ux -> [Fy or F<Uy>]
const traversal = flip(method("traverse"));

// Lenses operate on values that have .get/.set methods
// F* must be a Functor type module
// U* -> i -> F* -> (Fx->Fy) -> U<Fx> -> [Fy or U<Fy>]
const lens = function (U) {
    return function lens_index(idx) {
// At this point we call it a lens - the following is implementation

        return function lens(F) {
            return compose(

// Receives the "full" pipe from below and runs U<Fx> through converge branches
                converge(
                    F.map
                )(
// mapping function that sets idx in U<Fx> to Fy
                    flip(U.set(idx))
                )
            )(

// (Fx->Fy) becomes the second component of this pipe
//     which then becomes the second branch of the above converge
//     which produces the value of type F that is mapped
//     pipe: U<Fx> -> Fx -> Fy
                pipe(U.get(idx))
            );
        };
    };
};

// Make an applicative out of a monoid
// .ap() is flipped because of the concat order in the .traverse() reducer
const monoidal_applicative = function (monoid) {
    return {
// this is necessary so traversal doesn't have to be in original type
        map: second,
        ap: flip(monoid.concat),
        of: monoid.empty
    };
};

const create = traversal;

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        compose: adt_compose,
        composeN,
        id,
        traversal,
        lens,
        monoidal_applicative,
        create,
        validate: type_check("function")
    });
};

//test const opticT = type_factory();
//test const input_type_1 = object_dictionary_type(slm.num_sum);
//test const input_type_3 = object_dictionary_type(
//test     array_type(array_type(slm.num_sum))
//test );

//test const dict_optics = array_map(jsc.literal)([
//test     opticT.traversal(slm.dict),
//test     opticT.lens(slm.dict)("a"),
//test     opticT.lens(slm.dict)("c"),
//test     opticT.lens(slm.dict)("d"),
//test     opticT.lens(slm.dict)("f"),
//test     opticT.lens(slm.dict)("g")
//test ]);

//test const list_optics = array_map(jsc.literal)([
//test     opticT.traversal(slm.array),
//test     opticT.lens(slm.array)(0),
//test     opticT.lens(slm.array)(1),
//test     opticT.lens(slm.array)(4),
//test     opticT.lens(slm.array)(7),
//test     opticT.lens(slm.array)(9)
//test ]);
//test const num_num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1),
//test     identity
//test ]);

//test const view = pipe(
//test     apply_with(monoidal_applicative(slm.num_sum))
//test )(
//test     apply_with(identity)
//test );
//test const set = apply_with(slm.primitive);

//test const predicate = function (functor) {
//test     return function (verdict) {
//test         return function ({left, right, compare_with, input}) {
//test             const f = jsc.wun_of(num_num_fxs)();
//test             const x = input();
//test             const result_left = left(functor)(f)(x);
//test             const result_right = right(functor)(f)(x);
//test
//test             if ((
//test                 result_left === undefined
//test             ) || (
//test                 result_right === undefined
//test             )) {
//test                 return;
//test             }
//test
//test             return verdict(compare_with(result_left)(result_right));
//test         };
//test     };
//test };

//test jsc.claim({
//test     name: "Lens law 1 - view result of set",
//test     predicate: function (verdict) {
//test         return function (position, a, store) {
//test             const position_lens = opticT.lens(slm.array)(position);
//test             return verdict(
//test                 equals(
//test                     view(
//test                         position_lens
//test                     )(
//test                         set(position_lens)(constant(a))(store)
//test                     )
//test                 )(
//test                     a
//test                 )
//test             );
//test         };
//test     },
//test     signature: [
//test         jsc.integer(0, 9),
//test         jsc.integer(),
//test         jsc.array(10, jsc.integer())
//test     ]
//test });
//test jsc.claim({
//test     name: "Lens law 2 - overwrite set",
//test     predicate: function (verdict) {
//test         return function (position, a, b, store) {
//test             const position_lens = opticT.lens(slm.array)(position);
//test             return verdict(
//test                 array_type(slm.num_sum).equals(
//test                     set(
//test                         position_lens
//test                     )(
//test                         constant(b)
//test                     )(
//test                         set(position_lens)(constant(a))(store)
//test                     )
//test                 )(
//test                     set(position_lens)(constant(b))(store)
//test                 )
//test             );
//test         };
//test     },
//test     signature: [
//test         jsc.integer(0, 9),
//test         jsc.integer(),
//test         jsc.integer(),
//test         jsc.array(10, jsc.integer())
//test     ]
//test });
//test jsc.claim({
//test     name: "Lens law 3 - identity set",
//test     predicate: function (verdict) {
//test         return function (position, store) {
//test             const position_lens = opticT.lens(slm.array)(position);
//test             return verdict(
//test                 array_type(slm.num_sum).equals(
//test                     set(
//test                         position_lens
//test                     )(
//test                         constant(view(position_lens)(store))
//test                     )(
//test                         store
//test                     )
//test                 )(
//test                     store
//test                 )
//test             );
//test         };
//test     },
//test     signature: [
//test         jsc.integer(0, 9),
//test         jsc.array(10, jsc.integer())
//test     ]
//test });

//test const test_roster_natural = adtTests({
//test     semigroupoid: {
//test         T: opticT,
//test         signature: {
//test             a: jsc.wun_of(dict_optics),
//test             b: jsc.wun_of(list_optics),
//test             c: jsc.wun_of(list_optics)
//test         },
//test         compare_with: input_type_3.equals,
//test         input: jsc.object(
//test             ["a", "b", "c", "d", "e", "f", "g"],
//test             jsc.array(10, jsc.array(10, jsc.array(10, jsc.integer())))
//test         ),
//test         predicate: predicate(slm.primitive)
//test     },
//test     category: {
//test         T: opticT,
//test         signature: {
//test             a: jsc.wun_of(dict_optics)
//test         },
//test         compare_with: input_type_1.equals,
//test         input: jsc.object(
//test             ["a", "b", "c", "d", "e", "f", "g"],
//test             jsc.integer()
//test         ),
//test         predicate: predicate(slm.primitive)
//test     }
//test });
//test const test_roster_const = adtTests({
//test     semigroupoid: {
//test         T: opticT,
//test         signature: {
//test             a: jsc.wun_of(dict_optics),
//test             b: jsc.wun_of(list_optics),
//test             c: jsc.wun_of(list_optics)
//test         },
//test         compare_with: equals,
//test         input: jsc.object(
//test             ["a", "b", "c", "d", "e", "f", "g"],
//test             jsc.array(10, jsc.array(10, jsc.array(10, jsc.integer())))
//test         ),
//test         predicate: predicate(monoidal_applicative(slm.num_sum))
//test     },
//test     category: {
//test         T: opticT,
//test         signature: {
//test             a: jsc.wun_of(dict_optics)
//test         },
//test         compare_with: equals,
//test         input: jsc.object(
//test             ["a", "b", "c", "d", "e", "f", "g"],
//test             jsc.integer()
//test         ),
//test         predicate: predicate(monoidal_applicative(slm.num_sum))
//test     }
//test });

//test test_roster_natural.forEach(jsc.claim);
//test test_roster_const.forEach(jsc.claim);
//test jsc.check({
//test     on_report: log
//test });

export default Object.freeze(type_factory);