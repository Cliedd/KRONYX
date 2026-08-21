from scraper.crawlers.content_cleaner import compute_content_hash, clean_html_to_text


class HashDetector:
    def has_changed(self, old_hash: str | None, new_html: str) -> tuple[bool, str, str]:
        """
        Retourne (changed, new_hash, new_text).

        Si old_hash est None, c'est la premiere fois qu'on scrape cette page —
        on retourne changed=True pour sauvegarder le snapshot initial.
        """
        new_text = clean_html_to_text(new_html)
        new_hash = compute_content_hash(new_text)

        if old_hash is None:
            # Premiere fois qu'on scrape cette page
            return True, new_hash, new_text

        changed = old_hash != new_hash
        return changed, new_hash, new_text
