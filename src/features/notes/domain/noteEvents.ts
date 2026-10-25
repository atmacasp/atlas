import type { Note } from "./Note";

/**
 * Events describe facts that have already happened. Emit them only after the
 * repository operation succeeds. Payloads are intentionally small except for
 * create/update, where subscribers may need the persisted snapshot.
 */
export interface NoteEventMap {
  "note.created": { readonly note: Note };
  "note.updated": { readonly note: Note };
  "note.deleted": { readonly noteId: string };
}
