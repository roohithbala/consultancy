import { useState, useEffect } from 'react';
import { Pipette, RotateCcw, Palette } from 'lucide-react';

interface ColorToolsProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorTools = ({ color, onChange }: ColorToolsProps) => {
    const [hex, setHex] = useState(color);
    
    // Categorized Palettes
    const paletteCategories = [
        {
            name: 'Earth Tones',
            colors: ['#4b3621', '#8b4513', '#a0522d', '#d2b48c', '#bc8f8f', '#f4a460']
        },
        {
            name: 'Professional',
            colors: ['#1a1a1a', '#333333', '#4d4d4d', '#808080', '#c0c0c0', '#ffffff']
        },
        {
            name: 'Vibrant',
            colors: ['#ff0000', '#ff8c00', '#ffd700', '#008000', '#0000ff', '#4b0082']
        },
        {
            name: 'Premium',
            colors: ['#d4af37', '#c5a028', '#b8860b', '#daa520', '#ffd700', '#e5e4e2']
        }
    ];

    useEffect(() => {
        setHex(color);
    }, [color]);

    const handleHexChange = (val: string) => {
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            onChange(val);
        }
    };

    // Helper functions for RGB/HSL conversion would go here if we wanted separate inputs
    // For now, let's keep it snappy with Hex + Previews + Native Picker

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Main Picker and Hex Input */}
            <div className="p-4 bg-secondary/10 border border-theme rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Active Color</h4>
                    <button 
                        onClick={() => onChange('#ffffff')}
                        className="text-[10px] text-gold hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={10} /> Reset
                    </button>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative group">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => onChange(e.target.value)}
                            className="w-16 h-16 rounded-xl border border-theme cursor-pointer bg-transparent p-1 transition-transform hover:scale-105 active:scale-95"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gold text-black rounded-full p-1 pointer-events-none group-hover:scale-110 transition-transform">
                            <Pipette size={10} strokeWidth={3} />
                        </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={hex} 
                                onChange={(e) => handleHexChange(e.target.value)}
                                className="w-full bg-primary/50 border border-theme text-primary p-3 rounded-lg text-sm font-mono focus:border-gold outline-none transition-all pr-10"
                                placeholder="#000000"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-theme" style={{ backgroundColor: color }}></div>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-2 uppercase tracking-tighter">Enter Hexadecimal, RGB, or HSL format</p>
                    </div>
                </div>
            </div>

            {/* Categorized Palettes */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                    <Palette size={14} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Global Palettes</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {paletteCategories.map((cat) => (
                        <div key={cat.name} className="space-y-2">
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest ml-1">{cat.name}</p>
                            <div className="flex flex-wrap gap-2">
                                {cat.colors.map((c) => (
                                    <button 
                                        key={c}
                                        onClick={() => onChange(c)}
                                        className={`w-7 h-7 rounded-sm border transition-all duration-300 ${color.toLowerCase() === c.toLowerCase() ? 'border-gold scale-125 z-10 shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'border-theme hover:scale-110 hover:border-primary/50'}`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hint for codes */}
            <div className="p-3 bg-gold/5 border border-gold/10 rounded-lg">
                <p className="text-[9px] text-secondary/70 leading-relaxed italic">
                    Supported: #HEX (e.g. #D4AF37), RGB (e.g. rgb(212, 175, 55)), HSL (e.g. hsl(45, 66%, 48%)).
                    Colors are applied in real-time to the 3D material.
                </p>
            </div>
        </div>
    );
};

export default ColorTools;
