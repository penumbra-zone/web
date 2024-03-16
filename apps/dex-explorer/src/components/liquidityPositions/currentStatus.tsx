import React, { useEffect, useState } from "react";
import {
  VStack,
  Text,
  Badge,
  HStack,
  Image,
  Avatar,
} from "@chakra-ui/react";
import {
  Position,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { fromBaseUnit } from "../../utils/math/hiLo";
import { uint8ArrayToBase64 } from "../../utils/math/base64";
import { tokenConfigMapOnInner, Token } from "../../constants/tokenConstants";
import { fetchToken } from "../../utils/token/tokenFetch";
import BigNumber from "bignumber.js";
import { CopyIcon } from "@radix-ui/react-icons";

interface CurrentLPStatusProps {
  nftId: string;
  position: Position;
}

const CurrentLPStatus = ({ nftId, position }: CurrentLPStatusProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(nftId).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // Hide popup after 1.5 seconds
    });
  };

  // First process position to human readable pieces

  // Get status
  const status = position.state;

  // https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.core.component.dex.v1#penumbra.core.component.dex.v1.PositionState.PositionStateEnum
  let statusText = "";
  switch (status?.state) {
    case 0:
      statusText = "Unspecified";
      break;
    case 1:
      statusText = "Open";
      break;
    case 2:
      statusText = "Closed";
      break;
    case 3:
      statusText = "Withdrawn";
      break;
    case 4:
      statusText = "Claimed";
      break;
    default:
      statusText = "Unknown";
  }

  // Get fee tier
  const feeTier = position!.phi!.component!.fee;

  const asset1 = position!.phi!.pair!.asset1;
  const asset2 = position!.phi!.pair!.asset2;

  // States for tokens
  const [asset1Token, setAsset1Token] = useState<Token>(
    {
      symbol: "UNKNOWN",
      decimals: 0,
      inner: "UNKNOWN",
      imagePath: "UNKNOWN",
    }
  );
  const [asset2Token, setAsset2Token] = useState<Token>(
    {
      symbol: "UNKNOWN",
      decimals: 0,
      inner: "UNKNOWN",
      imagePath: "UNKNOWN",
    }
  );
  const [assetError, setAssetError] = useState<string | undefined>();

  useEffect(() => {
    // Function to fetch tokens asynchronously
    const fetchTokens = async () => {
      try {
        const asset1 = position!.phi!.pair!.asset1;
        const asset2 = position!.phi!.pair!.asset2;

        if (asset1 && asset1.inner) {
          const fetchedAsset1Token = await fetchToken(asset1.inner);
          if (!fetchedAsset1Token) {
            setAssetError("Asset 1 token not found");
            throw new Error("Asset 1 token not found");
          }
          setAsset1Token(fetchedAsset1Token);
        }

        if (asset2 && asset2.inner) {
          const fetchedAsset2Token = await fetchToken(asset2.inner);
          if (!fetchedAsset2Token) {
            setAssetError("Asset 2 token not found");
            throw new Error("Asset 2 token not found");
          }
          setAsset2Token(fetchedAsset2Token);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTokens();
  }, [position]);

  if (!isLoading && (!asset1Token || !asset2Token)) {
    return <div>{`LP exists, but ${assetError}.`}</div>;
  }

  const reserves1 = fromBaseUnit(
    position!.reserves!.r1?.lo,
    position!.reserves!.r1?.hi,
    asset1Token.decimals
  );

  const reserves2 = fromBaseUnit(
    position!.reserves!.r2?.lo,
    position!.reserves!.r2?.hi,
    asset2Token.decimals
  );

  const p: BigNumber = fromBaseUnit(
    position!.phi!.component!.p!.lo,
    position!.phi!.component!.p!.hi,
    asset2Token.decimals
  );
  const q: BigNumber = fromBaseUnit(
    position!.phi!.component!.q!.lo,
    position!.phi!.component!.q!.hi,
    asset1Token.decimals
  );

  return (
    <>
      <VStack width={"100%"}>
        <HStack>
          <Text fontFamily={"monospace"}>{nftId}</Text>

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
                {`LP ID copied`}
              </div>
            )}
          </div>
        </HStack>
        <HStack width={"100%"} justifyContent={"center"} paddingTop={"1em"}>
          <HStack>
            <Badge colorScheme="blue">Status:</Badge>
            <Text>{statusText}</Text>
          </HStack>
          <HStack width={"10%"} />
          <HStack>
            <Badge colorScheme="orange">Fee tier:</Badge>
            <Text>{feeTier + "bps"}</Text>
          </HStack>
        </HStack>
        <VStack width={"100%"} padding="1em" alignItems={"left"}>
          {/* Asset 1 */}
          <HStack>
            <Avatar
              name={asset1Token.symbol}
              src={asset1Token.imagePath}
              size="sm"
              borderRadius="50%"
            />
            <Text fontFamily={"monospace"}>
              {`Sell ${Number.parseFloat(reserves1.toFixed(6))} ${
                asset1Token.symbol
              } @ ${Number.parseFloat(p.div(q).toFixed(6))} ${
                asset2Token.symbol
              } / ${asset1Token.symbol} `}
            </Text>
          </HStack>

          {/* Swap Icon*/}
          <HStack width={"100%"} justifyContent={"left"} paddingLeft=".15em">
            <Image
              src="/assets/icons/swap.svg"
              alt="swap"
              width="7"
              paddingTop=".2em"
              paddingBottom=".2em"
              sx={{
                transform: "rotate(90deg)",
              }}
            />
          </HStack>

          {/* Asset 2 */}
          <HStack>
            <Avatar
              name={asset2Token.symbol}
              src={asset2Token.imagePath}
              size="sm"
              borderRadius="50%"
            />
            <Text fontFamily={"monospace"}>
              {`Sell ${Number.parseFloat(reserves2.toFixed(6))} ${
                asset2Token.symbol
              } @ ${Number.parseFloat(q.div(p).toFixed(6))} ${
                asset1Token.symbol
              } / ${asset2Token.symbol} `}
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </>
  );
};

export default CurrentLPStatus;
