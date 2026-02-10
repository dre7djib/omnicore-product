const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '..', 'postman_collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

console.log('🔧 Fixing Postman collection...\n');

function fixItem(item, parentName = '') {
  if (item.item) {
    // Folder
    item.item.forEach(subItem => fixItem(subItem, item.name));
  } else if (item.request) {
    // Request
    const fullName = parentName ? `${parentName} / ${item.name}` : item.name;
    
    // Fix URL path for Cloudinary routes
    if (item.request.url && item.request.url.path) {
      const path = item.request.url.path;
      if (path[0] === 'products' && !path.includes('api')) {
        path.unshift('api');
        console.log(`✓ Fixed URL for: ${fullName}`);
      }
    }
    
    // Fix event scripts to properly set variables
    if (item.event) {
      item.event.forEach(event => {
        if (event.listen === 'test' && event.script && event.script.exec) {
          let script = event.script.exec.join('\n');
          let modified = false;
          
          // Fix Belgium/France country creation to set variables
          if (fullName.includes('Create Belgium')) {
            const newScript = `pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Belgium created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.name).to.eql('Belgium');
    pm.expect(jsonData.countryCode).to.eql('BE');
    pm.environment.set('belgiumId', jsonData.id);
});`;
            if (script !== newScript) {
              event.script.exec = newScript.split('\n');
              console.log(`✓ Fixed test script for: ${fullName}`);
              modified = true;
            }
          }
          
          if (fullName.includes('Create France')) {
            const newScript = `pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("France created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.name).to.eql('France');
    pm.expect(jsonData.countryCode).to.eql('FR');
    pm.environment.set('franceId', jsonData.id);
});`;
            if (script !== newScript) {
              event.script.exec = newScript.split('\n');
              console.log(`✓ Fixed test script for: ${fullName}`);
              modified = true;
            }
          }
          
          // Fix Belgium stock creation
          if (fullName.includes('Create Belgium Stock')) {
            const newScript = `pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Belgium stock created", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.price.toString()).to.eql('29.99');
    pm.expect(jsonData.currency).to.eql('EUR');
    pm.expect(jsonData.quantity).to.eql(100);
    pm.environment.set('belgiumStockId', jsonData.id);
});`;
            if (script !== newScript) {
              event.script.exec = newScript.split('\n');
              console.log(`✓ Fixed test script for: ${fullName}`);
              modified = true;
            }
          }
          
          // Fix France stock creation
          if (fullName.includes('Create France Stock')) {
            const newScript = `pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("France stock created", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.price.toString()).to.eql('34.99');
    pm.expect(jsonData.currency).to.eql('EUR');
    pm.expect(jsonData.quantity).to.eql(50);
    pm.environment.set('franceStockId', jsonData.id);
});`;
            if (script !== newScript) {
              event.script.exec = newScript.split('\n');
              console.log(`✓ Fixed test script for: ${fullName}`);
              modified = true;
            }
          }
        }
      });
    }
    
    // Fix request URLs that need variable substitution
    if (item.request.url && typeof item.request.url === 'object') {
      const url = item.request.url;
      
      // Fix "Get Belgium by ID" - should use belgiumId
      if (fullName.includes('Get Belgium by ID')) {
        if (!url.raw.includes('{{belgiumId}}')) {
          url.raw = '{{baseUrl}}/api/countries/{{belgiumId}}';
          url.path = ['api', 'countries', '{{belgiumId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Update Belgium"
      if (fullName.includes('Update Belgium')) {
        if (!url.raw.includes('{{belgiumId}}')) {
          url.raw = '{{baseUrl}}/api/countries/{{belgiumId}}';
          url.path = ['api', 'countries', '{{belgiumId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix country products endpoints
      if (fullName.includes('Get Belgium Products (Belgium View)')) {
        if (!url.raw.includes('{{belgiumId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/country/{{belgiumId}}';
          url.path = ['api', 'country-products', 'country', '{{belgiumId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      if (fullName.includes('Get France Products (France View)')) {
        if (!url.raw.includes('{{franceId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/country/{{franceId}}';
          url.path = ['api', 'country-products', 'country', '{{franceId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Get Country Product by ID"
      if (fullName.includes('Get Country Product by ID')) {
        if (!url.raw.includes('{{belgiumStockId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/{{belgiumStockId}}';
          url.path = ['api', 'country-products', '{{belgiumStockId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Update Belgium Stock Quantity"
      if (fullName.includes('Update Belgium Stock Quantity')) {
        if (!url.raw.includes('{{belgiumStockId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/{{belgiumStockId}}/stock';
          url.path = ['api', 'country-products', '{{belgiumStockId}}', 'stock'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Update France Stock to Out of Stock"
      if (fullName.includes('Update France Stock to Out of Stock')) {
        if (!url.raw.includes('{{franceStockId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/{{franceStockId}}/stock';
          url.path = ['api', 'country-products', '{{franceStockId}}', 'stock'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Update Belgium Price"
      if (fullName.includes('Update Belgium Price')) {
        if (!url.raw.includes('{{belgiumStockId}}')) {
          url.raw = '{{baseUrl}}/api/country-products/{{belgiumStockId}}';
          url.path = ['api', 'country-products', '{{belgiumStockId}}'];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
      
      // Fix "Filter by Country ID"
      if (fullName.includes('Filter by Country ID') && fullName.includes('Country Products')) {
        if (!url.raw.includes('{{belgiumId}}')) {
          url.raw = '{{baseUrl}}/api/country-products?countryId={{belgiumId}}';
          url.path = ['api', 'country-products'];
          url.query = [{key: 'countryId', value: '{{belgiumId}}'}];
          console.log(`✓ Fixed URL variables for: ${fullName}`);
        }
      }
    }
    
    // Fix request body for country products
    if (item.request.body && item.request.body.mode === 'raw') {
      try {
        const body = JSON.parse(item.request.body.raw);
        let modified = false;
        
        if (fullName.includes('Create Belgium Stock')) {
          if (!body.countryId || !body.countryId.includes('{{belgiumId}}')) {
            body.productId = '{{productId}}';
            body.countryId = '{{belgiumId}}';
            item.request.body.raw = JSON.stringify(body, null, 2);
            console.log(`✓ Fixed request body for: ${fullName}`);
            modified = true;
          }
        }
        
        if (fullName.includes('Create France Stock')) {
          if (!body.countryId || !body.countryId.includes('{{franceId}}')) {
            body.productId = '{{productId}}';
            body.countryId = '{{franceId}}';
            item.request.body.raw = JSON.stringify(body, null, 2);
            console.log(`✓ Fixed request body for: ${fullName}`);
            modified = true;
          }
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  }
}

// Process all items
collection.item.forEach(item => fixItem(item));

// Write back
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log('\n✅ Postman collection fixed successfully!');
console.log('📝 File updated: postman_collection.json');
