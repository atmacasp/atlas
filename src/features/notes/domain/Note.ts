/**
 * Domain-level note shape. Storage-specific paths and Expo APIs belong in
 * infrastructure adapters, not in this contract.
 */
export interface Note {
  readonly id: string;
  readonly title: string;
  readonly file: string;
  readonly content: string;
  readonly links: readonly string[];
  readonly tags: readonly string[];
}

/** Data accepted when creating or updating a note. */
export interface NoteInput {
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
}
