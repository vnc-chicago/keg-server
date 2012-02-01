#include <AikoEvents.h>
using namespace Aiko;

#include <OneWire.h>
#include <DallasTemperature.h>
#include <NewSoftSerial.h>

// Serial
String message = "";

// Temperature
#define ONE_WIRE_BUS 12 // Define the pin the OneWire sensors are on, currently a single temp sensor
#define REFRESH_TEMP_SPEED 60000 // Define the time to refresh in ms
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
DeviceAddress temp1Address;

// Flow
#define FLOW_IN_PIN 2 
#define FLOW_SAMPLE_RATE 500 // Define a sample rate to measure flow in ms, currently take a measure every .5 sec
#define IDLE_COUNT 10 // Amount of time to wait in seconds to time out pour
int lastFlow = 0;
int lastPour = 0;
boolean isInitialTry = true;
volatile int flow;
int calc;

// RFID
#define RFID_IN_PIN 9
#define RFID_OUT_PIN 6 
NewSoftSerial rfid = NewSoftSerial(RFID_IN_PIN, RFID_OUT_PIN);
char code[11]; // Array to hold tag digits
int offset = 0; // How far into the tag we've read
String lastRFID;

// Solenoid
#define SOLENOID_OUT_PIN 8
int idleCount;

// Initialization phase
void setup(void) {
  // Start the serial port
  Serial.begin(9600);

  pinMode(13, OUTPUT);
  digitalWrite(13, LOW);

  setupSensors();
  setupRFID();
  setupFlowMeter();
  setupSolenoid();

  // Schedule to refresh temps every REFRESH_TEMP_SPEED
  Events.addHandler(refreshTemps, REFRESH_TEMP_SPEED);
}

void setupSensors() {
  // Start the temp sensor
  sensors.begin();

  // Get the address
  sensors.getAddress(temp1Address, 0);

  // set the resolution to 9 bit
  sensors.setResolution(temp1Address, 9);

  // Request temperature updates for the first time
  sensors.requestTemperatures();
}

void setupRFID() {
  // Start the RFID reader
  rfid.begin(2400);

  // Setup pin for RFID reader
  pinMode(RFID_OUT_PIN, OUTPUT);
  pinMode(RFID_IN_PIN, INPUT);

  // Activate the RFID reader
  digitalWrite(RFID_OUT_PIN, LOW);
}

void setupFlowMeter() {
  // Attach our flow meter
  pinMode(FLOW_IN_PIN, INPUT);
}

void setupSolenoid() {
  pinMode(SOLENOID_OUT_PIN, OUTPUT);
  digitalWrite(SOLENOID_OUT_PIN, LOW);
}

// Main logic
void loop(void) { 
  // Run through our scheduled events
  Events.loop();

  // Check serial to see if we have any incoming messages and handle
  serialHandler();

  // Check the RFID reader to see if that state changed  
  rfidHandler();
}

void refreshTemps() {
  // Get temps
  float temp1 = sensors.getTempF(temp1Address);

  // Write temps to server
  Serial.print("**TEMP_");
  Serial.print(temp1);
  Serial.println("**");

  // Request temperatures for next time
  sensors.requestTemperatures();
}

void clearRFID() {
  lastRFID = "";
}

void flowMeterInterrupt() {
  flow++;
}

void openSolenoid() {
  digitalWrite(13, HIGH);
  isInitialTry = true;
  lastPour = 0;
  
  digitalWrite(SOLENOID_OUT_PIN, HIGH);
  
  // Create the interrupt if the meter is flowing
  attachInterrupt(0, flowMeterInterrupt, RISING);
  
  // Try in case user is super quick
  measureFlow();
}

void measureFlow() {
  // Convert our pulse frequency to a oz/s and store in lastFlow
  lastFlow = ((flow * 60) / 7.5) * 0.00939278408;
  flow = 0;

  if(lastFlow != 0) {    
    lastPour += lastFlow;
    Serial.print("**FLOW_");
    Serial.print(lastFlow);
    Serial.println("**");
  }

  pourHandler();
}

void pourHandler() {
  // while idle count < IDLE_COUNT sec
  while(idleCount < IDLE_COUNT) {

    // Convert our pulse frequency to a oz/s and store in lastFlow
    lastFlow = ((flow * 60) / 7.5) * 0.00939278408;
    flow = 0;
 
    if(lastFlow == 0) {
      if(!isInitialTry) idleCount++;
    } 
    else {
      lastPour += lastFlow;
      Serial.print("**FLOW_");
      Serial.print(lastFlow);
      Serial.println("**");
    }

    isInitialTry = false;
    delay(1000);
  }

  closeSolenoid();
  idleCount = 0;
  Serial.println("**FLOW_END**");
  Serial.print("**POUR_");
  Serial.print(lastPour);
  Serial.println("**");
  lastPour = 0;
}

void closeSolenoid() {
  digitalWrite(13, LOW);
  digitalWrite(SOLENOID_OUT_PIN, LOW);
  detachInterrupt(0);
  clearRFID();
}

void serialHandler() {
  if (Serial.available() > 0) {
    message += byte(Serial.read());
    if(message == "**REQUEST_TEMP**") {
      refreshTemps();
      message = "";
    } 
    else if (message ==  "**REQUEST_OPEN**") {
      openSolenoid();
      message = "";
    }
  }
}

void rfidHandler() {
  // RFID Handler
  if (rfid.available() > 0) {
    if (offset > 10) {
      Serial.println("RFID buffer overflow");
      offset = 0;
    }

    // Read a character
    char c = rfid.read();

    // If end of line
    if (c == '\r' || c == '\n') {
      code[offset] = 0;
      if (c == '\r' && lastRFID != code) {
        // Print out to server
        Serial.print("**TAG_");
        Serial.print(code);
        Serial.println("**");

        lastRFID = code;
      }
      offset = 0;
    } 
    else {
      // Add our character to the array
      code[offset++] = c;
    }
  } 
}
