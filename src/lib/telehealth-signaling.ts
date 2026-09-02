"use client";

export type TelehealthSignal =
  | {
      type: "CALL_INITIATED";
      doctorId: string;
      doctorName: string;
      patientId: string;
      woundTitle?: string;
      roomUrl?: string;
      timestamp: number;
    }
  | {
      type: "CALL_ACCEPTED";
      doctorId: string;
      patientId: string;
      timestamp: number;
    }
  | {
      type: "CALL_DECLINED";
      doctorId: string;
      patientId: string;
      reason?: string;
      timestamp: number;
    }
  | {
      type: "CALL_ENDED";
      doctorId: string;
      patientId: string;
      timestamp: number;
    };

const BROADCAST_CHANNEL_NAME = "lant_telehealth_bus";
const STORAGE_EVENT_KEY = "LANT_TELEHEALTH_BUS_EVENT";
const ACTIVE_CALL_PREFIX = "LANT_ACTIVE_CALL_";

let sharedBroadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!sharedBroadcastChannel && typeof BroadcastChannel !== "undefined") {
    try {
      sharedBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch (e) {
      console.warn("BroadcastChannel not supported or error initializing:", e);
    }
  }
  return sharedBroadcastChannel;
}

export const TelehealthSignalingEngine = {
  /**
   * Broadcast a signal across all browser tabs and windows
   */
  sendSignal(signal: TelehealthSignal): void {
    if (typeof window === "undefined") return;

    // 1. Maintain active call cache in localStorage
    if (signal.type === "CALL_INITIATED") {
      try {
        localStorage.setItem(
          `${ACTIVE_CALL_PREFIX}${signal.patientId}`,
          JSON.stringify(signal)
        );
      } catch (e) {
        console.warn("Storage write failed", e);
      }
    } else if (signal.type === "CALL_DECLINED" || signal.type === "CALL_ENDED") {
      try {
        localStorage.removeItem(`${ACTIVE_CALL_PREFIX}${signal.patientId}`);
      } catch (e) {
        console.warn("Storage remove failed", e);
      }
    }

    // 2. Broadcast via BroadcastChannel (modern zero-lag IPC)
    const channel = getBroadcastChannel();
    if (channel) {
      try {
        channel.postMessage(signal);
      } catch (e) {
        console.warn("BroadcastChannel postMessage failed:", e);
      }
    }

    // 3. Fallback broadcast via StorageEvent (cross-tab)
    try {
      localStorage.setItem(
        STORAGE_EVENT_KEY,
        JSON.stringify({ ...signal, _bust: Date.now() })
      );
    } catch (e) {
      console.warn("Storage event trigger failed", e);
    }

    // 4. Same-tab CustomEvent dispatch
    window.dispatchEvent(
      new CustomEvent("LANT_TELEHEALTH_LOCAL_SIGNAL", { detail: signal })
    );
  },

  /**
   * Subscribe to all incoming telehealth signals (BroadcastChannel + StorageEvent + LocalEvent)
   */
  subscribe(callback: (signal: TelehealthSignal) => void): () => void {
    if (typeof window === "undefined") return () => {};

    // A. BroadcastChannel Listener
    const channel = getBroadcastChannel();
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object" && "type" in event.data) {
        callback(event.data as TelehealthSignal);
      }
    };
    if (channel) {
      channel.addEventListener("message", handleBroadcastMessage);
    }

    // B. StorageEvent Listener (Cross-tab)
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === STORAGE_EVENT_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as TelehealthSignal;
          if (parsed && parsed.type) {
            callback(parsed);
          }
        } catch (e) {
          console.warn("Failed to parse storage event signal", e);
        }
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // C. Same-tab Local CustomEvent Listener
    const handleLocalSignal = (event: Event) => {
      const custom = event as CustomEvent<TelehealthSignal>;
      if (custom.detail) {
        callback(custom.detail);
      }
    };
    window.addEventListener("LANT_TELEHEALTH_LOCAL_SIGNAL", handleLocalSignal);

    // Return unsubscriber
    return () => {
      if (channel) {
        channel.removeEventListener("message", handleBroadcastMessage);
      }
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("LANT_TELEHEALTH_LOCAL_SIGNAL", handleLocalSignal);
    };
  },

  /**
   * Check if there is an active incoming call signal for a patient
   */
  getActiveCall(patientId: string): TelehealthSignal | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${ACTIVE_CALL_PREFIX}${patientId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Calls older than 90 seconds expire automatically
      if (Date.now() - parsed.timestamp > 90000) {
        localStorage.removeItem(`${ACTIVE_CALL_PREFIX}${patientId}`);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Clear active call signal for a patient
   */
  clearActiveCall(patientId: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(`${ACTIVE_CALL_PREFIX}${patientId}`);
    } catch (e) {
      console.warn("Storage clear error", e);
    }
  }
};
