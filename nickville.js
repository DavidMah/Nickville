(function() {
  var chooseRandomFromList, continueDialogue, encounterPerson, followDialogue, initializeGameData, setControls, setupPerson, startingSequence, triggerChatBox;
  $(document).ready(function() {
    initializeGameData();
    setControls();
    return startingSequence();
  });
  initializeGameData = function() {
    return $.get("gamedata/data.json", function(data) {
      return window.game_data = JSON.parse(data);
    });
  };
  setControls = function() {
    return $(document).keypress(function(e) {
      switch (e.which) {
        case 32:
          return continueDialogue;
      }
    });
  };
  followDialogue = function(dialogue) {};
  continueDialogue = function() {};
  encounterPerson = function(location) {
    var dialogue, person, possible_dialogue, possible_people;
    possible_people = window.game_data[location]['People'];
    person = chooseRandomFromList(possible_people);
    setupPerson(person);
    possible_dialogue = window.game_data['People'][person];
    dialogue = chooseRandomFromList(possible_dialogue);
    return followDialogue = dialogue;
  };
  setupPerson = function(person) {};
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  triggerChatBox = function() {
    var visibility, _ref;
    visibility = $("#chatbox").visibility;
    return $("#chatbox").visibility = (_ref = visibility === "hidden") != null ? _ref : {
      "visible": "hidden"
    };
  };
  startingSequence = function() {};
}).call(this);
