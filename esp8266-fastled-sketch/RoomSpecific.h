//IP: 523 living, 252 kitchen, 251 pong, 250 foosball room, 249 party room, 248 stairs
       //649 living room, 170 stairs, 337 foosball room, 200 pong
#if CURRENT_ROOM == 1 //living
  IPAddress ip(192, 168, 1, 253);
  const String espLocation = "living-room";
  ZoneList zones = {
    {0, 2, "All"},
  };
  #define NUM_LEDS      649
  #define MILLI_AMPS    30000
#elif CURRENT_ROOM == 2 //kitchen
  IPAddress ip(192, 168, 1, 252);
  const String espLocation = "kitchen";
  ZoneList zones = {
    {0, 2, "Left"},
    {11, 20, "Right"}
  };
  #define NUM_LEDS      200
  #define MILLI_AMPS    15000
#elif CURRENT_ROOM == 3 //pong
  IPAddress ip(192, 168, 1, 251);
  const String espLocation = "pong";
  ZoneList zones = {
    {0, 2, "Our Side"},
    {3, 10, "Their Side"}
  };
  #define NUM_LEDS      340
  #define MILLI_AMPS    40000
#elif CURRENT_ROOM == 4 //foosball
  IPAddress ip(192, 168, 1, 250);
  const String espLocation = "fooseball-room";
  ZoneList zones = {
    {0, 2, "Left"},
    {3, 10, "Middle"},
    {11, 20, "Right"}
  };
  #define NUM_LEDS      337
  #define MILLI_AMPS    25000
#elif CURRENT_ROOM == 5 //party
  IPAddress ip(192, 168, 1, 249);
  const String espLocation = "party-room";
  ZoneList zones = {
    {0, 2, "Speakers"},
    {3, 10, "Laundry"},
    {11, 20, "Projector"},
    {11, 20, "Paint Sticks"}
  };
  #define NUM_LEDS      463
  #define MILLI_AMPS    45000
#elif CURRENT_ROOM == 6 //stairs
  const String espLocation = "stairs";
  IPAddress ip(192, 168, 1, 248);
  ZoneList zones = {
    {0, 2, "Left"},
    {3, 10, "Middle"},
    {11, 20, "Right"}
  };
  #define NUM_LEDS      189
  #define MILLI_AMPS    15000
#elif CURRENT_ROOM == 7 //lighthouse
  IPAddress ip(192, 168, 1, 247);
  const String espLocation = "lighthouse";
  ZoneList zones = {
    {0, 2, "Left"},
    {3, 10, "Middle"},
    {11, 20, "Right"}
  };
  #define NUM_LEDS      198
  #define MILLI_AMPS    20000
#elif CURRENT_ROOM == 20 //calibration
  IPAddress ip(192, 168, 1, 240);
  const String espLocation = "calibration";
  ZoneList zones = {
    {0, 2, "Not Used"}
  };
  #define NUM_LEDS      150
  #define MILLI_AMPS    20000
#elif CURRENT_ROOM == 21 //dad's basement
  IPAddress ip(192, 168, 1, 253);
  const String espLocation = "power-dad-basement";
  ZoneList zones = {
    {0, 2, "Left"},
    {3, 10, "Middle"},
    {11, 20, "Right"}
  };
  #define NUM_LEDS      278
  #define MILLI_AMPS    26000
#endif
