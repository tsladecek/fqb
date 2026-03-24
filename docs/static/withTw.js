import { FQB } from "./fqb.min.js";

function nodeFactory(elementType, className, innerText) {
  return () => {
    const el = document.createElement(elementType);
    el.className = className;
    if (innerText) {
      el.innerText = innerText;
    }
    return el;
  };
}

const btnClass =
  "px-1 rounded hover:disabled:cursor-default hover:cursor-pointer disabled:opacity-25 ";

const nodes = {
  container: nodeFactory("div", "w-full", ""),

  filterGroup: nodeFactory(
    "div",
    "border border-gray-300 p-1 dashed rounded-md border-dashed flex flex-col gap-2",
    "",
  ),
  filterGroupHeader: nodeFactory("div", "flex gap-1", ""),
  filterGroupContent: nodeFactory("div", "flex flex-col gap-1 pl-3", ""),

  filterGroupHeaderConditionSelect: nodeFactory(
    "select",
    "px-1 border border-gray-300 rounded-md",
    "",
  ),
  filterGroupHeaderConditionOption: nodeFactory("option", "", ""),
  filterGroupHeaderAddFieldButton: nodeFactory(
    "button",
    btnClass + "bg-green-700 text-white hover:bg-green-800",
    "ADD FIELD",
  ),
  filterGroupHeaderAddGroupButton: nodeFactory(
    "button",
    btnClass + "bg-blue-700 text-white hover:bg-blue-800",
    "ADD GROUP",
  ),
  filterGroupHeaderRemoveButton: nodeFactory(
    "button",
    btnClass + "bg-red-800 text-white hover:bg-red-900",
    "REMOVE",
  ),

  filterGroupContentFieldContainer: nodeFactory(
    "div",
    "flex gap-1 grid grid-cols-4",
    "",
  ),
  filterGroupContentFieldInput: nodeFactory(
    "input",
    "border border-gray-300 px-1 rounded-md",
    "",
  ),
  filterGroupContentFieldAttributeSelect: nodeFactory(
    "select",
    "border border-gray-300 px-1 rounded-md",
    "",
  ),
  filterGroupContentFieldAttributeOption: nodeFactory(
    "option",
    "border border-gray-300 px-1 rounded-md",
    "",
  ),
  filterGroupContentFieldOperatorSelect: nodeFactory(
    "select",
    "border border-gray-300 px-1 rounded-md",
    "",
  ),
  filterGroupContentFieldOperatorOption: nodeFactory(
    "option",
    "border border-gray-300 px-1 rounded-md",
    "",
  ),
  filterGroupContentFieldRemoveButton: nodeFactory(
    "button",
    btnClass + "bg-red-800 text-white hover:bg-red-900",
    "REMOVE",
  ),
};
const cfg = {
  rootNode: tailwindStyled,
  nodes: nodes,
  attributes: [
    { name: "number field", type: "number" },
    { name: "text field", type: "string" },
    { name: "password field", type: "password" },
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
evaluateTailwind.addEventListener("click", () => {
  evaluateListener(qb, tailwindQueryResult);
});
