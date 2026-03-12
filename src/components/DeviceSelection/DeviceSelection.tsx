function DeviceSelection({ deviceNameList }: { deviceNameList: string[] }) {
  return (
    <section className="m-4">
      {deviceNameList.map((item, index) => {
        return (
          <button
            key={item}
            type="button"
            className="text-white cursor-pointer active:scale-95 m-4 bg-linear-to-r from-cyan-500 to-blue-500 hover:bg-linear-to-r focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-xl text-sm px-4 py-2.5 text-center leading-5"
          >
            {item}
          </button>
        );
      })}
    </section>
  );
}

export default DeviceSelection;
