# BTGlow

BTGlow is a desktop application for discovering, connecting to, and controlling supported Bluetooth LED lights.

It is built upon the Tauri ecosystem.

## Features

- Scan for nearby supported LED devices
- Connect to and disconnect from a selected light
- Automatically reconnect to a previously saved device
- Turn the light on or off
- Change the light color
- Adjust brightness
- Show clear scanning, connecting, command, and disconnecting states
- Recover gracefully from Bluetooth errors

## Supported Devices

BTGlow currently supports select KeepSmile KS03-series devices with names beginning with:

- `KS03~`
- `KS03-`

Support for more devices can be added through the rust crate [`curl_smile`](https://crates.io/crates/curl_smile)

## Built With

- Tauri v2
- Rust
- React
- TypeScript
- Tailwind CSS
- Zustand

## Getting Started

### Prerequisites

Install:

- Node.js and npm
- Rust and Cargo
- The Tauri v2 system prerequisites for your operating system
- A working Bluetooth adapter

### Run in Development

```bash
npm install
npm run tauri dev
```

### Build the Application

```bash
npm run tauri build
```

Production bundles are generated under:

```text
src-tauri/target/release/bundle/
```

## Basic Usage

1. Turn on a supported Bluetooth light.
2. Enable Bluetooth on the computer.
3. Open BTGlow.
4. Scan for nearby devices.
5. Select a device.
6. Use the connected-device controls to change its power, color, or brightness.
7. Disconnect when finished.

BTGlow may automatically reconnect to the previously saved device when the application starts.

## Documentation

Implementation details, architecture, Bluetooth behavior, troubleshooting, and extension instructions are available in [documentation.md](documentation.md).

## Project Status

BTGlow is currently a hobby project focused on controlling supported KS03-series lights. Device behavior may vary depending on the operating system, Bluetooth adapter, and light firmware.

## Disclaimer

BTGlow is an independent project and is not affiliated with or endorsed by KeepSmile or the manufacturers of supported devices.
