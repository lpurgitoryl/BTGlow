type DeviceSelectionProps = {
  devices: string[];
};

function DeviceSelection({ devices }: DeviceSelectionProps) {
  return (
    <section className="m-4">
      {devices.map((device) => {
        return (
          <button
            key={device}
            type="button"
            className="m-4 cursor-pointer rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-center text-sm font-medium leading-5 text-white active:scale-95 hover:bg-linear-to-r focus:ring-4 focus:ring-cyan-300 focus:outline-none dark:focus:ring-cyan-800"
          >
            {device}
          </button>
        );
      })}
    </section>
  );
}

export default DeviceSelection;
