import React, { FC, useState } from "react";
import { Box, Center, Stack, Button, AspectRatio, Grid, GridItem, chakra } from "@chakra-ui/react";

import { ELRS } from "./hooks/useELRS";

interface UIProps {
  elrs: ELRS;
}

const UI: FC<UIProps> = ({ elrs }): JSX.Element => {
  return (
    <>
      {elrs.isConnected ? (
        <Button onClick={elrs.disconnect} colorScheme='teal'>
          Disconnect
        </Button>
      ) : (
        <Button onClick={elrs.connect} colorScheme='teal'>
          Connect
        </Button>
      )}
    </>
  );
};

export default UI;
