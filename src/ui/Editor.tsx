import React, { useCallback, useState } from "react";
import View from "./View";
import World, { WorldOptions } from "./World";
import SettingEditor from "./SettingEditor";
import { Settings } from "../domain/settings";
import Operation from "./Operation";
import { User } from "../domain/user";

// |--- worldSize --|-|--- viewSize ---|-|-- opetaionSize --|
//                  gap                gap
const worldSize = 300;
const viewSize = 300;
const operationSize = 340;
const upperHeight = 300;
const gap = (960 - (worldSize + viewSize + operationSize)) / 2;
const defaultSettings: Settings = {
  background: "#103",
  generators: [
    {
      count: 20,
      shape: {
        type: "rectangle",
        width: {
          min: 0.06,
          max: 0.1,
        },
        height: 0.08,
        stroke: {
          type: "hsl",
          h: {
            min: 300,
            max: 360,
          },
          s: 40,
          l: 60,
        },
        strokeWidth: 0.01,
      },
    },
    {
      count: 50,
      shape: {
        type: "rectangle",
        width: {
          min: 0.05,
          max: 0.12,
        },
        height: {
          min: 0.02,
          max: 0.03,
        },
        fill: {
          type: "hsl",
          h: {
            min: 100,
            max: 240,
          },
          s: 60,
          l: 50,
        },
      },
    },
  ],
};
export default function Editor(props: {
  user: User | null;
  preview: boolean;
  settings?: Settings;
  onQuitPreview: () => void;
}) {
  const { user, preview, settings, onQuitPreview } = props;

  const [worldOptions, setWorldOptions] = useState<WorldOptions>({
    size: worldSize,
    spinnerRadiusRatio: 0.5,
    clipRadiusRatio: 0.25,
    settings: settings ?? defaultSettings,
  });
  const [world, setWorld] = useState<World | null>(null);

  const handleReady = useCallback((world: World) => {
    setWorld(world);
  }, []);
  const handleApply = useCallback((json: any) => {
    setWorldOptions({ ...worldOptions, settings: json });
  }, []);
  const quitPreview = useCallback(() => {
    onQuitPreview();
  }, [onQuitPreview]);
  if (world && preview) {
    return (
      <>
        <World options={worldOptions} onReady={handleReady} />
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#111",
          }}
          onClick={quitPreview}
        >
          <View
            size={viewSize * 2}
            world={world}
            settings={worldOptions.settings}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ display: "flex", gap }}>
        <World options={worldOptions} onReady={handleReady} />
        {world && (
          <View
            size={viewSize}
            world={world}
            settings={worldOptions.settings}
          />
        )}
        <Operation
          width={operationSize}
          height={upperHeight}
          settings={worldOptions.settings}
          user={user}
        />
      </div>
      <SettingEditor settings={worldOptions.settings} onApply={handleApply} />
    </>
  );
}
