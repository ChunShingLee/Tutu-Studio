import React from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  Box,
  Button,
  FormGroup,
  H2,
  H5,
  Input,
  Label,
  MessageBox,
  Text
} from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';

const Wrapper = styled(Box)`
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(108, 92, 231, 0.16), transparent 30%),
    radial-gradient(circle at top left, rgba(255, 107, 53, 0.18), transparent 24%),
    #f8f9fa;
`;

const PromoPanel = styled(Box)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #ff6b35 0%, #ff9156 48%, #6c5ce7 100%);
`;

const LoginCard = styled(Box)`
  overflow: hidden;
  border-radius: 28px;
`;

const RabbitMark = styled(Box)`
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

const FeatureChip = ({ icon, text }) => (
  <Box
    alignItems="center"
    bg="rgba(255,255,255,0.16)"
    borderRadius="pill"
    color="white"
    display="inline-flex"
    gap="sm"
    px="lg"
    py="sm"
  >
    <Text>{icon}</Text>
    <Text>{text}</Text>
  </Box>
);

export const Login = () => {
  const { action, errorMessage } = window.__APP_STATE__;
  const branding = useSelector((state) => state.branding);

  return (
    <Wrapper display="flex" flexDirection="column" p={['lg', 'xxl']}>
      <LoginCard
        bg="white"
        boxShadow="login"
        display="flex"
        flexDirection={['column', 'column', 'row']}
        maxWidth="1120px"
        width="100%"
      >
        <PromoPanel color="white" display={['block']} p="xxl" width={['100%', '100%', '46%']}>
          <Box display="flex" flexDirection="column" gap="xl" height="100%" justifyContent="space-between">
            <Box display="flex" flexDirection="column" gap="xl">
              <RabbitMark>🐰</RabbitMark>
              <Box>
                <Text fontWeight="700" letterSpacing="0.08em" mb="lg" textTransform="uppercase">兔兔视觉运营后台 v2</Text>
                <H2 color="white" marginBottom="xl">让模板运营、任务调度、商业化管理真正像一款产品，而不是一张数据表。</H2>
                <Text color="rgba(255,255,255,0.86)" lineHeight="xl">
                  这套后台围绕 Prisma 与 PostgreSQL 实时数据构建，重点服务模板审核、用户配额、生成异常、订单跟进和系统配置等高频运营场景。
                </Text>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap="lg">
              <Box display="flex" flexWrap="wrap" gap="default">
                <FeatureChip icon="⚡" text="任务指挥台" />
                <FeatureChip icon="🧾" text="商业化工作台" />
                <FeatureChip icon="🛡️" text="内容审核流" />
              </Box>
              <Box
                bg="rgba(255,255,255,0.16)"
                borderRadius="xl"
                p="xl"
              >
                <Badge bg="white" color="primary100" mb="lg">开发环境默认账号</Badge>
                <Text color="white" mb="sm">管理员：admin@tutu.local / TutuAdmin123!</Text>
                <Text color="rgba(255,255,255,0.9)">运营：operator@tutu.local / TutuOperator123!</Text>
              </Box>
            </Box>
          </Box>
        </PromoPanel>

        <Box
          as="form"
          action={action}
          display="flex"
          flexDirection="column"
          gap="xl"
          justifyContent="center"
          method="POST"
          p="xxl"
          width={['100%', '100%', '54%']}
        >
          <Box>
            <Text color="primary100" fontWeight="700" mb="lg" textTransform="uppercase">Welcome Back</Text>
            <H5 marginBottom="default">{branding.companyName || '兔兔视觉后台管理'}</H5>
            <Text color="grey60">使用管理员或运营账号登录，进入专用工作台。</Text>
          </Box>

          {errorMessage ? (
            <MessageBox
              message={errorMessage}
              variant="danger"
            />
          ) : null}

          <FormGroup>
            <Label required>管理员邮箱</Label>
            <Input name="email" placeholder="admin@tutu.local" />
          </FormGroup>

          <FormGroup>
            <Label required>密码</Label>
            <Input autoComplete="new-password" name="password" placeholder="输入后台密码" type="password" />
          </FormGroup>

          <Box display="flex" flexDirection="column" gap="lg">
            <Button size="lg" variant="contained">进入运营后台</Button>
            <Box
              bg="filterBg"
              border="1px solid"
              borderColor="grey20"
              borderRadius="xl"
              p="lg"
            >
              <Text color="grey60">
                当前版本重点强化了品牌感、运营工作台和高频动作入口。底层数据仍然来自同一套 Fastify + Prisma 后端。
              </Text>
            </Box>
          </Box>
        </Box>
      </LoginCard>
    </Wrapper>
  );
};

export default Login;
