#!/bin/bash

# Copy the required static files to the build folder.

cp node_modules/antd/dist/antd.min.css build/static/css/
cp -r public/image build/static/image
cp node_modules/braft-editor/dist/braft.css build/static/css/

