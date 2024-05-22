// components/navbar.tsx

import Image from "next/image";
import React from "react";
import { HamburgerIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Menu, MenuButton, MenuList, useDisclosure, Stack, Text, HStack } from '@chakra-ui/react'
import { LPSearchBar } from "./lpSearchBar";
  
interface NavLinkProps {
    children: React.ReactNode
    link: string
}
  
const Links = [{'name': 'Trades', 'link': '/trades'}, {'name': 'Pairs', 'link': '/pair'}]
  
const NavLink = (props: NavLinkProps) => {
    return (
        <Box as="a" px={5} py={1} href={props.link}>
            {props.children}
        </Box>
    )
}

export const Navbar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Box px={4}>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
                <IconButton
                    size={'md'}
                    colorScheme={"blackAlpha"}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={'Open Menu'}
                    display={{ md: 'none' }}
                    onClick={isOpen ? onClose : onOpen}
                />
                <Box>
                    <HStack as="a" href="/">
                        <Image src="/favicon.ico" alt="Penumbra Logo" width={35} height={35}/>
                        <Text fontWeight={"bold"}>Dex Explorer</Text>
                    </HStack>
                </Box>
                <HStack as={'nav'} spacing={4} display={{base: 'none', md: 'flex'}}>
                    {Links.map((x) => (<NavLink key={x.name} link={x.link}>{x.name}</NavLink>))}
                    <Flex paddingLeft={10} display={{base: 'none', md: 'flex'}}>
                        <LPSearchBar/>
                    </Flex>
                </HStack>
                <Flex alignItems={'center'}  display={{md: 'none'}}>
                    <Menu>
                        <MenuButton
                            rounded={'full'}
                            cursor={'pointer'}
                            minW={0}>
                            {<SearchIcon/>}
                        </MenuButton>
                        <MenuList>
                            <LPSearchBar/>
                        </MenuList>
                    </Menu>
                </Flex>
            </Flex>

            {isOpen ? (
                <Box pb={4} display={{md: 'none'}}>
                    <Stack as={'nav'} spacing={4}>
                        {Links.map((x) => (<NavLink key={x.name} link={x.link}>{x.name}</NavLink>))}
                    </Stack>
                </Box>
            ) : null}
        </Box>
    )
}
