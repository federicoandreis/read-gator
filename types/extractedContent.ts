export type ContentSourceType = 'url' | 'text' | 'pdf' | 'image';

export interface ExtractedContent {
  /** The main text content to analyse */
  text: string;
  /** Where this content came from */
  source: {
    type: ContentSourceType;
    url?: string;
    title?: string;
    author?: string;
    publishDate?: string;
    domain?: string;
    description?: string;
  };
  /** How reliable the extraction was */
  extractionQuality: 'high' | 'medium' | 'low';
  /** Any notes about extraction issues */
  extractionNotes?: string;
  /** Was the content truncated? */
  truncated: boolean;
  /** Original content length in characters */
  originalLength: number;
}
