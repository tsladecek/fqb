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
					const classes = {
						container: "max-w-[400px]",

						filterGroup: "border p-1 dashed rounded-md border-dashed flex flex-col gap-2",
						filterGroupHeader: "flex gap-1",
						filterGroupContent: "flex flex-col gap-1",

						filterGroupHeaderAndOrSelect: "w-[70px] text-center border border-gray-300 rounded-md",
						filterGroupHeaderAndOrOption: "text-center",
						filterGroupHeaderAddFieldButton: "bg-green-700 text-white px-1 rounded",
						filterGroupHeaderAddGroupButton: "bg-blue-700 text-white px-1 rounded",
						filterGroupHeaderRemoveButton: "bg-red-700 text-white px-1 rounded",

						filterGroupFieldContainer: "flex gap-1",
						filterGroupFieldInput: "w-[100px] border border-gray-300 px-1 rounded-md",
						filterGroupFieldSelect: "w-[100px] border border-gray-300 px-1 rounded-md",
						filterGroupFieldOption: "w-[100px] border border-gray-300 px-1 rounded-md",
						filterGroupFieldRemoveButton: "bg-red-700 text-white px-1 rounded",
					}
					const cfg = {
						rootNode: filterContainer,
						classes: classes,
						attributes: [
							{name: "first", type: "number"},
							{"name": "second", type: "string"}
						]
					}
					const qb = queryBuilder(cfg)
					console.log(evaluate)
					evaluate.addEventListener("click", () => {
						queryResult.innerText = JSON.stringify(qb.getFilters())
					})
				</script>
			</body>
		</html>`,
    { headers: { "content-type": "text/html" } },
  );
});
