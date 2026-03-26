import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { RepeatWrapping, DoubleSide } from 'three';
import ThreeErrorBoundary from './ThreeErrorBoundary';

interface FabricSceneProps {
    textureUrl: string;
    color?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
}

const FabricScene = ({ textureUrl, color = '#ffffff', normalMapUrl, roughnessMapUrl }: FabricSceneProps) => {
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
                color={color}
                side={DoubleSide}
                roughness={1}
                metalness={0.0}
                emissive={color}
                emissiveIntensity={0.05}
            />
        </mesh>
    );
};

interface FabricViewerProps {
    textureUrl: string;
    color?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
}

const FabricViewer = ({ textureUrl, color = '#ffffff', normalMapUrl, roughnessMapUrl }: FabricViewerProps) => {
    const { theme } = useTheme();
    const controlsRef = useRef<any>(null);

    const handleReset = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    const bgColor = theme === 'dark' ? '#020617' : '#ffffff';
    const textColor = theme === 'dark' ? 'text-white/60' : 'text-slate-600';
    const modalBg = theme === 'dark' ? 'bg-black/60' : 'bg-white/80';
    const borderColor = theme === 'dark' ? 'border-white/10' : 'border-slate-200';

    return (
        <div className="w-full h-full rounded-lg overflow-hidden relative transition-colors duration-500" style={{ backgroundColor: bgColor }}>
            <div className={`absolute top-4 right-4 z-10 ${modalBg} backdrop-blur-sm px-3 py-1.5 rounded-full text-xs ${textColor} flex gap-3 items-center border ${borderColor} shadow-sm transition-all`}>
                <span className="font-medium tracking-wide">Interactive 3D Preview</span>
                <div className="w-px h-3 bg-current opacity-20"></div>
                <button onClick={handleReset} className="text-brand hover:scale-105 active:scale-95 font-bold transition-all">Reset View</button>
            </div>
            <ThreeErrorBoundary>
                <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [0, 2, 3] }} gl={{ alpha: false }}>
                    <color attach="background" args={[bgColor]} />
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={2} adjustCamera={1.5}>
                            <FabricScene
                                textureUrl={textureUrl || "/3dmodel/cotton_texture.png"}
                                color={color}
                                normalMapUrl={normalMapUrl}
                                roughnessMapUrl={roughnessMapUrl}
                            />
                        </Stage>
                    </Suspense>
                    <OrbitControls ref={controlsRef} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </ThreeErrorBoundary>
        </div>
    );
};

export default FabricViewer;
