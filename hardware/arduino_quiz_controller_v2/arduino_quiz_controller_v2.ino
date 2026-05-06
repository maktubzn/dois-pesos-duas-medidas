#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>

/*
  Dois Pesos, Duas Medidas — Arduino Controller v2

  Mantém os mesmos pinos do sketch atual:
  - LED Grupo A: pin 8
  - LED Grupo B: pin 9
  - Botão Grupo A: pin 3
  - Botão Grupo B: pin 4
  - Botão RESET: pin 5
  - Buzzer fallback: pin 10
  - DFPlayer Mini via SoftwareSerial: RX=6, TX=7

  Protocolo principal para o frontend:
  Arduino -> Front:
    ARDUINO_READY
    DFPLAYER_READY
    DFPLAYER_ERROR
    BT1PRESS
    BT2PRESS
    RESET
    LOCKED
    UNLOCKED
    PONG
    STATUS:LOCKED ou STATUS:UNLOCKED

  Front -> Arduino:
    PING
    STATUS
    LOCK
    UNLOCK
    RESET_HW
    LED1_ON
    LED2_ON
    LEDS_OFF
    PLAY_BUZZ
    STOP_AUDIO
    VOLUME:0..30
*/

// ─── Pinos existentes ───────────────────────────────────────────
const int led1   = 8;
const int led2   = 9;
const int btn1   = 3;
const int btn2   = 4;
const int btn3   = 5;
const int buzzer = 10;

// ─── DFPlayer Mini ──────────────────────────────────────────────
// Arduino RX=6 recebe TX do DFPlayer.
// Arduino TX=7 envia para RX do DFPlayer, idealmente com resistor/divisor.
SoftwareSerial mp3Serial(6, 7);
DFRobotDFPlayerMini mp3;

// ─── Estado ─────────────────────────────────────────────────────
bool travado = false;
bool dfPlayerOk = false;

bool lastBtn1State = HIGH;
bool lastBtn2State = HIGH;
bool lastBtn3State = HIGH;

unsigned long lastButtonEventAt = 0;
const unsigned long debounceMs = 180;

// Buffer simples para comandos seriais sem usar readStringUntil bloqueante.
char commandBuffer[48];
byte commandIndex = 0;

// ─── Helpers ────────────────────────────────────────────────────
bool debounceReady() {
  unsigned long now = millis();
  if (now - lastButtonEventAt < debounceMs) return false;
  lastButtonEventAt = now;
  return true;
}

bool pressedEdge(int pin, bool &lastState) {
  bool current = digitalRead(pin);
  bool fell = (lastState == HIGH && current == LOW);
  lastState = current;
  return fell;
}

void stopAudio() {
  if (dfPlayerOk) {
    mp3.stop();
  }
  noTone(buzzer);
}

void playBuzzSound() {
  if (dfPlayerOk) {
    mp3.play(1); // /mp3/0001.mp3 ou 0001.mp3 conforme organização do SD
    Serial.println("PLAYED:1");
  } else {
    // Fallback: mantém o jogo vivo mesmo sem DFPlayer.
    tone(buzzer, 1200, 120);
    Serial.println("PLAYED:FALLBACK_BUZZER");
  }
}

void clearLeds() {
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);
}

void lockRound() {
  travado = true;
  Serial.println("LOCKED");
}

void unlockRound() {
  travado = false;
  clearLeds();
  stopAudio();
  Serial.println("UNLOCKED");
}

void resetHardwareState() {
  travado = false;
  clearLeds();
  stopAudio();
  Serial.println("RESET");
}

void printStatus() {
  Serial.print("STATUS:");
  Serial.println(travado ? "LOCKED" : "UNLOCKED");
  Serial.print("DFPLAYER:");
  Serial.println(dfPlayerOk ? "READY" : "ERROR");
}

void handleBuzzA() {
  if (travado) return;
  digitalWrite(led1, HIGH);
  digitalWrite(led2, LOW);
  travado = true;
  playBuzzSound();
  Serial.println("BT1PRESS");
}

void handleBuzzB() {
  if (travado) return;
  digitalWrite(led2, HIGH);
  digitalWrite(led1, LOW);
  travado = true;
  playBuzzSound();
  Serial.println("BT2PRESS");
}

void handleCommand(const char *cmd) {
  if (strcmp(cmd, "PING") == 0) {
    Serial.println("PONG");
    return;
  }

  if (strcmp(cmd, "STATUS") == 0) {
    printStatus();
    return;
  }

  if (strcmp(cmd, "LOCK") == 0) {
    lockRound();
    return;
  }

  if (strcmp(cmd, "UNLOCK") == 0) {
    unlockRound();
    return;
  }

  if (strcmp(cmd, "RESET_HW") == 0 || strcmp(cmd, "RESET") == 0) {
    resetHardwareState();
    return;
  }

  if (strcmp(cmd, "LED1_ON") == 0) {
    digitalWrite(led1, HIGH);
    Serial.println("LED1_ON_OK");
    return;
  }

  if (strcmp(cmd, "LED2_ON") == 0) {
    digitalWrite(led2, HIGH);
    Serial.println("LED2_ON_OK");
    return;
  }

  if (strcmp(cmd, "LEDS_OFF") == 0) {
    clearLeds();
    Serial.println("LEDS_OFF_OK");
    return;
  }

  if (strcmp(cmd, "PLAY_BUZZ") == 0) {
    playBuzzSound();
    return;
  }

  if (strcmp(cmd, "STOP_AUDIO") == 0) {
    stopAudio();
    Serial.println("AUDIO_STOPPED");
    return;
  }

  if (strncmp(cmd, "VOLUME:", 7) == 0) {
    int volume = atoi(cmd + 7);
    if (volume < 0) volume = 0;
    if (volume > 30) volume = 30;

    if (dfPlayerOk) {
      mp3.volume(volume);
      Serial.print("VOLUME:");
      Serial.println(volume);
    } else {
      Serial.println("DFPLAYER_ERROR");
    }
    return;
  }

  Serial.print("ERROR:UNKNOWN_COMMAND:");
  Serial.println(cmd);
}

void readSerialCommands() {
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\r') continue;

    if (c == '\n') {
      commandBuffer[commandIndex] = '\0';
      if (commandIndex > 0) {
        handleCommand(commandBuffer);
      }
      commandIndex = 0;
      return;
    }

    if (commandIndex < sizeof(commandBuffer) - 1) {
      commandBuffer[commandIndex++] = c;
    } else {
      commandIndex = 0;
      Serial.println("ERROR:COMMAND_TOO_LONG");
    }
  }
}

// ─── Setup ──────────────────────────────────────────────────────
void setup() {
  pinMode(led1,   OUTPUT);
  pinMode(led2,   OUTPUT);
  pinMode(buzzer, OUTPUT);

  pinMode(btn1, INPUT_PULLUP);
  pinMode(btn2, INPUT_PULLUP);
  pinMode(btn3, INPUT_PULLUP);

  clearLeds();
  noTone(buzzer);

  Serial.begin(9600);
  mp3Serial.begin(9600);

  Serial.println("ARDUINO_READY");

  if (!mp3.begin(mp3Serial)) {
    // Não trava o jogo se o DFPlayer falhar.
    dfPlayerOk = false;
    Serial.println("DFPLAYER_ERROR");
  } else {
    dfPlayerOk = true;
    mp3.volume(25); // 0–30
    Serial.println("DFPLAYER_READY");
  }

  printStatus();
}

// ─── Loop ───────────────────────────────────────────────────────
void loop() {
  readSerialCommands();

  bool resetPressed = pressedEdge(btn3, lastBtn3State);
  if (resetPressed && debounceReady()) {
    resetHardwareState();
    return;
  }

  if (!travado) {
    bool bPressed = pressedEdge(btn2, lastBtn2State);
    if (bPressed && debounceReady()) {
      handleBuzzB();
      return;
    }

    bool aPressed = pressedEdge(btn1, lastBtn1State);
    if (aPressed && debounceReady()) {
      handleBuzzA();
      return;
    }
  } else {
    // Mesmo travado, atualiza os estados anteriores para evitar edge falso após UNLOCK.
    pressedEdge(btn1, lastBtn1State);
    pressedEdge(btn2, lastBtn2State);
  }
}
