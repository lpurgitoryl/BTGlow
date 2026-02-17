import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Header from "./components/Header/Header";
import Scanner from "./components/Scanner/Scanner";
function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="">
      <Header title="btglow" />
      <section className="flex flex-col items-center m-4">
        <Scanner />
        <div className="m-4">
          {" "}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <input
              id="greet-input"
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <button type="submit" className="">
              Greet
            </button>
          </form>
          <p>{greetMsg}</p>
        </div>
      </section>
    </main>
  );
}

export default App;
