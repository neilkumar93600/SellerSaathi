#!/bin/bash
# Pre-commit hook for SellerSaathi
echo "Running type checking..."
npm run type-check || exit 1
echo "Running linting..."
npm run lint || exit 1
echo "Pre-commit checks passed."