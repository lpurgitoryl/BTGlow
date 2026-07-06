import { faSearchengin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeviceSelection from "../DeviceSelection/DeviceSelection";
import { useBluetoothStore } from "../../stores/bluetoothStore";

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

function getScanButtonClassName(isScanning: boolean, hasDevices: boolean) {
  const baseClassName =
    "mx-auto flex h-24 w-24 items-center justify-center rounded-full border transition-all duration-200";

  if (isScanning) {
    return `${baseClassName} cursor-not-allowed border-blue-400/40 bg-blue-500/10`;
  }

  if (hasDevices) {
    return `${baseClassName} cursor-pointer border-green-400/40 bg-green-500/10 hover:scale-105 hover:bg-green-500/20 active:scale-95`;
  }

  return `${baseClassName} cursor-pointer border-red-400/40 bg-red-500/10 hover:scale-105 hover:bg-red-500/20 active:scale-95`;
}

function getScanIconColor(isScanning: boolean, hasDevices: boolean) {
  if (isScanning) {
    return "dodgerblue";
  }

  if (hasDevices) {
    return "limegreen";
  }

  return "tomato";
}

function Scanner() {
  const { state, searchDevices } = useBluetoothStore();

  const isScanning = state.status === "searching";
  const isSearchResults = state.status === "search_results";
  const isError = state.status === "error";

  const devices = isSearchResults ? state.devices : [];
  const hasDevices = devices.length > 0;

  const scanText = getScanText(isScanning, isSearchResults, hasDevices);
  const helperText = getHelperText(isScanning, isSearchResults, hasDevices);
  const scanButtonClassName = getScanButtonClassName(isScanning, hasDevices);
  const scanIconColor = getScanIconColor(isScanning, hasDevices);

  return (
    <section className="m-4 flex justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-6 text-center shadow-2xl backdrop-blur">
        <div className="mb-6">
          <h2 className="mt-2 text-2xl font-bold text-white">Device Scanner</h2>

          <p className="mt-2 text-sm text-zinc-400">{helperText}</p>
        </div>

        <button
          type="button"
          disabled={isScanning}
          onClick={() => {
            if (isScanning) return;

            searchDevices();
          }}
          className={scanButtonClassName}
        >
          <FontAwesomeIcon
            icon={faSearchengin}
            color={scanIconColor}
            shake={!isScanning && !hasDevices}
            beat={isScanning}
            size="3x"
          />
        </button>

        <div className="mt-5">
          <p className="text-base font-semibold text-white">{scanText}</p>

          {isError && (
            <p className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.message}
            </p>
          )}
        </div>

        {hasDevices && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <DeviceSelection devices={devices} />
          </div>
        )}
      </div>
    </section>
  );
}

export default Scanner;
