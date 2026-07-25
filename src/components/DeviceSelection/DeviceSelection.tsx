import { useBluetoothStore } from "../../stores/bluetoothStore";

function DeviceSelection() {
  const { state, connectToDevice } = useBluetoothStore();
  const { bluetoothUIState, discoveredDeviceNames } = state;

  const isConnecting = bluetoothUIState.status === "connecting";
  const devices = discoveredDeviceNames.length > 0 ? discoveredDeviceNames : [];

  return (
    <section className="space-y-3">
      <div className="text-left">
        <div className="flex items-center gap-2">
          {isConnecting && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
          )}

          <p className="text-sm font-semibold text-white">
            {isConnecting ? "Connecting" : "Available devices"}
          </p>
        </div>

        <p className="mt-1 text-xs text-zinc-400">
          {isConnecting
            ? "Please wait while the connection is completed."
            : "Choose a Bluetooth device to connect."}
        </p>
      </div>

      <div className="space-y-2">
        {devices.map((device) => {
          return (
            <button
              key={device}
              type="button"
              disabled={isConnecting}
              onClick={() => {
                if (isConnecting) return;

                connectToDevice(device);
              }}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                isConnecting
                  ? "cursor-not-allowed border-white/5 bg-white/3 opacity-50"
                  : "cursor-pointer border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-500/10 active:scale-[0.98]"
              }`}
            >
              <span className="truncate text-sm font-medium text-white">
                {device}
              </span>

              <span
                className={`ml-3 rounded-full border px-2 py-0.5 text-xs ${
                  isConnecting
                    ? "border-white/10 bg-white/5 text-zinc-500"
                    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                {isConnecting ? "Waiting" : "Select"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DeviceSelection;
