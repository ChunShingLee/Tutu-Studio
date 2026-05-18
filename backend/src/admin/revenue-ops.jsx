import React from 'react';
import { Box, Text } from '@adminjs/design-system';
import {
  AdminPageShell,
  FeedList,
  FeedRow,
  InsightStrip,
  PanelCard,
  QuickActionGrid,
  RenewalCards,
  StatGrid,
  TrendBars,
  formatCurrency,
  ratio,
  statusLabel,
  statusTone,
  useAdminPage
} from './shared.jsx';

const quickActions = [
  { label: '套餐配置', href: '/admin/resources/SubscriptionPlan/actions/list', icon: 'Layers' },
  { label: '订阅列表', href: '/admin/resources/Subscription/actions/list', icon: 'CreditCard' },
  { label: '订单列表', href: '/admin/resources/PaymentOrder/actions/list', icon: 'ShoppingCart' },
  { label: '用户管理', href: '/admin/resources/User/actions/list', icon: 'Users' }
];

export default function RevenueOpsPage() {
  const { loading, error, notice, clearNotice, data } = useAdminPage('revenueOps');

  return (
    <AdminPageShell
      actions={quickActions}
      description="把套餐配置、订阅状态、待支付订单和收款表现聚到一个商业化工作台，方便运营、销售和财务协作。"
      eyebrow="商业化中台"
      error={error}
      loading={loading}
      notice={notice}
      onDismissNotice={clearNotice}
      title="商业化中台"
    >
      <StatGrid
        items={[
          { label: '活跃订阅', value: data?.stats.activeSubscriptions ?? 0, note: '当前有效订阅中的用户数量', icon: 'CreditCard', accent: 'orange' },
          { label: '待支付订单', value: data?.stats.pendingOrders ?? 0, note: '仍需跟进或催付的订单', icon: 'AlertCircle', accent: 'yellow' },
          { label: '累计已支付', value: formatCurrency(data?.stats.totalPaidCents ?? 0), note: '当前库中已确认支付的订单总额', icon: 'Wallet', accent: 'mint' },
          { label: '订阅转化率', value: ratio(data?.stats.conversionRate ?? 0), note: '活跃订阅用户占全部用户的比例', icon: 'TrendingUp', accent: 'purple' }
        ]}
      />

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.1fr 0.9fr']}>
        <PanelCard
          description="最近 7 天收入趋势，帮助你判断转化波动和收款回流节奏。"
          title="按天收入对比图"
        >
          <TrendBars
            items={data?.revenueTrend || []}
            series={[
              { key: 'currentPaidCents', label: '最近 7 天', color: '#1F8E77' },
              { key: 'previousPaidCents', label: '上一周期', color: '#3040D6' }
            ]}
          />
        </PanelCard>

        <PanelCard
          description="临近续费的订阅用户应当提前提醒或重点跟进。"
          title="续费提醒卡片"
        >
          <RenewalCards items={data?.renewalReminders || []} />
        </PanelCard>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.15fr 1fr']}>
        <PanelCard
          description="结合套餐分布和收入构成，快速判断当前主要增长来源。"
          title="套餐收入结构"
        >
          <InsightStrip
            items={(data?.planMix || []).map((plan) => ({
              label: plan.name,
              value: `${plan.activeSubscriptions} 个订阅`,
              note: `订单累计 ${formatCurrency(plan.paidCents)}`
            }))}
          />
        </PanelCard>

        <PanelCard
          description="按支付渠道看收入归因，帮助判断收款路径和运营引导效果。"
          title="渠道归因"
        >
          <InsightStrip
            items={(data?.channelMix || []).map((item) => ({
              label: item.channel === 'unknown' ? '未标记渠道' : item.channel,
              value: formatCurrency(item.paidCents),
              note: `${item.count} 笔支付订单`
            }))}
          />
        </PanelCard>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1fr 1fr']}>
        <PanelCard
          description="优先跟进待支付订单和临近到期订阅。"
          title="待处理商业动作"
        >
          <FeedList
            empty="当前没有待跟进商业事项。"
            items={data?.followUps || []}
            renderItem={(item) => (
              <FeedRow
                aside={item.meta}
                badge={item.badge}
                body={item.note}
                key={item.id}
                subtitle={item.subtitle}
                title={item.title}
                tone={item.tone}
              />
            )}
          />
        </PanelCard>

        <PanelCard description="最近支付成功的订单，帮助你快速确认收入回流。" title="最近支付">
          <FeedList
            empty="当前没有已支付订单。"
            items={data?.paidOrders || []}
            renderItem={(order) => (
              <FeedRow
                aside={order.paidAtLabel}
                badge={statusLabel(order.status)}
                body={formatCurrency(order.amountCents)}
                key={order.id}
                subtitle={`${order.userNickname || order.userId} · ${order.planName || order.planId || '未绑定套餐'}`}
                title={order.orderNo}
                tone={statusTone(order.status)}
              />
            )}
          />
        </PanelCard>

        <PanelCard description="最近新增或变更的订阅状态。" title="订阅动态">
          <FeedList
            empty="当前没有最近订阅变更。"
            items={data?.subscriptions || []}
            renderItem={(item) => (
              <FeedRow
                aside={item.renewalAtLabel}
                badge={statusLabel(item.status)}
                body={item.autoRenew ? '自动续费开启' : '自动续费关闭'}
                key={item.id}
                subtitle={item.userNickname || item.userId}
                title={item.planName || item.planId}
                tone={statusTone(item.status)}
              />
            )}
          />
        </PanelCard>
      </Box>

      <PanelCard
        description="商业化中台会长期服务运营和销售。后续可以继续补发票、渠道来源、退款原因和按周期收入趋势。"
        title="快捷入口"
      >
        <QuickActionGrid items={quickActions} />
        <Box mt="xl">
          <Text color="grey60">
            当前已经补上收入趋势和续费提醒卡片。下一步如果继续往商用品质推进，建议做渠道归因、应收款看板、发票流转和订阅生命周期分析。
          </Text>
        </Box>
      </PanelCard>
    </AdminPageShell>
  );
}
