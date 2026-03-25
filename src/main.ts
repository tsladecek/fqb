interface DOM {
  createElement<K extends keyof ElementTagNameMap>(s: K): ElementTagNameMap[K];
}

export interface EventTarget {
  value: string;
}

export interface Event {
  target: EventTarget;
}

export interface ClassList {
  add(cls: string): undefined;
  remove(cls: string): undefined;
  contains(cls: string): boolean;
}

export interface ElementBase {
  classList: ClassList;
  appendChild(node: ElementBase): ElementBase;
  removeChild(node: ElementBase): ElementBase;
  replaceChildren(...node: ElementBase[]): undefined;
  addEventListener(type: string, listener: (e?: Event) => void): void;
  children: ElementBase[];
  innerHTML: string;
  innerText: string;
}

export interface ElementSpan extends ElementBase {}

export interface ElementDiv extends ElementBase {}

export function getChildByClass(
  parent: ElementDiv,
  cls: string,
): ElementBase | null {
  for (const child of parent.children) {
    if (child.classList.contains(cls)) {
      return child;
    }
  }
  return null;
}

export interface ElementWithValue extends ElementBase {
  value: string;
}

export interface ElementInput extends ElementWithValue {
  value: string;
  type: string;
}

export interface ElementSelect extends ElementWithValue {
  value: string;
}

export interface ElementOption extends ElementWithValue {
  value: string;
}

export interface ElementButton extends ElementBase {
  disabled: boolean;
}

export interface ElementTagNameMap {
  div: ElementDiv;
  span: ElementSpan;
  input: ElementInput;
  select: ElementSelect;
  option: ElementOption;
  button: ElementButton;
}

export interface Nodes {
  container: () => ElementDiv;

  filterGroup: () => ElementDiv;
  filterGroupHeader: () => ElementDiv;
  filterGroupContent: () => ElementDiv;

  filterGroupHeaderConditionSelect: () => ElementSelect;
  filterGroupHeaderConditionOption: () => ElementOption;
  filterGroupHeaderAddFieldButton: () => ElementButton;
  filterGroupHeaderAddGroupButton: () => ElementButton;
  filterGroupHeaderRemoveButton: () => ElementButton;

  filterGroupContentFieldContainer: () => ElementDiv;
  filterGroupContentFieldInputContainer: () => ElementSpan;
  filterGroupContentFieldInputFallback: () => ElementInput; // used as fallback if not declared in attributeTypeSpec
  filterGroupContentFieldAttributeSelect: () => ElementSelect;
  filterGroupContentFieldAttributeOption: () => ElementOption;
  filterGroupContentFieldOperatorSelect: () => ElementSelect;
  filterGroupContentFieldOperatorOption: () => ElementOption;
  filterGroupContentFieldRemoveButton: () => ElementButton;
}

const classPrefix = "queryBuilder";

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
export const ClassFilterGroupContentFieldInputContainer = `${classPrefix}FilterGroupContentFieldInputContainer`;
export const ClassFilterGroupContentFieldInput = `${classPrefix}FilterGroupContentFieldInput`; // this doesnt have to be input, any component with .value property is valid
export const ClassFilterGroupContentFieldAttributeSelect = `${classPrefix}FilterGroupContentFieldAttributeSelect`;
export const ClassFilterGroupContentFieldAttributeOption = `${classPrefix}FilterGroupContentFieldAttributeOption`;
export const ClassFilterGroupContentFieldOperatorSelect = `${classPrefix}FilterGroupContentFieldOperatorSelect`;
export const ClassFilterGroupContentFieldOperatorOption = `${classPrefix}FilterGroupContentFieldOperatorOption`;
export const ClassFilterGroupContentFieldRemoveButton = `${classPrefix}FilterGroupContentFieldRemoveButton`;

const defaultFilterOperators: string[] = [
  "=",
  "!=",
  "<",
  "<=",
  ">",
  ">=",
  "contains",
  "not contains",
] as const;

export const NumericOperators: string[] = ["=", "!=", "<", "<=", ">", ">="];
export const TextOperators: string[] = ["=", "!=", "contains", "not contains"];

const conditions = ["and", "or"] as const;
export type Condition = (typeof conditions)[number];

export interface Attribute {
  name: string;
  operators?: string[];
  input?: () => ElementWithValue;
}

export interface Config {
  rootNode: ElementDiv;
  attributes: Attribute[];

  nodes?: Nodes;
}

export interface AppliedFilter {
  attribute: string;
  operator: string;
  value: number | string | boolean;

  // relevant for filterGroup
  condition?: Condition;
  children?: AppliedFilter[];
}

export class FQB {
  private cfg: Config;
  private nodes: Nodes;
  private dom: DOM;

  rootFilterGroup: ElementDiv;

  constructor(cfg: Config, dom?: DOM) {
    if (!cfg.rootNode) {
      this.error("root node not provided, or does not exist");
    }

    if (cfg.attributes.length === 0) {
      cfg.attributes = [];
    }

    this.cfg = cfg;
    if (dom) {
      this.dom = dom;
    } else {
      this.dom = document;
    }

    this.setAttributes();
    this.nodes = this.newNodes();
    this.rootFilterGroup = this.newRootFilterGroup();
  }

  getFilters(): AppliedFilter {
    return this.filterGroupAppliedFilter(this.rootFilterGroup);
  }

  private inputElementFactory(
    type: string,
    cls: string,
  ): () => ElementWithValue {
    return () => {
      const el = this.nodes.filterGroupContentFieldInputFallback();
      el.type = type;
      el.classList.add(cls);
      return el;
    };
  }

  private setAttributes() {
    for (const a of this.cfg.attributes) {
      if (!a.operators) {
        a.operators = defaultFilterOperators;
      }

      let inputFactory = this.inputElementFactory(
        "text",
        ClassFilterGroupContentFieldInput,
      );

      if (a.input) {
        inputFactory = a.input;
      }

      a.input = function (): ElementWithValue {
        const i = inputFactory();
        i.classList.add(ClassFilterGroupContentFieldInput);
        return i;
      };
    }
  }

  private elementFactory<K extends keyof ElementTagNameMap>(
    type: K,
    className: string,
    provided?: () => ElementTagNameMap[K],
  ): () => ElementTagNameMap[K] {
    return () => {
      let element: ElementTagNameMap[K] = this.dom.createElement(type);
      if (provided) {
        element = provided();
      }

      element.classList.add(`${className}`);
      return element;
    };
  }

  private newNodes(): Nodes {
    return {
      container: this.elementFactory(
        "div",
        ClassContainer,
        this.cfg.nodes?.container,
      ),

      // FilterGroup
      filterGroup: this.elementFactory(
        "div",
        ClassFilterGroup,
        this.cfg.nodes?.filterGroup,
      ),
      filterGroupHeader: this.elementFactory(
        "div",
        ClassFilterGroupHeader,
        this.cfg.nodes?.filterGroupHeader,
      ),
      filterGroupContent: this.elementFactory(
        "div",
        ClassFilterGroupContent,
        this.cfg.nodes?.filterGroupContent,
      ),

      // FilterGroupHeader
      filterGroupHeaderConditionSelect: this.elementFactory(
        "select",
        ClassFilterGroupHeaderConditionSelect,
        this.cfg.nodes?.filterGroupHeaderConditionSelect,
      ),
      filterGroupHeaderConditionOption: this.elementFactory(
        "option",
        ClassFilterGroupHeaderConditionOption,
        this.cfg.nodes?.filterGroupHeaderConditionOption,
      ),
      filterGroupHeaderAddFieldButton: this.elementFactory(
        "button",
        ClassFilterGroupHeaderAddFieldButton,
        this.cfg.nodes?.filterGroupHeaderAddFieldButton,
      ),
      filterGroupHeaderAddGroupButton: this.elementFactory(
        "button",
        ClassFilterGroupHeaderAddGroupButton,
        this.cfg.nodes?.filterGroupHeaderAddGroupButton,
      ),
      filterGroupHeaderRemoveButton: this.elementFactory(
        "button",
        ClassFilterGroupHeaderRemoveButton,
        this.cfg.nodes?.filterGroupHeaderRemoveButton,
      ),

      filterGroupContentFieldContainer: this.elementFactory(
        "div",
        ClassFilterGroupContentFieldContainer,
        this.cfg.nodes?.filterGroupContentFieldContainer,
      ),
      filterGroupContentFieldInputContainer: this.elementFactory(
        "span",
        ClassFilterGroupContentFieldInputContainer,
        this.cfg.nodes?.filterGroupContentFieldInputContainer,
      ),
      filterGroupContentFieldInputFallback: this.elementFactory(
        "input",
        ClassFilterGroupContentFieldInput,
        this.cfg.nodes?.filterGroupContentFieldInputFallback,
      ),
      filterGroupContentFieldAttributeSelect: this.elementFactory(
        "select",
        ClassFilterGroupContentFieldAttributeSelect,
        this.cfg.nodes?.filterGroupContentFieldAttributeSelect,
      ),
      filterGroupContentFieldAttributeOption: this.elementFactory(
        "option",
        ClassFilterGroupContentFieldAttributeOption,
        this.cfg.nodes?.filterGroupContentFieldAttributeOption,
      ),
      filterGroupContentFieldOperatorSelect: this.elementFactory(
        "select",
        ClassFilterGroupContentFieldOperatorSelect,
        this.cfg.nodes?.filterGroupContentFieldOperatorSelect,
      ),
      filterGroupContentFieldOperatorOption: this.elementFactory(
        "option",
        ClassFilterGroupContentFieldOperatorOption,
        this.cfg.nodes?.filterGroupContentFieldOperatorOption,
      ),
      filterGroupContentFieldRemoveButton: this.elementFactory(
        "button",
        ClassFilterGroupContentFieldRemoveButton,
        this.cfg.nodes?.filterGroupContentFieldRemoveButton,
      ),
    };
  }

  private collectFilters(filterGroup: ElementDiv): AppliedFilter[] {
    const applied: AppliedFilter[] = [];

    const filterGroupContent = getChildByClass(
      filterGroup,
      ClassFilterGroupContent,
    );

    if (!filterGroupContent) {
      this.error("no filter group content found");
    }

    for (const child of (filterGroupContent as ElementDiv).children) {
      if (child.classList.contains(ClassFilterGroup)) {
        applied.push(this.filterGroupAppliedFilter(child));
      } else if (
        child.classList.contains(ClassFilterGroupContentFieldContainer)
      ) {
        applied.push(this.collectFieldToAppliedFilter(child));
      } else {
        this.error(
          "unrecognized child of filterGroup - not a group or field container",
        );
      }
    }

    return applied;
  }

  private filterGroupAppliedFilter(filterGroup: ElementDiv): AppliedFilter {
    const header = getChildByClass(filterGroup, ClassFilterGroupHeader);

    if (!header) {
      this.error("no filter group header found");
    }

    const condition = getChildByClass(
      header as ElementDiv,
      ClassFilterGroupHeaderConditionSelect,
    );

    if (!condition) {
      this.error("no condition select element found");
    }

    return {
      condition: (condition as ElementSelect).value,
      children: this.collectFilters(filterGroup),
    } as AppliedFilter;
  }

  private collectFieldToAppliedFilter(ch: ElementDiv): AppliedFilter {
    const attribute = getChildByClass(
      ch,
      ClassFilterGroupContentFieldAttributeSelect,
    );
    const operator = getChildByClass(
      ch,
      ClassFilterGroupContentFieldOperatorSelect,
    );

    const inputContainer = getChildByClass(
      ch,
      ClassFilterGroupContentFieldInputContainer,
    );

    if (!attribute || !operator || !inputContainer) {
      this.error("failed to collect attribute, operator and field");
    }

    const input = getChildByClass(
      inputContainer as ElementSpan,
      ClassFilterGroupContentFieldInput,
    );

    return {
      attribute: (attribute as ElementSelect).value,
      operator: (operator as ElementSelect).value,
      value: (input as ElementWithValue).value,
    };
  }

  private error(msg: string) {
    throw new Error(`queryBuilder: ${msg}`);
  }

  private newRootFilterGroup(): ElementDiv {
    const container = this.nodes.container();
    this.cfg.rootNode.appendChild(container);

    return this.newFilterGroup(false, container);
  }

  newFilterGroup(removable: boolean, parent: ElementDiv): ElementDiv {
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
      this.newFilterGroupField(filterGroupContent);
    });

    remove.addEventListener("click", () => {
      parent.removeChild(filterGroupContainer);
    });

    addGroup.addEventListener("click", () => {
      this.newFilterGroup(true, filterGroupContent);
    });

    parent.appendChild(filterGroupContainer);
    return filterGroupContainer;
  }

  private newFilterGroupContainer(): ElementDiv {
    const filterGroup = this.nodes.filterGroup();
    return filterGroup;
  }

  private newFilterGroupContent(): ElementDiv {
    const filterGroupContent = this.nodes.filterGroupContent();
    return filterGroupContent;
  }

  newFilterGroupField(parent: ElementDiv): ElementDiv {
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
    // operator options are set in the setInputAndOperatorsForAttribute function
    // based on the type of the selected attribute

    // input
    const inputContainer = this.nodes.filterGroupContentFieldInputContainer();

    this.setInputAndOperatorsForAttribute(
      selectAttribute.value,
      inputContainer,
      selectOperator,
    );

    selectAttribute.addEventListener("input", (e) => {
      if (e?.target) {
        const t = e.target as ElementSelect;
        this.setInputAndOperatorsForAttribute(
          t.value,
          inputContainer,
          selectOperator,
        );
      }
    });

    // remove
    const remove = this.nodes.filterGroupContentFieldRemoveButton();
    remove.addEventListener("click", () => {
      parent.removeChild(container);
    });

    container.appendChild(selectAttribute);
    container.appendChild(selectOperator);
    container.appendChild(inputContainer);
    container.appendChild(remove);

    parent.appendChild(container);
    return container;
  }

  private newFilterGroupHeader(): ElementDiv {
    const filterGroupHeader = this.nodes.filterGroupHeader();
    return filterGroupHeader;
  }

  private newFilterGroupHeaderAddField(): ElementButton {
    const btn = this.nodes.filterGroupHeaderAddFieldButton();
    return btn;
  }

  private newFilterGroupHeaderAddGroup(): ElementButton {
    const btn = this.nodes.filterGroupHeaderAddGroupButton();
    return btn;
  }

  private newFilterGroupHeaderRemove(removable: boolean): ElementButton {
    const btn = this.nodes.filterGroupHeaderRemoveButton();
    btn.disabled = !removable;
    return btn;
  }

  private newFilterGroupHeaderAndOr(): ElementSelect {
    const andOr = this.nodes.filterGroupHeaderConditionSelect();

    for (const opt of conditions) {
      const option = this.nodes.filterGroupHeaderConditionOption();
      option.value = opt;
      option.innerText = opt;
      andOr.appendChild(option);
    }

    return andOr;
  }

  private setInputAndOperatorsForAttribute(
    attrName: string,
    inputContainer: ElementSpan,
    select: ElementSelect,
  ) {
    const attribute = this.cfg.attributes.find((a) => a.name === attrName);

    if (!attribute) {
      // this is likely a placeholder - an empty option, just set defaults and return
      select.innerHTML = "";
      inputContainer.replaceChildren(
        this.inputElementFactory("text", ClassFilterGroupContentFieldInput)(),
      );
      return;
    }

    if (!attribute.input) {
      this.error(`no input callback found for attribute ${attrName}`);
      return;
    }

    if (!attribute.operators) {
      this.error(`no operators found for attribute ${attrName}`);
      return;
    }

    inputContainer.replaceChildren(attribute.input());
    select.innerHTML = "";

    for (const opt of attribute.operators) {
      const option = this.nodes.filterGroupContentFieldOperatorOption();
      option.value = opt;
      option.innerText = opt;
      select.appendChild(option);
    }
  }
}
