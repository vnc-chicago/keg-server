#include <AikoEvents.h>
using namespace Aiko;

#include <OneWire.h>
#include <DallasTemperature.h>
#include <NewSoftSerial.h>

// Serial
String message = "";

// Temperature
#define ONE_WIRE_BUS 1 // Define the pin the OneWire sensors are on, currently a single temp sensor
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
DeviceAddress temp1Address;

// Flow
#define FLOW_IN_PIN 3
#define FLOW_SAMPLE_RATE 500 // Define a sample rate to measure flow in ms, currently take a measure every .5 sec
#define IDLE_COUNT 10 // Amount of time to wait in seconds to time out pour
int lastFlow = 0;
int lastPour = 0;
boolean isInitialTry = true;
EventHandler* flowEventHandler;
volatile int flowFan;
int calc;

// RFID
#define RFID_IN_PIN 7
#define RFID_OUT_PIN 8
NewSoftSerial rfid = NewSoftSerial(RFID_IN_PIN, RFID_OUT_PIN);
char code[11]; // Array to hold tag digits
int offset = 0; // How far into the tag we've read

// Solenoid
#define SOLENOID_OUT_PIN 2
int idleCount;

// Initialization phase
void setup(void) {
  // Start the serial port
  Serial.begin(9600);

  setupSensors();
  setupRFID();
  setupFlowMeter();
  setupSolenoid();

  // Schedule to refresh temps every minute
  Events.addHandler(refreshTemps, 60000);
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

  // Activate the RFID reader
  digitalWrite(RFID_OUT_PIN, LOW);
}

void setupFlowMeter() {
  // Attach our flow meter
  pinMode(FLOW_IN_PIN, INPUT);

  // Create the interrupt if the meter is flowing
  attachInterrupt(1, flowMeterInterrupt, RISING);
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
  Serial.print("**");

  // Request temperatures for next time
  sensors.requestTemperatures();
}

void flowMeterInterrupt() {
  flowFan++;
}

void measureFlow() {
  // Convert our pulse frequency to a oz/s and store in lastFlow
  lastFlow = ((flowFan * 60) / 7.5) * 0.00939278408;
  flowFan = 0;
  pourHandler();
}

void openSolenoid() {
  digitalWrite(SOLENOID_OUT_PIN, HIGH);
  isInitialTry = true;

  // Measure flow every half second
  flowEventHandler = Events.addHandler(measureFlow, 500);

  // Try in case user is super quick
  measureFlow();
}

void pourHandler() {
  // while idle count < IDLE_COUNT sec
  while(idleCount < IDLE_COUNT) {
    // Measure flow for a .5 sec, this is done with the event handler above    
    if(lastFlow == 0) {
      if(!isInitialTry) idleCount++;
    } 
    else {
      lastPour += lastFlow;
      Serial.print("**FLOW_");
      Serial.print(lastFlow);
      Serial.print("**");
    }
  } 

  if(idleCount == IDLE_COUNT) {
    closeSolenoid();
    idleCount = 0;
    Serial.print("**FLOW_END**");
    Serial.print("**POUR_");
    Serial.print(lastPour);
    Serial.print("**");
  }
}

void closeSolenoid() {
  digitalWrite(SOLENOID_OUT_PIN, LOW);
  if(flowEventHandler != NULL) {
    Events.removeHandler(flowEventHandler);
  }
}

void serialHandler() {
  if (Serial.available()) {
    message += Serial.read();
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
      Serial.print("RFID buffer overflow");
      offset = 0;
    }

    // Read a character
    char c = rfid.read();

    // If end of line
    if (c == '\r' || c == '\n') {
      code[offset] = 0;
      if (c == '\r') {
        // Print out to server
        Serial.print("**TAG_");
        Serial.print(code);
        Serial.print("**");
      }
      offset = 0;
    } 
    else {
      // Add our character to the array
      code[offset++] = c;
    }
  }
}











