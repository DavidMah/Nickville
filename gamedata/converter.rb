require 'yaml'
require 'json'

File.write("data.json", YAML.parse(File.read("data.yml")).transform.to_json)
