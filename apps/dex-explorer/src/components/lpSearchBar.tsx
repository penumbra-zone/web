// components/lpSearchBar.tsx

import React, { useState } from "react";
import { Input, InputGroup, InputRightElement, IconButton } from "@chakra-ui/react";
import { SearchIcon } from '@chakra-ui/icons';

export const LPSearchBar = ({ isMobile = false }) => {
  const [LpId, setLpId] = useState("");

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedId = sanitizeInput(LpId)
    location.assign("/lp/" + sanitizedId)
  }

  return (
    <form onSubmit={onSearch} style={{ width: '100%' }}>
      <InputGroup size="md">
        <Input
          placeholder="Search by Liquidity Position ID"
          width={isMobile ? "100%" : "37.5em"}
          height={"2.5em"}
          fontSize={"0.8em"}
          value={LpId}
          onChange={(e) => setLpId(e.target.value)}
          pr={isMobile ? "4.5rem" : "1rem"}
          spellCheck={false}
        />
        {isMobile && (
          <InputRightElement width="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              aria-label="Search"
              icon={<SearchIcon />}
              type="submit"
            />
          </InputRightElement>
        )}
      </InputGroup>
    </form>
  );
}

const sanitizeInput = (input: string): string => {
  return input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{} ]/g, "");
}