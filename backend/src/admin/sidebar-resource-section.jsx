import React from 'react';
import { Box, Icon, Label, Text } from '@adminjs/design-system';
import { Link, useLocation } from 'react-router-dom';

const resourceLabels = {
  User: '创作者用户',
  AdminUser: '后台账号',
  TemplateCategory: '模板分类',
  Template: '模板',
  ContentReview: '审核记录',
  Asset: '素材资产',
  CommunityPost: '社区内容',
  GenerationJob: '生成任务',
  SubscriptionPlan: '订阅套餐',
  Subscription: '订阅关系',
  PaymentOrder: '支付订单',
  SystemSetting: '系统配置',
  AuditLog: '审计日志'
};

const groupLabels = {
  用户与会员: '用户与会员',
  系统与权限: '系统与权限',
  内容运营: '内容运营',
  生产运营: '生产运营',
  商业化: '商业化'
};

function ResourceLink({ href, label, active }) {
  return (
    <Box
      as={Link}
      bg={active ? 'filterBg' : 'transparent'}
      borderRadius="lg"
      color={active ? 'primary100' : 'grey80'}
      display="block"
      px="lg"
      py="sm"
      style={{ textDecoration: 'none' }}
      to={href}
    >
      <Text fontWeight={active ? '700' : '400'}>{label}</Text>
    </Box>
  );
}

export default function SidebarResourceSection({ resources }) {
  const location = useLocation();
  const visibleResources = (resources || []).filter(resource => resource.href && resource.navigation?.show !== false);

  const grouped = visibleResources.reduce((memo, resource) => {
    const groupName = resource.navigation?.name || '其他';
    if (!memo[groupName]) {
      memo[groupName] = {
        icon: resource.navigation?.icon,
        resources: []
      };
    }
    memo[groupName].resources.push(resource);
    return memo;
  }, {});

  return (
    <Box px="xl" py="lg">
      <Label mb="md" pl="lg" uppercase>资源导航</Label>
      <Box as="nav" display="flex" flexDirection="column" gap="lg">
        {Object.entries(grouped).map(([groupName, group]) => (
          <Box key={groupName}>
            <Box alignItems="center" color="grey60" display="flex" gap="default" mb="sm" px="lg">
              {group.icon ? <Icon icon={group.icon} /> : null}
              <Text fontWeight="700">{groupLabels[groupName] || groupName}</Text>
            </Box>
            <Box display="flex" flexDirection="column" gap="sm">
              {group.resources.map((resource) => (
                <ResourceLink
                  active={location.pathname.startsWith(resource.href)}
                  href={resource.href}
                  key={resource.id}
                  label={resourceLabels[resource.id] || resourceLabels[resource.name] || resource.name}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
