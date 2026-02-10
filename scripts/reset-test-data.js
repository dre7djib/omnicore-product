const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetTestData() {
  console.log('🧹 Cleaning test data...');
  
  try {
    await prisma.countryProduct.deleteMany({});
    console.log('✓ Deleted country products');
    
    await prisma.productImage.deleteMany({});
    console.log('✓ Deleted product images');
    
    await prisma.product.deleteMany({});
    console.log('✓ Deleted products');
    
    await prisma.country.deleteMany({});
    console.log('✓ Deleted countries');
    
    console.log('✅ Test data reset complete');
  } catch (error) {
    console.error('❌ Error resetting test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetTestData()
  .catch(console.error)
  .finally(() => process.exit());
