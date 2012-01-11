(function() {
  var chooseRandomFromList, continueDialogue, encounterPerson, followDialogue, getPossibleLinks, initializeGameData, setControls, setupPerson, startingSequence, testFunctions, travelToLocation, triggerChatBox;
  $(document).ready(function() {
    testFunctions();
    initializeGameData();
    return setControls();
  });
  testFunctions = function() {
    window.encounterPerson = encounterPerson;
    window.getPossibleLinks = getPossibleLinks;
    return window.travelToLocation = travelToLocation;
  };
  initializeGameData = function() {
    $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      return startingSequence();
    });
    return window.game_state = {
      "location": "Home"
    };
  };
  setControls = function() {
    return $(document).keypress(function(e) {
      switch (e.which) {
        case 32:
          return continueDialogue;
      }
    });
  };
  followDialogue = function(dialogue) {
    dialogue = dialogue.join("\n");
    return console.log("\n---\n" + dialogue + "\n---\n");
  };
  continueDialogue = function() {};
  encounterPerson = function(location) {
    var dialogue, person, possible_dialogue, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    person = chooseRandomFromList(possible_people);
    setupPerson(person);
    possible_dialogue = window.game_data['People'][person]['Dialogue'];
    dialogue = chooseRandomFromList(possible_dialogue);
    return followDialogue = dialogue;
  };
  getPossibleLinks = function() {
    var possible_links;
    possible_links = window.game_data['Locations'][window.game_state['location']]['Links'];
    console.log(possible_links);
    return possible_links;
  };
  travelToLocation = function(location) {
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    if (Math.random() > 0.4) {
      return encounterPerson(location);
    }
  };
  setupPerson = function(person) {
    return console.log("Encountered " + person);
  };
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
  startingSequence = function() {
    return followDialogue(window.game_data['Starting Sequence']);
  };
}).call(this);
