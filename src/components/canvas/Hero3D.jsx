import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export default function Hero3D() {
  const meshRef = useRef();
  const materialRef = useRef();

  // Procedural pottery-like material
  const colors = useMemo(() => [
    new THREE.Color('#8A6A4A'), // secondary
    new THREE.Color('#3F3126'), // primary
    new THREE.Color('#C9A66B'), // accent
  ], []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (materialRef.current) {
      materialRef.current.distort = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[2, 64, 64]} />
          <MeshDistortMaterial
            ref={materialRef}
            color="#8A6A4A"
            envMapIntensity={1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            metalness={0.1}
            roughness={0.4}
            distort={0.2}
            speed={2}
          />
        </mesh>
      </Float>

      {/* Floating particles mimicking clay dust */}
      <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.2} color="#C9A66B" />

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </>
  );
}
