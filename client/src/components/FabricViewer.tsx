import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { RepeatWrapping } from 'three';

interface FabricSceneProps {
    textureUrl: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
}

const FabricScene = ({ textureUrl, normalMapUrl, roughnessMapUrl }: FabricSceneProps) => {
    const props = useTexture({
        map: textureUrl,
        ...(normalMapUrl && { normalMap: normalMapUrl }),
        ...(roughnessMapUrl && { roughnessMap: roughnessMapUrl }),
    });

    // Repeat textures
    Object.values(props).forEach((tex) => {
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
        tex.repeat.set(4, 4);
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
            {/* Draped fabric shape (using simple plane for now, ideally a custom model) */}
            <planeGeometry args={[2, 2, 128, 128]} />
            <meshStandardMaterial
                {...props}
                side={2} // Double side
                roughness={0.8}
            />
        </mesh>
    );
};

interface FabricViewerProps {
    textureUrl: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
}

const FabricViewer = ({ textureUrl, normalMapUrl, roughnessMapUrl }: FabricViewerProps) => {
    const controlsRef = useRef<any>(null);

    const handleReset = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    return (
        <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded text-xs text-gray-500 flex gap-2">
                <span>Interactive 3D Preview</span>
                <button onClick={handleReset} className="text-accent hover:underline font-bold">Reset View</button>
            </div>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5}>
                        <FabricScene
                            textureUrl={textureUrl}
                            normalMapUrl={normalMapUrl}
                            roughnessMapUrl={roughnessMapUrl}
                        />
                    </Stage>
                </Suspense>
                <OrbitControls ref={controlsRef} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default FabricViewer;
