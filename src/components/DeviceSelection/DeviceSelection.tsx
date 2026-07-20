import { useBluetoothStore } from "../../stores/bluetoothStore";

function DeviceSelection() {
  const { state, connectToDevice } = useBluetoothStore();

  const devices =
    state.status === "search_results" || state.status === "connecting"
      ? state.devices
      : [];
  return (
    <section className="space-y-3">
      <div className="text-left">
        <p className="text-sm font-semibold text-white">Available devices</p>
        <p className="mt-1 text-xs text-zinc-400">
          Choose a Bluetooth device to connect.
        </p>
      </div>

      <div className="space-y-2">
        {devices.map((device) => {
          return (
            <button
              key={device}
              type="button"
              onClick={() => {
                connectToDevice(device);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              <span className="truncate text-sm font-medium text-white">
                {device}
              </span>

              <span className="ml-3 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                Select
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DeviceSelection;
