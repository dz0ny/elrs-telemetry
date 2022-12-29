import React from "react";
import { Box, Flex, Heading, Button, Spacer, ButtonGroup, chakra } from "@chakra-ui/react";

import { useELRSInterface } from "./hooks/useELRS";
import UI from "./UI";
import Map from "./Map";

export default function App() {
  const elrs = useELRSInterface();

  return (
    <>
      <Flex minWidth='max-content' alignItems='center' gap='2'>
        <Box p='2'>
          <Heading size='md'>ELRS Telemetry</Heading>
        </Box>
        <Spacer />
        <ButtonGroup p={2} gap='2'>
          <UI elrs={elrs} />
        </ButtonGroup>
      </Flex>
      <chakra.section sx={{ flex: "1 0 auto" }} bg='blue.200'>
        <Map />
      </chakra.section>
    </>
  );
}
