import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiClient } from 'adminjs';
import {
  Badge,
  Box,
  Button,
  H2,
  H3,
  H4,
  H5,
  Icon,
  Illustration,
  Loader,
  MessageBox,
  Text
} from '@adminjs/design-system';

const api = new ApiClient();

const toneMap = {
  success: 'success',
  warning: 'info',
  error: 'danger',
  info: 'primary',
  neutral: 'light'
};

const colorMap = {
  orange: 'primary100',
  orangeSoft: '#FFF4EF',
  purple: 'accent',
  yellow: '#E19A19',
  cyan: '#008DA6',
  mint: '#1F8E77',
  dark: 'grey100'
};

export function useAdminPage(pageName) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = pageName
        ? await api.getPage({ pageName })
        : await api.getDashboard();

      setData(response.data || response);
      setError('');
      return response.data || response;
    } catch (err) {
      const message = err?.message || '页面数据加载失败';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pageName]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const response = pageName
          ? await api.getPage({ pageName })
          : await api.getDashboard();

        if (!mounted) return;
        setData(response.data || response);
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || '页面数据加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [pageName]);

  const submit = useCallback(async (payload, requestOptions = {}) => {
    if (!pageName) {
      throw new Error('dashboard does not support mutations');
    }

    setSubmitting(true);
    try {
      const response = await api.getPage({
        pageName,
        method: 'post',
        data: payload,
        ...requestOptions
      });
      const nextData = response.data || response;
      setData(nextData);
      setError('');
      if (nextData.notice) {
        setNotice(nextData.notice);
      }
      return nextData;
    } catch (err) {
      const message = err?.message || '提交操作失败';
      setNotice({ message, type: 'error' });
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [pageName]);

  return {
    loading,
    submitting,
    error,
    notice,
    data,
    reload: load,
    submit,
    clearNotice: () => setNotice(null),
    setNotice
  };
}

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions = [],
  loading,
  error,
  notice,
  onDismissNotice,
  children
}) {
  if (loading) {
    return (
      <Box alignItems="center" display="flex" flexDirection="column" gap="xl" py="xxl">
        <Loader />
        <Text color="grey60">正在加载后台工作台…</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        alignItems="center"
        bg="white"
        border="1px solid"
        borderColor="danger"
        borderRadius="xl"
        boxShadow="card"
        display="flex"
        flexDirection="column"
        gap="xl"
        p="xxl"
      >
        <Illustration variant="Rocket" width={220} />
        <H4>工作台暂时不可用</H4>
        <Text color="grey60">{error}</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="xxl">
      {notice ? (
        <MessageBox
          message={notice.message}
          onCloseClick={onDismissNotice}
          variant={notice.type === 'error' ? 'danger' : notice.type === 'info' ? 'info' : 'success'}
        />
      ) : null}
      <HeroPanel eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {children}
    </Box>
  );
}

export function HeroPanel({ eyebrow, title, description, actions = [] }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="grey20"
      borderRadius="xl"
      boxShadow="card"
      display="flex"
      flexDirection={['column', 'column', 'row']}
      gap="xxl"
      justifyContent="space-between"
      overflow="hidden"
      p="xxl"
      position="relative"
    >
      <Box
        bg="filterBg"
        height="180px"
        left="0"
        position="absolute"
        top="0"
        width="100%"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 56%, 0 100%)',
          opacity: 0.45
        }}
      />
      <Box maxWidth={620} position="relative" zIndex={1}>
        <Text color="primary100" fontWeight="700" letterSpacing="0.08em" mb="lg" textTransform="uppercase">{eyebrow}</Text>
        <H2 marginBottom="xl">{title}</H2>
        <Text color="grey80" lineHeight="xl">{description}</Text>
      </Box>
      {actions.length ? (
        <QuickActionGrid items={actions} minWidth={['100%', 'auto']} />
      ) : null}
    </Box>
  );
}

export function StatGrid({ items = [], columns = 4 }) {
  return (
    <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', `repeat(${columns}, minmax(0, 1fr))`]}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </Box>
  );
}

export function StatCard({ label, value, note, icon, accent = 'orange' }) {
  const accentColor = colorMap[accent] || accent;
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="grey20"
      borderRadius="xl"
      boxShadow="card"
      display="flex"
      flexDirection="column"
      gap="lg"
      p="xl"
    >
      <Box alignItems="center" display="flex" justifyContent="space-between">
        <Text color="grey60" fontWeight="600">{label}</Text>
        <Box
          alignItems="center"
          bg={accentColor}
          borderRadius="circle"
          color="white"
          display="inline-flex"
          height="40px"
          justifyContent="center"
          width="40px"
        >
          <Icon icon={icon} />
        </Box>
      </Box>
      <Box>
        <H3 marginBottom="default">{value}</H3>
        <Text color="grey60">{note}</Text>
      </Box>
    </Box>
  );
}

export function PanelCard({ title, description, actions, children, minHeight }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="grey20"
      borderRadius="xl"
      boxShadow="card"
      display="flex"
      flexDirection="column"
      gap="xl"
      minHeight={minHeight}
      p="xl"
    >
      <Box alignItems="flex-start" display="flex" justifyContent="space-between" gap="lg">
        <Box>
          <H4 marginBottom="sm">{title}</H4>
          {description ? <Text color="grey60">{description}</Text> : null}
        </Box>
        {actions ? actions : null}
      </Box>
      {children}
    </Box>
  );
}

export function FeedList({ items = [], empty, renderItem, gap = 'lg' }) {
  if (!items.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={gap}>
      {items.map(renderItem)}
    </Box>
  );
}

export function FeedRow({ title, subtitle, body, badge, tone = 'neutral', aside, imageUrl }) {
  return (
    <Box
      borderBottom="1px solid"
      borderColor="grey20"
      display="grid"
      gap="lg"
      gridTemplateColumns={imageUrl ? ['72px 1fr', '72px 1fr', '84px 1fr'] : ['1fr']}
      pb="lg"
    >
      {imageUrl ? <ImageThumb alt={title} src={imageUrl} /> : null}
      <Box display="flex" flexDirection="column" gap="sm">
        <Box alignItems="center" display="flex" justifyContent="space-between" gap="lg">
          <H5>{title}</H5>
          {badge ? <StatusBadge tone={tone}>{badge}</StatusBadge> : null}
        </Box>
        {subtitle ? <Text color="grey60">{subtitle}</Text> : null}
        {body ? <Text>{body}</Text> : null}
        {aside ? <Text color="grey60">{aside}</Text> : null}
      </Box>
    </Box>
  );
}

export function PreviewReviewBoard({
  items = [],
  selectedIds = [],
  onToggle,
  onToggleAll,
  onPreview,
  empty,
  titleLabel = '待审核模板'
}) {
  if (!items.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  const selectedSet = new Set(selectedIds);
  const allSelected = items.length > 0 && items.every(item => selectedSet.has(item.id));

  return (
    <Box display="flex" flexDirection="column" gap="xl">
      <Box alignItems="center" display="flex" justifyContent="space-between" gap="lg">
        <Text color="grey60">{titleLabel}</Text>
        <Button
          onClick={() => onToggleAll?.(!allSelected)}
          size="sm"
          variant="outlined"
        >
          {allSelected ? '取消全选' : '全选当前列表'}
        </Button>
      </Box>
      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', 'repeat(2, minmax(0, 1fr))']}>
        {items.map((item) => (
          <PreviewCard
            item={item}
            key={item.id}
            onPreview={() => onPreview?.(item)}
            onToggle={() => onToggle?.(item.id)}
            selected={selectedSet.has(item.id)}
          />
        ))}
      </Box>
    </Box>
  );
}

export function PreviewCard({ item, selected, onToggle, onPreview }) {
  return (
    <Box
      bg={selected ? 'filterBg' : 'white'}
      border="1px solid"
      borderColor={selected ? 'primary100' : 'grey20'}
      borderRadius="xl"
      boxShadow="card"
      display="flex"
      flexDirection="column"
      gap="lg"
      overflow="hidden"
      p="lg"
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      <Box alignItems="center" display="flex" justifyContent="space-between" gap="lg">
        <StatusBadge tone={selected ? 'info' : 'neutral'}>{selected ? '已选中' : statusLabel(item.status)}</StatusBadge>
        <input
          checked={selected}
          onChange={onToggle}
          onClick={(event) => event.stopPropagation()}
          type="checkbox"
        />
      </Box>
      <PreviewSurface imageUrl={item.previewImageUrl} title={item.title} />
      <Box display="flex" flexDirection="column" gap="sm">
        <H5>{item.title}</H5>
        <Text color="grey60">{item.categoryName || '未分类'} · {item.scene}</Text>
        <Text>{item.promptHint}</Text>
        <Text color="grey60">{(item.tags || []).join(' / ') || '无标签'}</Text>
        <Box mt="sm">
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onPreview?.();
            }}
            size="sm"
            variant="text"
          >
            查看大图
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export function PreviewSurface({ imageUrl, title }) {
  if (imageUrl) {
    return (
      <Box
        as="img"
        alt={title}
        borderRadius="lg"
        height="188px"
        src={imageUrl}
        style={{ objectFit: 'cover', width: '100%' }}
        width="100%"
      />
    );
  }

  return (
    <Box
      alignItems="flex-end"
      bg="linear-gradient(135deg, rgba(255,107,53,0.18), rgba(108,92,231,0.18))"
      borderRadius="lg"
      color="grey100"
      display="flex"
      height="188px"
      justifyContent="space-between"
      p="lg"
    >
      <Badge variant="primary">暂无预览</Badge>
      <Text color="grey80" textAlign="right">{title}</Text>
    </Box>
  );
}

export function LargePreviewModal({ item, onClose }) {
  if (!item) return null;

  return (
    <Box
      alignItems="center"
      bg="rgba(12, 30, 41, 0.72)"
      bottom="0"
      display="flex"
      justifyContent="center"
      left="0"
      onClick={onClose}
      p="xxl"
      position="fixed"
      right="0"
      top="0"
      zIndex="9999"
    >
      <Box
        bg="white"
        borderRadius="xl"
        maxHeight="90vh"
        maxWidth="960px"
        onClick={(event) => event.stopPropagation()}
        overflow="hidden"
        width="100%"
      >
        <Box alignItems="center" display="flex" justifyContent="space-between" p="xl">
          <Box>
            <H4 marginBottom="sm">{item.title}</H4>
            <Text color="grey60">{item.categoryName || '未分类'} · {item.scene || item.subtitle || '视觉内容预览'}</Text>
          </Box>
          <Button onClick={onClose} variant="text">关闭</Button>
        </Box>
        <Box px="xl" pb="xl">
          {item.previewImageUrl || item.imageUrl ? (
            <Box
              as="img"
              alt={item.title}
              borderRadius="xl"
              maxHeight="70vh"
              src={item.previewImageUrl || item.imageUrl}
              style={{ objectFit: 'contain', width: '100%', background: '#F8F9F9' }}
              width="100%"
            />
          ) : (
            <PreviewSurface imageUrl={null} title={item.title} />
          )}
          {item.promptHint || item.prompt ? (
            <Box mt="lg">
              <Text color="grey60">{item.promptHint || item.prompt}</Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export function ReviewNoteTemplatePicker({ templates = [], selectedValue, onSelect }) {
  if (!templates.length) return null;

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      <Text color="grey60">审核备注模板</Text>
      <Box display="flex" flexWrap="wrap" gap="default">
        {templates.map(template => (
          <Button
            key={template.value}
            onClick={() => onSelect?.(template.value)}
            variant={selectedValue === template.value ? 'contained' : 'outlined'}
          >
            {template.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

export function TrendBars({ items = [], series = [] }) {
  if (!items.length) {
    return <EmptyState>暂无趋势数据</EmptyState>;
  }

  const maxValue = Math.max(
    ...items.flatMap(item => series.map(entry => Number(item[entry.key] || 0))),
    1
  );

  return (
    <Box display="flex" flexDirection="column" gap="lg">
      <Box display="flex" flexWrap="wrap" gap="lg">
        {series.map(entry => (
          <Box alignItems="center" display="inline-flex" gap="sm" key={entry.key}>
            <Box bg={entry.color} borderRadius="circle" height="10px" width="10px" />
            <Text color="grey60">{entry.label}</Text>
          </Box>
        ))}
      </Box>
      <Box display="grid" gap="lg" gridTemplateColumns={`repeat(${items.length}, minmax(0, 1fr))`}>
        {items.map(item => (
          <Box alignItems="center" display="flex" flexDirection="column" gap="sm" key={item.label} minHeight="220px">
            <Box alignItems="flex-end" display="flex" gap="sm" height="180px" width="100%">
              {series.map(entry => {
                const height = Math.max(8, (Number(item[entry.key] || 0) / maxValue) * 180);
                return (
                  <Box
                    bg={entry.color}
                    borderRadius="lg lg 0 0"
                    flex="1"
                    key={entry.key}
                    minWidth="0"
                    style={{ height: `${height}px` }}
                    title={`${entry.label}: ${item[entry.key] || 0}`}
                  />
                );
              })}
            </Box>
            <Text color="grey60">{item.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function ReasonGroupList({ items = [] }) {
  return (
    <FeedList
      empty="暂无失败原因分组。"
      items={items}
      renderItem={(item) => (
        <FeedRow
          aside={`涉及提供方：${item.providers.join(' / ')}`}
          badge={`${item.count} 次`}
          body={item.samplePrompt || '无样例 Prompt'}
          key={item.reason}
          subtitle={item.sampleJobTitle || '最近异常任务'}
          title={item.reason}
          tone="warning"
        />
      )}
    />
  );
}

export function SelectableFeedList({
  items = [],
  selectedIds = [],
  onToggle,
  onToggleAll,
  empty,
  titleLabel = '列表',
  renderContent
}) {
  if (!items.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  const selectedSet = new Set(selectedIds);
  const allSelected = items.length > 0 && items.every(item => selectedSet.has(item.id));

  return (
    <Box display="flex" flexDirection="column" gap="xl">
      <Box alignItems="center" display="flex" justifyContent="space-between" gap="lg">
        <Text color="grey60">{titleLabel}</Text>
        <Button onClick={() => onToggleAll?.(!allSelected)} size="sm" variant="outlined">
          {allSelected ? '取消全选' : '全选当前列表'}
        </Button>
      </Box>
      <Box display="flex" flexDirection="column" gap="lg">
        {items.map(item => (
          <Box
            bg={selectedSet.has(item.id) ? 'filterBg' : 'white'}
            border="1px solid"
            borderColor={selectedSet.has(item.id) ? 'primary100' : 'grey20'}
            borderRadius="xl"
            key={item.id}
            p="lg"
          >
            <Box alignItems="flex-start" display="grid" gap="lg" gridTemplateColumns="24px 1fr">
              <input
                checked={selectedSet.has(item.id)}
                onChange={() => onToggle?.(item.id)}
                type="checkbox"
              />
              {renderContent(item)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function RenewalCards({ items = [] }) {
  if (!items.length) {
    return <EmptyState>当前没有临近续费提醒。</EmptyState>;
  }

  return (
    <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', 'repeat(3, minmax(0, 1fr))']}>
      {items.map(item => (
        <Box
          bg="filterBg"
          border="1px solid"
          borderColor="grey20"
          borderRadius="xl"
          key={item.id}
          p="xl"
        >
          <Box alignItems="center" display="flex" justifyContent="space-between" mb="lg">
            <H5>{item.planName || item.planId}</H5>
            <StatusBadge tone={item.daysLeft <= 3 ? 'error' : 'warning'}>{item.daysLeft} 天后</StatusBadge>
          </Box>
          <Text color="grey60" mb="sm">{item.userNickname || item.userId}</Text>
          <Text mb="sm">{item.autoRenew ? '自动续费已开启' : '自动续费未开启'}</Text>
          <Text color="grey60">{item.renewalAtLabel}</Text>
        </Box>
      ))}
    </Box>
  );
}

export function QuickActionGrid({ items = [], minWidth }) {
  return (
    <Box display="grid" gap="default" gridTemplateColumns={['1fr', '1fr 1fr']} minWidth={minWidth}>
      {items.map((item) => (
        <Button
          as="a"
          href={item.href}
          key={item.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textDecoration: 'none'
          }}
          variant={item.variant || 'outlined'}
        >
          <Icon icon={item.icon} />
          {item.label}
        </Button>
      ))}
    </Box>
  );
}

export function InsightStrip({ items = [] }) {
  return (
    <Box display="grid" gap="lg" gridTemplateColumns={['1fr', '1fr', `repeat(${Math.min(items.length || 1, 3)}, minmax(0, 1fr))`]}>
      {items.map((item) => (
        <Box
          bg="filterBg"
          borderRadius="lg"
          key={item.label}
          p="lg"
        >
          <Text color="grey60" fontWeight="600" mb="sm">{item.label}</Text>
          <H4 marginBottom="sm">{item.value}</H4>
          <Text color="grey60">{item.note}</Text>
        </Box>
      ))}
    </Box>
  );
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onRequestChanges,
  onArchive,
  submitting,
  approveLabel = '批量通过',
  requestChangesLabel = '批量退回修改',
  archiveLabel = '批量归档'
}) {
  return (
    <Box
      alignItems={['flex-start', 'center']}
      bg="filterBg"
      border="1px solid"
      borderColor="grey20"
      borderRadius="xl"
      display="flex"
      flexDirection={['column', 'row']}
      gap="lg"
      justifyContent="space-between"
      p="lg"
    >
      <Text color="grey80">已选中 {selectedCount} 项，可直接执行批量动作。</Text>
      <Box display="flex" flexWrap="wrap" gap="default">
        {onApprove ? (
          <Button disabled={!selectedCount || submitting} onClick={onApprove} variant="contained">{approveLabel}</Button>
        ) : null}
        {onRequestChanges ? (
          <Button disabled={!selectedCount || submitting} onClick={onRequestChanges} variant="outlined">{requestChangesLabel}</Button>
        ) : null}
        {onArchive ? (
          <Button disabled={!selectedCount || submitting} onClick={onArchive} variant="text">{archiveLabel}</Button>
        ) : null}
      </Box>
    </Box>
  );
}

export function MetricPill({ label, value, tone = 'neutral' }) {
  return (
    <Box
      alignItems="center"
      bg="filterBg"
      border="1px solid"
      borderColor="grey20"
      borderRadius="pill"
      display="inline-flex"
      gap="sm"
      px="lg"
      py="sm"
    >
      <Text color="grey60">{label}</Text>
      <StatusBadge tone={tone}>{value}</StatusBadge>
    </Box>
  );
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <Badge variant={toneMap[tone] || 'light'}>{children}</Badge>;
}

export function EmptyState({ children }) {
  return (
    <Box
      alignItems="center"
      bg="filterBg"
      border="1px dashed"
      borderColor="grey20"
      borderRadius="lg"
      display="flex"
      justifyContent="center"
      minHeight="120px"
      p="xl"
    >
      <Text color="grey60" textAlign="center">{children}</Text>
    </Box>
  );
}

function ImageThumb({ src, alt }) {
  return (
    <Box
      as="img"
      alt={alt}
      borderRadius="lg"
      height={['72px', '72px', '84px']}
      src={src}
      style={{ objectFit: 'cover', width: '100%' }}
      width={['72px', '72px', '84px']}
    />
  );
}

export function formatCurrency(cents) {
  return `¥${(Number(cents || 0) / 100).toFixed(2)}`;
}

export function ratio(value) {
  return `${Math.round((Number(value || 0) * 1000)) / 10}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN');
}

export function statusLabel(status) {
  return {
    DRAFT: '草稿',
    IN_REVIEW: '审核中',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
    QUEUED: '排队中',
    RUNNING: '执行中',
    SUCCEEDED: '成功',
    FAILED: '失败',
    CANCELED: '已取消',
    ACTIVE: '启用',
    SUSPENDED: '暂停',
    TRIALING: '试用中',
    PAUSED: '已暂停',
    EXPIRED: '已到期',
    PENDING: '待处理',
    PAID: '已支付',
    REFUNDED: '已退款',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    CHANGES_REQUESTED: '需修改',
    FREE: '免费版',
    CREATOR: '创作者版',
    BUSINESS: '商业版'
  }[status] || status;
}

export function statusTone(status) {
  if (['PUBLISHED', 'SUCCEEDED', 'ACTIVE', 'PAID', 'APPROVED'].includes(status)) return 'success';
  if (['FAILED', 'ARCHIVED', 'SUSPENDED', 'REJECTED', 'REFUNDED', 'CANCELED'].includes(status)) return 'error';
  if (['IN_REVIEW', 'CHANGES_REQUESTED', 'PENDING', 'PAUSED', 'TRIALING', 'DRAFT'].includes(status)) return 'warning';
  return 'neutral';
}

export function useSelection(items = [], key = 'id') {
  const [selectedIds, setSelectedIds] = useState([]);

  const availableIds = useMemo(() => items.map(item => item[key]), [items, key]);

  useEffect(() => {
    setSelectedIds(current => current.filter(id => availableIds.includes(id)));
  }, [availableIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    toggle: (id) => {
      setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    },
    toggleAll: (checked) => {
      setSelectedIds(checked ? [...availableIds] : []);
    },
    clear: () => setSelectedIds([])
  };
}
