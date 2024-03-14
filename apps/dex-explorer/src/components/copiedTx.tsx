import React, { FC, useState } from "react";
import { CopyIcon } from "@radix-ui/react-icons";
import { HStack } from "@chakra-ui/react";
import { testnetConstants } from "@/constants/configConstants";

interface CopyTxToClipboardProps {
  txHash: string;
  clipboardPopupText: string;
}

const CopyTxToClipboard: FC<CopyTxToClipboardProps> = ({
  txHash,
  clipboardPopupText,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // Hide popup after 1.5 seconds
    });
  };

  return (
    <HStack align={"center"} spacing={".5em"}>
      <a
        href={`${testnetConstants.cuiloaUrl}/transaction/${txHash}`}
        target="_blank"
        rel="noreferrer"
        style={{
          textDecoration: "underline",
          color: "var(--teal-700)",
          display: "flex",
          fontSize: "small",
          fontFamily: "monospace",
        }}
      >
        {txHash.length > 40
          ? `${txHash.substring(0, 20)}...${txHash.substring(
              txHash.length - 20
            )}`
          : txHash}
      </a>

      <div style={{ position: "relative", display: "inline-block" }}>
        <CopyIcon onClick={handleCopy} style={{ cursor: "pointer" }} />
        {isCopied && (
          <div
            style={{
              position: "absolute",
              bottom: "100%", // Align bottom of popup with top of the button
              left: "50%",
              transform: "translateX(-50%) translateY(-8px)", // Adjust Y translation for spacing
              padding: "8px",
              backgroundColor: "#4A5568", // Dark grayish-blue
              color: "white",
              borderRadius: "6px",
              fontSize: "14px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow
              zIndex: 1, // Ensure the popup is above other elements
              transition: "opacity 0.3s, transform 0.3s", // Smooth transition for both opacity and position
              opacity: 0.9, // Slightly transparent
              width: "10em",
              textAlign: "center",
              border: "3px solid #2D3748",
            }}
          >
            {clipboardPopupText}
          </div>
        )}
      </div>
    </HStack>
  );
};

export default CopyTxToClipboard;
