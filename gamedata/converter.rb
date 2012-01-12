require 'yaml'
require 'json'

data =  YAML.parse(File.read("data.yml")).transform
data['People List']      = data['People'].keys
data['Location List']    = data['Locations'].keys
data['Achievement List'] = data['Achievements'].keys
output = File.open("data.json", "w")
output.syswrite data.to_json
