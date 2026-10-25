import { EventBus } from "../../../core/events/EventBus";
import type { Note, NoteInput } from "../domain/Note";
import type { NoteEventMap } from "../domain/noteEvents";
import type { NoteRepository } from "./NoteRepository";

export class NoteService {
  constructor(
    private readonly repository: NoteRepository,
    private readonly events: EventBus<NoteEventMap>,
  ) {}

  getAll(): Promise<readonly Note[]> {
    return this.repository.getAll();
  }

  getById(id: string): Promise<Note | null> {
    return this.repository.getById(id);
  }

  async create(input: NoteInput): Promise<Note> {
    const note = await this.repository.create(input);
    this.events.emit("note.created", { note });
    return note;
  }

  async update(id: string, input: NoteInput): Promise<Note> {
    const note = await this.repository.update(id, input);
    this.events.emit("note.updated", { note });
    return note;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    this.events.emit("note.deleted", { noteId: id });
  }
}
