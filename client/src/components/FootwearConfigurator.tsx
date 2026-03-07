import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useFBX, useTexture, Html } from '@react-three/drei';
import { Suspense, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import ThreeErrorBoundary from './ThreeErrorBoundary';

interface ModelProps {
    modelUrl: string;
    color: string;
    textureUrl?: string;
}

const ShoeModel = ({ modelUrl, color, textureUrl }: ModelProps) => {
    const fbx = useFBX(modelUrl);
    const texture = textureUrl ? useTexture(textureUrl) : null;

    useLayoutEffect(() => {
        if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2);
            texture.needsUpdate = true;
        }

        fbx.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Debug log to help identify mesh names
                console.log(`Processing mesh: ${child.name}`);
                
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    if (mat && 'color' in mat) {
                        const m = mat as any;
                        const threeColor = new THREE.Color(color);
                        m.color.copy(threeColor);
                        
                        // Clear existing map if we should show pure color or specific texture
                        m.map = texture || null;
                        
                        m.side = THREE.DoubleSide;
                        
                        // Slightly boost colors if they are too dark in the model's materials
                        if ('emissive' in m) {
                            m.emissive.copy(threeColor).multiplyScalar(0.1);
                        }
                        
                        // Increase roughness slightly to reduce black glossy spots
                        if ('roughness' in m) m.roughness = 0.9;
                        
                        m.needsUpdate = true;
                    }
                });
            }
        });
    }, [fbx, color, texture]);

    return <primitive object={fbx} scale={0.01} />;
};

interface FootwearConfiguratorProps {
    color?: string;
    modelUrl?: string;
    fallbackImage?: string;
}

const FootwearConfigurator = ({ color: externalColor, modelUrl }: FootwearConfiguratorProps) => {
    const color = externalColor || '#10b981';
    
    // Map materialType from product to the internal 3D material state
    const getInitialMaterial = () => {
        return 'Original';
    };

    const [materialType, setMaterialType] = useState(getInitialMaterial());

    const textures: Record<string, string | null> = {
        'Original': null,
        'Cotton': '/3dmodel/cotton_texture.png',
        'Polyester': '/3dmodel/polyester_texture.png',
        'Foam': '/3dmodel/foam_texture.png',
        'Jersey': '/3dmodel/jersey_texture.png',
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-card border border-theme p-4 rounded-xl shadow-2xl">
            {/* 3D Canvas or Static Image Area */}
            <div className="flex-1 h-[500px] bg-secondary/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                {materialType === 'Original' ? (
                    <div className="relative w-full h-full p-8 animate-fade-in flex items-center justify-center bg-accent-dark/40 backdrop-blur-sm rounded-lg overflow-hidden">
                        <img 
                            src="/3dmodel/t13.png" 
                            alt="Original Material View" 
                            className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-700"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-brand/90 backdrop-blur-md rounded border border-white/10 text-[10px] text-black uppercase tracking-widest font-black">
                            Finished Surface View
                        </div>
                    </div>
                ) : (
                    <>
                        <ThreeErrorBoundary>
                            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
                                <Suspense fallback={
                                    <Html center>
                                        <div className="w-64 h-64 flex flex-col items-center justify-center text-brand">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
                                            <p className="text-[10px] uppercase tracking-widest font-black">Loading 3D...</p>
                                        </div>
                                    </Html>
                                }>
                                    <Stage environment="city" intensity={1.5} adjustCamera={1.2}>
                                        <ShoeModel 
                                            modelUrl={modelUrl || "/3dmodel/t13.fbx"} 
                                            color={color} 
                                            textureUrl={textures[materialType] || undefined}
                                        />
                                    </Stage>
                                </Suspense>
                                <OrbitControls makeDefault />
                            </Canvas>
                        </ThreeErrorBoundary>
                        
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] text-brand uppercase tracking-widest font-bold">
                            Interactive View
                        </div>
                    </>
                )}
            </div>

            {/* UI Control Panel */}
            <div className="lg:w-72 flex flex-col gap-8 p-4">
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-[0.3em] mb-4">Original Material</h3>
                        <button
                            onClick={() => setMaterialType('Original' as any)}
                            className={`w-full px-6 py-4 rounded-xl uppercase text-[10px] font-black tracking-[0.2em] transition-all border ${
                                materialType === 'Original' 
                                ? 'bg-brand text-black border-brand shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02]' 
                                : 'bg-white/5 text-primary-text border-white/5 hover:border-brand/30'
                            }`}
                        >
                            Finished Surface
                        </button>
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-brand uppercase tracking-[0.3em] mb-4">Cross Section Views</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(textures).filter(k => k !== 'Original').map((type, idx) => (
                                <button
                                    key={type}
                                    onClick={() => setMaterialType(type as any)}
                                    className={`px-3 py-3 rounded-xl uppercase text-[9px] font-black tracking-[0.15em] transition-all border ${
                                        materialType === type 
                                        ? 'bg-brand text-black border-brand shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                        : 'bg-white/5 text-primary-text border-white/5 hover:border-brand/30'
                                    }`}
                                >
                                    View {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border/10">
                    <p className="text-[11px] text-secondary-text leading-relaxed font-medium">
                        {materialType === 'Original' ? (
                            "Viewing the complete material surfacing as utilized in final manufacturing. Precision-engineered for durability and aesthetic excellence."
                        ) : (
                            "Visualizing the internal architecture and material layering. Use these cross-sections to inspect the technical bond and fiber density of the chosen footwear component."
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FootwearConfigurator;
