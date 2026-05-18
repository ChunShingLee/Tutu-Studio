import React, { useState } from 'react';
import { Box, Text } from '@adminjs/design-system';
import {
  AdminPageShell,
  BulkActionBar,
  FeedList,
  FeedRow,
  InsightStrip,
  LargePreviewModal,
  PanelCard,
  PreviewReviewBoard,
  QuickActionGrid,
  ReviewNoteTemplatePicker,
  StatGrid,
  formatDate,
  ratio,
  statusLabel,
  statusTone,
  useAdminPage,
  useSelection
} from './shared.jsx';

const quickActions = [
  { label: '查看模板列表', href: '/admin/resources/Template/actions/list', icon: 'Layout' },
  { label: '查看审核记录', href: '/admin/resources/ContentReview/actions/list', icon: 'Shield' },
  { label: '素材资产库', href: '/admin/resources/Asset/actions/list', icon: 'Image' },
  { label: '社区内容', href: '/admin/resources/CommunityPost/actions/list', icon: 'MessageSquare' }
];

const reviewNoteTemplates = [
  { label: '品牌约束需补充', value: '建议补充品牌识别和风格约束，避免生成结果过于发散。' },
  { label: '画面层次需加强', value: '建议加强主体层次、光影对比和卖点聚焦，再提交审核。' },
  { label: '文案留白不足', value: '请补足标题与卖点文案留白区域，保证落地页可用性。' },
  { label: '批量审核通过', value: '内容结构完整，质量稳定，批量审核通过。' }
];

export default function ContentStudioPage() {
  const {
    loading,
    submitting,
    error,
    notice,
    data,
    submit,
    clearNotice
  } = useAdminPage('contentStudio');

  const templateSelection = useSelection(data?.templateReviewQueue || []);
  const [previewItem, setPreviewItem] = useState(null);
  const [selectedReviewNote, setSelectedReviewNote] = useState(reviewNoteTemplates[0].value);

  async function runBulkReview(status, summary) {
    if (!templateSelection.selectedIds.length) return;
    await submit({
      action: 'bulkReviewTemplates',
      ids: templateSelection.selectedIds,
      status,
      summary
    });
    templateSelection.clear();
  }

  return (
    <AdminPageShell
      actions={quickActions}
      description="把模板审核、素材质检、社区内容和分类结构放到同一个内容中台里，减少运营在资源表之间来回切换。"
      eyebrow="内容中台"
      error={error}
      loading={loading}
      notice={notice}
      onDismissNotice={clearNotice}
      title="内容中台"
    >
      <StatGrid
        items={[
          { label: '待审核总数', value: data?.stats.pendingReviews ?? 0, note: '模板、素材与社区内容的总待处理量', icon: 'Shield', accent: 'orange' },
          { label: '草稿模板', value: data?.stats.draftTemplates ?? 0, note: '尚未送审或待继续打磨的模板', icon: 'Edit', accent: 'purple' },
          { label: '审核中模板', value: data?.stats.inReviewTemplates ?? 0, note: '正在等待运营或内容负责人处理', icon: 'Activity', accent: 'yellow' },
          { label: '会员模板占比', value: ratio(data?.stats.premiumRatio ?? 0), note: '当前模板库中会员模板的配置占比', icon: 'Star', accent: 'cyan' }
        ]}
      />

      <PanelCard
        actions={(
          <Text color="grey60">
            {templateSelection.selectedCount ? `已选 ${templateSelection.selectedCount} 个模板` : '先勾选模板，再执行批量审核'}
          </Text>
        )}
        description="给审核同学一个真正可操作的模板看板：看图、看标签、看场景，然后批量过审或退回。"
        title="模板审核页"
      >
        <ReviewNoteTemplatePicker
          onSelect={setSelectedReviewNote}
          selectedValue={selectedReviewNote}
          templates={reviewNoteTemplates}
        />
        <PreviewReviewBoard
          empty="当前没有待审核模板。"
          items={data?.templateReviewQueue || []}
          onPreview={setPreviewItem}
          onToggle={templateSelection.toggle}
          onToggleAll={templateSelection.toggleAll}
          selectedIds={templateSelection.selectedIds}
          titleLabel="待审核模板"
        />
        <BulkActionBar
          onApprove={() => runBulkReview('APPROVED', selectedReviewNote)}
          onArchive={() => runBulkReview('REJECTED', selectedReviewNote || '批量归档处理')}
          onRequestChanges={() => runBulkReview('CHANGES_REQUESTED', selectedReviewNote)}
          selectedCount={templateSelection.selectedCount}
          submitting={submitting}
        />
      </PanelCard>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1.25fr 0.95fr']}>
        <PanelCard
          description="按运营优先级列出最需要先处理的内容项。"
          title="审核工作台"
        >
          <FeedList
            empty="当前没有待处理内容。"
            items={data?.queue || []}
            renderItem={(item) => (
              <FeedRow
                aside={item.updatedAtLabel}
                badge={statusLabel(item.status)}
                body={item.summary}
                imageUrl={item.previewImageUrl}
                key={`${item.entityType}-${item.entityId}`}
                subtitle={`${item.entityTypeLabel} · ${item.subtitle || '无补充信息'}`}
                title={item.title}
                tone={statusTone(item.status)}
              />
            )}
          />
        </PanelCard>

        <Box display="flex" flexDirection="column" gap="xl">
          <PanelCard
            description="帮助你快速识别内容供给是否偏向某个主题。"
            title="分类与权益洞察"
          >
            <InsightStrip
              items={(data?.categoryBreakdown || []).map((item) => ({
                label: item.categoryName,
                value: `${item.count} 个模板`,
                note: `${item.premiumCount} 个会员模板`
              }))}
            />
          </PanelCard>

          <PanelCard
            description="从最新编辑记录里观察最近的内容节奏。"
            title="最近改动"
          >
            <FeedList
              empty="最近没有内容更新。"
              items={data?.latestTemplates || []}
              renderItem={(item) => (
                <FeedRow
                  aside={item.updatedAtLabel}
                  badge={statusLabel(item.status)}
                  imageUrl={item.previewImageUrl}
                  key={item.id}
                  subtitle={`${item.categoryName} · ${(item.tags || []).join(' / ') || '无标签'}`}
                  title={item.title}
                  tone={statusTone(item.status)}
                />
              )}
            />
          </PanelCard>
        </Box>
      </Box>

      <Box display="grid" gap="xl" gridTemplateColumns={['1fr', '1fr', '1fr 1fr']}>
        <PanelCard description="需要质检或打回修改的素材会出现在这里。" title="素材质检队列">
          <FeedList
            empty="素材资产当前没有待处理项。"
            items={data?.assets || []}
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

        <PanelCard description="社区内容审核现在可以和模板审核并排处理。" title="社区内容流">
          <FeedList
            empty="当前没有社区待审核内容。"
            items={data?.posts || []}
            renderItem={(post) => (
              <FeedRow
                aside={formatDate(post.updatedAt)}
                badge={statusLabel(post.reviewStatus)}
                body={post.body}
                imageUrl={post.imageUrl}
                key={post.id}
                subtitle={post.userNickname || post.userId}
                title={post.title}
                tone={statusTone(post.reviewStatus)}
              />
            )}
          />
        </PanelCard>
      </Box>

      <PanelCard
        description="把高频操作集中到内容中台底部，便于运营同学快速跳转。"
        title="内容工作流入口"
      >
        <QuickActionGrid items={quickActions} />
        <Box mt="xl">
          <Text color="grey60">
            当前内容中台已经补上图片预览和批量审核。下一阶段如果继续往商用品质升级，建议做对比预览、审核备注模板和批量标签维护。
          </Text>
        </Box>
      </PanelCard>
      <LargePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </AdminPageShell>
  );
}
