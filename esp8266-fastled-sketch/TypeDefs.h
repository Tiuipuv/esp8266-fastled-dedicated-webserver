typedef struct {
  char* name;
  char* password;
} AP;
typedef AP APList[];

typedef struct {
  int start;
  int end;
  String name;
} Zone;
typedef Zone ZoneList[];

typedef void (*Pattern)();
typedef Pattern PatternList[];
typedef struct {
  Pattern pattern;
  String name;
  std::vector<int> params;
} PatternAndName;
typedef PatternAndName PatternAndNameList[];

typedef void (*FieldSetter)(String);
typedef String (*FieldGetter)();
typedef struct Field {
  String name;
  String label;
  String type;
  uint8_t min;
  uint8_t max;
  uint8_t defaultVal;
  FieldGetter getValue;
  FieldSetter setValue;
  FieldGetter getOptions;
};
typedef Field FieldList[];


//template functions to compile, I HATE C++
void pride();
void colorWaves();
void rainbow();
void rainbowWithGlitter();
void rainbowSolid();
void confetti();
void sinelon();
void bpm();
void juggle();
void fire();
void water();
void slinki();
void showSolidColor();
void showTwinkles();
void audioSolidColor();
void audioSolidColor2();
void audioRainbowEdge();
void audioFadeEdge();
void audioFadeRedEdge();
void audioRedWhiteEdge();
void audioRainbowMid();
void audioFadeMid();
void audioFadeRedMid();
void audioRedWhiteMid();
void audioRainbowSpeed();
void audioRainbowSpeedLong();
void audioRainbowSpeedBack();
void audioRainbowSpeedLongBack();
void audioConfetti();
void audioConfettiDense();
void audioSlinki();
void audioSlinki2();
void audioMultiEq();
void audioMultiEq2();
void audioMultiEqWTwinkle();
void audioStrobe();
void broadcastInt(String, uint8_t);
void broadcastString(String, String);

//template variables
extern FieldList fieldParams;
