// src/services/iframeComm.ts

/** 1. All event payloads in one place */
type PayloadMap = {
  init:           { widget: string };
  chatMessage:    { message: string };
  paymentSuccess: { sessionId: string };
  closeWidget:    undefined;
};

/** 2. Union of all events */
export type WidgetEvent = {
  [K in keyof PayloadMap]: { type: K; payload: PayloadMap[K] }
}[keyof PayloadMap];

/** 3. Type guard to validate at runtime */
function isWidgetEvent(obj: any): obj is WidgetEvent {
  if (
    typeof obj !== "object" ||
    obj === null ||
    typeof obj.type !== "string" ||
    !("payload" in obj)
  ) {
    return false;
  }
  switch (obj.type) {
    case "init":
      return typeof obj.payload.widget === "string";
    case "chatMessage":
      return typeof obj.payload.message === "string";
    case "paymentSuccess":
      return typeof obj.payload.sessionId === "string";
    case "closeWidget":
      return obj.payload === undefined;
    default:
      return false;
  }
}

/** 4. The comm class */
class IframeComm {
  private handlers: Array<(e: WidgetEvent) => void> = [];
  private receiveBound = this.receive.bind(this);

  /**
   * @param targetOrigin restricts postMessage target.
   *                     Defaults to "*", but you can set to your host’s origin.
   */
  constructor(private targetOrigin: string = "*") {

    if(typeof window === "undefined") { 
        return; // avoid running in non-browser environments
    }

    window.addEventListener("message", this.receiveBound);
  }

  private receive(e: MessageEvent) {
    // only from parent frame
    if (e.source !== window.parent) return;

    const msg = e.data;
    if (!isWidgetEvent(msg)) {
      console.warn("Ignored non-widget event:", msg);
      return;
    }

    // dispatch to all subscribers
    for (const handler of this.handlers) {
      try {
        handler(msg);
      } catch (err) {
        console.error("iframeComm handler error:", err);
      }
    }
  }

  /**
   * Subscribe to all incoming WidgetEvents.
   * @returns a function you can call to unsubscribe just this handler.
   */
  onMessage(fn: (e: WidgetEvent) => void): () => void {
    this.handlers.push(fn);
    return () => this.offMessage(fn);
  }

  /**
   * Unsubscribe a specific handler. If no fn is provided, removes all handlers.
   */
  offMessage(fn?: (e: WidgetEvent) => void) {
    if (!fn) {
      this.handlers = [];
    } else {
      this.handlers = this.handlers.filter(h => h !== fn);
    }
  }

  /** Send any event to the host. Always matches the WidgetEvent type. */
  send(event: WidgetEvent) {
    window.parent.postMessage(event, this.targetOrigin);
  }

  /** Cleanup when unmounting your entire widget */
  destroy() {
    window.removeEventListener("message", this.receiveBound);
    this.handlers = [];
  }
}

export const iframeComm = new IframeComm(/* you can pass your host origin here */);
