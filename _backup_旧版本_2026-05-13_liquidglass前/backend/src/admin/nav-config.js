export const primaryNavItems = [
  {
    id: 'dashboard',
    label: '驾驶舱',
    icon: 'Home',
    href: '/admin'
  },
  {
    id: 'users',
    label: '用户',
    icon: 'Users',
    href: '/admin/resources/User'
  },
  {
    id: 'content',
    label: '内容',
    icon: 'Layout',
    href: '/admin/pages/contentStudio'
  },
  {
    id: 'jobs',
    label: '任务',
    icon: 'Activity',
    href: '/admin/pages/jobCommand'
  },
  {
    id: 'revenue',
    label: '商业化',
    icon: 'CreditCard',
    href: '/admin/pages/revenueOps'
  },
  {
    id: 'system',
    label: '系统',
    icon: 'Settings',
    href: '/admin/resources/SystemSetting'
  }
];

export const sidebarSections = {
  dashboard: [
    {
      label: '总览',
      items: [
        { label: '运营驾驶舱', href: '/admin', icon: 'Home' }
      ]
    }
  ],
  users: [
    {
      label: '用户与会员',
      items: [
        { label: '创作者用户', href: '/admin/resources/User', icon: 'Users' }
      ]
    }
  ],
  content: [
    {
      label: '工作台',
      items: [
        { label: '内容中台', href: '/admin/pages/contentStudio', icon: 'Layout' }
      ]
    },
    {
      label: '模板体系',
      items: [
        { label: '模板分类', href: '/admin/resources/TemplateCategory', icon: 'Folder' },
        { label: '模板库', href: '/admin/resources/Template', icon: 'FileText' }
      ]
    },
    {
      label: '审核与素材',
      items: [
        { label: '审核记录', href: '/admin/resources/ContentReview', icon: 'Shield' },
        { label: '素材资产', href: '/admin/resources/Asset', icon: 'Image' },
        { label: '社区内容', href: '/admin/resources/CommunityPost', icon: 'MessageSquare' }
      ]
    }
  ],
  jobs: [
    {
      label: '工作台',
      items: [
        { label: '任务指挥台', href: '/admin/pages/jobCommand', icon: 'Activity' }
      ]
    },
    {
      label: '任务中心',
      items: [
        { label: '生成任务', href: '/admin/resources/GenerationJob', icon: 'PlayCircle' }
      ]
    }
  ],
  revenue: [
    {
      label: '工作台',
      items: [
        { label: '商业化中台', href: '/admin/pages/revenueOps', icon: 'CreditCard' }
      ]
    },
    {
      label: '套餐与订单',
      items: [
        { label: '订阅套餐', href: '/admin/resources/SubscriptionPlan', icon: 'Layers' },
        { label: '订阅关系', href: '/admin/resources/Subscription', icon: 'Repeat' },
        { label: '支付订单', href: '/admin/resources/PaymentOrder', icon: 'ShoppingCart' }
      ]
    }
  ],
  system: [
    {
      label: '后台控制',
      items: [
        { label: '后台账号', href: '/admin/resources/AdminUser', icon: 'UserCheck' },
        { label: '系统配置', href: '/admin/resources/SystemSetting', icon: 'Settings' },
        { label: '审计日志', href: '/admin/resources/AuditLog', icon: 'FileText' }
      ]
    }
  ]
};

export function getActivePrimaryId(pathname) {
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
