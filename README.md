# Optic Type

The optic type contains the tools to create and compose lenses and traversals for the purpose of targeting and operating on nested collections of data.

Optics are inefficient when used singly - it would be better to use `.get()`/`.set()` or `.map()`/`.reduce()` methods for single-level operations. The power of optics comes when they are composed to operate on multi-level data collections. Composition of optics enables discrete targeting of data inside a nested collection. 

## Optics
There are two types of optics: traversals and lenses. In their most basic form, a traversal can map over an applicative while a lens can retrieve or set the value at a specific location in an applicative.

### Traversals
A traversal is the instantiation of an Applicative's traverse method, enabling operations on the contents. 


### Lenses
A lens is a functional pointer to a location in an Applicative. It uses the `.get()` and `.set()` methods of an Applicative type module.

### Type signatures
Notice the similarity between the full type signature for a traversal:
U -> V -> (x->Vy) -> Ux -> V<Uy> (or just Vy)

and that for a lens:
U -> index -> V -> (Vx->Vy) -> U<Vx> -> U<Vy> (or just Vy)

Note that for lenses U<Vy> is only (potentially) different from U<Vx> at the specified index.

## Category theory

The Optic type defines a Category in [curried-static-land](https://github.com/jlrwi/curried-static-land). In this category, objects are Applicatives (usually Applicatives of Applicatives) and morphisms are optics (lenses or traversals). 

## Facets of control

If you conceive of an optic as a machine that operates on an applicative, there are three levers that control its operation.
1. The optic itself: a lens, a traversal, or a composition of these. The optic defines the scope of activity for any operations.
2. The function: it operates on targeted or traversed values.
3. The functor type module: it determines how values resulting from the function are aggregated and what kind of data structure is returned. 

## Type Module Methods

### .traversal(T)
Create a traversal function for the type module `T`.

### .lens(T)(target)
Create a lens function pointing to `target` in values with type module `T`.

### .create(T)
Synonymous with `.traversal()`.

### .compose(optic-outer)(optic-inner)
Compose two optics for an Applicative of Applicatives.

### .composeN(layers...)
Multi-level composition of optics working from outside-in.

### .identity()
An optic that does not traverse, but applies the function to the entire Applicative, ignoring the Functor.

### .monoidal_applicative(T)
Takes a Monoidal type module and returns an applicative type module, where the `.of()` method returns an empty value of the monoid, the `.map()` method makes no changes, and the `.ap()` method applies the monoid's `.concat()` method.

## Usage

### Instantiation

```
import optic_type from "@jlrwi/optic-type";
const optic_type_module = optic_type();
```

### Application

Every optic takes the following arguments:

```
optic(T)(f)(U)
```

where
- T is a Functor type module
- f is a unary function that returns a value of type T
- U is an applicative that the optic will operate on

### Differences between lens and traversal

## The function
The function passed to a lens should take and return values of the same functor, while the function passed to a traversal may take other types of values as long as it returns values of the specified functor type.

## The Functor type module

For a lens, the function operates on the target of the lens and the result is sent to the functor's `.map()` method, which assigns the new value to the targeted location. No other methods of the functor type module are used.

A traversal utilizes the `.traverse()` method of the applicative type module, applying the function to each of the applicative value's to produce values of the Functor's type. These are aggregated into a value, with the functor type module's `.of()` method initializing the value and its `.ap()` and `.map()` methods doing the aggregating. Normally, the resulting value is of the same applicative type as the input. However, customizing the functor type module can create tremendous flexibility, such as when the `.map()` method is made inert by ignoring its function parameter so that `.ap()` can produce results that are not of the original applicative type. 

## References
[Partial Lenses Implementation](https://calmm-js.github.io/partial.lenses/implementation.html)
Eric Elliot, ["Lenses: Composable Getters and Setters for Functional Programming"](https://medium.com/javascript-scene/lenses-b85976cb0534)