interface nodes {
  container: () => HTMLDivElement;

  filterGroup: () => HTMLDivElement;
  filterGroupHeader: () => HTMLDivElement;
  filterGroupContent: () => HTMLDivElement;

  filterGroupHeaderAndOrSelect: () => HTMLSelectElement;
  filterGroupHeaderAndOrOption: () => HTMLOptionElement;
  filterGroupHeaderAddFieldButton: () => HTMLButtonElement;
  filterGroupHeaderAddGroupButton: () => HTMLButtonElement;
  filterGroupHeaderRemoveButton: () => HTMLButtonElement;

  filterGroupFieldContainer: () => HTMLDivElement;
  filterGroupFieldInput: () => HTMLInputElement;
  filterGroupFieldAttributeSelect: () => HTMLSelectElement;
  filterGroupFieldAttributeOption: () => HTMLOptionElement;
  filterGroupFieldOperatorSelect: () => HTMLSelectElement;
  filterGroupFieldOperatorOption: () => HTMLOptionElement;
  filterGroupFieldRemoveButton: () => HTMLButtonElement;
}

const classPrefix = "queryBuilder";

function elementFactory<K extends keyof HTMLElementTagNameMap>(
  type: K,
  className: string,
  provided?: () => HTMLElementTagNameMap[K],
): () => HTMLElementTagNameMap[K] {
  return () => {
    let element = document.createElement(type);
    if (provided) {
      element = provided();
    }

    element.classList.add(`${classPrefix}${className}`);
    return element;
  };
}

function newNodes(nodes?: nodes): nodes {
  return {
    container: elementFactory("div", "Container", nodes?.container),

    // FilterGroup
    filterGroup: elementFactory("div", "FilterGroup", nodes?.filterGroup),
    filterGroupHeader: elementFactory(
      "div",
      "FilterGroupHeader",
      nodes?.filterGroupHeader,
    ),
    filterGroupContent: elementFactory(
      "div",
      "FilterGroupContent",
      nodes?.filterGroupContent,
    ),

    // FilterGroupHeader
    filterGroupHeaderAndOrSelect: elementFactory(
      "select",
      "HeaderAndOrSelect",
      nodes?.filterGroupHeaderAndOrSelect,
    ),
    filterGroupHeaderAndOrOption: elementFactory(
      "option",
      "HeaderAndOrOption",
      nodes?.filterGroupHeaderAndOrOption,
    ),
    filterGroupHeaderAddFieldButton: elementFactory(
      "button",
      "HeaderAddFieldButton",
      nodes?.filterGroupHeaderAddFieldButton,
    ),
    filterGroupHeaderAddGroupButton: elementFactory(
      "button",
      "HeaderAddGroupButton",
      nodes?.filterGroupHeaderAddGroupButton,
    ),
    filterGroupHeaderRemoveButton: elementFactory(
      "button",
      "HeaderRemoveButton",
      nodes?.filterGroupHeaderRemoveButton,
    ),

    // FilterGroupContent - Field
    filterGroupFieldContainer: elementFactory(
      "div",
      "FieldContainer",
      nodes?.filterGroupFieldContainer,
    ),
    filterGroupFieldInput: elementFactory(
      "input",
      "FieldInput",
      nodes?.filterGroupFieldInput,
    ),
    filterGroupFieldAttributeSelect: elementFactory(
      "select",
      "FieldSelect",
      nodes?.filterGroupFieldAttributeSelect,
    ),
    filterGroupFieldAttributeOption: elementFactory(
      "option",
      "FieldOption",
      nodes?.filterGroupFieldAttributeOption,
    ),
    filterGroupFieldOperatorSelect: elementFactory(
      "select",
      "FieldSelect",
      nodes?.filterGroupFieldOperatorSelect,
    ),
    filterGroupFieldOperatorOption: elementFactory(
      "option",
      "FieldOption",
      nodes?.filterGroupFieldOperatorOption,
    ),
    filterGroupFieldRemoveButton: elementFactory(
      "button",
      "FieldRemoveButton",
      nodes?.filterGroupFieldRemoveButton,
    ),
  };
}

const attributeTypes = [
  "number",
  "text",
  "month",
  "date",
  "datetime-local",
  "color",
  "email",
  "password",
  "time",
  "tel",
  "url",
  "week",
] as const;
type attributeType = (typeof attributeTypes)[number];

const filterOperators = ["=", "!=", "<", "<=", ">", ">=", "in", "not in"];
type filterOperator = (typeof filterOperators)[number];

interface attribute {
  name: string;
  type: attributeType;
}

interface config {
  rootNode: Node;
  nodes?: nodes;
  attributes: attribute[];
}

interface appliedFilter {
  attribute: attribute;
  filterType: filterOperator;
  value: number | string | boolean;

  children: appliedFilter[];
}

class qb {
  cfg: config;
  filters: appliedFilter[] = [];

  // elements
  container: Node;
  nodes: nodes;

  constructor(cfg: config) {
    if (!cfg.rootNode) {
      this.error("root node not provided, or does not exist");
    }

    if (cfg.attributes.length === 0) {
      cfg.attributes = [];
    }

    this.cfg = cfg;
    this.nodes = newNodes(cfg.nodes);
    this.container = this.newContainer();
  }

  getFilters(): appliedFilter[] {
    return this.filters;
  }

  private error(msg: string) {
    throw new Error(`queryBuilder: ${msg}`);
  }

  private newContainer(): Node {
    const container = this.nodes.container();
    this.cfg.rootNode.appendChild(container);

    const filterGroup = this.newFilterGroup(false, container);
    container.appendChild(filterGroup);

    return container;
  }

  private newFilterGroup(removable: boolean, parent: Node): Node {
    const filterGroupContainer = this.newFilterGroupContainer();
    const filterGroupHeader = this.newFilterGroupHeader();
    const filterGroupContent = this.newFilterGroupContent();

    filterGroupContainer.appendChild(filterGroupHeader);
    filterGroupContainer.appendChild(filterGroupContent);

    // construct header
    const andOr = this.newFilterGroupHeaderAndOr();
    const addField = this.newFilterGroupHeaderAddField();
    const addGroup = this.newFilterGroupHeaderAddGroup();
    const remove = this.newFilterGroupHeaderRemove(removable);

    filterGroupHeader.appendChild(andOr);
    filterGroupHeader.appendChild(addField);
    filterGroupHeader.appendChild(addGroup);
    filterGroupHeader.appendChild(remove);

    addField.addEventListener("click", () => {
      const fgf = this.newFilterGroupField(filterGroupContent);
      filterGroupContent.appendChild(fgf);
    });

    remove.addEventListener("click", () => {
      parent.removeChild(filterGroupContainer);
    });

    addGroup.addEventListener("click", () => {
      const g = this.newFilterGroup(true, filterGroupContent);
      filterGroupContent.appendChild(g);
    });

    return filterGroupContainer;
  }

  private newFilterGroupContainer(): Node {
    const filterGroup = this.nodes.filterGroup();
    return filterGroup;
  }

  private newFilterGroupContent(): Node {
    const filterGroupContent = this.nodes.filterGroupContent();
    return filterGroupContent;
  }

  private newFilterGroupField(parent: Node): Node {
    const container = this.nodes.filterGroupFieldContainer();

    // attribute select
    const selectAttribute = this.nodes.filterGroupFieldAttributeSelect();
    for (const opt of this.cfg.attributes) {
      const option = this.nodes.filterGroupFieldAttributeOption();
      option.value = opt.name;
      option.innerText = opt.name;
      selectAttribute.appendChild(option);
    }

    // type select
    const selectOperator = this.nodes.filterGroupFieldOperatorSelect();

    for (const opt of filterOperators) {
      const option = this.nodes.filterGroupFieldOperatorOption();
      option.value = opt;
      option.innerText = opt;
      selectOperator.appendChild(option);
    }

    // input
    const input = this.nodes.filterGroupFieldInput();

    function setInputFromSelect(cfg: config, attrName: string) {
      let at = "text";

      const attribute = cfg.attributes.find((a) => a.name === attrName);
      if (attribute) {
        if (attributeTypes.includes(attribute.type)) {
          at = attribute.type;
        }
      }

      input.type = at;
    }

    setInputFromSelect(this.cfg, selectAttribute.value);

    selectAttribute.addEventListener("change", (e) => {
      if (e?.target) {
        const t = e.target as HTMLSelectElement;
        setInputFromSelect(this.cfg, t.value);
      }
    });

    // remove
    const remove = this.nodes.filterGroupFieldRemoveButton();
    remove.addEventListener("click", () => {
      parent.removeChild(container);
    });

    container.appendChild(selectAttribute);
    container.appendChild(selectOperator);
    container.appendChild(input);
    container.appendChild(remove);

    return container;
  }

  private newFilterGroupHeader(): Node {
    const filterGroupHeader = this.nodes.filterGroupHeader();
    return filterGroupHeader;
  }

  private newFilterGroupHeaderAddField(): Node {
    const btn = this.nodes.filterGroupHeaderAddFieldButton();
    return btn;
  }

  private newFilterGroupHeaderAddGroup(): Node {
    const btn = this.nodes.filterGroupHeaderAddGroupButton();
    return btn;
  }

  private newFilterGroupHeaderRemove(removable: boolean): Node {
    const btn = this.nodes.filterGroupHeaderRemoveButton();
    btn.disabled = !removable;
    return btn;
  }

  private newFilterGroupHeaderAndOr(): Node {
    const andOr = this.nodes.filterGroupHeaderAndOrSelect();

    for (const opt of ["and", "or"]) {
      const option = this.nodes.filterGroupHeaderAndOrOption();
      option.value = opt;
      option.innerText = opt;
      andOr.appendChild(option);
    }

    return andOr;
  }
}

export function queryBuilder(cfg: config): qb {
  const q = new qb(cfg);
  return q;
}
