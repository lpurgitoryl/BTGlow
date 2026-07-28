# BTGlow Documentation

## Architecture

BTGlow is split into two main layers:

```text
React + TypeScript Frontend
        ↓
Rust Bluetooth Backend
        ↓
BLE Device
```

The frontend manages UI state and user interactions. The Rust backend manages Bluetooth devices, connections, and command delivery.

## Frontend

Uses Zustand with to represent the Bluetooth workflow.

```ts
export type BluetoothUIState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "search_results"; devices: string[] }
  | { status: "connecting"; deviceName: string }
  | {
      status: "connected";
      deviceName: string;
      lightState: LightState;
    }
  | {
      status: "sending_command";
      deviceName: string;
      lightState: LightState;
    }
  | { status: "disconnecting"; deviceName: string }
  | {
      status: "error";
      message: string;
      previous?: BluetoothUIState;
    };
```

Typical state transitions:

```text
idle → searching → search_results → connecting → connected

connected → sending_command → connected

connected → disconnecting → idle
```

## Backend

The Rust backend stores scanned devices and the active connection.

```rust
#[derive(Default)]
struct AppState {
    scanned_devices: Vec<SupportedDevice>,
    connected_device: Option<SupportedDevice>,
}
```

The frontend only receives serializable information such as device names. Raw Bluetooth peripheral objects remain in Rust.

## Main Tauri Commands

### `initialize_bluetooth`

Runs when the application starts.

- Load the previously saved device name from `bluetooth.json`.
- Scan for supported devices
- Attempt to reconnect to the saved device
- Return either the connected device or the available scan results

### `scan_devices`

Scans for supported devices, stores the full device objects in `AppState`, and returns only their names to the frontend.

### `connect_to_device`

Finds the selected device from the latest scan, connects to it, and stores it as the active device.

The device name is also saved into `bluetooth.json` only after the Bluetooth connection succeeds.

### `disconnect_from_device`

Disconnects from device and saves device name into `bluetooth.json`.

## Supported Devices

Currently the cargo package `curl_smile` supports only Keepsmile devices.

## Device Controls

The connected-device view can expose:

- Power
- Color

## Error Handling

Convert Rust errors at the Tauri boundary:

```rust
.map_err(|error| error.to_string())?
```

The frontend can preserve the previous state for recovery:

```ts
{
  status: "error",
  message: String(error),
  previous: currentState.bluetoothUIState,
}
```

## Troubleshooting

### No Devices Found

- Check that Bluetooth is enabled on desktop
- The target device is nearby
- Another app is not connected
- Device is supoorted in `curl_smile`

## Current Limitations

- Only selected KS03-series devices are supported
- Only one active device connection is supported
- Bluetooth behavior may vary by operating system and adapter
- Some device features are not yet exposed in the UI
