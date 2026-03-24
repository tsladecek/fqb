import { assertEquals } from "@std/assert";
import {
  Config,
  Attribute,
  AppliedFilter,
  ClassFilterGroupContentFieldAttributeSelect,
  ClassFilterGroupContentFieldOperatorSelect,
  ClassFilterGroupContentFieldInput,
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
  const inp = getChildByClass(container, ClassFilterGroupContentFieldInput);

  if (!att || !ope || !inp) {
    throw new Error("error");
  }

  (att as ElementSelect).value = attr;
  (ope as ElementSelect).value = operator;
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
    { name: "attr1", type: "number" },
    { name: "attr2", type: "password" },
    { name: "attr3", type: "text" },
    { name: "attr4", type: "date" },
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
});
