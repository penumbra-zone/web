// components/lpSearchBar.tsx

import React, { useState } from "react";
import { Input } from "@chakra-ui/react";

export const LPSearchBar = () => {
  const [LpId, setLpId] = useState("");

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedId = sanitizeInput(LpId)
    location.assign("/lp/" + sanitizedId)
  }

  return (
    <form onSubmit={onSearch}>
      <Input
        placeholder="Search by Liquidity Position ID"
        width={"100%"}
        height={"2.5em"}
        fontSize={"0.8em"}
        value={LpId}
        spellCheck={false}
        onChange={(e) => setLpId(e.target.value)}
      />
    </form>
  );
}

const sanitizeInput = (input: string): string => {
  return input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{} ]/g, "");
}