var temps = {};
var autoAngle = 0;
var hue = 0;
var ids = [];
var isAuto = false;
var autoSpeed = 300; // less is more
var audioUrl = require("url:./asset/cotton.mp3");
var audio = new Audio(audioUrl);
audio.volume = 0.2;

$(function () {
  // scale to width
  $("html").css("transform", "scale(" + $(window).width() / 1366 + ")");

  // sets a function that will be called when the websocket connects/disconnects
  NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);

  // sets a function that will be called when the robot connects/disconnects
  NetworkTables.addRobotConnectionListener(onRobotConnection, true);

  // sets a function that will be called when any NetworkTables key/value changes
  NetworkTables.addGlobalListener(onValueChanged, true);

  // hue cycle aaron
  setInterval(() => {
    hue = (hue + 15) % 720;
    $("#camera-error").css("filter", "hue-rotate(" + hue + "deg)");
  }, 25);

  setInterval(() => {
    if (isAuto) {
      $("body").css("background-color", "#00ff00");
      // $("#auto-mode").show();
      setTimeout(() => {
        $("body").css("background-color", "");
        // $("#auto-mode").hide();
      }, autoSpeed / 2);
      audio.playbackRate = Math.random() * 2 + 0.3;
    }
  }, autoSpeed);
  audio.volume = 0.3;
});

function onRobotConnection(connected) {
  $("#robotstate").text(connected ? "Connected" : "Disconnected");
  $("#robotAddress").text(
    connected ? NetworkTables.getRobotAddress() : "Disconnected",
  );
}

function onNetworkTablesConnection(connected) {
  if (connected) {
    $("#connectstate").text("Connected");

    // clear the table
    $("#nt tbody > tr").remove();
  } else {
    $("#connectstate").text("Disconnected");
  }
}

$(document).on("click", "#autonomous-selector > div", function () {
  // YOU NEED to put the value in Autonomous/selected NOT Autonomous/active or it won't stay
  NetworkTables.putValue("/SmartDashboard/Auto/Mode/selected", $(this).html());
});

function setAutoAngle(angle) {
  autoAngle = parseFloat(angle);
  NetworkTables.putValue("/SmartDashboard/Auto/Angle", autoAngle);
}

function modAutoAngle(mod) {
  NetworkTables.putValue("/SmartDashboard/Auto/Angle", autoAngle + mod);
}

function ntToggle(event) {
  $(event.parentElement).toggleClass("disabled");
}

$("#fieldrelative").on("click", function () {
  NetworkTables.putValue(
    "/SmartDashboard/FieldCentric/selected",
    !$(this).is(".active") ? "Field Centric" : "Robot Centric",
  );
});

function putNT(key, value) {
  function put(items, path, data) {
    var [x, ...xs] = items;
    if (xs.length) {
      // if the item has children then it must be a folder
      // CREATE folder IF NOT EXISTS
      if ($("#" + NetworkTables.keySelector(path + "/" + x)).length == 0) {
        var div = $(" <div /> ", {
          id: NetworkTables.keyToId(path + "/" + x),
          class: "nt-div disabled",
        });
        // folder key label
        $("<div />", {
          id: NetworkTables.keyToId(path + "/" + x + "_title"),
          class: "nt-title",
          text: x,
          onClick: "ntToggle(this)",
        }).appendTo(div);
        // folder children area
        $("<div />", {
          id: NetworkTables.keyToId(path + "/" + x + "/"),
          class: "nt-div-container",
        }).appendTo(div);
        // add folder to parent folder
        $("#" + NetworkTables.keySelector(path + "/")).append(div);
      }
      put(xs, path + "/" + x, data); // make current folder parent folder and call function again
    } else {
      // if the item doesn't have children then it must not be a folder
      var item = $(" <div /> ", {
        id: NetworkTables.keyToId(path + "/" + x),
        class: "nt-item",
      });
      // item key
      $(" <div /> ", {
        class: "nt-key",
        text: x,
      }).appendTo(item);
      // item value
      $(" <div /> ", {
        class: "nt-value",
        id: NetworkTables.keyToId(path + "/" + x) + "--item",
        text: data,
      }).appendTo(item);
      // add item to parent folder
      $("#" + NetworkTables.keySelector(path + "/")).append(item);
    }
  }
  var [_, ...items] = key.split("/");
  // start function with initial path blank
  put(items, "", value);
}

function onValueChanged(key, value, isNew) {
  // key thing here: we're using the various NetworkTable keys as
  // the id of the elements that we're appending, for simplicity. However,
  // the key names aren't always valid HTML identifiers, so we use
  // the NetworkTables.keyToId() function to convert them appropriately

  if (ids.indexOf(key) == -1) {
    putNT(key, value);
  } else {
    // similarly, use keySelector to convert the key to a valid jQuery
    // selector. This should work for class names also, not just for ids
    $("#" + NetworkTables.keySelector(key) + "--item").text(value);
    ids.push(key);
  }

  if (key === "/SmartDashboard/Auto/Mode/options") {
    var options = NetworkTables.getValue("/SmartDashboard/Auto/Mode/options");
    $("#autonomous-selector").empty();
    options.forEach((v, i) => {
      $("<div />")
        .attr("id", "opt" + i)
        .html(v)
        .appendTo($("#autonomous-selector"));
    });
  }

  if (key === "/SmartDashboard/BuildData/git-branch") {
    $("#git-branch").text(value);
  }

  if (key === "/SmartDashboard/BuildData/git-desc") {
    $("#git-hash").text(value);
  }

  if (key === "/SmartDashboard/BuildData/deploy-user") {
    $("#git-user").text(value);
    var color = "";
    switch (value) {
      case "SimUser":
        color = "#d3869b";
        break;
      case "joe":
        color = "#831598";
        break;
      case "dublu":
        color = "#fe8019";
        break;
      case "kredcool":
        color = "#67ab24";
        break;
      default:
        color = "#282828";
    }
    $("#git-user").css("border-right", "20px solid " + color);
  }

  if (key === "/SmartDashboard/Auto/Angle") {
    autoAngle = value;
    $("#autonomous-angle > input").val(autoAngle);
    $("#angle").text(value);
  }

  /*if (key.includes("/SmartDashboard/Audio")) {
        countDownAlerts(key, value);
    }*/

  if (key.includes("/SmartDashboard/Swerve/")) {
    if (key.includes("desired")) {
      wheel = key.split("/").at(-2);
      $(".swerve-desired ." + wheel + "d").css(
        "transform",
        "rotate(" + value + "deg)",
      );
    } else {
      wheel = key.split("/").at(-2);
      $(".swerve ." + wheel).css("transform", "rotate(" + value + "deg)");
    }
  }

  if (key.includes("/SmartDashboard/Thermals/")) {
    var name = key.replace("/SmartDashboard/Thermals/", "");
    temps[name] = value;
    var items = Object.keys(temps).map(function (k) {
      return [k, temps[k]];
    });
    items.sort(function (first, second) {
      return second[1] - first[1];
    });
    $("#thermal-content").empty();
    items.forEach((element) => {
      var entry = $("<div />");
      entry.append(
        $("<div />", {
          class: "thermal-name",
          text: element[0],
        }),
      );
      entry.append(
        $("<div />", {
          class: "thermal-value",
          text: element[1],
        }),
      );
      $("#thermal-content").append(entry);
    });
  }

  if (key.includes("/SmartDashboard/FieldCentric/active")) {
    $("#fieldrelative").toggleClass("active", value == "Field Centric");
    $("#fieldrelative .indicator").text(value == "Field Centric" ? "⏽" : "⭘");
  }

  $("#autonomous-selector > div").each(function () {
    if (
      $(this).html() ==
      NetworkTables.getValue("/SmartDashboard/Auto/Mode/active")
    ) {
      $(this).css("background", "#802");
    } else {
      $(this).css("background", "");
    }
  });

  if (key.includes("/SmartDashboard/Auto/IsAuto")) {
    isAuto = value;
    $("body").toggleClass("auto", value);
    $("#auto-mode").toggle(value);
    $("#auto-img").toggle(value);
    if (value) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }
}
