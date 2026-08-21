from scraper.crawlers.content_cleaner import extract_diff


class ChangeAnalyzer:
    def prepare_change_data(
        self,
        old_text: str,
        new_text: str,
        competitor_name: str,
        page_type: str,
        page_url: str,
    ) -> dict:
        """Prepare les donnees de changement pour l'analyse IA."""
        diff = extract_diff(old_text, new_text)

        return {
            "competitor_name": competitor_name,
            "page_type": page_type,
            "page_url": page_url,
            "old_content": old_text[:2000],
            "new_content": new_text[:2000],
            "diff_text": diff,
        }
