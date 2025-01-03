#ifndef OLEDDISPLAY_H
#define OLEDDISPLAY_H

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_I2C_ADDRESS 0x3C

class OLEDDisplay {
public:
    Adafruit_SH1106G display;
    unsigned long lastUpdateTime; // Tracks the last time the display was updated
    const unsigned long timeout; // Inactivity timeout in milliseconds
    bool isOn; // Tracks whether the OLED is currently on

    OLEDDisplay(unsigned long inactivityTimeout = 10000)
        : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire), 
          lastUpdateTime(0), 
          timeout(inactivityTimeout), 
          isOn(false) {}

    void begin() {
        Wire.begin();
        if (!display.begin(OLED_I2C_ADDRESS)) {
            Serial.println("SH1106 initialization failed. Check connections!");
            while (true);
        }
        display.clearDisplay();
        display.setTextSize(2);
        display.setTextColor(SH110X_WHITE);
        display.display();
        isOn = true;
    }

    void showMessage(const String &message) {
        turnOnIfOff();
        display.clearDisplay();

        // Calculate text width and centered X position
        int textSize = 2; // Text size multiplier (adjustable)
        int textWidth = message.length() * 6 * textSize; // Width of the text in pixels
        int x = (128 - textWidth) / 2; // Centered X position for a 128-pixel-wide display
        int y = (64 - (8 * textSize)) / 2; // Centered Y position for a 64-pixel-high display

        // Set the cursor and display the message
        display.setTextSize(textSize);
        display.setCursor(x, y);
        display.println(message);
        display.display();

        updateActivity(); // Reset inactivity timer
    }

    void showMessage2(const String &message) {
        turnOnIfOff();
        display.clearDisplay();

        // Calculate text width and centered X position
        int textSize = 1; // Text size multiplier (adjustable)
        int textWidth = message.length() * 6 * textSize; // Width of the text in pixels
        int x = (128 - textWidth) / 2; // Centered X position for a 128-pixel-wide display
        int y = (64 - (8 * textSize)) / 2; // Centered Y position for a 64-pixel-high display

        // Set the cursor and display the message
        display.setTextSize(textSize);
        display.setCursor(x, y);
        display.println(message);
        display.display();

        updateActivity(); // Reset inactivity timer
    }

    void updateMessage(const String &component, int velocity) {
        turnOnIfOff();
        display.clearDisplay();
        display.setTextSize(2);

        // Calculate text positions
        int separatorWidth = 6;  // Width of "|"
        int componentWidth = component.length() * 6 * 2;  // Width of component text
        int velocityWidth = 3 * 6 * 2;  // Assuming up to 3 digits for velocity
        int totalWidth = componentWidth + separatorWidth + velocityWidth;

        int x = (SCREEN_WIDTH - totalWidth) / 2; // Center horizontally
        int y = (SCREEN_HEIGHT - (8 * 2)) / 2;  // Center vertically

        // Draw the component, separator, and velocity
        display.setCursor(x, y);
        display.print(component);
        display.setCursor(x + componentWidth, y);
        display.setCursor(x + componentWidth + separatorWidth, y);
        display.print(velocity);

        display.display();

        updateActivity(); // Reset inactivity timer
    }

    void managePower() {
        unsigned long currentTime = millis();
        if (isOn && (currentTime - lastUpdateTime > timeout)) {
            turnOff();
        }
    }

private:
    void updateActivity() {
        lastUpdateTime = millis();
    }

    void turnOff() {
        display.oled_command(0xAE); // Send command to turn off display
        isOn = false;
        Serial.println("OLED turned off to save power");
    }

    void turnOnIfOff() {
        if (!isOn) {
            display.oled_command(0xAF); // Send command to turn on display
            isOn = true;
            Serial.println("OLED turned on");
        }
    }
};

#endif
