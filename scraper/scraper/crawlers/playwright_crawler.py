import asyncio
from playwright.async_api import async_playwright, Browser, BrowserContext
from scraper.config import settings


class PlaywrightCrawler:
    def __init__(self):
        self._browser: Browser | None = None
        self._playwright = None

    async def start(self):
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            ]
        )

    async def stop(self):
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

    async def scrape(self, url: str) -> tuple[str, str] | None:
        """Retourne (html, title) ou None si erreur."""
        if not self._browser:
            await self.start()

        context: BrowserContext = await self._browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            extra_http_headers={
                "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            }
        )

        page = await context.new_page()

        try:
            # Bloquer les ressources inutiles pour aller plus vite
            await page.route(
                "**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,pdf}",
                lambda route: route.abort()
            )

            await page.goto(
                url,
                timeout=settings.SCRAPING_TIMEOUT_SECONDS * 1000,
                wait_until="domcontentloaded"
            )
            await page.wait_for_timeout(2000)  # Attendre les rendus JS

            html = await page.content()
            title = await page.title()

            return html, title
        except Exception as e:
            print(f"Erreur scraping {url}: {e}")
            return None
        finally:
            await context.close()

    async def __aenter__(self):
        await self.start()
        return self

    async def __aexit__(self, *args):
        await self.stop()
