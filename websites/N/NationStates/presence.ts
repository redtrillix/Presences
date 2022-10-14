enum Assets {
	Header = "https://i.imgur.com/ffxJj5E.png",
	Logo = "https://i.imgur.com/04gnehi.png",
	Envelope = "https://i.imgur.com/6Hp3f7k.png",
	Flag = "https://i.imgur.com/BAzbs0d.png",
	Forum = "https://i.imgur.com/uDIj1ta.png",
	Gift = "https://i.imgur.com/28eyl2A.png",
	Globe = "https://i.imgur.com/hE7TN9d.png",
	Page = "https://i.imgur.com/pArUzoy.png",
	Person = "https://i.imgur.com/8pTlzJw.png",
	WorldAssembly = "https://i.imgur.com/A09MAL2.png",
	Target = "https://i.imgur.com/nksi1kH.png",
}

const browsingTimestamp = Math.floor(Date.now() / 1000),
	presence = new Presence({
		clientId: "1006869424441131109",
	}),
	presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
		startTimestamp: browsingTimestamp,
	};

async function fetchSelfNationName(): Promise<string | null> {
	if (document.body.id !== "loggedin") return null;

	const username: string = document.body.getAttribute("data-nname");
	if (!username) return null;

	const nationdata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?nation=${username}&q=name+type&v=2`
	);
	if (!nationdata.ok) return null;

	const nationparsed = new DOMParser().parseFromString(
			await nationdata.text(),
			"text/html"
		),
		nationname = nationparsed.querySelector("NAME").textContent,
		nationtype = `${nationparsed.querySelector("TYPE").textContent} of`,
		namesetting: number = await presence.getSetting("displayname");

	if (nationname.length + nationtype.length + 2 <= 128 && namesetting > 1)
		return `${nationname}, ${nationtype}`;
	else if (nationname.length <= 128 && namesetting > 0) return nationname;
	else if (namesetting > 0) return `${nationname.substring(0, 128 - 1)}…`;
	else return "";
}

async function fetchNationName(id: string): Promise<string | null> {
	const nationdata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?nation=${id}&q=name&v=2`
	);
	if (!nationdata.ok) return null;

	const nationname = new DOMParser()
		.parseFromString(await nationdata.text(), "text/html")
		.querySelector("NAME").textContent;

	if (nationname.length + 16 <= 128) return nationname;
	else return `${nationname.substring(0, 128 - 17)}…`;
}

async function fetchRegionName(id: string): Promise<string | null> {
	const regiondata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?region=${id}&q=name&v=2`
	);
	if (!regiondata.ok) return null;

	const regionname = new DOMParser()
		.parseFromString(await regiondata.text(), "text/html")
		.querySelector("NAME").textContent;

	if (regionname.length + 16 <= 128) return regionname;
	else return `${regionname.substring(0, 128 - 17)}…`;
}

async function updatePresenceData(): Promise<void> {
	if (document.location.hostname === "www.nationstates.net") {
		const isLoggedIn: boolean = document.body.id === "loggedin",
			username: string = document.body.getAttribute("data-nname"),
			nationname: string = await fetchSelfNationName();
		if (nationname && nationname.length > 0) presenceData.details = nationname;
		else delete presenceData.details;

		if (isLoggedIn && (await presence.getSetting("buttons"))) {
			presenceData.buttons = [
				{
					label: "View Nation",
					url: `https://www.nationstates.net/nation=${username}`,
				},
			];
		} else delete presenceData.buttons;

		const path = window.location.pathname.toLowerCase(),
			page = path
				.substring(path.indexOf("=") + 1)
				.replace(/\/.+/iu, "")
				.replace(/\?.+/iu, "")
				.toLowerCase();

		switch (
			path.substring(path.indexOf("/") + 1, path.indexOf("=")).toLowerCase()
		) {
			case "nation": {
				if (isLoggedIn && page === username) {
					presenceData.state = "Viewing Nation";
					presenceData.smallImageKey = Assets.Flag;
					presenceData.smallImageText = "My Nation";
				} else {
					const nationname: string = await fetchNationName(page);
					presenceData.state = nationname
						? `Viewing Nation: ${nationname}`
						: "Viewing a Nation";
					presenceData.smallImageKey = Assets.Globe;
					presenceData.smallImageText = "World";
				}
				return;
			}

			case "region": {
				const regionname = await fetchRegionName(page);
				presenceData.state = regionname
					? `Viewing Region: ${regionname}`
					: "Viewing a Region";
				presenceData.smallImageKey = Assets.Globe;
				presenceData.smallImageText = "World";
				return;
			}

			case "page":
				break;

			default:
				presenceData.state = "Browsing";
				delete presenceData.smallImageKey;
				return;
		}

		switch (page) {
			case "create_nation":
				presenceData.state = "Declaring a New Nation";
				presenceData.smallImageKey = Assets.Flag;
				presenceData.smallImageText = "My Nation";
				break;

			case "display_region_rmb":
			case "region_control":
			case "region_history":
			case "region_rank":
				presenceData.state = "Attending Regional Activities";
				presenceData.smallImageKey = Assets.Flag;
				presenceData.smallImageText = "Region";
				break;

			case "telegram":
			case "telegrams":
			case "tg":
			case "notices":
			case "notice":
				presenceData.state = "Reading Telegrams";
				presenceData.smallImageKey = Assets.Envelope;
				presenceData.smallImageText = "Telegrams";
				break;

			case "write_telegram":
			case "compose_telegram":
				presenceData.state = "Writing a Telegram";
				presenceData.smallImageKey = Assets.Envelope;
				presenceData.smallImageText = "Telegrams";
				break;

			case "world":
			case "dossier":
			case "change_region":
			case "list_entities":
			case "list_nations":
			case "list_regions":
			case "tag_search":
			case "activity":
				presenceData.state = "Observing the World";
				presenceData.smallImageKey = Assets.Globe;
				presenceData.smallImageText = "World";
				break;

			case "deck":
				presenceData.state = "Playing Cards";
				delete presenceData.smallImageKey;
				break;

			case "store":
			case "cart":
			case "order":
				presenceData.state = "Browsing the Store";
				presenceData.smallImageKey = Assets.Gift;
				presenceData.smallImageText = "Store";
				break;

			case "challenge": {
				const opponent = [
					...document
						.querySelector(".trumps-challenger")
						.querySelectorAll(".nname"),
				].find(
					challanger =>
						challanger.textContent.toLowerCase().split(" ").join("_") !==
						username
				);
				if (opponent && opponent.textContent)
					presenceData.state = `Challenging ${opponent.textContent}`;
				else presenceData.state = "Challenging";
				presenceData.smallImageKey = Assets.Target;
				presenceData.smallImageText = "Challenge";
				break;
			}

			case "settings":
			case "banners":
			case "upload_flag":
			case "tgsettings":
			case "subscriptions":
				presenceData.state = "Configuring NationStates";
				delete presenceData.smallImageKey;
				break;

			case "dispatches":
				presenceData.state = "Browsing Dispatches";
				presenceData.smallImageKey = Assets.Page;
				presenceData.smallImageText = "Dispatches";
				break;

			case "dispatch": {
				const dispatchname = document
					.querySelector("#content")
					?.querySelector(".dispatch")
					?.querySelector("h2")?.textContent;
				if (dispatchname) {
					presenceData.state = `Dispatch: ${
						dispatchname.length > 128 - 10
							? `${dispatchname.substring(0, 128 - 11)}…'`
							: dispatchname
					}`;
				} else presenceData.state = "Browsing Dispatches";
				presenceData.smallImageKey = Assets.Page;
				presenceData.smallImageText = "Dispatches";
				break;
			}

			case "issues":
			case "dilemmas":
				presenceData.state = "Browsing Issues";
				presenceData.smallImageKey = Assets.Person;
				presenceData.smallImageText = "Issues";
				break;

			case "show_dilemma": {
				const issuename = document
					.querySelector("#content")
					?.querySelector(".dpaper4")?.textContent;
				if (issuename) {
					presenceData.state = `Issue: ${
						issuename.length > 128 - 7
							? `${issuename.substring(0, 128 - 7)}…'`
							: issuename
					}`;
				} else presenceData.state = "Browsing Issues";
				presenceData.smallImageKey = Assets.Person;
				presenceData.smallImageText = "Issues";
				break;
			}

			case "enact_dilemma": {
				const issuename = document
					.querySelector("#dlegislationtext")
					?.querySelector("p.dtitle")?.textContent;
				if (issuename) {
					presenceData.state = `Issue: ${
						issuename.length > 128 - 7
							? `${issuename.substring(0, 128 - 7)}…'`
							: issuename
					}`;
				} else presenceData.state = "Browsing Issues";
				presenceData.smallImageKey = Assets.Person;
				presenceData.smallImageText = "Issues";
				break;
			}

			case "wa":
			case "un":
			case "list_un":
			case "list_wa":
			case "un_proposal":
			case "wa_proposal":
				presenceData.state = "Attending the World Assembly";
				presenceData.smallImageKey = Assets.WorldAssembly;
				presenceData.smallImageText = "World Assembly";
				break;

			case "un_repeal":
			case "wa_repeal":
			case "un_new_proposal":
			case "wa_new_proposal":
				presenceData.state = "Writing a new WA proposal";
				presenceData.smallImageKey = Assets.WorldAssembly;
				presenceData.smallImageText = "World Assembly";
				break;

			case "ga":
			case "sc":
			case "wa_past_resolution":
			case "wa_past_resolutions":
			case "un_past_resolution":
			case "un_past_resolutions": {
				const resolution = document
					.querySelector(".WA_thing")
					?.querySelector("h2")?.textContent;
				if (resolution && document.querySelectorAll(".WA_thing").length === 1) {
					presenceData.state = `Resolution: ${
						resolution.length > 128 - 7
							? `${resolution.substring(0, 128 - 7)}…'`
							: resolution
					}`;
				} else presenceData.state = "Attending the World Assembly";
				presenceData.smallImageKey = Assets.WorldAssembly;
				presenceData.smallImageText = "World Assembly";
				break;
			}

			default:
				presenceData.state = "Browsing";
				delete presenceData.smallImageKey;
				break;
		}
	} else if (document.location.hostname === "forum.nationstates.net") {
		presenceData.details = "Browsing the Forums";
		presenceData.smallImageKey = Assets.Forum;
		presenceData.smallImageText = "Forums";
		delete presenceData.buttons;

		const { title } = document;
		if (title.startsWith("NationStates • View")) {
			const topicsearch = title.match(/(?<=nationstates\s•\sview\s).+/gi);
			if (topicsearch) {
				let topic = topicsearch[0];
				topic = topic.charAt(0).toUpperCase() + topic.slice(1);
				if (topic.length > 128) topic = `${topic.substring(0, 128)}…`;
				presenceData.state = topic;
			} else delete presenceData.state;
		} else delete presenceData.state;
	} else {
		delete presenceData.state;
		delete presenceData.details;
	}
}
setInterval(updatePresenceData, 10000);

presence.on("UpdateData", async () => {
	if (presenceData.state || presenceData.details)
		presence.setActivity(presenceData);
});
