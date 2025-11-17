import { create } from "zustand";

export type MessageRole = "user" | "ai";

export type GuestMessage = {
  id: string;
  role: MessageRole;
  content: string;
  mode: string;
  chaosLevel: number;
  answerIndex?: number;
  createdAt: string;
};

export type GuestThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: GuestMessage[];
};

type GuestState = {
  threads: Record<string, GuestThread>;
  threadOrder: string[];
  activeThreadId: string | null;
  hydrated: boolean;
  hydrate: () => void;
  newThread: () => void;
  selectThread: (id: string) => void;
  deleteThread: (id: string) => void;
  addMessage: (threadId: string, msg: GuestMessage) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
};

const STORAGE_KEY = "pz_guest_state";

function loadInitialState(): Omit<
  GuestState,
  | "hydrated"
  | "hydrate"
  | "newThread"
  | "selectThread"
  | "deleteThread"
  | "addMessage"
  | "updateThreadTitle"
> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { threads: {}, threadOrder: [], activeThreadId: null };
    }
    const parsed = JSON.parse(raw);
    return {
      threads: parsed.threads ?? {},
      threadOrder: parsed.threadOrder ?? [],
      activeThreadId: parsed.activeThreadId ?? null,
    };
  } catch {
    return { threads: {}, threadOrder: [], activeThreadId: null };
  }
}

function persistState(state: GuestState) {
  const { threads, threadOrder, activeThreadId } = state;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ threads, threadOrder, activeThreadId })
  );
}

export const useGuestStore = create<GuestState>((set, get) => ({
  threads: {},
  threadOrder: [],
  activeThreadId: null,
  hydrated: false,

  hydrate: () => {
    const initial = loadInitialState();
    set({ ...initial, hydrated: true });
  },

  newThread: () => {
    const state = get();
    if (state.threadOrder.length >= 10) {
      // guest limit
      alert(
        "Free plan limit reached: 10 threads. Delete one to create a new one."
      );
      return;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const thread: GuestThread = {
      id,
      title: "New chaos",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    const nextState: GuestState = {
      ...state,
      threads: { ...state.threads, [id]: thread },
      threadOrder: [id, ...state.threadOrder],
      activeThreadId: id,
    };
    set(nextState);
    persistState(nextState);
  },

  selectThread: (id: string) => {
    const state = get();
    if (!state.threads[id]) return;
    const nextState = { ...state, activeThreadId: id };
    set(nextState);
    persistState(nextState);
  },

  deleteThread: (id: string) => {
    const state = get();
    if (!state.threads[id]) return;

    const { [id]: _, ...restThreads } = state.threads;
    const newOrder = state.threadOrder.filter((tId) => tId !== id);
    const newActive =
      state.activeThreadId === id ? newOrder[0] ?? null : state.activeThreadId;

    const nextState: GuestState = {
      ...state,
      threads: restThreads,
      threadOrder: newOrder,
      activeThreadId: newActive,
    };

    set(nextState);
    persistState(nextState);
  },

  addMessage: (threadId: string, msg: GuestMessage) => {
    const state = get();
    const thread = state.threads[threadId];
    if (!thread) return;

    // --- auto rename on first user message ---
    let newTitle = thread.title;

    if (msg.role === "user") {
      const hadUserBefore = thread.messages.some((m) => m.role === "user");
      if (!hadUserBefore) {
        let raw = msg.content.trim().replace(/\s+/g, " ");
        if (raw.length > 40) {
          raw = raw.slice(0, 40).trimEnd() + "…";
        }
        if (raw.length > 0) {
          newTitle = raw;
        }
      }
    }
    // --- end auto rename ---

    const updatedThread: GuestThread = {
      ...thread,
      title: newTitle,
      messages: [...thread.messages, msg],
      updatedAt: msg.createdAt,
    };

    const nextState: GuestState = {
      ...state,
      threads: { ...state.threads, [threadId]: updatedThread },
    };

    set(nextState);
    persistState(nextState);
  },

  updateThreadTitle: (threadId: string, title: string) => {
    const state = get();
    const thread = state.threads[threadId];
    if (!thread) return;

    const updatedThread: GuestThread = {
      ...thread,
      title,
    };

    const nextState: GuestState = {
      ...state,
      threads: { ...state.threads, [threadId]: updatedThread },
    };

    set(nextState);
    persistState(nextState);
  },
}));
