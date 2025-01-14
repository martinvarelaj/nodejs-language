import synthtool as s
import synthtool.gcp as gcp
import logging
import subprocess

logging.basicConfig(level=logging.DEBUG)

gapic = gcp.GAPICGenerator()
# tasks has two product names, and a poorly named artman yaml
for version in ['v1', 'v1beta2']:
    library = gapic.node_library(
        'language', version)

    # skip index, protos, package.json, and README.md
    s.copy(
        library,
        excludes=['package.json', 'README.md', 'src/index.js'])

# Update common templates
common_templates = gcp.CommonTemplates()
templates = common_templates.node_library()
s.copy(templates)

# Node.js specific cleanup
subprocess.run(['npm', 'install'])
subprocess.run(['npm', 'run', 'fix'])
subprocess.run(['npx', 'compileProtos', 'src'])
