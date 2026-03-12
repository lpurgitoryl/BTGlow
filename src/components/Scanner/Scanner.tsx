import { faSearchengin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import DeviceSelection from "../DeviceSelection/DeviceSelection";
function Scanner() {
  const [scannedDevices, setScannedDevices] = useState(false);
  const [deviceNameList, setDeviceNameList] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  async function Scan() {
    setIsScanning(true);

    const devices = await invoke<string[]>("scan_devices");

    setDeviceNameList(devices);
    setScannedDevices(devices.length > 0);

    setIsScanning(false);
  }

  return (
    <section className="m-4 flex flex-col items-center">
      <div className="p-7 text-2xl font-bold">Scan for devices</div>
      <FontAwesomeIcon
        onClick={(e) => {
          e.preventDefault();
          Scan();
        }}
        className="cursor-pointer active:scale-95"
        icon={faSearchengin}
        color={scannedDevices ? "green" : "red"}
        shake={!isScanning && !scannedDevices}
        beat={isScanning}
        size="4x"
      />
      <DeviceSelection deviceNameList={deviceNameList} />
    </section>
  );
}

export default Scanner;
