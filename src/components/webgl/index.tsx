"use client";

import { Center, OrbitControls, Text3D, useTexture } from "@react-three/drei";
import { Canvas, Size, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import { Texture, TextureLoader, Vector2, Vector3 } from "three";
import { useControls } from "leva";
import {
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { motion } from "framer-motion-3d";

const originalDistance = 5;

const Heading = () => {
  return (
    <Text3D
      size={0.75}
      letterSpacing={0.03}
      height={0}
      font="/fonts/Philosopher-Regular.json"
      curveSegments={12}
    >
      HANAMI
      {/* <meshStandardMaterial color="white" /> */}
    </Text3D>
  );
};

const ImageLayer = ({
  position: [x, y, z],
  dimensions,
  layer,
  map,
  mouse,
}: {
  position: [x: number, y: number, z: number];
  dimensions: [width: number | undefined, height: number | undefined];
  map: Texture | null | undefined;
  layer: number;
  mouse: {
    x: MotionValue;
    y: MotionValue;
  };
}) => {
  const [{ layerMultiplier, mouseOffset }] = useControls(
    () => ({
      layerMultiplier: {
        max: 10,
        min: 0.01,
        value: 1,
      },
      mouseOffset: {
        max: 1,
        min: 0.01,
        value: 0.1,
      },
    }),
    []
  );
  const positionX = useTransform(
    mouse.x,
    [0, 1],
    [
      x + layer * layerMultiplier * mouseOffset,
      x - layer * layerMultiplier * mouseOffset,
    ]
  );

  const positionY = useTransform(
    mouse.y,
    [0, 1],
    [
      y - layer * layerMultiplier * mouseOffset,
      y + layer * layerMultiplier * mouseOffset,
    ]
  );
  return (
    <motion.mesh
      position={[x, y, z]}
      position-x={positionX}
      position-y={positionY}
    >
      <planeGeometry args={dimensions} />
      <meshBasicMaterial map={map} transparent />
    </motion.mesh>
  );
};

const useResizeMesh = (texture: Texture, size: Size) => {
  const imgWidth = texture.image.width;
  const imgHeight = texture.image.height;
  const imgAspect = imgWidth / imgHeight;

  let newWidth, newHeight;
  const screenAspect = size.width / size.height;

  if (screenAspect > imgAspect) {
    newWidth = size.width;
    newHeight = size.width / imgAspect;
  } else {
    newHeight = size.height;
    newWidth = size.height * imgAspect;
  }

  return [newWidth, newHeight];
};

function Content({
  mouse,
}: {
  mouse: {
    x: MotionValue;
    y: MotionValue;
  };
}) {
  const { viewport, size } = useThree();
  const [{ yOffset, layerScale, backgroundBonusScale }] = useControls(
    () => ({
      yOffset: {
        min: -5,
        max: 5,
        value: -0.5,
      },
      layerScale: {
        min: 0.01,
        max: 2,
        value: 0.21,
      },
      backgroundBonusScale: {
        min: 0.001,
        max: 1,
        value: 0.02,
      },
    }),
    []
  );

  // const textures = useTexture([
  //   "/images/girl.png",
  //   "/images/moon.png",
  //   "/images/background.png",
  // ]);
  const textures = useTexture([
    "/images/yumcha_boy.png",
    "/images/yumcha_man.png",
    "/images/yumcha_background.png",
  ]);

  const [newWidth, newHeight] = useResizeMesh(textures[0], viewport);

  // @later - figure out how aniso does this??

  return (
    <>
      {/* // @later - rotation translate origin. transform from center of text */}
      {/* // @now - adjust size based on screen size. (viewport from useThree) */}
      {/* <Center position={[0, -1, 1]}>
        <Heading />
      </Center> */}

      {textures.map((texture, i) => (
        <ImageLayer
          key={`splash_asset_${i}`}
          position={[0, yOffset, -i]}
          dimensions={
            i < 1
              ? [
                  newWidth * (1 + layerScale * i),
                  newHeight * (1 + layerScale * i),
                ]
              : [
                  newWidth * (1 + (layerScale + backgroundBonusScale * i) * i),
                  newHeight * (1 + (layerScale + backgroundBonusScale * i) * i),
                ]
          }
          layer={i}
          map={texture}
          mouse={mouse}
        />
      ))}
      {/* <ImageLayer
        position={[0, yOffset, 0]}
        dimensions={[newWidth, newHeight]}
        map={frontWhiskers}
        mouse={smoothMouse}
      />
      <ImageLayer
        position={[0, yOffset, -1]}
        dimensions={[newWidth * 1.2, newHeight * 1.2]}
        map={dragonHead}
        mouse={smoothMouse}
      />
      <ImageLayer
        position={[0, yOffset, -2]}
         */}
      {/* {textures.map((texture, i) => {
        console.log(i);
        const scalingFactor = 0.1 * (i + 1);
        const scaledWidth = newWidth + newWidth * scalingFactor;
        const scaledHeight = newHeight + newWidth * scalingFactor;

        return (
          <mesh
            key={`splash_asset_${i}`}
            position={[0, 0, -i]}
          >
            <planeGeometry args={[scaledWidth, scaledHeight]} />
            <meshBasicMaterial map={texture} transparent />
          </mesh>
        );
      })} */}
    </>
  );
}

export function WebGL({ render = true }) {
  const [{ stiffness, damping, mass, cameraX, cameraY }] = useControls(
    () => ({
      stiffness: {
        min: 0.1,
        max: 100,
        value: 25,
      },
      damping: {
        min: 0.1,
        max: 100,
        value: 10,
      },
      mass: {
        min: 0.01,
        max: 10,
        value: 0.01,
      },
      cameraX: {
        min: 0,
        max: 1000,
        value: 0,
      },
      cameraY: {
        min: 0,
        max: 1000,
        value: 0,
      },
    }),
    []
  );
  const mouse = {
    x: useMotionValue(0),

    y: useMotionValue(0),
  };

  const smoothMouse = {
    x: useSpring(mouse.x, { stiffness, damping, mass }),

    y: useSpring(mouse.y, { stiffness, damping, mass }),
  };

  const manageMouse = useCallback(
    (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;

      const { clientX, clientY } = e;

      const x = clientX / innerWidth;

      const y = clientY / innerHeight;

      mouse.x.set(x);

      mouse.y.set(y);
    },
    [mouse.x, mouse.y]
  );

  const cameraXOffset = useTransform(mouse.x, [0, 1], [-cameraX, cameraX]);

  const cameraYOffset = useTransform(mouse.y, [0, 1], [cameraY, cameraY]);

  useEffect(() => {
    window.addEventListener("mousemove", manageMouse);

    return () => window.removeEventListener("mousemove", manageMouse);
  }, [manageMouse]);

  return (
    <Canvas
      gl={{
        powerPreference: "high-performance",
        antialias: true,
        // stencil: false,
        // depth: false,
        alpha: true,
      }}
      dpr={[1, 2]}
      // orthographic
      camera={{ near: 0.01, far: 100, position: [cameraX, cameraY, 5] }}
      //   camera={{ position: [0, 0, 1] }}
    >
      {/* <Suspense> */}
      <Content mouse={smoothMouse} />
      {/* </Suspense> */}
    </Canvas>
  );
}
