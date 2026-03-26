import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/ProfilePage.tsx',
  'src/pages/admin/ProductListPage.tsx',
  'src/pages/admin/CustomerListPage.tsx',
  'src/components/CartEditModal.tsx'
];

files.forEach(f => {
  const filePath = path.resolve(f);
  if (fs.existsSync(filePath)) {
    let text = fs.readFileSync(filePath, 'utf8');
    
    // Ensure API is imported if not already
    if (!text.includes("from '../config/api'") && !text.includes("from '../../config/api'")) {
      const isPagesAdmin = f.includes('pages/admin');
      const isComponents = f.includes('components');
      const isPages = f.includes('pages/') && !isPagesAdmin;
      
      let importPath = "'../config/api'"; // For pages and components
      if (isPagesAdmin) {
        importPath = "'../../config/api'";
      }
      
      // Inject import after first import
      text = text.replace(/import.*?;\n/, `$&import { API } from ${importPath};\n`);
    }

    text = text.replace(/`http:\/\/localhost:5000\/api/g, '`${API}');
    text = text.replace(/'http:\/\/localhost:5000\/api/g, '`${API}');
    // Fix the ending quote for the single quote replacement
    text = text.replace(/`\$\{API\}\/users\/profile'/g, '`${API}/users/profile`');
    text = text.replace(/`\$\{API\}\/products'/g, '`${API}/products`');
    text = text.replace(/`\$\{API\}\/users'/g, '`${API}/users`');

    fs.writeFileSync(filePath, text);
    console.log('Fixed', f);
  }
});
