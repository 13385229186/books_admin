import { Footer } from '@/components';
import { login, register } from '@/services/user/api';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
  SafetyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, message, Tabs, Form, Button, Input } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import { nanoid } from 'nanoid';
import { request } from '@umijs/max';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('login');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const intl = useIntl();
  const [form] = Form.useForm();
  const [captchaToken, setCaptchaToken] = useState<string>(nanoid(16));
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && value !== form.getFieldValue('password')) {
      return promise.reject('两次输入的密码不匹配!');
    }
    return promise.resolve();
  };

  const checkCaptcha = async (code: string) => {
    const isCaptchaValid = await request('/api/verify', {
      method: 'GET',
      params: { 
        token: captchaToken ,
        code
      },
    });
    //console.log(isCaptchaValid)
    return isCaptchaValid;
  }

  const handleSubmit = async (values: API.LoginParams) => {
    if(!values.captcha){
      message.error('请填写验证码！')
      return;
    }
    const isCaptchaValid = await checkCaptcha(values.captcha); // 等待异步结果
    if (!isCaptchaValid) {
      message.error('验证码错误！');
      return;
    }

    try {
      // 登录
      if(type === 'login'){
        const msg = await login({ ...values });
        if (msg.code === 200) {
          const defaultLoginSuccessMessage = intl.formatMessage({
            id: 'pages.login.success',
            defaultMessage: '登录成功！',
          });
          message.success(defaultLoginSuccessMessage);
          // 保存jwt
          localStorage.setItem('token', msg.data.token || '' );
          await fetchUserInfo();
          const urlParams = new URL(window.location.href).searchParams;
          window.location.href = urlParams.get('redirect') || '/';
          return;
        }
        //console.log(msg);
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
      } else if( type === 'register' ){
        if( values.password != values.passwordAgain ){
          message.error('两次密码输入不一致');
          return;
        }
        const msg = await register({ ...values });
        if (msg.code === 200) {
          message.success("注册成功！");
          setType("login");
        }
        setUserLoginState(msg);
      }
    } catch (error) {
      //console.log(error);
      message.error(type === 'register' ? '注册' : '登录' +'失败，请重试！');
    }

  };
  const { code, msg } = userLoginState;

  // 刷新验证码方法
  const refreshCaptcha = () => {
    setCaptchaToken(nanoid(16));
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.png" />}
          title="酌一本书"
          subTitle={"集管理与推荐于一体的图书馆"}
          initialValues={{
            autoLogin: true,
          }}
          // actions={[
          //   <FormattedMessage
          //     key="loginWith"
          //     id="pages.login.loginWith"
          //     defaultMessage="其他登录方式"
          //   />,
          //   <ActionIcons key="icons" />,
          // ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />

          {type === 'login' && code === 401 && (<LoginMessage
            content = {msg ?? '登录失败，请重试'}
          />)}

          {/* {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )} */}
          {type === 'login' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText
                name="captcha"
                fieldProps={{
                  size: 'large',
                  prefix: <SafetyOutlined />,
                  suffix: (
                    <img 
                      src={`/api/captcha?token=${captchaToken}`}
                      onClick={refreshCaptcha}
                      style={{ 
                        height: 32,
                        cursor: 'pointer',
                        marginLeft: 8
                      }}
                    />
                  ),
                }}
                placeholder="请输入验证码"
                rules={[{ required: true, message: '请输入验证码!' }]}
              />
            </>
          )}

          {type === 'register' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="请输入密码"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="passwordAgain"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="请确认密码"
                rules={[
                  {
                    required: true,
                    message: '请确认密码！',
                  },
                  {
                    validator: checkConfirm,
                  },
                ]}
              />
              <ProFormText
                name="captcha"
                fieldProps={{
                  size: 'large',
                  prefix: <SafetyOutlined />,
                  suffix: (
                    <img 
                      src={`/api/captcha?token=${captchaToken}`}
                      onClick={refreshCaptcha}
                      style={{ 
                        height: 32,
                        cursor: 'pointer',
                        marginLeft: 8
                      }}
                    />
                  ),
                }}
                placeholder="请输入验证码"
                rules={[{ required: true, message: '请输入验证码!' }]}
              />
            </>
          )}

          {/* {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />} */}
          {/* {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (!result) {
                    return;
                  }
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )} */}
          <div
            style={{
              marginBottom: 24
            }}
          >
            {/* <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox> */}
            {/* <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a> */}
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
