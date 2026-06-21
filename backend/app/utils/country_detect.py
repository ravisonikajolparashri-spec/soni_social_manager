"""
Best-effort country detection for SMM services and geolocation-to-country
mapping for visitors — shared so both sides use the same country names
(e.g. "India", "USA"), which is what makes the "show my country's services
first" sort in services.py actually match anything.
"""
import re

# Keyword -> canonical country name. Checked against a service's name +
# category (case-insensitive). Order matters only in that the first match
# wins, so more specific keywords should stay above the generic ones.
COUNTRY_KEYWORDS: dict[str, str] = {
    "india": "India", "indian": "India",
    "usa": "USA", "united states": "USA", "america": "USA", "u.s.a": "USA",
    "uk": "UK", "united kingdom": "UK", "britain": "UK", "england": "UK",
    "brazil": "Brazil", "brasil": "Brazil", "brazilian": "Brazil",
    "indonesia": "Indonesia", "indonesian": "Indonesia",
    "pakistan": "Pakistan", "pakistani": "Pakistan",
    "bangladesh": "Bangladesh", "bangladeshi": "Bangladesh",
    "philippines": "Philippines", "filipino": "Philippines", "philippine": "Philippines",
    "vietnam": "Vietnam", "vietnamese": "Vietnam",
    "russia": "Russia", "russian": "Russia",
    "arab": "Arab", "arabic": "Arab", "saudi": "Arab", "uae": "Arab", "dubai": "Arab",
    "turkey": "Turkey", "turkish": "Turkey",
    "mexico": "Mexico", "mexican": "Mexico",
    "nigeria": "Nigeria", "nigerian": "Nigeria",
    "egypt": "Egypt", "egyptian": "Egypt",
    "france": "France", "french": "France",
    "germany": "Germany", "german": "Germany",
    "spain": "Spain", "spanish": "Spain",
    "italy": "Italy", "italian": "Italy",
    "korea": "South Korea", "korean": "South Korea",
    "japan": "Japan", "japanese": "Japan",
    "china": "China", "chinese": "China",
    "thailand": "Thailand", "thai": "Thailand",
    "malaysia": "Malaysia", "malaysian": "Malaysia",
    "canada": "Canada", "canadian": "Canada",
    "australia": "Australia", "australian": "Australia",
    "south africa": "South Africa",
    "argentina": "Argentina",
    "colombia": "Colombia",
}

# ISO 3166-1 alpha-2 country code (what IP-geolocation APIs return) -> the
# canonical names used above, so a visitor's resolved country lines up with
# how services are tagged.
COUNTRY_CODE_TO_NAME: dict[str, str] = {
    "IN": "India", "US": "USA", "GB": "UK", "BR": "Brazil", "ID": "Indonesia",
    "PK": "Pakistan", "BD": "Bangladesh", "PH": "Philippines", "VN": "Vietnam",
    "RU": "Russia", "SA": "Arab", "AE": "Arab", "TR": "Turkey", "MX": "Mexico",
    "NG": "Nigeria", "EG": "Egypt", "FR": "France", "DE": "Germany", "ES": "Spain",
    "IT": "Italy", "KR": "South Korea", "JP": "Japan", "CN": "China", "TH": "Thailand",
    "MY": "Malaysia", "CA": "Canada", "AU": "Australia", "ZA": "South Africa",
    "AR": "Argentina", "CO": "Colombia",
}

DEFAULT_COUNTRY = "Global"


def detect_country(name: str, category: str = "") -> str:
    """Scan a service's name/category for a country keyword. Falls back to 'Global'."""
    haystack = f"{name} {category}".lower()
    for keyword, country in COUNTRY_KEYWORDS.items():
        # word-boundary match so "indian" doesn't match inside unrelated words
        if re.search(rf"\b{re.escape(keyword)}\b", haystack):
            return country
    return DEFAULT_COUNTRY


def country_from_code(country_code: str) -> str | None:
    return COUNTRY_CODE_TO_NAME.get((country_code or "").upper())
