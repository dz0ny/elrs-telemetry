import { DesktopOutlined, PieChartOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Space, theme } from "antd";
import React, { useState } from "react";

import type { MenuProps } from "antd";
import OpenLayers from "./components/OpenLayers";
import { RiBluetoothConnectFill, RiBluetoothConnectLine, RiMap2Fill } from "react-icons/ri";
import { useELRSInterface } from "./hooks/useELRS";
import MenuItem from "antd/es/menu/MenuItem";
const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const App: React.FC = () => {
  const elrs = useELRSInterface();
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout className='site-layout'>
        <Sider style={{ padding: 2, background: colorBgContainer }} collapsed={true}>
          <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column", height: "100%" }}>
            <div>
              <Menu theme='light'>
                <MenuItem itemIcon={<RiMap2Fill />} title='Map' />
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
