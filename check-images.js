const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'client', 'public');

const pathsToCheck = [
    '/capabilities/capability_coatings_1773046543066.png',
    '/capabilities/capability_interlinings_1773046559078.png',
    '/capabilities/capability_raising_1773046577665.png',
    '/capabilities/capability_drill_1773046598374.png',
    '/capabilities/capability_jersey_1773046618140.png',
    '/capabilities/capability_canvas_1773046633864.png',
    '/capabilities/capability_bonding_1773046650713.png',
    '/capabilities/capability_foam_lamination_1773046667501.png',
    '/capabilities/capability_advanced_fusing_1773046697258.png',
    '/capabilities/capability_polyester_printing_1773046713786.png',
    '/capabilities/capability_precision_sizing_1773046730630.png',
    '/capabilities/capability_premium_weaving_1773046747739.png',
    '/capabilities/capability_dye_wash_1773046766236.png',
    '/capabilities/capability_eva_coating_1773046781092.png',
    '/capabilities/dot_coating_product_1772736349472.png',
    '/products/jersey.png',
    '/products/canvas.png',
    '/products/foam.png',
    '/products/bonding.png',
    '/products/interlining.png',
    '/products/coating.png',
    '/products/raising.png',
    '/products/drill.png'
];

console.log('Checking image assets in:', publicDir);
pathsToCheck.forEach(p => {
    const fullPath = path.join(publicDir, p);
    if (fs.existsSync(fullPath)) {
        console.log(`[OK] ${p}`);
    } else {
        console.log(`[MISSING] ${p}`);
    }
});
