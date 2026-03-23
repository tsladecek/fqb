export interface Nodes {
  container: () => HTMLDivElement;

  filterGroup: () => HTMLDivElement;
  filterGroupHeader: () => HTMLDivElement;
  filterGroupContent: () => HTMLDivElement;

  filterGroupHeaderConditionSelect: () => HTMLSelectElement;
  filterGroupHeaderConditionOption: () => HTMLOptionElement;
  filterGroupHeaderAddFieldButton: () => HTMLButtonElement;
  filterGroupHeaderAddGroupButton: () => HTMLButtonElement;
  filterGroupHeaderRemoveButton: () => HTMLButtonElement;

  filterGroupContentFieldContainer: () => HTMLDivElement;
  filterGroupContentFieldInput: () => HTMLInputElement;
  filterGroupContentFieldAttributeSelect: () => HTMLSelectElement;
  filterGroupContentFieldAttributeOption: () => HTMLOptionElement;
  filterGroupContentFieldOperatorSelect: () => HTMLSelectElement;
  filterGroupContentFieldOperatorOption: () => HTMLOptionElement;
  filterGroupContentFieldRemoveButton: () => HTMLButtonElement;
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
export const ClassContainer = `${classPrefix}Container`;
export const ClassFilterGroup = `${classPrefix}FilterGroup`;
export const ClassFilterGroupHeader = `${classPrefix}FilterGroupHeader`;
export const ClassFilterGroupContent = `${classPrefix}FilterGroupContent`;

// Header Constants
export const ClassFilterGroupHeaderConditionSelect = `${classPrefix}FilterGroupHeaderHeaderConditionSelect`;
export const ClassFilterGroupHeaderConditionOption = `${classPrefix}FilterGroupHeaderHeaderConditionOption`;
export const ClassFilterGroupHeaderAddFieldButton = `${classPrefix}FilterGroupHeaderHeaderAddFieldButton`;
export const ClassFilterGroupHeaderAddGroupButton = `${classPrefix}FilterGroupHeaderHeaderAddGroupButton`;
export const ClassFilterGroupHeaderRemoveButton = `${classPrefix}FilterGroupHeaderHeaderRemoveButton`;

// Field Constants
export const ClassFilterGroupContentFieldContainer = `${classPrefix}FilterGroupContentFieldContainer`;
export const ClassFilterGroupContentFieldInput = `${classPrefix}FilterGroupContentFieldInput`;
export const ClassFilterGroupContentFieldAttributeSelect = `${classPrefix}FilterGroupContentFieldAttributeSelect`;
export const ClassFilterGroupContentFieldAttributeOption = `${classPrefix}FilterGroupContentFieldAttributeOption`;
export const ClassFilterGroupContentFieldOperatorSelect = `${classPrefix}FilterGroupContentFieldOperatorSelect`;
export const ClassFilterGroupContentFieldOperatorOption = `${classPrefix}FilterGroupContentFieldOperatorOption`;
export const ClassFilterGroupContentFieldRemoveButton = `${classPrefix}FilterGroupContentFieldRemoveButton`;

function newNodes(nodes?: Nodes): Nodes {
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

    filterGroupContentFieldContainer: elementFactory(
      "div",
      ClassFilterGroupContentFieldContainer,
      nodes?.filterGroupContentFieldContainer,
    ),
    filterGroupContentFieldInput: elementFactory(
      "input",
      ClassFilterGroupContentFieldInput,
      nodes?.filterGroupContentFieldInput,
    ),
    filterGroupContentFieldAttributeSelect: elementFactory(
      "select",
      ClassFilterGroupContentFieldAttributeSelect,
      nodes?.filterGroupContentFieldAttributeSelect,
    ),
    filterGroupContentFieldAttributeOption: elementFactory(
      "option",
      ClassFilterGroupContentFieldAttributeOption,
      nodes?.filterGroupContentFieldAttributeOption,
    ),
    filterGroupContentFieldOperatorSelect: elementFactory(
      "select",
      ClassFilterGroupContentFieldOperatorSelect,
      nodes?.filterGroupContentFieldOperatorSelect,
    ),
    filterGroupContentFieldOperatorOption: elementFactory(
      "option",
      ClassFilterGroupContentFieldOperatorOption,
      nodes?.filterGroupContentFieldOperatorOption,
    ),
    filterGroupContentFieldRemoveButton: elementFactory(
      "button",
      ClassFilterGroupContentFieldRemoveButton,
      nodes?.filterGroupContentFieldRemoveButton,
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
export type AttributeType = (typeof attributeTypes)[number];

const filterOperators = ["=", "!=", "<", "<=", ">", ">=", "in", "not in"];
export type FilterOperator = (typeof filterOperators)[number];

const conditions = ["and", "or"];
export type Condition = (typeof conditions)[number];

export interface Attribute {
  name: string;
  type: AttributeType;
}

export interface Config {
  rootNode: HTMLDivElement;
  nodes?: Nodes;
  attributes: Attribute[];
}

export interface AppliedFilter {
  attribute: string;
  operator: FilterOperator;
  value: number | string | boolean;

  // relevant for filterGroup
  condition?: Condition;
  children?: AppliedFilter[];
}

class QueryBuilder {
  private cfg: Config;
  private nodes: Nodes;

  rootFilterGroup: HTMLDivElement;

  constructor(cfg: Config) {
    if (!cfg.rootNode) {
      this.error("root node not provided, or does not exist");
    }

    if (cfg.attributes.length === 0) {
      cfg.attributes = [];
    }

    this.cfg = cfg;
    this.nodes = newNodes(cfg.nodes);
    this.rootFilterGroup = this.newRootFilterGroup();
  }

  getFilters(): AppliedFilter {
    return this.filterGroupAppliedFilter(this.rootFilterGroup);
  }

  private collectFilters(filterGroup: HTMLDivElement): AppliedFilter[] {
    const applied: AppliedFilter[] = [];

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

  private filterGroupAppliedFilter(filterGroup: HTMLDivElement): AppliedFilter {
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
    } as AppliedFilter;
  }

  private collectFieldToAppliedFilter(ch: HTMLDivElement): AppliedFilter {
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
      attribute: (attribute as HTMLSelectElement).value,
      operator: (operator as HTMLSelectElement).value,
      value: (input as HTMLInputElement).value,
    };
  }

  private error(msg: string) {
    throw new Error(`queryBuilder: ${msg}`);
  }

  private newRootFilterGroup(): HTMLDivElement {
    const container = this.nodes.container();
    this.cfg.rootNode.appendChild(container);

    const rootFilterGroup = this.newFilterGroup(false, container);
    container.appendChild(rootFilterGroup);

    return rootFilterGroup;
  }

  newFilterGroup(removable: boolean, parent: HTMLDivElement): HTMLDivElement {
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

  private newFilterGroupContainer(): HTMLDivElement {
    const filterGroup = this.nodes.filterGroup();
    return filterGroup;
  }

  private newFilterGroupContent(): HTMLDivElement {
    const filterGroupContent = this.nodes.filterGroupContent();
    return filterGroupContent;
  }

  newFilterGroupField(parent: HTMLDivElement): HTMLDivElement {
    const container = this.nodes.filterGroupContentFieldContainer();

    // attribute select
    const selectAttribute = this.nodes.filterGroupContentFieldAttributeSelect();
    for (const opt of this.cfg.attributes) {
      const option = this.nodes.filterGroupContentFieldAttributeOption();
      option.value = opt.name;
      option.innerText = opt.name;
      selectAttribute.appendChild(option);
    }

    // type select
    const selectOperator = this.nodes.filterGroupContentFieldOperatorSelect();

    for (const opt of filterOperators) {
      const option = this.nodes.filterGroupContentFieldOperatorOption();
      option.value = opt;
      option.innerText = opt;
      selectOperator.appendChild(option);
    }

    // input
    const input = this.nodes.filterGroupContentFieldInput();

    function setInputFromSelect(cfg: Config, attrName: string) {
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
    const remove = this.nodes.filterGroupContentFieldRemoveButton();
    remove.addEventListener("click", () => {
      parent.removeChild(container);
    });

    container.appendChild(selectAttribute);
    container.appendChild(selectOperator);
    container.appendChild(input);
    container.appendChild(remove);

    return container;
  }

  private newFilterGroupHeader(): HTMLDivElement {
    const filterGroupHeader = this.nodes.filterGroupHeader();
    return filterGroupHeader;
  }

  private newFilterGroupHeaderAddField(): HTMLButtonElement {
    const btn = this.nodes.filterGroupHeaderAddFieldButton();
    return btn;
  }

  private newFilterGroupHeaderAddGroup(): HTMLButtonElement {
    const btn = this.nodes.filterGroupHeaderAddGroupButton();
    return btn;
  }

  private newFilterGroupHeaderRemove(removable: boolean): HTMLButtonElement {
    const btn = this.nodes.filterGroupHeaderRemoveButton();
    btn.disabled = !removable;
    return btn;
  }

  private newFilterGroupHeaderAndOr(): HTMLSelectElement {
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

export function queryBuilder(cfg: Config): QueryBuilder {
  const q = new QueryBuilder(cfg);
  return q;
}
