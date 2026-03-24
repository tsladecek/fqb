import { FQB } from "./fqb.min.js";

function nodeFactory(elementType, className, innerText) {
  return () => {
    const el = document.createElement(elementType);
    el.className = className;
    if (innerText) {
      el.innerHTML = innerText;
    }
    return el;
  };
}

const btnBase =
  "inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider ";

const inputBase =
  "block w-full px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ";

const nodes = {
  container: nodeFactory("div", "space-y-4", ""),

  filterGroup: nodeFactory(
    "div",
    "bg-gray-50/50 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col gap-4 transition-all duration-300 hover:shadow-md",
    "",
  ),
  filterGroupHeader: nodeFactory(
    "div",
    "flex flex-wrap items-center gap-3 pb-3 border-b border-gray-200/60",
    "",
  ),
  filterGroupContent: nodeFactory(
    "div",
    "flex flex-col gap-3 pl-4 border-l-2 border-gray-200/50 ml-1",
    "",
  ),

  filterGroupHeaderConditionSelect: nodeFactory(
    "select",
    inputBase + "max-w-[100px] font-bold uppercase text-indigo-600",
    "",
  ),
  filterGroupHeaderConditionOption: nodeFactory("option", "font-sans", ""),
  filterGroupHeaderAddFieldButton: nodeFactory(
    "button",
    btnBase +
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-500 border border-emerald-200",
    "Add Field",
  ),
  filterGroupHeaderAddGroupButton: nodeFactory(
    "button",
    btnBase +
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500 border border-indigo-200",
    "Add Group",
  ),
  filterGroupHeaderRemoveButton: nodeFactory(
    "button",
    btnBase +
      "bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-500 border border-rose-200 ml-auto",
    "Remove",
  ),

  filterGroupContentFieldContainer: nodeFactory(
    "div",
    "grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_30px] gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm",
    "",
  ),
  filterGroupContentFieldInput: nodeFactory("input", inputBase, ""),
  filterGroupContentFieldAttributeSelect: nodeFactory(
    "select",
    inputBase + "font-medium",
    "",
  ),
  filterGroupContentFieldAttributeOption: nodeFactory("option", "", ""),
  filterGroupContentFieldOperatorSelect: nodeFactory(
    "select",
    inputBase + "font-medium text-gray-500",
    "",
  ),
  filterGroupContentFieldOperatorOption: nodeFactory("option", "", ""),
  filterGroupContentFieldRemoveButton: nodeFactory(
    "button",
    btnBase +
      "bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 focus:ring-rose-500 border border-gray-200 hover:border-rose-200 justify-center",
    "X",
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
  pre.className = "whitespace-pre-wrap break-all";
  pre.textContent = jsonString;
  container.replaceChildren(pre);
}

const qb = new FQB(cfg);
evaluateTailwind.addEventListener("click", () => {
  evaluateListener(qb, tailwindQueryResult);
});
