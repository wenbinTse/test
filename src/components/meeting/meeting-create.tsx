import * as React from 'react';
import { FormComponentProps } from 'antd/lib/form';
import { Form, Input, Button, Col, DatePicker, Cascader, Row, Icon, message, Checkbox } from 'antd';
import * as Styles from './meeting.css';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import { Guest, ResponseCode, stayTypeOptions } from '../../interface';
import FormItem from 'antd/lib/form/FormItem';
import UserService from '../user/user-service';

const CheckboxGroup = Checkbox.Group;

interface Option {
  label: string;
  value: string;
  children?: Option[];
}

interface State {
  cities: Option[];
  loading: boolean;
  guests: Guest[];
  detail: string;
  description: string;
  creating: boolean;
}

class MeetingCreateForm extends React.Component<FormComponentProps, State> {
  private guestNameFormItems: FormItem[];
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      cities: [],
      loading: true,
      guests: [],
      detail: '',
      description: '',
      creating: false
    };
  }
  
  public componentWillMount() {
    HttpRequestDelegate.get(
      Urls.getCities,
      true,
      (data) => {
        this.setState({
          cities: data.list,
          loading: false
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
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
    };

    const smallFormItemLayout = {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 21,
        offset: 3,
      }
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 21,
          offset: 3,
        },
      },
    };

    const editorProps = {
      controls: [
        'undo', 'redo', 'split', 'font-size', 'font-family', 'text-color',
        'bold', 'italic', 'underline', 'strike-through', 'superscript',
        'subscript', 'text-align', 'split', 'headings', 'list_ul', 'list_ol'
      ],
      height: 250,
      contentFormat: 'html'
    };

    this.guestNameFormItems = [];

    return (
      <Form className={Styles.createContainer}>
        <Col {...smallFormItemLayout}>
          <span className={Styles.title}>创建会议</span>
        </Col>
        <FormItem {...formItemLayout} label="会议名">
          {getFieldDecorator('name', {
            rules: [{
              required: true, message: '请输入会议名称',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="时间" required={true}>
          <Col span={11}>
            <FormItem>
              {getFieldDecorator('startDate', {
                rules: [{
                  required: true, message: '请选择会议开始日期',
                }],
              })(
                <DatePicker placeholder="开始日期" style={{width: '100%'}}/>
              )}
            </FormItem>
          </Col>
          <Col span={2}>
          <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
            -
          </span>
          </Col>
          <Col span={11}>
            <FormItem>
              {getFieldDecorator('endDate', {
                rules: [{
                  required: true, message: '请选择会议结束日期',
                }],
              })(
                <DatePicker placeholder="结束日期" style={{width: '100%'}}/>
              )}
            </FormItem>
          </Col>
        </FormItem>
        <FormItem {...formItemLayout} label="地点" required={true}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem style={{marginBottom: '0'}}>
                {getFieldDecorator('city', {
                  rules: [{required: true, message: '请选择省市'}]
                })(
                  <Cascader options={this.state.cities} placeholder="省/市"/>
                )}
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem>
                {getFieldDecorator('address', {
                  rules: [{required: true, message: '请输入详细地址'}]
                })(
                  <Input placeholder="详细地址"/>
                )}
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem {...formItemLayout} label="介绍">
          <div style={{border: '1px solid #dcdcdc'}}>
            <BraftEditor
              {...editorProps}
              placeholder="在此编辑会议介绍"
              onChange={this.handleDescriptionChange}
            />
          </div>
        </FormItem>
        <FormItem {...formItemLayout} label="嘉宾">
          <Button icon="plus" type="primary" onClick={() => this.addGuest()}>添加</Button>
          {this.state.guests.map((guest, index) =>
            <Row gutter={16} key={guest.randomId} style={{marginBottom: '24px'}}>
              <Col span={4}>
                <FormItem
                  ref={(e) => this.guestNameFormItems.push(e as FormItem)}
                  validateStatus={guest.valid ? 'success' : 'error'}
                  help={guest.valid ? '' : '请输入嘉宾名'}
                >
                  <Input placeholder="姓名" onChange={(e) => this.changeGuest(index, 'name', e.target.value)}/>
                </FormItem>
              </Col>
              <Col span={18}>
                <FormItem>
                  <Input placeholder="介绍" onChange={(e) => this.changeGuest(index, 'description', e.target.value)}/>
                </FormItem>
              </Col>
              <Col span={2}>
                <Icon type="minus-circle-o" className={Styles.icon} onClick={() => this.deleteGuest(index)}/>
              </Col>
            </Row>
          )}
        </FormItem>
        <FormItem label="注意事项" {...formItemLayout}>
          <div style={{border: '1px solid #dcdcdc'}}>
            <BraftEditor
              {...editorProps}
              placeholder="在此编辑注意事项，如会议详细时间、签到、费用等说明"
              onChange={this.handleDetailChange}
            />
          </div>
        </FormItem>
        <FormItem label="可选住宿类型" help="都不选则为不提供住宿" {...formItemLayout}>
          {getFieldDecorator('stayTypes')(
            <CheckboxGroup options={stayTypeOptions}/>
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button loading={this.state.creating} type="primary" htmlType="submit" style={{width: '100%'}} onClick={this.handleSubmit}>创建</Button>
        </FormItem>
      </Form>
    );
  }

  private handleDescriptionChange = (description: string) => {
    this.setState({description});
  }

  private handleDetailChange = (detail: string) => {
    this.setState({detail});
  }

  private addGuest = () => {
    const guests = this.state.guests;
    guests.push({name: '', description: '', randomId: Math.random(), valid: true});
    this.setState({guests});
  }

  private deleteGuest = (index: number) => {
    const guests = this.state.guests;
    guests.splice(index, 1);
    this.setState({guests});
  }

  private changeGuest = (index: number, field: string, value: string) => {
    const guests = this.state.guests;
    guests[index][field] = value;
    if (field === 'name') {
      guests[index].valid = !!value;
    }
    this.setState({guests});
  }

  private handleSubmit = (e: any) => {
    e.preventDefault();
    const guests = this.state.guests;
    let needUpdate: boolean = false;
    for (const guest of guests) {
      if (!guest.valid) {
        return;
      }
      if (!guest.name) {
        guest.valid = false;
        needUpdate = true;
      }
    }
    if (needUpdate) {
      this.setState({guests});
      return;
    }
    this.props.form.validateFieldsAndScroll(undefined, {}, (errors, values) => {
      if (!errors) {
        this.setState({creating: true});
        HttpRequestDelegate.postJson(
          Urls.createMeeting,
          {
            ...values,
            location: {
              province: values.city[0],
              city: values.city[1],
              address: values.address
            },
            guests: this.state.guests.map((guest) => {
              return {name: guest.name, description: guest.description};
            }),
            description: this.state.description,
            detail: this.state.detail
          },
          true,
          (data) => {
            this.setState({creating: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('会议创建成功,3s后跳转到管理页面已编辑更多信息');
            } else if (data.code === ResponseCode.UNLOGIN) {
              UserService.requireLogin(false);
            }
          }
        );
      }
    });
  }
}

const MeetingCreate = Form.create()(MeetingCreateForm);

export = MeetingCreate;
