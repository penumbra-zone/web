// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// components/lpSearchBar.tsx

import React, { useState } from 'react';
import { Box, Input, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

export const LPSearchBar = ({ isMobile = false }) => {
  const [LpId, setLpId] = useState('');

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedId = sanitizeInput(LpId);
    location.assign('/lp/' + sanitizedId);
  };

  return (
    <Box as='form' onSubmit={onSearch} className='box-card'>
      <InputGroup size='md'>
        <Input
          placeholder='Search by Liquidity Position ID'
          width={isMobile ? '100%' : '37.5em'}
          fontSize={'1em'}
          value={LpId}
          onChange={e => setLpId(e.target.value)}
          p={6}
          spellCheck={false}
          border='none'
        />
        {isMobile && (
          <InputRightElement width='4.5rem'>
            <IconButton
              h='1.75rem'
              size='sm'
              aria-label='Search'
              icon={<SearchIcon />}
              type='submit'
            />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  );
};

const sanitizeInput = (input: string): string => {
  return input.replaceAll(/[&/\\#,+()$~%.^'":*?<>{} ]/g, '');
};
