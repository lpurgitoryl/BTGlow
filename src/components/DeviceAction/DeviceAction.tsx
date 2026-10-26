import { useState } from "react";
import { Circle, Wheel } from "@uiw/react-color";
import { hexToHsva, hsvaToHex, validHex } from "@uiw/color-convert";
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

  return {
    red: Number.parseInt(normalizedHex.slice(0, 2), 16),
    green: Number.parseInt(normalizedHex.slice(2, 4), 16),
    blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
  };
}

function DeviceAction() {
  const { state, disconnectFromDevice, updateLightColor } = useBluetoothStore();

  const bluetoothUIState = state.bluetoothUIState;

  const [hsva, setHsva] = useState(INITIAL_COLOR);
  const [hexInput, setHexInput] = useState(hsvaToHex(INITIAL_COLOR));
  const [brightness, setBrightness] = useState(100);

  const isConnected =
    bluetoothUIState.status === "connected" ||
    bluetoothUIState.status === "sending_command";

  const isDisconnecting = bluetoothUIState.status === "disconnecting";
  const isSendingCommand = bluetoothUIState.status === "sending_command";

  if (!isConnected && !isDisconnecting) {
    return null;
  }

  function handleApplyColor() {
    if (!validHex(hexInput)) {
      setHexInput(hsvaToHex(hsva));
      return;
    }

    const newHsva = hexToHsva(hexInput);
    const { red, green, blue } = hexToRgb(hsvaToHex(newHsva));

    setHsva(newHsva);
    setHexInput(hsvaToHex(newHsva));

    updateLightColor(red, green, blue, brightness);
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <p className="mt-1 text-sm text-zinc-400">
          Color and brightness for {bluetoothUIState.deviceName}
        </p>

        <div className="flex items-center gap-2">
          <div
            role="status"
            aria-label={isDisconnecting ? "Disconnecting" : "Connected"}
            title={isDisconnecting ? "Disconnecting" : "Connected"}
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
              {isDisconnecting ? "Disconnecting" : ""}
            </span>
          </div>

          <button
            type="button"
            disabled={isDisconnecting || isSendingCommand}
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
              setHsva(color.hsva);
              setHexInput(hsvaToHex(color.hsva));
            }}
            style={{
              width: 210,
              height: 210,
            }}
          />
        </div>
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
            Presets
          </p>

          <Circle
            colors={PRESET_COLORS}
            color={hsvaToHex(hsva)}
            onChange={(color) => {
              const newHsva = hexToHsva(color.hex);

              setHsva(newHsva);
              setHexInput(color.hex);
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          />
        </div>
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
          <label
            htmlFor="brightness"
            className="mb-3 flex justify-between text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            <span>Brightness</span>
            <span className="text-zinc-100 tabular-nums">{brightness}%</span>
          </label>
          <input
            id="brightness"
            type="range"
            min={0}
            max={100}
            step={1}
            value={brightness}
            aria-valuetext={`${brightness}%`}
            onChange={(e) => setBrightness(Number(e.target.value))}
            disabled={isDisconnecting}
            className="w-full cursor-pointer accent-zinc-300 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div
            className="h-12 w-12 shrink-0 rounded-lg border border-white/20 shadow-inner"
            style={{
              backgroundColor: hsvaToHex(hsva),
              boxShadow: `0 0 18px ${hsvaToHex(hsva)}55`,
            }}
          />

          <div className="min-w-0 flex-1">
            <label htmlFor="selected-color" className="text-xs text-zinc-400">
              Selected color
            </label>

            <input
              id="selected-color"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !isDisconnecting &&
                  !isSendingCommand
                ) {
                  handleApplyColor();
                }
              }}
              onBlur={() => {
                if (!validHex(hexInput)) {
                  setHexInput(hsvaToHex(hsva));
                  console.warn(`Invalid hex color: ${hexInput}`);
                }
              }}
              maxLength={7}
              className="w-full bg-transparent font-mono text-sm font-medium uppercase text-zinc-100 border rounded-sm border-gray-600 focus:border-zinc-300 px-2 py-1 "
            />
          </div>

          <button
            type="button"
            disabled={isDisconnecting || isSendingCommand}
            aria-busy={isSendingCommand}
            onClick={handleApplyColor}
            className="mt-2 cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingCommand ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default DeviceAction;
