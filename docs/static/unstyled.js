import { FQB } from "./fqb.min.js";

const shadow = unstyled.attachShadow({ mode: "open" });

function nodeFactory(elementType, innerText) {
  return () => {
    const el = document.createElement(elementType);
    el.innerText = innerText;
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
    { name: "number field", type: "number" },
    { name: "text field", type: "string" },
    { name: "color field", type: "color" },
    { name: "date field", type: "date" },
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
