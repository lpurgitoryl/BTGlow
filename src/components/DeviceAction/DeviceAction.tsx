import {
  Slider,
  Sketch,
  Material,
  Colorful,
  Compact,
  Circle,
  Swatch,
  Wheel,
  Block,
  Github,
  Chrome,
} from "@uiw/react-color";
import {
  Alpha,
  Hue,
  ShadeSlider,
  Saturation,
  Interactive,
  hsvaToHslaString,
} from "@uiw/react-color";
import {
  EditableInput,
  EditableInputRGBA,
  EditableInputHSLA,
} from "@uiw/react-color";
import { hsvaToHex } from "@uiw/color-convert";

import { useState } from "react";

function DeviceAction() {
  const [hex, setHex] = useState("#fff");
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 });
  return (
    <section className="flex flex-col max-w-[250px]">
      <Wheel
        className="m-4"
        color={hsva}
        onChange={(color) => setHsva({ ...hsva, ...color.hsva })}
      />
      <Circle
        className="m-4"
        colors={[
          "#F44E3B",
          "#FE9200",
          "#FCDC00",
          "#DBDF00",
          "#DBDF00",
          "#DBDF00",
          "#DBDF00",
          "#DBDF00",
        ]}
        color={hex}
        onChange={(color) => {
          setHex(color.hex);
        }}
        style={{
          gap: 20,
        }}
      />
    </section>
  );
}

export default DeviceAction;
