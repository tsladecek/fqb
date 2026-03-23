interface nodes {
  container: () => HTMLDivElement;

  filterGroup: () => HTMLDivElement;
  filterGroupHeader: () => HTMLDivElement;
  filterGroupContent: () => HTMLDivElement;

  filterGroupHeaderConditionSelect: () => HTMLSelectElement;
  filterGroupHeaderConditionOption: () => HTMLOptionElement;
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

    element.classList.add(`${className}`);
    return element;
  };
}

// Constants
const ClassContainer = `${classPrefix}Container`;
const ClassFilterGroup = `${classPrefix}FilterGroup`;
const ClassFilterGroupHeader = `${classPrefix}FilterGroupHeader`;
const ClassFilterGroupContent = `${classPrefix}FilterGroupContent`;

// Header Constants
const ClassFilterGroupHeaderConditionSelect = `${classPrefix}FilterGroupHeaderHeaderConditionSelect`;
const ClassFilterGroupHeaderConditionOption = `${classPrefix}FilterGroupHeaderHeaderConditionOption`;
const ClassFilterGroupHeaderAddFieldButton = `${classPrefix}FilterGroupHeaderHeaderAddFieldButton`;
const ClassFilterGroupHeaderAddGroupButton = `${classPrefix}FilterGroupHeaderHeaderAddGroupButton`;
const ClassFilterGroupHeaderRemoveButton = `${classPrefix}FilterGroupHeaderHeaderRemoveButton`;

// Field Constants
const ClassFilterGroupContentFieldContainer = `${classPrefix}FilterGroupContentFieldContainer`;
const ClassFilterGroupContentFieldInput = `${classPrefix}FilterGroupContentFieldInput`;
const ClassFilterGroupContentFieldAttributeSelect = `${classPrefix}FilterGroupContentFieldAttributeSelect`;
const ClassFilterGroupContentFieldAttributeOption = `${classPrefix}FilterGroupContentFieldAttributeOption`;
const ClassFilterGroupContentFieldOperatorSelect = `${classPrefix}FilterGroupContentFieldOperatorSelect`;
const ClassFilterGroupContentFieldOperatorOption = `${classPrefix}FilterGroupContentFieldOperatorOption`;
const ClassFilterGroupContentFieldRemoveButton = `${classPrefix}FilterGroupContentFieldRemoveButton`;

function newNodes(nodes?: nodes): nodes {
  return {
    container: elementFactory("div", ClassContainer, nodes?.container),

    // FilterGroup
    filterGroup: elementFactory("div", ClassFilterGroup, nodes?.filterGroup),
    filterGroupHeader: elementFactory(
      "div",
      ClassFilterGroupHeader,
      nodes?.filterGroupHeader,
    ),
    filterGroupContent: elementFactory(
      "div",
      ClassFilterGroupContent,
      nodes?.filterGroupContent,
    ),

    // FilterGroupHeader
    filterGroupHeaderConditionSelect: elementFactory(
      "select",
      ClassFilterGroupHeaderConditionSelect,
      nodes?.filterGroupHeaderConditionSelect,
    ),
    filterGroupHeaderConditionOption: elementFactory(
      "option",
      ClassFilterGroupHeaderConditionOption,
      nodes?.filterGroupHeaderConditionOption,
    ),
    filterGroupHeaderAddFieldButton: elementFactory(
      "button",
      ClassFilterGroupHeaderAddFieldButton,
      nodes?.filterGroupHeaderAddFieldButton,
    ),
    filterGroupHeaderAddGroupButton: elementFactory(
      "button",
      ClassFilterGroupHeaderAddGroupButton,
      nodes?.filterGroupHeaderAddGroupButton,
    ),
    filterGroupHeaderRemoveButton: elementFactory(
      "button",
      ClassFilterGroupHeaderRemoveButton,
      nodes?.filterGroupHeaderRemoveButton,
    ),

    filterGroupFieldContainer: elementFactory(
      "div",
      ClassFilterGroupContentFieldContainer,
      nodes?.filterGroupFieldContainer,
    ),
    filterGroupFieldInput: elementFactory(
      "input",
      ClassFilterGroupContentFieldInput,
      nodes?.filterGroupFieldInput,
    ),
    filterGroupFieldAttributeSelect: elementFactory(
      "select",
      ClassFilterGroupContentFieldAttributeSelect,
      nodes?.filterGroupFieldAttributeSelect,
    ),
    filterGroupFieldAttributeOption: elementFactory(
      "option",
      ClassFilterGroupContentFieldAttributeOption,
      nodes?.filterGroupFieldAttributeOption,
    ),
    filterGroupFieldOperatorSelect: elementFactory(
      "select",
      ClassFilterGroupContentFieldOperatorSelect,
      nodes?.filterGroupFieldOperatorSelect,
    ),
    filterGroupFieldOperatorOption: elementFactory(
      "option",
      ClassFilterGroupContentFieldOperatorOption,
      nodes?.filterGroupFieldOperatorOption,
    ),
    filterGroupFieldRemoveButton: elementFactory(
      "button",
      ClassFilterGroupContentFieldRemoveButton,
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

const conditions = ["and", "or"];
type condition = (typeof conditions)[number];

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
  attributeName: string;
  filterOperator: filterOperator;
  value: number | string | boolean;

  // relevant for filterGroup
  condition?: condition;
  children?: appliedFilter[];
}

class qb {
  cfg: config;
  filters: appliedFilter[] = [];

  container: HTMLDivElement;
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

  getFilters(): appliedFilter {
    const rootFilterGroup = this.container.querySelector(
      `.${ClassFilterGroup}`,
    );

    if (!(rootFilterGroup instanceof HTMLDivElement)) {
      console.error(`No element with className ${ClassFilterGroup} found`);
      return {} as appliedFilter;
    }

    return this.filterGroupAppliedFilter(rootFilterGroup);
  }

  private collectFilters(filterGroup: HTMLDivElement): appliedFilter[] {
    const applied: appliedFilter[] = [];

    const filterGroupContent = filterGroup.querySelector(
      `.${ClassFilterGroupContent}`,
    );

    if (!(filterGroupContent instanceof HTMLDivElement)) {
      this.error(`No element with className ${ClassFilterGroupContent} found`);
      return [];
    }

    for (const child of filterGroupContent.children) {
      if (!(child instanceof HTMLDivElement)) {
        continue;
      }

      if (child.classList.contains(ClassFilterGroup)) {
        applied.push(this.filterGroupAppliedFilter(child));
      } else if (
        child.classList.contains(ClassFilterGroupContentFieldContainer)
      ) {
        applied.push(this.collectFieldToAppliedFilter(child));
      }
    }

    return applied;
  }

  private filterGroupAppliedFilter(filterGroup: HTMLDivElement): appliedFilter {
    const header = filterGroup.querySelector(`.${ClassFilterGroupHeader}`);

    if (!(header instanceof HTMLDivElement)) {
      this.error(`No element with className ${ClassFilterGroupHeader} found`);
      throw new Error("Required header missing"); // Stop execution if critical
    }

    const condition = header.querySelector(
      `.${ClassFilterGroupHeaderConditionSelect}`,
    );

    if (!(condition instanceof HTMLSelectElement)) {
      this.error(
        `No element with className ${ClassFilterGroupHeaderConditionSelect} found`,
      );
      throw new Error("Required select missing");
    }

    return {
      condition: condition.value,
      children: this.collectFilters(filterGroup),
    } as appliedFilter;
  }

  private collectFieldToAppliedFilter(ch: HTMLDivElement): appliedFilter {
    const attribute = ch.querySelector(
      `.${ClassFilterGroupContentFieldAttributeSelect}`,
    );
    const operator = ch.querySelector(
      `.${ClassFilterGroupContentFieldOperatorSelect}`,
    );
    const input = ch.querySelector(`.${ClassFilterGroupContentFieldInput}`);

    if (!(attribute instanceof HTMLSelectElement)) {
      this.error(
        `No element with className ${ClassFilterGroupContentFieldAttributeSelect} found`,
      );
    }
    if (!(operator instanceof HTMLSelectElement)) {
      this.error(
        `No element with className ${ClassFilterGroupContentFieldOperatorSelect} found`,
      );
    }
    if (!(input instanceof HTMLInputElement)) {
      this.error(
        `No element with className ${ClassFilterGroupContentFieldInput} found`,
      );
    }

    return {
      attributeName: (attribute as HTMLSelectElement).value,
      filterOperator: (operator as HTMLSelectElement).value,
      value: (input as HTMLInputElement).value,
    };
  }

  private error(msg: string) {
    throw new Error(`queryBuilder: ${msg}`);
  }

  private newContainer(): HTMLDivElement {
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
    const andOr = this.nodes.filterGroupHeaderConditionSelect();

    for (const opt of conditions) {
      const option = this.nodes.filterGroupHeaderConditionOption();
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
