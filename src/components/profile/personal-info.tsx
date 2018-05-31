import * as React from 'react';
import { AutoComplete, Form, Spin, Input, Radio, Select, Button, Cascader, Row, Col, message } from 'antd';
import { Gender, ResponseCode, User } from '../../interface';
import { FormComponentProps } from 'antd/lib/form';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import ProfileImage from './profile-image';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

interface OptionObject {
  label: string;
  value: string;
  children?: OptionObject[];
}

interface State {
  loading: boolean;
  changing: boolean;
  changed: boolean;
  corporations: string[];
  titles: string[];
  allCorporations: string[];
  user?: User;
  cities: OptionObject[];
}

class PersonalInfoForm extends React.Component<FormComponentProps, State> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      loading: true,
      changing: false,
      changed: false,
      corporations: [],
      titles: [],
      allCorporations: [],
      cities: []
    };
  }

  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.dataForProfile,
      true,
      (data) => {
        if (data.code === ResponseCode.SUCCESS) {
          this.setState({
            loading: false,
            corporations: data.corporations,
            allCorporations: data.corporations,
            titles: data.titles,
            user: data.item,
            cities: data.cities
          });
        } else if (data.code === ResponseCode.UNLOGIN) {
          UserService.requireLogin();
        }
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
          <Spin size="large"/>
        </div>
      );
    }

    const user = this.state.user as User;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
        md: { span: 2}
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
        md: { span: 22 }
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

    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{padding: '8px', background: 'white'}}>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <ProfileImage name={user.name} profileImageSrc={user.profileImageSrc}/>
          <Form>
            <FormItem
              {...formItemLayout}
              label="邮箱"
            >
              <Input value={user.email} disabled={true}/>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="姓名"
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入您的姓名',
                }],
                initialValue: user.name
              })(
                <Input type="text" placeholder="您的姓名" onChange={() => this.setState({changed: true})}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="性别">
              {getFieldDecorator('gender', {
                rules: [{required: true}],
                initialValue: user.gender
              })(
                <RadioGroup onChange={() => this.setState({changed: true})}>
                  <Radio value={Gender.MALE}>男</Radio>
                  <Radio value={Gender.FEMALE}>女</Radio>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="单位">
              {getFieldDecorator('corporation', {
                rules: [{required: true, message: '请输入您的工作/学习单位'}],
                initialValue: user.corporation
              })(
                <AutoComplete
                  dataSource={this.state.corporations}
                  onSearch={this.handleCorporationChange}
                  placeholder="您所在的单位"
                  onChange={() => this.setState({changed: true})}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="职称">
              {getFieldDecorator('title', {
                rules: [{required: true, message: '请输入您的职称'}],
                initialValue: user.title
              })(
                <Select onChange={() => this.setState({changed: true})}>
                  {this.state.titles.map((title) =>
                    <Option key={title} value={title}>
                      {title}
                    </Option>
                  )}
                </Select>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="职务" colon={false}>
              {getFieldDecorator('job', {
                initialValue: user.job
              })(
                <Input type="text" placeholder="您的职务(可选)" onChange={() => this.setState({changed: true})}/>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="地点">
              <Row gutter={16}>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('city', {
                      initialValue: !!user.location.province ? [user.location.province, user.location.city] : []
                    })(
                      <Cascader options={this.state.cities} placeholder="省/市" onChange={() => this.setState({changed: true})}/>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('address', {
                      initialValue: user.location.address
                    })(
                      <Input placeholder="详细地址" onChange={() => this.setState({changed: true})}/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button
                type="primary"
                htmlType="submit"
                style={{width: '100%'}}
                loading={this.state.changing}
                disabled={!this.state.changed}
                onClick={this.submitHandler}
              >保存
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
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

  private submitHandler = (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(undefined, {}, (errors, values) => {
      if (!errors) {
        this.setState({
          changing: true
        });
        HttpRequestDelegate.postJson(
          Urls.editProfile,
          {
            ...values,
            location: {
              province: values.city[0],
              city: values.city[1],
              address: values.address
            }
          },
          true,
          (data) => {
            this.setState({
              changing: false
            });
            if (data.code === ResponseCode.SUCCESS) {
              message.success('保存成功');
              this.setState({changed: false});
            } else if (data.code === ResponseCode.UNLOGIN) {
              UserService.requireLogin();
            }
          }
        );
      }
    });
  }
}

const PersonalInfo = Form.create()(PersonalInfoForm);

export default PersonalInfo;
