#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all endpoints with actual file uploads

set -e

BASE_URL="http://localhost:3001"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Create temporary test image
TEST_IMAGE="/tmp/test-product-image.jpg"
echo "Creating test image..."
# Use Python to create a simple valid JPEG
python3 -c "
from PIL import Image
img = Image.new('RGB', (100, 100), color='red')
img.save('$TEST_IMAGE')
" 2>/dev/null || {
  # Fallback: create a minimal valid JPEG if PIL not available
  base64 -d > "$TEST_IMAGE" << 'EOF'
/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a
HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy
MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA
AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA
AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3
ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm
p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA
AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx
BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK
U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3
uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iii
gD//2Q==
EOF
}
echo "Test image created at $TEST_IMAGE"

echo -e "${YELLOW}Starting Endpoint Tests...${NC}\n"

# Test function
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_code="$5"
  local save_var="$6"
  
  echo -n "Testing: $name... "
  
  if [ "$method" = "POST" ] || [ "$method" = "PUT" ] || [ "$method" = "PATCH" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$url")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    ((PASSED++))
    
    # Save variable if requested
    if [ -n "$save_var" ]; then
      value=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
      eval "$save_var='$value'"
      echo "  → Saved $save_var=$value"
    fi
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $status_code)"
    echo "  Response: $body"
    ((FAILED++))
  fi
  
  echo "$body"
}

# Test file upload
test_upload() {
  local name="$1"
  local url="$2"
  local field_name="$3"
  local expected_code="$4"
  local save_var="$5"
  
  echo -n "Testing: $name... "
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$url" \
    -F "$field_name=@$TEST_IMAGE")
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    ((PASSED++))
    
    if [ -n "$save_var" ]; then
      value=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
      eval "$save_var='$value'"
      echo "  → Saved $save_var=$value"
    fi
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $status_code)"
    echo "  Response: $body"
    ((FAILED++))
  fi
  
  echo "$body"
}

echo -e "\n${YELLOW}=== 1. Health Check ===${NC}\n"
test_endpoint "Health Check" "GET" "/health" "" "200"

echo -e "\n${YELLOW}=== 2. Countries ===${NC}\n"

# Get existing countries first
echo "Fetching existing countries..."
countries_response=$(curl -s "$BASE_URL/api/countries")
BELGIUM_ID=$(echo "$countries_response" | grep -o '"id":"[^"]*","name":"Belgium"' | cut -d'"' -f4 | head -1)
FRANCE_ID=$(echo "$countries_response" | grep -o '"id":"[^"]*","name":"France"' | cut -d'"' -f4 | head -1)

# Create countries if they don't exist
if [ -z "$BELGIUM_ID" ]; then
  test_endpoint "Create Belgium" "POST" "/api/countries" \
    '{"name":"Belgium","countryCode":"BE","currency":"EUR","isActive":true}' \
    "201" "BELGIUM_ID"
else
  echo -e "Belgium already exists (ID: $BELGIUM_ID) - ${GREEN}✓ SKIPPED${NC}"
fi

if [ -z "$FRANCE_ID" ]; then
  test_endpoint "Create France" "POST" "/api/countries" \
    '{"name":"France","countryCode":"FR","currency":"EUR","isActive":true}' \
    "201" "FRANCE_ID"
else
  echo -e "France already exists (ID: $FRANCE_ID) - ${GREEN}✓ SKIPPED${NC}"
fi

test_endpoint "Get All Countries" "GET" "/api/countries" "" "200"

if [ -n "$BELGIUM_ID" ]; then
  test_endpoint "Get Belgium by ID" "GET" "/api/countries/$BELGIUM_ID" "" "200"
  test_endpoint "Update Belgium" "PUT" "/api/countries/$BELGIUM_ID" \
    '{"currency":"EUR","isActive":true}' \
    "200"
fi

echo -e "\n${YELLOW}=== 3. Products (JSON) ===${NC}\n"
test_endpoint "Create Product with Images" "POST" "/api/products" \
  '{"name":"Gaming Laptop","description":"High-performance gaming laptop","isActive":true,"images":[{"url":"https://example.com/laptop1.jpg","isPrimary":true},{"url":"https://example.com/laptop2.jpg","isPrimary":false}]}' \
  "201" "PRODUCT_ID"

test_endpoint "Get All Products" "GET" "/api/products" "" "200"

if [ -n "$PRODUCT_ID" ]; then
  test_endpoint "Get Product by ID" "GET" "/api/products/$PRODUCT_ID" "" "200"
  
  test_endpoint "Add Product Image" "POST" "/api/products/$PRODUCT_ID/images" \
    '{"url":"https://example.com/laptop3.jpg","isPrimary":false}' \
    "201" "IMAGE_ID"
  
  if [ -n "$IMAGE_ID" ]; then
    test_endpoint "Set Primary Image" "PUT" "/api/products/$PRODUCT_ID/images/$IMAGE_ID/primary" \
      "" "200"
  fi
  
  test_endpoint "Update Product" "PUT" "/api/products/$PRODUCT_ID" \
    '{"name":"Gaming Laptop Pro","description":"Updated description","isActive":true}' \
    "200"
fi

echo -e "\n${YELLOW}=== 4. Products with Cloudinary Upload ===${NC}\n"
if [ -n "$PRODUCT_ID" ]; then
  # Upload to existing product
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products/$PRODUCT_ID/images/upload" \
    -F "image=@$TEST_IMAGE")
  status_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  echo -n "Testing: Upload Image to Product (Cloudinary)... "
  if [ "$status_code" = "201" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
    ((PASSED++))
    CLOUDINARY_IMAGE_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  else
    echo -e "${RED}✗ FAILED${NC} (Expected 201, got $status_code)"
    echo "  Response: $body"
    ((FAILED++))
  fi
  echo "$body"
fi

# Create product with file upload
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products/upload" \
  -F "name=Uploaded Product" \
  -F "description=Product created with file upload" \
  -F "images=@$TEST_IMAGE")
status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | sed '$d')
echo -n "Testing: Create Product with File Upload... "
if [ "$status_code" = "201" ]; then
  echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
  ((PASSED++))
  PRODUCT_WITH_UPLOAD_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo -e "${RED}✗ FAILED${NC} (Expected 201, got $status_code)"
  echo "  Response: $body"
  ((FAILED++))
fi
echo "$body"

echo -e "\n${YELLOW}=== 5. Country Products (Multi-Country Stock) ===${NC}\n"

if [ -n "$PRODUCT_ID" ] && [ -n "$BELGIUM_ID" ]; then
  test_endpoint "Create Belgium Stock" "POST" "/api/country-products" \
    "{\"productId\":\"$PRODUCT_ID\",\"countryId\":\"$BELGIUM_ID\",\"price\":29.99,\"currency\":\"EUR\",\"quantity\":100,\"isAvailable\":true}" \
    "201" "BELGIUM_STOCK_ID"
fi

if [ -n "$PRODUCT_ID" ] && [ -n "$FRANCE_ID" ]; then
  test_endpoint "Create France Stock" "POST" "/api/country-products" \
    "{\"productId\":\"$PRODUCT_ID\",\"countryId\":\"$FRANCE_ID\",\"price\":34.99,\"currency\":\"EUR\",\"quantity\":50,\"isAvailable\":true}" \
    "201" "FRANCE_STOCK_ID"
fi

test_endpoint "Get All Country Products" "GET" "/api/country-products" "" "200"

if [ -n "$BELGIUM_ID" ]; then
  test_endpoint "Get Belgium Products (Belgium View)" "GET" "/api/country-products/country/$BELGIUM_ID" "" "200"
fi

if [ -n "$FRANCE_ID" ]; then
  test_endpoint "Get France Products (France View)" "GET" "/api/country-products/country/$FRANCE_ID" "" "200"
fi

if [ -n "$BELGIUM_STOCK_ID" ]; then
  test_endpoint "Get Country Product by ID" "GET" "/api/country-products/$BELGIUM_STOCK_ID" "" "200"
  
  test_endpoint "Update Belgium Stock Quantity" "PATCH" "/api/country-products/$BELGIUM_STOCK_ID/stock" \
    '{"quantity":75}' \
    "200"
  
  test_endpoint "Update Belgium Price" "PUT" "/api/country-products/$BELGIUM_STOCK_ID" \
    '{"price":32.99,"currency":"EUR","quantity":75,"isAvailable":true}' \
    "200"
fi

if [ -n "$FRANCE_STOCK_ID" ]; then
  test_endpoint "Update France Stock to Out of Stock" "PATCH" "/api/country-products/$FRANCE_STOCK_ID/stock" \
    '{"quantity":0}' \
    "200"
fi

echo -e "\n${YELLOW}=== 6. Filter Tests ===${NC}\n"
if [ -n "$BELGIUM_ID" ]; then
  test_endpoint "Filter by Country ID" "GET" "/api/country-products?countryId=$BELGIUM_ID" "" "200"
fi

if [ -n "$PRODUCT_ID" ]; then
  test_endpoint "Filter by Product ID" "GET" "/api/country-products?productId=$PRODUCT_ID" "" "200"
fi

test_endpoint "Filter by Availability" "GET" "/api/country-products?isAvailable=true" "" "200"

echo -e "\n${YELLOW}=== 7. Validation Tests ===${NC}\n"
test_endpoint "Create Country - Invalid Data" "POST" "/api/countries" \
  '{"name":"","countryCode":"","currency":""}' \
  "400"

test_endpoint "Create Product - Missing Name" "POST" "/api/products" \
  '{"description":"Test"}' \
  "400"

test_endpoint "Create Country Product - Invalid Price" "POST" "/api/country-products" \
  '{"productId":"invalid","countryId":"invalid","price":-10}' \
  "400"

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
rm -f "$TEST_IMAGE"

# Summary
echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed! ✗${NC}"
  exit 1
fi
