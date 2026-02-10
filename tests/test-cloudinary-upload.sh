#!/bin/bash

##############################################################################
# Cloudinary File Upload Tests
# 
# This script tests file upload endpoints using cURL
# Run this for automated testing of file uploads (works in CI/CD)
##############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3001/api}"
TEST_IMAGE_DIR="$(dirname "$0")/fixtures"
TEST_IMAGE1="$TEST_IMAGE_DIR/test-product-image.jpg"
TEST_IMAGE2="$TEST_IMAGE_DIR/test-product-image2.jpg"

# Counters
PASS_COUNT=0
FAIL_COUNT=0

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_test() {
    echo ""
    echo -e "${YELLOW}▶ TEST: $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    ((PASS_COUNT++))
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    echo -e "${RED}   Response: $2${NC}"
    ((FAIL_COUNT++))
}

check_status_code() {
    local actual=$1
    local expected=$2
    local test_name=$3
    
    if [ "$actual" -eq "$expected" ]; then
        print_pass "Status code is $expected"
    else
        print_fail "Expected status $expected, got $actual" "$test_name"
        return 1
    fi
}

check_json_field() {
    local json=$1
    local field=$2
    local test_name=$3
    
    if echo "$json" | jq -e "$field" > /dev/null 2>&1; then
        print_pass "Field '$field' exists"
    else
        print_fail "Field '$field' missing" "$json"
        return 1
    fi
}

##############################################################################
# Pre-flight Checks
##############################################################################

print_header "🔍 PRE-FLIGHT CHECKS"

echo "• Base URL: $BASE_URL"
echo "• Test images directory: $TEST_IMAGE_DIR"

# Check if server is running
echo "• Checking if server is running..."
if curl -s "$BASE_URL/../health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi

# Check if test images exist
echo "• Checking test images..."
if [ ! -f "$TEST_IMAGE1" ]; then
    echo -e "${RED}❌ Test image not found: $TEST_IMAGE1${NC}"
    exit 1
fi
if [ ! -f "$TEST_IMAGE2" ]; then
    echo -e "${RED}❌ Test image not found: $TEST_IMAGE2${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Test images found${NC}"

# Check if Cloudinary is configured
echo "• Checking Cloudinary configuration..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/../health")
if echo "$HEALTH_RESPONSE" | jq -e '.cloudinary == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Cloudinary is configured${NC}"
else
    echo -e "${YELLOW}⚠️  Cloudinary may not be configured${NC}"
    echo "   Tests will fail if Cloudinary credentials are missing"
    echo "   Check your .env file"
fi

##############################################################################
# Test 1: Create Product with Multiple File Uploads
##############################################################################

print_header "📸 TEST 1: Create Product with Multiple File Uploads"

print_test "Upload product with 2 images"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/products/upload" \
    -F "name=Automated Test Product" \
    -F "description=Product created via cURL automation" \
    -F "isActive=true" \
    -F "images=@$TEST_IMAGE1" \
    -F "images=@$TEST_IMAGE2")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"

# Check status code
check_status_code "$HTTP_CODE" 201 "Create product with files"

# Check response structure
if [ $? -eq 0 ]; then
    check_json_field "$BODY" ".id" "Product creation"
    check_json_field "$BODY" ".name" "Product creation"
    check_json_field "$BODY" ".images" "Product creation"
    check_json_field "$BODY" ".images[0].url" "Product creation"
    
    # Check if Cloudinary URL
    if echo "$BODY" | jq -e '.images[0].url | contains("res.cloudinary.com")' > /dev/null 2>&1; then
        print_pass "Image uploaded to Cloudinary"
    else
        print_fail "Image URL is not from Cloudinary" "$BODY"
    fi
    
    # Check if has publicId
    check_json_field "$BODY" ".images[0].publicId" "Product creation"
    
    # Check if first image is primary
    if echo "$BODY" | jq -e '.images[0].isPrimary == true' > /dev/null 2>&1; then
        print_pass "First image is set as primary"
    else
        print_fail "First image should be primary" "$BODY"
    fi
    
    # Save product ID for next test
    PRODUCT_ID=$(echo "$BODY" | jq -r '.id')
    echo "• Created product ID: $PRODUCT_ID"
fi

##############################################################################
# Test 2: Upload Single Image to Existing Product
##############################################################################

if [ -n "$PRODUCT_ID" ]; then
    print_header "📸 TEST 2: Upload Single Image to Existing Product"
    
    print_test "Upload single image to product $PRODUCT_ID"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$BASE_URL/products/$PRODUCT_ID/images/upload" \
        -F "image=@$TEST_IMAGE1")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "Response: $BODY"
    
    # Check status code
    check_status_code "$HTTP_CODE" 201 "Upload single image"
    
    # Check response structure
    if [ $? -eq 0 ]; then
        check_json_field "$BODY" ".id" "Image upload"
        check_json_field "$BODY" ".url" "Image upload"
        check_json_field "$BODY" ".publicId" "Image upload"
        check_json_field "$BODY" ".productId" "Image upload"
        
        # Check if Cloudinary URL
        if echo "$BODY" | jq -e '.url | contains("res.cloudinary.com")' > /dev/null 2>&1; then
            print_pass "Image uploaded to Cloudinary"
        else
            print_fail "Image URL is not from Cloudinary" "$BODY"
        fi
        
        # Check if NOT primary (new images should not be primary by default)
        if echo "$BODY" | jq -e '.isPrimary == false' > /dev/null 2>&1; then
            print_pass "New image is not set as primary (correct behavior)"
        else
            print_fail "New image should not be primary by default" "$BODY"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Skipping Test 2 (no product ID from Test 1)${NC}"
fi

##############################################################################
# Test 3: Error Handling - No File Provided
##############################################################################

print_header "🧪 TEST 3: Error Handling - No File Provided"

print_test "Create product without images"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/products/upload" \
    -F "name=Test Product" \
    -F "description=No images" \
    -F "isActive=true")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"

# Should return 400 (bad request)
check_status_code "$HTTP_CODE" 400 "No files provided"

##############################################################################
# Test 4: Error Handling - Invalid Product ID
##############################################################################

print_header "🧪 TEST 4: Error Handling - Invalid Product ID"

print_test "Upload image to non-existent product"

FAKE_ID="00000000-0000-0000-0000-000000000000"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/products/$FAKE_ID/images/upload" \
    -F "image=@$TEST_IMAGE1")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"

# Should return 404 (not found)
check_status_code "$HTTP_CODE" 404 "Invalid product ID"

##############################################################################
# Summary
##############################################################################

print_header "📊 TEST SUMMARY"

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))

echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ALL CLOUDINARY FILE UPLOAD TESTS PASSED!                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ SOME TESTS FAILED                                        ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
