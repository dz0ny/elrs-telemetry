import { DesktopOutlined, PieChartOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Space, theme } from "antd";

import React, { useContext, useEffect, useState } from "react";

import type { MenuProps } from "antd";
import OpenLayers, { MapContext, MapContextProvider } from "./components/OpenLayers";
import { RiBluetoothConnectFill, RiBluetoothConnectLine, RiMap2Fill } from "react-icons/ri";
import { useELRSInterface } from "./hooks/useELRS";
import MenuItem from "antd/es/menu/MenuItem";
import SubMenu from "antd/es/menu/SubMenu";
const { Header, Content, Footer, Sider } = Layout;
import { Switch } from "antd";
import { InputNumber } from 'antd';

type MenuItem = Required<MenuProps>["items"][number];

const App: React.FC = () => {
  const elrs = useELRSInterface();
  const mapContext = useContext(MapContext);
  const [osmCheck, setOsmCheck] = useState<boolean>(false);
  const [streetCheck, setStreetCheck] = useState<boolean>(false);
  const [ortoCheck, setOrtoCheck] = useState<boolean>(false);
  const [ortoSICheck, setOrtoSICheck] = useState<boolean>(false);
  const [airCheck, setAirCheck] = useState<boolean>(false);
  const [gridCheck, setGridCheck] = useState<boolean>(false);
  const [waterCheck, setWaterCheck] = useState<boolean>(false);

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  function getLayer(id: number) {
    const layer = mapContext.map?.getAllLayers()[id - 1];
    return layer;
  }

  function isVisible(id: number): boolean {
    return getLayer(id)?.getVisible() || false;
  }

  function toggleLayer(id: number) {
    const mainLayers = [1, 2, 3, 4];

    // only toggle
    if (!mainLayers.includes(id)) {
      getLayer(id)?.setVisible(!isVisible(id));
      return;
    }

    // toggle and hide other layers
    for (const idl of mainLayers) {
      if (idl == id) {
        getLayer(id)?.setVisible(!isVisible(id));
      } else {
        getLayer(idl)?.setVisible(false);
      }
    }

    mapContext.map?.render();
  }

  function onWaterChange(value: number | null) {
    localStorage.voda = value;
    const l = getLayer(6);
    l?.changed();
    l?.getSource()?.changed();
  };

  mapContext.map?.on("postrender", (_) => {
    setOsmCheck(isVisible(1));
    setStreetCheck(isVisible(2));
    setOrtoCheck(isVisible(3));
    setOrtoSICheck(isVisible(4));
    setAirCheck(isVisible(5));
    setGridCheck(isVisible(7));
    setWaterCheck(isVisible(6));
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className='site-layout'>
        <Sider style={{ padding: 2, background: colorBgContainer }} collapsed={true}>
          <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column", height: "100%" }}>
            <div>
              <Menu theme='light' mode='vertical' defaultSelectedKeys={["map"]} selectable={true}>

                <SubMenu icon={<RiMap2Fill />} title='Map' key={"map"}
                  // @ts-ignore
                  onClick={(e) => e?.stopPropagation()}
                >
                  <Menu.ItemGroup title='Maps'>
                    <Menu.Item key='map:1'>
                      <Switch
                        checked={osmCheck}
                        onChange={(_) => toggleLayer(1)}
                        checkedChildren='OpenStreetMap'
                        unCheckedChildren='OpenStreetMap'
                      />
                    </Menu.Item>
                    <Menu.Item key='map:2'>
                      <Switch
                        checked={streetCheck}
                        onChange={(_) => toggleLayer(2)}
                        checkedChildren='Street ArcGIS'
                        unCheckedChildren='Street ArcGIS'
                      />
                    </Menu.Item>
                    <Menu.Item key='map:3'>
                      <Switch
                        checked={ortoCheck}
                        onChange={(_) => toggleLayer(3)}
                        checkedChildren='Ortophoto ArcGIS'
                        unCheckedChildren='Ortophoto ArcGIS'
                      />
                    </Menu.Item>
                    <Menu.Item key='map:4'>
                      <Switch
                        checked={ortoSICheck}
                        onChange={(_) => toggleLayer(4)}
                        checkedChildren='Ortophoto Slovenia'
                        unCheckedChildren='Ortophoto Slovenia'
                      />
                    </Menu.Item>
                  </Menu.ItemGroup>
                  <Menu.ItemGroup title='Layers'>
                    <Menu.Item key='map:5'>
                      <Switch
                        checked={airCheck}
                        onChange={(_) => toggleLayer(5)}
                        checkedChildren='Hide Airspace'
                        unCheckedChildren='Show Airspace'
                      />
                    </Menu.Item>
                    <Menu.Item key='map:6'>
                      <Switch
                        checked={waterCheck}
                        onChange={(_) => toggleLayer(6)}
                        checkedChildren='Hide Water'
                        unCheckedChildren='Show Water'
                      />
                      <InputNumber disabled={!waterCheck} min={1} max={2500} defaultValue={localStorage.voda} onChange={onWaterChange} />
                    </Menu.Item>
                    <Menu.Item key='map:7'>
                      <Switch
                        checked={gridCheck}
                        onChange={(_) => toggleLayer(7)}
                        checkedChildren='Hide Grid'
                        unCheckedChildren='Show Grid'
                      />
                    </Menu.Item>
                  </Menu.ItemGroup>
                </SubMenu>
              </Menu>
            </div>
            <div>
              <Menu theme='light' selectable={elrs.isConnected}>
                {elrs.isConnected ? (
                  <MenuItem
                    danger={true}
                    key='Connect'
                    onClick={elrs.disconnect}
                    itemIcon={<RiBluetoothConnectLine />}
                    title='Disconnect'
                  />
                ) : (
                  <MenuItem
                    danger={false}
                    key='Connect'
                    onClick={elrs.connect}
                    itemIcon={<RiBluetoothConnectFill />}
                    title='Connect'
                  />
                )}
              </Menu>
            </div>
          </div>
        </Sider>
        <Content>
          <OpenLayers />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
