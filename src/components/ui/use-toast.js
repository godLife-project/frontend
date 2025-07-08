"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useReducer,
} from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

const ToastActionType = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// 토스트 리듀서
const toastReducer = (state, action) => {
  switch (action.type) {
    case ToastActionType.ADD_TOAST:
      return [...state, action.toast];

    case ToastActionType.UPDATE_TOAST:
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      );

    case ToastActionType.DISMISS_TOAST:
      return state.map((t) =>
        t.id === action.toastId ? { ...t, open: false } : t
      );

    case ToastActionType.REMOVE_TOAST:
      return state.filter((t) => t.id !== action.toastId);

    default:
      return state;
  }
};

const toastTimeouts = new Map();

const ToastContext = createContext({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const toast = (props) => {
    const id = props.id || genId();
    const newToast = {
      id,
      open: true,
      variant: props.variant || "default",
      title: props.title,
      description: props.description,
      action: props.action,
      ...props,
    };

    dispatch({ type: ToastActionType.ADD_TOAST, toast: newToast });

    return id;
  };

  const dismiss = (toastId) => {
    dispatch({ type: ToastActionType.DISMISS_TOAST, toastId });
  };

  const addToRemoveQueue = (toastId) => {
    if (toastTimeouts.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      toastTimeouts.delete(toastId);
      dispatch({
        type: ToastActionType.REMOVE_TOAST,
        toastId,
      });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
  };

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.open) {
        addToRemoveQueue(toast.id);
      }
    });
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
