const presence = new Presence({
		clientId: "1017593958546821160",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
	const presenseData: PresenceData = {
			largeImageKey: "https://i.imgur.com/hkrB6W8.png",
			startTimestamp: browsingTimestamp,
		},
		{ hostname, pathname } = window.location;
	switch (hostname) {
		case "picard.musicbrainz.org": {
			presenseData.details = "Browsing...";
			switch (pathname.split("/")[1]) {
				case "": {
					presenseData.state = "Home page";
					break;
				}
				case "docs": {
					presenseData.details = "Browsing documentation";
					presenseData.state = document.querySelector("h1").textContent;
					break;
				}
				default: {
					presenseData.state = document.title.match(
						/(.*?)( - MusicBrainz Picard$|$)/
					)[1];
				}
			}
			break;
		}
		case "picard-docs.musicbrainz.org": {
			presenseData.details = "Browsing documentation...";
			if (pathname.match(/^(?:\/v[\d.]+)?\/[a-z]{2}\/(.*)/)[1] === "index.html")
				presenseData.state = "Home page";
			else {
				const { textContent } = document.querySelector("h1");
				presenseData.state = textContent.substring(0, textContent.length - 1);
			}
			break;
		}
	}
	presence.setActivity(presenseData);
});
