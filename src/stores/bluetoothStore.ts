import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type BluetoothLightState = {
  power: boolean;
};

export type BluetoothUIState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "search_results" }
  | { status: "connecting"; deviceName: string }
  | {
      status: "connected";
      deviceName: string;
      lightState: BluetoothLightState;
    }
  | {
      status: "sending_command";
      deviceName: string;
      lightState: BluetoothLightState;
    }
  | {
      status: "disconnecting";
      deviceName: string;
    }
  | {
      status: "error";
      message: string;
      previous?: BluetoothUIState;
    };

export type BluetoothStoreState = {
  discoveredDeviceNames: string[];
  bluetoothUIState: BluetoothUIState;
};

type BluetoothStoreActions = {
  searchDevices: () => Promise<void>;
  connectToDevice: (deviceName: string) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
};

type BluetoothStore = {
  state: BluetoothStoreState;
} & BluetoothStoreActions;

function isBluetoothBusy(bluetoothUIState: BluetoothUIState) {
  return (
    bluetoothUIState.status === "searching" ||
    bluetoothUIState.status === "connecting" ||
    bluetoothUIState.status === "sending_command" ||
    bluetoothUIState.status === "disconnecting"
  );
}

export const useBluetoothStore = create<BluetoothStore>((set, get) => ({
  state: {
    discoveredDeviceNames: [],
    bluetoothUIState: { status: "idle" },
  },

  searchDevices: async () => {
    const currentState = get().state;

    if (isBluetoothBusy(currentState.bluetoothUIState)) return;

    set({
      state: {
        ...currentState,
        bluetoothUIState: {
          status: "searching",
        },
      },
    });

    try {
      const discoveredDeviceNames = await invoke<string[]>("scan_devices");
      set({
        state: {
          discoveredDeviceNames,
          bluetoothUIState: {
            status: "search_results",
          },
        },
      });
    } catch (error) {
      set({
        state: {
          ...currentState,
          bluetoothUIState: {
            status: "error",
            message: String(error),
            previous: currentState.bluetoothUIState,
          },
        },
      });
    }
  },

  connectToDevice: async (deviceName: string) => {
    const currentState = get().state;

    if (isBluetoothBusy(currentState.bluetoothUIState)) return;

    if (!currentState.discoveredDeviceNames.includes(deviceName)) {
      set({
        state: {
          ...currentState,
          bluetoothUIState: {
            status: "error",
            message: `Device "${deviceName}" was not found in the scan results.`,
            previous: currentState.bluetoothUIState,
          },
        },
      });

      return;
    }

    set({
      state: {
        ...currentState,
        bluetoothUIState: {
          status: "connecting",
          deviceName,
        },
      },
    });

    try {
      const connectedDeviceName = await invoke<string>("connect_to_device", {
        deviceName,
      });

      set((store) => ({
        state: {
          ...store.state,
          bluetoothUIState: {
            status: "connected",
            deviceName: connectedDeviceName,
            lightState: {
              power: true,
            },
          },
        },
      }));
    } catch (error) {
      set({
        state: {
          ...currentState,
          bluetoothUIState: {
            status: "error",
            message: String(error),
            previous: currentState.bluetoothUIState,
          },
        },
      });
    }
  },
  disconnectFromDevice: async () => {
    const currentBluetoothUIState = get().state.bluetoothUIState;

    if (currentBluetoothUIState.status !== "connected") return;

    const deviceName = currentBluetoothUIState.deviceName;

    set((store) => ({
      state: {
        ...store.state,
        bluetoothUIState: {
          status: "disconnecting",
          deviceName,
        },
      },
    }));

    try {
      await invoke<string>("disconnect_device");

      set((store) => ({
        state: {
          ...store.state,
          bluetoothUIState: {
            status: "idle",
          },
        },
      }));
    } catch (error) {
      set((store) => ({
        state: {
          ...store.state,
          bluetoothUIState: {
            status: "error",
            message: String(error),
            previous: currentBluetoothUIState,
          },
        },
      }));
    }
  },
}));
