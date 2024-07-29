// components/navbar.tsx

import Image from "next/image";
import React from "react";
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, useDisclosure, Stack, Text, HStack, Center } from '@chakra-ui/react'
import { LPSearchBar } from "./lpSearchBar";

interface NavLinkProps {
    children: React.ReactNode
    link: string
}

const Links = [{ 'name': 'Trades', 'link': '/trades' }, { 'name': 'Pairs', 'link': '/pair' }]

const NavLink = (props: NavLinkProps) => {
    return (
        <Box as="a" px={5} py={1} href={props.link} fontFamily={"monospace"} fontWeight={"bold"}>
            {props.children}
        </Box>
    )
}

export const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Box px={4}>
            <Flex alignItems={'center'} justifyContent={'space-between'} paddingBottom="1em">
                <IconButton
                    size={'md'}
                    colorScheme={"blackAlpha"}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={'Open Menu'}
                    display={{ md: 'none' }}
                    onClick={isOpen ? onClose : onOpen}
                />
                <Center flex={1}>
                    <HStack as="a" href="/">
                        <Image src="/favicon.ico" alt="Penumbra Logo" width={35} height={35} />
                        <Text fontWeight={"bold"}>Dex Explorer</Text>
                    </HStack>
                </Center>
                <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                    {Links.map((x) => (<NavLink key={x.name} link={x.link} >{x.name}</NavLink>))}
                    <Flex paddingLeft={10}>
                        <LPSearchBar />
                    </Flex>
                </HStack>
                <Box display={{ md: 'none' }} width={10} /> {/* Placeholder for symmetry */}
            </Flex>

            {isOpen && (
                <Box pb={4} display={{ md: 'none' }}>
                    <Stack as={'nav'} spacing={4}>
                        {Links.map((x) => (<NavLink key={x.name} link={x.link}>{x.name}</NavLink>))}
                    </Stack>
                    <Box pt={4}>
                        <LPSearchBar />
                    </Box>
                </Box>
            )}
        </Box>
    )
}