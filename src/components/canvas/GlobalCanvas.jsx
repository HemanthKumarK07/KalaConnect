import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, MeshDistortMaterial, Float } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Route-based 3D scene targets
 */
const ROUTE_3D_TARGETS = {
  '/': {
    cameraPos: [0, 0, 8],
    cameraRot: [0, 0, 0],
    fov: 45,
    lightColor: '#F0C060',
    particleColor: '#C9A66B',
    meshPos: [2.2, -0.2, 0],
    meshScale: 1.4,
    particleSpeed: 0.3,
  },
  '/marketplace': {
    cameraPos: [0, 1.5, 11],
    cameraRot: [-0.08, 0, 0],
    fov: 48,
    lightColor: '#A8C4B8',
    particleColor: '#8A6A4A',
    meshPos: [-3.2, 0.8, -2],
    meshScale: 1.1,
    particleSpeed: 0.4,
  },
  '/academy': {
    cameraPos: [0, -1.2, 9],
    cameraRot: [0.06, -0.12, 0],
    fov: 42,
    lightColor: '#B8A8C4',
    particleColor: '#B8A8C4',
    meshPos: [3, -0.6, -1],
    meshScale: 1.2,
    particleSpeed: 0.4,
  },
  '/community': {
    cameraPos: [1.2, 0.4, 9.5],
    cameraRot: [0, -0.08, 0],
    fov: 45,
    lightColor: '#D87D4A',
    particleColor: '#C4A882',
    meshPos: [-2.5, -0.4, 0.5],
    meshScale: 1.15,
    particleSpeed: 0.5,
  },
  '/ai-assistant': {
    cameraPos: [0, 0, 7],
    cameraRot: [0, 0, 0],
    fov: 40,
    lightColor: '#4A90E2',
    particleColor: '#F0C060',
    meshPos: [0, 0, -2.5],
    meshScale: 1.5,
    particleSpeed: 0.6,
  },
  'default': {
    cameraPos: [0, 0, 9],
    cameraRot: [0, 0, 0],
    fov: 45,
    lightColor: '#C9A66B',
    particleColor: '#DFC49B',
    meshPos: [2, 0, -1],
    meshScale: 1,
    particleSpeed: 0.3,
  },
};

/**
 * 3D Woven Silk Threads — 16 glowing 3D ribbons weaving through 3D space during page transitions
 */
function WovenSilkRibbons({ pathname }) {
  const groupRef = useRef();
  const ribbonsRef = useRef([]);

  // Generate 16 CatmullRom 3D curves
  const curves = useMemo(() => {
    const list = [];
    for (let i = 0; i < 16; i++) {
      const points = [];
      const isHorizontal = i % 2 === 0;
      const span = 16;
      for (let j = 0; j <= 5; j++) {
        const t = (j / 5) * span - span / 2;
        const offsetA = Math.sin(j * 0.8 + i) * 1.5;
        const offsetB = Math.cos(j * 0.6 + i) * 1.2;
        if (isHorizontal) {
          points.push(new THREE.Vector3(t, (i - 8) * 0.8 + offsetA, offsetB - 2));
        } else {
          points.push(new THREE.Vector3((i - 8) * 0.8 + offsetA, t, offsetB - 2));
        }
      }
      list.push(new THREE.CatmullRomCurve3(points));
    }
    return list;
  }, []);

  useEffect(() => {
    if (!groupRef.current) return;

    // Trigger a 3D silk weave wave on route transition (800ms)
    gsap.fromTo(
      groupRef.current.position,
      { x: -12, z: -2 },
      {
        x: 12,
        z: 0,
        duration: 0.8,
        ease: 'power3.inOut',
      }
    );

    ribbonsRef.current.forEach((mat, idx) => {
      if (!mat) return;
      gsap.fromTo(
        mat,
        { opacity: 0 },
        {
          opacity: 0.6,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
          delay: idx * 0.02,
        }
      );
    });
  }, [pathname]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 64, 0.03, 8, false]} />
          <meshBasicMaterial
            ref={(el) => (ribbonsRef.current[i] = el)}
            color={['#F0C060', '#C9A66B', '#FAF8F5', '#8B5E3C'][i % 4]}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * CameraRig — Subtle, cinematic camera moves synchronized with route transitions
 */
function CameraRig({ pathname }) {
  const { camera } = useThree();
  const lightRef = useRef();
  const meshGroupRef = useRef();

  const target = useMemo(() => {
    if (ROUTE_3D_TARGETS[pathname]) return ROUTE_3D_TARGETS[pathname];
    if (pathname?.startsWith('/marketplace/')) return ROUTE_3D_TARGETS['/marketplace'];
    if (pathname?.startsWith('/academy/')) return ROUTE_3D_TARGETS['/academy'];
    return ROUTE_3D_TARGETS['default'];
  }, [pathname]);

  useEffect(() => {
    const duration = 0.8;
    const ease = 'power3.inOut';

    // Camera Position (Very subtle, cinematic move)
    gsap.to(camera.position, {
      x: target.cameraPos[0],
      y: target.cameraPos[1],
      z: target.cameraPos[2],
      duration,
      ease,
    });

    // Camera Rotation
    gsap.to(camera.rotation, {
      x: target.cameraRot[0],
      y: target.cameraRot[1],
      z: target.cameraRot[2],
      duration,
      ease,
    });

    // FOV
    gsap.to(camera, {
      fov: target.fov,
      duration,
      ease,
      onUpdate: () => camera.updateProjectionMatrix(),
    });

    // Lighting color
    if (lightRef.current) {
      const targetColor = new THREE.Color(target.lightColor);
      gsap.to(lightRef.current.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration,
        ease,
      });
    }

    // Mesh Position & Scale
    if (meshGroupRef.current) {
      gsap.to(meshGroupRef.current.position, {
        x: target.meshPos[0],
        y: target.meshPos[1],
        z: target.meshPos[2],
        duration,
        ease,
      });
      gsap.to(meshGroupRef.current.scale, {
        x: target.meshScale,
        y: target.meshScale,
        z: target.meshScale,
        duration,
        ease,
      });
    }
  }, [pathname, target, camera]);

  useFrame((state) => {
    const mouseX = state.pointer.x * 0.2;
    const mouseY = state.pointer.y * 0.2;

    camera.position.x += (mouseX - camera.position.x + target.cameraPos[0]) * 0.015;
    camera.position.y += (-mouseY - camera.position.y + target.cameraPos[1]) * 0.015;
    camera.lookAt(0, 0, 0);

    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y += 0.004;
      meshGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={[5, 8, 5]}
        intensity={1.6}
        color={target.lightColor}
      />
      <ambientLight intensity={0.5} />

      {/* 3D Woven Silk Threads Wave */}
      <WovenSilkRibbons pathname={pathname} />

      {/* Background Craft Vessel */}
      <group ref={meshGroupRef} position={target.meshPos} scale={target.meshScale}>
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
              color="#C9A66B"
              envMapIntensity={0.8}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
              metalness={0.25}
              roughness={0.35}
              distort={0.22}
              speed={1.0}
              transparent
              opacity={0.3}
            />
          </mesh>
        </Float>
      </group>

      {/* Soft Dust Particles */}
      <Sparkles
        count={70}
        scale={16}
        size={1.6}
        speed={target.particleSpeed}
        opacity={0.22}
        color={target.particleColor}
      />
    </>
  );
}

/**
 * GlobalCanvas — Persistent 3D canvas behind DOM elements
 */
export default function GlobalCanvas({ children, pathname }) {
  return (
    <>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <CameraRig pathname={pathname} />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}
