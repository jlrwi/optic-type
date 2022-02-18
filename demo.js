/*jslint
    fudge, node
*/

import {
    slm
} from "@jlrwi/es-static-types";
import {
    identity
} from "@jlrwi/combinators";
import {
    negate,
    prop,
    method,
    array_reverse
} from "@jlrwi/esfunctions";
import optic_type from "./index.js";

const optic = optic_type();

// type modules
const list = slm.array;
const dict = slm.dict;

// Optics
const lens_second = optic.lens(list)(1);
const lens_third = optic.lens(list)(2);
const lens_x = optic.lens(dict)("x");
const traverse_list = optic.traversal(list);
const traverse_dict = optic.traversal(dict);

const lens_2nd_x = optic.compose(lens_second)(lens_x);
const lens_triple = optic.composeN(lens_third, lens_x, lens_second);
const traverse_x = optic.compose(traverse_list)(lens_x);
const traverse_third = optic.compose(lens_third)(traverse_dict);

// Functors
const primitive = slm.primitive;
const primitive_const = optic.monoidal_applicative(slm.primitive);
const num_const = optic.monoidal_applicative(slm.num_sum);
const list_const = optic.monoidal_applicative(slm.array);
const str_const = optic.monoidal_applicative(slm.str);

// Test data
const list_a = [9, 4, 7, 6, 47, 18, 5, 21];
const list_b = [
    {x: 9, y: 6},
    {x: 4, y: 13},
    {x: 7, y: 6},
    {x: 37, y: 5}
];
const list_c = [
    {x: [3, 5, 9], y: 91},
    {x: [11, 17, 21], y: 13},
    {x: [19, 31, 97], y: 6},
    {x: [23, 47, 53], y: 5}
];
const list_d = [
    ["a", "xy"],
    ["g", "op"],
    ["z", "ef"]
];

// Calling a lens with a "natural" functor and identity fx is the same as
// Calling a traversal with a "natural" functor and the identity fx
console.log(
    "traverse_list(primitive)(identity):",
    traverse_list(primitive)(identity)(list_a)
);
console.log(
    "lens_second(primitive)(identity):",
    lens_second(primitive)(identity)(list_a)
);

// Calling a traversal with a "natural" functor and function changes whole list
// Calling a lens with a "natural" functor and a function is like "set"
console.log(
    "\ntraverse_list(primitive)(negate):",
    traverse_list(primitive)(negate)(list_a)
);
console.log(
    "lens_second(primitive)(negate):",
    lens_second(primitive)(negate)(list_a)
);

// Can traverse with an applicative constant functor, in this case concat is sum
// but calling a lens with a constant functor and identity functions as "get"
console.log(
    "\ntraverse_list(num_const)(identity):",
    traverse_list(num_const)(identity)(list_a)
);
console.log(
    "lens_second(num_const)(identity):",
    lens_second(num_const)(identity)(list_a)
);

console.log(
    "\ntraverse_list(num_const)(negate):",
    traverse_list(num_const)(negate)(list_a)
);
console.log(
    "lens_second(num_const)(negate):",
    lens_second(num_const)(negate)(list_a)
);

// Nothing is traversed with identity & functor is ignored.
// Function would have to apply to whole
console.log(
    "\noptic.id(primitive)(identity):",
    optic.id(primitive)(identity)(list_a)
);
console.log(
    "optic.id(primitive_const)(prop(\"length\")):",
    optic.id(primitive_const)(prop("length"))(list_a)
);


// 3-deep lens, set and get
console.log("\n3-deep lens, set and get/alter");
console.log(
    "Set - lens_triple(primitive)(negate):",
    lens_triple(primitive)(negate)(list_c)
);
console.log(
    "Get - lens_triple(primitive_const)(negate):",
    lens_triple(primitive_const)(negate)(list_c)
);

// Use an applicative/monoidal const to act on the traversed portion
console.log("\nComposing lens and traversal = targeted traversal");
console.log(
    "traverse_x(primitive)(negate):",
    traverse_x(primitive)(negate)(list_b)
);
console.log(
    "traverse_x(num_const)(negate):",
    traverse_x(num_const)(negate)(list_b)
);
console.log(
    "traverse_x(list_const)(negate):",
    traverse_x(list_const)(negate)(list_b)
);
console.log(
    "\ntraverse_third(primitive)(negate):",
    traverse_third(primitive)(negate)(list_b)
);
console.log(
    "traverse_third(num_const)(negate):",
    traverse_third(num_const)(negate)(list_b)
);
console.log(
    "\ntraverse_third(str_const)(method(\"toUpperCase\"):",
    traverse_third(str_const)(method("toUpperCase")())(list_d)
);
console.log(
    "\ntraverse_x(list_const)(array_reverse):",
    traverse_x(list_const)(array_reverse)(list_c)
);
console.log(
    "lens_2nd_x(list)(array_reverse):",
    lens_2nd_x(list)(array_reverse)(list_c)
);
console.log(
    "lens_2nd_x(list_const)(array_reverse):",
    lens_2nd_x(list_const)(array_reverse)(list_c)
);

/*
console.log("Break all the lists apart (and reverse)...");
console.log("then give back all permutations (3**4 === 81!)");
console.log(
    "traverse_x(list)(array_reverse):",
    traverse_x(list)(array_reverse)(list_c)
);
*/