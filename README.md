# Filter Query Builder (FQB)

A minimal, tiny, **dependency-free** script that adds query builder functionality to provided components. It is heavily inspired by [jQuery Query Builder](https://querybuilder.js.org/).

See the [examples](https://tsladecek.github.io/fqb/) for more info.

## Installation

Download the `min.js` file from the [releases](https://github.com/tsladecek/fqb/releases) page and add it to your source code. Then, import the `FQB` class and set up the configuration:

```js
import { FQB } from "./fqb.min.js";

const config = {
    rootNode: rootNode, // The node to which the component will be attached
    nodes: {},          // Specifications for nodes used for rendering
    attributes: [],     // A list of attributes used as filters
}

const fqb = new FQB(config);
```

This will attach the QueryBuilder to the provided `rootNode`. By design, the nodes are **unstyled**; however, you can easily override them.

**Example:** To make the `FieldRemoveButton` display the text "REMOVE":

```js
const nodes = {
    filterGroupContentFieldRemoveButton: () => {
        const removeButton = document.createElement("button");
        removeButton.innerText = "REMOVE";
        return removeButton;
    }
}
```

The complete list of nodes is available in [main.ts](https://github.com/tsladecek/fqb/blob/main/src/main.ts).
