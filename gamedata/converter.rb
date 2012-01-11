require 'yaml'
require 'json'

data =  YAML.parse(File.read("data.yml")).transform
data['People List']   = data['People'].keys
data['Location List'] = data['Locations'].keys
File.write("data.json", data.to_json)
