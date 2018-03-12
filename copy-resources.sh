#!/bin/bash

# Copy the required static files to the build folder.

cp node_modules/antd/dist/antd.css build/static/css/
cp -r public/image build/static/image
