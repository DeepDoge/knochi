import { config } from "~/shared/config";

type AcceptedLanguage = (typeof ACCEPTED_LANGUAGES)[number];
const ACCEPTED_LANGUAGES = ["en-US"] as const;
const DEFAULT_LANGUAGE = "en-US" satisfies AcceptedLanguage;

export const language = config.derive<AcceptedLanguage>((config) => {
	const preferredLanguage = config.language || navigator.language;
	if (ACCEPTED_LANGUAGES.includes(preferredLanguage)) {
		return preferredLanguage as AcceptedLanguage;
	}

	const preferredLanguageBase = getBaseLanguage(preferredLanguage);
	if (!preferredLanguageBase) return DEFAULT_LANGUAGE;

	const matchedWithPreferredLanguageBase = ACCEPTED_LANGUAGES.find(
		(language) => getBaseLanguage(language) === preferredLanguageBase,
	);
	if (matchedWithPreferredLanguageBase) return matchedWithPreferredLanguageBase;

	return DEFAULT_LANGUAGE;
});

function getBaseLanguage(language: string) {
	return language.split("-")[0];
}
