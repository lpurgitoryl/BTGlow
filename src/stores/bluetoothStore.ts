// src/stores/bluetoothStore.ts

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type BluetoothDevice = {
  id: string;
};

export type BluetoothLightState = {
  power: boolean;
};

export type BluetoothStoreStatus =
  | "idle"
  | "searching"
  | "search_results"
  | "connecting"
  | "connected"
  | "sending_command"
  | "disconnecting"
  | "error";

export type BluetoothStoreState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "search_results"; devices: string[] }
  | { status: "connecting"; device: BluetoothDevice }
  | {
      status: "connected";
      device: BluetoothDevice;
      lightState: BluetoothLightState;
    }
  | {
      status: "sending_command";
      device: BluetoothDevice;
      lightState: BluetoothLightState;
    }
  | { status: "disconnecting"; device: BluetoothDevice }
  | { status: "error"; message: string; previous?: BluetoothStoreState };

type BluetoothStoreStateContainer = {
  state: BluetoothStoreState;
};

type BluetoothStoreActions = {
  searchDevices: () => Promise<void>;
};

type BluetoothStore = BluetoothStoreStateContainer & BluetoothStoreActions;

function isBusy(state: BluetoothStoreState) {
  return (
    state.status === "searching" ||
    state.status === "connecting" ||
    state.status === "sending_command" ||
    state.status === "disconnecting"
  );
}

export const useBluetoothStore = create<BluetoothStore>((set, get) => ({
  state: { status: "idle" },

  searchDevices: async () => {
    const current = get().state;

    if (isBusy(current)) return;

    set({
      state: { status: "searching" },
    });

    try {
      const devices = await invoke<string[]>("scan_devices");

      set({
        state: {
          status: "search_results",
          devices,
        },
      });
    } catch (error) {
      set({
        state: {
          status: "error",
          message: String(error),
          previous: current,
        },
      });
    }
  },
}));
