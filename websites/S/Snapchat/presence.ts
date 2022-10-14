const presence = new Presence({
		clientId: "1001436152873623683",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const [privacyMode, showActiveChatAvatar] = await Promise.all([
			presence.getSetting<boolean>("privacyMode"),
			presence.getSetting<boolean>("showActiveChatAvatar"),
		]),
		presenceData: PresenceData = {
			details: "Other",
			largeImageKey: "logo",
			startTimestamp: browsingTimestamp,
		},
		activeChat = document.querySelector<HTMLDivElement>(
			".deg2K div.O4POs.qFDXZ"
		),
		activeChatUsername = activeChat?.querySelector<HTMLSpanElement>(
			"span.mYSR9 > span.FiLwP"
		)?.textContent;

	if (activeChatUsername) {
		const avatar =
				activeChat?.querySelector<HTMLImageElement>("img.Dozhe")?.src,
			snapStreak =
				activeChat?.querySelectorAll("div.ovUsZ > span")[4]?.textContent;

		presenceData.details = "Chatting with";
		presenceData.state = !privacyMode ? activeChatUsername : "somebody";

		if (!privacyMode && snapStreak) presenceData.state += ` | ${snapStreak}`;

		if (showActiveChatAvatar && avatar) {
			presenceData.largeImageKey = avatar;
			presenceData.smallImageKey = "logo";
		}
	}

	if (presenceData.details && window.location.pathname.split("/")[1])
		presence.setActivity(presenceData);
	else presence.setActivity();
});
