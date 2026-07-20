// src/stores/bluetoothStore.ts

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

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

function isBusy(state: BluetoothStoreState) {
  return (
    state.status === "searching" ||
    state.status === "connecting" ||
    state.status === "sending_command" ||
    state.status === "disconnecting"
  );
}

export type BluetoothStoreState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "search_results"; devices: string[] }
  | { status: "connecting"; devices: string[] }
  | {
      status: "connected";
      deviceName: string;
      devices: string[];
      lightState: BluetoothLightState;
    }
  | {
      status: "sending_command";
      device: string;
      devices: string[];
      lightState: BluetoothLightState;
    }
  | { status: "disconnecting"; device: string; devices: string[] }
  | { status: "error"; message: string; previous?: BluetoothStoreState };

type BluetoothStoreStateContainer = {
  state: BluetoothStoreState;
};

type BluetoothStoreActions = {
  searchDevices: () => Promise<void>;
  connectToDevice: (deviceName: string) => Promise<void>;
};

type BluetoothStore = BluetoothStoreStateContainer & BluetoothStoreActions;

export const useBluetoothStore = create<BluetoothStore>((set, get) => ({
  state: { status: "idle" },

  searchDevices: async () => {
    const current_state = get().state;

    if (isBusy(current_state)) return;

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
          previous: current_state,
        },
      });
    }
  },
  connectToDevice: async (deviceName: string) => {
    const current_state = get().state;

    if (isBusy(current_state)) return;
    set({
      state: {
        status: "connecting",
        devices:
          current_state.status === "search_results"
            ? current_state.devices
            : [],
      },
    });

    try {
      const connectedDevice = await invoke<string>("connect_to_device", {
        deviceName: deviceName,
      });

      set({
        state: {
          status: "connected",
          deviceName: connectedDevice,
          lightState: { power: true },
          devices:
            current_state.status !== "idle" && current_state.status !== "error"
              ? current_state.devices
              : [],
        },
      });
    } catch (error) {
      set({
        state: {
          status: "error",
          message: String(error),
          previous: current_state,
        },
      });
    }
  },
}));
