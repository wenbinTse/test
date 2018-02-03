import * as React from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { AutoComplete, Form, Input, Button, Select, Radio, message } from 'antd';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { Gender, ResponseCode } from '../../interface';
import * as Styles from './user.css';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

interface State {
  loading: boolean;
  registering: boolean;
  corporations: string[];
  allCorporations: string[];
  titles: string[];
}

class RegistrationForm extends React.Component<FormComponentProps, State> {
  constructor(prop: FormComponentProps) {
    super(prop);
    this.state = {
      allCorporations: [],
      corporations: [],
      loading: true,
      registering: false,
      titles: []
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.dateForRegister,
      true,
      (data) => {
        this.setState({
          corporations: data.corporations,
          allCorporations: data.corporations,
          loading: false,
          titles: data.titles
        });
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return null;
    }
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 22,
          offset: 2,
        },
      },
    };

    return (
      <Form onSubmit={this.handleSubmit} className={Styles.form}>
        <span>注册</span>
        <FormItem
          {...formItemLayout}
          label="邮箱"
        >
          {getFieldDecorator('email', {
            rules: [{
              type: 'email', message: '非法的邮箱地址',
            }, {
              required: true, message: '请输入邮箱地址',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '请输入密码',
            }, {
              min: 8, message: '密码最少8位'
            }],
          })(
            <Input type="password"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="姓名"
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true, message: '请输入您的姓名',
            }],
          })(
            <Input type="text" placeholder="您的姓名"/>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="性别">
          {getFieldDecorator('gender', {
            rules: [{required: true}],
            initialValue: Gender.FEMALE
          })(
            <RadioGroup>
              <Radio value={Gender.MALE}>男</Radio>
              <Radio value={Gender.FEMALE}>女</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="单位">
          {getFieldDecorator('corporation', {
            rules: [{required: true, message: '请输入您的工作/学习单位'}]
          })(
            <AutoComplete dataSource={this.state.corporations} onSearch={this.handleCorporationChange} placeholder="您所在的单位"/>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="职称">
          {getFieldDecorator('title', {
            rules: [{required: true, message: '请输入您的职称'}],
            initialValue: this.state.titles[0]
          })(
            <Select>
              {this.state.titles.map((title) =>
                <Option key={title} value={title}>
                  {title}
                </Option>
              )}
            </Select>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="职务" colon={false}>
          {getFieldDecorator('job')(
            <Input type="text" placeholder="您的职务(可选)"/>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" style={{width: '100%'}} loading={this.state.registering}>注册</Button>
        </FormItem>
      </Form>
    );
  }

  private handleCorporationChange = (value: string) => {
    const cors = [];
    for (const cor of this.state.allCorporations) {
      if (cor.indexOf(value) >= 0) {
        cors.push(cor);
      }
    }
    this.setState({corporations: cors});
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        this.setState({registering: true});
        HttpRequestDelegate.postJson(
          Urls.register,
          values,
          true,
          (data) => {
            this.setState({registering: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('您已成功注册')
            } else if (data.code === ResponseCode.DUPLICATE_KEY) {
              message.warning('此邮箱已注册');
            }
          }
        );
      }
    });
  }
}

const Register = Form.create()(RegistrationForm);

export = Register;
