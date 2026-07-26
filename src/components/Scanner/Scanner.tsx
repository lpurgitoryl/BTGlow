import { faSearchengin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeviceSelection from "../DeviceSelection/DeviceSelection";
import { useBluetoothStore } from "../../stores/bluetoothStore";
import DeviceAction from "../DeviceAction/DeviceAction";
import { useEffect } from "react";

function getScanText(
  isScanning: boolean,
  isSearchResults: boolean,
  hasDevices: boolean,
) {
  if (isScanning) {
    return "Scanning for nearby devices...";
  }

  if (isSearchResults && hasDevices) {
    return "Devices found";
  }

  if (isSearchResults && !hasDevices) {
    return "No devices found";
  }

  return "Ready to scan";
}

function getHelperText(
  isScanning: boolean,
  isSearchResults: boolean,
  hasDevices: boolean,
) {
  if (isScanning) {
    return "Keep your Bluetooth device nearby and powered on.";
  }

  if (isSearchResults && hasDevices) {
    return "Select a device below to continue.";
  }

  if (isSearchResults && !hasDevices) {
    return "No compatible Bluetooth devices were found. Try scanning again.";
  }

  return "Click the scan button to search for compatible Bluetooth devices.";
}

function getScanButtonClassName(isBusy: boolean, hasDevices: boolean) {
  const baseClassName =
    "mx-auto flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-200";

  if (isBusy) {
    return `${baseClassName} cursor-not-allowed border-cyan-400/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/10`;
  }

  if (hasDevices) {
    return `${baseClassName} cursor-pointer border-green-400/40 bg-green-500/10 hover:scale-105 hover:bg-green-500/20 active:scale-95`;
  }

  return `${baseClassName} cursor-pointer border-red-400/40 bg-red-500/10 hover:scale-105 hover:bg-red-500/20 active:scale-95`;
}

function getScanIconColor(isBusy: boolean, hasDevices: boolean) {
  if (isBusy) {
    return "deepskyblue";
  }

  if (hasDevices) {
    return "limegreen";
  }

  return "tomato";
}

function Scanner() {
  const { state, searchDevices, initializeBluetooth } = useBluetoothStore();

  const { bluetoothUIState, discoveredDeviceNames } = state;

  useEffect(() => {
    initializeBluetooth();
  }, []);

  const isScanning = bluetoothUIState.status === "searching";
  const isConnecting = bluetoothUIState.status === "connecting";
  const isSearchResults = bluetoothUIState.status === "search_results";
  const isBusy = isScanning || isConnecting;

  const hasActiveDevice =
    bluetoothUIState.status === "connected" ||
    bluetoothUIState.status === "sending_command" ||
    bluetoothUIState.status === "disconnecting";

  const hasDevices = discoveredDeviceNames.length > 0;

  const scanText = isConnecting
    ? "Connecting to device..."
    : getScanText(isScanning, isSearchResults, hasDevices);

  const helperText = isConnecting
    ? "Keep the device nearby while the Bluetooth connection is established."
    : getHelperText(isScanning, isSearchResults, hasDevices);

  const scanButtonClassName = getScanButtonClassName(isBusy, hasDevices);
  const scanIconColor = getScanIconColor(isBusy, hasDevices);

  if (hasActiveDevice) {
    return (
      <section className="m-4 flex justify-center">
        <div className="w-full max-w-md">
          <DeviceAction />
        </div>
      </section>
    );
  }

  return (
    <section className="m-4 flex justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-center shadow-2xl backdrop-blur">
        <div className="mb-6">
          <p className="mt-2 text-sm text-zinc-400">{helperText}</p>
        </div>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            if (isBusy) return;

            searchDevices();
          }}
          className={scanButtonClassName}
        >
          <FontAwesomeIcon
            icon={faSearchengin}
            color={scanIconColor}
            shake={!isBusy && !hasDevices}
            beat={isBusy}
            size="3x"
          />
        </button>

        <div className="mt-5">
          <div className="flex items-center justify-center gap-2">
            {isConnecting && (
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            )}

            <p className="text-base font-semibold text-white">{scanText}</p>
          </div>

          {bluetoothUIState.status === "error" && (
            <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {bluetoothUIState.message}
            </p>
          )}
        </div>

        {hasDevices && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <DeviceSelection />
          </div>
        )}

        <DeviceAction />
      </div>
    </section>
  );
}

export default Scanner;
