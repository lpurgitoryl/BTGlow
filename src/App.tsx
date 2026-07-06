import "./App.css";

import Scanner from "./components/Scanner/Scanner";
import DeviceAction from "./components/DeviceAction/DeviceAction";

function App() {
  return (
    <main className="">
      <section className="flex flex-col items-center m-4">
        <Scanner />
        {/* <DeviceAction /> */}
      </section>
    </main>
  );
}

export default App;
