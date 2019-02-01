/*
   ESP8266 + FastLED + IR Remote: https://github.com/jasoncoon/esp8266-fastled-webserver
   Copyright (C) 2016 Jason Coon

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


String getPower() {
  return String(power);
}

String getBrightness() {
  return String(brightness);
}

String getPattern() {
  return String(currentPatternIndex);
}

String getPalette() {
  return String(currentPaletteIndex);
}

String getPalettes() {
  String json = "";

  for (uint8_t i = 0; i < paletteCount; i++) {
    json += "\"" + paletteNames[i] + "\"";
    if (i < paletteCount - 1)
      json += ",";
  }

  return json;
}

String getZone() {
  return String(currentZoneIndex);
}

String getZones() {
  String json = "";

  for (uint8_t i = 0; i < zoneCount; i++) {
    json += "\"" + zones[i].name + "\"";
    if (i < zoneCount - 1)
      json += ",";
  }

  return json;
}

String getAutoplay() {
  return String(autoplay);
}

String getAutoplayDuration() {
  return String(autoplayDuration);
}

String getSolidColor() {
  return String(solidColor.r) + "," + String(solidColor.g) + "," + String(solidColor.b);
}

String getCooling() {
  return String(cooling);
}

String getSparking() {
  return String(sparking);
}

String getSpeed() {
  return String(speed);
}

String getTwinkleSpeed() {
  return String(twinkleSpeed);
}

String getTwinkleDensity() {
  return String(twinkleDensity);
}

FieldList fieldParams = {
  { "palette", "Palette", SelectFieldType, 0, paletteCount, getPalette, getPalettes },
  { "speed", "Speed", NumberFieldType, 1, 255, getSpeed },
  { "solidColor", "Color", ColorFieldType, 0, 255, getSolidColor },
  { "cooling", "Cooling", NumberFieldType, 0, 255, getCooling },
  { "sparking", "Sparking", NumberFieldType, 0, 255, getSparking },
  { "twinkleSpeed", "Twinkle Speed", NumberFieldType, 0, 8, getTwinkleSpeed },
  { "twinkleDensity", "Twinkle Density", NumberFieldType, 0, 8, getTwinkleDensity }
};

String getFieldsJsonVec(std::vector<int> fields) {
  String json = "[";

  for (uint8_t i = 0; i < fields.size(); i++) {
    Field field = fieldParams[fields[i]];

    json += "{\"name\":\"" + field.name + "\",\"label\":\"" + field.label + "\",\"type\":\"" + field.type + "\"";

    if(field.getValue) {
      if (field.type == ColorFieldType || field.type == "String") {
        json += ",\"value\":\"" + field.getValue() + "\"";
      }
      else {
        json += ",\"value\":" + field.getValue();
      }
    }

    if (field.type == NumberFieldType) {
      json += ",\"min\":" + String(field.min);
      json += ",\"max\":" + String(field.max);
    }

    if (field.getOptions) {
      json += ",\"options\":[";
      json += field.getOptions();
      json += "]";
    }

    json += "}";

    if (i < fields.size() - 1)
      json += ",";
  }

  json += "]";

  return json;
}
FieldList activeFieldParameters = {};