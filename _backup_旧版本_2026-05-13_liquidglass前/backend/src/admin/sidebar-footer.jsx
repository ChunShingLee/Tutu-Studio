import React from 'react';
import { Box, Text } from '@adminjs/design-system';

export default function SidebarFooter() {
  return (
    <Box color="grey60" data-css="sidebar-footer" mt="xl" px="xl" py="lg">
      <Box
        bg="filterBg"
        border="1px solid"
        borderColor="grey20"
        borderRadius="xl"
        p="lg"
      >
        <Text fontWeight="700" mb="sm">运营底座</Text>
        <Text lineHeight="lg">Fastify 5 · Prisma · PostgreSQL</Text>
        <Text lineHeight="lg">兔兔智能视觉创意设计工作台</Text>
      </Box>
    </Box>
  );
}
