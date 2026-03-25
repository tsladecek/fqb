# Filter Query Builder (FQB)

A minimal, tiny, **dependency-free** script that adds query builder functionality to provided components. It is heavily inspired by [jQuery Query Builder](https://querybuilder.js.org/).

See the [examples](https://tsladecek.github.io/fqb/) for more info.

## Installation

Download the `min.js` file from the [releases](https://github.com/tsladecek/fqb/releases) page and add it to your source code. Then, import the `FQB` class and set up the configuration:

```js
import { FQB } from "./fqb.min.js";

const config = {
    rootNode: rootNode, // The node to which the component will be attached
    attributes: [ // must satisfy the Attribute interface
        { name: "attr1" }, // minimal, uses default set of operators and text input
        { name: "attr2", operators: ["=", "!="], input: function() {
            const el = document.createElement("input")
            el.type = "number"
            return el
        }}
    ],
    nodes: { // Optional: specifications for nodes used for rendering: must satisfy the Node interface
      filterGroupHeaderAddFieldButton: function() {
          const el = document.createElement("button")
          el.innerText = "Add Field"
          return el
      }
    },
}

const fqb = new FQB(config);
```

This will attach the QueryBuilder to the provided `rootNode`. By design, the nodes are **unstyled**; however, you can easily override them.

The complete list of nodes is available in [main.ts](https://github.com/tsladecek/fqb/blob/main/src/main.ts).

## API

### getFilters()

The applied filters can be requested at any point with the `getFilters` method of the FQB class.
This returns a json of followind type:

```ts
export interface AppliedFilter {
  attribute: string;
  operator: string;
  value: number | string | boolean;

  // relevant for filterGroup
  condition?: Condition; // "and" / "or"
  children?: AppliedFilter[];
}
```

### initializeFromFilters(filter)

When you already have the `AppliedFilter` json (maybe from a URL query param), you can initialize the
UI with the `initializeFromFilters` function

```js
const filters = {
  "condition": "and",
  "children": [
    {
      "attribute": "number field",
      "operator": "=",
      "value": "123"
    },
    {
      "condition": "and",
      "children": [
        {
          "attribute": "text field",
          "operator": "=",
          "value": "test text"
        }
      ]
    }
  ]
}

const fqb = new FQB(config)
fqb.initializeFromFilters(filters)
```
