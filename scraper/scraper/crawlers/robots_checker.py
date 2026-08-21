import urllib.robotparser
from urllib.parse import urljoin, urlparse
import httpx


class RobotsChecker:
    def __init__(self):
        self._cache: dict[str, urllib.robotparser.RobotFileParser] = {}

    async def is_allowed(self, url: str, user_agent: str = "KronyxBot") -> bool:
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"

        if base_url not in self._cache:
            robots_url = urljoin(base_url, "/robots.txt")
            parser = urllib.robotparser.RobotFileParser()
            parser.set_url(robots_url)
            try:
                async with httpx.AsyncClient(timeout=5) as client:
                    resp = await client.get(robots_url)
                    if resp.status_code == 200:
                        parser.parse(resp.text.splitlines())
                    else:
                        # Si robots.txt absent ou erreur, on suppose que tout est permis
                        return True
            except Exception:
                return True
            self._cache[base_url] = parser

        return self._cache[base_url].can_fetch(user_agent, url)


robots_checker = RobotsChecker()
