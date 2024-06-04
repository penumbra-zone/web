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
      // TODO: Massage on mobile
      <form onSubmit={onSearch}>
        <Input
          placeholder="Search by Liquidity Position ID"
          width={"37.5em"}
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
    // Trivial sanitation now, should replace with regex for lpId
    return input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{} ]/g, "");
}
