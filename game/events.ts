"use client";

type DojoEventHandler<T = unknown> = (payload: T) => void;

class DojoEventBus {
  private readonly target = new EventTarget();

  emit<T>(eventName: string, payload?: T) {
    this.target.dispatchEvent(
      new CustomEvent(eventName, {
        detail: payload
      })
    );
  }

  on<T>(eventName: string, handler: DojoEventHandler<T>) {
    const listener = (event: Event) => {
      handler((event as CustomEvent<T>).detail);
    };

    this.target.addEventListener(eventName, listener);

    return () => {
      this.target.removeEventListener(eventName, listener);
    };
  }
}

export const EventBus = new DojoEventBus();
