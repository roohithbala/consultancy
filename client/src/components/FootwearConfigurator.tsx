import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Html } from '@react-three/drei';
import { Suspense, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import ThreeErrorBoundary from './ThreeErrorBoundary';

// ── Sub-component: model WITH texture ──────────────────────────────────────
const ShoeModelWithTexture = ({ modelUrl, color, textureUrl }: { modelUrl: string; color: string; textureUrl: string }) => {
    const fbx = useLoader(FBXLoader, modelUrl);
    const texture = useLoader(THREE.TextureLoader, textureUrl);

    useLayoutEffect(() => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.needsUpdate = true;

        fbx.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    if (mat && 'color' in mat) {
                        const m = mat as any;
                        m.color.copy(new THREE.Color(color));
                        m.map = texture;
                        m.side = THREE.DoubleSide;
                        if ('emissive' in m) m.emissive.copy(new THREE.Color(color)).multiplyScalar(0.1);
                        if ('roughness' in m) m.roughness = 0.9;
                        m.needsUpdate = true;
                    }
                });
            }
        });
    }, [fbx, color, texture]);

    return <primitive object={fbx} scale={0.01} />;
};

// ── Sub-component: model WITHOUT texture ───────────────────────────────────
const ShoeModelPlain = ({ modelUrl, color }: { modelUrl: string; color: string }) => {
    const fbx = useLoader(FBXLoader, modelUrl);

    useLayoutEffect(() => {
        fbx.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    if (mat && 'color' in mat) {
                        const m = mat as any;
                        m.color.copy(new THREE.Color(color));
                        m.map = null;
                        m.side = THREE.DoubleSide;
                        if ('emissive' in m) m.emissive.copy(new THREE.Color(color)).multiplyScalar(0.1);
                        if ('roughness' in m) m.roughness = 0.9;
                        m.needsUpdate = true;
                    }
                });
            }
        });
    }, [fbx, color]);

    return <primitive object={fbx} scale={0.01} />;
};

const ShoeModel = ({ modelUrl, color, textureUrl }: { modelUrl: string; color: string; textureUrl?: string }) => {
    if (textureUrl) {
        return <ShoeModelWithTexture modelUrl={modelUrl} color={color} textureUrl={textureUrl} />;
    }
    return <ShoeModelPlain modelUrl={modelUrl} color={color} />;
};

const LoadingOverlay = () => (
    <Html center>
        <div className="flex flex-col items-center justify-center gap-3 text-brand min-w-[160px]">
            <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-black text-center">Loading 3D Model…</p>
        </div>
    </Html>
);

interface FootwearConfiguratorProps {
    color?: string;
    modelUrl?: string;
    fallbackImage?: string;
}

const MATERIAL_LABELS: Record<string, string> = {
    'Cotton': 'View 1',
    'Polyester': 'View 2',
    'Foam': 'View 3',
    'Jersey': 'View 4',
};

const FootwearConfigurator = ({ color: externalColor, modelUrl, fallbackImage }: FootwearConfiguratorProps) => {
    const color = externalColor || '#10b981';
    const [materialType, setMaterialType] = useState('Original');

    const textures: Record<string, string | null> = {
        'Original': null,
        'Cotton':    '/3dmodel/cotton_texture.png',
        'Polyester': '/3dmodel/polyester_texture.png',
        'Foam':      '/3dmodel/foam_texture.png',
        'Jersey':    '/3dmodel/jersey_texture.png',
    };

    const effectiveModelUrl = modelUrl || '/3dmodel/t13.fbx';
    const currentTexture = textures[materialType];
    const show3D = materialType !== 'Original';

    return (
        <div className="flex flex-col lg:flex-row h-full">
            {/* Viewer Area */}
            <div className="flex-1 h-full bg-[#0a0a0a] relative overflow-hidden lg:rounded-l-[2.5rem] flex items-center justify-center">
                {!show3D ? (
                    /* Original → static image */
                    <div className="relative w-full h-full flex items-center justify-center bg-secondary rounded-lg overflow-hidden">
                        <img
                            src={fallbackImage || '/3dmodel/t13.png'}
                            alt="Material View"
                            className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/3dmodel/t13.png'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-brand/90 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-black uppercase tracking-widest font-black">
                            Finished Surface View
                        </div>
                    </div>
                ) : (
                    /* Cross-section → 3D Canvas */
                    <ThreeErrorBoundary>
                        <Canvas
                            shadows
                            dpr={[1, 2]}
                            camera={{ position: [0, 0, 5], fov: 45 }}
                            gl={{ alpha: false }}
                            className="w-full h-full"
                        >
                            <color attach="background" args={['#0a0a0a']} />
                            <Suspense fallback={<LoadingOverlay />}>
                                <Stage environment="city" intensity={1.5} adjustCamera={1.2}>
                                    <ShoeModel
                                        modelUrl={effectiveModelUrl}
                                        color={color}
                                        textureUrl={currentTexture || undefined}
                                    />
                                </Stage>
                            </Suspense>
                            <OrbitControls makeDefault enablePan={false} />
                        </Canvas>
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-brand uppercase tracking-widest font-bold pointer-events-none">
                            Interactive 3D · {MATERIAL_LABELS[materialType] || materialType}
                        </div>
                    </ThreeErrorBoundary>
                )}
            </div>

            {/* Control Panel */}
            <div className="lg:w-72 flex flex-col gap-6 p-6 bg-secondary border-l border-theme lg:rounded-r-[2.5rem] z-10 relative">
                {/* Original / Finished surface */}
                <div>
                    <p className="text-[9px] text-secondary-text/60 uppercase tracking-[0.3em] font-black mb-3">Surface View</p>
                    <button
                        onClick={() => setMaterialType('Original')}
                        className={`w-full px-5 py-3.5 rounded-xl uppercase text-[10px] font-black tracking-[0.15em] transition-all border ${
                            materialType === 'Original'
                            ? 'bg-brand text-black border-brand shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'bg-secondary text-primary-text border-theme hover:border-brand/30 hover:text-brand'
                        }`}
                    >
                        Finished Surface
                    </button>
                </div>

                {/* Cross-section texture views */}
                <div>
                    <p className="text-[9px] text-secondary-text/60 uppercase tracking-[0.3em] font-black mb-3">Cross-Section Views</p>
                    <div className="grid grid-cols-2 gap-2.5">
                        {Object.keys(textures).filter(k => k !== 'Original').map((type) => (
                            <button
                                key={type}
                                onClick={() => setMaterialType(type)}
                                className={`px-3 py-3 rounded-xl uppercase text-[9px] font-black tracking-[0.12em] transition-all border ${
                                    materialType === type
                                    ? 'bg-brand text-black border-brand shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'bg-secondary text-primary-text border-theme hover:border-brand/30 hover:text-brand'
                                }`}
                            >
                                {MATERIAL_LABELS[type] || type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-theme">
                    <p className="text-[10px] text-secondary-text leading-relaxed">
                        {materialType === 'Original'
                            ? 'Finished product surface as used in manufacturing.'
                            : `${MATERIAL_LABELS[materialType] || materialType}: internal fiber layer in 3D. Drag to rotate, scroll to zoom.`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FootwearConfigurator;
