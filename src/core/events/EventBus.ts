/**
 * A minimal in-process event bus for decoupling independent application
 * features. This is not a persistence mechanism and does not provide replay.
 *
 * Keep handlers short. Persist changes before emitting success events.
 */
export type EventListener<T> = (payload: T) => void;

export class EventBus<Events extends object> {
  private readonly listeners = new Map<keyof Events, Set<EventListener<never>>>();

  constructor(
    private readonly onListenerError: (error: unknown, eventName: keyof Events) => void =
      (error, eventName) => {
        // A subscriber must not make a successfully persisted command look failed.
        console.error(`Atlas event listener failed for "${String(eventName)}"`, error);
      },
  ) {}

  subscribe<K extends keyof Events>(
    eventName: K,
    listener: EventListener<Events[K]>,
  ): () => void {
    let eventListeners = this.listeners.get(eventName);
    if (!eventListeners) {
      eventListeners = new Set<EventListener<never>>();
      this.listeners.set(eventName, eventListeners);
    }

    eventListeners.add(listener as EventListener<never>);
    return () => {
      const current = this.listeners.get(eventName);
      current?.delete(listener as EventListener<never>);
      if (current?.size === 0) this.listeners.delete(eventName);
    };
  }

  emit<K extends keyof Events>(eventName: K, payload: Events[K]): void {
    // Snapshot the set so subscribe/unsubscribe during dispatch is deterministic.
    const eventListeners = [...(this.listeners.get(eventName) ?? [])];
    for (const listener of eventListeners) {
      try {
        (listener as EventListener<Events[K]>)(payload);
      } catch (error) {
        this.onListenerError(error, eventName);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
