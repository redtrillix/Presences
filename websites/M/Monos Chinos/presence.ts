type PageAction = {
	id: string;
	path: string;
	text: string;
	icon?: string;
};

type VideoContext = {
	elapsed: number;
	duration: number;
	ended: boolean;
	paused: boolean;
};

const presence = new Presence({
		clientId: "707389880505860156",
	}),
	strings = presence.getStrings({
		playing: "general.playing",
		paused: "general.paused",
		browsing: "general.browsing",
		episode: "presence.media.info.episode",
	});
let video: VideoContext = null,
	lastVideoOption = 1;

presence.on("iFrameData", async (context: VideoContext) => {
	video = context;
});

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
		},
		browsingData: PresenceData = {
			largeImageKey: "logo",
			details: (await strings).browsing,
			smallImageKey: "browsing",
			smallImageText: (await strings).browsing,
		},
		actions: PageAction[] = [
			{
				id: "episode",
				path: "/ver/",
				text: (await strings).playing,
			},
			{
				id: "seasonList",
				path: "/emision",
				text: "viendo lista de emisión",
				icon: "season",
			},
			{
				id: "directory",
				path: "/animes",
				text: "viendo el directorio",
				icon: "directory",
			},
			{
				id: "seasonCalendar",
				path: "/calendario",
				text: "viendo el calendario",
				icon: "season",
			},
			{
				id: "directoryAnime",
				path: "/anime/",
				text: "viendo lista de episodios",
				icon: "directory",
			},
			{
				id: "search",
				path: "/buscar",
				text: "buscando animes:",
				icon: "search",
			},
			{
				id: "profile",
				path: "/mi-perfil",
				text: "Viendo perfil",
			},
		];
	let action: PageAction = null;

	for (const [i, info] of actions.entries()) {
		if (document.location.pathname.startsWith(info.path)) {
			action = actions[i];
			break;
		}
	}

	if (action === null) Object.assign(presenceData, browsingData);
	else if (action.id === "episode") {
		const detailsMatch = document
			.querySelector(".heromain_h1")
			.textContent.match(/^([^\d]+).* (\d+).+$/);

		if (!detailsMatch) return presence.setActivity(browsingData);

		const [title, episode] = detailsMatch.slice(1);

		Object.assign(presenceData, {
			details: title,
			state: (await strings).episode.replace("{0}", episode),
			smallImageKey: "browsing",
			smallImageText: "viendo el capitulo",
		});

		const currentOptionElement = document.querySelector(
				".TPlayerNv > .Button.Current"
			),
			currentOption = currentOptionElement
				? parseInt(
						currentOptionElement
							.getAttribute("data-tplayernv")
							.match(/Opt(\d+)/i)[1]
				  )
				: -1;

		if (currentOption !== -1 && currentOption !== lastVideoOption) {
			lastVideoOption = currentOption;
			video = null;
		}

		if (!video || (video && video.ended))
			return presence.setActivity(presenceData);

		const [startTimestamp, endTimestamp] = presence.getTimestamps(
			Math.floor(video.elapsed),
			Math.floor(video.duration)
		);

		Object.assign(presenceData, {
			smallImageKey: video.paused ? "paused" : "playing",
			smallImageText: (await strings)[video.paused ? "paused" : "playing"],
		} as PresenceData);

		if (!video.paused) {
			Object.assign(presenceData, {
				startTimestamp,
				endTimestamp,
			});
		}
	} else {
		if (
			document.location.pathname.includes("/anime/") &&
			document.querySelector("div.chapterdetails h1")
		) {
			presenceData.state = document.querySelector(
				"div.chapterdetails h1"
			).textContent;
		}

		if (
			document.location.pathname.includes("/buscar") &&
			document.querySelector("div.heroarea h1 span")
		) {
			presenceData.state = document.querySelector(
				"div.heroarea h1 span"
			).textContent;
		}

		if (
			document.location.pathname.includes("/mi-perfil") &&
			document.querySelector("div.profile div.promain h1")
		) {
			presenceData.state = document.querySelector(
				"div.profile div.promain h1"
			).textContent;
		}

		Object.assign(presenceData, {
			details: action.text,
			smallImageKey: action.icon,
			smallImageText: action.text,
		} as PresenceData);
	}

	presence.setActivity(presenceData);
});
