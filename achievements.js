window.collect_achievement = function (message) {
  //form of message
  // {"location" : <string of location>,
  //  "person"   : <string of person>,
  //  "dialogue" : <index of dialogue>}
  //
  //  For temporary data, modify
  //  modify window.game_state['achievements'], which is in the form
  //  [['name of achievement', 'description of achievement', true, {}],
  //   ['name of another achievement', 'description of achievement', false, {}]]
  //   where true or false is if the achievement has been acquired
  //   and the 3th item ({}) is an object that you can modify to store temporary
  //   data about the achievements(like counts or something)
}
