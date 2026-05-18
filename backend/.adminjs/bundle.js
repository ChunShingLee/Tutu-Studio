(function (React, designSystem, adminjs, reactRouterDom, styledComponents, reactRedux) {
  'use strict';

  function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

  var React__default = /*#__PURE__*/_interopDefault(React);

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  const api = new adminjs.ApiClient();
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
  function useAdminPage(pageName) {
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');
    const [notice, setNotice] = React.useState(null);
    const [data, setData] = React.useState(null);
    const load = React.useCallback(async () => {
      try {
        const response = pageName ? await api.getPage({
          pageName
        }) : await api.getDashboard();
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
    React.useEffect(() => {
      let mounted = true;
      async function boot() {
        try {
          const response = pageName ? await api.getPage({
            pageName
          }) : await api.getDashboard();
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
    const submit = React.useCallback(async (payload, requestOptions = {}) => {
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
        setNotice({
          message,
          type: 'error'
        });
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
  function AdminPageShell({
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
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "xl",
        py: "xxl"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Loader, null), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
        color: "grey60"
      }, "\u6B63\u5728\u52A0\u8F7D\u540E\u53F0\u5DE5\u4F5C\u53F0\u2026"));
    }
    if (error) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        alignItems: "center",
        bg: "white",
        border: "1px solid",
        borderColor: "danger",
        borderRadius: "xl",
        boxShadow: "card",
        display: "flex",
        flexDirection: "column",
        gap: "xl",
        p: "xxl"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Illustration, {
        variant: "Rocket",
        width: 220
      }), /*#__PURE__*/React__default.default.createElement(designSystem.H4, null, "\u5DE5\u4F5C\u53F0\u6682\u65F6\u4E0D\u53EF\u7528"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
        color: "grey60"
      }, error));
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xxl"
    }, notice ? /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: notice.message,
      onCloseClick: onDismissNotice,
      variant: notice.type === 'error' ? 'danger' : notice.type === 'info' ? 'info' : 'success'
    }) : null, /*#__PURE__*/React__default.default.createElement(HeroPanel, {
      eyebrow: eyebrow,
      title: title,
      description: description,
      actions: actions
    }), children);
  }
  function HeroPanel({
    eyebrow,
    title,
    description,
    actions = []
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      boxShadow: "card",
      display: "flex",
      flexDirection: ['column', 'column', 'row'],
      gap: "xxl",
      justifyContent: "space-between",
      overflow: "hidden",
      p: "xxl",
      position: "relative"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "filterBg",
      height: "180px",
      left: "0",
      position: "absolute",
      top: "0",
      width: "100%",
      style: {
        clipPath: 'polygon(0 0, 100% 0, 100% 56%, 0 100%)',
        opacity: 0.45
      }
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      maxWidth: 620,
      position: "relative",
      zIndex: 1
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "primary100",
      fontWeight: "700",
      letterSpacing: "0.08em",
      mb: "lg",
      textTransform: "uppercase"
    }, eyebrow), /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      marginBottom: "xl"
    }, title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey80",
      lineHeight: "xl"
    }, description)), actions.length ? /*#__PURE__*/React__default.default.createElement(QuickActionGrid, {
      items: actions,
      minWidth: ['100%', 'auto']
    }) : null);
  }
  function StatGrid({
    items = [],
    columns = 4
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', `repeat(${columns}, minmax(0, 1fr))`]
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(StatCard, _extends({
      key: item.label
    }, item))));
  }
  function StatCard({
    label,
    value,
    note,
    icon,
    accent = 'orange'
  }) {
    const accentColor = colorMap[accent] || accent;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      boxShadow: "card",
      display: "flex",
      flexDirection: "column",
      gap: "lg",
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      fontWeight: "600"
    }, label), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      bg: accentColor,
      borderRadius: "circle",
      color: "white",
      display: "inline-flex",
      height: "40px",
      justifyContent: "center",
      width: "40px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: icon
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.H3, {
      marginBottom: "default"
    }, value), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, note)));
  }
  function PanelCard({
    title,
    description,
    actions,
    children,
    minHeight
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      boxShadow: "card",
      display: "flex",
      flexDirection: "column",
      gap: "xl",
      minHeight: minHeight,
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "flex-start",
      display: "flex",
      justifyContent: "space-between",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      marginBottom: "sm"
    }, title), description ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, description) : null), actions ? actions : null), children);
  }
  function FeedList({
    items = [],
    empty,
    renderItem,
    gap = 'lg'
  }) {
    if (!items.length) {
      return /*#__PURE__*/React__default.default.createElement(EmptyState, null, empty);
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: gap
    }, items.map(renderItem));
  }
  function FeedRow({
    title,
    subtitle,
    body,
    badge,
    tone = 'neutral',
    aside,
    imageUrl
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      borderBottom: "1px solid",
      borderColor: "grey20",
      display: "grid",
      gap: "lg",
      gridTemplateColumns: imageUrl ? ['72px 1fr', '72px 1fr', '84px 1fr'] : ['1fr'],
      pb: "lg"
    }, imageUrl ? /*#__PURE__*/React__default.default.createElement(ImageThumb, {
      alt: title,
      src: imageUrl
    }) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "sm"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, title), badge ? /*#__PURE__*/React__default.default.createElement(StatusBadge, {
      tone: tone
    }, badge) : null), subtitle ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, subtitle) : null, body ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, body) : null, aside ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, aside) : null));
  }
  function PreviewReviewBoard({
    items = [],
    selectedIds = [],
    onToggle,
    onToggleAll,
    onPreview,
    empty,
    titleLabel = '待审核模板'
  }) {
    if (!items.length) {
      return /*#__PURE__*/React__default.default.createElement(EmptyState, null, empty);
    }
    const selectedSet = new Set(selectedIds);
    const allSelected = items.length > 0 && items.every(item => selectedSet.has(item.id));
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, titleLabel), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: () => onToggleAll?.(!allSelected),
      size: "sm",
      variant: "outlined"
    }, allSelected ? '取消全选' : '全选当前列表')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', 'repeat(2, minmax(0, 1fr))']
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(PreviewCard, {
      item: item,
      key: item.id,
      onPreview: () => onPreview?.(item),
      onToggle: () => onToggle?.(item.id),
      selected: selectedSet.has(item.id)
    }))));
  }
  function PreviewCard({
    item,
    selected,
    onToggle,
    onPreview
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: selected ? 'filterBg' : 'white',
      border: "1px solid",
      borderColor: selected ? 'primary100' : 'grey20',
      borderRadius: "xl",
      boxShadow: "card",
      display: "flex",
      flexDirection: "column",
      gap: "lg",
      overflow: "hidden",
      p: "lg",
      style: {
        cursor: 'pointer'
      },
      onClick: onToggle
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(StatusBadge, {
      tone: selected ? 'info' : 'neutral'
    }, selected ? '已选中' : statusLabel(item.status)), /*#__PURE__*/React__default.default.createElement("input", {
      checked: selected,
      onChange: onToggle,
      onClick: event => event.stopPropagation(),
      type: "checkbox"
    })), /*#__PURE__*/React__default.default.createElement(PreviewSurface, {
      imageUrl: item.previewImageUrl,
      title: item.title
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "sm"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, item.title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.categoryName || '未分类', " \xB7 ", item.scene), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, item.promptHint), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, (item.tags || []).join(' / ') || '无标签'), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "sm"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: event => {
        event.stopPropagation();
        onPreview?.();
      },
      size: "sm",
      variant: "text"
    }, "\u67E5\u770B\u5927\u56FE"))));
  }
  function PreviewSurface({
    imageUrl,
    title
  }) {
    if (imageUrl) {
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        as: "img",
        alt: title,
        borderRadius: "lg",
        height: "188px",
        src: imageUrl,
        style: {
          objectFit: 'cover',
          width: '100%'
        },
        width: "100%"
      });
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "flex-end",
      bg: "linear-gradient(135deg, rgba(255,107,53,0.18), rgba(108,92,231,0.18))",
      borderRadius: "lg",
      color: "grey100",
      display: "flex",
      height: "188px",
      justifyContent: "space-between",
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: "primary"
    }, "\u6682\u65E0\u9884\u89C8"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey80",
      textAlign: "right"
    }, title));
  }
  function LargePreviewModal({
    item,
    onClose
  }) {
    if (!item) return null;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      bg: "rgba(12, 30, 41, 0.72)",
      bottom: "0",
      display: "flex",
      justifyContent: "center",
      left: "0",
      onClick: onClose,
      p: "xxl",
      position: "fixed",
      right: "0",
      top: "0",
      zIndex: "9999"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "white",
      borderRadius: "xl",
      maxHeight: "90vh",
      maxWidth: "960px",
      onClick: event => event.stopPropagation(),
      overflow: "hidden",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      marginBottom: "sm"
    }, item.title), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.categoryName || '未分类', " \xB7 ", item.scene || item.subtitle || '视觉内容预览')), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: onClose,
      variant: "text"
    }, "\u5173\u95ED")), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      px: "xl",
      pb: "xl"
    }, item.previewImageUrl || item.imageUrl ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "img",
      alt: item.title,
      borderRadius: "xl",
      maxHeight: "70vh",
      src: item.previewImageUrl || item.imageUrl,
      style: {
        objectFit: 'contain',
        width: '100%',
        background: '#F8F9F9'
      },
      width: "100%"
    }) : /*#__PURE__*/React__default.default.createElement(PreviewSurface, {
      imageUrl: null,
      title: item.title
    }), item.promptHint || item.prompt ? /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.promptHint || item.prompt)) : null)));
  }
  function ReviewNoteTemplatePicker({
    templates = [],
    selectedValue,
    onSelect
  }) {
    if (!templates.length) return null;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5BA1\u6838\u5907\u6CE8\u6A21\u677F"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexWrap: "wrap",
      gap: "default"
    }, templates.map(template => /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      key: template.value,
      onClick: () => onSelect?.(template.value),
      variant: selectedValue === template.value ? 'contained' : 'outlined'
    }, template.label))));
  }
  function TrendBars({
    items = [],
    series = []
  }) {
    if (!items.length) {
      return /*#__PURE__*/React__default.default.createElement(EmptyState, null, "\u6682\u65E0\u8D8B\u52BF\u6570\u636E");
    }
    const maxValue = Math.max(...items.flatMap(item => series.map(entry => Number(item[entry.key] || 0))), 1);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexWrap: "wrap",
      gap: "lg"
    }, series.map(entry => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "inline-flex",
      gap: "sm",
      key: entry.key
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: entry.color,
      borderRadius: "circle",
      height: "10px",
      width: "10px"
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, entry.label)))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "lg",
      gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "sm",
      key: item.label,
      minHeight: "220px"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "flex-end",
      display: "flex",
      gap: "sm",
      height: "180px",
      width: "100%"
    }, series.map(entry => {
      const height = Math.max(8, Number(item[entry.key] || 0) / maxValue * 180);
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        bg: entry.color,
        borderRadius: "lg lg 0 0",
        flex: "1",
        key: entry.key,
        minWidth: "0",
        style: {
          height: `${height}px`
        },
        title: `${entry.label}: ${item[entry.key] || 0}`
      });
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.label)))));
  }
  function ReasonGroupList({
    items = []
  }) {
    return /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u6682\u65E0\u5931\u8D25\u539F\u56E0\u5206\u7EC4\u3002",
      items: items,
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: `涉及提供方：${item.providers.join(' / ')}`,
        badge: `${item.count} 次`,
        body: item.samplePrompt || '无样例 Prompt',
        key: item.reason,
        subtitle: item.sampleJobTitle || '最近异常任务',
        title: item.reason,
        tone: "warning"
      })
    });
  }
  function SelectableFeedList({
    items = [],
    selectedIds = [],
    onToggle,
    onToggleAll,
    empty,
    titleLabel = '列表',
    renderContent
  }) {
    if (!items.length) {
      return /*#__PURE__*/React__default.default.createElement(EmptyState, null, empty);
    }
    const selectedSet = new Set(selectedIds);
    const allSelected = items.length > 0 && items.every(item => selectedSet.has(item.id));
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, titleLabel), /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      onClick: () => onToggleAll?.(!allSelected),
      size: "sm",
      variant: "outlined"
    }, allSelected ? '取消全选' : '全选当前列表')), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: selectedSet.has(item.id) ? 'filterBg' : 'white',
      border: "1px solid",
      borderColor: selectedSet.has(item.id) ? 'primary100' : 'grey20',
      borderRadius: "xl",
      key: item.id,
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "flex-start",
      display: "grid",
      gap: "lg",
      gridTemplateColumns: "24px 1fr"
    }, /*#__PURE__*/React__default.default.createElement("input", {
      checked: selectedSet.has(item.id),
      onChange: () => onToggle?.(item.id),
      type: "checkbox"
    }), renderContent(item))))));
  }
  function RenewalCards({
    items = []
  }) {
    if (!items.length) {
      return /*#__PURE__*/React__default.default.createElement(EmptyState, null, "\u5F53\u524D\u6CA1\u6709\u4E34\u8FD1\u7EED\u8D39\u63D0\u9192\u3002");
    }
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', 'repeat(3, minmax(0, 1fr))']
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "filterBg",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      key: item.id,
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      mb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.H5, null, item.planName || item.planId), /*#__PURE__*/React__default.default.createElement(StatusBadge, {
      tone: item.daysLeft <= 3 ? 'error' : 'warning'
    }, item.daysLeft, " \u5929\u540E")), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      mb: "sm"
    }, item.userNickname || item.userId), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      mb: "sm"
    }, item.autoRenew ? '自动续费已开启' : '自动续费未开启'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.renewalAtLabel))));
  }
  function QuickActionGrid({
    items = [],
    minWidth
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "default",
      gridTemplateColumns: ['1fr', '1fr 1fr'],
      minWidth: minWidth
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      as: "a",
      href: item.href,
      key: item.href,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textDecoration: 'none'
      },
      variant: item.variant || 'outlined'
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: item.icon
    }), item.label)));
  }
  function InsightStrip({
    items = []
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "lg",
      gridTemplateColumns: ['1fr', '1fr', `repeat(${Math.min(items.length || 1, 3)}, minmax(0, 1fr))`]
    }, items.map(item => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "filterBg",
      borderRadius: "lg",
      key: item.label,
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      fontWeight: "600",
      mb: "sm"
    }, item.label), /*#__PURE__*/React__default.default.createElement(designSystem.H4, {
      marginBottom: "sm"
    }, item.value), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, item.note))));
  }
  function BulkActionBar({
    selectedCount,
    onApprove,
    onRequestChanges,
    onArchive,
    submitting,
    approveLabel = '批量通过',
    requestChangesLabel = '批量退回修改',
    archiveLabel = '批量归档'
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: ['flex-start', 'center'],
      bg: "filterBg",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      display: "flex",
      flexDirection: ['column', 'row'],
      gap: "lg",
      justifyContent: "space-between",
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey80"
    }, "\u5DF2\u9009\u4E2D ", selectedCount, " \u9879\uFF0C\u53EF\u76F4\u63A5\u6267\u884C\u6279\u91CF\u52A8\u4F5C\u3002"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexWrap: "wrap",
      gap: "default"
    }, onApprove ? /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      disabled: !selectedCount || submitting,
      onClick: onApprove,
      variant: "contained"
    }, approveLabel) : null, onRequestChanges ? /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      disabled: !selectedCount || submitting,
      onClick: onRequestChanges,
      variant: "outlined"
    }, requestChangesLabel) : null, onArchive ? /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      disabled: !selectedCount || submitting,
      onClick: onArchive,
      variant: "text"
    }, archiveLabel) : null));
  }
  function StatusBadge({
    children,
    tone = 'neutral'
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      variant: toneMap[tone] || 'light'
    }, children);
  }
  function EmptyState({
    children
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      bg: "filterBg",
      border: "1px dashed",
      borderColor: "grey20",
      borderRadius: "lg",
      display: "flex",
      justifyContent: "center",
      minHeight: "120px",
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      textAlign: "center"
    }, children));
  }
  function ImageThumb({
    src,
    alt
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "img",
      alt: alt,
      borderRadius: "lg",
      height: ['72px', '72px', '84px'],
      src: src,
      style: {
        objectFit: 'cover',
        width: '100%'
      },
      width: ['72px', '72px', '84px']
    });
  }
  function formatCurrency(cents) {
    return `¥${(Number(cents || 0) / 100).toFixed(2)}`;
  }
  function ratio(value) {
    return `${Math.round(Number(value || 0) * 1000) / 10}%`;
  }
  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('zh-CN');
  }
  function statusLabel(status) {
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
  function statusTone(status) {
    if (['PUBLISHED', 'SUCCEEDED', 'ACTIVE', 'PAID', 'APPROVED'].includes(status)) return 'success';
    if (['FAILED', 'ARCHIVED', 'SUSPENDED', 'REJECTED', 'REFUNDED', 'CANCELED'].includes(status)) return 'error';
    if (['IN_REVIEW', 'CHANGES_REQUESTED', 'PENDING', 'PAUSED', 'TRIALING', 'DRAFT'].includes(status)) return 'warning';
    return 'neutral';
  }
  function useSelection(items = [], key = 'id') {
    const [selectedIds, setSelectedIds] = React.useState([]);
    const availableIds = React.useMemo(() => items.map(item => item[key]), [items, key]);
    React.useEffect(() => {
      setSelectedIds(current => current.filter(id => availableIds.includes(id)));
    }, [availableIds]);
    return {
      selectedIds,
      selectedCount: selectedIds.length,
      toggle: id => {
        setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
      },
      toggleAll: checked => {
        setSelectedIds(checked ? [...availableIds] : []);
      },
      clear: () => setSelectedIds([])
    };
  }

  const quickActions$3 = [{
    label: '内容中台',
    href: '/admin/pages/contentStudio',
    icon: 'Layout'
  }, {
    label: '任务指挥台',
    href: '/admin/pages/jobCommand',
    icon: 'Activity'
  }, {
    label: '商业化中台',
    href: '/admin/pages/revenueOps',
    icon: 'CreditCard'
  }, {
    label: '用户管理',
    href: '/admin/resources/User/actions/list',
    icon: 'Users'
  }];
  function OperationsDashboard() {
    const {
      loading,
      error,
      data
    } = useAdminPage();
    const metrics = data?.metrics || {};
    return /*#__PURE__*/React__default.default.createElement(AdminPageShell, {
      actions: quickActions$3,
      description: "v2 \u7248\u672C\u628A\u8FD0\u8425\u5DE5\u4F5C\u62C6\u6210\u4E86\u4E13\u7528\u5DE5\u4F5C\u53F0\uFF1A\u9996\u9875\u66F4\u50CF\u9A7E\u9A76\u8231\uFF0C\u7528\u6765\u5FEB\u901F\u5224\u65AD\u4ECA\u5929\u8BE5\u76EF\u6A21\u677F\u3001\u4EFB\u52A1\u3001\u5BA1\u6838\u8FD8\u662F\u5546\u4E1A\u5316\u3002",
      eyebrow: "\u8FD0\u8425\u9A7E\u9A76\u8231",
      error: error,
      loading: loading,
      title: "\u5154\u5154\u89C6\u89C9\u8FD0\u8425\u9A7E\u9A76\u8231"
    }, /*#__PURE__*/React__default.default.createElement(StatGrid, {
      items: [{
        label: '总用户数',
        value: metrics.users ?? 0,
        note: '当前创作者与商业客户总量',
        icon: 'Users',
        accent: 'orange'
      }, {
        label: '模板总量',
        value: metrics.templates ?? 0,
        note: '包含草稿、审核中与已发布模板',
        icon: 'Layout',
        accent: 'purple'
      }, {
        label: '今日任务',
        value: metrics.jobsToday ?? 0,
        note: '今天新提交的生成任务',
        icon: 'Activity',
        accent: 'yellow'
      }, {
        label: '订阅转化',
        value: ratio(metrics.conversionRate ?? 0),
        note: '活跃订阅用户占比',
        icon: 'TrendingUp',
        accent: 'cyan'
      }]
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.2fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u628A\u540E\u53F0\u7684\u4E3B\u8981\u5DE5\u4F5C\u6D41\u6298\u53E0\u6210\u51E0\u4E2A\u5165\u53E3\uFF0C\u5E2E\u52A9\u56E2\u961F\u5FEB\u901F\u627E\u5230\u5904\u7406\u8DEF\u5F84\u3002",
      title: "\u4ECA\u65E5\u5DE5\u4F5C\u6D41"
    }, /*#__PURE__*/React__default.default.createElement(QuickActionGrid, {
      items: quickActions$3
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5F53\u524D\u540E\u53F0\u5DF2\u7ECF\u4ECE\u901A\u7528 CRUD \u58F3\u5C42\u5347\u7EA7\u6210\u5DE5\u4F5C\u53F0\u7ED3\u6784\u3002\u63A5\u4E0B\u6765\u5982\u679C\u7EE7\u7EED\u6253\u78E8\u5546\u7528\u54C1\u8D28\uFF0C\u5EFA\u8BAE\u8865\u6279\u91CF\u64CD\u4F5C\u3001\u56FE\u8868\u8D8B\u52BF\u548C\u5C97\u4F4D\u5316\u9996\u9875\u3002"))), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u4ECA\u5929\u6700\u503C\u5F97\u4F18\u5148\u5173\u6CE8\u7684\u51E0\u7C7B\u4E8B\u9879\u3002",
      title: "\u8FD0\u8425\u63D0\u793A"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u9700\u8981\u7279\u522B\u63D0\u793A\u7684\u8FD0\u8425\u4E8B\u9879\u3002",
      items: data?.spotlights || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        badge: item.badge,
        body: item.body,
        key: item.id,
        subtitle: item.subtitle,
        title: item.title,
        tone: item.tone
      })
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.2fr 1fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6700\u8FD1\u5B8C\u6210\u6216\u5931\u8D25\u7684\u4EFB\u52A1\uFF0C\u5E2E\u52A9\u503C\u73ED\u540C\u5B66\u5FEB\u901F\u5224\u65AD\u94FE\u8DEF\u7A33\u5B9A\u6027\u3002",
      title: "\u6700\u8FD1\u4EFB\u52A1"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u6700\u8FD1\u4EFB\u52A1\u3002",
      items: data?.recentJobs || [],
      renderItem: job => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: job.createdAtLabel,
        badge: job.statusLabel,
        body: job.prompt,
        key: job.id,
        subtitle: job.userNickname || job.userId,
        title: job.templateTitle || '自由生成任务',
        tone: job.tone
      })
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u9700\u8981\u8FD0\u8425\u6216\u5185\u5BB9\u540C\u5B66\u5C3D\u5FEB\u5904\u7406\u7684\u5BA1\u6838\u9879\u3002",
      title: "\u5BA1\u6838\u961F\u5217"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5F85\u5904\u7406\u5BA1\u6838\u9879\u3002",
      items: data?.reviewQueue || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: item.updatedAtLabel,
        badge: item.statusLabel,
        body: item.summary || '暂无审核备注',
        key: `${item.entityType}-${item.entityId}`,
        subtitle: item.entityTypeLabel,
        title: item.title,
        tone: item.tone
      })
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6240\u6709\u5173\u952E\u5199\u64CD\u4F5C\u90FD\u4F1A\u6C89\u6DC0\u5230\u8FD9\u91CC\u3002",
      title: "\u6700\u8FD1\u5BA1\u8BA1"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u6700\u8FD1\u5BA1\u8BA1\u52A8\u4F5C\u3002",
      items: data?.auditLogs || [],
      renderItem: log => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: log.createdAtLabel,
        body: log.entityLabel,
        key: log.id,
        subtitle: log.actorNickname || 'system',
        title: log.actionLabel
      })
    }))));
  }

  const quickActions$2 = [{
    label: '查看模板列表',
    href: '/admin/resources/Template/actions/list',
    icon: 'Layout'
  }, {
    label: '查看审核记录',
    href: '/admin/resources/ContentReview/actions/list',
    icon: 'Shield'
  }, {
    label: '素材资产库',
    href: '/admin/resources/Asset/actions/list',
    icon: 'Image'
  }, {
    label: '社区内容',
    href: '/admin/resources/CommunityPost/actions/list',
    icon: 'MessageSquare'
  }];
  const reviewNoteTemplates = [{
    label: '品牌约束需补充',
    value: '建议补充品牌识别和风格约束，避免生成结果过于发散。'
  }, {
    label: '画面层次需加强',
    value: '建议加强主体层次、光影对比和卖点聚焦，再提交审核。'
  }, {
    label: '文案留白不足',
    value: '请补足标题与卖点文案留白区域，保证落地页可用性。'
  }, {
    label: '批量审核通过',
    value: '内容结构完整，质量稳定，批量审核通过。'
  }];
  function ContentStudioPage() {
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
    const [previewItem, setPreviewItem] = React.useState(null);
    const [selectedReviewNote, setSelectedReviewNote] = React.useState(reviewNoteTemplates[0].value);
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
    return /*#__PURE__*/React__default.default.createElement(AdminPageShell, {
      actions: quickActions$2,
      description: "\u628A\u6A21\u677F\u5BA1\u6838\u3001\u7D20\u6750\u8D28\u68C0\u3001\u793E\u533A\u5185\u5BB9\u548C\u5206\u7C7B\u7ED3\u6784\u653E\u5230\u540C\u4E00\u4E2A\u5185\u5BB9\u4E2D\u53F0\u91CC\uFF0C\u51CF\u5C11\u8FD0\u8425\u5728\u8D44\u6E90\u8868\u4E4B\u95F4\u6765\u56DE\u5207\u6362\u3002",
      eyebrow: "\u5185\u5BB9\u4E2D\u53F0",
      error: error,
      loading: loading,
      notice: notice,
      onDismissNotice: clearNotice,
      title: "\u5185\u5BB9\u4E2D\u53F0"
    }, /*#__PURE__*/React__default.default.createElement(StatGrid, {
      items: [{
        label: '待审核总数',
        value: data?.stats.pendingReviews ?? 0,
        note: '模板、素材与社区内容的总待处理量',
        icon: 'Shield',
        accent: 'orange'
      }, {
        label: '草稿模板',
        value: data?.stats.draftTemplates ?? 0,
        note: '尚未送审或待继续打磨的模板',
        icon: 'Edit',
        accent: 'purple'
      }, {
        label: '审核中模板',
        value: data?.stats.inReviewTemplates ?? 0,
        note: '正在等待运营或内容负责人处理',
        icon: 'Activity',
        accent: 'yellow'
      }, {
        label: '会员模板占比',
        value: ratio(data?.stats.premiumRatio ?? 0),
        note: '当前模板库中会员模板的配置占比',
        icon: 'Star',
        accent: 'cyan'
      }]
    }), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      actions: /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
        color: "grey60"
      }, templateSelection.selectedCount ? `已选 ${templateSelection.selectedCount} 个模板` : '先勾选模板，再执行批量审核'),
      description: "\u7ED9\u5BA1\u6838\u540C\u5B66\u4E00\u4E2A\u771F\u6B63\u53EF\u64CD\u4F5C\u7684\u6A21\u677F\u770B\u677F\uFF1A\u770B\u56FE\u3001\u770B\u6807\u7B7E\u3001\u770B\u573A\u666F\uFF0C\u7136\u540E\u6279\u91CF\u8FC7\u5BA1\u6216\u9000\u56DE\u3002",
      title: "\u6A21\u677F\u5BA1\u6838\u9875"
    }, /*#__PURE__*/React__default.default.createElement(ReviewNoteTemplatePicker, {
      onSelect: setSelectedReviewNote,
      selectedValue: selectedReviewNote,
      templates: reviewNoteTemplates
    }), /*#__PURE__*/React__default.default.createElement(PreviewReviewBoard, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5F85\u5BA1\u6838\u6A21\u677F\u3002",
      items: data?.templateReviewQueue || [],
      onPreview: setPreviewItem,
      onToggle: templateSelection.toggle,
      onToggleAll: templateSelection.toggleAll,
      selectedIds: templateSelection.selectedIds,
      titleLabel: "\u5F85\u5BA1\u6838\u6A21\u677F"
    }), /*#__PURE__*/React__default.default.createElement(BulkActionBar, {
      onApprove: () => runBulkReview('APPROVED', selectedReviewNote),
      onArchive: () => runBulkReview('REJECTED', selectedReviewNote || '批量归档处理'),
      onRequestChanges: () => runBulkReview('CHANGES_REQUESTED', selectedReviewNote),
      selectedCount: templateSelection.selectedCount,
      submitting: submitting
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.25fr 0.95fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6309\u8FD0\u8425\u4F18\u5148\u7EA7\u5217\u51FA\u6700\u9700\u8981\u5148\u5904\u7406\u7684\u5185\u5BB9\u9879\u3002",
      title: "\u5BA1\u6838\u5DE5\u4F5C\u53F0"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5F85\u5904\u7406\u5185\u5BB9\u3002",
      items: data?.queue || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: item.updatedAtLabel,
        badge: statusLabel(item.status),
        body: item.summary,
        imageUrl: item.previewImageUrl,
        key: `${item.entityType}-${item.entityId}`,
        subtitle: `${item.entityTypeLabel} · ${item.subtitle || '无补充信息'}`,
        title: item.title,
        tone: statusTone(item.status)
      })
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl"
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u5E2E\u52A9\u4F60\u5FEB\u901F\u8BC6\u522B\u5185\u5BB9\u4F9B\u7ED9\u662F\u5426\u504F\u5411\u67D0\u4E2A\u4E3B\u9898\u3002",
      title: "\u5206\u7C7B\u4E0E\u6743\u76CA\u6D1E\u5BDF"
    }, /*#__PURE__*/React__default.default.createElement(InsightStrip, {
      items: (data?.categoryBreakdown || []).map(item => ({
        label: item.categoryName,
        value: `${item.count} 个模板`,
        note: `${item.premiumCount} 个会员模板`
      }))
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u4ECE\u6700\u65B0\u7F16\u8F91\u8BB0\u5F55\u91CC\u89C2\u5BDF\u6700\u8FD1\u7684\u5185\u5BB9\u8282\u594F\u3002",
      title: "\u6700\u8FD1\u6539\u52A8"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u6700\u8FD1\u6CA1\u6709\u5185\u5BB9\u66F4\u65B0\u3002",
      items: data?.latestTemplates || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: item.updatedAtLabel,
        badge: statusLabel(item.status),
        imageUrl: item.previewImageUrl,
        key: item.id,
        subtitle: `${item.categoryName} · ${(item.tags || []).join(' / ') || '无标签'}`,
        title: item.title,
        tone: statusTone(item.status)
      })
    })))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u9700\u8981\u8D28\u68C0\u6216\u6253\u56DE\u4FEE\u6539\u7684\u7D20\u6750\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002",
      title: "\u7D20\u6750\u8D28\u68C0\u961F\u5217"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u7D20\u6750\u8D44\u4EA7\u5F53\u524D\u6CA1\u6709\u5F85\u5904\u7406\u9879\u3002",
      items: data?.assets || [],
      renderItem: asset => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: asset.createdAtLabel,
        badge: statusLabel(asset.reviewStatus),
        body: asset.prompt,
        imageUrl: asset.imageUrl,
        key: asset.id,
        subtitle: asset.userNickname || asset.userId,
        title: asset.title,
        tone: statusTone(asset.reviewStatus)
      })
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u793E\u533A\u5185\u5BB9\u5BA1\u6838\u73B0\u5728\u53EF\u4EE5\u548C\u6A21\u677F\u5BA1\u6838\u5E76\u6392\u5904\u7406\u3002",
      title: "\u793E\u533A\u5185\u5BB9\u6D41"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u793E\u533A\u5F85\u5BA1\u6838\u5185\u5BB9\u3002",
      items: data?.posts || [],
      renderItem: post => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: formatDate(post.updatedAt),
        badge: statusLabel(post.reviewStatus),
        body: post.body,
        imageUrl: post.imageUrl,
        key: post.id,
        subtitle: post.userNickname || post.userId,
        title: post.title,
        tone: statusTone(post.reviewStatus)
      })
    }))), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u628A\u9AD8\u9891\u64CD\u4F5C\u96C6\u4E2D\u5230\u5185\u5BB9\u4E2D\u53F0\u5E95\u90E8\uFF0C\u4FBF\u4E8E\u8FD0\u8425\u540C\u5B66\u5FEB\u901F\u8DF3\u8F6C\u3002",
      title: "\u5185\u5BB9\u5DE5\u4F5C\u6D41\u5165\u53E3"
    }, /*#__PURE__*/React__default.default.createElement(QuickActionGrid, {
      items: quickActions$2
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5F53\u524D\u5185\u5BB9\u4E2D\u53F0\u5DF2\u7ECF\u8865\u4E0A\u56FE\u7247\u9884\u89C8\u548C\u6279\u91CF\u5BA1\u6838\u3002\u4E0B\u4E00\u9636\u6BB5\u5982\u679C\u7EE7\u7EED\u5F80\u5546\u7528\u54C1\u8D28\u5347\u7EA7\uFF0C\u5EFA\u8BAE\u505A\u5BF9\u6BD4\u9884\u89C8\u3001\u5BA1\u6838\u5907\u6CE8\u6A21\u677F\u548C\u6279\u91CF\u6807\u7B7E\u7EF4\u62A4\u3002"))), /*#__PURE__*/React__default.default.createElement(LargePreviewModal, {
      item: previewItem,
      onClose: () => setPreviewItem(null)
    }));
  }

  const quickActions$1 = [{
    label: '任务列表',
    href: '/admin/resources/GenerationJob/actions/list',
    icon: 'Activity'
  }, {
    label: '素材资产',
    href: '/admin/resources/Asset/actions/list',
    icon: 'Image'
  }, {
    label: '系统配置',
    href: '/admin/resources/SystemSetting/actions/list',
    icon: 'Settings'
  }, {
    label: '审计日志',
    href: '/admin/resources/AuditLog/actions/list',
    icon: 'FileText'
  }];
  function JobCommandPage() {
    const {
      loading,
      error,
      notice,
      clearNotice,
      data,
      submit,
      submitting
    } = useAdminPage('jobCommand');
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
    return /*#__PURE__*/React__default.default.createElement(AdminPageShell, {
      actions: quickActions$1,
      description: "\u628A\u751F\u6210\u94FE\u8DEF\u3001\u5931\u8D25\u91CD\u8BD5\u3001\u63D0\u4F9B\u65B9\u72B6\u6001\u548C\u6700\u8FD1\u4EA7\u51FA\u6C47\u603B\u5230\u540C\u4E00\u9875\uFF0C\u9002\u5408\u4F5C\u4E3A\u65E5\u5E38\u503C\u73ED\u4E0E\u5F02\u5E38\u8DDF\u8E2A\u5165\u53E3\u3002",
      eyebrow: "\u4EFB\u52A1\u6307\u6325\u53F0",
      error: error,
      loading: loading,
      notice: notice,
      onDismissNotice: clearNotice,
      title: "\u4EFB\u52A1\u6307\u6325\u53F0"
    }, /*#__PURE__*/React__default.default.createElement(StatGrid, {
      items: [{
        label: '排队中',
        value: data?.stats.queued ?? 0,
        note: '等待处理的任务数',
        icon: 'Clock',
        accent: 'orange'
      }, {
        label: '执行中',
        value: data?.stats.running ?? 0,
        note: '当前正在跑的生成任务',
        icon: 'Play',
        accent: 'purple'
      }, {
        label: '失败任务',
        value: data?.stats.failed ?? 0,
        note: '需要运营或技术关注的异常任务',
        icon: 'AlertCircle',
        accent: 'yellow'
      }, {
        label: '成功率',
        value: `${data?.stats.successRate ?? 0}%`,
        note: '最近一批任务的总体成功表现',
        icon: 'CheckCircle',
        accent: 'mint'
      }]
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.1fr 0.9fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u7528 7 \u5929\u8D8B\u52BF\u56FE\u89C2\u5BDF\u4EFB\u52A1\u6210\u529F\u3001\u5931\u8D25\u548C\u53D6\u6D88\u7684\u6CE2\u52A8\u3002",
      title: "\u4EFB\u52A1\u8D8B\u52BF\u56FE"
    }, /*#__PURE__*/React__default.default.createElement(TrendBars, {
      items: data?.trend || [],
      series: [{
        key: 'succeeded',
        label: '成功',
        color: '#1F8E77'
      }, {
        key: 'failed',
        label: '失败',
        color: '#C20012'
      }, {
        key: 'canceled',
        label: '取消',
        color: '#3040D6'
      }]
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u628A\u5931\u8D25\u539F\u56E0\u505A\u805A\u7C7B\uFF0C\u800C\u4E0D\u662F\u8BA9\u8FD0\u8425\u5728\u4E00\u5806 errorMessage \u91CC\u9010\u6761\u7FFB\u3002",
      title: "\u5931\u8D25\u539F\u56E0\u5206\u7EC4"
    }, /*#__PURE__*/React__default.default.createElement(ReasonGroupList, {
      items: data?.failureReasonGroups || []
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.15fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u5931\u8D25\u4EFB\u52A1\u4F1A\u4F18\u5148\u5C55\u793A\u5F02\u5E38\u539F\u56E0\uFF0C\u4FBF\u4E8E\u51B3\u5B9A\u91CD\u8BD5\u8FD8\u662F\u53D6\u6D88\u3002",
      title: "\u5F02\u5E38\u4EFB\u52A1\u961F\u5217"
    }, /*#__PURE__*/React__default.default.createElement(SelectableFeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5931\u8D25\u4EFB\u52A1\u3002",
      items: data?.failedJobs || [],
      onToggle: failedSelection.toggle,
      onToggleAll: failedSelection.toggleAll,
      renderContent: job => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: job.createdAtLabel,
        badge: statusLabel(job.status),
        body: job.errorMessage || '无错误详情',
        key: job.id,
        subtitle: `${job.provider} · ${job.userNickname || job.userId}`,
        title: job.templateTitle || '自由生成任务',
        tone: statusTone(job.status)
      }),
      selectedIds: failedSelection.selectedIds,
      titleLabel: "\u5931\u8D25\u4EFB\u52A1"
    }), /*#__PURE__*/React__default.default.createElement(BulkActionBar, {
      approveLabel: "\u6279\u91CF\u91CD\u8BD5",
      archiveLabel: "",
      onApprove: retrySelectedJobs,
      onArchive: null,
      onRequestChanges: null,
      selectedCount: failedSelection.selectedCount,
      submitting: submitting
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl"
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u89C2\u5BDF\u4E0A\u6E38\u6A21\u578B\u548C\u5185\u90E8\u4EFB\u52A1\u8C03\u5EA6\u7684\u70ED\u5EA6\u5206\u5E03\u3002",
      title: "\u63D0\u4F9B\u65B9\u70ED\u5EA6"
    }, /*#__PURE__*/React__default.default.createElement(InsightStrip, {
      items: (data?.providerMix || []).map(item => ({
        label: item.provider,
        value: `${item.count} 个任务`,
        note: `失败 ${item.failedCount} / 成功 ${item.succeededCount}`
      }))
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u770B\u4E00\u4E0B\u521A\u521A\u4EA7\u51FA\u7684\u7D20\u6750\uFF0C\u786E\u8BA4\u4E3B\u94FE\u8DEF\u662F\u5426\u7A33\u5B9A\u3002",
      title: "\u6700\u8FD1\u4EA7\u51FA"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u6700\u8FD1\u8FD8\u6CA1\u6709\u65B0\u4EA7\u51FA\u7684\u7D20\u6750\u3002",
      items: data?.latestAssets || [],
      renderItem: asset => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: asset.createdAtLabel,
        badge: statusLabel(asset.reviewStatus),
        body: asset.prompt,
        imageUrl: asset.imageUrl,
        key: asset.id,
        subtitle: asset.userNickname || asset.userId,
        title: asset.title,
        tone: statusTone(asset.reviewStatus)
      })
    })))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u503C\u73ED\u540C\u5B66\u6700\u5E38\u5173\u6CE8\u7684\u8FD0\u884C\u4E2D\u4EFB\u52A1\u3002",
      title: "\u8FD0\u884C\u4E2D\u4EFB\u52A1"
    }, /*#__PURE__*/React__default.default.createElement(SelectableFeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u8FD0\u884C\u4E2D\u4EFB\u52A1\u3002",
      items: data?.activeJobs || [],
      onToggle: activeSelection.toggle,
      onToggleAll: activeSelection.toggleAll,
      renderContent: job => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: job.startedAtLabel || job.createdAtLabel,
        badge: statusLabel(job.status),
        body: job.prompt,
        key: job.id,
        subtitle: `${job.provider} · ${job.userNickname || job.userId}`,
        title: job.templateTitle || '自由生成任务',
        tone: statusTone(job.status)
      }),
      selectedIds: activeSelection.selectedIds,
      titleLabel: "\u8FD0\u884C\u4E2D\u4EFB\u52A1"
    }), /*#__PURE__*/React__default.default.createElement(BulkActionBar, {
      approveLabel: "",
      archiveLabel: "\u6279\u91CF\u53D6\u6D88",
      onApprove: null,
      onArchive: cancelSelectedJobs,
      onRequestChanges: null,
      selectedCount: activeSelection.selectedCount,
      submitting: submitting
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6309\u72B6\u6001\u62C6\u5F00\u770B\u6700\u8FD1\u5904\u7406\u8282\u594F\u3002",
      title: "\u4EFB\u52A1\u8282\u594F\u6D1E\u5BDF"
    }, /*#__PURE__*/React__default.default.createElement(InsightStrip, {
      items: [{
        label: '最近 24 小时成功',
        value: `${data?.timeline.successLast24h ?? 0}`,
        note: '帮助判断链路是否稳定'
      }, {
        label: '最近 24 小时失败',
        value: `${data?.timeline.failedLast24h ?? 0}`,
        note: '快速定位是否有上游抖动'
      }, {
        label: '最近 24 小时取消',
        value: `${data?.timeline.canceledLast24h ?? 0}`,
        note: '观察运营介入比例'
      }]
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5F53\u524D\u4EFB\u52A1\u6307\u6325\u53F0\u5DF2\u7ECF\u8865\u4E0A\u8D8B\u52BF\u56FE\u548C\u5931\u8D25\u539F\u56E0\u5206\u7EC4\u3002\u4E0B\u4E00\u9636\u6BB5\u5982\u679C\u7EE7\u7EED\u5347\u7EA7\uFF0C\u53EF\u4EE5\u63A5\u5165\u81EA\u52A8\u91CD\u8BD5\u7B56\u7565\u3001\u5F02\u5E38\u544A\u8B66\u548C\u6309\u6A21\u677F/\u6E20\u9053\u7EF4\u5EA6\u7684\u5931\u8D25\u805A\u7C7B\u3002")))));
  }

  const quickActions = [{
    label: '套餐配置',
    href: '/admin/resources/SubscriptionPlan/actions/list',
    icon: 'Layers'
  }, {
    label: '订阅列表',
    href: '/admin/resources/Subscription/actions/list',
    icon: 'CreditCard'
  }, {
    label: '订单列表',
    href: '/admin/resources/PaymentOrder/actions/list',
    icon: 'ShoppingCart'
  }, {
    label: '用户管理',
    href: '/admin/resources/User/actions/list',
    icon: 'Users'
  }];
  function RevenueOpsPage() {
    const {
      loading,
      error,
      notice,
      clearNotice,
      data
    } = useAdminPage('revenueOps');
    return /*#__PURE__*/React__default.default.createElement(AdminPageShell, {
      actions: quickActions,
      description: "\u628A\u5957\u9910\u914D\u7F6E\u3001\u8BA2\u9605\u72B6\u6001\u3001\u5F85\u652F\u4ED8\u8BA2\u5355\u548C\u6536\u6B3E\u8868\u73B0\u805A\u5230\u4E00\u4E2A\u5546\u4E1A\u5316\u5DE5\u4F5C\u53F0\uFF0C\u65B9\u4FBF\u8FD0\u8425\u3001\u9500\u552E\u548C\u8D22\u52A1\u534F\u4F5C\u3002",
      eyebrow: "\u5546\u4E1A\u5316\u4E2D\u53F0",
      error: error,
      loading: loading,
      notice: notice,
      onDismissNotice: clearNotice,
      title: "\u5546\u4E1A\u5316\u4E2D\u53F0"
    }, /*#__PURE__*/React__default.default.createElement(StatGrid, {
      items: [{
        label: '活跃订阅',
        value: data?.stats.activeSubscriptions ?? 0,
        note: '当前有效订阅中的用户数量',
        icon: 'CreditCard',
        accent: 'orange'
      }, {
        label: '待支付订单',
        value: data?.stats.pendingOrders ?? 0,
        note: '仍需跟进或催付的订单',
        icon: 'AlertCircle',
        accent: 'yellow'
      }, {
        label: '累计已支付',
        value: formatCurrency(data?.stats.totalPaidCents ?? 0),
        note: '当前库中已确认支付的订单总额',
        icon: 'Wallet',
        accent: 'mint'
      }, {
        label: '订阅转化率',
        value: ratio(data?.stats.conversionRate ?? 0),
        note: '活跃订阅用户占全部用户的比例',
        icon: 'TrendingUp',
        accent: 'purple'
      }]
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.1fr 0.9fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6700\u8FD1 7 \u5929\u6536\u5165\u8D8B\u52BF\uFF0C\u5E2E\u52A9\u4F60\u5224\u65AD\u8F6C\u5316\u6CE2\u52A8\u548C\u6536\u6B3E\u56DE\u6D41\u8282\u594F\u3002",
      title: "\u6309\u5929\u6536\u5165\u5BF9\u6BD4\u56FE"
    }, /*#__PURE__*/React__default.default.createElement(TrendBars, {
      items: data?.revenueTrend || [],
      series: [{
        key: 'currentPaidCents',
        label: '最近 7 天',
        color: '#1F8E77'
      }, {
        key: 'previousPaidCents',
        label: '上一周期',
        color: '#3040D6'
      }]
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u4E34\u8FD1\u7EED\u8D39\u7684\u8BA2\u9605\u7528\u6237\u5E94\u5F53\u63D0\u524D\u63D0\u9192\u6216\u91CD\u70B9\u8DDF\u8FDB\u3002",
      title: "\u7EED\u8D39\u63D0\u9192\u5361\u7247"
    }, /*#__PURE__*/React__default.default.createElement(RenewalCards, {
      items: data?.renewalReminders || []
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1.15fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u7ED3\u5408\u5957\u9910\u5206\u5E03\u548C\u6536\u5165\u6784\u6210\uFF0C\u5FEB\u901F\u5224\u65AD\u5F53\u524D\u4E3B\u8981\u589E\u957F\u6765\u6E90\u3002",
      title: "\u5957\u9910\u6536\u5165\u7ED3\u6784"
    }, /*#__PURE__*/React__default.default.createElement(InsightStrip, {
      items: (data?.planMix || []).map(plan => ({
        label: plan.name,
        value: `${plan.activeSubscriptions} 个订阅`,
        note: `订单累计 ${formatCurrency(plan.paidCents)}`
      }))
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6309\u652F\u4ED8\u6E20\u9053\u770B\u6536\u5165\u5F52\u56E0\uFF0C\u5E2E\u52A9\u5224\u65AD\u6536\u6B3E\u8DEF\u5F84\u548C\u8FD0\u8425\u5F15\u5BFC\u6548\u679C\u3002",
      title: "\u6E20\u9053\u5F52\u56E0"
    }, /*#__PURE__*/React__default.default.createElement(InsightStrip, {
      items: (data?.channelMix || []).map(item => ({
        label: item.channel === 'unknown' ? '未标记渠道' : item.channel,
        value: formatCurrency(item.paidCents),
        note: `${item.count} 笔支付订单`
      }))
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "grid",
      gap: "xl",
      gridTemplateColumns: ['1fr', '1fr', '1fr 1fr']
    }, /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u4F18\u5148\u8DDF\u8FDB\u5F85\u652F\u4ED8\u8BA2\u5355\u548C\u4E34\u8FD1\u5230\u671F\u8BA2\u9605\u3002",
      title: "\u5F85\u5904\u7406\u5546\u4E1A\u52A8\u4F5C"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5F85\u8DDF\u8FDB\u5546\u4E1A\u4E8B\u9879\u3002",
      items: data?.followUps || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: item.meta,
        badge: item.badge,
        body: item.note,
        key: item.id,
        subtitle: item.subtitle,
        title: item.title,
        tone: item.tone
      })
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6700\u8FD1\u652F\u4ED8\u6210\u529F\u7684\u8BA2\u5355\uFF0C\u5E2E\u52A9\u4F60\u5FEB\u901F\u786E\u8BA4\u6536\u5165\u56DE\u6D41\u3002",
      title: "\u6700\u8FD1\u652F\u4ED8"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u5DF2\u652F\u4ED8\u8BA2\u5355\u3002",
      items: data?.paidOrders || [],
      renderItem: order => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: order.paidAtLabel,
        badge: statusLabel(order.status),
        body: formatCurrency(order.amountCents),
        key: order.id,
        subtitle: `${order.userNickname || order.userId} · ${order.planName || order.planId || '未绑定套餐'}`,
        title: order.orderNo,
        tone: statusTone(order.status)
      })
    })), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u6700\u8FD1\u65B0\u589E\u6216\u53D8\u66F4\u7684\u8BA2\u9605\u72B6\u6001\u3002",
      title: "\u8BA2\u9605\u52A8\u6001"
    }, /*#__PURE__*/React__default.default.createElement(FeedList, {
      empty: "\u5F53\u524D\u6CA1\u6709\u6700\u8FD1\u8BA2\u9605\u53D8\u66F4\u3002",
      items: data?.subscriptions || [],
      renderItem: item => /*#__PURE__*/React__default.default.createElement(FeedRow, {
        aside: item.renewalAtLabel,
        badge: statusLabel(item.status),
        body: item.autoRenew ? '自动续费开启' : '自动续费关闭',
        key: item.id,
        subtitle: item.userNickname || item.userId,
        title: item.planName || item.planId,
        tone: statusTone(item.status)
      })
    }))), /*#__PURE__*/React__default.default.createElement(PanelCard, {
      description: "\u5546\u4E1A\u5316\u4E2D\u53F0\u4F1A\u957F\u671F\u670D\u52A1\u8FD0\u8425\u548C\u9500\u552E\u3002\u540E\u7EED\u53EF\u4EE5\u7EE7\u7EED\u8865\u53D1\u7968\u3001\u6E20\u9053\u6765\u6E90\u3001\u9000\u6B3E\u539F\u56E0\u548C\u6309\u5468\u671F\u6536\u5165\u8D8B\u52BF\u3002",
      title: "\u5FEB\u6377\u5165\u53E3"
    }, /*#__PURE__*/React__default.default.createElement(QuickActionGrid, {
      items: quickActions
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      mt: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5F53\u524D\u5DF2\u7ECF\u8865\u4E0A\u6536\u5165\u8D8B\u52BF\u548C\u7EED\u8D39\u63D0\u9192\u5361\u7247\u3002\u4E0B\u4E00\u6B65\u5982\u679C\u7EE7\u7EED\u5F80\u5546\u7528\u54C1\u8D28\u63A8\u8FDB\uFF0C\u5EFA\u8BAE\u505A\u6E20\u9053\u5F52\u56E0\u3001\u5E94\u6536\u6B3E\u770B\u677F\u3001\u53D1\u7968\u6D41\u8F6C\u548C\u8BA2\u9605\u751F\u547D\u5468\u671F\u5206\u6790\u3002"))));
  }

  const BrandLink = styledComponents.styled(reactRouterDom.Link)`
  display: block;
  padding: 20px 24px 12px;
  text-decoration: none;
`;
  function SidebarBranding() {
    return /*#__PURE__*/React__default.default.createElement(BrandLink, {
      to: "/admin"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      borderBottom: "1px solid",
      borderColor: "grey20",
      pb: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      gap: "default",
      mb: "sm"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      bg: "primary100",
      borderRadius: "lg",
      color: "white",
      display: "inline-flex",
      fontSize: "20px",
      height: "38px",
      justifyContent: "center",
      width: "38px"
    }, "\uD83D\uDC30"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey100",
      fontWeight: "700"
    }, "\u5154\u5154\u89C6\u89C9"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      fontSize: "sm"
    }, "\u8FD0\u8425\u540E\u53F0 v2"))), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60",
      fontSize: "sm",
      lineHeight: "lg"
    }, "\u8FD0\u8425\u63A7\u5236\u53F0")));
  }

  function SidebarFooter() {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      color: "grey60",
      "data-css": "sidebar-footer",
      mt: "xl",
      px: "xl",
      py: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "filterBg",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "700",
      mb: "sm"
    }, "\u8FD0\u8425\u5E95\u5EA7"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      lineHeight: "lg"
    }, "Fastify 5 \xB7 Prisma \xB7 PostgreSQL"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      lineHeight: "lg"
    }, "\u5154\u5154\u667A\u80FD\u89C6\u89C9\u521B\u610F\u8BBE\u8BA1\u5DE5\u4F5C\u53F0")));
  }

  const pageLabels = {
    contentStudio: '内容中台',
    jobCommand: '任务指挥台',
    revenueOps: '商业化中台'
  };
  function SideLink({
    href,
    icon,
    label,
    active
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: reactRouterDom.Link,
      alignItems: "center",
      bg: active ? 'filterBg' : 'transparent',
      borderRadius: "lg",
      color: active ? 'primary100' : 'grey80',
      display: "flex",
      gap: "default",
      px: "lg",
      py: "md",
      style: {
        textDecoration: 'none'
      },
      to: href
    }, icon ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: icon
    }) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: active ? '700' : '400'
    }, label));
  }
  function SidebarPages({
    pages
  }) {
    const location = reactRouterDom.useLocation();
    if (!pages?.length) return null;
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      px: "xl",
      py: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      mb: "md",
      pl: "lg",
      uppercase: true
    }, "\u8FD0\u8425\u5DE5\u4F5C\u53F0"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "nav",
      display: "flex",
      flexDirection: "column",
      gap: "sm"
    }, pages.map(page => /*#__PURE__*/React__default.default.createElement(SideLink, {
      active: location.pathname.includes(`/pages/${page.name}`),
      href: `/admin/pages/${page.name}`,
      icon: page.icon,
      key: page.name,
      label: pageLabels[page.name] || page.name
    }))));
  }

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
  function ResourceLink({
    href,
    label,
    active
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: reactRouterDom.Link,
      bg: active ? 'filterBg' : 'transparent',
      borderRadius: "lg",
      color: active ? 'primary100' : 'grey80',
      display: "block",
      px: "lg",
      py: "sm",
      style: {
        textDecoration: 'none'
      },
      to: href
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: active ? '700' : '400'
    }, label));
  }
  function SidebarResourceSection({
    resources
  }) {
    const location = reactRouterDom.useLocation();
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
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      px: "xl",
      py: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      mb: "md",
      pl: "lg",
      uppercase: true
    }, "\u8D44\u6E90\u5BFC\u822A"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "nav",
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, Object.entries(grouped).map(([groupName, group]) => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: groupName
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      color: "grey60",
      display: "flex",
      gap: "default",
      mb: "sm",
      px: "lg"
    }, group.icon ? /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: group.icon
    }) : null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "700"
    }, groupLabels[groupName] || groupName)), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "sm"
    }, group.resources.map(resource => /*#__PURE__*/React__default.default.createElement(ResourceLink, {
      active: location.pathname.startsWith(resource.href),
      href: resource.href,
      key: resource.id,
      label: resourceLabels[resource.id] || resourceLabels[resource.name] || resource.name
    })))))));
  }

  const primaryNavItems = [{
    id: 'dashboard',
    label: '驾驶舱',
    icon: 'Home',
    href: '/admin'
  }, {
    id: 'users',
    label: '用户',
    icon: 'Users',
    href: '/admin/resources/User'
  }, {
    id: 'content',
    label: '内容',
    icon: 'Layout',
    href: '/admin/pages/contentStudio'
  }, {
    id: 'jobs',
    label: '任务',
    icon: 'Activity',
    href: '/admin/pages/jobCommand'
  }, {
    id: 'revenue',
    label: '商业化',
    icon: 'CreditCard',
    href: '/admin/pages/revenueOps'
  }, {
    id: 'system',
    label: '系统',
    icon: 'Settings',
    href: '/admin/resources/SystemSetting'
  }];
  const sidebarSections = {
    dashboard: [{
      label: '总览',
      items: [{
        label: '运营驾驶舱',
        href: '/admin',
        icon: 'Home'
      }]
    }],
    users: [{
      label: '用户与会员',
      items: [{
        label: '创作者用户',
        href: '/admin/resources/User',
        icon: 'Users'
      }]
    }],
    content: [{
      label: '工作台',
      items: [{
        label: '内容中台',
        href: '/admin/pages/contentStudio',
        icon: 'Layout'
      }]
    }, {
      label: '模板体系',
      items: [{
        label: '模板分类',
        href: '/admin/resources/TemplateCategory',
        icon: 'Folder'
      }, {
        label: '模板库',
        href: '/admin/resources/Template',
        icon: 'FileText'
      }]
    }, {
      label: '审核与素材',
      items: [{
        label: '审核记录',
        href: '/admin/resources/ContentReview',
        icon: 'Shield'
      }, {
        label: '素材资产',
        href: '/admin/resources/Asset',
        icon: 'Image'
      }, {
        label: '社区内容',
        href: '/admin/resources/CommunityPost',
        icon: 'MessageSquare'
      }]
    }],
    jobs: [{
      label: '工作台',
      items: [{
        label: '任务指挥台',
        href: '/admin/pages/jobCommand',
        icon: 'Activity'
      }]
    }, {
      label: '任务中心',
      items: [{
        label: '生成任务',
        href: '/admin/resources/GenerationJob',
        icon: 'PlayCircle'
      }]
    }],
    revenue: [{
      label: '工作台',
      items: [{
        label: '商业化中台',
        href: '/admin/pages/revenueOps',
        icon: 'CreditCard'
      }]
    }, {
      label: '套餐与订单',
      items: [{
        label: '订阅套餐',
        href: '/admin/resources/SubscriptionPlan',
        icon: 'Layers'
      }, {
        label: '订阅关系',
        href: '/admin/resources/Subscription',
        icon: 'Repeat'
      }, {
        label: '支付订单',
        href: '/admin/resources/PaymentOrder',
        icon: 'ShoppingCart'
      }]
    }],
    system: [{
      label: '后台控制',
      items: [{
        label: '后台账号',
        href: '/admin/resources/AdminUser',
        icon: 'UserCheck'
      }, {
        label: '系统配置',
        href: '/admin/resources/SystemSetting',
        icon: 'Settings'
      }, {
        label: '审计日志',
        href: '/admin/resources/AuditLog',
        icon: 'FileText'
      }]
    }]
  };
  function getActivePrimaryId(pathname) {
    if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/dashboard')) {
      return 'dashboard';
    }
    if (pathname.startsWith('/admin/pages/contentStudio') || pathname.startsWith('/admin/resources/Template') || pathname.startsWith('/admin/resources/TemplateCategory') || pathname.startsWith('/admin/resources/ContentReview') || pathname.startsWith('/admin/resources/Asset') || pathname.startsWith('/admin/resources/CommunityPost')) {
      return 'content';
    }
    if (pathname.startsWith('/admin/pages/jobCommand') || pathname.startsWith('/admin/resources/GenerationJob')) {
      return 'jobs';
    }
    if (pathname.startsWith('/admin/pages/revenueOps') || pathname.startsWith('/admin/resources/SubscriptionPlan') || pathname.startsWith('/admin/resources/Subscription') || pathname.startsWith('/admin/resources/PaymentOrder')) {
      return 'revenue';
    }
    if (pathname.startsWith('/admin/resources/AdminUser') || pathname.startsWith('/admin/resources/SystemSetting') || pathname.startsWith('/admin/resources/AuditLog')) {
      return 'system';
    }
    if (pathname.startsWith('/admin/resources/User')) {
      return 'users';
    }
    return 'dashboard';
  }

  const StyledSidebar = styledComponents.styled(designSystem.Box)`
  top: 0;
  bottom: 0;
  overflow-y: auto;
  width: ${({
  theme
}) => theme.sizes.sidebarWidth};
  border-right: ${({
  theme
}) => theme.borders.default};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: ${({
  theme
}) => theme.colors.sidebar};
  transition: left 0.25s ease-in-out;

  &.hidden {
    left: -${({
  theme
}) => theme.sizes.sidebarWidth};
  }

  &.visible {
    left: 0;
  }
`;
  StyledSidebar.defaultProps = {
    position: ['absolute', 'absolute', 'absolute', 'absolute', 'initial'],
    zIndex: 50
  };
  function Sidebar({
    isVisible
  }) {
    const location = reactRouterDom.useLocation();
    const activePrimaryId = getActivePrimaryId(location.pathname);
    const sections = sidebarSections[activePrimaryId] || [];
    return /*#__PURE__*/React__default.default.createElement(StyledSidebar, {
      className: isVisible ? 'visible' : 'hidden',
      "data-css": "sidebar"
    }, /*#__PURE__*/React__default.default.createElement(SidebarBranding, null), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      flexGrow: 1
    }, sections.map(section => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      key: section.label
    }, /*#__PURE__*/React__default.default.createElement(SectionTitle, null, section.label), /*#__PURE__*/React__default.default.createElement(SectionList, {
      items: section.items,
      pathname: location.pathname
    })))), /*#__PURE__*/React__default.default.createElement(SidebarFooter, null));
  }
  function SectionTitle({
    children
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      color: "grey60",
      fontWeight: "700",
      px: "xl",
      pt: "xl",
      pb: "sm"
    }, children);
  }
  function SectionList({
    items,
    pathname
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
      px: "lg"
    }, items.map(item => {
      const active = pathname.startsWith(item.href) || pathname === item.href;
      return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        as: "a",
        bg: active ? 'filterBg' : 'transparent',
        borderRadius: "lg",
        color: active ? 'primary100' : 'grey80',
        href: item.href,
        key: item.href,
        px: "lg",
        py: "sm",
        style: {
          textDecoration: 'none',
          display: 'block'
        }
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        display: "flex",
        flexDirection: "column",
        gap: "xs"
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
        fontWeight: active ? '700' : '500'
      }, item.label)));
    }));
  }

  function PrimaryNavLink({
    href,
    icon,
    label,
    active
  }) {
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: reactRouterDom.Link,
      alignItems: "center",
      bg: active ? 'primary100' : 'transparent',
      border: "1px solid",
      borderColor: active ? 'primary100' : 'grey20',
      borderRadius: "pill",
      color: active ? 'white' : 'grey80',
      display: "inline-flex",
      gap: "sm",
      px: "lg",
      py: "sm",
      style: {
        textDecoration: 'none',
        whiteSpace: 'nowrap'
      },
      to: href
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: icon,
      size: 14
    }), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "700"
    }, label));
  }
  function TopBar({
    toggleSidebar
  }) {
    const location = reactRouterDom.useLocation();
    const session = reactRedux.useSelector(state => state.session);
    const paths = reactRedux.useSelector(state => state.paths);
    const activePrimaryId = getActivePrimaryId(location.pathname);
    return /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      bg: "white",
      borderBottom: "1px solid",
      borderColor: "grey20",
      display: "flex",
      gap: "xl",
      height: "64px",
      px: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: ['inline-flex', 'inline-flex', 'none'],
      onClick: toggleSidebar,
      style: {
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Icon, {
      icon: "Menu",
      size: 24
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      flex: "1",
      gap: "lg",
      overflowX: "auto"
    }, primaryNavItems.map(item => /*#__PURE__*/React__default.default.createElement(PrimaryNavLink, {
      active: item.id === activePrimaryId,
      href: item.href,
      icon: item.icon,
      key: item.id,
      label: item.label
    }))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      alignItems: "center",
      display: "flex",
      gap: "lg"
    }, session?.email ? /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, session.email) : null, paths?.logoutPath ? /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      as: "a",
      href: paths.logoutPath,
      size: "sm",
      variant: "outlined"
    }, "\u9000\u51FA\u767B\u5F55") : null));
  }

  const Wrapper = styledComponents.styled(designSystem.Box)`
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(108, 92, 231, 0.16), transparent 30%),
    radial-gradient(circle at top left, rgba(255, 107, 53, 0.18), transparent 24%),
    #f8f9fa;
`;
  const PromoPanel = styledComponents.styled(designSystem.Box)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #ff6b35 0%, #ff9156 48%, #6c5ce7 100%);
`;
  const LoginCard = styledComponents.styled(designSystem.Box)`
  overflow: hidden;
  border-radius: 28px;
`;
  const RabbitMark = styledComponents.styled(designSystem.Box)`
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  backdrop-filter: blur(8px);
`;
  const FeatureChip = ({
    icon,
    text
  }) => /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
    alignItems: "center",
    bg: "rgba(255,255,255,0.16)",
    borderRadius: "pill",
    color: "white",
    display: "inline-flex",
    gap: "sm",
    px: "lg",
    py: "sm"
  }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, icon), /*#__PURE__*/React__default.default.createElement(designSystem.Text, null, text));
  const Login = () => {
    const {
      action,
      errorMessage
    } = window.__APP_STATE__;
    const branding = reactRedux.useSelector(state => state.branding);
    return /*#__PURE__*/React__default.default.createElement(Wrapper, {
      display: "flex",
      flexDirection: "column",
      p: ['lg', 'xxl']
    }, /*#__PURE__*/React__default.default.createElement(LoginCard, {
      bg: "white",
      boxShadow: "login",
      display: "flex",
      flexDirection: ['column', 'column', 'row'],
      maxWidth: "1120px",
      width: "100%"
    }, /*#__PURE__*/React__default.default.createElement(PromoPanel, {
      color: "white",
      display: ['block'],
      p: "xxl",
      width: ['100%', '100%', '46%']
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl",
      height: "100%",
      justifyContent: "space-between"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "xl"
    }, /*#__PURE__*/React__default.default.createElement(RabbitMark, null, "\uD83D\uDC30"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      fontWeight: "700",
      letterSpacing: "0.08em",
      mb: "lg",
      textTransform: "uppercase"
    }, "\u5154\u5154\u89C6\u89C9\u8FD0\u8425\u540E\u53F0 v2"), /*#__PURE__*/React__default.default.createElement(designSystem.H2, {
      color: "white",
      marginBottom: "xl"
    }, "\u8BA9\u6A21\u677F\u8FD0\u8425\u3001\u4EFB\u52A1\u8C03\u5EA6\u3001\u5546\u4E1A\u5316\u7BA1\u7406\u771F\u6B63\u50CF\u4E00\u6B3E\u4EA7\u54C1\uFF0C\u800C\u4E0D\u662F\u4E00\u5F20\u6570\u636E\u8868\u3002"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "rgba(255,255,255,0.86)",
      lineHeight: "xl"
    }, "\u8FD9\u5957\u540E\u53F0\u56F4\u7ED5 Prisma \u4E0E PostgreSQL \u5B9E\u65F6\u6570\u636E\u6784\u5EFA\uFF0C\u91CD\u70B9\u670D\u52A1\u6A21\u677F\u5BA1\u6838\u3001\u7528\u6237\u914D\u989D\u3001\u751F\u6210\u5F02\u5E38\u3001\u8BA2\u5355\u8DDF\u8FDB\u548C\u7CFB\u7EDF\u914D\u7F6E\u7B49\u9AD8\u9891\u8FD0\u8425\u573A\u666F\u3002"))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexWrap: "wrap",
      gap: "default"
    }, /*#__PURE__*/React__default.default.createElement(FeatureChip, {
      icon: "\u26A1",
      text: "\u4EFB\u52A1\u6307\u6325\u53F0"
    }), /*#__PURE__*/React__default.default.createElement(FeatureChip, {
      icon: "\uD83E\uDDFE",
      text: "\u5546\u4E1A\u5316\u5DE5\u4F5C\u53F0"
    }), /*#__PURE__*/React__default.default.createElement(FeatureChip, {
      icon: "\uD83D\uDEE1\uFE0F",
      text: "\u5185\u5BB9\u5BA1\u6838\u6D41"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "rgba(255,255,255,0.16)",
      borderRadius: "xl",
      p: "xl"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Badge, {
      bg: "white",
      color: "primary100",
      mb: "lg"
    }, "\u5F00\u53D1\u73AF\u5883\u9ED8\u8BA4\u8D26\u53F7"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "white",
      mb: "sm"
    }, "\u7BA1\u7406\u5458\uFF1Aadmin@tutu.local / TutuAdmin123!"), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "rgba(255,255,255,0.9)"
    }, "\u8FD0\u8425\uFF1Aoperator@tutu.local / TutuOperator123!"))))), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      as: "form",
      action: action,
      display: "flex",
      flexDirection: "column",
      gap: "xl",
      justifyContent: "center",
      method: "POST",
      p: "xxl",
      width: ['100%', '100%', '54%']
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Box, null, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "primary100",
      fontWeight: "700",
      mb: "lg",
      textTransform: "uppercase"
    }, "Welcome Back"), /*#__PURE__*/React__default.default.createElement(designSystem.H5, {
      marginBottom: "default"
    }, branding.companyName || '兔兔视觉后台管理'), /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u4F7F\u7528\u7BA1\u7406\u5458\u6216\u8FD0\u8425\u8D26\u53F7\u767B\u5F55\uFF0C\u8FDB\u5165\u4E13\u7528\u5DE5\u4F5C\u53F0\u3002")), errorMessage ? /*#__PURE__*/React__default.default.createElement(designSystem.MessageBox, {
      message: errorMessage,
      variant: "danger"
    }) : null, /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "\u7BA1\u7406\u5458\u90AE\u7BB1"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      name: "email",
      placeholder: "admin@tutu.local"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, null, /*#__PURE__*/React__default.default.createElement(designSystem.Label, {
      required: true
    }, "\u5BC6\u7801"), /*#__PURE__*/React__default.default.createElement(designSystem.Input, {
      autoComplete: "new-password",
      name: "password",
      placeholder: "\u8F93\u5165\u540E\u53F0\u5BC6\u7801",
      type: "password"
    })), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      display: "flex",
      flexDirection: "column",
      gap: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Button, {
      size: "lg",
      variant: "contained"
    }, "\u8FDB\u5165\u8FD0\u8425\u540E\u53F0"), /*#__PURE__*/React__default.default.createElement(designSystem.Box, {
      bg: "filterBg",
      border: "1px solid",
      borderColor: "grey20",
      borderRadius: "xl",
      p: "lg"
    }, /*#__PURE__*/React__default.default.createElement(designSystem.Text, {
      color: "grey60"
    }, "\u5F53\u524D\u7248\u672C\u91CD\u70B9\u5F3A\u5316\u4E86\u54C1\u724C\u611F\u3001\u8FD0\u8425\u5DE5\u4F5C\u53F0\u548C\u9AD8\u9891\u52A8\u4F5C\u5165\u53E3\u3002\u5E95\u5C42\u6570\u636E\u4ECD\u7136\u6765\u81EA\u540C\u4E00\u5957 Fastify + Prisma \u540E\u7AEF\u3002"))))));
  };

  AdminJS.UserComponents = {};
  AdminJS.UserComponents.OperationsDashboard = OperationsDashboard;
  AdminJS.UserComponents.ContentStudioPage = ContentStudioPage;
  AdminJS.UserComponents.JobCommandPage = JobCommandPage;
  AdminJS.UserComponents.RevenueOpsPage = RevenueOpsPage;
  AdminJS.UserComponents.SidebarBranding = SidebarBranding;
  AdminJS.UserComponents.SidebarFooter = SidebarFooter;
  AdminJS.UserComponents.SidebarPages = SidebarPages;
  AdminJS.UserComponents.SidebarResourceSection = SidebarResourceSection;
  AdminJS.UserComponents.Sidebar = Sidebar;
  AdminJS.UserComponents.TopBar = TopBar;
  AdminJS.UserComponents.Login = Login;

})(React, AdminJSDesignSystem, AdminJS, ReactRouterDOM, styled, ReactRedux);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvYWRtaW4vc2hhcmVkLmpzeCIsIi4uL3NyYy9hZG1pbi9kYXNoYm9hcmQuanN4IiwiLi4vc3JjL2FkbWluL2NvbnRlbnQtc3R1ZGlvLmpzeCIsIi4uL3NyYy9hZG1pbi9qb2ItY29tbWFuZC5qc3giLCIuLi9zcmMvYWRtaW4vcmV2ZW51ZS1vcHMuanN4IiwiLi4vc3JjL2FkbWluL3NpZGViYXItYnJhbmRpbmcuanN4IiwiLi4vc3JjL2FkbWluL3NpZGViYXItZm9vdGVyLmpzeCIsIi4uL3NyYy9hZG1pbi9zaWRlYmFyLXBhZ2VzLmpzeCIsIi4uL3NyYy9hZG1pbi9zaWRlYmFyLXJlc291cmNlLXNlY3Rpb24uanN4IiwiLi4vc3JjL2FkbWluL25hdi1jb25maWcuanMiLCIuLi9zcmMvYWRtaW4vc2lkZWJhci5qc3giLCIuLi9zcmMvYWRtaW4vdG9wLWJhci5qc3giLCIuLi9zcmMvYWRtaW4vbG9naW4uanN4IiwiZW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSAnYWRtaW5qcyc7XG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQm94LFxuICBCdXR0b24sXG4gIEgyLFxuICBIMyxcbiAgSDQsXG4gIEg1LFxuICBJY29uLFxuICBJbGx1c3RyYXRpb24sXG4gIExvYWRlcixcbiAgTWVzc2FnZUJveCxcbiAgVGV4dFxufSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuY29uc3QgYXBpID0gbmV3IEFwaUNsaWVudCgpO1xuXG5jb25zdCB0b25lTWFwID0ge1xuICBzdWNjZXNzOiAnc3VjY2VzcycsXG4gIHdhcm5pbmc6ICdpbmZvJyxcbiAgZXJyb3I6ICdkYW5nZXInLFxuICBpbmZvOiAncHJpbWFyeScsXG4gIG5ldXRyYWw6ICdsaWdodCdcbn07XG5cbmNvbnN0IGNvbG9yTWFwID0ge1xuICBvcmFuZ2U6ICdwcmltYXJ5MTAwJyxcbiAgb3JhbmdlU29mdDogJyNGRkY0RUYnLFxuICBwdXJwbGU6ICdhY2NlbnQnLFxuICB5ZWxsb3c6ICcjRTE5QTE5JyxcbiAgY3lhbjogJyMwMDhEQTYnLFxuICBtaW50OiAnIzFGOEU3NycsXG4gIGRhcms6ICdncmV5MTAwJ1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUFkbWluUGFnZShwYWdlTmFtZSkge1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW3N1Ym1pdHRpbmcsIHNldFN1Ym1pdHRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcblxuICBjb25zdCBsb2FkID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IHBhZ2VOYW1lXG4gICAgICAgID8gYXdhaXQgYXBpLmdldFBhZ2UoeyBwYWdlTmFtZSB9KVxuICAgICAgICA6IGF3YWl0IGFwaS5nZXREYXNoYm9hcmQoKTtcblxuICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIHx8IHJlc3BvbnNlKTtcbiAgICAgIHNldEVycm9yKCcnKTtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhIHx8IHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGVycj8ubWVzc2FnZSB8fCAn6aG16Z2i5pWw5o2u5Yqg6L295aSx6LSlJztcbiAgICAgIHNldEVycm9yKG1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH0sIFtwYWdlTmFtZV0pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IG1vdW50ZWQgPSB0cnVlO1xuXG4gICAgYXN5bmMgZnVuY3Rpb24gYm9vdCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gcGFnZU5hbWVcbiAgICAgICAgICA/IGF3YWl0IGFwaS5nZXRQYWdlKHsgcGFnZU5hbWUgfSlcbiAgICAgICAgICA6IGF3YWl0IGFwaS5nZXREYXNoYm9hcmQoKTtcblxuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgc2V0RGF0YShyZXNwb25zZS5kYXRhIHx8IHJlc3BvbnNlKTtcbiAgICAgICAgc2V0RXJyb3IoJycpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICghbW91bnRlZCkgcmV0dXJuO1xuICAgICAgICBzZXRFcnJvcihlcnI/Lm1lc3NhZ2UgfHwgJ+mhtemdouaVsOaNruWKoOi9veWksei0pScpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGJvb3QoKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgbW91bnRlZCA9IGZhbHNlO1xuICAgIH07XG4gIH0sIFtwYWdlTmFtZV0pO1xuXG4gIGNvbnN0IHN1Ym1pdCA9IHVzZUNhbGxiYWNrKGFzeW5jIChwYXlsb2FkLCByZXF1ZXN0T3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgaWYgKCFwYWdlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXNoYm9hcmQgZG9lcyBub3Qgc3VwcG9ydCBtdXRhdGlvbnMnKTtcbiAgICB9XG5cbiAgICBzZXRTdWJtaXR0aW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5nZXRQYWdlKHtcbiAgICAgICAgcGFnZU5hbWUsXG4gICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICBkYXRhOiBwYXlsb2FkLFxuICAgICAgICAuLi5yZXF1ZXN0T3B0aW9uc1xuICAgICAgfSk7XG4gICAgICBjb25zdCBuZXh0RGF0YSA9IHJlc3BvbnNlLmRhdGEgfHwgcmVzcG9uc2U7XG4gICAgICBzZXREYXRhKG5leHREYXRhKTtcbiAgICAgIHNldEVycm9yKCcnKTtcbiAgICAgIGlmIChuZXh0RGF0YS5ub3RpY2UpIHtcbiAgICAgICAgc2V0Tm90aWNlKG5leHREYXRhLm5vdGljZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dERhdGE7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZXJyPy5tZXNzYWdlIHx8ICfmj5DkuqTmk43kvZzlpLHotKUnO1xuICAgICAgc2V0Tm90aWNlKHsgbWVzc2FnZSwgdHlwZTogJ2Vycm9yJyB9KTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0U3VibWl0dGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbcGFnZU5hbWVdKTtcblxuICByZXR1cm4ge1xuICAgIGxvYWRpbmcsXG4gICAgc3VibWl0dGluZyxcbiAgICBlcnJvcixcbiAgICBub3RpY2UsXG4gICAgZGF0YSxcbiAgICByZWxvYWQ6IGxvYWQsXG4gICAgc3VibWl0LFxuICAgIGNsZWFyTm90aWNlOiAoKSA9PiBzZXROb3RpY2UobnVsbCksXG4gICAgc2V0Tm90aWNlXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZG1pblBhZ2VTaGVsbCh7XG4gIGV5ZWJyb3csXG4gIHRpdGxlLFxuICBkZXNjcmlwdGlvbixcbiAgYWN0aW9ucyA9IFtdLFxuICBsb2FkaW5nLFxuICBlcnJvcixcbiAgbm90aWNlLFxuICBvbkRpc21pc3NOb3RpY2UsXG4gIGNoaWxkcmVuXG59KSB7XG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInhsXCIgcHk9XCJ4eGxcIj5cbiAgICAgICAgPExvYWRlciAvPlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPuato+WcqOWKoOi9veWQjuWPsOW3peS9nOWPsOKApjwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgICk7XG4gIH1cblxuICBpZiAoZXJyb3IpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveFxuICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgYmc9XCJ3aGl0ZVwiXG4gICAgICAgIGJvcmRlcj1cIjFweCBzb2xpZFwiXG4gICAgICAgIGJvcmRlckNvbG9yPVwiZGFuZ2VyXCJcbiAgICAgICAgYm9yZGVyUmFkaXVzPVwieGxcIlxuICAgICAgICBib3hTaGFkb3c9XCJjYXJkXCJcbiAgICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgZ2FwPVwieGxcIlxuICAgICAgICBwPVwieHhsXCJcbiAgICAgID5cbiAgICAgICAgPElsbHVzdHJhdGlvbiB2YXJpYW50PVwiUm9ja2V0XCIgd2lkdGg9ezIyMH0gLz5cbiAgICAgICAgPEg0PuW3peS9nOWPsOaaguaXtuS4jeWPr+eUqDwvSDQ+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+e2Vycm9yfTwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwieHhsXCI+XG4gICAgICB7bm90aWNlID8gKFxuICAgICAgICA8TWVzc2FnZUJveFxuICAgICAgICAgIG1lc3NhZ2U9e25vdGljZS5tZXNzYWdlfVxuICAgICAgICAgIG9uQ2xvc2VDbGljaz17b25EaXNtaXNzTm90aWNlfVxuICAgICAgICAgIHZhcmlhbnQ9e25vdGljZS50eXBlID09PSAnZXJyb3InID8gJ2RhbmdlcicgOiBub3RpY2UudHlwZSA9PT0gJ2luZm8nID8gJ2luZm8nIDogJ3N1Y2Nlc3MnfVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8SGVyb1BhbmVsIGV5ZWJyb3c9e2V5ZWJyb3d9IHRpdGxlPXt0aXRsZX0gZGVzY3JpcHRpb249e2Rlc2NyaXB0aW9ufSBhY3Rpb25zPXthY3Rpb25zfSAvPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSGVyb1BhbmVsKHsgZXllYnJvdywgdGl0bGUsIGRlc2NyaXB0aW9uLCBhY3Rpb25zID0gW10gfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgYm9yZGVyPVwiMXB4IHNvbGlkXCJcbiAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgIGJvcmRlclJhZGl1cz1cInhsXCJcbiAgICAgIGJveFNoYWRvdz1cImNhcmRcIlxuICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgZmxleERpcmVjdGlvbj17Wydjb2x1bW4nLCAnY29sdW1uJywgJ3JvdyddfVxuICAgICAgZ2FwPVwieHhsXCJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiXG4gICAgICBvdmVyZmxvdz1cImhpZGRlblwiXG4gICAgICBwPVwieHhsXCJcbiAgICAgIHBvc2l0aW9uPVwicmVsYXRpdmVcIlxuICAgID5cbiAgICAgIDxCb3hcbiAgICAgICAgYmc9XCJmaWx0ZXJCZ1wiXG4gICAgICAgIGhlaWdodD1cIjE4MHB4XCJcbiAgICAgICAgbGVmdD1cIjBcIlxuICAgICAgICBwb3NpdGlvbj1cImFic29sdXRlXCJcbiAgICAgICAgdG9wPVwiMFwiXG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgY2xpcFBhdGg6ICdwb2x5Z29uKDAgMCwgMTAwJSAwLCAxMDAlIDU2JSwgMCAxMDAlKScsXG4gICAgICAgICAgb3BhY2l0eTogMC40NVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxCb3ggbWF4V2lkdGg9ezYyMH0gcG9zaXRpb249XCJyZWxhdGl2ZVwiIHpJbmRleD17MX0+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwicHJpbWFyeTEwMFwiIGZvbnRXZWlnaHQ9XCI3MDBcIiBsZXR0ZXJTcGFjaW5nPVwiMC4wOGVtXCIgbWI9XCJsZ1wiIHRleHRUcmFuc2Zvcm09XCJ1cHBlcmNhc2VcIj57ZXllYnJvd308L1RleHQ+XG4gICAgICAgIDxIMiBtYXJnaW5Cb3R0b209XCJ4bFwiPnt0aXRsZX08L0gyPlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk4MFwiIGxpbmVIZWlnaHQ9XCJ4bFwiPntkZXNjcmlwdGlvbn08L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICAgIHthY3Rpb25zLmxlbmd0aCA/IChcbiAgICAgICAgPFF1aWNrQWN0aW9uR3JpZCBpdGVtcz17YWN0aW9uc30gbWluV2lkdGg9e1snMTAwJScsICdhdXRvJ119IC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0YXRHcmlkKHsgaXRlbXMgPSBbXSwgY29sdW1ucyA9IDQgfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImdyaWRcIiBnYXA9XCJ4bFwiIGdyaWRUZW1wbGF0ZUNvbHVtbnM9e1snMWZyJywgJzFmcicsIGByZXBlYXQoJHtjb2x1bW5zfSwgbWlubWF4KDAsIDFmcikpYF19PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8U3RhdENhcmQga2V5PXtpdGVtLmxhYmVsfSB7Li4uaXRlbX0gLz5cbiAgICAgICkpfVxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU3RhdENhcmQoeyBsYWJlbCwgdmFsdWUsIG5vdGUsIGljb24sIGFjY2VudCA9ICdvcmFuZ2UnIH0pIHtcbiAgY29uc3QgYWNjZW50Q29sb3IgPSBjb2xvck1hcFthY2NlbnRdIHx8IGFjY2VudDtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBiZz1cIndoaXRlXCJcbiAgICAgIGJvcmRlcj1cIjFweCBzb2xpZFwiXG4gICAgICBib3JkZXJDb2xvcj1cImdyZXkyMFwiXG4gICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICBib3hTaGFkb3c9XCJjYXJkXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgZ2FwPVwibGdcIlxuICAgICAgcD1cInhsXCJcbiAgICA+XG4gICAgICA8Qm94IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiIGZvbnRXZWlnaHQ9XCI2MDBcIj57bGFiZWx9PC9UZXh0PlxuICAgICAgICA8Qm94XG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgYmc9e2FjY2VudENvbG9yfVxuICAgICAgICAgIGJvcmRlclJhZGl1cz1cImNpcmNsZVwiXG4gICAgICAgICAgY29sb3I9XCJ3aGl0ZVwiXG4gICAgICAgICAgZGlzcGxheT1cImlubGluZS1mbGV4XCJcbiAgICAgICAgICBoZWlnaHQ9XCI0MHB4XCJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICAgICAgd2lkdGg9XCI0MHB4XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGljb249e2ljb259IC8+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgICA8Qm94PlxuICAgICAgICA8SDMgbWFyZ2luQm90dG9tPVwiZGVmYXVsdFwiPnt2YWx1ZX08L0gzPlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPntub3RlfTwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUGFuZWxDYXJkKHsgdGl0bGUsIGRlc2NyaXB0aW9uLCBhY3Rpb25zLCBjaGlsZHJlbiwgbWluSGVpZ2h0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBiZz1cIndoaXRlXCJcbiAgICAgIGJvcmRlcj1cIjFweCBzb2xpZFwiXG4gICAgICBib3JkZXJDb2xvcj1cImdyZXkyMFwiXG4gICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICBib3hTaGFkb3c9XCJjYXJkXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgZ2FwPVwieGxcIlxuICAgICAgbWluSGVpZ2h0PXttaW5IZWlnaHR9XG4gICAgICBwPVwieGxcIlxuICAgID5cbiAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImZsZXgtc3RhcnRcIiBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD1cImxnXCI+XG4gICAgICAgIDxCb3g+XG4gICAgICAgICAgPEg0IG1hcmdpbkJvdHRvbT1cInNtXCI+e3RpdGxlfTwvSDQ+XG4gICAgICAgICAge2Rlc2NyaXB0aW9uID8gPFRleHQgY29sb3I9XCJncmV5NjBcIj57ZGVzY3JpcHRpb259PC9UZXh0PiA6IG51bGx9XG4gICAgICAgIDwvQm94PlxuICAgICAgICB7YWN0aW9ucyA/IGFjdGlvbnMgOiBudWxsfVxuICAgICAgPC9Cb3g+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Cb3g+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGZWVkTGlzdCh7IGl0ZW1zID0gW10sIGVtcHR5LCByZW5kZXJJdGVtLCBnYXAgPSAnbGcnIH0pIHtcbiAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gPEVtcHR5U3RhdGU+e2VtcHR5fTwvRW1wdHlTdGF0ZT47XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXtnYXB9PlxuICAgICAge2l0ZW1zLm1hcChyZW5kZXJJdGVtKX1cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZlZWRSb3coeyB0aXRsZSwgc3VidGl0bGUsIGJvZHksIGJhZGdlLCB0b25lID0gJ25ldXRyYWwnLCBhc2lkZSwgaW1hZ2VVcmwgfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGJvcmRlckJvdHRvbT1cIjFweCBzb2xpZFwiXG4gICAgICBib3JkZXJDb2xvcj1cImdyZXkyMFwiXG4gICAgICBkaXNwbGF5PVwiZ3JpZFwiXG4gICAgICBnYXA9XCJsZ1wiXG4gICAgICBncmlkVGVtcGxhdGVDb2x1bW5zPXtpbWFnZVVybCA/IFsnNzJweCAxZnInLCAnNzJweCAxZnInLCAnODRweCAxZnInXSA6IFsnMWZyJ119XG4gICAgICBwYj1cImxnXCJcbiAgICA+XG4gICAgICB7aW1hZ2VVcmwgPyA8SW1hZ2VUaHVtYiBhbHQ9e3RpdGxlfSBzcmM9e2ltYWdlVXJsfSAvPiA6IG51bGx9XG4gICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInNtXCI+XG4gICAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGRpc3BsYXk9XCJmbGV4XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPVwibGdcIj5cbiAgICAgICAgICA8SDU+e3RpdGxlfTwvSDU+XG4gICAgICAgICAge2JhZGdlID8gPFN0YXR1c0JhZGdlIHRvbmU9e3RvbmV9PntiYWRnZX08L1N0YXR1c0JhZGdlPiA6IG51bGx9XG4gICAgICAgIDwvQm94PlxuICAgICAgICB7c3VidGl0bGUgPyA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPntzdWJ0aXRsZX08L1RleHQ+IDogbnVsbH1cbiAgICAgICAge2JvZHkgPyA8VGV4dD57Ym9keX08L1RleHQ+IDogbnVsbH1cbiAgICAgICAge2FzaWRlID8gPFRleHQgY29sb3I9XCJncmV5NjBcIj57YXNpZGV9PC9UZXh0PiA6IG51bGx9XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByZXZpZXdSZXZpZXdCb2FyZCh7XG4gIGl0ZW1zID0gW10sXG4gIHNlbGVjdGVkSWRzID0gW10sXG4gIG9uVG9nZ2xlLFxuICBvblRvZ2dsZUFsbCxcbiAgb25QcmV2aWV3LFxuICBlbXB0eSxcbiAgdGl0bGVMYWJlbCA9ICflvoXlrqHmoLjmqKHmnb8nXG59KSB7XG4gIGlmICghaXRlbXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIDxFbXB0eVN0YXRlPntlbXB0eX08L0VtcHR5U3RhdGU+O1xuICB9XG5cbiAgY29uc3Qgc2VsZWN0ZWRTZXQgPSBuZXcgU2V0KHNlbGVjdGVkSWRzKTtcbiAgY29uc3QgYWxsU2VsZWN0ZWQgPSBpdGVtcy5sZW5ndGggPiAwICYmIGl0ZW1zLmV2ZXJ5KGl0ZW0gPT4gc2VsZWN0ZWRTZXQuaGFzKGl0ZW0uaWQpKTtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwieGxcIj5cbiAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGRpc3BsYXk9XCJmbGV4XCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPVwibGdcIj5cbiAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57dGl0bGVMYWJlbH08L1RleHQ+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZUFsbD8uKCFhbGxTZWxlY3RlZCl9XG4gICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICA+XG4gICAgICAgICAge2FsbFNlbGVjdGVkID8gJ+WPlua2iOWFqOmAiScgOiAn5YWo6YCJ5b2T5YmN5YiX6KGoJ31cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0JveD5cbiAgICAgIDxCb3ggZGlzcGxheT1cImdyaWRcIiBnYXA9XCJ4bFwiIGdyaWRUZW1wbGF0ZUNvbHVtbnM9e1snMWZyJywgJzFmcicsICdyZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpJ119PlxuICAgICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgPFByZXZpZXdDYXJkXG4gICAgICAgICAgICBpdGVtPXtpdGVtfVxuICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgb25QcmV2aWV3PXsoKSA9PiBvblByZXZpZXc/LihpdGVtKX1cbiAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBvblRvZ2dsZT8uKGl0ZW0uaWQpfVxuICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkU2V0LmhhcyhpdGVtLmlkKX1cbiAgICAgICAgICAvPlxuICAgICAgICApKX1cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJldmlld0NhcmQoeyBpdGVtLCBzZWxlY3RlZCwgb25Ub2dnbGUsIG9uUHJldmlldyB9KSB7XG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgYmc9e3NlbGVjdGVkID8gJ2ZpbHRlckJnJyA6ICd3aGl0ZSd9XG4gICAgICBib3JkZXI9XCIxcHggc29saWRcIlxuICAgICAgYm9yZGVyQ29sb3I9e3NlbGVjdGVkID8gJ3ByaW1hcnkxMDAnIDogJ2dyZXkyMCd9XG4gICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICBib3hTaGFkb3c9XCJjYXJkXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgZ2FwPVwibGdcIlxuICAgICAgb3ZlcmZsb3c9XCJoaWRkZW5cIlxuICAgICAgcD1cImxnXCJcbiAgICAgIHN0eWxlPXt7IGN1cnNvcjogJ3BvaW50ZXInIH19XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICA+XG4gICAgICA8Qm94IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD1cImxnXCI+XG4gICAgICAgIDxTdGF0dXNCYWRnZSB0b25lPXtzZWxlY3RlZCA/ICdpbmZvJyA6ICduZXV0cmFsJ30+e3NlbGVjdGVkID8gJ+W3sumAieS4rScgOiBzdGF0dXNMYWJlbChpdGVtLnN0YXR1cyl9PC9TdGF0dXNCYWRnZT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e29uVG9nZ2xlfVxuICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgLz5cbiAgICAgIDwvQm94PlxuICAgICAgPFByZXZpZXdTdXJmYWNlIGltYWdlVXJsPXtpdGVtLnByZXZpZXdJbWFnZVVybH0gdGl0bGU9e2l0ZW0udGl0bGV9IC8+XG4gICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInNtXCI+XG4gICAgICAgIDxINT57aXRlbS50aXRsZX08L0g1PlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPntpdGVtLmNhdGVnb3J5TmFtZSB8fCAn5pyq5YiG57G7J30gwrcge2l0ZW0uc2NlbmV9PC9UZXh0PlxuICAgICAgICA8VGV4dD57aXRlbS5wcm9tcHRIaW50fTwvVGV4dD5cbiAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57KGl0ZW0udGFncyB8fCBbXSkuam9pbignIC8gJykgfHwgJ+aXoOagh+etvid9PC9UZXh0PlxuICAgICAgICA8Qm94IG10PVwic21cIj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgIG9uUHJldmlldz8uKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICDmn6XnnIvlpKflm75cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByZXZpZXdTdXJmYWNlKHsgaW1hZ2VVcmwsIHRpdGxlIH0pIHtcbiAgaWYgKGltYWdlVXJsKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3hcbiAgICAgICAgYXM9XCJpbWdcIlxuICAgICAgICBhbHQ9e3RpdGxlfVxuICAgICAgICBib3JkZXJSYWRpdXM9XCJsZ1wiXG4gICAgICAgIGhlaWdodD1cIjE4OHB4XCJcbiAgICAgICAgc3JjPXtpbWFnZVVybH1cbiAgICAgICAgc3R5bGU9e3sgb2JqZWN0Rml0OiAnY292ZXInLCB3aWR0aDogJzEwMCUnIH19XG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGFsaWduSXRlbXM9XCJmbGV4LWVuZFwiXG4gICAgICBiZz1cImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LDEwNyw1MywwLjE4KSwgcmdiYSgxMDgsOTIsMjMxLDAuMTgpKVwiXG4gICAgICBib3JkZXJSYWRpdXM9XCJsZ1wiXG4gICAgICBjb2xvcj1cImdyZXkxMDBcIlxuICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgaGVpZ2h0PVwiMTg4cHhcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgIHA9XCJsZ1wiXG4gICAgPlxuICAgICAgPEJhZGdlIHZhcmlhbnQ9XCJwcmltYXJ5XCI+5pqC5peg6aKE6KeIPC9CYWRnZT5cbiAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTgwXCIgdGV4dEFsaWduPVwicmlnaHRcIj57dGl0bGV9PC9UZXh0PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTGFyZ2VQcmV2aWV3TW9kYWwoeyBpdGVtLCBvbkNsb3NlIH0pIHtcbiAgaWYgKCFpdGVtKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgYmc9XCJyZ2JhKDEyLCAzMCwgNDEsIDAuNzIpXCJcbiAgICAgIGJvdHRvbT1cIjBcIlxuICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgbGVmdD1cIjBcIlxuICAgICAgb25DbGljaz17b25DbG9zZX1cbiAgICAgIHA9XCJ4eGxcIlxuICAgICAgcG9zaXRpb249XCJmaXhlZFwiXG4gICAgICByaWdodD1cIjBcIlxuICAgICAgdG9wPVwiMFwiXG4gICAgICB6SW5kZXg9XCI5OTk5XCJcbiAgICA+XG4gICAgICA8Qm94XG4gICAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICAgIG1heEhlaWdodD1cIjkwdmhcIlxuICAgICAgICBtYXhXaWR0aD1cIjk2MHB4XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgb3ZlcmZsb3c9XCJoaWRkZW5cIlxuICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgPlxuICAgICAgICA8Qm94IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBkaXNwbGF5PVwiZmxleFwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIHA9XCJ4bFwiPlxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8SDQgbWFyZ2luQm90dG9tPVwic21cIj57aXRlbS50aXRsZX08L0g0PlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57aXRlbS5jYXRlZ29yeU5hbWUgfHwgJ+acquWIhuexuyd9IMK3IHtpdGVtLnNjZW5lIHx8IGl0ZW0uc3VidGl0bGUgfHwgJ+inhuinieWGheWuuemihOiniCd9PC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17b25DbG9zZX0gdmFyaWFudD1cInRleHRcIj7lhbPpl608L0J1dHRvbj5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIDxCb3ggcHg9XCJ4bFwiIHBiPVwieGxcIj5cbiAgICAgICAgICB7aXRlbS5wcmV2aWV3SW1hZ2VVcmwgfHwgaXRlbS5pbWFnZVVybCA/IChcbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgYXM9XCJpbWdcIlxuICAgICAgICAgICAgICBhbHQ9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgIGJvcmRlclJhZGl1cz1cInhsXCJcbiAgICAgICAgICAgICAgbWF4SGVpZ2h0PVwiNzB2aFwiXG4gICAgICAgICAgICAgIHNyYz17aXRlbS5wcmV2aWV3SW1hZ2VVcmwgfHwgaXRlbS5pbWFnZVVybH1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgb2JqZWN0Rml0OiAnY29udGFpbicsIHdpZHRoOiAnMTAwJScsIGJhY2tncm91bmQ6ICcjRjhGOUY5JyB9fVxuICAgICAgICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPFByZXZpZXdTdXJmYWNlIGltYWdlVXJsPXtudWxsfSB0aXRsZT17aXRlbS50aXRsZX0gLz5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtpdGVtLnByb21wdEhpbnQgfHwgaXRlbS5wcm9tcHQgPyAoXG4gICAgICAgICAgICA8Qm94IG10PVwibGdcIj5cbiAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57aXRlbS5wcm9tcHRIaW50IHx8IGl0ZW0ucHJvbXB0fTwvVGV4dD5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L0JveD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3Tm90ZVRlbXBsYXRlUGlja2VyKHsgdGVtcGxhdGVzID0gW10sIHNlbGVjdGVkVmFsdWUsIG9uU2VsZWN0IH0pIHtcbiAgaWYgKCF0ZW1wbGF0ZXMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwibGdcIj5cbiAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+5a6h5qC45aSH5rOo5qih5p2/PC9UZXh0PlxuICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGZsZXhXcmFwPVwid3JhcFwiIGdhcD1cImRlZmF1bHRcIj5cbiAgICAgICAge3RlbXBsYXRlcy5tYXAodGVtcGxhdGUgPT4gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGtleT17dGVtcGxhdGUudmFsdWV9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdD8uKHRlbXBsYXRlLnZhbHVlKX1cbiAgICAgICAgICAgIHZhcmlhbnQ9e3NlbGVjdGVkVmFsdWUgPT09IHRlbXBsYXRlLnZhbHVlID8gJ2NvbnRhaW5lZCcgOiAnb3V0bGluZWQnfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0ZW1wbGF0ZS5sYWJlbH1cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRyZW5kQmFycyh7IGl0ZW1zID0gW10sIHNlcmllcyA9IFtdIH0pIHtcbiAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gPEVtcHR5U3RhdGU+5pqC5peg6LaL5Yq/5pWw5o2uPC9FbXB0eVN0YXRlPjtcbiAgfVxuXG4gIGNvbnN0IG1heFZhbHVlID0gTWF0aC5tYXgoXG4gICAgLi4uaXRlbXMuZmxhdE1hcChpdGVtID0+IHNlcmllcy5tYXAoZW50cnkgPT4gTnVtYmVyKGl0ZW1bZW50cnkua2V5XSB8fCAwKSkpLFxuICAgIDFcbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwibGdcIj5cbiAgICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4V3JhcD1cIndyYXBcIiBnYXA9XCJsZ1wiPlxuICAgICAgICB7c2VyaWVzLm1hcChlbnRyeSA9PiAoXG4gICAgICAgICAgPEJveCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZGlzcGxheT1cImlubGluZS1mbGV4XCIgZ2FwPVwic21cIiBrZXk9e2VudHJ5LmtleX0+XG4gICAgICAgICAgICA8Qm94IGJnPXtlbnRyeS5jb2xvcn0gYm9yZGVyUmFkaXVzPVwiY2lyY2xlXCIgaGVpZ2h0PVwiMTBweFwiIHdpZHRoPVwiMTBweFwiIC8+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPntlbnRyeS5sYWJlbH08L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwibGdcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtgcmVwZWF0KCR7aXRlbXMubGVuZ3RofSwgbWlubWF4KDAsIDFmcikpYH0+XG4gICAgICAgIHtpdGVtcy5tYXAoaXRlbSA9PiAoXG4gICAgICAgICAgPEJveCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwic21cIiBrZXk9e2l0ZW0ubGFiZWx9IG1pbkhlaWdodD1cIjIyMHB4XCI+XG4gICAgICAgICAgICA8Qm94IGFsaWduSXRlbXM9XCJmbGV4LWVuZFwiIGRpc3BsYXk9XCJmbGV4XCIgZ2FwPVwic21cIiBoZWlnaHQ9XCIxODBweFwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICAgICAgICB7c2VyaWVzLm1hcChlbnRyeSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5tYXgoOCwgKE51bWJlcihpdGVtW2VudHJ5LmtleV0gfHwgMCkgLyBtYXhWYWx1ZSkgKiAxODApO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8Qm94XG4gICAgICAgICAgICAgICAgICAgIGJnPXtlbnRyeS5jb2xvcn1cbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzPVwibGcgbGcgMCAwXCJcbiAgICAgICAgICAgICAgICAgICAgZmxleD1cIjFcIlxuICAgICAgICAgICAgICAgICAgICBrZXk9e2VudHJ5LmtleX1cbiAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgaGVpZ2h0OiBgJHtoZWlnaHR9cHhgIH19XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtgJHtlbnRyeS5sYWJlbH06ICR7aXRlbVtlbnRyeS5rZXldIHx8IDB9YH1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+e2l0ZW0ubGFiZWx9PC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApKX1cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmVhc29uR3JvdXBMaXN0KHsgaXRlbXMgPSBbXSB9KSB7XG4gIHJldHVybiAoXG4gICAgPEZlZWRMaXN0XG4gICAgICBlbXB0eT1cIuaaguaXoOWksei0peWOn+WboOWIhue7hOOAglwiXG4gICAgICBpdGVtcz17aXRlbXN9XG4gICAgICByZW5kZXJJdGVtPXsoaXRlbSkgPT4gKFxuICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgIGFzaWRlPXtg5raJ5Y+K5o+Q5L6b5pa577yaJHtpdGVtLnByb3ZpZGVycy5qb2luKCcgLyAnKX1gfVxuICAgICAgICAgIGJhZGdlPXtgJHtpdGVtLmNvdW50fSDmrKFgfVxuICAgICAgICAgIGJvZHk9e2l0ZW0uc2FtcGxlUHJvbXB0IHx8ICfml6DmoLfkvosgUHJvbXB0J31cbiAgICAgICAgICBrZXk9e2l0ZW0ucmVhc29ufVxuICAgICAgICAgIHN1YnRpdGxlPXtpdGVtLnNhbXBsZUpvYlRpdGxlIHx8ICfmnIDov5HlvILluLjku7vliqEnfVxuICAgICAgICAgIHRpdGxlPXtpdGVtLnJlYXNvbn1cbiAgICAgICAgICB0b25lPVwid2FybmluZ1wiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIC8+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3RhYmxlRmVlZExpc3Qoe1xuICBpdGVtcyA9IFtdLFxuICBzZWxlY3RlZElkcyA9IFtdLFxuICBvblRvZ2dsZSxcbiAgb25Ub2dnbGVBbGwsXG4gIGVtcHR5LFxuICB0aXRsZUxhYmVsID0gJ+WIl+ihqCcsXG4gIHJlbmRlckNvbnRlbnRcbn0pIHtcbiAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gPEVtcHR5U3RhdGU+e2VtcHR5fTwvRW1wdHlTdGF0ZT47XG4gIH1cblxuICBjb25zdCBzZWxlY3RlZFNldCA9IG5ldyBTZXQoc2VsZWN0ZWRJZHMpO1xuICBjb25zdCBhbGxTZWxlY3RlZCA9IGl0ZW1zLmxlbmd0aCA+IDAgJiYgaXRlbXMuZXZlcnkoaXRlbSA9PiBzZWxlY3RlZFNldC5oYXMoaXRlbS5pZCkpO1xuXG4gIHJldHVybiAoXG4gICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9XCJ4bFwiPlxuICAgICAgPEJveCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZGlzcGxheT1cImZsZXhcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9XCJsZ1wiPlxuICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPnt0aXRsZUxhYmVsfTwvVGV4dD5cbiAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZUFsbD8uKCFhbGxTZWxlY3RlZCl9IHNpemU9XCJzbVwiIHZhcmlhbnQ9XCJvdXRsaW5lZFwiPlxuICAgICAgICAgIHthbGxTZWxlY3RlZCA/ICflj5bmtojlhajpgIknIDogJ+WFqOmAieW9k+WJjeWIl+ihqCd9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9Cb3g+XG4gICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cImxnXCI+XG4gICAgICAgIHtpdGVtcy5tYXAoaXRlbSA9PiAoXG4gICAgICAgICAgPEJveFxuICAgICAgICAgICAgYmc9e3NlbGVjdGVkU2V0LmhhcyhpdGVtLmlkKSA/ICdmaWx0ZXJCZycgOiAnd2hpdGUnfVxuICAgICAgICAgICAgYm9yZGVyPVwiMXB4IHNvbGlkXCJcbiAgICAgICAgICAgIGJvcmRlckNvbG9yPXtzZWxlY3RlZFNldC5oYXMoaXRlbS5pZCkgPyAncHJpbWFyeTEwMCcgOiAnZ3JleTIwJ31cbiAgICAgICAgICAgIGJvcmRlclJhZGl1cz1cInhsXCJcbiAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgIHA9XCJsZ1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPEJveCBhbGlnbkl0ZW1zPVwiZmxleC1zdGFydFwiIGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwibGdcIiBncmlkVGVtcGxhdGVDb2x1bW5zPVwiMjRweCAxZnJcIj5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRTZXQuaGFzKGl0ZW0uaWQpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiBvblRvZ2dsZT8uKGl0ZW0uaWQpfVxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtyZW5kZXJDb250ZW50KGl0ZW0pfVxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZW5ld2FsQ2FyZHMoeyBpdGVtcyA9IFtdIH0pIHtcbiAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gPEVtcHR5U3RhdGU+5b2T5YmN5rKh5pyJ5Li06L+R57ut6LS55o+Q6YaS44CCPC9FbXB0eVN0YXRlPjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJ3JlcGVhdCgzLCBtaW5tYXgoMCwgMWZyKSknXX0+XG4gICAgICB7aXRlbXMubWFwKGl0ZW0gPT4gKFxuICAgICAgICA8Qm94XG4gICAgICAgICAgYmc9XCJmaWx0ZXJCZ1wiXG4gICAgICAgICAgYm9yZGVyPVwiMXB4IHNvbGlkXCJcbiAgICAgICAgICBib3JkZXJDb2xvcj1cImdyZXkyMFwiXG4gICAgICAgICAgYm9yZGVyUmFkaXVzPVwieGxcIlxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBwPVwieGxcIlxuICAgICAgICA+XG4gICAgICAgICAgPEJveCBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZGlzcGxheT1cImZsZXhcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBtYj1cImxnXCI+XG4gICAgICAgICAgICA8SDU+e2l0ZW0ucGxhbk5hbWUgfHwgaXRlbS5wbGFuSWR9PC9INT5cbiAgICAgICAgICAgIDxTdGF0dXNCYWRnZSB0b25lPXtpdGVtLmRheXNMZWZ0IDw9IDMgPyAnZXJyb3InIDogJ3dhcm5pbmcnfT57aXRlbS5kYXlzTGVmdH0g5aSp5ZCOPC9TdGF0dXNCYWRnZT5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiIG1iPVwic21cIj57aXRlbS51c2VyTmlja25hbWUgfHwgaXRlbS51c2VySWR9PC9UZXh0PlxuICAgICAgICAgIDxUZXh0IG1iPVwic21cIj57aXRlbS5hdXRvUmVuZXcgPyAn6Ieq5Yqo57ut6LS55bey5byA5ZCvJyA6ICfoh6rliqjnu63otLnmnKrlvIDlkK8nfTwvVGV4dD5cbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPntpdGVtLnJlbmV3YWxBdExhYmVsfTwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApKX1cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFF1aWNrQWN0aW9uR3JpZCh7IGl0ZW1zID0gW10sIG1pbldpZHRoIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwiZGVmYXVsdFwiIGdyaWRUZW1wbGF0ZUNvbHVtbnM9e1snMWZyJywgJzFmciAxZnInXX0gbWluV2lkdGg9e21pbldpZHRofT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGFzPVwiYVwiXG4gICAgICAgICAgaHJlZj17aXRlbS5ocmVmfVxuICAgICAgICAgIGtleT17aXRlbS5ocmVmfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxuICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgICAgICAgICBnYXA6IDgsXG4gICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnXG4gICAgICAgICAgfX1cbiAgICAgICAgICB2YXJpYW50PXtpdGVtLnZhcmlhbnQgfHwgJ291dGxpbmVkJ31cbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uIGljb249e2l0ZW0uaWNvbn0gLz5cbiAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApKX1cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEluc2lnaHRTdHJpcCh7IGl0ZW1zID0gW10gfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3ggZGlzcGxheT1cImdyaWRcIiBnYXA9XCJsZ1wiIGdyaWRUZW1wbGF0ZUNvbHVtbnM9e1snMWZyJywgJzFmcicsIGByZXBlYXQoJHtNYXRoLm1pbihpdGVtcy5sZW5ndGggfHwgMSwgMyl9LCBtaW5tYXgoMCwgMWZyKSlgXX0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxCb3hcbiAgICAgICAgICBiZz1cImZpbHRlckJnXCJcbiAgICAgICAgICBib3JkZXJSYWRpdXM9XCJsZ1wiXG4gICAgICAgICAga2V5PXtpdGVtLmxhYmVsfVxuICAgICAgICAgIHA9XCJsZ1wiXG4gICAgICAgID5cbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiIGZvbnRXZWlnaHQ9XCI2MDBcIiBtYj1cInNtXCI+e2l0ZW0ubGFiZWx9PC9UZXh0PlxuICAgICAgICAgIDxINCBtYXJnaW5Cb3R0b209XCJzbVwiPntpdGVtLnZhbHVlfTwvSDQ+XG4gICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57aXRlbS5ub3RlfTwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICApKX1cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJ1bGtBY3Rpb25CYXIoe1xuICBzZWxlY3RlZENvdW50LFxuICBvbkFwcHJvdmUsXG4gIG9uUmVxdWVzdENoYW5nZXMsXG4gIG9uQXJjaGl2ZSxcbiAgc3VibWl0dGluZyxcbiAgYXBwcm92ZUxhYmVsID0gJ+aJuemHj+mAmui/hycsXG4gIHJlcXVlc3RDaGFuZ2VzTGFiZWwgPSAn5om56YeP6YCA5Zue5L+u5pS5JyxcbiAgYXJjaGl2ZUxhYmVsID0gJ+aJuemHj+W9kuahoydcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBhbGlnbkl0ZW1zPXtbJ2ZsZXgtc3RhcnQnLCAnY2VudGVyJ119XG4gICAgICBiZz1cImZpbHRlckJnXCJcbiAgICAgIGJvcmRlcj1cIjFweCBzb2xpZFwiXG4gICAgICBib3JkZXJDb2xvcj1cImdyZXkyMFwiXG4gICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICBkaXNwbGF5PVwiZmxleFwiXG4gICAgICBmbGV4RGlyZWN0aW9uPXtbJ2NvbHVtbicsICdyb3cnXX1cbiAgICAgIGdhcD1cImxnXCJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiXG4gICAgICBwPVwibGdcIlxuICAgID5cbiAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTgwXCI+5bey6YCJ5LitIHtzZWxlY3RlZENvdW50fSDpobnvvIzlj6/nm7TmjqXmiafooYzmibnph4/liqjkvZzjgII8L1RleHQ+XG4gICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleFdyYXA9XCJ3cmFwXCIgZ2FwPVwiZGVmYXVsdFwiPlxuICAgICAgICB7b25BcHByb3ZlID8gKFxuICAgICAgICAgIDxCdXR0b24gZGlzYWJsZWQ9eyFzZWxlY3RlZENvdW50IHx8IHN1Ym1pdHRpbmd9IG9uQ2xpY2s9e29uQXBwcm92ZX0gdmFyaWFudD1cImNvbnRhaW5lZFwiPnthcHByb3ZlTGFiZWx9PC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7b25SZXF1ZXN0Q2hhbmdlcyA/IChcbiAgICAgICAgICA8QnV0dG9uIGRpc2FibGVkPXshc2VsZWN0ZWRDb3VudCB8fCBzdWJtaXR0aW5nfSBvbkNsaWNrPXtvblJlcXVlc3RDaGFuZ2VzfSB2YXJpYW50PVwib3V0bGluZWRcIj57cmVxdWVzdENoYW5nZXNMYWJlbH08L0J1dHRvbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHtvbkFyY2hpdmUgPyAoXG4gICAgICAgICAgPEJ1dHRvbiBkaXNhYmxlZD17IXNlbGVjdGVkQ291bnQgfHwgc3VibWl0dGluZ30gb25DbGljaz17b25BcmNoaXZlfSB2YXJpYW50PVwidGV4dFwiPnthcmNoaXZlTGFiZWx9PC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNZXRyaWNQaWxsKHsgbGFiZWwsIHZhbHVlLCB0b25lID0gJ25ldXRyYWwnIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgIGJnPVwiZmlsdGVyQmdcIlxuICAgICAgYm9yZGVyPVwiMXB4IHNvbGlkXCJcbiAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgIGJvcmRlclJhZGl1cz1cInBpbGxcIlxuICAgICAgZGlzcGxheT1cImlubGluZS1mbGV4XCJcbiAgICAgIGdhcD1cInNtXCJcbiAgICAgIHB4PVwibGdcIlxuICAgICAgcHk9XCJzbVwiXG4gICAgPlxuICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj57bGFiZWx9PC9UZXh0PlxuICAgICAgPFN0YXR1c0JhZGdlIHRvbmU9e3RvbmV9Pnt2YWx1ZX08L1N0YXR1c0JhZGdlPlxuICAgIDwvQm94PlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU3RhdHVzQmFkZ2UoeyBjaGlsZHJlbiwgdG9uZSA9ICduZXV0cmFsJyB9KSB7XG4gIHJldHVybiA8QmFkZ2UgdmFyaWFudD17dG9uZU1hcFt0b25lXSB8fCAnbGlnaHQnfT57Y2hpbGRyZW59PC9CYWRnZT47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbXB0eVN0YXRlKHsgY2hpbGRyZW4gfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgYmc9XCJmaWx0ZXJCZ1wiXG4gICAgICBib3JkZXI9XCIxcHggZGFzaGVkXCJcbiAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgIGJvcmRlclJhZGl1cz1cImxnXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcbiAgICAgIG1pbkhlaWdodD1cIjEyMHB4XCJcbiAgICAgIHA9XCJ4bFwiXG4gICAgPlxuICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIiB0ZXh0QWxpZ249XCJjZW50ZXJcIj57Y2hpbGRyZW59PC9UZXh0PlxuICAgIDwvQm94PlxuICApO1xufVxuXG5mdW5jdGlvbiBJbWFnZVRodW1iKHsgc3JjLCBhbHQgfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3hcbiAgICAgIGFzPVwiaW1nXCJcbiAgICAgIGFsdD17YWx0fVxuICAgICAgYm9yZGVyUmFkaXVzPVwibGdcIlxuICAgICAgaGVpZ2h0PXtbJzcycHgnLCAnNzJweCcsICc4NHB4J119XG4gICAgICBzcmM9e3NyY31cbiAgICAgIHN0eWxlPXt7IG9iamVjdEZpdDogJ2NvdmVyJywgd2lkdGg6ICcxMDAlJyB9fVxuICAgICAgd2lkdGg9e1snNzJweCcsICc3MnB4JywgJzg0cHgnXX1cbiAgICAvPlxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0Q3VycmVuY3koY2VudHMpIHtcbiAgcmV0dXJuIGDCpSR7KE51bWJlcihjZW50cyB8fCAwKSAvIDEwMCkudG9GaXhlZCgyKX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmF0aW8odmFsdWUpIHtcbiAgcmV0dXJuIGAke01hdGgucm91bmQoKE51bWJlcih2YWx1ZSB8fCAwKSAqIDEwMDApKSAvIDEwfSVgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZSh2YWx1ZSkge1xuICBpZiAoIXZhbHVlKSByZXR1cm4gJ+KAlCc7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gIGlmIChOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpKSByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgcmV0dXJuIGRhdGUudG9Mb2NhbGVTdHJpbmcoJ3poLUNOJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGF0dXNMYWJlbChzdGF0dXMpIHtcbiAgcmV0dXJuIHtcbiAgICBEUkFGVDogJ+iNieeovycsXG4gICAgSU5fUkVWSUVXOiAn5a6h5qC45LitJyxcbiAgICBQVUJMSVNIRUQ6ICflt7Llj5HluIMnLFxuICAgIEFSQ0hJVkVEOiAn5bey5b2S5qGjJyxcbiAgICBRVUVVRUQ6ICfmjpLpmJ/kuK0nLFxuICAgIFJVTk5JTkc6ICfmiafooYzkuK0nLFxuICAgIFNVQ0NFRURFRDogJ+aIkOWKnycsXG4gICAgRkFJTEVEOiAn5aSx6LSlJyxcbiAgICBDQU5DRUxFRDogJ+W3suWPlua2iCcsXG4gICAgQUNUSVZFOiAn5ZCv55SoJyxcbiAgICBTVVNQRU5ERUQ6ICfmmoLlgZwnLFxuICAgIFRSSUFMSU5HOiAn6K+V55So5LitJyxcbiAgICBQQVVTRUQ6ICflt7LmmoLlgZwnLFxuICAgIEVYUElSRUQ6ICflt7LliLDmnJ8nLFxuICAgIFBFTkRJTkc6ICflvoXlpITnkIYnLFxuICAgIFBBSUQ6ICflt7LmlK/ku5gnLFxuICAgIFJFRlVOREVEOiAn5bey6YCA5qy+JyxcbiAgICBBUFBST1ZFRDogJ+W3sumAmui/hycsXG4gICAgUkVKRUNURUQ6ICflt7Lmi5Lnu50nLFxuICAgIENIQU5HRVNfUkVRVUVTVEVEOiAn6ZyA5L+u5pS5JyxcbiAgICBGUkVFOiAn5YWN6LS554mIJyxcbiAgICBDUkVBVE9SOiAn5Yib5L2c6ICF54mIJyxcbiAgICBCVVNJTkVTUzogJ+WVhuS4mueJiCdcbiAgfVtzdGF0dXNdIHx8IHN0YXR1cztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXR1c1RvbmUoc3RhdHVzKSB7XG4gIGlmIChbJ1BVQkxJU0hFRCcsICdTVUNDRUVERUQnLCAnQUNUSVZFJywgJ1BBSUQnLCAnQVBQUk9WRUQnXS5pbmNsdWRlcyhzdGF0dXMpKSByZXR1cm4gJ3N1Y2Nlc3MnO1xuICBpZiAoWydGQUlMRUQnLCAnQVJDSElWRUQnLCAnU1VTUEVOREVEJywgJ1JFSkVDVEVEJywgJ1JFRlVOREVEJywgJ0NBTkNFTEVEJ10uaW5jbHVkZXMoc3RhdHVzKSkgcmV0dXJuICdlcnJvcic7XG4gIGlmIChbJ0lOX1JFVklFVycsICdDSEFOR0VTX1JFUVVFU1RFRCcsICdQRU5ESU5HJywgJ1BBVVNFRCcsICdUUklBTElORycsICdEUkFGVCddLmluY2x1ZGVzKHN0YXR1cykpIHJldHVybiAnd2FybmluZyc7XG4gIHJldHVybiAnbmV1dHJhbCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTZWxlY3Rpb24oaXRlbXMgPSBbXSwga2V5ID0gJ2lkJykge1xuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IHVzZVN0YXRlKFtdKTtcblxuICBjb25zdCBhdmFpbGFibGVJZHMgPSB1c2VNZW1vKCgpID0+IGl0ZW1zLm1hcChpdGVtID0+IGl0ZW1ba2V5XSksIFtpdGVtcywga2V5XSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcyhjdXJyZW50ID0+IGN1cnJlbnQuZmlsdGVyKGlkID0+IGF2YWlsYWJsZUlkcy5pbmNsdWRlcyhpZCkpKTtcbiAgfSwgW2F2YWlsYWJsZUlkc10pO1xuXG4gIHJldHVybiB7XG4gICAgc2VsZWN0ZWRJZHMsXG4gICAgc2VsZWN0ZWRDb3VudDogc2VsZWN0ZWRJZHMubGVuZ3RoLFxuICAgIHRvZ2dsZTogKGlkKSA9PiB7XG4gICAgICBzZXRTZWxlY3RlZElkcyhjdXJyZW50ID0+IGN1cnJlbnQuaW5jbHVkZXMoaWQpID8gY3VycmVudC5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBpZCkgOiBbLi4uY3VycmVudCwgaWRdKTtcbiAgICB9LFxuICAgIHRvZ2dsZUFsbDogKGNoZWNrZWQpID0+IHtcbiAgICAgIHNldFNlbGVjdGVkSWRzKGNoZWNrZWQgPyBbLi4uYXZhaWxhYmxlSWRzXSA6IFtdKTtcbiAgICB9LFxuICAgIGNsZWFyOiAoKSA9PiBzZXRTZWxlY3RlZElkcyhbXSlcbiAgfTtcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7XG4gIEFkbWluUGFnZVNoZWxsLFxuICBGZWVkTGlzdCxcbiAgRmVlZFJvdyxcbiAgUGFuZWxDYXJkLFxuICBRdWlja0FjdGlvbkdyaWQsXG4gIFN0YXRHcmlkLFxuICBmb3JtYXREYXRlLFxuICByYXRpbyxcbiAgc3RhdHVzTGFiZWwsXG4gIHN0YXR1c1RvbmUsXG4gIHVzZUFkbWluUGFnZVxufSBmcm9tICcuL3NoYXJlZC5qc3gnO1xuXG5jb25zdCBxdWlja0FjdGlvbnMgPSBbXG4gIHsgbGFiZWw6ICflhoXlrrnkuK3lj7AnLCBocmVmOiAnL2FkbWluL3BhZ2VzL2NvbnRlbnRTdHVkaW8nLCBpY29uOiAnTGF5b3V0JyB9LFxuICB7IGxhYmVsOiAn5Lu75Yqh5oyH5oyl5Y+wJywgaHJlZjogJy9hZG1pbi9wYWdlcy9qb2JDb21tYW5kJywgaWNvbjogJ0FjdGl2aXR5JyB9LFxuICB7IGxhYmVsOiAn5ZWG5Lia5YyW5Lit5Y+wJywgaHJlZjogJy9hZG1pbi9wYWdlcy9yZXZlbnVlT3BzJywgaWNvbjogJ0NyZWRpdENhcmQnIH0sXG4gIHsgbGFiZWw6ICfnlKjmiLfnrqHnkIYnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9Vc2VyL2FjdGlvbnMvbGlzdCcsIGljb246ICdVc2VycycgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gT3BlcmF0aW9uc0Rhc2hib2FyZCgpIHtcbiAgY29uc3QgeyBsb2FkaW5nLCBlcnJvciwgZGF0YSB9ID0gdXNlQWRtaW5QYWdlKCk7XG4gIGNvbnN0IG1ldHJpY3MgPSBkYXRhPy5tZXRyaWNzIHx8IHt9O1xuXG4gIHJldHVybiAoXG4gICAgPEFkbWluUGFnZVNoZWxsXG4gICAgICBhY3Rpb25zPXtxdWlja0FjdGlvbnN9XG4gICAgICBkZXNjcmlwdGlvbj1cInYyIOeJiOacrOaKiui/kOiQpeW3peS9nOaLhuaIkOS6huS4k+eUqOW3peS9nOWPsO+8mummlumhteabtOWDj+mpvumptuiIse+8jOeUqOadpeW/q+mAn+WIpOaWreS7iuWkqeivpeebr+aooeadv+OAgeS7u+WKoeOAgeWuoeaguOi/mOaYr+WVhuS4muWMluOAglwiXG4gICAgICBleWVicm93PVwi6L+Q6JCl6am+6am26IixXCJcbiAgICAgIGVycm9yPXtlcnJvcn1cbiAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICB0aXRsZT1cIuWFlOWFlOinhuiniei/kOiQpempvumptuiIsVwiXG4gICAgPlxuICAgICAgPFN0YXRHcmlkXG4gICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgeyBsYWJlbDogJ+aAu+eUqOaIt+aVsCcsIHZhbHVlOiBtZXRyaWNzLnVzZXJzID8/IDAsIG5vdGU6ICflvZPliY3liJvkvZzogIXkuI7llYbkuJrlrqLmiLfmgLvph48nLCBpY29uOiAnVXNlcnMnLCBhY2NlbnQ6ICdvcmFuZ2UnIH0sXG4gICAgICAgICAgeyBsYWJlbDogJ+aooeadv+aAu+mHjycsIHZhbHVlOiBtZXRyaWNzLnRlbXBsYXRlcyA/PyAwLCBub3RlOiAn5YyF5ZCr6I2J56i/44CB5a6h5qC45Lit5LiO5bey5Y+R5biD5qih5p2/JywgaWNvbjogJ0xheW91dCcsIGFjY2VudDogJ3B1cnBsZScgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn5LuK5pel5Lu75YqhJywgdmFsdWU6IG1ldHJpY3Muam9ic1RvZGF5ID8/IDAsIG5vdGU6ICfku4rlpKnmlrDmj5DkuqTnmoTnlJ/miJDku7vliqEnLCBpY29uOiAnQWN0aXZpdHknLCBhY2NlbnQ6ICd5ZWxsb3cnIH0sXG4gICAgICAgICAgeyBsYWJlbDogJ+iuoumYhei9rOWMlicsIHZhbHVlOiByYXRpbyhtZXRyaWNzLmNvbnZlcnNpb25SYXRlID8/IDApLCBub3RlOiAn5rS76LeD6K6i6ZiF55So5oi35Y2g5q+UJywgaWNvbjogJ1RyZW5kaW5nVXAnLCBhY2NlbnQ6ICdjeWFuJyB9XG4gICAgICAgIF19XG4gICAgICAvPlxuXG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwieGxcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtbJzFmcicsICcxZnInLCAnMS4yZnIgMWZyJ119PlxuICAgICAgICA8UGFuZWxDYXJkXG4gICAgICAgICAgZGVzY3JpcHRpb249XCLmiorlkI7lj7DnmoTkuLvopoHlt6XkvZzmtYHmipjlj6DmiJDlh6DkuKrlhaXlj6PvvIzluK7liqnlm6LpmJ/lv6vpgJ/mib7liLDlpITnkIbot6/lvoTjgIJcIlxuICAgICAgICAgIHRpdGxlPVwi5LuK5pel5bel5L2c5rWBXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxRdWlja0FjdGlvbkdyaWQgaXRlbXM9e3F1aWNrQWN0aW9uc30gLz5cbiAgICAgICAgICA8Qm94IG10PVwieGxcIj5cbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+XG4gICAgICAgICAgICAgIOW9k+WJjeWQjuWPsOW3sue7j+S7jumAmueUqCBDUlVEIOWjs+WxguWNh+e6p+aIkOW3peS9nOWPsOe7k+aehOOAguaOpeS4i+adpeWmguaenOe7p+e7reaJk+ejqOWVhueUqOWTgei0qO+8jOW7uuiuruihpeaJuemHj+aTjeS9nOOAgeWbvuihqOi2i+WKv+WSjOWyl+S9jeWMlummlumhteOAglxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8UGFuZWxDYXJkXG4gICAgICAgICAgZGVzY3JpcHRpb249XCLku4rlpKnmnIDlgLzlvpfkvJjlhYjlhbPms6jnmoTlh6DnsbvkuovpobnjgIJcIlxuICAgICAgICAgIHRpdGxlPVwi6L+Q6JCl5o+Q56S6XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxGZWVkTGlzdFxuICAgICAgICAgICAgZW1wdHk9XCLlvZPliY3msqHmnInpnIDopoHnibnliKvmj5DnpLrnmoTov5DokKXkuovpobnjgIJcIlxuICAgICAgICAgICAgaXRlbXM9e2RhdGE/LnNwb3RsaWdodHMgfHwgW119XG4gICAgICAgICAgICByZW5kZXJJdGVtPXsoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGJhZGdlPXtpdGVtLmJhZGdlfVxuICAgICAgICAgICAgICAgIGJvZHk9e2l0ZW0uYm9keX1cbiAgICAgICAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e2l0ZW0uc3VidGl0bGV9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgICAgdG9uZT17aXRlbS50b25lfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwieGxcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtbJzFmcicsICcxZnInLCAnMS4yZnIgMWZyIDFmciddfT5cbiAgICAgICAgPFBhbmVsQ2FyZCBkZXNjcmlwdGlvbj1cIuacgOi/keWujOaIkOaIluWksei0peeahOS7u+WKoe+8jOW4ruWKqeWAvOePreWQjOWtpuW/q+mAn+WIpOaWremTvui3r+eos+WumuaAp+OAglwiIHRpdGxlPVwi5pyA6L+R5Lu75YqhXCI+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieacgOi/keS7u+WKoeOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8ucmVjZW50Sm9icyB8fCBbXX1cbiAgICAgICAgICAgIHJlbmRlckl0ZW09eyhqb2IpID0+IChcbiAgICAgICAgICAgICAgPEZlZWRSb3dcbiAgICAgICAgICAgICAgICBhc2lkZT17am9iLmNyZWF0ZWRBdExhYmVsfVxuICAgICAgICAgICAgICAgIGJhZGdlPXtqb2Iuc3RhdHVzTGFiZWx9XG4gICAgICAgICAgICAgICAgYm9keT17am9iLnByb21wdH1cbiAgICAgICAgICAgICAgICBrZXk9e2pvYi5pZH1cbiAgICAgICAgICAgICAgICBzdWJ0aXRsZT17am9iLnVzZXJOaWNrbmFtZSB8fCBqb2IudXNlcklkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtqb2IudGVtcGxhdGVUaXRsZSB8fCAn6Ieq55Sx55Sf5oiQ5Lu75YqhJ31cbiAgICAgICAgICAgICAgICB0b25lPXtqb2IudG9uZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG5cbiAgICAgICAgPFBhbmVsQ2FyZCBkZXNjcmlwdGlvbj1cIumcgOimgei/kOiQpeaIluWGheWuueWQjOWtpuWwveW/q+WkhOeQhueahOWuoeaguOmhueOAglwiIHRpdGxlPVwi5a6h5qC46Zif5YiXXCI+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieW+heWkhOeQhuWuoeaguOmhueOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8ucmV2aWV3UXVldWUgfHwgW119XG4gICAgICAgICAgICByZW5kZXJJdGVtPXsoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGFzaWRlPXtpdGVtLnVwZGF0ZWRBdExhYmVsfVxuICAgICAgICAgICAgICAgIGJhZGdlPXtpdGVtLnN0YXR1c0xhYmVsfVxuICAgICAgICAgICAgICAgIGJvZHk9e2l0ZW0uc3VtbWFyeSB8fCAn5pqC5peg5a6h5qC45aSH5rOoJ31cbiAgICAgICAgICAgICAgICBrZXk9e2Ake2l0ZW0uZW50aXR5VHlwZX0tJHtpdGVtLmVudGl0eUlkfWB9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e2l0ZW0uZW50aXR5VHlwZUxhYmVsfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgICAgIHRvbmU9e2l0ZW0udG9uZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG5cbiAgICAgICAgPFBhbmVsQ2FyZCBkZXNjcmlwdGlvbj1cIuaJgOacieWFs+mUruWGmeaTjeS9nOmDveS8muayiea3gOWIsOi/memHjOOAglwiIHRpdGxlPVwi5pyA6L+R5a6h6K6hXCI+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieacgOi/keWuoeiuoeWKqOS9nOOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8uYXVkaXRMb2dzIHx8IFtdfVxuICAgICAgICAgICAgcmVuZGVySXRlbT17KGxvZykgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGFzaWRlPXtsb2cuY3JlYXRlZEF0TGFiZWx9XG4gICAgICAgICAgICAgICAgYm9keT17bG9nLmVudGl0eUxhYmVsfVxuICAgICAgICAgICAgICAgIGtleT17bG9nLmlkfVxuICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtsb2cuYWN0b3JOaWNrbmFtZSB8fCAnc3lzdGVtJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17bG9nLmFjdGlvbkxhYmVsfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cbiAgICAgIDwvQm94PlxuICAgIDwvQWRtaW5QYWdlU2hlbGw+XG4gICk7XG59XG4iLCJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7XG4gIEFkbWluUGFnZVNoZWxsLFxuICBCdWxrQWN0aW9uQmFyLFxuICBGZWVkTGlzdCxcbiAgRmVlZFJvdyxcbiAgSW5zaWdodFN0cmlwLFxuICBMYXJnZVByZXZpZXdNb2RhbCxcbiAgUGFuZWxDYXJkLFxuICBQcmV2aWV3UmV2aWV3Qm9hcmQsXG4gIFF1aWNrQWN0aW9uR3JpZCxcbiAgUmV2aWV3Tm90ZVRlbXBsYXRlUGlja2VyLFxuICBTdGF0R3JpZCxcbiAgZm9ybWF0RGF0ZSxcbiAgcmF0aW8sXG4gIHN0YXR1c0xhYmVsLFxuICBzdGF0dXNUb25lLFxuICB1c2VBZG1pblBhZ2UsXG4gIHVzZVNlbGVjdGlvblxufSBmcm9tICcuL3NoYXJlZC5qc3gnO1xuXG5jb25zdCBxdWlja0FjdGlvbnMgPSBbXG4gIHsgbGFiZWw6ICfmn6XnnIvmqKHmnb/liJfooagnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9UZW1wbGF0ZS9hY3Rpb25zL2xpc3QnLCBpY29uOiAnTGF5b3V0JyB9LFxuICB7IGxhYmVsOiAn5p+l55yL5a6h5qC46K6w5b2VJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQ29udGVudFJldmlldy9hY3Rpb25zL2xpc3QnLCBpY29uOiAnU2hpZWxkJyB9LFxuICB7IGxhYmVsOiAn57Sg5p2Q6LWE5Lqn5bqTJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQXNzZXQvYWN0aW9ucy9saXN0JywgaWNvbjogJ0ltYWdlJyB9LFxuICB7IGxhYmVsOiAn56S+5Yy65YaF5a65JywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQ29tbXVuaXR5UG9zdC9hY3Rpb25zL2xpc3QnLCBpY29uOiAnTWVzc2FnZVNxdWFyZScgfVxuXTtcblxuY29uc3QgcmV2aWV3Tm90ZVRlbXBsYXRlcyA9IFtcbiAgeyBsYWJlbDogJ+WTgeeJjOe6puadn+mcgOihpeWFhScsIHZhbHVlOiAn5bu66K6u6KGl5YWF5ZOB54mM6K+G5Yir5ZKM6aOO5qC857qm5p2f77yM6YG/5YWN55Sf5oiQ57uT5p6c6L+H5LqO5Y+R5pWj44CCJyB9LFxuICB7IGxhYmVsOiAn55S76Z2i5bGC5qyh6ZyA5Yqg5by6JywgdmFsdWU6ICflu7rorq7liqDlvLrkuLvkvZPlsYLmrKHjgIHlhYnlvbHlr7nmr5TlkozljZbngrnogZrnhKbvvIzlho3mj5DkuqTlrqHmoLjjgIInIH0sXG4gIHsgbGFiZWw6ICfmlofmoYjnlZnnmb3kuI3otrMnLCB2YWx1ZTogJ+ivt+ihpei2s+agh+mimOS4juWNlueCueaWh+ahiOeVmeeZveWMuuWfn++8jOS/neivgeiQveWcsOmhteWPr+eUqOaAp+OAgicgfSxcbiAgeyBsYWJlbDogJ+aJuemHj+WuoeaguOmAmui/hycsIHZhbHVlOiAn5YaF5a6557uT5p6E5a6M5pW077yM6LSo6YeP56iz5a6a77yM5om56YeP5a6h5qC46YCa6L+H44CCJyB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb250ZW50U3R1ZGlvUGFnZSgpIHtcbiAgY29uc3Qge1xuICAgIGxvYWRpbmcsXG4gICAgc3VibWl0dGluZyxcbiAgICBlcnJvcixcbiAgICBub3RpY2UsXG4gICAgZGF0YSxcbiAgICBzdWJtaXQsXG4gICAgY2xlYXJOb3RpY2VcbiAgfSA9IHVzZUFkbWluUGFnZSgnY29udGVudFN0dWRpbycpO1xuXG4gIGNvbnN0IHRlbXBsYXRlU2VsZWN0aW9uID0gdXNlU2VsZWN0aW9uKGRhdGE/LnRlbXBsYXRlUmV2aWV3UXVldWUgfHwgW10pO1xuICBjb25zdCBbcHJldmlld0l0ZW0sIHNldFByZXZpZXdJdGVtXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbc2VsZWN0ZWRSZXZpZXdOb3RlLCBzZXRTZWxlY3RlZFJldmlld05vdGVdID0gdXNlU3RhdGUocmV2aWV3Tm90ZVRlbXBsYXRlc1swXS52YWx1ZSk7XG5cbiAgYXN5bmMgZnVuY3Rpb24gcnVuQnVsa1JldmlldyhzdGF0dXMsIHN1bW1hcnkpIHtcbiAgICBpZiAoIXRlbXBsYXRlU2VsZWN0aW9uLnNlbGVjdGVkSWRzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGF3YWl0IHN1Ym1pdCh7XG4gICAgICBhY3Rpb246ICdidWxrUmV2aWV3VGVtcGxhdGVzJyxcbiAgICAgIGlkczogdGVtcGxhdGVTZWxlY3Rpb24uc2VsZWN0ZWRJZHMsXG4gICAgICBzdGF0dXMsXG4gICAgICBzdW1tYXJ5XG4gICAgfSk7XG4gICAgdGVtcGxhdGVTZWxlY3Rpb24uY2xlYXIoKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEFkbWluUGFnZVNoZWxsXG4gICAgICBhY3Rpb25zPXtxdWlja0FjdGlvbnN9XG4gICAgICBkZXNjcmlwdGlvbj1cIuaKiuaooeadv+WuoeaguOOAgee0oOadkOi0qOajgOOAgeekvuWMuuWGheWuueWSjOWIhuexu+e7k+aehOaUvuWIsOWQjOS4gOS4quWGheWuueS4reWPsOmHjO+8jOWHj+Wwkei/kOiQpeWcqOi1hOa6kOihqOS5i+mXtOadpeWbnuWIh+aNouOAglwiXG4gICAgICBleWVicm93PVwi5YaF5a655Lit5Y+wXCJcbiAgICAgIGVycm9yPXtlcnJvcn1cbiAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICBub3RpY2U9e25vdGljZX1cbiAgICAgIG9uRGlzbWlzc05vdGljZT17Y2xlYXJOb3RpY2V9XG4gICAgICB0aXRsZT1cIuWGheWuueS4reWPsFwiXG4gICAgPlxuICAgICAgPFN0YXRHcmlkXG4gICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgeyBsYWJlbDogJ+W+heWuoeaguOaAu+aVsCcsIHZhbHVlOiBkYXRhPy5zdGF0cy5wZW5kaW5nUmV2aWV3cyA/PyAwLCBub3RlOiAn5qih5p2/44CB57Sg5p2Q5LiO56S+5Yy65YaF5a6555qE5oC75b6F5aSE55CG6YePJywgaWNvbjogJ1NoaWVsZCcsIGFjY2VudDogJ29yYW5nZScgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn6I2J56i/5qih5p2/JywgdmFsdWU6IGRhdGE/LnN0YXRzLmRyYWZ0VGVtcGxhdGVzID8/IDAsIG5vdGU6ICflsJrmnKrpgIHlrqHmiJblvoXnu6fnu63miZPno6jnmoTmqKHmnb8nLCBpY29uOiAnRWRpdCcsIGFjY2VudDogJ3B1cnBsZScgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn5a6h5qC45Lit5qih5p2/JywgdmFsdWU6IGRhdGE/LnN0YXRzLmluUmV2aWV3VGVtcGxhdGVzID8/IDAsIG5vdGU6ICfmraPlnKjnrYnlvoXov5DokKXmiJblhoXlrrnotJ/otKPkurrlpITnkIYnLCBpY29uOiAnQWN0aXZpdHknLCBhY2NlbnQ6ICd5ZWxsb3cnIH0sXG4gICAgICAgICAgeyBsYWJlbDogJ+S8muWRmOaooeadv+WNoOavlCcsIHZhbHVlOiByYXRpbyhkYXRhPy5zdGF0cy5wcmVtaXVtUmF0aW8gPz8gMCksIG5vdGU6ICflvZPliY3mqKHmnb/lupPkuK3kvJrlkZjmqKHmnb/nmoTphY3nva7ljaDmr5QnLCBpY29uOiAnU3RhcicsIGFjY2VudDogJ2N5YW4nIH1cbiAgICAgICAgXX1cbiAgICAgIC8+XG5cbiAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgYWN0aW9ucz17KFxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+XG4gICAgICAgICAgICB7dGVtcGxhdGVTZWxlY3Rpb24uc2VsZWN0ZWRDb3VudCA/IGDlt7LpgIkgJHt0ZW1wbGF0ZVNlbGVjdGlvbi5zZWxlY3RlZENvdW50fSDkuKrmqKHmnb9gIDogJ+WFiOWLvumAieaooeadv++8jOWGjeaJp+ihjOaJuemHj+WuoeaguCd9XG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICApfVxuICAgICAgICBkZXNjcmlwdGlvbj1cIue7meWuoeaguOWQjOWtpuS4gOS4quecn+ato+WPr+aTjeS9nOeahOaooeadv+eci+adv++8mueci+WbvuOAgeeci+agh+etvuOAgeeci+WcuuaZr++8jOeEtuWQjuaJuemHj+i/h+WuoeaIlumAgOWbnuOAglwiXG4gICAgICAgIHRpdGxlPVwi5qih5p2/5a6h5qC46aG1XCJcbiAgICAgID5cbiAgICAgICAgPFJldmlld05vdGVUZW1wbGF0ZVBpY2tlclxuICAgICAgICAgIG9uU2VsZWN0PXtzZXRTZWxlY3RlZFJldmlld05vdGV9XG4gICAgICAgICAgc2VsZWN0ZWRWYWx1ZT17c2VsZWN0ZWRSZXZpZXdOb3RlfVxuICAgICAgICAgIHRlbXBsYXRlcz17cmV2aWV3Tm90ZVRlbXBsYXRlc31cbiAgICAgICAgLz5cbiAgICAgICAgPFByZXZpZXdSZXZpZXdCb2FyZFxuICAgICAgICAgIGVtcHR5PVwi5b2T5YmN5rKh5pyJ5b6F5a6h5qC45qih5p2/44CCXCJcbiAgICAgICAgICBpdGVtcz17ZGF0YT8udGVtcGxhdGVSZXZpZXdRdWV1ZSB8fCBbXX1cbiAgICAgICAgICBvblByZXZpZXc9e3NldFByZXZpZXdJdGVtfVxuICAgICAgICAgIG9uVG9nZ2xlPXt0ZW1wbGF0ZVNlbGVjdGlvbi50b2dnbGV9XG4gICAgICAgICAgb25Ub2dnbGVBbGw9e3RlbXBsYXRlU2VsZWN0aW9uLnRvZ2dsZUFsbH1cbiAgICAgICAgICBzZWxlY3RlZElkcz17dGVtcGxhdGVTZWxlY3Rpb24uc2VsZWN0ZWRJZHN9XG4gICAgICAgICAgdGl0bGVMYWJlbD1cIuW+heWuoeaguOaooeadv1wiXG4gICAgICAgIC8+XG4gICAgICAgIDxCdWxrQWN0aW9uQmFyXG4gICAgICAgICAgb25BcHByb3ZlPXsoKSA9PiBydW5CdWxrUmV2aWV3KCdBUFBST1ZFRCcsIHNlbGVjdGVkUmV2aWV3Tm90ZSl9XG4gICAgICAgICAgb25BcmNoaXZlPXsoKSA9PiBydW5CdWxrUmV2aWV3KCdSRUpFQ1RFRCcsIHNlbGVjdGVkUmV2aWV3Tm90ZSB8fCAn5om56YeP5b2S5qGj5aSE55CGJyl9XG4gICAgICAgICAgb25SZXF1ZXN0Q2hhbmdlcz17KCkgPT4gcnVuQnVsa1JldmlldygnQ0hBTkdFU19SRVFVRVNURUQnLCBzZWxlY3RlZFJldmlld05vdGUpfVxuICAgICAgICAgIHNlbGVjdGVkQ291bnQ9e3RlbXBsYXRlU2VsZWN0aW9uLnNlbGVjdGVkQ291bnR9XG4gICAgICAgICAgc3VibWl0dGluZz17c3VibWl0dGluZ31cbiAgICAgICAgLz5cbiAgICAgIDwvUGFuZWxDYXJkPlxuXG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwieGxcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtbJzFmcicsICcxZnInLCAnMS4yNWZyIDAuOTVmciddfT5cbiAgICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICAgIGRlc2NyaXB0aW9uPVwi5oyJ6L+Q6JCl5LyY5YWI57qn5YiX5Ye65pyA6ZyA6KaB5YWI5aSE55CG55qE5YaF5a656aG544CCXCJcbiAgICAgICAgICB0aXRsZT1cIuWuoeaguOW3peS9nOWPsFwiXG4gICAgICAgID5cbiAgICAgICAgICA8RmVlZExpc3RcbiAgICAgICAgICAgIGVtcHR5PVwi5b2T5YmN5rKh5pyJ5b6F5aSE55CG5YaF5a6544CCXCJcbiAgICAgICAgICAgIGl0ZW1zPXtkYXRhPy5xdWV1ZSB8fCBbXX1cbiAgICAgICAgICAgIHJlbmRlckl0ZW09eyhpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxGZWVkUm93XG4gICAgICAgICAgICAgICAgYXNpZGU9e2l0ZW0udXBkYXRlZEF0TGFiZWx9XG4gICAgICAgICAgICAgICAgYmFkZ2U9e3N0YXR1c0xhYmVsKGl0ZW0uc3RhdHVzKX1cbiAgICAgICAgICAgICAgICBib2R5PXtpdGVtLnN1bW1hcnl9XG4gICAgICAgICAgICAgICAgaW1hZ2VVcmw9e2l0ZW0ucHJldmlld0ltYWdlVXJsfVxuICAgICAgICAgICAgICAgIGtleT17YCR7aXRlbS5lbnRpdHlUeXBlfS0ke2l0ZW0uZW50aXR5SWR9YH1cbiAgICAgICAgICAgICAgICBzdWJ0aXRsZT17YCR7aXRlbS5lbnRpdHlUeXBlTGFiZWx9IMK3ICR7aXRlbS5zdWJ0aXRsZSB8fCAn5peg6KGl5YWF5L+h5oGvJ31gfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtpdGVtLnRpdGxlfVxuICAgICAgICAgICAgICAgIHRvbmU9e3N0YXR1c1RvbmUoaXRlbS5zdGF0dXMpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInhsXCI+XG4gICAgICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCLluK7liqnkvaDlv6vpgJ/or4bliKvlhoXlrrnkvpvnu5nmmK/lkKblgY/lkJHmn5DkuKrkuLvpopjjgIJcIlxuICAgICAgICAgICAgdGl0bGU9XCLliIbnsbvkuI7mnYPnm4rmtJ7lr59cIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxJbnNpZ2h0U3RyaXBcbiAgICAgICAgICAgICAgaXRlbXM9eyhkYXRhPy5jYXRlZ29yeUJyZWFrZG93biB8fCBbXSkubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBpdGVtLmNhdGVnb3J5TmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogYCR7aXRlbS5jb3VudH0g5Liq5qih5p2/YCxcbiAgICAgICAgICAgICAgICBub3RlOiBgJHtpdGVtLnByZW1pdW1Db3VudH0g5Liq5Lya5ZGY5qih5p2/YFxuICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvUGFuZWxDYXJkPlxuXG4gICAgICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCLku47mnIDmlrDnvJbovpHorrDlvZXph4zop4Llr5/mnIDov5HnmoTlhoXlrrnoioLlpY/jgIJcIlxuICAgICAgICAgICAgdGl0bGU9XCLmnIDov5HmlLnliqhcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxGZWVkTGlzdFxuICAgICAgICAgICAgICBlbXB0eT1cIuacgOi/keayoeacieWGheWuueabtOaWsOOAglwiXG4gICAgICAgICAgICAgIGl0ZW1zPXtkYXRhPy5sYXRlc3RUZW1wbGF0ZXMgfHwgW119XG4gICAgICAgICAgICAgIHJlbmRlckl0ZW09eyhpdGVtKSA9PiAoXG4gICAgICAgICAgICAgICAgPEZlZWRSb3dcbiAgICAgICAgICAgICAgICAgIGFzaWRlPXtpdGVtLnVwZGF0ZWRBdExhYmVsfVxuICAgICAgICAgICAgICAgICAgYmFkZ2U9e3N0YXR1c0xhYmVsKGl0ZW0uc3RhdHVzKX1cbiAgICAgICAgICAgICAgICAgIGltYWdlVXJsPXtpdGVtLnByZXZpZXdJbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtgJHtpdGVtLmNhdGVnb3J5TmFtZX0gwrcgJHsoaXRlbS50YWdzIHx8IFtdKS5qb2luKCcgLyAnKSB8fCAn5peg5qCH562+J31gfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgICAgICB0b25lPXtzdGF0dXNUb25lKGl0ZW0uc3RhdHVzKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1BhbmVsQ2FyZD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJzFmciAxZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmQgZGVzY3JpcHRpb249XCLpnIDopoHotKjmo4DmiJbmiZPlm57kv67mlLnnmoTntKDmnZDkvJrlh7rnjrDlnKjov5nph4zjgIJcIiB0aXRsZT1cIue0oOadkOi0qOajgOmYn+WIl1wiPlxuICAgICAgICAgIDxGZWVkTGlzdFxuICAgICAgICAgICAgZW1wdHk9XCLntKDmnZDotYTkuqflvZPliY3msqHmnInlvoXlpITnkIbpobnjgIJcIlxuICAgICAgICAgICAgaXRlbXM9e2RhdGE/LmFzc2V0cyB8fCBbXX1cbiAgICAgICAgICAgIHJlbmRlckl0ZW09eyhhc3NldCkgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGFzaWRlPXthc3NldC5jcmVhdGVkQXRMYWJlbH1cbiAgICAgICAgICAgICAgICBiYWRnZT17c3RhdHVzTGFiZWwoYXNzZXQucmV2aWV3U3RhdHVzKX1cbiAgICAgICAgICAgICAgICBib2R5PXthc3NldC5wcm9tcHR9XG4gICAgICAgICAgICAgICAgaW1hZ2VVcmw9e2Fzc2V0LmltYWdlVXJsfVxuICAgICAgICAgICAgICAgIGtleT17YXNzZXQuaWR9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e2Fzc2V0LnVzZXJOaWNrbmFtZSB8fCBhc3NldC51c2VySWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2Fzc2V0LnRpdGxlfVxuICAgICAgICAgICAgICAgIHRvbmU9e3N0YXR1c1RvbmUoYXNzZXQucmV2aWV3U3RhdHVzKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG5cbiAgICAgICAgPFBhbmVsQ2FyZCBkZXNjcmlwdGlvbj1cIuekvuWMuuWGheWuueWuoeaguOeOsOWcqOWPr+S7peWSjOaooeadv+WuoeaguOW5tuaOkuWkhOeQhuOAglwiIHRpdGxlPVwi56S+5Yy65YaF5a655rWBXCI+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieekvuWMuuW+heWuoeaguOWGheWuueOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8ucG9zdHMgfHwgW119XG4gICAgICAgICAgICByZW5kZXJJdGVtPXsocG9zdCkgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGFzaWRlPXtmb3JtYXREYXRlKHBvc3QudXBkYXRlZEF0KX1cbiAgICAgICAgICAgICAgICBiYWRnZT17c3RhdHVzTGFiZWwocG9zdC5yZXZpZXdTdGF0dXMpfVxuICAgICAgICAgICAgICAgIGJvZHk9e3Bvc3QuYm9keX1cbiAgICAgICAgICAgICAgICBpbWFnZVVybD17cG9zdC5pbWFnZVVybH1cbiAgICAgICAgICAgICAgICBrZXk9e3Bvc3QuaWR9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e3Bvc3QudXNlck5pY2tuYW1lIHx8IHBvc3QudXNlcklkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtwb3N0LnRpdGxlfVxuICAgICAgICAgICAgICAgIHRvbmU9e3N0YXR1c1RvbmUocG9zdC5yZXZpZXdTdGF0dXMpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8UGFuZWxDYXJkXG4gICAgICAgIGRlc2NyaXB0aW9uPVwi5oqK6auY6aKR5pON5L2c6ZuG5Lit5Yiw5YaF5a655Lit5Y+w5bqV6YOo77yM5L6/5LqO6L+Q6JCl5ZCM5a2m5b+r6YCf6Lez6L2s44CCXCJcbiAgICAgICAgdGl0bGU9XCLlhoXlrrnlt6XkvZzmtYHlhaXlj6NcIlxuICAgICAgPlxuICAgICAgICA8UXVpY2tBY3Rpb25HcmlkIGl0ZW1zPXtxdWlja0FjdGlvbnN9IC8+XG4gICAgICAgIDxCb3ggbXQ9XCJ4bFwiPlxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCI+XG4gICAgICAgICAgICDlvZPliY3lhoXlrrnkuK3lj7Dlt7Lnu4/ooaXkuIrlm77niYfpooTop4jlkozmibnph4/lrqHmoLjjgILkuIvkuIDpmLbmrrXlpoLmnpznu6fnu63lvoDllYbnlKjlk4HotKjljYfnuqfvvIzlu7rorq7lgZrlr7nmr5TpooTop4jjgIHlrqHmoLjlpIfms6jmqKHmnb/lkozmibnph4/moIfnrb7nu7TmiqTjgIJcbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9QYW5lbENhcmQ+XG4gICAgICA8TGFyZ2VQcmV2aWV3TW9kYWwgaXRlbT17cHJldmlld0l0ZW19IG9uQ2xvc2U9eygpID0+IHNldFByZXZpZXdJdGVtKG51bGwpfSAvPlxuICAgIDwvQWRtaW5QYWdlU2hlbGw+XG4gICk7XG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQge1xuICBBZG1pblBhZ2VTaGVsbCxcbiAgQnVsa0FjdGlvbkJhcixcbiAgRmVlZExpc3QsXG4gIEZlZWRSb3csXG4gIEluc2lnaHRTdHJpcCxcbiAgUGFuZWxDYXJkLFxuICBRdWlja0FjdGlvbkdyaWQsXG4gIFJlYXNvbkdyb3VwTGlzdCxcbiAgU2VsZWN0YWJsZUZlZWRMaXN0LFxuICBTdGF0R3JpZCxcbiAgVHJlbmRCYXJzLFxuICBzdGF0dXNMYWJlbCxcbiAgc3RhdHVzVG9uZSxcbiAgdXNlQWRtaW5QYWdlLFxuICB1c2VTZWxlY3Rpb25cbn0gZnJvbSAnLi9zaGFyZWQuanN4JztcblxuY29uc3QgcXVpY2tBY3Rpb25zID0gW1xuICB7IGxhYmVsOiAn5Lu75Yqh5YiX6KGoJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvR2VuZXJhdGlvbkpvYi9hY3Rpb25zL2xpc3QnLCBpY29uOiAnQWN0aXZpdHknIH0sXG4gIHsgbGFiZWw6ICfntKDmnZDotYTkuqcnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9Bc3NldC9hY3Rpb25zL2xpc3QnLCBpY29uOiAnSW1hZ2UnIH0sXG4gIHsgbGFiZWw6ICfns7vnu5/phY3nva4nLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TeXN0ZW1TZXR0aW5nL2FjdGlvbnMvbGlzdCcsIGljb246ICdTZXR0aW5ncycgfSxcbiAgeyBsYWJlbDogJ+WuoeiuoeaXpeW/lycsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL0F1ZGl0TG9nL2FjdGlvbnMvbGlzdCcsIGljb246ICdGaWxlVGV4dCcgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSm9iQ29tbWFuZFBhZ2UoKSB7XG4gIGNvbnN0IHsgbG9hZGluZywgZXJyb3IsIG5vdGljZSwgY2xlYXJOb3RpY2UsIGRhdGEsIHN1Ym1pdCwgc3VibWl0dGluZyB9ID0gdXNlQWRtaW5QYWdlKCdqb2JDb21tYW5kJyk7XG4gIGNvbnN0IGZhaWxlZFNlbGVjdGlvbiA9IHVzZVNlbGVjdGlvbihkYXRhPy5mYWlsZWRKb2JzIHx8IFtdKTtcbiAgY29uc3QgYWN0aXZlU2VsZWN0aW9uID0gdXNlU2VsZWN0aW9uKGRhdGE/LmFjdGl2ZUpvYnMgfHwgW10pO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHJldHJ5U2VsZWN0ZWRKb2JzKCkge1xuICAgIGlmICghZmFpbGVkU2VsZWN0aW9uLnNlbGVjdGVkSWRzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGF3YWl0IHN1Ym1pdCh7XG4gICAgICBhY3Rpb246ICdyZXRyeUpvYnMnLFxuICAgICAgaWRzOiBmYWlsZWRTZWxlY3Rpb24uc2VsZWN0ZWRJZHNcbiAgICB9KTtcbiAgICBmYWlsZWRTZWxlY3Rpb24uY2xlYXIoKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGNhbmNlbFNlbGVjdGVkSm9icygpIHtcbiAgICBpZiAoIWFjdGl2ZVNlbGVjdGlvbi5zZWxlY3RlZElkcy5sZW5ndGgpIHJldHVybjtcbiAgICBhd2FpdCBzdWJtaXQoe1xuICAgICAgYWN0aW9uOiAnY2FuY2VsSm9icycsXG4gICAgICBpZHM6IGFjdGl2ZVNlbGVjdGlvbi5zZWxlY3RlZElkc1xuICAgIH0pO1xuICAgIGFjdGl2ZVNlbGVjdGlvbi5jbGVhcigpO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8QWRtaW5QYWdlU2hlbGxcbiAgICAgIGFjdGlvbnM9e3F1aWNrQWN0aW9uc31cbiAgICAgIGRlc2NyaXB0aW9uPVwi5oqK55Sf5oiQ6ZO+6Lev44CB5aSx6LSl6YeN6K+V44CB5o+Q5L6b5pa554q25oCB5ZKM5pyA6L+R5Lqn5Ye65rGH5oC75Yiw5ZCM5LiA6aG177yM6YCC5ZCI5L2c5Li65pel5bi45YC854+t5LiO5byC5bi46Lef6Liq5YWl5Y+j44CCXCJcbiAgICAgIGV5ZWJyb3c9XCLku7vliqHmjIfmjKXlj7BcIlxuICAgICAgZXJyb3I9e2Vycm9yfVxuICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgIG5vdGljZT17bm90aWNlfVxuICAgICAgb25EaXNtaXNzTm90aWNlPXtjbGVhck5vdGljZX1cbiAgICAgIHRpdGxlPVwi5Lu75Yqh5oyH5oyl5Y+wXCJcbiAgICA+XG4gICAgICA8U3RhdEdyaWRcbiAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICB7IGxhYmVsOiAn5o6S6Zif5LitJywgdmFsdWU6IGRhdGE/LnN0YXRzLnF1ZXVlZCA/PyAwLCBub3RlOiAn562J5b6F5aSE55CG55qE5Lu75Yqh5pWwJywgaWNvbjogJ0Nsb2NrJywgYWNjZW50OiAnb3JhbmdlJyB9LFxuICAgICAgICAgIHsgbGFiZWw6ICfmiafooYzkuK0nLCB2YWx1ZTogZGF0YT8uc3RhdHMucnVubmluZyA/PyAwLCBub3RlOiAn5b2T5YmN5q2j5Zyo6LeR55qE55Sf5oiQ5Lu75YqhJywgaWNvbjogJ1BsYXknLCBhY2NlbnQ6ICdwdXJwbGUnIH0sXG4gICAgICAgICAgeyBsYWJlbDogJ+Wksei0peS7u+WKoScsIHZhbHVlOiBkYXRhPy5zdGF0cy5mYWlsZWQgPz8gMCwgbm90ZTogJ+mcgOimgei/kOiQpeaIluaKgOacr+WFs+azqOeahOW8guW4uOS7u+WKoScsIGljb246ICdBbGVydENpcmNsZScsIGFjY2VudDogJ3llbGxvdycgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn5oiQ5Yqf546HJywgdmFsdWU6IGAke2RhdGE/LnN0YXRzLnN1Y2Nlc3NSYXRlID8/IDB9JWAsIG5vdGU6ICfmnIDov5HkuIDmibnku7vliqHnmoTmgLvkvZPmiJDlip/ooajnjrAnLCBpY29uOiAnQ2hlY2tDaXJjbGUnLCBhY2NlbnQ6ICdtaW50JyB9XG4gICAgICAgIF19XG4gICAgICAvPlxuXG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwieGxcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtbJzFmcicsICcxZnInLCAnMS4xZnIgMC45ZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIueUqCA3IOWkqei2i+WKv+WbvuinguWvn+S7u+WKoeaIkOWKn+OAgeWksei0peWSjOWPlua2iOeahOazouWKqOOAglwiXG4gICAgICAgICAgdGl0bGU9XCLku7vliqHotovlir/lm75cIlxuICAgICAgICA+XG4gICAgICAgICAgPFRyZW5kQmFyc1xuICAgICAgICAgICAgaXRlbXM9e2RhdGE/LnRyZW5kIHx8IFtdfVxuICAgICAgICAgICAgc2VyaWVzPXtbXG4gICAgICAgICAgICAgIHsga2V5OiAnc3VjY2VlZGVkJywgbGFiZWw6ICfmiJDlip8nLCBjb2xvcjogJyMxRjhFNzcnIH0sXG4gICAgICAgICAgICAgIHsga2V5OiAnZmFpbGVkJywgbGFiZWw6ICflpLHotKUnLCBjb2xvcjogJyNDMjAwMTInIH0sXG4gICAgICAgICAgICAgIHsga2V5OiAnY2FuY2VsZWQnLCBsYWJlbDogJ+WPlua2iCcsIGNvbG9yOiAnIzMwNDBENicgfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8UGFuZWxDYXJkXG4gICAgICAgICAgZGVzY3JpcHRpb249XCLmiorlpLHotKXljp/lm6DlgZrogZrnsbvvvIzogIzkuI3mmK/orqnov5DokKXlnKjkuIDloIYgZXJyb3JNZXNzYWdlIOmHjOmAkOadoee/u+OAglwiXG4gICAgICAgICAgdGl0bGU9XCLlpLHotKXljp/lm6DliIbnu4RcIlxuICAgICAgICA+XG4gICAgICAgICAgPFJlYXNvbkdyb3VwTGlzdCBpdGVtcz17ZGF0YT8uZmFpbHVyZVJlYXNvbkdyb3VwcyB8fCBbXX0gLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJzEuMTVmciAxZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIuWksei0peS7u+WKoeS8muS8mOWFiOWxleekuuW8guW4uOWOn+WboO+8jOS+v+S6juWGs+WumumHjeivlei/mOaYr+WPlua2iOOAglwiXG4gICAgICAgICAgdGl0bGU9XCLlvILluLjku7vliqHpmJ/liJdcIlxuICAgICAgICA+XG4gICAgICAgICAgPFNlbGVjdGFibGVGZWVkTGlzdFxuICAgICAgICAgICAgZW1wdHk9XCLlvZPliY3msqHmnInlpLHotKXku7vliqHjgIJcIlxuICAgICAgICAgICAgaXRlbXM9e2RhdGE/LmZhaWxlZEpvYnMgfHwgW119XG4gICAgICAgICAgICBvblRvZ2dsZT17ZmFpbGVkU2VsZWN0aW9uLnRvZ2dsZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlQWxsPXtmYWlsZWRTZWxlY3Rpb24udG9nZ2xlQWxsfVxuICAgICAgICAgICAgcmVuZGVyQ29udGVudD17KGpvYikgPT4gKFxuICAgICAgICAgICAgICA8RmVlZFJvd1xuICAgICAgICAgICAgICAgIGFzaWRlPXtqb2IuY3JlYXRlZEF0TGFiZWx9XG4gICAgICAgICAgICAgICAgYmFkZ2U9e3N0YXR1c0xhYmVsKGpvYi5zdGF0dXMpfVxuICAgICAgICAgICAgICAgIGJvZHk9e2pvYi5lcnJvck1lc3NhZ2UgfHwgJ+aXoOmUmeivr+ivpuaDhSd9XG4gICAgICAgICAgICAgICAga2V5PXtqb2IuaWR9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e2Ake2pvYi5wcm92aWRlcn0gwrcgJHtqb2IudXNlck5pY2tuYW1lIHx8IGpvYi51c2VySWR9YH1cbiAgICAgICAgICAgICAgICB0aXRsZT17am9iLnRlbXBsYXRlVGl0bGUgfHwgJ+iHqueUseeUn+aIkOS7u+WKoSd9XG4gICAgICAgICAgICAgICAgdG9uZT17c3RhdHVzVG9uZShqb2Iuc3RhdHVzKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICBzZWxlY3RlZElkcz17ZmFpbGVkU2VsZWN0aW9uLnNlbGVjdGVkSWRzfVxuICAgICAgICAgICAgdGl0bGVMYWJlbD1cIuWksei0peS7u+WKoVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QnVsa0FjdGlvbkJhclxuICAgICAgICAgICAgYXBwcm92ZUxhYmVsPVwi5om56YeP6YeN6K+VXCJcbiAgICAgICAgICAgIGFyY2hpdmVMYWJlbD1cIlwiXG4gICAgICAgICAgICBvbkFwcHJvdmU9e3JldHJ5U2VsZWN0ZWRKb2JzfVxuICAgICAgICAgICAgb25BcmNoaXZlPXtudWxsfVxuICAgICAgICAgICAgb25SZXF1ZXN0Q2hhbmdlcz17bnVsbH1cbiAgICAgICAgICAgIHNlbGVjdGVkQ291bnQ9e2ZhaWxlZFNlbGVjdGlvbi5zZWxlY3RlZENvdW50fVxuICAgICAgICAgICAgc3VibWl0dGluZz17c3VibWl0dGluZ31cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInhsXCI+XG4gICAgICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCLop4Llr5/kuIrmuLjmqKHlnovlkozlhoXpg6jku7vliqHosIPluqbnmoTng63luqbliIbluIPjgIJcIlxuICAgICAgICAgICAgdGl0bGU9XCLmj5Dkvpvmlrnng63luqZcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxJbnNpZ2h0U3RyaXBcbiAgICAgICAgICAgICAgaXRlbXM9eyhkYXRhPy5wcm92aWRlck1peCB8fCBbXSkubWFwKChpdGVtKSA9PiAoe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBpdGVtLnByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBgJHtpdGVtLmNvdW50fSDkuKrku7vliqFgLFxuICAgICAgICAgICAgICAgIG5vdGU6IGDlpLHotKUgJHtpdGVtLmZhaWxlZENvdW50fSAvIOaIkOWKnyAke2l0ZW0uc3VjY2VlZGVkQ291bnR9YFxuICAgICAgICAgICAgICB9KSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvUGFuZWxDYXJkPlxuXG4gICAgICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCLnnIvkuIDkuIvliJrliJrkuqflh7rnmoTntKDmnZDvvIznoa7orqTkuLvpk77ot6/mmK/lkKbnqLPlrprjgIJcIlxuICAgICAgICAgICAgdGl0bGU9XCLmnIDov5Hkuqflh7pcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxGZWVkTGlzdFxuICAgICAgICAgICAgICBlbXB0eT1cIuacgOi/kei/mOayoeacieaWsOS6p+WHuueahOe0oOadkOOAglwiXG4gICAgICAgICAgICAgIGl0ZW1zPXtkYXRhPy5sYXRlc3RBc3NldHMgfHwgW119XG4gICAgICAgICAgICAgIHJlbmRlckl0ZW09eyhhc3NldCkgPT4gKFxuICAgICAgICAgICAgICAgIDxGZWVkUm93XG4gICAgICAgICAgICAgICAgICBhc2lkZT17YXNzZXQuY3JlYXRlZEF0TGFiZWx9XG4gICAgICAgICAgICAgICAgICBiYWRnZT17c3RhdHVzTGFiZWwoYXNzZXQucmV2aWV3U3RhdHVzKX1cbiAgICAgICAgICAgICAgICAgIGJvZHk9e2Fzc2V0LnByb21wdH1cbiAgICAgICAgICAgICAgICAgIGltYWdlVXJsPXthc3NldC5pbWFnZVVybH1cbiAgICAgICAgICAgICAgICAgIGtleT17YXNzZXQuaWR9XG4gICAgICAgICAgICAgICAgICBzdWJ0aXRsZT17YXNzZXQudXNlck5pY2tuYW1lIHx8IGFzc2V0LnVzZXJJZH1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPXthc3NldC50aXRsZX1cbiAgICAgICAgICAgICAgICAgIHRvbmU9e3N0YXR1c1RvbmUoYXNzZXQucmV2aWV3U3RhdHVzKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L1BhbmVsQ2FyZD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJzFmciAxZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmQgZGVzY3JpcHRpb249XCLlgLznj63lkIzlrabmnIDluLjlhbPms6jnmoTov5DooYzkuK3ku7vliqHjgIJcIiB0aXRsZT1cIui/kOihjOS4reS7u+WKoVwiPlxuICAgICAgICAgIDxTZWxlY3RhYmxlRmVlZExpc3RcbiAgICAgICAgICAgIGVtcHR5PVwi5b2T5YmN5rKh5pyJ6L+Q6KGM5Lit5Lu75Yqh44CCXCJcbiAgICAgICAgICAgIGl0ZW1zPXtkYXRhPy5hY3RpdmVKb2JzIHx8IFtdfVxuICAgICAgICAgICAgb25Ub2dnbGU9e2FjdGl2ZVNlbGVjdGlvbi50b2dnbGV9XG4gICAgICAgICAgICBvblRvZ2dsZUFsbD17YWN0aXZlU2VsZWN0aW9uLnRvZ2dsZUFsbH1cbiAgICAgICAgICAgIHJlbmRlckNvbnRlbnQ9eyhqb2IpID0+IChcbiAgICAgICAgICAgICAgPEZlZWRSb3dcbiAgICAgICAgICAgICAgICBhc2lkZT17am9iLnN0YXJ0ZWRBdExhYmVsIHx8IGpvYi5jcmVhdGVkQXRMYWJlbH1cbiAgICAgICAgICAgICAgICBiYWRnZT17c3RhdHVzTGFiZWwoam9iLnN0YXR1cyl9XG4gICAgICAgICAgICAgICAgYm9keT17am9iLnByb21wdH1cbiAgICAgICAgICAgICAgICBrZXk9e2pvYi5pZH1cbiAgICAgICAgICAgICAgICBzdWJ0aXRsZT17YCR7am9iLnByb3ZpZGVyfSDCtyAke2pvYi51c2VyTmlja25hbWUgfHwgam9iLnVzZXJJZH1gfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtqb2IudGVtcGxhdGVUaXRsZSB8fCAn6Ieq55Sx55Sf5oiQ5Lu75YqhJ31cbiAgICAgICAgICAgICAgICB0b25lPXtzdGF0dXNUb25lKGpvYi5zdGF0dXMpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIHNlbGVjdGVkSWRzPXthY3RpdmVTZWxlY3Rpb24uc2VsZWN0ZWRJZHN9XG4gICAgICAgICAgICB0aXRsZUxhYmVsPVwi6L+Q6KGM5Lit5Lu75YqhXCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxCdWxrQWN0aW9uQmFyXG4gICAgICAgICAgICBhcHByb3ZlTGFiZWw9XCJcIlxuICAgICAgICAgICAgYXJjaGl2ZUxhYmVsPVwi5om56YeP5Y+W5raIXCJcbiAgICAgICAgICAgIG9uQXBwcm92ZT17bnVsbH1cbiAgICAgICAgICAgIG9uQXJjaGl2ZT17Y2FuY2VsU2VsZWN0ZWRKb2JzfVxuICAgICAgICAgICAgb25SZXF1ZXN0Q2hhbmdlcz17bnVsbH1cbiAgICAgICAgICAgIHNlbGVjdGVkQ291bnQ9e2FjdGl2ZVNlbGVjdGlvbi5zZWxlY3RlZENvdW50fVxuICAgICAgICAgICAgc3VibWl0dGluZz17c3VibWl0dGluZ31cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8UGFuZWxDYXJkIGRlc2NyaXB0aW9uPVwi5oyJ54q25oCB5ouG5byA55yL5pyA6L+R5aSE55CG6IqC5aWP44CCXCIgdGl0bGU9XCLku7vliqHoioLlpY/mtJ7lr59cIj5cbiAgICAgICAgICA8SW5zaWdodFN0cmlwXG4gICAgICAgICAgICBpdGVtcz17W1xuICAgICAgICAgICAgICB7IGxhYmVsOiAn5pyA6L+RIDI0IOWwj+aXtuaIkOWKnycsIHZhbHVlOiBgJHtkYXRhPy50aW1lbGluZS5zdWNjZXNzTGFzdDI0aCA/PyAwfWAsIG5vdGU6ICfluK7liqnliKTmlq3pk77ot6/mmK/lkKbnqLPlrponIH0sXG4gICAgICAgICAgICAgIHsgbGFiZWw6ICfmnIDov5EgMjQg5bCP5pe25aSx6LSlJywgdmFsdWU6IGAke2RhdGE/LnRpbWVsaW5lLmZhaWxlZExhc3QyNGggPz8gMH1gLCBub3RlOiAn5b+r6YCf5a6a5L2N5piv5ZCm5pyJ5LiK5ri45oqW5YqoJyB9LFxuICAgICAgICAgICAgICB7IGxhYmVsOiAn5pyA6L+RIDI0IOWwj+aXtuWPlua2iCcsIHZhbHVlOiBgJHtkYXRhPy50aW1lbGluZS5jYW5jZWxlZExhc3QyNGggPz8gMH1gLCBub3RlOiAn6KeC5a+f6L+Q6JCl5LuL5YWl5q+U5L6LJyB9XG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEJveCBtdD1cInhsXCI+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPlxuICAgICAgICAgICAgICDlvZPliY3ku7vliqHmjIfmjKXlj7Dlt7Lnu4/ooaXkuIrotovlir/lm77lkozlpLHotKXljp/lm6DliIbnu4TjgILkuIvkuIDpmLbmrrXlpoLmnpznu6fnu63ljYfnuqfvvIzlj6/ku6XmjqXlhaXoh6rliqjph43or5XnrZbnlaXjgIHlvILluLjlkYrorablkozmjInmqKHmnb8v5rig6YGT57u05bqm55qE5aSx6LSl6IGa57G744CCXG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgIDwvUGFuZWxDYXJkPlxuICAgICAgPC9Cb3g+XG4gICAgPC9BZG1pblBhZ2VTaGVsbD5cbiAgKTtcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7XG4gIEFkbWluUGFnZVNoZWxsLFxuICBGZWVkTGlzdCxcbiAgRmVlZFJvdyxcbiAgSW5zaWdodFN0cmlwLFxuICBQYW5lbENhcmQsXG4gIFF1aWNrQWN0aW9uR3JpZCxcbiAgUmVuZXdhbENhcmRzLFxuICBTdGF0R3JpZCxcbiAgVHJlbmRCYXJzLFxuICBmb3JtYXRDdXJyZW5jeSxcbiAgcmF0aW8sXG4gIHN0YXR1c0xhYmVsLFxuICBzdGF0dXNUb25lLFxuICB1c2VBZG1pblBhZ2Vcbn0gZnJvbSAnLi9zaGFyZWQuanN4JztcblxuY29uc3QgcXVpY2tBY3Rpb25zID0gW1xuICB7IGxhYmVsOiAn5aWX6aSQ6YWN572uJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU3Vic2NyaXB0aW9uUGxhbi9hY3Rpb25zL2xpc3QnLCBpY29uOiAnTGF5ZXJzJyB9LFxuICB7IGxhYmVsOiAn6K6i6ZiF5YiX6KGoJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU3Vic2NyaXB0aW9uL2FjdGlvbnMvbGlzdCcsIGljb246ICdDcmVkaXRDYXJkJyB9LFxuICB7IGxhYmVsOiAn6K6i5Y2V5YiX6KGoJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvUGF5bWVudE9yZGVyL2FjdGlvbnMvbGlzdCcsIGljb246ICdTaG9wcGluZ0NhcnQnIH0sXG4gIHsgbGFiZWw6ICfnlKjmiLfnrqHnkIYnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9Vc2VyL2FjdGlvbnMvbGlzdCcsIGljb246ICdVc2VycycgfVxuXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUmV2ZW51ZU9wc1BhZ2UoKSB7XG4gIGNvbnN0IHsgbG9hZGluZywgZXJyb3IsIG5vdGljZSwgY2xlYXJOb3RpY2UsIGRhdGEgfSA9IHVzZUFkbWluUGFnZSgncmV2ZW51ZU9wcycpO1xuXG4gIHJldHVybiAoXG4gICAgPEFkbWluUGFnZVNoZWxsXG4gICAgICBhY3Rpb25zPXtxdWlja0FjdGlvbnN9XG4gICAgICBkZXNjcmlwdGlvbj1cIuaKiuWll+mkkOmFjee9ruOAgeiuoumYheeKtuaAgeOAgeW+heaUr+S7mOiuouWNleWSjOaUtuasvuihqOeOsOiBmuWIsOS4gOS4quWVhuS4muWMluW3peS9nOWPsO+8jOaWueS+v+i/kOiQpeOAgemUgOWUruWSjOi0ouWKoeWNj+S9nOOAglwiXG4gICAgICBleWVicm93PVwi5ZWG5Lia5YyW5Lit5Y+wXCJcbiAgICAgIGVycm9yPXtlcnJvcn1cbiAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICBub3RpY2U9e25vdGljZX1cbiAgICAgIG9uRGlzbWlzc05vdGljZT17Y2xlYXJOb3RpY2V9XG4gICAgICB0aXRsZT1cIuWVhuS4muWMluS4reWPsFwiXG4gICAgPlxuICAgICAgPFN0YXRHcmlkXG4gICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgeyBsYWJlbDogJ+a0u+i3g+iuoumYhScsIHZhbHVlOiBkYXRhPy5zdGF0cy5hY3RpdmVTdWJzY3JpcHRpb25zID8/IDAsIG5vdGU6ICflvZPliY3mnInmlYjorqLpmIXkuK3nmoTnlKjmiLfmlbDph48nLCBpY29uOiAnQ3JlZGl0Q2FyZCcsIGFjY2VudDogJ29yYW5nZScgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn5b6F5pSv5LuY6K6i5Y2VJywgdmFsdWU6IGRhdGE/LnN0YXRzLnBlbmRpbmdPcmRlcnMgPz8gMCwgbm90ZTogJ+S7jemcgOi3n+i/m+aIluWCrOS7mOeahOiuouWNlScsIGljb246ICdBbGVydENpcmNsZScsIGFjY2VudDogJ3llbGxvdycgfSxcbiAgICAgICAgICB7IGxhYmVsOiAn57Sv6K6h5bey5pSv5LuYJywgdmFsdWU6IGZvcm1hdEN1cnJlbmN5KGRhdGE/LnN0YXRzLnRvdGFsUGFpZENlbnRzID8/IDApLCBub3RlOiAn5b2T5YmN5bqT5Lit5bey56Gu6K6k5pSv5LuY55qE6K6i5Y2V5oC76aKdJywgaWNvbjogJ1dhbGxldCcsIGFjY2VudDogJ21pbnQnIH0sXG4gICAgICAgICAgeyBsYWJlbDogJ+iuoumYhei9rOWMlueOhycsIHZhbHVlOiByYXRpbyhkYXRhPy5zdGF0cy5jb252ZXJzaW9uUmF0ZSA/PyAwKSwgbm90ZTogJ+a0u+i3g+iuoumYheeUqOaIt+WNoOWFqOmDqOeUqOaIt+eahOavlOS+iycsIGljb246ICdUcmVuZGluZ1VwJywgYWNjZW50OiAncHVycGxlJyB9XG4gICAgICAgIF19XG4gICAgICAvPlxuXG4gICAgICA8Qm94IGRpc3BsYXk9XCJncmlkXCIgZ2FwPVwieGxcIiBncmlkVGVtcGxhdGVDb2x1bW5zPXtbJzFmcicsICcxZnInLCAnMS4xZnIgMC45ZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIuacgOi/kSA3IOWkqeaUtuWFpei2i+WKv++8jOW4ruWKqeS9oOWIpOaWrei9rOWMluazouWKqOWSjOaUtuasvuWbnua1geiKguWlj+OAglwiXG4gICAgICAgICAgdGl0bGU9XCLmjInlpKnmlLblhaXlr7nmr5Tlm75cIlxuICAgICAgICA+XG4gICAgICAgICAgPFRyZW5kQmFyc1xuICAgICAgICAgICAgaXRlbXM9e2RhdGE/LnJldmVudWVUcmVuZCB8fCBbXX1cbiAgICAgICAgICAgIHNlcmllcz17W1xuICAgICAgICAgICAgICB7IGtleTogJ2N1cnJlbnRQYWlkQ2VudHMnLCBsYWJlbDogJ+acgOi/kSA3IOWkqScsIGNvbG9yOiAnIzFGOEU3NycgfSxcbiAgICAgICAgICAgICAgeyBrZXk6ICdwcmV2aW91c1BhaWRDZW50cycsIGxhYmVsOiAn5LiK5LiA5ZGo5pyfJywgY29sb3I6ICcjMzA0MEQ2JyB9XG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvUGFuZWxDYXJkPlxuXG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIuS4tOi/kee7rei0ueeahOiuoumYheeUqOaIt+W6lOW9k+aPkOWJjeaPkOmGkuaIlumHjeeCuei3n+i/m+OAglwiXG4gICAgICAgICAgdGl0bGU9XCLnu63otLnmj5DphpLljaHniYdcIlxuICAgICAgICA+XG4gICAgICAgICAgPFJlbmV3YWxDYXJkcyBpdGVtcz17ZGF0YT8ucmVuZXdhbFJlbWluZGVycyB8fCBbXX0gLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJzEuMTVmciAxZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIue7k+WQiOWll+mkkOWIhuW4g+WSjOaUtuWFpeaehOaIkO+8jOW/q+mAn+WIpOaWreW9k+WJjeS4u+imgeWinumVv+adpea6kOOAglwiXG4gICAgICAgICAgdGl0bGU9XCLlpZfppJDmlLblhaXnu5PmnoRcIlxuICAgICAgICA+XG4gICAgICAgICAgPEluc2lnaHRTdHJpcFxuICAgICAgICAgICAgaXRlbXM9eyhkYXRhPy5wbGFuTWl4IHx8IFtdKS5tYXAoKHBsYW4pID0+ICh7XG4gICAgICAgICAgICAgIGxhYmVsOiBwbGFuLm5hbWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBgJHtwbGFuLmFjdGl2ZVN1YnNjcmlwdGlvbnN9IOS4quiuoumYhWAsXG4gICAgICAgICAgICAgIG5vdGU6IGDorqLljZXntK/orqEgJHtmb3JtYXRDdXJyZW5jeShwbGFuLnBhaWRDZW50cyl9YFxuICAgICAgICAgICAgfSkpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvUGFuZWxDYXJkPlxuXG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIuaMieaUr+S7mOa4oOmBk+eci+aUtuWFpeW9kuWboO+8jOW4ruWKqeWIpOaWreaUtuasvui3r+W+hOWSjOi/kOiQpeW8leWvvOaViOaenOOAglwiXG4gICAgICAgICAgdGl0bGU9XCLmuKDpgZPlvZLlm6BcIlxuICAgICAgICA+XG4gICAgICAgICAgPEluc2lnaHRTdHJpcFxuICAgICAgICAgICAgaXRlbXM9eyhkYXRhPy5jaGFubmVsTWl4IHx8IFtdKS5tYXAoKGl0ZW0pID0+ICh7XG4gICAgICAgICAgICAgIGxhYmVsOiBpdGVtLmNoYW5uZWwgPT09ICd1bmtub3duJyA/ICfmnKrmoIforrDmuKDpgZMnIDogaXRlbS5jaGFubmVsLFxuICAgICAgICAgICAgICB2YWx1ZTogZm9ybWF0Q3VycmVuY3koaXRlbS5wYWlkQ2VudHMpLFxuICAgICAgICAgICAgICBub3RlOiBgJHtpdGVtLmNvdW50fSDnrJTmlK/ku5jorqLljZVgXG4gICAgICAgICAgICB9KSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBkaXNwbGF5PVwiZ3JpZFwiIGdhcD1cInhsXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz17WycxZnInLCAnMWZyJywgJzFmciAxZnInXX0+XG4gICAgICAgIDxQYW5lbENhcmRcbiAgICAgICAgICBkZXNjcmlwdGlvbj1cIuS8mOWFiOi3n+i/m+W+heaUr+S7mOiuouWNleWSjOS4tOi/keWIsOacn+iuoumYheOAglwiXG4gICAgICAgICAgdGl0bGU9XCLlvoXlpITnkIbllYbkuJrliqjkvZxcIlxuICAgICAgICA+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieW+hei3n+i/m+WVhuS4muS6i+mhueOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8uZm9sbG93VXBzIHx8IFtdfVxuICAgICAgICAgICAgcmVuZGVySXRlbT17KGl0ZW0pID0+IChcbiAgICAgICAgICAgICAgPEZlZWRSb3dcbiAgICAgICAgICAgICAgICBhc2lkZT17aXRlbS5tZXRhfVxuICAgICAgICAgICAgICAgIGJhZGdlPXtpdGVtLmJhZGdlfVxuICAgICAgICAgICAgICAgIGJvZHk9e2l0ZW0ubm90ZX1cbiAgICAgICAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e2l0ZW0uc3VidGl0bGV9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2l0ZW0udGl0bGV9XG4gICAgICAgICAgICAgICAgdG9uZT17aXRlbS50b25lfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhbmVsQ2FyZD5cblxuICAgICAgICA8UGFuZWxDYXJkIGRlc2NyaXB0aW9uPVwi5pyA6L+R5pSv5LuY5oiQ5Yqf55qE6K6i5Y2V77yM5biu5Yqp5L2g5b+r6YCf56Gu6K6k5pS25YWl5Zue5rWB44CCXCIgdGl0bGU9XCLmnIDov5HmlK/ku5hcIj5cbiAgICAgICAgICA8RmVlZExpc3RcbiAgICAgICAgICAgIGVtcHR5PVwi5b2T5YmN5rKh5pyJ5bey5pSv5LuY6K6i5Y2V44CCXCJcbiAgICAgICAgICAgIGl0ZW1zPXtkYXRhPy5wYWlkT3JkZXJzIHx8IFtdfVxuICAgICAgICAgICAgcmVuZGVySXRlbT17KG9yZGVyKSA9PiAoXG4gICAgICAgICAgICAgIDxGZWVkUm93XG4gICAgICAgICAgICAgICAgYXNpZGU9e29yZGVyLnBhaWRBdExhYmVsfVxuICAgICAgICAgICAgICAgIGJhZGdlPXtzdGF0dXNMYWJlbChvcmRlci5zdGF0dXMpfVxuICAgICAgICAgICAgICAgIGJvZHk9e2Zvcm1hdEN1cnJlbmN5KG9yZGVyLmFtb3VudENlbnRzKX1cbiAgICAgICAgICAgICAgICBrZXk9e29yZGVyLmlkfVxuICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtgJHtvcmRlci51c2VyTmlja25hbWUgfHwgb3JkZXIudXNlcklkfSDCtyAke29yZGVyLnBsYW5OYW1lIHx8IG9yZGVyLnBsYW5JZCB8fCAn5pyq57uR5a6a5aWX6aSQJ31gfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtvcmRlci5vcmRlck5vfVxuICAgICAgICAgICAgICAgIHRvbmU9e3N0YXR1c1RvbmUob3JkZXIuc3RhdHVzKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG5cbiAgICAgICAgPFBhbmVsQ2FyZCBkZXNjcmlwdGlvbj1cIuacgOi/keaWsOWinuaIluWPmOabtOeahOiuoumYheeKtuaAgeOAglwiIHRpdGxlPVwi6K6i6ZiF5Yqo5oCBXCI+XG4gICAgICAgICAgPEZlZWRMaXN0XG4gICAgICAgICAgICBlbXB0eT1cIuW9k+WJjeayoeacieacgOi/keiuoumYheWPmOabtOOAglwiXG4gICAgICAgICAgICBpdGVtcz17ZGF0YT8uc3Vic2NyaXB0aW9ucyB8fCBbXX1cbiAgICAgICAgICAgIHJlbmRlckl0ZW09eyhpdGVtKSA9PiAoXG4gICAgICAgICAgICAgIDxGZWVkUm93XG4gICAgICAgICAgICAgICAgYXNpZGU9e2l0ZW0ucmVuZXdhbEF0TGFiZWx9XG4gICAgICAgICAgICAgICAgYmFkZ2U9e3N0YXR1c0xhYmVsKGl0ZW0uc3RhdHVzKX1cbiAgICAgICAgICAgICAgICBib2R5PXtpdGVtLmF1dG9SZW5ldyA/ICfoh6rliqjnu63otLnlvIDlkK8nIDogJ+iHquWKqOe7rei0ueWFs+mXrSd9XG4gICAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtpdGVtLnVzZXJOaWNrbmFtZSB8fCBpdGVtLnVzZXJJZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17aXRlbS5wbGFuTmFtZSB8fCBpdGVtLnBsYW5JZH1cbiAgICAgICAgICAgICAgICB0b25lPXtzdGF0dXNUb25lKGl0ZW0uc3RhdHVzKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYW5lbENhcmQ+XG4gICAgICA8L0JveD5cblxuICAgICAgPFBhbmVsQ2FyZFxuICAgICAgICBkZXNjcmlwdGlvbj1cIuWVhuS4muWMluS4reWPsOS8mumVv+acn+acjeWKoei/kOiQpeWSjOmUgOWUruOAguWQjue7reWPr+S7pee7p+e7reihpeWPkeelqOOAgea4oOmBk+adpea6kOOAgemAgOasvuWOn+WboOWSjOaMieWRqOacn+aUtuWFpei2i+WKv+OAglwiXG4gICAgICAgIHRpdGxlPVwi5b+r5o235YWl5Y+jXCJcbiAgICAgID5cbiAgICAgICAgPFF1aWNrQWN0aW9uR3JpZCBpdGVtcz17cXVpY2tBY3Rpb25zfSAvPlxuICAgICAgICA8Qm94IG10PVwieGxcIj5cbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPlxuICAgICAgICAgICAg5b2T5YmN5bey57uP6KGl5LiK5pS25YWl6LaL5Yq/5ZKM57ut6LS55o+Q6YaS5Y2h54mH44CC5LiL5LiA5q2l5aaC5p6c57un57ut5b6A5ZWG55So5ZOB6LSo5o6o6L+b77yM5bu66K6u5YGa5rig6YGT5b2S5Zug44CB5bqU5pS25qy+55yL5p2/44CB5Y+R56Wo5rWB6L2s5ZKM6K6i6ZiF55Sf5ZG95ZGo5pyf5YiG5p6Q44CCXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgIDwvUGFuZWxDYXJkPlxuICAgIDwvQWRtaW5QYWdlU2hlbGw+XG4gICk7XG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTGluayB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJztcblxuY29uc3QgQnJhbmRMaW5rID0gc3R5bGVkKExpbmspYFxuICBkaXNwbGF5OiBibG9jaztcbiAgcGFkZGluZzogMjBweCAyNHB4IDEycHg7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNpZGViYXJCcmFuZGluZygpIHtcbiAgcmV0dXJuIChcbiAgICA8QnJhbmRMaW5rIHRvPVwiL2FkbWluXCI+XG4gICAgICA8Qm94XG4gICAgICAgIGJvcmRlckJvdHRvbT1cIjFweCBzb2xpZFwiXG4gICAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgICAgcGI9XCJsZ1wiXG4gICAgICA+XG4gICAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGRpc3BsYXk9XCJmbGV4XCIgZ2FwPVwiZGVmYXVsdFwiIG1iPVwic21cIj5cbiAgICAgICAgICA8Qm94XG4gICAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICAgIGJnPVwicHJpbWFyeTEwMFwiXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM9XCJsZ1wiXG4gICAgICAgICAgICBjb2xvcj1cIndoaXRlXCJcbiAgICAgICAgICAgIGRpc3BsYXk9XCJpbmxpbmUtZmxleFwiXG4gICAgICAgICAgICBmb250U2l6ZT1cIjIwcHhcIlxuICAgICAgICAgICAgaGVpZ2h0PVwiMzhweFwiXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICAgICAgICB3aWR0aD1cIjM4cHhcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIPCfkLBcbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8Qm94PlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5MTAwXCIgZm9udFdlaWdodD1cIjcwMFwiPuWFlOWFlOinhuiniTwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCIgZm9udFNpemU9XCJzbVwiPui/kOiQpeWQjuWPsCB2MjwvVGV4dD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwiZ3JleTYwXCIgZm9udFNpemU9XCJzbVwiIGxpbmVIZWlnaHQ9XCJsZ1wiPlxuICAgICAgICAgIOi/kOiQpeaOp+WItuWPsFxuICAgICAgICA8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0JyYW5kTGluaz5cbiAgKTtcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhckZvb3RlcigpIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94IGNvbG9yPVwiZ3JleTYwXCIgZGF0YS1jc3M9XCJzaWRlYmFyLWZvb3RlclwiIG10PVwieGxcIiBweD1cInhsXCIgcHk9XCJsZ1wiPlxuICAgICAgPEJveFxuICAgICAgICBiZz1cImZpbHRlckJnXCJcbiAgICAgICAgYm9yZGVyPVwiMXB4IHNvbGlkXCJcbiAgICAgICAgYm9yZGVyQ29sb3I9XCJncmV5MjBcIlxuICAgICAgICBib3JkZXJSYWRpdXM9XCJ4bFwiXG4gICAgICAgIHA9XCJsZ1wiXG4gICAgICA+XG4gICAgICAgIDxUZXh0IGZvbnRXZWlnaHQ9XCI3MDBcIiBtYj1cInNtXCI+6L+Q6JCl5bqV5bqnPC9UZXh0PlxuICAgICAgICA8VGV4dCBsaW5lSGVpZ2h0PVwibGdcIj5GYXN0aWZ5IDUgwrcgUHJpc21hIMK3IFBvc3RncmVTUUw8L1RleHQ+XG4gICAgICAgIDxUZXh0IGxpbmVIZWlnaHQ9XCJsZ1wiPuWFlOWFlOaZuuiDveinhuinieWIm+aEj+iuvuiuoeW3peS9nOWPsDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJveCwgSWNvbiwgTGFiZWwsIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IExpbmssIHVzZUxvY2F0aW9uIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5cbmNvbnN0IHBhZ2VMYWJlbHMgPSB7XG4gIGNvbnRlbnRTdHVkaW86ICflhoXlrrnkuK3lj7AnLFxuICBqb2JDb21tYW5kOiAn5Lu75Yqh5oyH5oyl5Y+wJyxcbiAgcmV2ZW51ZU9wczogJ+WVhuS4muWMluS4reWPsCdcbn07XG5cbmZ1bmN0aW9uIFNpZGVMaW5rKHsgaHJlZiwgaWNvbiwgbGFiZWwsIGFjdGl2ZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPEJveFxuICAgICAgYXM9e0xpbmt9XG4gICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgIGJnPXthY3RpdmUgPyAnZmlsdGVyQmcnIDogJ3RyYW5zcGFyZW50J31cbiAgICAgIGJvcmRlclJhZGl1cz1cImxnXCJcbiAgICAgIGNvbG9yPXthY3RpdmUgPyAncHJpbWFyeTEwMCcgOiAnZ3JleTgwJ31cbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGdhcD1cImRlZmF1bHRcIlxuICAgICAgcHg9XCJsZ1wiXG4gICAgICBweT1cIm1kXCJcbiAgICAgIHN0eWxlPXt7IHRleHREZWNvcmF0aW9uOiAnbm9uZScgfX1cbiAgICAgIHRvPXtocmVmfVxuICAgID5cbiAgICAgIHtpY29uID8gPEljb24gaWNvbj17aWNvbn0gLz4gOiBudWxsfVxuICAgICAgPFRleHQgZm9udFdlaWdodD17YWN0aXZlID8gJzcwMCcgOiAnNDAwJ30+e2xhYmVsfTwvVGV4dD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhclBhZ2VzKHsgcGFnZXMgfSkge1xuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKCk7XG5cbiAgaWYgKCFwYWdlcz8ubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxCb3ggcHg9XCJ4bFwiIHB5PVwibGdcIj5cbiAgICAgIDxMYWJlbCBtYj1cIm1kXCIgcGw9XCJsZ1wiIHVwcGVyY2FzZT7ov5DokKXlt6XkvZzlj7A8L0xhYmVsPlxuICAgICAgPEJveCBhcz1cIm5hdlwiIGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInNtXCI+XG4gICAgICAgIHtwYWdlcy5tYXAoKHBhZ2UpID0+IChcbiAgICAgICAgICA8U2lkZUxpbmtcbiAgICAgICAgICAgIGFjdGl2ZT17bG9jYXRpb24ucGF0aG5hbWUuaW5jbHVkZXMoYC9wYWdlcy8ke3BhZ2UubmFtZX1gKX1cbiAgICAgICAgICAgIGhyZWY9e2AvYWRtaW4vcGFnZXMvJHtwYWdlLm5hbWV9YH1cbiAgICAgICAgICAgIGljb249e3BhZ2UuaWNvbn1cbiAgICAgICAgICAgIGtleT17cGFnZS5uYW1lfVxuICAgICAgICAgICAgbGFiZWw9e3BhZ2VMYWJlbHNbcGFnZS5uYW1lXSB8fCBwYWdlLm5hbWV9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSl9XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKTtcbn1cbiIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCb3gsIEljb24sIExhYmVsLCBUZXh0IH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBMaW5rLCB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuXG5jb25zdCByZXNvdXJjZUxhYmVscyA9IHtcbiAgVXNlcjogJ+WIm+S9nOiAheeUqOaItycsXG4gIEFkbWluVXNlcjogJ+WQjuWPsOi0puWPtycsXG4gIFRlbXBsYXRlQ2F0ZWdvcnk6ICfmqKHmnb/liIbnsbsnLFxuICBUZW1wbGF0ZTogJ+aooeadvycsXG4gIENvbnRlbnRSZXZpZXc6ICflrqHmoLjorrDlvZUnLFxuICBBc3NldDogJ+e0oOadkOi1hOS6pycsXG4gIENvbW11bml0eVBvc3Q6ICfnpL7ljLrlhoXlrrknLFxuICBHZW5lcmF0aW9uSm9iOiAn55Sf5oiQ5Lu75YqhJyxcbiAgU3Vic2NyaXB0aW9uUGxhbjogJ+iuoumYheWll+mkkCcsXG4gIFN1YnNjcmlwdGlvbjogJ+iuoumYheWFs+ezuycsXG4gIFBheW1lbnRPcmRlcjogJ+aUr+S7mOiuouWNlScsXG4gIFN5c3RlbVNldHRpbmc6ICfns7vnu5/phY3nva4nLFxuICBBdWRpdExvZzogJ+WuoeiuoeaXpeW/lydcbn07XG5cbmNvbnN0IGdyb3VwTGFiZWxzID0ge1xuICDnlKjmiLfkuI7kvJrlkZg6ICfnlKjmiLfkuI7kvJrlkZgnLFxuICDns7vnu5/kuI7mnYPpmZA6ICfns7vnu5/kuI7mnYPpmZAnLFxuICDlhoXlrrnov5DokKU6ICflhoXlrrnov5DokKUnLFxuICDnlJ/kuqfov5DokKU6ICfnlJ/kuqfov5DokKUnLFxuICDllYbkuJrljJY6ICfllYbkuJrljJYnXG59O1xuXG5mdW5jdGlvbiBSZXNvdXJjZUxpbmsoeyBocmVmLCBsYWJlbCwgYWN0aXZlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBhcz17TGlua31cbiAgICAgIGJnPXthY3RpdmUgPyAnZmlsdGVyQmcnIDogJ3RyYW5zcGFyZW50J31cbiAgICAgIGJvcmRlclJhZGl1cz1cImxnXCJcbiAgICAgIGNvbG9yPXthY3RpdmUgPyAncHJpbWFyeTEwMCcgOiAnZ3JleTgwJ31cbiAgICAgIGRpc3BsYXk9XCJibG9ja1wiXG4gICAgICBweD1cImxnXCJcbiAgICAgIHB5PVwic21cIlxuICAgICAgc3R5bGU9e3sgdGV4dERlY29yYXRpb246ICdub25lJyB9fVxuICAgICAgdG89e2hyZWZ9XG4gICAgPlxuICAgICAgPFRleHQgZm9udFdlaWdodD17YWN0aXZlID8gJzcwMCcgOiAnNDAwJ30+e2xhYmVsfTwvVGV4dD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhclJlc291cmNlU2VjdGlvbih7IHJlc291cmNlcyB9KSB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcbiAgY29uc3QgdmlzaWJsZVJlc291cmNlcyA9IChyZXNvdXJjZXMgfHwgW10pLmZpbHRlcihyZXNvdXJjZSA9PiByZXNvdXJjZS5ocmVmICYmIHJlc291cmNlLm5hdmlnYXRpb24/LnNob3cgIT09IGZhbHNlKTtcblxuICBjb25zdCBncm91cGVkID0gdmlzaWJsZVJlc291cmNlcy5yZWR1Y2UoKG1lbW8sIHJlc291cmNlKSA9PiB7XG4gICAgY29uc3QgZ3JvdXBOYW1lID0gcmVzb3VyY2UubmF2aWdhdGlvbj8ubmFtZSB8fCAn5YW25LuWJztcbiAgICBpZiAoIW1lbW9bZ3JvdXBOYW1lXSkge1xuICAgICAgbWVtb1tncm91cE5hbWVdID0ge1xuICAgICAgICBpY29uOiByZXNvdXJjZS5uYXZpZ2F0aW9uPy5pY29uLFxuICAgICAgICByZXNvdXJjZXM6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgICBtZW1vW2dyb3VwTmFtZV0ucmVzb3VyY2VzLnB1c2gocmVzb3VyY2UpO1xuICAgIHJldHVybiBtZW1vO1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHB4PVwieGxcIiBweT1cImxnXCI+XG4gICAgICA8TGFiZWwgbWI9XCJtZFwiIHBsPVwibGdcIiB1cHBlcmNhc2U+6LWE5rqQ5a+86IiqPC9MYWJlbD5cbiAgICAgIDxCb3ggYXM9XCJuYXZcIiBkaXNwbGF5PVwiZmxleFwiIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9XCJsZ1wiPlxuICAgICAgICB7T2JqZWN0LmVudHJpZXMoZ3JvdXBlZCkubWFwKChbZ3JvdXBOYW1lLCBncm91cF0pID0+IChcbiAgICAgICAgICA8Qm94IGtleT17Z3JvdXBOYW1lfT5cbiAgICAgICAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGNvbG9yPVwiZ3JleTYwXCIgZGlzcGxheT1cImZsZXhcIiBnYXA9XCJkZWZhdWx0XCIgbWI9XCJzbVwiIHB4PVwibGdcIj5cbiAgICAgICAgICAgICAge2dyb3VwLmljb24gPyA8SWNvbiBpY29uPXtncm91cC5pY29ufSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDxUZXh0IGZvbnRXZWlnaHQ9XCI3MDBcIj57Z3JvdXBMYWJlbHNbZ3JvdXBOYW1lXSB8fCBncm91cE5hbWV9PC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInNtXCI+XG4gICAgICAgICAgICAgIHtncm91cC5yZXNvdXJjZXMubWFwKChyZXNvdXJjZSkgPT4gKFxuICAgICAgICAgICAgICAgIDxSZXNvdXJjZUxpbmtcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZT17bG9jYXRpb24ucGF0aG5hbWUuc3RhcnRzV2l0aChyZXNvdXJjZS5ocmVmKX1cbiAgICAgICAgICAgICAgICAgIGhyZWY9e3Jlc291cmNlLmhyZWZ9XG4gICAgICAgICAgICAgICAgICBrZXk9e3Jlc291cmNlLmlkfVxuICAgICAgICAgICAgICAgICAgbGFiZWw9e3Jlc291cmNlTGFiZWxzW3Jlc291cmNlLmlkXSB8fCByZXNvdXJjZUxhYmVsc1tyZXNvdXJjZS5uYW1lXSB8fCByZXNvdXJjZS5uYW1lfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gICk7XG59XG4iLCJleHBvcnQgY29uc3QgcHJpbWFyeU5hdkl0ZW1zID0gW1xuICB7XG4gICAgaWQ6ICdkYXNoYm9hcmQnLFxuICAgIGxhYmVsOiAn6am+6am26IixJyxcbiAgICBpY29uOiAnSG9tZScsXG4gICAgaHJlZjogJy9hZG1pbidcbiAgfSxcbiAge1xuICAgIGlkOiAndXNlcnMnLFxuICAgIGxhYmVsOiAn55So5oi3JyxcbiAgICBpY29uOiAnVXNlcnMnLFxuICAgIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL1VzZXInXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NvbnRlbnQnLFxuICAgIGxhYmVsOiAn5YaF5a65JyxcbiAgICBpY29uOiAnTGF5b3V0JyxcbiAgICBocmVmOiAnL2FkbWluL3BhZ2VzL2NvbnRlbnRTdHVkaW8nXG4gIH0sXG4gIHtcbiAgICBpZDogJ2pvYnMnLFxuICAgIGxhYmVsOiAn5Lu75YqhJyxcbiAgICBpY29uOiAnQWN0aXZpdHknLFxuICAgIGhyZWY6ICcvYWRtaW4vcGFnZXMvam9iQ29tbWFuZCdcbiAgfSxcbiAge1xuICAgIGlkOiAncmV2ZW51ZScsXG4gICAgbGFiZWw6ICfllYbkuJrljJYnLFxuICAgIGljb246ICdDcmVkaXRDYXJkJyxcbiAgICBocmVmOiAnL2FkbWluL3BhZ2VzL3JldmVudWVPcHMnXG4gIH0sXG4gIHtcbiAgICBpZDogJ3N5c3RlbScsXG4gICAgbGFiZWw6ICfns7vnu58nLFxuICAgIGljb246ICdTZXR0aW5ncycsXG4gICAgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU3lzdGVtU2V0dGluZydcbiAgfVxuXTtcblxuZXhwb3J0IGNvbnN0IHNpZGViYXJTZWN0aW9ucyA9IHtcbiAgZGFzaGJvYXJkOiBbXG4gICAge1xuICAgICAgbGFiZWw6ICfmgLvop4gnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsYWJlbDogJ+i/kOiQpempvumptuiIsScsIGhyZWY6ICcvYWRtaW4nLCBpY29uOiAnSG9tZScgfVxuICAgICAgXVxuICAgIH1cbiAgXSxcbiAgdXNlcnM6IFtcbiAgICB7XG4gICAgICBsYWJlbDogJ+eUqOaIt+S4juS8muWRmCcsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxhYmVsOiAn5Yib5L2c6ICF55So5oi3JywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvVXNlcicsIGljb246ICdVc2VycycgfVxuICAgICAgXVxuICAgIH1cbiAgXSxcbiAgY29udGVudDogW1xuICAgIHtcbiAgICAgIGxhYmVsOiAn5bel5L2c5Y+wJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGFiZWw6ICflhoXlrrnkuK3lj7AnLCBocmVmOiAnL2FkbWluL3BhZ2VzL2NvbnRlbnRTdHVkaW8nLCBpY29uOiAnTGF5b3V0JyB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ+aooeadv+S9k+ezuycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxhYmVsOiAn5qih5p2/5YiG57G7JywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvVGVtcGxhdGVDYXRlZ29yeScsIGljb246ICdGb2xkZXInIH0sXG4gICAgICAgIHsgbGFiZWw6ICfmqKHmnb/lupMnLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9UZW1wbGF0ZScsIGljb246ICdGaWxlVGV4dCcgfVxuICAgICAgXVxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICflrqHmoLjkuI7ntKDmnZAnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsYWJlbDogJ+WuoeaguOiusOW9lScsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL0NvbnRlbnRSZXZpZXcnLCBpY29uOiAnU2hpZWxkJyB9LFxuICAgICAgICB7IGxhYmVsOiAn57Sg5p2Q6LWE5LqnJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQXNzZXQnLCBpY29uOiAnSW1hZ2UnIH0sXG4gICAgICAgIHsgbGFiZWw6ICfnpL7ljLrlhoXlrrknLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9Db21tdW5pdHlQb3N0JywgaWNvbjogJ01lc3NhZ2VTcXVhcmUnIH1cbiAgICAgIF1cbiAgICB9XG4gIF0sXG4gIGpvYnM6IFtcbiAgICB7XG4gICAgICBsYWJlbDogJ+W3peS9nOWPsCcsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxhYmVsOiAn5Lu75Yqh5oyH5oyl5Y+wJywgaHJlZjogJy9hZG1pbi9wYWdlcy9qb2JDb21tYW5kJywgaWNvbjogJ0FjdGl2aXR5JyB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ+S7u+WKoeS4reW/gycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxhYmVsOiAn55Sf5oiQ5Lu75YqhJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvR2VuZXJhdGlvbkpvYicsIGljb246ICdQbGF5Q2lyY2xlJyB9XG4gICAgICBdXG4gICAgfVxuICBdLFxuICByZXZlbnVlOiBbXG4gICAge1xuICAgICAgbGFiZWw6ICflt6XkvZzlj7AnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsYWJlbDogJ+WVhuS4muWMluS4reWPsCcsIGhyZWY6ICcvYWRtaW4vcGFnZXMvcmV2ZW51ZU9wcycsIGljb246ICdDcmVkaXRDYXJkJyB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ+Wll+mkkOS4juiuouWNlScsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxhYmVsOiAn6K6i6ZiF5aWX6aSQJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvU3Vic2NyaXB0aW9uUGxhbicsIGljb246ICdMYXllcnMnIH0sXG4gICAgICAgIHsgbGFiZWw6ICforqLpmIXlhbPns7snLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TdWJzY3JpcHRpb24nLCBpY29uOiAnUmVwZWF0JyB9LFxuICAgICAgICB7IGxhYmVsOiAn5pSv5LuY6K6i5Y2VJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvUGF5bWVudE9yZGVyJywgaWNvbjogJ1Nob3BwaW5nQ2FydCcgfVxuICAgICAgXVxuICAgIH1cbiAgXSxcbiAgc3lzdGVtOiBbXG4gICAge1xuICAgICAgbGFiZWw6ICflkI7lj7DmjqfliLYnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsYWJlbDogJ+WQjuWPsOi0puWPtycsIGhyZWY6ICcvYWRtaW4vcmVzb3VyY2VzL0FkbWluVXNlcicsIGljb246ICdVc2VyQ2hlY2snIH0sXG4gICAgICAgIHsgbGFiZWw6ICfns7vnu5/phY3nva4nLCBocmVmOiAnL2FkbWluL3Jlc291cmNlcy9TeXN0ZW1TZXR0aW5nJywgaWNvbjogJ1NldHRpbmdzJyB9LFxuICAgICAgICB7IGxhYmVsOiAn5a6h6K6h5pel5b+XJywgaHJlZjogJy9hZG1pbi9yZXNvdXJjZXMvQXVkaXRMb2cnLCBpY29uOiAnRmlsZVRleHQnIH1cbiAgICAgIF1cbiAgICB9XG4gIF1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmVQcmltYXJ5SWQocGF0aG5hbWUpIHtcbiAgaWYgKHBhdGhuYW1lID09PSAnL2FkbWluJyB8fCBwYXRobmFtZSA9PT0gJy9hZG1pbi8nIHx8IHBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hZG1pbi9kYXNoYm9hcmQnKSkge1xuICAgIHJldHVybiAnZGFzaGJvYXJkJztcbiAgfVxuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3BhZ2VzL2NvbnRlbnRTdHVkaW8nKSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKCcvYWRtaW4vcmVzb3VyY2VzL1RlbXBsYXRlJykgfHwgcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9UZW1wbGF0ZUNhdGVnb3J5JykgfHwgcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9Db250ZW50UmV2aWV3JykgfHwgcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9Bc3NldCcpIHx8IHBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hZG1pbi9yZXNvdXJjZXMvQ29tbXVuaXR5UG9zdCcpKSB7XG4gICAgcmV0dXJuICdjb250ZW50JztcbiAgfVxuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3BhZ2VzL2pvYkNvbW1hbmQnKSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKCcvYWRtaW4vcmVzb3VyY2VzL0dlbmVyYXRpb25Kb2InKSkge1xuICAgIHJldHVybiAnam9icyc7XG4gIH1cbiAgaWYgKHBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hZG1pbi9wYWdlcy9yZXZlbnVlT3BzJykgfHwgcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9TdWJzY3JpcHRpb25QbGFuJykgfHwgcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9TdWJzY3JpcHRpb24nKSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKCcvYWRtaW4vcmVzb3VyY2VzL1BheW1lbnRPcmRlcicpKSB7XG4gICAgcmV0dXJuICdyZXZlbnVlJztcbiAgfVxuICBpZiAocGF0aG5hbWUuc3RhcnRzV2l0aCgnL2FkbWluL3Jlc291cmNlcy9BZG1pblVzZXInKSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKCcvYWRtaW4vcmVzb3VyY2VzL1N5c3RlbVNldHRpbmcnKSB8fCBwYXRobmFtZS5zdGFydHNXaXRoKCcvYWRtaW4vcmVzb3VyY2VzL0F1ZGl0TG9nJykpIHtcbiAgICByZXR1cm4gJ3N5c3RlbSc7XG4gIH1cbiAgaWYgKHBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hZG1pbi9yZXNvdXJjZXMvVXNlcicpKSB7XG4gICAgcmV0dXJuICd1c2Vycyc7XG4gIH1cbiAgcmV0dXJuICdkYXNoYm9hcmQnO1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJveCB9IGZyb20gJ0BhZG1pbmpzL2Rlc2lnbi1zeXN0ZW0nO1xuaW1wb3J0IHsgc3R5bGVkIH0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbS9zdHlsZWQtY29tcG9uZW50cyc7XG5pbXBvcnQgeyB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IFNpZGViYXJCcmFuZGluZyBmcm9tICcuL3NpZGViYXItYnJhbmRpbmcuanN4JztcbmltcG9ydCBTaWRlYmFyRm9vdGVyIGZyb20gJy4vc2lkZWJhci1mb290ZXIuanN4JztcbmltcG9ydCB7IGdldEFjdGl2ZVByaW1hcnlJZCwgc2lkZWJhclNlY3Rpb25zIH0gZnJvbSAnLi9uYXYtY29uZmlnLmpzJztcblxuY29uc3QgU3R5bGVkU2lkZWJhciA9IHN0eWxlZChCb3gpYFxuICB0b3A6IDA7XG4gIGJvdHRvbTogMDtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgd2lkdGg6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUuc2l6ZXMuc2lkZWJhcldpZHRofTtcbiAgYm9yZGVyLXJpZ2h0OiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmJvcmRlcnMuZGVmYXVsdH07XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGZsZXgtc2hyaW5rOiAwO1xuICBiYWNrZ3JvdW5kOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLmNvbG9ycy5zaWRlYmFyfTtcbiAgdHJhbnNpdGlvbjogbGVmdCAwLjI1cyBlYXNlLWluLW91dDtcblxuICAmLmhpZGRlbiB7XG4gICAgbGVmdDogLSR7KHsgdGhlbWUgfSkgPT4gdGhlbWUuc2l6ZXMuc2lkZWJhcldpZHRofTtcbiAgfVxuXG4gICYudmlzaWJsZSB7XG4gICAgbGVmdDogMDtcbiAgfVxuYDtcblxuU3R5bGVkU2lkZWJhci5kZWZhdWx0UHJvcHMgPSB7XG4gIHBvc2l0aW9uOiBbJ2Fic29sdXRlJywgJ2Fic29sdXRlJywgJ2Fic29sdXRlJywgJ2Fic29sdXRlJywgJ2luaXRpYWwnXSxcbiAgekluZGV4OiA1MFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2lkZWJhcih7IGlzVmlzaWJsZSB9KSB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcbiAgY29uc3QgYWN0aXZlUHJpbWFyeUlkID0gZ2V0QWN0aXZlUHJpbWFyeUlkKGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgY29uc3Qgc2VjdGlvbnMgPSBzaWRlYmFyU2VjdGlvbnNbYWN0aXZlUHJpbWFyeUlkXSB8fCBbXTtcblxuICByZXR1cm4gKFxuICAgIDxTdHlsZWRTaWRlYmFyIGNsYXNzTmFtZT17aXNWaXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbid9IGRhdGEtY3NzPVwic2lkZWJhclwiPlxuICAgICAgPFNpZGViYXJCcmFuZGluZyAvPlxuICAgICAgPEJveCBmbGV4R3Jvdz17MX0+XG4gICAgICAgIHtzZWN0aW9ucy5tYXAoKHNlY3Rpb24pID0+IChcbiAgICAgICAgICA8Qm94IGtleT17c2VjdGlvbi5sYWJlbH0+XG4gICAgICAgICAgICA8U2VjdGlvblRpdGxlPntzZWN0aW9uLmxhYmVsfTwvU2VjdGlvblRpdGxlPlxuICAgICAgICAgICAgPFNlY3Rpb25MaXN0IGl0ZW1zPXtzZWN0aW9uLml0ZW1zfSBwYXRobmFtZT17bG9jYXRpb24ucGF0aG5hbWV9IC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG4gICAgICA8U2lkZWJhckZvb3RlciAvPlxuICAgIDwvU3R5bGVkU2lkZWJhcj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gU2VjdGlvblRpdGxlKHsgY2hpbGRyZW4gfSkge1xuICByZXR1cm4gKFxuICAgIDxCb3ggY29sb3I9XCJncmV5NjBcIiBmb250V2VpZ2h0PVwiNzAwXCIgcHg9XCJ4bFwiIHB0PVwieGxcIiBwYj1cInNtXCI+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Cb3g+XG4gICk7XG59XG5cbmZ1bmN0aW9uIFNlY3Rpb25MaXN0KHsgaXRlbXMsIHBhdGhuYW1lIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cInNtXCIgcHg9XCJsZ1wiPlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBwYXRobmFtZS5zdGFydHNXaXRoKGl0ZW0uaHJlZikgfHwgcGF0aG5hbWUgPT09IGl0ZW0uaHJlZjtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8Qm94XG4gICAgICAgICAgICBhcz1cImFcIlxuICAgICAgICAgICAgYmc9e2FjdGl2ZSA/ICdmaWx0ZXJCZycgOiAndHJhbnNwYXJlbnQnfVxuICAgICAgICAgICAgYm9yZGVyUmFkaXVzPVwibGdcIlxuICAgICAgICAgICAgY29sb3I9e2FjdGl2ZSA/ICdwcmltYXJ5MTAwJyA6ICdncmV5ODAnfVxuICAgICAgICAgICAgaHJlZj17aXRlbS5ocmVmfVxuICAgICAgICAgICAga2V5PXtpdGVtLmhyZWZ9XG4gICAgICAgICAgICBweD1cImxnXCJcbiAgICAgICAgICAgIHB5PVwic21cIlxuICAgICAgICAgICAgc3R5bGU9e3sgdGV4dERlY29yYXRpb246ICdub25lJywgZGlzcGxheTogJ2Jsb2NrJyB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwieHNcIj5cbiAgICAgICAgICAgICAgPEJveCBmb250V2VpZ2h0PXthY3RpdmUgPyAnNzAwJyA6ICc1MDAnfT57aXRlbS5sYWJlbH08L0JveD5cbiAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApO1xuICAgICAgfSl9XG4gICAgPC9Cb3g+XG4gICk7XG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQm94LCBCdXR0b24sIEljb24sIFRleHQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtJztcbmltcG9ydCB7IExpbmssIHVzZUxvY2F0aW9uIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyB1c2VTZWxlY3RvciB9IGZyb20gJ3JlYWN0LXJlZHV4JztcbmltcG9ydCB7IHByaW1hcnlOYXZJdGVtcywgZ2V0QWN0aXZlUHJpbWFyeUlkIH0gZnJvbSAnLi9uYXYtY29uZmlnLmpzJztcblxuZnVuY3Rpb24gUHJpbWFyeU5hdkxpbmsoeyBocmVmLCBpY29uLCBsYWJlbCwgYWN0aXZlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBhcz17TGlua31cbiAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgYmc9e2FjdGl2ZSA/ICdwcmltYXJ5MTAwJyA6ICd0cmFuc3BhcmVudCd9XG4gICAgICBib3JkZXI9XCIxcHggc29saWRcIlxuICAgICAgYm9yZGVyQ29sb3I9e2FjdGl2ZSA/ICdwcmltYXJ5MTAwJyA6ICdncmV5MjAnfVxuICAgICAgYm9yZGVyUmFkaXVzPVwicGlsbFwiXG4gICAgICBjb2xvcj17YWN0aXZlID8gJ3doaXRlJyA6ICdncmV5ODAnfVxuICAgICAgZGlzcGxheT1cImlubGluZS1mbGV4XCJcbiAgICAgIGdhcD1cInNtXCJcbiAgICAgIHB4PVwibGdcIlxuICAgICAgcHk9XCJzbVwiXG4gICAgICBzdHlsZT17eyB0ZXh0RGVjb3JhdGlvbjogJ25vbmUnLCB3aGl0ZVNwYWNlOiAnbm93cmFwJyB9fVxuICAgICAgdG89e2hyZWZ9XG4gICAgPlxuICAgICAgPEljb24gaWNvbj17aWNvbn0gc2l6ZT17MTR9IC8+XG4gICAgICA8VGV4dCBmb250V2VpZ2h0PVwiNzAwXCI+e2xhYmVsfTwvVGV4dD5cbiAgICA8L0JveD5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVG9wQmFyKHsgdG9nZ2xlU2lkZWJhciB9KSB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IHVzZVNlbGVjdG9yKChzdGF0ZSkgPT4gc3RhdGUuc2Vzc2lvbik7XG4gIGNvbnN0IHBhdGhzID0gdXNlU2VsZWN0b3IoKHN0YXRlKSA9PiBzdGF0ZS5wYXRocyk7XG4gIGNvbnN0IGFjdGl2ZVByaW1hcnlJZCA9IGdldEFjdGl2ZVByaW1hcnlJZChsb2NhdGlvbi5wYXRobmFtZSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94XG4gICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgIGJnPVwid2hpdGVcIlxuICAgICAgYm9yZGVyQm90dG9tPVwiMXB4IHNvbGlkXCJcbiAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgIGdhcD1cInhsXCJcbiAgICAgIGhlaWdodD1cIjY0cHhcIlxuICAgICAgcHg9XCJ4bFwiXG4gICAgPlxuICAgICAgPEJveFxuICAgICAgICBkaXNwbGF5PXtbJ2lubGluZS1mbGV4JywgJ2lubGluZS1mbGV4JywgJ25vbmUnXX1cbiAgICAgICAgb25DbGljaz17dG9nZ2xlU2lkZWJhcn1cbiAgICAgICAgc3R5bGU9e3sgY3Vyc29yOiAncG9pbnRlcicgfX1cbiAgICAgID5cbiAgICAgICAgPEljb24gaWNvbj1cIk1lbnVcIiBzaXplPXsyNH0gLz5cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94IGFsaWduSXRlbXM9XCJjZW50ZXJcIiBkaXNwbGF5PVwiZmxleFwiIGZsZXg9XCIxXCIgZ2FwPVwibGdcIiBvdmVyZmxvd1g9XCJhdXRvXCI+XG4gICAgICAgIHtwcmltYXJ5TmF2SXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgPFByaW1hcnlOYXZMaW5rXG4gICAgICAgICAgICBhY3RpdmU9e2l0ZW0uaWQgPT09IGFjdGl2ZVByaW1hcnlJZH1cbiAgICAgICAgICAgIGhyZWY9e2l0ZW0uaHJlZn1cbiAgICAgICAgICAgIGljb249e2l0ZW0uaWNvbn1cbiAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgIGxhYmVsPXtpdGVtLmxhYmVsfVxuICAgICAgICAgIC8+XG4gICAgICAgICkpfVxuICAgICAgPC9Cb3g+XG5cbiAgICAgIDxCb3ggYWxpZ25JdGVtcz1cImNlbnRlclwiIGRpc3BsYXk9XCJmbGV4XCIgZ2FwPVwibGdcIj5cbiAgICAgICAge3Nlc3Npb24/LmVtYWlsID8gPFRleHQgY29sb3I9XCJncmV5NjBcIj57c2Vzc2lvbi5lbWFpbH08L1RleHQ+IDogbnVsbH1cbiAgICAgICAge3BhdGhzPy5sb2dvdXRQYXRoID8gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGFzPVwiYVwiXG4gICAgICAgICAgICBocmVmPXtwYXRocy5sb2dvdXRQYXRofVxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAg6YCA5Ye655m75b2VXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gICk7XG59XG4iLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlU2VsZWN0b3IgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQm94LFxuICBCdXR0b24sXG4gIEZvcm1Hcm91cCxcbiAgSDIsXG4gIEg1LFxuICBJbnB1dCxcbiAgTGFiZWwsXG4gIE1lc3NhZ2VCb3gsXG4gIFRleHRcbn0gZnJvbSAnQGFkbWluanMvZGVzaWduLXN5c3RlbSc7XG5pbXBvcnQgeyBzdHlsZWQgfSBmcm9tICdAYWRtaW5qcy9kZXNpZ24tc3lzdGVtL3N0eWxlZC1jb21wb25lbnRzJztcblxuY29uc3QgV3JhcHBlciA9IHN0eWxlZChCb3gpYFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbWluLWhlaWdodDogMTAwJTtcbiAgYmFja2dyb3VuZDpcbiAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IHRvcCByaWdodCwgcmdiYSgxMDgsIDkyLCAyMzEsIDAuMTYpLCB0cmFuc3BhcmVudCAzMCUpLFxuICAgIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgdG9wIGxlZnQsIHJnYmEoMjU1LCAxMDcsIDUzLCAwLjE4KSwgdHJhbnNwYXJlbnQgMjQlKSxcbiAgICAjZjhmOWZhO1xuYDtcblxuY29uc3QgUHJvbW9QYW5lbCA9IHN0eWxlZChCb3gpYFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxNjBkZWcsICNmZjZiMzUgMCUsICNmZjkxNTYgNDglLCAjNmM1Y2U3IDEwMCUpO1xuYDtcblxuY29uc3QgTG9naW5DYXJkID0gc3R5bGVkKEJveClgXG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGJvcmRlci1yYWRpdXM6IDI4cHg7XG5gO1xuXG5jb25zdCBSYWJiaXRNYXJrID0gc3R5bGVkKEJveClgXG4gIHdpZHRoOiA3MnB4O1xuICBoZWlnaHQ6IDcycHg7XG4gIGJvcmRlci1yYWRpdXM6IDI0cHg7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xOCk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBmb250LXNpemU6IDM0cHg7XG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cig4cHgpO1xuYDtcblxuY29uc3QgRmVhdHVyZUNoaXAgPSAoeyBpY29uLCB0ZXh0IH0pID0+IChcbiAgPEJveFxuICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgIGJnPVwicmdiYSgyNTUsMjU1LDI1NSwwLjE2KVwiXG4gICAgYm9yZGVyUmFkaXVzPVwicGlsbFwiXG4gICAgY29sb3I9XCJ3aGl0ZVwiXG4gICAgZGlzcGxheT1cImlubGluZS1mbGV4XCJcbiAgICBnYXA9XCJzbVwiXG4gICAgcHg9XCJsZ1wiXG4gICAgcHk9XCJzbVwiXG4gID5cbiAgICA8VGV4dD57aWNvbn08L1RleHQ+XG4gICAgPFRleHQ+e3RleHR9PC9UZXh0PlxuICA8L0JveD5cbik7XG5cbmV4cG9ydCBjb25zdCBMb2dpbiA9ICgpID0+IHtcbiAgY29uc3QgeyBhY3Rpb24sIGVycm9yTWVzc2FnZSB9ID0gd2luZG93Ll9fQVBQX1NUQVRFX187XG4gIGNvbnN0IGJyYW5kaW5nID0gdXNlU2VsZWN0b3IoKHN0YXRlKSA9PiBzdGF0ZS5icmFuZGluZyk7XG5cbiAgcmV0dXJuIChcbiAgICA8V3JhcHBlciBkaXNwbGF5PVwiZmxleFwiIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBwPXtbJ2xnJywgJ3h4bCddfT5cbiAgICAgIDxMb2dpbkNhcmRcbiAgICAgICAgYmc9XCJ3aGl0ZVwiXG4gICAgICAgIGJveFNoYWRvdz1cImxvZ2luXCJcbiAgICAgICAgZGlzcGxheT1cImZsZXhcIlxuICAgICAgICBmbGV4RGlyZWN0aW9uPXtbJ2NvbHVtbicsICdjb2x1bW4nLCAncm93J119XG4gICAgICAgIG1heFdpZHRoPVwiMTEyMHB4XCJcbiAgICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgID5cbiAgICAgICAgPFByb21vUGFuZWwgY29sb3I9XCJ3aGl0ZVwiIGRpc3BsYXk9e1snYmxvY2snXX0gcD1cInh4bFwiIHdpZHRoPXtbJzEwMCUnLCAnMTAwJScsICc0NiUnXX0+XG4gICAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9XCJ4bFwiIGhlaWdodD1cIjEwMCVcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwieGxcIj5cbiAgICAgICAgICAgICAgPFJhYmJpdE1hcms+8J+QsDwvUmFiYml0TWFyaz5cbiAgICAgICAgICAgICAgPEJveD5cbiAgICAgICAgICAgICAgICA8VGV4dCBmb250V2VpZ2h0PVwiNzAwXCIgbGV0dGVyU3BhY2luZz1cIjAuMDhlbVwiIG1iPVwibGdcIiB0ZXh0VHJhbnNmb3JtPVwidXBwZXJjYXNlXCI+5YWU5YWU6KeG6KeJ6L+Q6JCl5ZCO5Y+wIHYyPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxIMiBjb2xvcj1cIndoaXRlXCIgbWFyZ2luQm90dG9tPVwieGxcIj7orqnmqKHmnb/ov5DokKXjgIHku7vliqHosIPluqbjgIHllYbkuJrljJbnrqHnkIbnnJ/mraPlg4/kuIDmrL7kuqflk4HvvIzogIzkuI3mmK/kuIDlvKDmlbDmja7ooajjgII8L0gyPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwicmdiYSgyNTUsMjU1LDI1NSwwLjg2KVwiIGxpbmVIZWlnaHQ9XCJ4bFwiPlxuICAgICAgICAgICAgICAgICAg6L+Z5aWX5ZCO5Y+w5Zu057uVIFByaXNtYSDkuI4gUG9zdGdyZVNRTCDlrp7ml7bmlbDmja7mnoTlu7rvvIzph43ngrnmnI3liqHmqKHmnb/lrqHmoLjjgIHnlKjmiLfphY3pop3jgIHnlJ/miJDlvILluLjjgIHorqLljZXot5/ov5vlkozns7vnu5/phY3nva7nrYnpq5jpopHov5DokKXlnLrmma/jgIJcbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICAgIDxCb3ggZGlzcGxheT1cImZsZXhcIiBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPVwibGdcIj5cbiAgICAgICAgICAgICAgPEJveCBkaXNwbGF5PVwiZmxleFwiIGZsZXhXcmFwPVwid3JhcFwiIGdhcD1cImRlZmF1bHRcIj5cbiAgICAgICAgICAgICAgICA8RmVhdHVyZUNoaXAgaWNvbj1cIuKaoVwiIHRleHQ9XCLku7vliqHmjIfmjKXlj7BcIiAvPlxuICAgICAgICAgICAgICAgIDxGZWF0dXJlQ2hpcCBpY29uPVwi8J+nvlwiIHRleHQ9XCLllYbkuJrljJblt6XkvZzlj7BcIiAvPlxuICAgICAgICAgICAgICAgIDxGZWF0dXJlQ2hpcCBpY29uPVwi8J+boe+4j1wiIHRleHQ9XCLlhoXlrrnlrqHmoLjmtYFcIiAvPlxuICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgPEJveFxuICAgICAgICAgICAgICAgIGJnPVwicmdiYSgyNTUsMjU1LDI1NSwwLjE2KVwiXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzPVwieGxcIlxuICAgICAgICAgICAgICAgIHA9XCJ4bFwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgYmc9XCJ3aGl0ZVwiIGNvbG9yPVwicHJpbWFyeTEwMFwiIG1iPVwibGdcIj7lvIDlj5Hnjq/looPpu5jorqTotKblj7c8L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwid2hpdGVcIiBtYj1cInNtXCI+566h55CG5ZGY77yaYWRtaW5AdHV0dS5sb2NhbCAvIFR1dHVBZG1pbjEyMyE8L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQgY29sb3I9XCJyZ2JhKDI1NSwyNTUsMjU1LDAuOSlcIj7ov5DokKXvvJpvcGVyYXRvckB0dXR1LmxvY2FsIC8gVHV0dU9wZXJhdG9yMTIzITwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Qcm9tb1BhbmVsPlxuXG4gICAgICAgIDxCb3hcbiAgICAgICAgICBhcz1cImZvcm1cIlxuICAgICAgICAgIGFjdGlvbj17YWN0aW9ufVxuICAgICAgICAgIGRpc3BsYXk9XCJmbGV4XCJcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICBnYXA9XCJ4bFwiXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJjZW50ZXJcIlxuICAgICAgICAgIG1ldGhvZD1cIlBPU1RcIlxuICAgICAgICAgIHA9XCJ4eGxcIlxuICAgICAgICAgIHdpZHRoPXtbJzEwMCUnLCAnMTAwJScsICc1NCUnXX1cbiAgICAgICAgPlxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cInByaW1hcnkxMDBcIiBmb250V2VpZ2h0PVwiNzAwXCIgbWI9XCJsZ1wiIHRleHRUcmFuc2Zvcm09XCJ1cHBlcmNhc2VcIj5XZWxjb21lIEJhY2s8L1RleHQ+XG4gICAgICAgICAgICA8SDUgbWFyZ2luQm90dG9tPVwiZGVmYXVsdFwiPnticmFuZGluZy5jb21wYW55TmFtZSB8fCAn5YWU5YWU6KeG6KeJ5ZCO5Y+w566h55CGJ308L0g1PlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJncmV5NjBcIj7kvb/nlKjnrqHnkIblkZjmiJbov5DokKXotKblj7fnmbvlvZXvvIzov5vlhaXkuJPnlKjlt6XkvZzlj7DjgII8L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAgICB7ZXJyb3JNZXNzYWdlID8gKFxuICAgICAgICAgICAgPE1lc3NhZ2VCb3hcbiAgICAgICAgICAgICAgbWVzc2FnZT17ZXJyb3JNZXNzYWdlfVxuICAgICAgICAgICAgICB2YXJpYW50PVwiZGFuZ2VyXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICA8Rm9ybUdyb3VwPlxuICAgICAgICAgICAgPExhYmVsIHJlcXVpcmVkPueuoeeQhuWRmOmCrueusTwvTGFiZWw+XG4gICAgICAgICAgICA8SW5wdXQgbmFtZT1cImVtYWlsXCIgcGxhY2Vob2xkZXI9XCJhZG1pbkB0dXR1LmxvY2FsXCIgLz5cbiAgICAgICAgICA8L0Zvcm1Hcm91cD5cblxuICAgICAgICAgIDxGb3JtR3JvdXA+XG4gICAgICAgICAgICA8TGFiZWwgcmVxdWlyZWQ+5a+G56CBPC9MYWJlbD5cbiAgICAgICAgICAgIDxJbnB1dCBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIui+k+WFpeWQjuWPsOWvhueggVwiIHR5cGU9XCJwYXNzd29yZFwiIC8+XG4gICAgICAgICAgPC9Gb3JtR3JvdXA+XG5cbiAgICAgICAgICA8Qm94IGRpc3BsYXk9XCJmbGV4XCIgZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD1cImxnXCI+XG4gICAgICAgICAgICA8QnV0dG9uIHNpemU9XCJsZ1wiIHZhcmlhbnQ9XCJjb250YWluZWRcIj7ov5vlhaXov5DokKXlkI7lj7A8L0J1dHRvbj5cbiAgICAgICAgICAgIDxCb3hcbiAgICAgICAgICAgICAgYmc9XCJmaWx0ZXJCZ1wiXG4gICAgICAgICAgICAgIGJvcmRlcj1cIjFweCBzb2xpZFwiXG4gICAgICAgICAgICAgIGJvcmRlckNvbG9yPVwiZ3JleTIwXCJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzPVwieGxcIlxuICAgICAgICAgICAgICBwPVwibGdcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cImdyZXk2MFwiPlxuICAgICAgICAgICAgICAgIOW9k+WJjeeJiOacrOmHjeeCueW8uuWMluS6huWTgeeJjOaEn+OAgei/kOiQpeW3peS9nOWPsOWSjOmrmOmikeWKqOS9nOWFpeWPo+OAguW6leWxguaVsOaNruS7jeeEtuadpeiHquWQjOS4gOWllyBGYXN0aWZ5ICsgUHJpc21hIOWQjuerr+OAglxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0xvZ2luQ2FyZD5cbiAgICA8L1dyYXBwZXI+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBMb2dpbjtcbiIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IE9wZXJhdGlvbnNEYXNoYm9hcmQgZnJvbSAnLi4vc3JjL2FkbWluL2Rhc2hib2FyZCdcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuT3BlcmF0aW9uc0Rhc2hib2FyZCA9IE9wZXJhdGlvbnNEYXNoYm9hcmRcbmltcG9ydCBDb250ZW50U3R1ZGlvUGFnZSBmcm9tICcuLi9zcmMvYWRtaW4vY29udGVudC1zdHVkaW8nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkNvbnRlbnRTdHVkaW9QYWdlID0gQ29udGVudFN0dWRpb1BhZ2VcbmltcG9ydCBKb2JDb21tYW5kUGFnZSBmcm9tICcuLi9zcmMvYWRtaW4vam9iLWNvbW1hbmQnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkpvYkNvbW1hbmRQYWdlID0gSm9iQ29tbWFuZFBhZ2VcbmltcG9ydCBSZXZlbnVlT3BzUGFnZSBmcm9tICcuLi9zcmMvYWRtaW4vcmV2ZW51ZS1vcHMnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlJldmVudWVPcHNQYWdlID0gUmV2ZW51ZU9wc1BhZ2VcbmltcG9ydCBTaWRlYmFyQnJhbmRpbmcgZnJvbSAnLi4vc3JjL2FkbWluL3NpZGViYXItYnJhbmRpbmcnXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXJCcmFuZGluZyA9IFNpZGViYXJCcmFuZGluZ1xuaW1wb3J0IFNpZGViYXJGb290ZXIgZnJvbSAnLi4vc3JjL2FkbWluL3NpZGViYXItZm9vdGVyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TaWRlYmFyRm9vdGVyID0gU2lkZWJhckZvb3RlclxuaW1wb3J0IFNpZGViYXJQYWdlcyBmcm9tICcuLi9zcmMvYWRtaW4vc2lkZWJhci1wYWdlcydcbkFkbWluSlMuVXNlckNvbXBvbmVudHMuU2lkZWJhclBhZ2VzID0gU2lkZWJhclBhZ2VzXG5pbXBvcnQgU2lkZWJhclJlc291cmNlU2VjdGlvbiBmcm9tICcuLi9zcmMvYWRtaW4vc2lkZWJhci1yZXNvdXJjZS1zZWN0aW9uJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5TaWRlYmFyUmVzb3VyY2VTZWN0aW9uID0gU2lkZWJhclJlc291cmNlU2VjdGlvblxuaW1wb3J0IFNpZGViYXIgZnJvbSAnLi4vc3JjL2FkbWluL3NpZGViYXInXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLlNpZGViYXIgPSBTaWRlYmFyXG5pbXBvcnQgVG9wQmFyIGZyb20gJy4uL3NyYy9hZG1pbi90b3AtYmFyJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5Ub3BCYXIgPSBUb3BCYXJcbmltcG9ydCBMb2dpbiBmcm9tICcuLi9zcmMvYWRtaW4vbG9naW4nXG5BZG1pbkpTLlVzZXJDb21wb25lbnRzLkxvZ2luID0gTG9naW4iXSwibmFtZXMiOlsiYXBpIiwiQXBpQ2xpZW50IiwidG9uZU1hcCIsInN1Y2Nlc3MiLCJ3YXJuaW5nIiwiZXJyb3IiLCJpbmZvIiwibmV1dHJhbCIsImNvbG9yTWFwIiwib3JhbmdlIiwib3JhbmdlU29mdCIsInB1cnBsZSIsInllbGxvdyIsImN5YW4iLCJtaW50IiwiZGFyayIsInVzZUFkbWluUGFnZSIsInBhZ2VOYW1lIiwibG9hZGluZyIsInNldExvYWRpbmciLCJ1c2VTdGF0ZSIsInN1Ym1pdHRpbmciLCJzZXRTdWJtaXR0aW5nIiwic2V0RXJyb3IiLCJub3RpY2UiLCJzZXROb3RpY2UiLCJkYXRhIiwic2V0RGF0YSIsImxvYWQiLCJ1c2VDYWxsYmFjayIsInJlc3BvbnNlIiwiZ2V0UGFnZSIsImdldERhc2hib2FyZCIsImVyciIsIm1lc3NhZ2UiLCJ1c2VFZmZlY3QiLCJtb3VudGVkIiwiYm9vdCIsInN1Ym1pdCIsInBheWxvYWQiLCJyZXF1ZXN0T3B0aW9ucyIsIkVycm9yIiwibWV0aG9kIiwibmV4dERhdGEiLCJ0eXBlIiwicmVsb2FkIiwiY2xlYXJOb3RpY2UiLCJBZG1pblBhZ2VTaGVsbCIsImV5ZWJyb3ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiYWN0aW9ucyIsIm9uRGlzbWlzc05vdGljZSIsImNoaWxkcmVuIiwiUmVhY3QiLCJjcmVhdGVFbGVtZW50IiwiQm94IiwiYWxpZ25JdGVtcyIsImRpc3BsYXkiLCJmbGV4RGlyZWN0aW9uIiwiZ2FwIiwicHkiLCJMb2FkZXIiLCJUZXh0IiwiY29sb3IiLCJiZyIsImJvcmRlciIsImJvcmRlckNvbG9yIiwiYm9yZGVyUmFkaXVzIiwiYm94U2hhZG93IiwicCIsIklsbHVzdHJhdGlvbiIsInZhcmlhbnQiLCJ3aWR0aCIsIkg0IiwiTWVzc2FnZUJveCIsIm9uQ2xvc2VDbGljayIsIkhlcm9QYW5lbCIsImp1c3RpZnlDb250ZW50Iiwib3ZlcmZsb3ciLCJwb3NpdGlvbiIsImhlaWdodCIsImxlZnQiLCJ0b3AiLCJzdHlsZSIsImNsaXBQYXRoIiwib3BhY2l0eSIsIm1heFdpZHRoIiwiekluZGV4IiwiZm9udFdlaWdodCIsImxldHRlclNwYWNpbmciLCJtYiIsInRleHRUcmFuc2Zvcm0iLCJIMiIsIm1hcmdpbkJvdHRvbSIsImxpbmVIZWlnaHQiLCJsZW5ndGgiLCJRdWlja0FjdGlvbkdyaWQiLCJpdGVtcyIsIm1pbldpZHRoIiwiU3RhdEdyaWQiLCJjb2x1bW5zIiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsIm1hcCIsIml0ZW0iLCJTdGF0Q2FyZCIsIl9leHRlbmRzIiwia2V5IiwibGFiZWwiLCJ2YWx1ZSIsIm5vdGUiLCJpY29uIiwiYWNjZW50IiwiYWNjZW50Q29sb3IiLCJJY29uIiwiSDMiLCJQYW5lbENhcmQiLCJtaW5IZWlnaHQiLCJGZWVkTGlzdCIsImVtcHR5IiwicmVuZGVySXRlbSIsIkVtcHR5U3RhdGUiLCJGZWVkUm93Iiwic3VidGl0bGUiLCJib2R5IiwiYmFkZ2UiLCJ0b25lIiwiYXNpZGUiLCJpbWFnZVVybCIsImJvcmRlckJvdHRvbSIsInBiIiwiSW1hZ2VUaHVtYiIsImFsdCIsInNyYyIsIkg1IiwiU3RhdHVzQmFkZ2UiLCJQcmV2aWV3UmV2aWV3Qm9hcmQiLCJzZWxlY3RlZElkcyIsIm9uVG9nZ2xlIiwib25Ub2dnbGVBbGwiLCJvblByZXZpZXciLCJ0aXRsZUxhYmVsIiwic2VsZWN0ZWRTZXQiLCJTZXQiLCJhbGxTZWxlY3RlZCIsImV2ZXJ5IiwiaGFzIiwiaWQiLCJCdXR0b24iLCJvbkNsaWNrIiwic2l6ZSIsIlByZXZpZXdDYXJkIiwic2VsZWN0ZWQiLCJjdXJzb3IiLCJzdGF0dXNMYWJlbCIsInN0YXR1cyIsImNoZWNrZWQiLCJvbkNoYW5nZSIsImV2ZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwiUHJldmlld1N1cmZhY2UiLCJwcmV2aWV3SW1hZ2VVcmwiLCJjYXRlZ29yeU5hbWUiLCJzY2VuZSIsInByb21wdEhpbnQiLCJ0YWdzIiwiam9pbiIsIm10IiwiYXMiLCJvYmplY3RGaXQiLCJCYWRnZSIsInRleHRBbGlnbiIsIkxhcmdlUHJldmlld01vZGFsIiwib25DbG9zZSIsImJvdHRvbSIsInJpZ2h0IiwibWF4SGVpZ2h0IiwicHgiLCJiYWNrZ3JvdW5kIiwicHJvbXB0IiwiUmV2aWV3Tm90ZVRlbXBsYXRlUGlja2VyIiwidGVtcGxhdGVzIiwic2VsZWN0ZWRWYWx1ZSIsIm9uU2VsZWN0IiwiZmxleFdyYXAiLCJ0ZW1wbGF0ZSIsIlRyZW5kQmFycyIsInNlcmllcyIsIm1heFZhbHVlIiwiTWF0aCIsIm1heCIsImZsYXRNYXAiLCJlbnRyeSIsIk51bWJlciIsImZsZXgiLCJSZWFzb25Hcm91cExpc3QiLCJwcm92aWRlcnMiLCJjb3VudCIsInNhbXBsZVByb21wdCIsInJlYXNvbiIsInNhbXBsZUpvYlRpdGxlIiwiU2VsZWN0YWJsZUZlZWRMaXN0IiwicmVuZGVyQ29udGVudCIsIlJlbmV3YWxDYXJkcyIsInBsYW5OYW1lIiwicGxhbklkIiwiZGF5c0xlZnQiLCJ1c2VyTmlja25hbWUiLCJ1c2VySWQiLCJhdXRvUmVuZXciLCJyZW5ld2FsQXRMYWJlbCIsImhyZWYiLCJ0ZXh0RGVjb3JhdGlvbiIsIkluc2lnaHRTdHJpcCIsIm1pbiIsIkJ1bGtBY3Rpb25CYXIiLCJzZWxlY3RlZENvdW50Iiwib25BcHByb3ZlIiwib25SZXF1ZXN0Q2hhbmdlcyIsIm9uQXJjaGl2ZSIsImFwcHJvdmVMYWJlbCIsInJlcXVlc3RDaGFuZ2VzTGFiZWwiLCJhcmNoaXZlTGFiZWwiLCJkaXNhYmxlZCIsImZvcm1hdEN1cnJlbmN5IiwiY2VudHMiLCJ0b0ZpeGVkIiwicmF0aW8iLCJyb3VuZCIsImZvcm1hdERhdGUiLCJkYXRlIiwiRGF0ZSIsImlzTmFOIiwiZ2V0VGltZSIsIlN0cmluZyIsInRvTG9jYWxlU3RyaW5nIiwiRFJBRlQiLCJJTl9SRVZJRVciLCJQVUJMSVNIRUQiLCJBUkNISVZFRCIsIlFVRVVFRCIsIlJVTk5JTkciLCJTVUNDRUVERUQiLCJGQUlMRUQiLCJDQU5DRUxFRCIsIkFDVElWRSIsIlNVU1BFTkRFRCIsIlRSSUFMSU5HIiwiUEFVU0VEIiwiRVhQSVJFRCIsIlBFTkRJTkciLCJQQUlEIiwiUkVGVU5ERUQiLCJBUFBST1ZFRCIsIlJFSkVDVEVEIiwiQ0hBTkdFU19SRVFVRVNURUQiLCJGUkVFIiwiQ1JFQVRPUiIsIkJVU0lORVNTIiwic3RhdHVzVG9uZSIsImluY2x1ZGVzIiwidXNlU2VsZWN0aW9uIiwic2V0U2VsZWN0ZWRJZHMiLCJhdmFpbGFibGVJZHMiLCJ1c2VNZW1vIiwiY3VycmVudCIsImZpbHRlciIsInRvZ2dsZSIsInRvZ2dsZUFsbCIsImNsZWFyIiwicXVpY2tBY3Rpb25zIiwiT3BlcmF0aW9uc0Rhc2hib2FyZCIsIm1ldHJpY3MiLCJ1c2VycyIsImpvYnNUb2RheSIsImNvbnZlcnNpb25SYXRlIiwic3BvdGxpZ2h0cyIsInJlY2VudEpvYnMiLCJqb2IiLCJjcmVhdGVkQXRMYWJlbCIsInRlbXBsYXRlVGl0bGUiLCJyZXZpZXdRdWV1ZSIsInVwZGF0ZWRBdExhYmVsIiwic3VtbWFyeSIsImVudGl0eVR5cGUiLCJlbnRpdHlJZCIsImVudGl0eVR5cGVMYWJlbCIsImF1ZGl0TG9ncyIsImxvZyIsImVudGl0eUxhYmVsIiwiYWN0b3JOaWNrbmFtZSIsImFjdGlvbkxhYmVsIiwicmV2aWV3Tm90ZVRlbXBsYXRlcyIsIkNvbnRlbnRTdHVkaW9QYWdlIiwidGVtcGxhdGVTZWxlY3Rpb24iLCJ0ZW1wbGF0ZVJldmlld1F1ZXVlIiwicHJldmlld0l0ZW0iLCJzZXRQcmV2aWV3SXRlbSIsInNlbGVjdGVkUmV2aWV3Tm90ZSIsInNldFNlbGVjdGVkUmV2aWV3Tm90ZSIsInJ1bkJ1bGtSZXZpZXciLCJhY3Rpb24iLCJpZHMiLCJzdGF0cyIsInBlbmRpbmdSZXZpZXdzIiwiZHJhZnRUZW1wbGF0ZXMiLCJpblJldmlld1RlbXBsYXRlcyIsInByZW1pdW1SYXRpbyIsInF1ZXVlIiwiY2F0ZWdvcnlCcmVha2Rvd24iLCJwcmVtaXVtQ291bnQiLCJsYXRlc3RUZW1wbGF0ZXMiLCJhc3NldHMiLCJhc3NldCIsInJldmlld1N0YXR1cyIsInBvc3RzIiwicG9zdCIsInVwZGF0ZWRBdCIsIkpvYkNvbW1hbmRQYWdlIiwiZmFpbGVkU2VsZWN0aW9uIiwiZmFpbGVkSm9icyIsImFjdGl2ZVNlbGVjdGlvbiIsImFjdGl2ZUpvYnMiLCJyZXRyeVNlbGVjdGVkSm9icyIsImNhbmNlbFNlbGVjdGVkSm9icyIsInF1ZXVlZCIsInJ1bm5pbmciLCJmYWlsZWQiLCJzdWNjZXNzUmF0ZSIsInRyZW5kIiwiZmFpbHVyZVJlYXNvbkdyb3VwcyIsImVycm9yTWVzc2FnZSIsInByb3ZpZGVyIiwicHJvdmlkZXJNaXgiLCJmYWlsZWRDb3VudCIsInN1Y2NlZWRlZENvdW50IiwibGF0ZXN0QXNzZXRzIiwic3RhcnRlZEF0TGFiZWwiLCJ0aW1lbGluZSIsInN1Y2Nlc3NMYXN0MjRoIiwiZmFpbGVkTGFzdDI0aCIsImNhbmNlbGVkTGFzdDI0aCIsIlJldmVudWVPcHNQYWdlIiwiYWN0aXZlU3Vic2NyaXB0aW9ucyIsInBlbmRpbmdPcmRlcnMiLCJ0b3RhbFBhaWRDZW50cyIsInJldmVudWVUcmVuZCIsInJlbmV3YWxSZW1pbmRlcnMiLCJwbGFuTWl4IiwicGxhbiIsIm5hbWUiLCJwYWlkQ2VudHMiLCJjaGFubmVsTWl4IiwiY2hhbm5lbCIsImZvbGxvd1VwcyIsIm1ldGEiLCJwYWlkT3JkZXJzIiwib3JkZXIiLCJwYWlkQXRMYWJlbCIsImFtb3VudENlbnRzIiwib3JkZXJObyIsInN1YnNjcmlwdGlvbnMiLCJCcmFuZExpbmsiLCJzdHlsZWQiLCJMaW5rIiwiU2lkZWJhckJyYW5kaW5nIiwidG8iLCJmb250U2l6ZSIsIlNpZGViYXJGb290ZXIiLCJwYWdlTGFiZWxzIiwiY29udGVudFN0dWRpbyIsImpvYkNvbW1hbmQiLCJyZXZlbnVlT3BzIiwiU2lkZUxpbmsiLCJhY3RpdmUiLCJTaWRlYmFyUGFnZXMiLCJwYWdlcyIsImxvY2F0aW9uIiwidXNlTG9jYXRpb24iLCJMYWJlbCIsInBsIiwidXBwZXJjYXNlIiwicGFnZSIsInBhdGhuYW1lIiwicmVzb3VyY2VMYWJlbHMiLCJVc2VyIiwiQWRtaW5Vc2VyIiwiVGVtcGxhdGVDYXRlZ29yeSIsIlRlbXBsYXRlIiwiQ29udGVudFJldmlldyIsIkFzc2V0IiwiQ29tbXVuaXR5UG9zdCIsIkdlbmVyYXRpb25Kb2IiLCJTdWJzY3JpcHRpb25QbGFuIiwiU3Vic2NyaXB0aW9uIiwiUGF5bWVudE9yZGVyIiwiU3lzdGVtU2V0dGluZyIsIkF1ZGl0TG9nIiwiZ3JvdXBMYWJlbHMiLCLnlKjmiLfkuI7kvJrlkZgiLCLns7vnu5/kuI7mnYPpmZAiLCLlhoXlrrnov5DokKUiLCLnlJ/kuqfov5DokKUiLCLllYbkuJrljJYiLCJSZXNvdXJjZUxpbmsiLCJTaWRlYmFyUmVzb3VyY2VTZWN0aW9uIiwicmVzb3VyY2VzIiwidmlzaWJsZVJlc291cmNlcyIsInJlc291cmNlIiwibmF2aWdhdGlvbiIsInNob3ciLCJncm91cGVkIiwicmVkdWNlIiwibWVtbyIsImdyb3VwTmFtZSIsInB1c2giLCJPYmplY3QiLCJlbnRyaWVzIiwiZ3JvdXAiLCJzdGFydHNXaXRoIiwicHJpbWFyeU5hdkl0ZW1zIiwic2lkZWJhclNlY3Rpb25zIiwiZGFzaGJvYXJkIiwiY29udGVudCIsImpvYnMiLCJyZXZlbnVlIiwic3lzdGVtIiwiZ2V0QWN0aXZlUHJpbWFyeUlkIiwiU3R5bGVkU2lkZWJhciIsInRoZW1lIiwic2l6ZXMiLCJzaWRlYmFyV2lkdGgiLCJib3JkZXJzIiwiZGVmYXVsdCIsImNvbG9ycyIsInNpZGViYXIiLCJkZWZhdWx0UHJvcHMiLCJTaWRlYmFyIiwiaXNWaXNpYmxlIiwiYWN0aXZlUHJpbWFyeUlkIiwic2VjdGlvbnMiLCJjbGFzc05hbWUiLCJmbGV4R3JvdyIsInNlY3Rpb24iLCJTZWN0aW9uVGl0bGUiLCJTZWN0aW9uTGlzdCIsInB0IiwiUHJpbWFyeU5hdkxpbmsiLCJ3aGl0ZVNwYWNlIiwiVG9wQmFyIiwidG9nZ2xlU2lkZWJhciIsInNlc3Npb24iLCJ1c2VTZWxlY3RvciIsInN0YXRlIiwicGF0aHMiLCJvdmVyZmxvd1giLCJlbWFpbCIsImxvZ291dFBhdGgiLCJXcmFwcGVyIiwiUHJvbW9QYW5lbCIsIkxvZ2luQ2FyZCIsIlJhYmJpdE1hcmsiLCJGZWF0dXJlQ2hpcCIsInRleHQiLCJMb2dpbiIsIndpbmRvdyIsIl9fQVBQX1NUQVRFX18iLCJicmFuZGluZyIsImNvbXBhbnlOYW1lIiwiRm9ybUdyb3VwIiwicmVxdWlyZWQiLCJJbnB1dCIsInBsYWNlaG9sZGVyIiwiYXV0b0NvbXBsZXRlIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztFQWlCQSxNQUFNQSxHQUFHLEdBQUcsSUFBSUMsaUJBQVMsRUFBRTtFQUUzQixNQUFNQyxPQUFPLEdBQUc7RUFDZEMsRUFBQUEsT0FBTyxFQUFFLFNBQVM7RUFDbEJDLEVBQUFBLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLEVBQUFBLEtBQUssRUFBRSxRQUFRO0VBQ2ZDLEVBQUFBLElBQUksRUFBRSxTQUFTO0VBQ2ZDLEVBQUFBLE9BQU8sRUFBRTtFQUNYLENBQUM7RUFFRCxNQUFN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
