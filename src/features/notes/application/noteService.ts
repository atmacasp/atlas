import { EventBus } from "../../../core/events/EventBus";
import { markdownNoteRepository } from "../infrastructure/MarkdownNoteRepository";
import type { NoteEventMap } from "../domain/noteEvents";
import { NoteService } from "./NoteService";

/** Composition root for the notes feature. UI code depends on this service,
 * not on the Markdown repository or Expo filesystem implementation. */
export const noteEvents = new EventBus<NoteEventMap>();
export const noteService = new NoteService(markdownNoteRepository, noteEvents);
