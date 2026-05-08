#!/bin/bash
# Lint on save hook
npx eslint "$1" --fix
npx prettier --write "$1"