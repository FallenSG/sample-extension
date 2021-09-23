var contextMenuItem = {
    "id": "addRecipe",
    "title": "Add Recipe",
    "contexts": ["page", "selection", "image", "link"],
		// onclick: () => {}
};

	chrome.contextMenus.create(contextMenuItem);

var search = {
	    title: "Search on",
	    id: "searchEngine",
	    contexts:["selection"],
			onclick: function(e) {
				console.log(e);
			}
	};

  chrome.contextMenus.create(search);

  chrome.contextMenus.create({
    title: "Google",
    parentId: "searchEngine",
    id: "google",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    title: "Yahoo",
    parentId: "searchEngine",
    id: "yahoo",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    title: "DuckDuckgo",
    parentId: "searchEngine",
    id: "duckduckgo",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    title: "Bing",
    parentId: "searchEngine",
    id: "bing",
    contexts: ["selection"]
  });

	chrome.contextMenus.create({
	    title: "Add shopping list",
	    parentId: "addRecipe",
	    id: "list",
	    contexts:["page", "selection", "image", "link"]
	});

	chrome.contextMenus.create({
	    title: "Add ingredients",
	    parentId: "addRecipe",
	    id: "ingredients",
	    contexts:["page", "selection", "image", "link"]
	});

	chrome.contextMenus.create({
	    title: "Add cooking steps",
	    parentId: "addRecipe",
	    id: "steps",
	    contexts:["page", "selection", "image", "link"]
	});
