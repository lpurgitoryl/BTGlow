import { useState } from "react";
import { Circle, Wheel } from "@uiw/react-color";
import { hexToHsva, hsvaToHex } from "@uiw/color-convert";
import { useBluetoothStore } from "../../stores/bluetoothStore";

const INITIAL_COLOR = {
  h: 240,
  s: 75,
  v: 100,
  a: 1,
};

const PRESET_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFD60A",
  "#34C759",
  "#00C7BE",
  "#0A84FF",
  "#5856D6",
  "#AF52DE",
];

function hexToRgb(hex: string) {
  const normalizedHex = hex.replace("#", "");

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return {
    red,
    green,
    blue,
  };
}

// Dummy function to simulate updating the Bluetooth light color

function DeviceAction() {
  const bluetoothUIState = useBluetoothStore(
    (store) => store.state.bluetoothUIState,
  );

  const disconnectFromDevice = useBluetoothStore(
    (store) => store.disconnectFromDevice,
  );

  const updateLightColor = useBluetoothStore((store) => store.updateLightColor);

  const [hsva, setHsva] = useState(INITIAL_COLOR);

  const isConnected = bluetoothUIState.status === "connected";
  const isDisconnecting = bluetoothUIState.status === "disconnecting";

  if (!isConnected && !isDisconnecting) {
    return null;
  }

  const selectedHex = hsvaToHex(hsva);

  const handlePresetChange = (hex: string) => {
    setHsva(hexToHsva(hex));
  };

  function updateBluetoothLightColor(hex: string) {
    const rgb = hexToRgb(hex);

    console.log("Updating Bluetooth light color:", {
      hex,
      ...rgb,
    });

    updateLightColor(rgb.red, rgb.green, rgb.blue);
  }

  const handleApplyColor = () => {
    updateBluetoothLightColor(selectedHex);
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-white">Light color</h2>

          <p className="mt-1 text-sm text-zinc-400">
            Choose a color for {bluetoothUIState.deviceName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
              isDisconnecting
                ? "border-amber-500/20 bg-amber-500/10"
                : "border-emerald-500/20 bg-emerald-500/10"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isDisconnecting
                  ? "animate-pulse bg-amber-400"
                  : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              }`}
            />

            <span
              className={`text-xs font-medium ${
                isDisconnecting ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {isDisconnecting ? "Disconnecting" : "Connected"}
            </span>
          </div>

          <button
            type="button"
            disabled={isDisconnecting}
            onClick={disconnectFromDevice}
            className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>

      <div
        className={`flex flex-col items-center gap-6 p-5 transition ${
          isDisconnecting ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <div className="rounded-full bg-white/5 p-3 shadow-inner shadow-black/40">
          <Wheel
            color={hsva}
            onChange={(color) => {
              setHsva({
                ...hsva,
                ...color.hsva,
              });
            }}
            style={{
              width: 210,
              height: 210,
            }}
          />
        </div>

        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Presets
          </p>

          <Circle
            colors={PRESET_COLORS}
            color={selectedHex}
            onChange={(color) => {
              handlePresetChange(color.hex);
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          />
        </div>

        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div
            className="h-12 w-12 shrink-0 rounded-lg border border-white/20 shadow-inner"
            style={{
              backgroundColor: selectedHex,
              boxShadow: `0 0 18px ${selectedHex}55`,
            }}
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-500">Selected color</p>

            <p className="font-mono text-sm font-medium uppercase text-zinc-100">
              {selectedHex}
            </p>
          </div>

          <button
            type="button"
            disabled={isDisconnecting}
            onClick={handleApplyColor}
            className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </section>
  );
}

export default DeviceAction;
