export interface User {
  id: string;
  email: string;
  company_name: string | null;
  timezone: string;
  notification_emails: string[];
  synthesis_tone: string;
  plan: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  user_id: string;
  name: string;
  website: string;
  is_active: boolean;
  created_at: string;
  pages_count: number;
}

export interface Page {
  id: string;
  competitor_id: string;
  url: string;
  type: 'pricing' | 'blog' | 'changelog' | 'custom';
  is_active: boolean;
  last_scraped_at: string | null;
}

export interface Change {
  id: string;
  page_id: string;
  diff_text: string | null;
  category: string | null;
  impact_level: 'low' | 'medium' | 'high';
  summary: string | null;
  key_changes: string | null;
  strategic_recommendation: string | null;
  analyzed_at: string;
  competitor_name: string | null;
  page_url: string | null;
  page_type: string | null;
}

export interface DashboardStats {
  total_competitors: number;
  total_pages: number;
  changes_today: number;
  changes_week: number;
  changes_month: number;
}

export interface Report {
  id: string;
  user_id: string;
  report_date: string;
  content: {
    total_changes: number;
    high_impact_count: number;
    competitors_affected: number;
    changes_by_competitor: Record<string, Change[]>;
  };
  sent_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
