import React from 'react';
import { Box } from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { useLocation } from 'react-router-dom';
import SidebarBranding from './sidebar-branding.jsx';
import SidebarFooter from './sidebar-footer.jsx';
import { getActivePrimaryId, sidebarSections } from './nav-config.js';

const StyledSidebar = styled(Box)`
  top: 0;
  bottom: 0;
  overflow-y: auto;
  width: ${({ theme }) => theme.sizes.sidebarWidth};
  border-right: ${({ theme }) => theme.borders.default};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.sidebar};
  transition: left 0.25s ease-in-out;

  &.hidden {
    left: -${({ theme }) => theme.sizes.sidebarWidth};
  }

  &.visible {
    left: 0;
  }
`;

StyledSidebar.defaultProps = {
  position: ['absolute', 'absolute', 'absolute', 'absolute', 'initial'],
  zIndex: 50
};

export default function Sidebar({ isVisible }) {
  const location = useLocation();
  const activePrimaryId = getActivePrimaryId(location.pathname);
  const sections = sidebarSections[activePrimaryId] || [];

  return (
    <StyledSidebar className={isVisible ? 'visible' : 'hidden'} data-css="sidebar">
      <SidebarBranding />
      <Box flexGrow={1}>
        {sections.map((section) => (
          <Box key={section.label}>
            <SectionTitle>{section.label}</SectionTitle>
            <SectionList items={section.items} pathname={location.pathname} />
          </Box>
        ))}
      </Box>
      <SidebarFooter />
    </StyledSidebar>
  );
}

function SectionTitle({ children }) {
  return (
    <Box color="grey60" fontWeight="700" px="xl" pt="xl" pb="sm">
      {children}
    </Box>
  );
}

function SectionList({ items, pathname }) {
  return (
    <Box display="flex" flexDirection="column" gap="sm" px="lg">
      {items.map((item) => {
        const active = pathname.startsWith(item.href) || pathname === item.href;
        return (
          <Box
            as="a"
            bg={active ? 'filterBg' : 'transparent'}
            borderRadius="lg"
            color={active ? 'primary100' : 'grey80'}
            href={item.href}
            key={item.href}
            px="lg"
            py="sm"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <Box display="flex" flexDirection="column" gap="xs">
              <Box fontWeight={active ? '700' : '500'}>{item.label}</Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
