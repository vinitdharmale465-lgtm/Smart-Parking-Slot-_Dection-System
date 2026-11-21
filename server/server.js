
import mqtt from "mqtt";

const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

let parkingData = {
  free: 0,
  occupied: 0,
  full: false,
  gate: false,
  carsInside: 0,
  slots: [false, false, false, false]
};

export function getParkingData() {
  return {
    ...parkingData,
    slots: [...parkingData.slots]
  };
}

export function connectMQTT() {
  if (!MQTT_HOST || !MQTT_USERNAME || !MQTT_PASSWORD) {
    throw new Error("MQTT configuration is missing");
  }

  const brokerUrl = MQTT_HOST.startsWith("mqtts://")
    ? MQTT_HOST
    : `mqtts://${MQTT_HOST.replace(/:\d+$/, "")}:8883`;

  const client = mqtt.connect(brokerUrl, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 5000,
    connectTimeout: 30000
  });

  client.on("connect", () => {
    console.log("MQTT Connected Successfully");

    client.subscribe("smartparking/status", { qos: 0 }, (error) => {
      if (error) {
        console.error("MQTT Subscribe Error:", error.message);
      } else {
        console.log("Subscribed to smartparking/status");
      }
    });
  });

  client.on("message", (topic, message) => {
    try {
      const parsed = JSON.parse(message.toString());

      if (
        topic !== "smartparking/status" ||
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        console.error("Invalid MQTT message");
        return;
      }

      if (
        !Number.isFinite(parsed.free) ||
        !Number.isFinite(parsed.occupied) ||
        !Array.isArray(parsed.slots) ||
        parsed.slots.length !== 4 ||
        !parsed.slots.every(value => typeof value === "boolean")
      ) {
        console.error("Invalid parking data format");
        return;
      }

      parkingData = {
        free: parsed.free,
        occupied: parsed.occupied,
        full: Boolean(parsed.full),
        gate: Boolean(parsed.gate),
        carsInside: Number(parsed.carsInside) || 0,
        slots: [...parsed.slots]
      };

      console.log("Updated Parking Data:", JSON.stringify(parkingData));

    } catch (error) {
      console.error("Invalid MQTT Data:", error.message);
    }
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error.message);
  });

  client.on("reconnect", () => {
    console.log("MQTT Reconnecting...");
  });

  return client;
}
