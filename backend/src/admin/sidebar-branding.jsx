import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';

const BrandLink = styled(Link)`
  display: block;
  padding: 20px 24px 12px;
  text-decoration: none;
`;

export default function SidebarBranding() {
  return (
    <BrandLink to="/admin">
      <Box
        borderBottom="1px solid"
        borderColor="grey20"
        pb="lg"
      >
        <Box alignItems="center" display="flex" gap="default" mb="sm">
          <Box
            alignItems="center"
            bg="primary100"
            borderRadius="lg"
            color="white"
            display="inline-flex"
            fontSize="20px"
            height="38px"
            justifyContent="center"
            width="38px"
          >
            🐰
          </Box>
          <Box>
            <Text color="grey100" fontWeight="700">兔兔视觉</Text>
            <Text color="grey60" fontSize="sm">运营后台 v2</Text>
          </Box>
        </Box>
        <Text color="grey60" fontSize="sm" lineHeight="lg">
          运营控制台
        </Text>
      </Box>
    </BrandLink>
  );
}
