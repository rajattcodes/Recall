/**
 * Defensive Failure Notes Parsing
 * 
 * Safely parses failure notes from JSON string stored in AttemptHistory.notes.
 * 
 * Rule: "Invalid notes are silently ignored, not fatal."
 * 
 * Handles:
 * - Malformed JSON
 * - Non-array JSON
 * - Array of non-strings
 * - Null/undefined input
 * 
 * Never throws, always returns null on failure.
 */

/**
 * Parse failure notes from JSON string
 * 
 * @param notesString - JSON stringified array or null
 * @returns Parsed string array, or null if invalid/missing
 */
export function parseFailureNotes(
  notesString: string | null | undefined
): string[] | null {
  if (!notesString) {
    return null;
  }

  try {
    const parsed = JSON.parse(notesString);
    
    if (!Array.isArray(parsed)) {
      return null;
    }
    
    if (!parsed.every((item) => typeof item === "string")) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Serialize failure notes to JSON string
 * 
 * @param notes - Array of failure note strings
 * @returns JSON stringified array, or null if empty/undefined
 */
export function serializeFailureNotes(
  notes: string[] | undefined | null
): string | null {
  if (!notes || notes.length === 0) {
    return null;
  }

  const filtered = notes.map((note) => note.trim()).filter((note) => note.length > 0);
  
  if (filtered.length === 0) {
    return null;
  }

  return JSON.stringify(filtered);
}
