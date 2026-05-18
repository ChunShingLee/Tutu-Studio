import React from 'react';
import { Box, Text } from '@adminjs/design-system';
import {
  AdminPageShell,
  FeedList,
  FeedRow,
  PanelCard,
  QuickActionGrid,
  StatGrid,
  formatDate,
  ratio,
  statusLabel,
  statusTone,
  useAdminPage
} from './shared.jsx';

const quickActions = [
  { label: '内容中台', href: '/admin/pages/contentStudio', icon: 'Layout' },
  { label: '任务指挥台', href: '/admin/pages/jobCommand', icon: 'Activity' },
  { label: '商业化中台', href: '/admin/pages/revenueOps', icon: 'CreditCard' },
  { label: '用户管理', href: '/admin/resources/User/actions/list', icon: 'Users' }
];

export default function OperationsDashboard() {
  const { loading, error, data } = useAdminPage();
  const metrics = data?.metrics || {};

  return (
    <AdminPageShell
      actions={quickActions}
      description="v2 版本把运营工作拆成了专用工作台：首页更像驾驶舱，用来快速判断今天该盯模板、任务、审核还是商业化。"
      eyebrow="运营驾驶舱"
      error={error}
      loading={loading}
      title="兔兔视觉运营驾驶舱"
    >
      <StatGrid
        items={[
          { label: '总用户数', value: metrics.users ?? 0, note: '当前创作者与商业客户总量', icon: 'Users', accent: 'orange' },
          { label: '模板总量', value: metrics.templates ?? 0, note: '包含草稿、审核中与已发布模板', icon: 'Layout', accent: 'purple' },
          { label: '今日任务', value: metrics.jobsToday ?? 0, note: '今天新提交的生成任务', icon: 'Activity', accent: 'yellow' },
          { label: '订阅转化', value: ratio(metrics.conversionRate ?? 0), note: '活跃订阅用户占比', icon: 'TrendingUp', accent: 'cyan' }
        ]}
      />

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.2fr 1fr']}>
        <PanelCard
          description="把后台的主要工作流折叠成几个入口，帮助团队快速找到处理路径。"
          title="今日工作流"
        >
          <QuickActionGrid items={quickActions} />
          <Box mt="xl">
            <Text color="grey60">
              当前后台已经从通用 CRUD 壳层升级成工作台结构。接下来如果继续打磨商用品质，建议补批量操作、图表趋势和岗位化首页。
            </Text>
          </Box>
        </PanelCard>

        <PanelCard
          description="今天最值得优先关注的几类事项。"
          title="运营提示"
        >
          <FeedList
            empty="当前没有需要特别提示的运营事项。"
            items={data?.spotlights || []}
            renderItem={(item) => (
              <FeedRow
                badge={item.badge}
                body={item.body}
                key={item.id}
                subtitle={item.subtitle}
                title={item.title}
                tone={item.tone}
              />
            )}
          />
        </PanelCard>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.2fr 1fr 1fr']}>
        <PanelCard description="最近完成或失败的任务，帮助值班同学快速判断链路稳定性。" title="最近任务">
          <FeedList
            empty="当前没有最近任务。"
            items={data?.recentJobs || []}
            renderItem={(job) => (
              <FeedRow
                aside={job.createdAtLabel}
                badge={job.statusLabel}
                body={job.prompt}
                key={job.id}
                subtitle={job.userNickname || job.userId}
                title={job.templateTitle || '自由生成任务'}
                tone={job.tone}
              />
            )}
          />
        </PanelCard>

        <PanelCard description="需要运营或内容同学尽快处理的审核项。" title="审核队列">
          <FeedList
            empty="当前没有待处理审核项。"
            items={data?.reviewQueue || []}
            renderItem={(item) => (
              <FeedRow
                aside={item.updatedAtLabel}
                badge={item.statusLabel}
                body={item.summary || '暂无审核备注'}
                key={`${item.entityType}-${item.entityId}`}
                subtitle={item.entityTypeLabel}
                title={item.title}
                tone={item.tone}
              />
            )}
          />
        </PanelCard>

        <PanelCard description="所有关键写操作都会沉淀到这里。" title="最近审计">
          <FeedList
            empty="当前没有最近审计动作。"
            items={data?.auditLogs || []}
            renderItem={(log) => (
              <FeedRow
                aside={log.createdAtLabel}
                body={log.entityLabel}
                key={log.id}
                subtitle={log.actorNickname || 'system'}
                title={log.actionLabel}
              />
            )}
          />
        </PanelCard>
      </Box>
    </AdminPageShell>
  );
}
