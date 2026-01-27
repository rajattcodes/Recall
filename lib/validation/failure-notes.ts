/**
 * Failure Notes Validation
 * 
 * Validates failure notes according to strict constraints:
 * - Max 3 bullets
 * - Max 15 words per bullet
 * - Whitelist text validation (letters, spaces, basic punctuation only)
 */

const ALLOWED_CHARS_REGEX = /^[a-zA-Z\s.,;:'-]+$/;

/**
 * Count words in text using explicit definition:
 * - A word = sequence of characters separated by whitespace
 * - Strip punctuation for counting purposes
 * - Count tokens that contain at least one alphabet character
 * 
 * Examples:
 * - "non-monotonic" = 1 word
 * - "O(n)" = 1 word (parentheses stripped, "On" counted)
 * - "two-pointers" = 1 word
 * - "Didn't consider" = 2 words
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  
  const words = text
    .trim()
    .split(/\s+/)
    .map(word => word.replace(/[^\w'-]/g, ''))
    .filter(word => /[a-zA-Z]/.test(word));
  
  return words.length;
}

/**
 * Validate that text contains only allowed characters
 * 
 * Allowed:
 * - Letters (a-z, A-Z)
 * - Spaces
 * - Basic punctuation: . , ; : ' -
 * 
 * Rejects anything else (numbers, special chars, code symbols)
 */
export function isValidFailureNoteText(text: string): boolean {
  if (!text.trim()) return true;
  return ALLOWED_CHARS_REGEX.test(text);
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate failure notes array
 * 
 * Rules:
 * - Max 3 bullets
 * - Each bullet max 15 words
 * - Each bullet must pass whitelist validation
 * - Empty array is valid (user can skip notes)
 */
export function validateFailureNotes(
  notes: string[] | undefined | null
): ValidationResult {
  if (!notes || notes.length === 0) {
    return { isValid: true };
  }

  if (notes.length > 3) {
    return {
      isValid: false,
      error: "Maximum 3 failure notes allowed",
    };
  }

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    
    if (typeof note !== "string") {
      return {
        isValid: false,
        error: `Failure note ${i + 1} must be a string`,
      };
    }

    const trimmedNote = note.trim();
    
    if (trimmedNote && !isValidFailureNoteText(trimmedNote)) {
      return {
        isValid: false,
        error: `Failure note ${i + 1} contains invalid characters. Only letters, spaces, and basic punctuation (. , ; : ' -) are allowed`,
      };
    }

    const wordCount = countWords(trimmedNote);
    if (wordCount > 15) {
      return {
        isValid: false,
        error: `Failure note ${i + 1} exceeds 15 words (found ${wordCount})`,
      };
    }
  }

  return { isValid: true };
}
