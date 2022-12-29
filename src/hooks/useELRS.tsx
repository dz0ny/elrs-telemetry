import * as React from "react";

export const CSRFPAcketCaracteristic = 0x2bbd;
// https://github.com/CapnBry/CRServoF/blob/master/lib/CrsfSerial/CrsfSerial.cpp
enum FrameAddress {
  BROADCAST = 0x00,
  USB = 0x10,
  TBS_CORE_PNP_PRO = 0x80,
  RESERVED1 = 0x8a,
  CURRENT_SENSOR = 0xc0,
  GPS = 0xc2,
  TBS_BLACKBOX = 0xc4,
  FLIGHT_CONTROLLER = 0xc8,
  RESERVED2 = 0xca,
  RACE_TAG = 0xcc,
  RADIO_TRANSMITTER = 0xea,
  CRSF_RECEIVER = 0xec,
  CRSF_TRANSMITTER = 0xee
}

enum FrameSize {
  GPS_PAYLOAD = 15,
  BATTERY_SENSOR_PAYLOAD = 8,
  LINK_STATISTICS_PAYLOAD = 10,
  RC_CHANNELS_PAYLOAD = 22, // 11 bits per channel * 16 channels = 22 bytes.
  ATTITUDE_PAYLOAD = 6
}

enum FrameType {
  GPS = 0x02,
  BATTERY_SENSOR = 0x08,
  LINK_STATISTICS = 0x14,
  OPENTX_SYNC = 0x10,
  RADIO_ID = 0x3a,
  RC_CHANNELS_PACKED = 0x16,
  ATTITUDE = 0x1e,
  FLIGHT_MODE = 0x21,

  DEVICE_PING = 0x28,
  DEVICE_INFO = 0x29,
  PARAMETER_SETTINGS_ENTRY = 0x2b,
  PARAMETER_READ = 0x2c,
  PARAMETER_WRITE = 0x2d,
  COMMAND = 0x32
}

export interface CSRFHeader {
  address: FrameAddress; // 0 > uint8
  size: number; // 1 > uint8
  type: FrameType; // 2 > uint8
}

export interface CSRF {
  header: CSRFHeader;
  isValid: boolean;
  payload: DataView;
}

export interface ELRS {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export const useELRSInterface = (): ELRS => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [csrf, setCsrf] = React.useState<CSRF>();

  let server: BluetoothRemoteGATTServer | undefined;

  const disconnect = async () => {
    await server?.disconnect();
    setIsConnected(Boolean(server?.connected));
  };

  const connect = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          namePrefix: "ExpressLRS"
        },
        { services: ["location_and_navigation"] }
      ]
    });
    if (!device) {
      console.error("Failed to connect to device.");
      setIsConnected(Boolean(server?.connected));
      return;
    }
    device.addEventListener("gattserverdisconnected", () => {
      setIsConnected(false);
    });

    server = await device.gatt?.connect();

    if (!server) {
      console.error("Failed to connect to server");
      setIsConnected(false);
      return;
    }

    // CSRF Service
    const service = await server.getPrimaryService("location_and_navigation");

    if (!service) {
      console.error("Failed to connect to service.");
      setIsConnected(Boolean(server?.connected));
      return;
    }

    const csrfPacket = await service.getCharacteristic(CSRFPAcketCaracteristic);
    csrfPacket.startNotifications();
    csrfPacket.addEventListener("characteristicvaluechanged", (e: Event) => {
      let packet = parseCSRF((e.target as any).value);
      setCsrf(packet);
      console.info(
        FrameAddress[packet?.header.address],
        FrameType[packet?.header.type],
        packet?.isValid,
        packet?.payload
      );
    });
    setIsConnected(Boolean(server?.connected));
  };

  return {
    connect,
    disconnect,
    isConnected
  };
};

function parseCSRF(packet: DataView): CSRF {
  const payload = packet.buffer.slice(2); // with crc + type, so that can be used to verfiy size
  const size = packet.getUint8(1);
  const data = new DataView(payload.slice(2)); // only payload, without type(1) + crc(2)
  return {
    header: {
      address: packet.getUint8(0),
      size: size,
      type: packet.getUint8(2)
    },
    isValid: size == payload.byteLength,
    payload: data
  };
}
