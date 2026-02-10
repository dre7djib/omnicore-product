#!/bin/bash

set -e

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

passed=0
failed=0

print_test() {
  echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}TEST: $1${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
  ((passed++))
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
  ((failed++))
}

test_endpoint() {
  local method=$1
  local url=$2
  local data=$3
  local expected_status=$4
  local test_name=$5
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "$expected_status" ]; then
    print_success "$test_name (HTTP $http_code)"
    echo "$body" | jq . 2>/dev/null || echo "$body"
  else
    print_error "$test_name (Expected $expected_status, got $http_code)"
    echo "$body"
  fi
  
  echo "$body"
}

test_upload_endpoint() {
  local method=$1
  local url=$2
  local file_path=$3
  local field_name=$4
  local additional_fields=$5
  local expected_status=$6
  local test_name=$7
  
  if [ ! -f "$file_path" ]; then
    echo "Creating test image..."
    cat > "$file_path" << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
EOF
  fi
  
  cmd="curl -s -w \"\n%{http_code}\" -X \"$method\" \"$url\" -F \"$field_name=@$file_path\""
  
  if [ ! -z "$additional_fields" ]; then
    IFS=';' read -ra FIELDS <<< "$additional_fields"
    for field in "${FIELDS[@]}"; do
      cmd="$cmd -F \"$field\""
    done
  fi
  
  response=$(eval $cmd)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" == "$expected_status" ]; then
    print_success "$test_name (HTTP $http_code)"
    echo "$body" | jq . 2>/dev/null || echo "$body"
  else
    print_error "$test_name (Expected $expected_status, got $http_code)"
    echo "$body"
  fi
  
  echo "$body"
}

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          OMNICORE PRODUCT SERVICE - ENDPOINT TESTS             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"

print_test "1. Health Check"
health=$(test_endpoint "GET" "$BASE_URL/health" "" "200" "Health endpoint")

print_test "2. Create Belgium Country"
belgium=$(test_endpoint "POST" "$API_URL/countries" '{
  "name": "Belgium",
  "countryCode": "BE",
  "currency": "EUR",
  "isActive": true
}' "201" "Create Belgium")
belgium_id=$(echo "$belgium" | jq -r '.id' 2>/dev/null || echo "")

print_test "3. Create France Country"
france=$(test_endpoint "POST" "$API_URL/countries" '{
  "name": "France",
  "countryCode": "FR",
  "currency": "EUR",
  "isActive": true
}' "201" "Create France")
france_id=$(echo "$france" | jq -r '.id' 2>/dev/null || echo "")

print_test "4. Get All Countries"
test_endpoint "GET" "$API_URL/countries" "" "200" "Get all countries"

print_test "5. Get Belgium by ID"
if [ ! -z "$belgium_id" ]; then
  test_endpoint "GET" "$API_URL/countries/$belgium_id" "" "200" "Get Belgium details"
else
  print_error "Belgium ID not available"
fi

print_test "6. Update Belgium"
if [ ! -z "$belgium_id" ]; then
  test_endpoint "PUT" "$API_URL/countries/$belgium_id" '{
    "name": "Belgium (Updated)",
    "isActive": true
  }' "200" "Update Belgium"
else
  print_error "Belgium ID not available"
fi

print_test "7. Create Product with Images"
product=$(test_endpoint "POST" "$API_URL/products" '{
  "name": "Laptop Pro 15",
  "description": "High-performance laptop for professionals",
  "isActive": true,
  "images": [
    {
      "url": "https://example.com/laptop-front.jpg",
      "isPrimary": true
    },
    {
      "url": "https://example.com/laptop-side.jpg",
      "isPrimary": false
    }
  ]
}' "201" "Create product with images")
product_id=$(echo "$product" | jq -r '.id' 2>/dev/null || echo "")

print_test "8. Get All Products"
test_endpoint "GET" "$API_URL/products" "" "200" "Get all products"

print_test "9. Get Product by ID"
if [ ! -z "$product_id" ]; then
  test_endpoint "GET" "$API_URL/products/$product_id" "" "200" "Get product details"
else
  print_error "Product ID not available"
fi

print_test "10. Add Product Image"
if [ ! -z "$product_id" ]; then
  image=$(test_endpoint "POST" "$API_URL/products/$product_id/images" '{
    "url": "https://example.com/laptop-back.jpg",
    "isPrimary": false
  }' "201" "Add product image")
  image_id=$(echo "$image" | jq -r '.id' 2>/dev/null || echo "")
else
  print_error "Product ID not available"
fi

print_test "11. Set Primary Image"
if [ ! -z "$product_id" ] && [ ! -z "$image_id" ]; then
  test_endpoint "PUT" "$API_URL/products/$product_id/images/$image_id/primary" "" "200" "Set primary image"
else
  print_error "Product or Image ID not available"
fi

print_test "12. Update Product"
if [ ! -z "$product_id" ]; then
  test_endpoint "PUT" "$API_URL/products/$product_id" '{
    "name": "Laptop Pro 15 (Updated)",
    "description": "Updated high-performance laptop",
    "isActive": true
  }' "200" "Update product"
else
  print_error "Product ID not available"
fi

print_test "13. Create Belgium Stock for Product"
if [ ! -z "$product_id" ] && [ ! -z "$belgium_id" ]; then
  belgium_stock=$(test_endpoint "POST" "$API_URL/country-products" '{
    "productId": "'"$product_id"'",
    "countryId": "'"$belgium_id"'",
    "price": 1299.99,
    "currency": "EUR",
    "quantity": 50,
    "isAvailable": true
  }' "201" "Create Belgium stock")
  belgium_stock_id=$(echo "$belgium_stock" | jq -r '.id' 2>/dev/null || echo "")
else
  print_error "Product or Belgium ID not available"
fi

print_test "14. Create France Stock for Product"
if [ ! -z "$product_id" ] && [ ! -z "$france_id" ]; then
  france_stock=$(test_endpoint "POST" "$API_URL/country-products" '{
    "productId": "'"$product_id"'",
    "countryId": "'"$france_id"'",
    "price": 1399.99,
    "currency": "EUR",
    "quantity": 30,
    "isAvailable": true
  }' "201" "Create France stock")
  france_stock_id=$(echo "$france_stock" | jq -r '.id' 2>/dev/null || echo "")
else
  print_error "Product or France ID not available"
fi

print_test "15. Get Belgium Products (Belgium View)"
if [ ! -z "$belgium_id" ]; then
  test_endpoint "GET" "$API_URL/country-products/country/$belgium_id" "" "200" "Get Belgium products"
else
  print_error "Belgium ID not available"
fi

print_test "16. Get France Products (France View)"
if [ ! -z "$france_id" ]; then
  test_endpoint "GET" "$API_URL/country-products/country/$france_id" "" "200" "Get France products"
else
  print_error "France ID not available"
fi

print_test "17. Get All Country Products"
test_endpoint "GET" "$API_URL/country-products" "" "200" "Get all country products"

print_test "18. Get Country Product by ID"
if [ ! -z "$belgium_stock_id" ]; then
  test_endpoint "GET" "$API_URL/country-products/$belgium_stock_id" "" "200" "Get country product details"
else
  print_error "Belgium stock ID not available"
fi

print_test "19. Update Belgium Stock Quantity"
if [ ! -z "$belgium_stock_id" ]; then
  test_endpoint "PATCH" "$API_URL/country-products/$belgium_stock_id/stock" '{
    "quantity": 75
  }' "200" "Update Belgium stock quantity"
else
  print_error "Belgium stock ID not available"
fi

print_test "20. Update France Stock to Out of Stock"
if [ ! -z "$france_stock_id" ]; then
  test_endpoint "PATCH" "$API_URL/country-products/$france_stock_id/stock" '{
    "quantity": 0
  }' "200" "Update France stock to 0"
else
  print_error "France stock ID not available"
fi

print_test "21. Update Belgium Price"
if [ ! -z "$belgium_stock_id" ]; then
  test_endpoint "PUT" "$API_URL/country-products/$belgium_stock_id" '{
    "price": 1199.99,
    "isAvailable": true
  }' "200" "Update Belgium price"
else
  print_error "Belgium stock ID not available"
fi

print_test "22. Filter by Country ID (Belgium)"
if [ ! -z "$belgium_id" ]; then
  test_endpoint "GET" "$API_URL/country-products?countryId=$belgium_id" "" "200" "Filter by Belgium"
else
  print_error "Belgium ID not available"
fi

print_test "23. Filter by Product ID"
if [ ! -z "$product_id" ]; then
  test_endpoint "GET" "$API_URL/country-products?productId=$product_id" "" "200" "Filter by product"
else
  print_error "Product ID not available"
fi

print_test "24. Filter by Availability"
test_endpoint "GET" "$API_URL/country-products?isAvailable=true" "" "200" "Filter available products"

print_test "25. Create Product with Cloudinary Upload"
TEST_IMAGE="/tmp/test-product-image.png"
echo "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FAP0QAwhe2F2PAAAAAElFTkSuQmCC" | base64 -d > "$TEST_IMAGE"
test_upload_endpoint "POST" "$API_URL/products/upload" "$TEST_IMAGE" "images" "name=Smartphone Pro;description=Latest smartphone model;isActive=true" "201" "Create product with Cloudinary upload"

print_test "26. Upload Image to Existing Product (Cloudinary)"
if [ ! -z "$product_id" ]; then
  test_upload_endpoint "POST" "$API_URL/products/$product_id/images/upload" "$TEST_IMAGE" "image" "isPrimary=false" "201" "Upload image to existing product"
else
  print_error "Product ID not available"
fi

print_test "27. Validation - Create Country with Invalid Data"
test_endpoint "POST" "$API_URL/countries" '{
  "name": "",
  "countryCode": ""
}' "400" "Validation: Invalid country data"

print_test "28. Validation - Create Product with Missing Name"
test_endpoint "POST" "$API_URL/products" '{
  "description": "A product without name"
}' "400" "Validation: Missing product name"

print_test "29. Validation - Create Country Product with Invalid Price"
test_endpoint "POST" "$API_URL/country-products" '{
  "productId": "invalid-id",
  "countryId": "invalid-id",
  "price": -100
}' "400" "Validation: Invalid country product data"

print_test "30. Get Non-Existent Country"
test_endpoint "GET" "$API_URL/countries/00000000-0000-0000-0000-000000000000" "" "500" "Get non-existent country"

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                        TEST SUMMARY                            ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  ✓ Passed: ${passed}${NC}"
echo -e "${RED}║  ✗ Failed: ${failed}${NC}"
echo -e "${GREEN}║  Total:  $((passed + failed))${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"

if [ -f "$TEST_IMAGE" ]; then
  rm "$TEST_IMAGE"
fi

if [ $failed -gt 0 ]; then
  exit 1
fi

exit 0
