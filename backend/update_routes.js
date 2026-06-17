const fs = require('fs');
const path = require('path');

const routeModuleMap = {
  'setting.routes.js': 'settings',
  'stock.routes.js': 'products',
  'sale.routes.js': 'sales',
  'report.routes.js': 'reports',
  'purchase.routes.js': 'purchases',
  'payment.routes.js': 'sales',
  'product.routes.js': 'products',
  'expense.routes.js': 'expenses',
  'dashboard.routes.js': 'dashboard',
  'dealer.routes.js': 'dealers',
  'customer.routes.js': 'customers'
};

for (const [file, moduleName] of Object.entries(routeModuleMap)) {
  const filePath = path.join(__dirname, 'routes', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already modified
    if (!content.includes('checkModuleAccess')) {
      // Find where router is defined
      const routerDefIndex = content.indexOf('const router = express.Router();');
      if (routerDefIndex !== -1) {
        const insertPosition = routerDefIndex + 'const router = express.Router();'.length;
        
        const insertion = `\nconst { checkModuleAccess } = require('../middleware/license');\nrouter.use(checkModuleAccess('${moduleName}'));`;
        
        content = content.slice(0, insertPosition) + insertion + content.slice(insertPosition);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file} with module ${moduleName}`);
      }
    }
  }
}
