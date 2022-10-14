const presence = new Presence({
		clientId: "730897382937591848",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Logo = "https://i.imgur.com/BvGqA4s.png",
	SearchImage = "https://i.imgur.com/oGQtnIY.png",
	ReadingImage = "https://i.imgur.com/nese1O7.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ href, hostname, pathname } = document.location,
		[privacy, buttons, covers] = await Promise.all([
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("buttons"),
			presence.getSetting<boolean>("covers"),
		]);

	let search: HTMLInputElement;

	if (privacy) {
		presenceData.details = "Browsing";
		presence.setActivity(presenceData);
		return;
	}
	switch (hostname.replace("www.", "")) {
		case "fivem.net": {
			if (pathname === "/") presenceData.details = "Viewing home Page";
			else if (pathname.includes("terms")) {
				presenceData.details = "Reading terms";
				presenceData.smallImageKey = Assets.ReadingImage;
			}
			break;
		}
		case "docs.fivem.net": {
			search = document.querySelector('[name="search"]');
			if (search?.value) {
				presenceData.details = "Searchin for";
				presenceData.state = search.value;
				presenceData.smallImageKey = Assets.SearchImage;
			} else if (pathname.startsWith("/docs/")) {
				presenceData.details = "Reading documentation about";
				presenceData.state = document.querySelector(
					'[class="docContent"]'
				)?.firstChild?.textContent;
				presenceData.smallImageKey = Assets.ReadingImage;
				presenceData.buttons = [
					{
						label: "Read Docs",
						url: href,
					},
				];
			}

			break;
		}
		case "forum.cfx.re": {
			search = document.querySelector('[id="search-term"]');
			if (search?.value) {
				presenceData.details = "Searchin for";
				presenceData.state = search.value;
				presenceData.smallImageKey = Assets.SearchImage;
				presence.setActivity(presenceData);
				return;
			}
			switch (pathname.split("/")[1]) {
				case "": {
					presenceData.details = "Viewing the forum home Page";
					break;
				}
				case "categories":
				case "c": {
					// categories
					presenceData.details = "Viewing forum category";
					presenceData.state = document.querySelector(
						'[class="category-name"]'
					)?.textContent;
					presenceData.buttons = [
						{
							label: "View Forum Category",
							url: href,
						},
					];
					break;
				}
				case "tag": {
					presenceData.details = "Viewing posts with tag";
					presenceData.state =
						document.querySelector('[class="name"]')?.textContent;
					presenceData.buttons = [
						{
							label: "View Posts",
							url: href,
						},
					];
					break;
				}
				case "t": {
					// post
					presenceData.details = "Reading post";
					presenceData.state = document.querySelector(
						'[class="fancy-title"]'
					)?.textContent;
					presenceData.smallImageKey = Assets.ReadingImage;
					presenceData.buttons = [
						{
							label: "Reading Post",
							url: href,
						},
					];
					break;
				}
				case "u": {
					// user
					presenceData.details = "Viewing user";
					presenceData.largeImageKey = `https://${hostname}/${document
						.querySelector('[class="user-profile-avatar"]')
						?.firstElementChild.getAttribute("src")}`;
					presenceData.state = document
						.querySelector('[class="username"]')
						.textContent.split("\n")[1]
						.trim();
					presenceData.buttons = [
						{
							label: "View Profile",
							url: href,
						},
					];
					break;
				}
				case "latest": {
					presenceData.details = "Exploring the latest posts";
					break;
				}
				case "top": {
					presenceData.details = "Exploring the top posts";
					break;
				}
				case "badges": {
					presenceData.details = "Exploring all badges";
					break;
				}
				case "g": {
					presenceData.details = "Exploring all groups";
					break;
				}
			}
			break;
		}
		case "servers.fivem.net": {
			search = document.querySelector('[id="searchBox"]');
			if (search?.value) {
				presenceData.details = "Searchin for";
				presenceData.state = search.value;
				presenceData.smallImageKey = Assets.SearchImage;
			} else if (pathname.startsWith("/servers/detail/")) {
				presenceData.largeImageKey = document
					.querySelector('[class="icon"]')
					.firstElementChild.getAttribute("src");
				presenceData.details = "Viewing server";
				presenceData.state =
					document.querySelector('[class="title"]').textContent;
				presenceData.buttons = [
					{
						label: "View Server",
						url: href,
					},
				];
			} else {
				presenceData.details = `Exploring ${
					document.querySelector('[class="nav-item subnav-item active"]')
						?.textContent ?? "all servers"
				}`;
				presenceData.state = `Sorted by ${
					document.querySelector('[class="sort-by active"]')?.textContent
				}`;
				presenceData.buttons = [
					{
						label: "View All Server",
						url: href,
					},
				];
			}

			break;
		}
	}

	if (!covers) presenceData.largeImageKey = Assets.Logo;
	if (!buttons) delete presenceData.buttons;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
