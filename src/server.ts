Deno.serve({ port: 18080 }, async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/static/query-builder.min.js") {
    try {
      const file = await Deno.readFile("./dist/query-builder.min.js");
      return new Response(file, {
        headers: {
          "content-type": "application/javascript",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  if (url.pathname === "/static/output.css") {
    try {
      const file = await Deno.readFile("./dist/output.css");
      return new Response(file, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  return new Response(
    `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" href="/static/output.css" />
			</head>
			<body>
				<div id="filterContainer"></div>
				<button id="evaluate" type="button" class="bg-gray-200 rounded-md hover:cursor-pointer">Evaluate</button>
				<div id="queryResult"></div>
				<script type="module">
					import { queryBuilder } from "/static/query-builder.min.js";

					function nodeFactory(elementType, className, innerText) {
						return () => {
							const el = document.createElement(elementType)
							el.className = className
							if (innerText) {
								el.innerText = innerText
							}
							return el
						}
					}

					const btnClass = "px-1 rounded hover:disabled:cursor-default hover:cursor-pointer disabled:opacity-25 "

					const nodes = {
						container: nodeFactory("div", "w-full", ""),

						filterGroup: nodeFactory("div", "border border-gray-300 p-1 dashed rounded-md border-dashed flex flex-col gap-2", ""),
						filterGroupHeader: nodeFactory("div", "flex gap-1", ""),
						filterGroupContent: nodeFactory("div", "flex flex-col gap-1 pl-3", ""),

						filterGroupHeaderConditionSelect: nodeFactory("select", "px-1 border border-gray-300 rounded-md", ""),
						filterGroupHeaderConditionOption: nodeFactory("option", "", ""),
						filterGroupHeaderAddFieldButton: nodeFactory("button", btnClass + "bg-green-700 text-white hover:bg-green-800", "ADD FIELD"),
						filterGroupHeaderAddGroupButton: nodeFactory("button", btnClass + "bg-blue-700 text-white hover:bg-blue-800", "ADD GROUP"),
						filterGroupHeaderRemoveButton: nodeFactory("button", btnClass + "bg-red-800 text-white hover:bg-red-900", "REMOVE"),

						filterGroupContentFieldContainer: nodeFactory("div", "flex gap-1 grid grid-cols-4", ""),
						filterGroupContentFieldInput: nodeFactory("input", "border border-gray-300 px-1 rounded-md", ""),
						filterGroupContentFieldAttributeSelect: nodeFactory("select", "border border-gray-300 px-1 rounded-md", ""),
						filterGroupContentFieldAttributeOption: nodeFactory("option", "border border-gray-300 px-1 rounded-md", ""),
						filterGroupContentFieldOperatorSelect: nodeFactory("select", "border border-gray-300 px-1 rounded-md", ""),
						filterGroupContentFieldOperatorOption: nodeFactory("option", "border border-gray-300 px-1 rounded-md", ""),
						filterGroupContentFieldRemoveButton: nodeFactory("button", btnClass + "bg-red-800 text-white hover:bg-red-900", "REMOVE"),
					}
					const cfg = {
						rootNode: filterContainer,
						nodes: nodes,
						attributes: [
							{name: "number field", type: "number"},
							{name: "text field", type: "string"},
							{name: "password field", type: "password"},
							{name: "date field", type: "date"},
						]
					}
					const qb = queryBuilder(cfg)
					evaluate.addEventListener("click", () => {
							const filters = qb.getFilters();
							const jsonString = JSON.stringify(filters, null, 2);
							const pre = document.createElement("pre");
							pre.textContent = jsonString;
							queryResult.replaceChildren(pre); 
					});
				</script>
			</body>
		</html>`,
    { headers: { "content-type": "text/html" } },
  );
});
