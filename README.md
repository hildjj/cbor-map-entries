# Map entries for CBOR

This document specifies a tag for a Map datatype in the Concise Binary Object Representation ([CBOR](https://tools.ietf.org/html/rfc8949)).  

```
Tag: 279 (array)
Data Item: array
Semantics: array of alternating keys and values
Reference: http://github.com/hildjj/cbor-map-entries
Contact: Joe Hildebrand <joe-ietf@cursive.net>
```

## Introduction

Although CBOR has support for generic Maps (Major Type 5), some implementation languages (such as ECMAScript) have two different types they might use to hold the information, depending on whether all of the keys are strings or not.  This makes round-tripping between CBOR and native representations more difficult, and adds complexity in a generic decoder.

## Semantics

Apply tag 279 to a CBOR array (Major Type 4), which of alternating keys and values.  There must be an even number of items in the array or the tag is not well-formed.  This is the same wire encoding as a CBOR map (Major Type 5), but prefixed with tag 279.

All other semantics for CBOR Map (Major Type 5) apply.  For instance, duplicate keys shall be handled as in [RFC 8949, section 5.6](https://tools.ietf.org/html/rfc8949#section-5.6)

## Rationale

A generic CBOR processor might be written in such a way that it processes tags by first decoding the data item inside the tag, then applying a tag-specific function to the results to get a final value.  If the data item is a Map already, then either the complexity we're trying to avoid has already happened, or information might be lost by converting the key into a string before the tag function is called.

The current approach allows a completely generic decoder to preserve all needed information before handing off to a tag function.

## Examples

For a Map whose key => value mappings are `{ 1 => 2, 3 => 4 }`, in JavaScript, one would write:

```js
new Map([ [1, 2], [3, 4] ])
```

This would produce the following CBOR:

```
  d9                -- Tag, number in next 2 bytes
    0117            -- Tag #279
      84            -- Array, 4 items
        01          -- [0], 1
        02          -- [1], 2
        03          -- [2], 3
        04          -- [3], 4
0xd901178401020304
```

Or, in diagnostic notation: `279([1, 2, 3, 4])`

## Other potential approaches

  Although tag 259 has already been allocated in an attempt to fix this problem, the data item [selected](https://github.com/shanewholloway/js-cbor-codec/blob/master/docs/CBOR-259-spec--explicit-maps.md) for that tag was Map (Major Type 5), which does not reduce the complexity needed in a processor without special handling.

For JavaScript programmers `[[key, value] ...]` would make more sense so that the [Map constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map) could be called directly, but that requires more bytes to encode, adds complexity for non-JavaScript programmers, and doesn't lend itself as easily to reusing the semantics of the CBOR Map (Major Type 5).

## Acknowledgements

Thanks to Shane Holloway for understanding the need for this tag early, and putting tag 259 in place.
