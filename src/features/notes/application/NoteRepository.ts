import type { Note, NoteInput } from "../domain/Note";

/**
 * Persistence port used by application services. Implementations may use
 * local Markdown files today and a different adapter in the future.
 */
export interface NoteRepository {
  getAll(): Promise<readonly Note[]>;
  getById(id: string): Promise<Note | null>;
  create(input: NoteInput): Promise<Note>;
  update(id: string, input: NoteInput): Promise<Note>;
  delete(id: string): Promise<void>;
}
