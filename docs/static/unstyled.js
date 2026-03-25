import { FQB, NumericOperators, TextOperators } from "./fqb.min.js";

const shadow = unstyled.attachShadow({ mode: "open" });

function nodeFactory(elementType, innerText) {
  return () => {
    const el = document.createElement(elementType);
    el.innerText = innerText;
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
  filterGroupHeaderAddFieldButton: nodeFactory("button", "ADD FIELD"),
  filterGroupHeaderAddGroupButton: nodeFactory("button", "ADD GROUP"),
  filterGroupHeaderRemoveButton: nodeFactory("button", "REMOVE"),
  filterGroupContentFieldRemoveButton: nodeFactory("button", "REMOVE"),
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
evaluateDefault.addEventListener("click", () => {
  evaluateListener(qb, defaultQueryResult);
});
