import React from 'react';
import { Box, Icon, Label, Text } from '@adminjs/design-system';
import { Link, useLocation } from 'react-router-dom';

const pageLabels = {
  contentStudio: '内容中台',
  jobCommand: '任务指挥台',
  revenueOps: '商业化中台'
};

function SideLink({ href, icon, label, active }) {
  return (
    <Box
      as={Link}
      alignItems="center"
      bg={active ? 'filterBg' : 'transparent'}
      borderRadius="lg"
      color={active ? 'primary100' : 'grey80'}
      display="flex"
      gap="default"
      px="lg"
      py="md"
      style={{ textDecoration: 'none' }}
      to={href}
    >
      {icon ? <Icon icon={icon} /> : null}
      <Text fontWeight={active ? '700' : '400'}>{label}</Text>
    </Box>
  );
}

export default function SidebarPages({ pages }) {
  const location = useLocation();

  if (!pages?.length) return null;

  return (
    <Box px="xl" py="lg">
      <Label mb="md" pl="lg" uppercase>运营工作台</Label>
      <Box as="nav" display="flex" flexDirection="column" gap="sm">
        {pages.map((page) => (
          <SideLink
            active={location.pathname.includes(`/pages/${page.name}`)}
            href={`/admin/pages/${page.name}`}
            icon={page.icon}
            key={page.name}
            label={pageLabels[page.name] || page.name}
          />
        ))}
      </Box>
    </Box>
  );
}
