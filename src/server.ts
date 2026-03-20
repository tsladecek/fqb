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

  return new Response(
    `
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body>
				<div id="filterContainer"></div>
				<script type="module">
					import { queryBuilder } from "/static/query-builder.min.js";
					const cfg = {
						rootNode: filterContainer,
						attributes: [
							{name: "first", type: "number"},
							{"name": "second", type: "string"}
						]
					}
					const qb = queryBuilder(cfg)
					console.log(qb.getFilters())
				</script>
			</body>
		</html>`,
    { headers: { "content-type": "text/html" } },
  );
});
