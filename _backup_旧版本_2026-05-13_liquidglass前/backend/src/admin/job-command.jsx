import React from 'react';
import { Box, Text } from '@adminjs/design-system';
import {
  AdminPageShell,
  BulkActionBar,
  FeedList,
  FeedRow,
  InsightStrip,
  PanelCard,
  QuickActionGrid,
  ReasonGroupList,
  SelectableFeedList,
  StatGrid,
  TrendBars,
  statusLabel,
  statusTone,
  useAdminPage,
  useSelection
} from './shared.jsx';

const quickActions = [
  { label: '任务列表', href: '/admin/resources/GenerationJob/actions/list', icon: 'Activity' },
  { label: '素材资产', href: '/admin/resources/Asset/actions/list', icon: 'Image' },
  { label: '系统配置', href: '/admin/resources/SystemSetting/actions/list', icon: 'Settings' },
  { label: '审计日志', href: '/admin/resources/AuditLog/actions/list', icon: 'FileText' }
];

export default function JobCommandPage() {
  const { loading, error, notice, clearNotice, data, submit, submitting } = useAdminPage('jobCommand');
  const failedSelection = useSelection(data?.failedJobs || []);
  const activeSelection = useSelection(data?.activeJobs || []);

  async function retrySelectedJobs() {
    if (!failedSelection.selectedIds.length) return;
    await submit({
      action: 'retryJobs',
      ids: failedSelection.selectedIds
    });
    failedSelection.clear();
  }

  async function cancelSelectedJobs() {
    if (!activeSelection.selectedIds.length) return;
    await submit({
      action: 'cancelJobs',
      ids: activeSelection.selectedIds
    });
    activeSelection.clear();
  }

  return (
    <AdminPageShell
      actions={quickActions}
      description="把生成链路、失败重试、提供方状态和最近产出汇总到同一页，适合作为日常值班与异常跟踪入口。"
      eyebrow="任务指挥台"
      error={error}
      loading={loading}
      notice={notice}
      onDismissNotice={clearNotice}
      title="任务指挥台"
    >
      <StatGrid
        items={[
          { label: '排队中', value: data?.stats.queued ?? 0, note: '等待处理的任务数', icon: 'Clock', accent: 'orange' },
          { label: '执行中', value: data?.stats.running ?? 0, note: '当前正在跑的生成任务', icon: 'Play', accent: 'purple' },
          { label: '失败任务', value: data?.stats.failed ?? 0, note: '需要运营或技术关注的异常任务', icon: 'AlertCircle', accent: 'yellow' },
          { label: '成功率', value: `${data?.stats.successRate ?? 0}%`, note: '最近一批任务的总体成功表现', icon: 'CheckCircle', accent: 'mint' }
        ]}
      />

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.1fr 0.9fr']}>
        <PanelCard
          description="用 7 天趋势图观察任务成功、失败和取消的波动。"
          title="任务趋势图"
        >
          <TrendBars
            items={data?.trend || []}
            series={[
              { key: 'succeeded', label: '成功', color: '#1F8E77' },
              { key: 'failed', label: '失败', color: '#C20012' },
              { key: 'canceled', label: '取消', color: '#3040D6' }
            ]}
          />
        </PanelCard>

        <PanelCard
          description="把失败原因做聚类，而不是让运营在一堆 errorMessage 里逐条翻。"
          title="失败原因分组"
        >
          <ReasonGroupList items={data?.failureReasonGroups || []} />
        </PanelCard>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.15fr 1fr']}>
        <PanelCard
          description="失败任务会优先展示异常原因，便于决定重试还是取消。"
          title="异常任务队列"
        >
          <SelectableFeedList
            empty="当前没有失败任务。"
            items={data?.failedJobs || []}
            onToggle={failedSelection.toggle}
            onToggleAll={failedSelection.toggleAll}
            renderContent={(job) => (
              <FeedRow
                aside={job.createdAtLabel}
                badge={statusLabel(job.status)}
                body={job.errorMessage || '无错误详情'}
                key={job.id}
                subtitle={`${job.provider} · ${job.userNickname || job.userId}`}
                title={job.templateTitle || '自由生成任务'}
                tone={statusTone(job.status)}
              />
            )}
            selectedIds={failedSelection.selectedIds}
            titleLabel="失败任务"
          />
          <BulkActionBar
            approveLabel="批量重试"
            archiveLabel=""
            onApprove={retrySelectedJobs}
            onArchive={null}
            onRequestChanges={null}
            selectedCount={failedSelection.selectedCount}
            submitting={submitting}
          />
        </PanelCard>

        <Box display="flex" flexDirection="column" gap="xl">
          <PanelCard
            description="观察上游模型和内部任务调度的热度分布。"
            title="提供方热度"
          >
            <InsightStrip
              items={(data?.providerMix || []).map((item) => ({
                label: item.provider,
                value: `${item.count} 个任务`,
                note: `失败 ${item.failedCount} / 成功 ${item.succeededCount}`
              }))}
            />
          </PanelCard>

          <PanelCard
            description="看一下刚刚产出的素材，确认主链路是否稳定。"
            title="最近产出"
          >
            <FeedList
              empty="最近还没有新产出的素材。"
              items={data?.latestAssets || []}
              renderItem={(asset) => (
                <FeedRow
                  aside={asset.createdAtLabel}
                  badge={statusLabel(asset.reviewStatus)}
                  body={asset.prompt}
                  imageUrl={asset.imageUrl}
                  key={asset.id}
                  subtitle={asset.userNickname || asset.userId}
                  title={asset.title}
                  tone={statusTone(asset.reviewStatus)}
                />
              )}
            />
          </PanelCard>
        </Box>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1fr 1fr']}>
        <PanelCard description="值班同学最常关注的运行中任务。" title="运行中任务">
          <SelectableFeedList
            empty="当前没有运行中任务。"
            items={data?.activeJobs || []}
            onToggle={activeSelection.toggle}
            onToggleAll={activeSelection.toggleAll}
            renderContent={(job) => (
              <FeedRow
                aside={job.startedAtLabel || job.createdAtLabel}
                badge={statusLabel(job.status)}
                body={job.prompt}
                key={job.id}
                subtitle={`${job.provider} · ${job.userNickname || job.userId}`}
                title={job.templateTitle || '自由生成任务'}
                tone={statusTone(job.status)}
              />
            )}
            selectedIds={activeSelection.selectedIds}
            titleLabel="运行中任务"
          />
          <BulkActionBar
            approveLabel=""
            archiveLabel="批量取消"
            onApprove={null}
            onArchive={cancelSelectedJobs}
            onRequestChanges={null}
            selectedCount={activeSelection.selectedCount}
            submitting={submitting}
          />
        </PanelCard>

        <PanelCard description="按状态拆开看最近处理节奏。" title="任务节奏洞察">
          <InsightStrip
            items={[
              { label: '最近 24 小时成功', value: `${data?.timeline.successLast24h ?? 0}`, note: '帮助判断链路是否稳定' },
              { label: '最近 24 小时失败', value: `${data?.timeline.failedLast24h ?? 0}`, note: '快速定位是否有上游抖动' },
              { label: '最近 24 小时取消', value: `${data?.timeline.canceledLast24h ?? 0}`, note: '观察运营介入比例' }
            ]}
          />
          <Box mt="xl">
            <Text color="grey60">
              当前任务指挥台已经补上趋势图和失败原因分组。下一阶段如果继续升级，可以接入自动重试策略、异常告警和按模板/渠道维度的失败聚类。
            </Text>
          </Box>
        </PanelCard>
      </Box>
    </AdminPageShell>
  );
}
