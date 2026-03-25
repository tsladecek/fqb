import { FQB, NumericOperators, TextOperators } from "./fqb.min.js";

const shadow = unstyledInitialized.attachShadow({ mode: "open" });

function nodeFactory(elementType, innerText, style) {
  return () => {
    const el = document.createElement(elementType);
    if (innerText) {
      el.innerText = innerText;
    }

    if (style) {
      el.style = style;
    }
    return el;
  };
}

function inputFactory(type) {
  return () => {
    const el = document.createElement("input");
    el.type = type;
    return el;
  };
}

const nodes = {
  filterGroup: nodeFactory("div", "", "padding: 3px; border: 1px solid gray"),
  filterGroupContent: nodeFactory(
    "div",
    "",
    "padding-left: 10px; display: flex; gap: 5px; flex-direction: column",
  ),
  filterGroupHeaderAddFieldButton: nodeFactory("button", "ADD FIELD", ""),
  filterGroupHeaderAddGroupButton: nodeFactory("button", "ADD GROUP", ""),
  filterGroupHeaderRemoveButton: nodeFactory("button", "REMOVE", ""),
  filterGroupContentFieldRemoveButton: nodeFactory("button", "REMOVE", ""),
};

const cfg = {
  rootNode: shadow,
  nodes: nodes,
  attributes: [
    {
      name: "number field",
      input: inputFactory("number"),
      operators: NumericOperators,
    },
    {
      name: "text field",
      input: inputFactory("text"),
      operators: TextOperators,
    },
    {
      name: "color field",
      input: inputFactory("color"),
      operators: ["=", "!="],
    },
    {
      name: "date field",
      input: inputFactory("date"),
      operators: NumericOperators,
    },
  ],
};

function evaluateListener(qb, container) {
  const filters = qb.getFilters();
  const jsonString = JSON.stringify(filters, null, 2);
  const pre = document.createElement("pre");
  pre.textContent = jsonString;
  container.replaceChildren(pre);
}

const qb = new FQB(cfg);
qb.initializeFromFilters({
  condition: "and",
  children: [
    {
      attribute: "number field",
      operator: "=",
      value: "123",
    },
    {
      condition: "and",
      children: [
        {
          attribute: "text field",
          operator: "contains",
          value: "test text",
        },
      ],
    },
  ],
});

evaluateDefaultInitialized.addEventListener("click", () => {
  evaluateListener(qb, defaultInitializedQueryResult);
});
