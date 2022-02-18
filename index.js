/*jslint
    fudge
*/

import {
    compose,
    constant,
    converge,
    apply,
    flip,
    pipe,
    second
} from "@jlrwi/combinators";
import {
    type_check,
    method
} from "@jlrwi/esfunctions";

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

export default Object.freeze(type_factory);
