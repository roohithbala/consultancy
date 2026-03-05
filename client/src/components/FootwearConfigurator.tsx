import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useFBX, useTexture } from '@react-three/drei';
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
                        
                        if (texture) {
                            m.map = texture;
                        }
                        
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
}

const FootwearConfigurator = ({ color: externalColor }: FootwearConfiguratorProps) => {
    const color = externalColor || '#d4af37';
    
    const [materialType, setMaterialType] = useState('Cotton');

    const textures: Record<string, string> = {
        'Cotton': '/3dmodel/cotton_texture.png', // Assuming these exist in public/3dmodel
        'Polyester': '/3dmodel/polyester_texture.png',
        'Foam': '/3dmodel/foam_texture.png',
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 bg-card border border-theme p-4 rounded-xl shadow-2xl">
            {/* 3D Canvas Area */}
            <div className="flex-1 h-[500px] bg-secondary/5 rounded-lg relative overflow-hidden">
                <ThreeErrorBoundary>
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
                        <Suspense fallback={null}>
                            <Stage environment="city" intensity={1.5} adjustCamera={1.2}>
                                <ShoeModel 
                                    modelUrl="/3dmodel/t13.fbx" 
                                    color={color} 
                                    textureUrl={textures[materialType]}
                                />
                            </Stage>
                        </Suspense>
                        <OrbitControls makeDefault />
                    </Canvas>
                </ThreeErrorBoundary>
                
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] text-gold uppercase tracking-widest font-bold">
                    Interactive 3D Preview
                </div>
            </div>

            {/* UI Control Panel */}
            <div className="lg:w-72 flex flex-col gap-8 p-4">
                <div>
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-4">Interlining Material</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {['Cotton', 'Polyester', 'Foam'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMaterialType(type)}
                                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border transition-all duration-300 rounded-lg ${materialType === type ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20 scale-[1.02]' : 'bg-transparent text-secondary border-theme hover:border-gold/50'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="text-[10px] text-secondary/60 italic leading-relaxed">
                        Select material type here. Use the global color tools to customize the appearance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FootwearConfigurator;
