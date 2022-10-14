const presence = new Presence({ clientId: "1014873319419424869" }),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	staticsPages: { [name: string]: string } = {
		"": "Viewing homepage",
		"~rules": "Reading rules",
		"~tos": "Reading ToS",
		"~account": "Managing their account",
	};

enum Assets {
	Logo = "https://i.imgur.com/3ltOcr0.png",
	Reading = "https://i.imgur.com/53N4eY6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = document.location,
		pathArr = pathname.split("/"),
		showButtons = await presence.getSetting<boolean>("buttons");

	switch (pathArr[1]) {
		case "~faq":
		case "~browse": {
			const condition = pathArr[1] === "~faq";
			presenceData.details = condition ? "Browsing characters" : "Reading FAQ";
			presenceData.state = `Category: ${pathArr[2]}`;
			if (condition) presenceData.largeImageKey = Assets.Reading;
			break;
		}
		default: {
			const pageType = document.querySelector("li.header").textContent.trim();
			if (Object.keys(staticsPages).includes(pathArr[1]))
				presenceData.details = staticsPages[pathArr[1]];
			else if (pageType === "User") {
				presenceData.details = "Viewing an user page";
				presenceData.state = document.querySelector(
					".display-user-username"
				).textContent;
				presenceData.buttons = [
					{
						label: "View User",
						url: document.querySelector<HTMLLinkElement>("span > a").href,
					},
				];
			} else if (pageType === "Character") {
				const characterQuery = document.querySelector<HTMLLinkElement>(
					".display-character > a"
				);
				presenceData.details = "Viewing a character";
				presenceData.state = characterQuery.textContent;
				presenceData.buttons = [
					{
						label: "View Character",
						url: characterQuery.href,
					},
					{
						label: "View Possessor",
						url: document.querySelector<HTMLLinkElement>("span > a").href,
					},
				];
			}
		}
	}

	if (!showButtons) delete presenceData.buttons;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
