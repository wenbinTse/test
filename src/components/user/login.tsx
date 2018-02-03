import * as React from 'react';
import { Form, Icon, Input, Button } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import * as Styles from './user.css';
import UserService from "./user-service";

interface Props {
  form: any;
}

interface State {
  loading: boolean;
}

class LoginForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  public render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className={Styles.form}>
        <span>登录</span>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入邮箱地址' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
          )}
        </FormItem>
        <Button type="primary" htmlType="submit" style={{width: '100%'}}>
          登录
        </Button>
        <div>
          <a href="">register now!</a>
        </div>
      </Form>
    );
  }
  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        UserService.login(
          values,
          () => {
            if ((/\/login$/i).test(window.location.pathname)) {
              window.location.href = '/';
            } else if (window.location.hash === '#login') {
              window.location.href = window.location.pathname;
            } else {
              window.location.reload();
            }
          });
      }
    });
  }
}

const Login = Form.create()(LoginForm);

export = Login;
