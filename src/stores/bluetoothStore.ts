import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type BluetoothLightState = {
  power: boolean;
};

type StartupBluetoothResult =
  | {
      status: "connected";
      device_name: string;
    }
  | {
      status: "devices_found";
      devices: string[];
    }
  | {
      status: "no_devices_found";
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
  updateLightColor: (red: number, green: number, blue: number) => Promise<void>;
  initializeBluetooth: () => Promise<void>;
};

type BluetoothStore = {
  state: BluetoothStoreState;
  hasInitializedBluetooth: boolean;
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
  hasInitializedBluetooth: false,

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
    const currentState = get().state;

    if (currentState.bluetoothUIState.status !== "connected") return;

    const deviceName = currentState.bluetoothUIState.deviceName;

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
      await invoke<string>("disconnect_from_device");

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
            previous: currentState.bluetoothUIState,
          },
        },
      }));
    }
  },
  updateLightColor: async (red: number, green: number, blue: number) => {
    const currentState = get().state;

    if (
      isBluetoothBusy(currentState.bluetoothUIState) ||
      currentState.bluetoothUIState.status !== "connected"
    )
      return;

    set({
      state: {
        ...currentState,
        bluetoothUIState: {
          status: "sending_command",
          deviceName: currentState.bluetoothUIState.deviceName,
          lightState: currentState.bluetoothUIState.lightState,
        },
      },
    });

    try {
      await invoke<string>("update_light_color", { red, green, blue });

      set({
        state: {
          ...currentState,
          bluetoothUIState: {
            status: "connected",
            deviceName: currentState.bluetoothUIState.deviceName,
            lightState: currentState.bluetoothUIState.lightState,
          },
        },
      });
    } catch (error) {
      set((store) => ({
        state: {
          ...store.state,
          bluetoothUIState: {
            status: "error",
            message: String(error),
            previous: currentState.bluetoothUIState,
          },
        },
      }));
    }
  },
  initializeBluetooth: async () => {
    if (get().hasInitializedBluetooth) return;

    set({
      hasInitializedBluetooth: true,
    });

    set((store) => ({
      state: {
        ...store.state,
        bluetoothUIState: {
          status: "connecting",
          deviceName: "Saved device",
        },
      },
    }));

    try {
      const result = await invoke<StartupBluetoothResult>(
        "initialize_bluetooth",
      );

      if (result.status === "connected") {
        set((store) => ({
          state: {
            ...store.state,
            bluetoothUIState: {
              status: "connected",
              deviceName: result.device_name,
              lightState: {
                power: true,
              },
            },
          },
        }));

        return;
      }

      set((store) => ({
        state: {
          ...store.state,
          bluetoothUIState: {
            status: "search_results",
            devices: result.status === "devices_found" ? result.devices : [],
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
            previous: {
              status: "idle",
            },
          },
        },
      }));
    }
  },
}));
