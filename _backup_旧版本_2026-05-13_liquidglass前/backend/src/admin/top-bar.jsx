import React from 'react';
import { Box, Button, Icon, Text } from '@adminjs/design-system';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { primaryNavItems, getActivePrimaryId } from './nav-config.js';

function PrimaryNavLink({ href, icon, label, active }) {
  return (
    <Box
      as={Link}
      alignItems="center"
      bg={active ? 'primary100' : 'transparent'}
      border="1px solid"
      borderColor={active ? 'primary100' : 'grey20'}
      borderRadius="pill"
      color={active ? 'white' : 'grey80'}
      display="inline-flex"
      gap="sm"
      px="lg"
      py="sm"
      style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
      to={href}
    >
      <Icon icon={icon} size={14} />
      <Text fontWeight="700">{label}</Text>
    </Box>
  );
}

export default function TopBar({ toggleSidebar }) {
  const location = useLocation();
  const session = useSelector((state) => state.session);
  const paths = useSelector((state) => state.paths);
  const activePrimaryId = getActivePrimaryId(location.pathname);

  return (
    <Box
      alignItems="center"
      bg="white"
      borderBottom="1px solid"
      borderColor="grey20"
      display="flex"
      gap="xl"
      height="64px"
      px="xl"
    >
      <Box
        display={['inline-flex', 'inline-flex', 'none']}
        onClick={toggleSidebar}
        style={{ cursor: 'pointer' }}
      >
        <Icon icon="Menu" size={24} />
      </Box>

      <Box alignItems="center" display="flex" flex="1" gap="lg" overflowX="auto">
        {primaryNavItems.map((item) => (
          <PrimaryNavLink
            active={item.id === activePrimaryId}
            href={item.href}
            icon={item.icon}
            key={item.id}
            label={item.label}
          />
        ))}
      </Box>

      <Box alignItems="center" display="flex" gap="lg">
        {session?.email ? <Text color="grey60">{session.email}</Text> : null}
        {paths?.logoutPath ? (
          <Button
            as="a"
            href={paths.logoutPath}
            size="sm"
            variant="outlined"
          >
            退出登录
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
