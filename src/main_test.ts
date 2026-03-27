import { assertEquals } from "@std/assert";
import {
  Config,
  Attribute,
  AppliedFilter,
  ClassFilterGroupContentFieldAttributeSelect,
  ClassFilterGroupContentFieldOperatorSelect,
  ClassFilterGroupContentFieldInputContainer,
  ClassFilterGroupContent,
  ClassFilterGroupHeader,
  ClassFilterGroupHeaderConditionSelect,
  ElementDiv,
  ElementInput,
  ElementButton,
  ElementOption,
  ElementSelect,
  getChildByClass,
  ElementTagNameMap,
  ClassList,
  Event,
  FQB,
  ClassFilterGroupContentFieldInput,
} from "./main.ts";

class MockClassList {
  classes: string[] = [];

  add(cls: string): undefined {
    this.classes.push(cls);
  }
  remove(cls: string): undefined {
    const index = this.classes.indexOf(cls);
    if (index > -1) {
      this.classes.splice(index, 1);
    }
  }
  contains(cls: string): boolean {
    return this.classes.includes(cls);
  }
}

class MockElement
  implements
    ElementDiv,
    ElementInput,
    ElementSelect,
    ElementOption,
    ElementButton
{
  classList: ClassList = new MockClassList();
  children: MockElement[] = [];
  listeners: Record<string, ((e?: Event) => void)[]> = {};

  value: string = "";
  type: string = "text";
  innerText: string = "";
  innerHTML: string = "";
  disabled: boolean = false;

  appendChild(node: MockElement) {
    this.children.push(node);
    return node;
  }

  removeChild(node: MockElement) {
    this.children = this.children.filter((c) => c !== node);
    return node;
  }

  replaceChildren(...node: MockElement[]): undefined {
    for (const child of node) {
      this.appendChild(child);
    }
  }

  addEventListener(type: string, listener: (e?: Event) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  dispatchEvent(event: { type: string }) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach((handler) => handler({ target: this }));
  }
}

class MockDOM {
  createElement<K extends keyof ElementTagNameMap>(_: K): ElementTagNameMap[K] {
    return new MockElement();
  }
}

function addField(
  qb: FQB,
  filterGroup: ElementDiv,
  attr: string,
  operator: string,
  value: string,
) {
  const fgc = getChildByClass(filterGroup, ClassFilterGroupContent);
  if (!fgc) {
    throw new Error("no fgc");
  }
  const container = qb.newFilterGroupField(fgc);
  if (!container) {
    throw new Error("no container");
  }

  const att = getChildByClass(
    container,
    ClassFilterGroupContentFieldAttributeSelect,
  );
  const ope = getChildByClass(
    container,
    ClassFilterGroupContentFieldOperatorSelect,
  );
  const inpC = getChildByClass(
    container,
    ClassFilterGroupContentFieldInputContainer,
  );

  if (!inpC) {
    throw new Error("no input container");
  }

  const inp = getChildByClass(inpC, ClassFilterGroupContentFieldInput);

  if (!att || !ope) {
    throw new Error(
      `when getting input container elements: attribute: ${att}, operator: ${ope}`,
    );
  }

  (att as ElementSelect).value = attr;
  (ope as ElementSelect).value = operator;

  if (!inp) {
    return;
  }

  (inp as ElementInput).value = value;
}

function setCondition(filterGroup: ElementDiv, condition: string) {
  const header = getChildByClass(filterGroup, ClassFilterGroupHeader);

  if (!header) {
    throw new Error("no header found");
  }

  const cond = getChildByClass(
    header as ElementDiv,
    ClassFilterGroupHeaderConditionSelect,
  );

  if (!cond) {
    throw new Error("no condition found");
  }

  (cond as ElementSelect).value = condition;
}

Deno.test("happy path", () => {
  const document = new MockDOM();
  const root = document.createElement("div");

  const attributes: Attribute[] = [
    { name: "attr1", operators: ["=", "!="] },
    { name: "attr2", operators: ["contains"] },
    { name: "attr3" },
    { name: "attr4" },
  ];

  const cfg = {
    rootNode: root,
    attributes: attributes,
  } as Config;

  const qb = new FQB(cfg, document);

  // root filter group
  setCondition(qb.rootFilterGroup, "and");
  addField(qb, qb.rootFilterGroup, attributes[0].name, "=", "123");
  addField(qb, qb.rootFilterGroup, attributes[1].name, "contains", "aaa");

  const rootContent = getChildByClass(
    qb.rootFilterGroup,
    ClassFilterGroupContent,
  );
  if (!rootContent) {
    throw new Error("no root content");
  }

  // another group
  const fg = qb.newFilterGroup(true, rootContent);
  setCondition(fg, "or");
  addField(qb, fg, attributes[2].name, "<", "654");

  const applied = qb.getFilters();

  assertEquals(applied, {
    condition: "and",
    children: [
      { attribute: attributes[0].name, operator: "=", value: "123" },
      { attribute: attributes[1].name, operator: "contains", value: "aaa" },
      {
        condition: "or",
        children: [
          { attribute: attributes[2].name, operator: "<", value: "654" },
        ],
      },
    ],
  } as AppliedFilter);

  // test that when existing is repetitively initialized, the children do not change
  qb.initializeFromFilters(applied);
  const after = qb.getFilters();
  assertEquals(after, applied);

  // test with new initialized from filters
  const newFQB = new FQB(cfg, document);
  newFQB.initializeFromFilters(applied);
  const newApplied = newFQB.getFilters();
  assertEquals(newApplied, applied);
});
