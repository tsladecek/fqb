interface classes {
  container: string;

  filterGroup: string;
  filterGroupHeader: string;
  filterGroupContent: string;

  filterGroupHeaderAndOrSelect: string;
  filterGroupHeaderAndOrOption: string;
  filterGroupHeaderAddFieldButton: string;
  filterGroupHeaderAddGroupButton: string;
  filterGroupHeaderRemoveButton: string;

  filterGroupFieldContainer: string;
  filterGroupFieldInput: string;
  filterGroupFieldSelect: string;
  filterGroupFieldOption: string;
  filterGroupFieldRemoveButton: string;
}

const attributeTypes = ["number", "string", "datetime"] as const;
type attributeType = (typeof attributeTypes)[number];

const filterTypes = ["equal", "not equal", "less than", "greater than"];
type filterType = (typeof filterTypes)[number];

interface attribute {
  name: string;
  type: attributeType;
}

interface config {
  rootNode: Node;
  classes?: classes;
  attributes: attribute[];
}

interface appliedFilter {
  attribute: attribute;
  filterType: filterType;
  value: number | string | boolean;

  children: appliedFilter[];
}

class qb {
  cfg: config;
  filters: appliedFilter[] = [];

  // elements
  container: Node;

  constructor(cfg: config) {
    if (!cfg.rootNode) {
      this.error("root node not provided, or does not exist");
    }

    if (cfg.attributes.length === 0) {
      cfg.attributes = [];
    }

    this.cfg = cfg;
    this.container = this.newContainer();
  }

  getFilters(): appliedFilter[] {
    return this.filters;
  }

  private elementID(id: string): string {
    return `queryBuilder${id}`;
  }

  private error(msg: string) {
    throw new Error(`queryBuilder: ${msg}`);
  }

  private newContainer(): Node {
    const container = document.createElement("div");
    container.id = this.elementID("Container");
    container.className = this.cfg.classes?.container || "";
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
    const filterGroup = document.createElement("div");
    filterGroup.className = this.cfg.classes?.filterGroup || "";
    return filterGroup;
  }

  private newFilterGroupContent(): Node {
    const filterGroupContent = document.createElement("div");
    filterGroupContent.className = this.cfg.classes?.filterGroupContent || "";
    return filterGroupContent;
  }

  private newFilterGroupField(parent: Node): Node {
    const container = document.createElement("div");
    container.className = this.cfg.classes?.filterGroupFieldContainer || "";

    // attribute select
    const selectAttribute = document.createElement("select");
    selectAttribute.className = this.cfg.classes?.filterGroupFieldSelect || "";
    for (const opt of this.cfg.attributes) {
      const option = document.createElement("option");
      option.className = this.cfg.classes?.filterGroupFieldOption || "";
      option.value = opt.name;
      option.innerText = opt.name;
      selectAttribute.appendChild(option);
    }

    // type select
    const selectType = document.createElement("select");
    selectType.className = this.cfg.classes?.filterGroupFieldSelect || "";

    for (const opt of filterTypes) {
      const option = document.createElement("option");
      option.className = this.cfg.classes?.filterGroupFieldOption || "";
      option.value = opt;
      option.innerText = opt;
      selectType.appendChild(option);
    }

    // input
    const input = document.createElement("input");
    input.className = this.cfg.classes?.filterGroupFieldInput || "";

    // remove
    const remove = document.createElement("button");
    remove.className = this.cfg.classes?.filterGroupFieldRemoveButton || "";
    remove.innerText = "Remove";
    remove.addEventListener("click", () => {
      parent.removeChild(container);
    });

    container.appendChild(selectAttribute);
    container.appendChild(selectType);
    container.appendChild(input);
    container.appendChild(remove);

    return container;
  }

  private newFilterGroupHeader(): Node {
    const filterGroupHeader = document.createElement("div");
    filterGroupHeader.className = this.cfg.classes?.filterGroupHeader || "";

    return filterGroupHeader;
  }

  private newFilterGroupHeaderAddField(): Node {
    const btn = document.createElement("button");
    btn.className = this.cfg.classes?.filterGroupHeaderAddFieldButton || "";
    btn.innerText = "add field";
    return btn;
  }

  private newFilterGroupHeaderAddGroup(): Node {
    const btn = document.createElement("button");
    btn.className = this.cfg.classes?.filterGroupHeaderAddGroupButton || "";
    btn.innerText = "add group";
    return btn;
  }

  private newFilterGroupHeaderRemove(removable: boolean): Node {
    const btn = document.createElement("button");
    btn.className = this.cfg.classes?.filterGroupHeaderRemoveButton || "";
    btn.disabled = !removable;
    btn.innerText = "remove";
    return btn;
  }

  private newFilterGroupHeaderAndOr(): Node {
    const andOr = document.createElement("select");
    andOr.className = this.cfg.classes?.filterGroupHeaderAndOrSelect || "";

    for (const opt of ["and", "or"]) {
      const option = document.createElement("option");
      option.className = this.cfg.classes?.filterGroupHeaderAndOrOption || "";
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
