
import {
  Spin,
  Form,
  Input,
  Tooltip,
  Button
} from 'antd'
import {
  QuestionCircleFilled
} from '@ant-design/icons'

const { Item } = Form

export default function FormVote (props) {
  const [form] = Form.useForm()
  function renderKeywordsHelp () {
    const tip = (
      <div>
        Multi keywords by comma, eg: `name,your name`, by default it is wild card match, means if message has keyword in it would trigger reply, use double quote keyword would require full match to trigger reply, eg: `"name", your name`
      </div>
    )
    return (
      <div>
        <span className='mg1r'>Keywords</span>
        <Tooltip title={tip}>
          <QuestionCircleFilled />
        </Tooltip>
      </div>
    )
  }
  function renderReplyHelp () {
    const tip = (
      <div>
        Reply content when keywords triggered.
      </div>
    )
    return (
      <div>
        <span className='mg1r'>Reply</span>
        <Tooltip title={tip}>
          <QuestionCircleFilled />
        </Tooltip>
      </div>
    )
  }
  async function submit (res) {
    const r = await props.handleSubmit(res)
    if (r) {
      form.resetFields()
    }
  }
  return (
    <Spin spinning={props.loading}>
      <Form
        form={form}
        layout='vertical'
        onFinish={submit}
        initialValues={props.formData}
      >
        <Item
          name='keywords'
          label={renderKeywordsHelp()}
          rules={[
            {
              required: true,
              message: 'Required'
            },
            {
              max: 500
            }
          ]}
        >
          <Input />
        </Item>
        <Item
          name='reply'
          label={renderReplyHelp()}
          rules={[
            {
              max: 1500
            }
          ]}
        >
          <Input.TextArea rows={2} />
        </Item>
        <Item
          noStyle
        >
          <Button
            htmlType='submit'
            type='primary'
          >
            Submit
          </Button>
        </Item>
      </Form>
    </Spin>
  )
}
