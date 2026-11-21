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
  return parkingData;
}

export function connectMQTT() {
  const brokerUrl = MQTT_HOST.startsWith("mqtts://") || MQTT_HOST.startsWith("mqtt://")
    ? MQTT_HOST
    : `mqtts://${MQTT_HOST}:8883`;

  const client = mqtt.connect(brokerUrl, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 5000
  });

  client.on("connect", () => {
    console.log("MQTT Connected Successfully");

    client.subscribe("smartparking/status", (error) => {
      if (error) {
        console.error("MQTT Subscribe Error:", error.message);
      } else {
        console.log("Subscribed to smartparking/status");
      }
    });
  });

  client.on("message", (_topic, message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        parkingData = {
          ...parkingData,
          ...parsed
        };
        console.log("Parking Data Received:", parkingData);
      } else {
        console.error("Invalid MQTT Data: expected JSON object");
      }
    } catch (error) {
      console.error("Invalid MQTT Data:", error.message);
    }
  });

  client.on("error", (error) => {
    console.error("MQTT Error:", error.message);
  });

  return client;
}