// used when hosting the site somewhere other than the ESP8266 (handy for testing without waiting forever to upload to SPIFFS)
var espAddresses = ["192.168.1.253", "192.168.1.252", "192.168.1.251", "192.168.1.250", "192.168.1.249", "192.168.1.248", "192.168.1.247", "192.168.1.240"];
var address = espAddresses[0];
var urlBase = "http://" + address + "/";

let postColorTimer = {};
let postValueTimer = {};

let ignoreColorChange = false;
let paramsUpdateRunning = false;

let ws = new ReconnectingWebSocket('ws://' + address + ':81/', ['arduino']);
//should look into changing
ws.close();
ws.debug = true;

function updateCurrentESP(value) {
  address = espAddresses[value];
  urlBase = "http://" + address + "/";
  ws.close();
  ws = new ReconnectingWebSocket('ws://' + address + ':81/', ['arduino']);
  ws.debug = true;

  ws.onmessage = function(evt) {
    //TODO: check if it is from the ip we are currently looking at
    if(evt.data != null) {
      let data = JSON.parse(evt.data);
      if(data == null) return;
      updateFieldValue(data.name, data.value);
    }
  }
}

$(document).ready(function() {
  $("#status").html("Select A Device...");
  $("#input-espselect").change(function() {
    let selection = $("#input-espselect option:selected").index();
    $( "#formGeneral" ).empty();
    if (selection != 0) {
      updateCurrentESP(selection - 1);
      $("#input-espselect").prop('disabled', true);
      $("#status").html("Connecting, please wait...");
      $.get(urlBase + "all", function(data) {
        $("#status").html("Loading, please wait...");
        $.each(data, function(index, field) {
          if (field.type == "Number") {
            addNumberField(field, "formGeneral");
          } else if (field.type == "Boolean") {
            addBooleanField(field, "formGeneral");
          } else if (field.type == "Select") {
            addSelectField(field, "formGeneral");
          } else if (field.type == "SelectHeader") {
            addSelectHeaderField(field, "formGeneral");
          } else if (field.type == "Color") {
            addColorFieldPalette(field, "formGeneral");
            addColorFieldPicker(field, "formGeneral");
          } else if (field.type == "Section") {
            addSectionField(field, "formGeneral");
          }
        });
        $(".minicolors").minicolors({
          theme: "bootstrap",
          changeDelay: 200,
          control: "wheel",
          format: "rgb",
          inline: true
        });
        $("#input-espselect").prop('disabled', false);
        updateParams();
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Unable to connect to the ESP selected")
        $("#status").html("Unable to Connect to '" + $("#input-espselect option:selected").text() + "'");
        $("#input-espselect").prop('disabled', false);
        ws.close();
      });
    }
  });
});

function addNumberField(field, formId) {
  let template = $("#numberTemplate").clone();

  template.attr("id", "form-group-" + field.name);
  template.attr("data-field-type", field.type);

  let label = template.find(".control-label");
  label.attr("for", "input-" + field.name);
  label.text(field.label);

  let input = template.find(".input");
  let slider = template.find(".slider");
  slider.attr("id", "input-" + field.name);
  if (field.min) {
    input.attr("min", field.min);
    slider.attr("min", field.min);
  }
  if (field.max) {
    input.attr("max", field.max);
    slider.attr("max", field.max);
  }
  if (field.step) {
    input.attr("step", field.step);
    slider.attr("step", field.step);
  }
  input.val(field.value);
  slider.val(field.value);

  slider.on("change mousemove", function() {
    input.val($(this).val());
  });

  slider.on("change", function() {
    let value = $(this).val();
    input.val(value);
    field.value = value;
    delayPostValue(formId, field.name, value);
  });

  input.on("change", function() {
    let value = $(this).val();
    slider.val(value);
    field.value = value;
    delayPostValue(formId, field.name, value);
  });

  $("#" + formId).append(template);
}

function addBooleanField(field, formId) {
  let template = $("#booleanTemplate").clone();

  template.attr("id", "form-group-" + field.name);
  template.attr("data-field-type", field.type);

  let label = template.find(".control-label");
  label.attr("for", "btn-group-" + field.name);
  label.text(field.label);

  let btngroup = template.find(".btn-group");
  btngroup.attr("id", "btn-group-" + field.name);

  let btnOn = template.find("#btnOn");
  let btnOff = template.find("#btnOff");

  btnOn.attr("id", "btnOn" + field.name);
  btnOff.attr("id", "btnOff" + field.name);

  btnOn.attr("class", field.value ? "btn btn-primary" : "btn btn-default");
  btnOff.attr("class", !field.value ? "btn btn-primary" : "btn btn-default");

  btnOn.click(function() {
    setBooleanFieldValue(formId, field, btnOn, btnOff, 1)
  });
  btnOff.click(function() {
    setBooleanFieldValue(formId, field, btnOn, btnOff, 0)
  });

  $("#" + formId).append(template);
}

function addSelectHeaderField(field, formId) {
  let template = $("#selectNavTemplate").clone();

  template.attr("id", "form-group-" + field.name);
  template.attr("data-field-type", field.type);

  let id = "input-" + field.name;

  let label = template.find(".control-label");
  label.attr("for", id);
  label.text(field.label);

  let select = template.find(".btn-group");
  let btnTemplate = select.find("btn-zone");

  for (let i = 0; i < field.options.length; i++) {
    let btnText = field.options[i];
    let r= $("<label class='btn btn-primary'><input type='radio' name='options' id='zone" + i + "' value='"+ i + "' autocomplete='off'>" + btnText + "</label>");
    select.append(r);

    r.click(function(event) {
      let test = $(this).attr(id);
      console.log($(event.target).find("#input").value);
      //postValue(field.name, value);
    });
  }
  $("#" + formId).append(template);
}

function addSelectField(field, formId) {
  let template = $("#selectTemplate").clone();

  template.attr("id", "form-group-" + field.name);
  template.attr("data-field-type", field.type);

  let id = "input-" + field.name;

  let label = template.find(".control-label");
  label.attr("for", id);
  label.text(field.label);

  let select = template.find(".form-control");
  select.attr("id", id);

  for (let i = 0; i < field.options.length; i++) {
    let optionText = field.options[i];
    let option = $("<option></option>");
    option.text(optionText);
    option.attr("value", i);
    select.append(option);
  }

  select.val(field.value);

  select.change(function() {
    let value = template.find("#" + id + " option:selected").index();
    if (field.name == "pattern") {
      $("#formParameters").empty();
    }
    postValue(formId, field.name, value);
  });

  let previousButton = template.find(".btn-previous");
  let nextButton = template.find(".btn-next");

  previousButton.click(function() {
    let value = template.find("#" + id + " option:selected").index();
    let count = select.find("option").length;
    value--;
    if(value < 0)
      value = count - 1;
    select.val(value);
    if (field.name == "pattern") {
      $("#formParameters").empty();
    }
    postValue(formId, field.name, value);
  });

  nextButton.click(function() {
    let value = template.find("#" + id + " option:selected").index();
    let count = select.find("option").length;
    value++;
    if(value >= count)
      value = 0;
    select.val(value);
    if (field.name == "pattern") {
      $("#formParameters").empty();
    }
    postValue(formId, field.name, value);
  });

  $("#" + formId).append(template);
}
function updateParams() {
  paramsUpdateRunning = true;
  console.log("Update Params");
  $("#formParameters").empty();
  $.get(urlBase + "parameters", function(data) {
    $("#status").html("Loading, please wait...");
    $.each(data, function(index, field) {
      if (field.type == "Number") {
        addNumberField(field, "formParameters");
      } else if (field.type == "Boolean") {
        addBooleanField(field, "formParameters");
      } else if (field.type == "Select") {
        addSelectField(field, "formParameters");
      } else if (field.type == "SelectHeader") {
        addSelectHeaderField(field, "formParameters");
      } else if (field.type == "Color") {
        addColorFieldPalette(field, "formParameters");
        addColorFieldPicker(field, "formParameters");
      } else if (field.type == "Section") {
        addSectionField(field, "formParameters");
      }
    });
    $(".minicolors").minicolors({
      theme: "bootstrap",
      changeDelay: 200,
      control: "wheel",
      format: "rgb",
      inline: true
    });
    $("#status").html("Ready");
    paramsUpdateRunning = false;
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.log("Unable to connect to the ESP selected")
    $("#status").html("Unable to Connect to '" + $("#input-espselect option:selected").text() + "'");
    $("#input-espselect").prop('disabled', false);
  });
}
function addColorFieldPicker(field, formId) {
  let template = $("#colorTemplate").clone();

  template.attr("id", "form-group-" + field.name);
  template.attr("data-field-type", field.type);

  let id = "input-" + field.name;

  let input = template.find(".minicolors");
  input.attr("id", id);

  if(!field.value.startsWith("rgb("))
    field.value = "rgb(" + field.value;

  if(!field.value.endsWith(")"))
    field.value += ")";

  input.val(field.value);

  let components = rgbToComponents(field.value);

  let redInput = template.find(".color-red-input");
  let greenInput = template.find(".color-green-input");
  let blueInput = template.find(".color-blue-input");

  let redSlider = template.find(".color-red-slider");
  let greenSlider = template.find(".color-green-slider");
  let blueSlider = template.find(".color-blue-slider");

  redInput.attr("id", id + "-red");
  greenInput.attr("id", id + "-green");
  blueInput.attr("id", id + "-blue");

  redSlider.attr("id", id + "-red-slider");
  greenSlider.attr("id", id + "-green-slider");
  blueSlider.attr("id", id + "-blue-slider");

  redInput.val(components.r);
  greenInput.val(components.g);
  blueInput.val(components.b);

  redSlider.val(components.r);
  greenSlider.val(components.g);
  blueSlider.val(components.b);

  redInput.on("change", function() {
    let value = $("#" + id).val();
    let r = $(this).val();
    let components = rgbToComponents(value);
    field.value = r + "," + components.g + "," + components.b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    redSlider.val(r);
  });

  greenInput.on("change", function() {
    let value = $("#" + id).val();
    let g = $(this).val();
    let components = rgbToComponents(value);
    field.value = components.r + "," + g + "," + components.b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    greenSlider.val(g);
  });

  blueInput.on("change", function() {
    let value = $("#" + id).val();
    let b = $(this).val();
    let components = rgbToComponents(value);
    field.value = components.r + "," + components.g + "," + b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    blueSlider.val(b);
  });

  redSlider.on("change", function() {
    let value = $("#" + id).val();
    let r = $(this).val();
    let components = rgbToComponents(value);
    field.value = r + "," + components.g + "," + components.b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    redInput.val(r);
  });

  greenSlider.on("change", function() {
    let value = $("#" + id).val();
    let g = $(this).val();
    let components = rgbToComponents(value);
    field.value = components.r + "," + g + "," + components.b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    greenInput.val(g);
  });

  blueSlider.on("change", function() {
    let value = $("#" + id).val();
    let b = $(this).val();
    let components = rgbToComponents(value);
    field.value = components.r + "," + components.g + "," + b;
    $("#" + id).minicolors("value", "rgb(" + field.value + ")");
    blueInput.val(b);
  });

  redSlider.on("change mousemove", function() {
    redInput.val($(this).val());
  });

  greenSlider.on("change mousemove", function() {
    greenInput.val($(this).val());
  });

  blueSlider.on("change mousemove", function() {
    blueInput.val($(this).val());
  });

  input.on("change", function() {
    if (ignoreColorChange) return;

    let components = rgbToComponents(value);

    redInput.val(components.r);
    greenInput.val(components.g);
    blueInput.val(components.b);

    redSlider.val(components.r);
    greenSlider.val(components.g);
    blueSlider.val(components.b);

    field.value = components.r + "," + components.g + "," + components.b;
    delayPostColor(field.name, components);
  });

  $("#" + formId).append(template);
}

function addColorFieldPalette(field, formId) {
  let template = $("#colorPaletteTemplate").clone();

  let buttons = template.find(".btn-color");

  let label = template.find(".control-label");
  label.text(field.label);

  buttons.each(function(index, button) {
    $(button).click(function() {
      let rgb = $(this).css('backgroundColor');
      let components = rgbToComponents(rgb);

      field.value = components.r + "," + components.g + "," + components.b;
      postColor(field.name, components);

      ignoreColorChange = true;
      let id = "#input-" + field.name;
      $(id).minicolors("value", "rgb(" + field.value + ")");
      $(id + "-red").val(components.r);
      $(id + "-green").val(components.g);
      $(id + "-blue").val(components.b);
      $(id + "-red-slider").val(components.r);
      $(id + "-green-slider").val(components.g);
      $(id + "-blue-slider").val(components.b);
      ignoreColorChange = false;
    });
  });

  $("#" + formId).append(template);
}

function addSectionField(field, formId) {
  let template = $("#sectionTemplate").clone();

  template.attr("id", "form-group-section-" + field.name);
  template.attr("data-field-type", field.type);

  $("#" + formId).append(template);
}

function updateFieldValue(name, value) {
  let group = $("#form-group-" + name);

  let type = group.attr("data-field-type");

  if (type == "Number") {
    let input = group.find(".form-control");
    input.val(value);
  } else if (type == "Boolean") {
    let btnOn = group.find("#btnOn" + name);
    let btnOff = group.find("#btnOff" + name);

    btnOn.attr("class", value ? "btn btn-primary" : "btn btn-default");
    btnOff.attr("class", !value ? "btn btn-primary" : "btn btn-default");

  } else if (type == "Select") {
    let select = group.find(".form-control");
    if (name == "pattern") {
      if (!paramsUpdateRunning) {
        updateParams();
      }
    }
    select.val(value);
  } else if (type == "Color") {
    let input = group.find(".form-control");
    //input.val("rgb(" + value + ")");
  }
};

function setBooleanFieldValue(formId, field, btnOn, btnOff, value) {
  field.value = value;

  btnOn.attr("class", field.value ? "btn btn-primary" : "btn btn-default");
  btnOff.attr("class", !field.value ? "btn btn-primary" : "btn btn-default");

  postValue(formId, field.name, field.value);
}

function postValue(formId, name, value) {
  $("#status").html("Setting " + name + ": " + value + ", please wait...");

  let body = { name: name, value: value };
  console.log(urlBase + formId + "Value?name=" + name + "&value=" + value)
  //change over to field value, test new in browser. sync to github?
  $.post(urlBase + formId + "Value?name=" + name + "&value=" + value, body, function(data) {
    if (data.name != null) {
      $("#status").html("Set " + name + ": " + data.name);
    } else {
      $("#status").html("Set " + name + ": " + data);
    }
  });
}

function delayPostValue(formId, name, value) {
  clearTimeout(postValueTimer);
  postValueTimer = setTimeout(function() {
    postValue(formId, name, value);
  }, 300);
}

function postColor(name, value) {
  $("#status").html("Setting " + name + ": " + value.r + "," + value.g + "," + value.b + ", please wait...");

  let body = { name: name, r: value.r, g: value.g, b: value.b };

  $.post(urlBase + name + "?r=" + value.r + "&g=" + value.g + "&b=" + value.b, body, function(data) {
    $("#status").html("Set " + name + ": " + data);
  })
  .fail(function(textStatus, errorThrown) { $("#status").html("Fail: " + textStatus + " " + errorThrown); });
}

function delayPostColor(name, value) {
  clearTimeout(postColorTimer);
  postColorTimer = setTimeout(function() {
    postColor(name, value);
  }, 300);
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rgbToComponents(rgb) {
  let components = {};

  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  components.r = parseInt(rgb[1]);
  components.g = parseInt(rgb[2]);
  components.b = parseInt(rgb[3]);

  return components;
}
