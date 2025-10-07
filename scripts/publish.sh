#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./packages/core/package.json').version")

print_info "Current version: ${CURRENT_VERSION}"
echo ""

# Check if git working directory is clean
if [[ -n $(git status -s) ]]; then
    print_error "Git working directory is not clean. Please commit or stash your changes."
    git status -s
    exit 1
fi

print_success "Git working directory is clean"

# Ask for version bump type
echo ""
print_info "Select version bump type:"
echo "  1) patch (${CURRENT_VERSION} -> $(npm version --no-git-tag-version patch --prefix packages/core 2>/dev/null && npm version --no-git-tag-version ${CURRENT_VERSION} --prefix packages/core 2>/dev/null && npm version patch --dry-run --prefix packages/core 2>/dev/null | grep -oP '(?<=to ).*'))"
echo "  2) minor (${CURRENT_VERSION} -> $(npm version minor --dry-run --prefix packages/core 2>/dev/null | grep -oP '(?<=to ).*'))"
echo "  3) major (${CURRENT_VERSION} -> $(npm version major --dry-run --prefix packages/core 2>/dev/null | grep -oP '(?<=to ).*'))"
echo "  4) custom"
echo "  5) no version bump (publish current version)"
echo ""
read -p "Enter choice [1-5]: " VERSION_CHOICE

NEW_VERSION=""

case $VERSION_CHOICE in
    1)
        NEW_VERSION=$(cd packages/core && npm version patch --no-git-tag-version)
        ;;
    2)
        NEW_VERSION=$(cd packages/core && npm version minor --no-git-tag-version)
        ;;
    3)
        NEW_VERSION=$(cd packages/core && npm version major --no-git-tag-version)
        ;;
    4)
        read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
        NEW_VERSION=$(cd packages/core && npm version ${CUSTOM_VERSION} --no-git-tag-version)
        ;;
    5)
        NEW_VERSION="v${CURRENT_VERSION}"
        print_warning "Skipping version bump"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

if [[ $VERSION_CHOICE != "5" ]]; then
    # Extract version number without 'v' prefix
    VERSION_NUMBER=${NEW_VERSION#v}
    print_success "Version bumped to ${VERSION_NUMBER}"

    # Update root package.json version to match
    cd packages/core
    CORE_VERSION=$(node -p "require('./package.json').version")
    cd ../..
    npm pkg set version="${CORE_VERSION}"
    print_success "Root package.json version synced"
else
    VERSION_NUMBER=${CURRENT_VERSION}
fi

echo ""

# Run tests
print_info "Running tests..."
npm run test --workspace=packages/core
print_success "Tests passed"

echo ""

# Build the package
print_info "Building package..."
npm run build
print_success "Build completed"

echo ""

# Dry run publish
print_info "Running dry-run publish..."
npm run publish:dry --workspace=packages/core
print_success "Dry-run publish successful"

echo ""

# Confirm publication
print_warning "You are about to publish version ${VERSION_NUMBER} to npm."
read -p "Do you want to continue? (yes/no): " CONFIRM

if [[ $CONFIRM != "yes" ]]; then
    print_error "Publication cancelled"

    # Revert version changes if bumped
    if [[ $VERSION_CHOICE != "5" ]]; then
        print_info "Reverting version changes..."
        cd packages/core
        npm version ${CURRENT_VERSION} --no-git-tag-version
        cd ../..
        npm pkg set version="${CURRENT_VERSION}"
        print_success "Version reverted to ${CURRENT_VERSION}"
    fi

    exit 0
fi

echo ""

# Publish to npm
print_info "Publishing to npm..."
npm run publish:prod --workspace=packages/core
print_success "Published to npm successfully!"

echo ""

# Commit version bump and create git tag
if [[ $VERSION_CHOICE != "5" ]]; then
    print_info "Creating git commit and tag..."
    git add packages/core/package.json package.json
    git commit -m "chore: release v${VERSION_NUMBER}"
    git tag -a "v${VERSION_NUMBER}" -m "Release v${VERSION_NUMBER}"
    print_success "Git commit and tag created"

    echo ""
    print_info "To push changes and tags to remote, run:"
    echo "  git push && git push --tags"
fi

echo ""
print_success "🎉 Deployment completed successfully!"
print_info "Package: @cleancode-id/nestjs-sequelize-query-builder@${VERSION_NUMBER}"
print_info "View on npm: https://www.npmjs.com/package/@cleancode-id/nestjs-sequelize-query-builder"
